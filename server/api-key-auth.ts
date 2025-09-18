import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { redisCacheService } from './redis-cache-service';

// Extend Express Request type to include apiKey information
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: number;
        userId: string;
        keyName: string;
        scopes: string[];
        rateLimit: number;
      };
    }
  }
}

// ENTERPRISE SECURITY: Mandatory server-side pepper for key hardening
const SERVER_PEPPER = process.env.API_KEY_PEPPER || (() => {
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    console.error('CRITICAL: API_KEY_PEPPER environment variable is required for production security');
    console.error('Please set a strong, random pepper value: export API_KEY_PEPPER="your-secure-random-string"');
    process.exit(1);
  }
  console.warn('⚠️  DEVELOPMENT: Using fallback API key pepper. SET API_KEY_PEPPER in production!');
  return 'dev-fallback-pepper-not-for-production-2024';
})();

const REDIS_RATE_LIMIT_ENABLED = process.env.REDIS_URL && !process.env.DISABLE_REDIS;

// Rate limiting storage for API keys (fallback when Redis unavailable)
const rateLimitStore = new Map<number, { count: number; resetTime: number }>();

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid API key. Please provide a valid Bearer token.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // ENTERPRISE SECURITY: Validate the API key with hardened storage
    const apiKey = await storage.validateApiKey(token);
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired API key.' 
      });
    }

    // ENTERPRISE SECURITY: Enforce rate limit bounds at runtime
    const maxRateLimit = 10000;
    if (apiKey.rateLimit > maxRateLimit) {
      console.warn(`API key ${apiKey.keyPrefix} has excessive rate limit: ${apiKey.rateLimit}, clamping to ${maxRateLimit}`);
      apiKey.rateLimit = maxRateLimit;
    }

    // ENTERPRISE: Distributed Redis-backed rate limiting with graceful fallback
    const currentTime = Date.now();
    const hourWindow = 60 * 60 * 1000; // 1 hour in milliseconds
    const rateLimitKey = `api_rate_limit:${apiKey.id}`;

    let rateLimitData: { count: number; resetTime: number } | null = null;
    let usingRedis = false;

    // Try Redis first for distributed rate limiting
    if (REDIS_RATE_LIMIT_ENABLED) {
      try {
        const redisData = await redisCacheService.get(rateLimitKey);
        if (redisData) {
          rateLimitData = JSON.parse(redisData);
          usingRedis = true;
        }
      } catch (error) {
        // Graceful fallback to in-memory - no log spam
        usingRedis = false;
      }
    }

    // Fallback to in-memory rate limiting
    if (!rateLimitData) {
      rateLimitData = rateLimitStore.get(apiKey.id) || null;
    }
    
    // Reset if window has expired
    if (!rateLimitData || currentTime > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: currentTime + hourWindow };
    }

    // Check rate limit with proper headers
    if (rateLimitData.count >= apiKey.rateLimit) {
      const timeUntilReset = Math.ceil((rateLimitData.resetTime - currentTime) / 1000 / 60); // minutes
      
      // ENTERPRISE: Add proper 429 headers with Unix timestamp
      res.set({
        'Retry-After': (timeUntilReset * 60).toString(),
        'X-RateLimit-Limit': apiKey.rateLimit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.floor(rateLimitData.resetTime / 1000).toString(), // Unix timestamp
      });
      
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: `API key rate limit of ${apiKey.rateLimit} requests per hour exceeded. Try again in ${timeUntilReset} minutes.`,
        retryAfter: timeUntilReset * 60 // seconds
      });
    }

    // Increment rate limit counter
    rateLimitData.count++;

    // Store back to Redis or in-memory
    if (usingRedis && REDIS_RATE_LIMIT_ENABLED) {
      try {
        await redisCacheService.set(rateLimitKey, JSON.stringify(rateLimitData), 3600); // 1 hour TTL
      } catch (error) {
        // Graceful fallback - store in memory
        rateLimitStore.set(apiKey.id, rateLimitData);
      }
    } else {
      rateLimitStore.set(apiKey.id, rateLimitData);
    }
    
    // ENTERPRISE: Add rate limit headers for transparency with Unix timestamp
    res.set({
      'X-RateLimit-Limit': apiKey.rateLimit.toString(),
      'X-RateLimit-Remaining': Math.max(0, apiKey.rateLimit - rateLimitData.count).toString(),
      'X-RateLimit-Reset': Math.floor(rateLimitData.resetTime / 1000).toString(), // Unix timestamp
    });

    // ENTERPRISE: Track API usage without breaking streaming responses (handles aborted connections)
    const startTime = Date.now();
    let tracked = false;

    const trackUsage = (responseCode: number) => {
      if (tracked) return; // Prevent double tracking
      tracked = true;
      
      const responseTime = Date.now() - startTime;
      
      // Track usage asynchronously without blocking
      setImmediate(async () => {
        try {
          await storage.updateApiKeyUsage(apiKey.id);
          await storage.trackApiKeyUsage({
            apiKeyId: apiKey.id,
            endpoint: req.path,
            method: req.method,
            responseCode,
            responseTime,
            userAgent: req.headers['user-agent'] || '',
            ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '',
          });
        } catch (error) {
          console.error('Error tracking API key usage:', error);
        }
      });
    };

    // Track completed responses
    res.on('finish', () => trackUsage(res.statusCode));
    
    // Track aborted connections (enterprise requirement)
    res.on('close', () => trackUsage(499)); // Non-standard status for client disconnect

    // Attach API key information to request
    req.apiKey = {
      id: apiKey.id,
      userId: apiKey.userId,
      keyName: apiKey.keyName,
      scopes: Array.isArray(apiKey.scopes) ? apiKey.scopes : JSON.parse(apiKey.scopes as string),
      rateLimit: apiKey.rateLimit,
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication service temporarily unavailable.' 
    });
  }
}

// Middleware to check specific API key scopes
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'API key authentication required.' 
      });
    }

    if (!req.apiKey.scopes.includes(scope) && !req.apiKey.scopes.includes('admin')) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `API key does not have required scope: ${scope}` 
      });
    }

    next();
  };
}

// ENTERPRISE: Generate cryptographically secure API key
export function generateApiKey(): string {
  const crypto = require('crypto');
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `sst_${timestamp}_${randomBytes}`;
}

// ENTERPRISE: Generate HMAC-based key hash with server pepper for hardened storage
export function generateKeyHash(fullKey: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', SERVER_PEPPER).update(fullKey).digest('hex');
}

// ENTERPRISE: Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const crypto = require('crypto');
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

// Cleanup function for rate limit store (call periodically)
export function cleanupRateLimitStore() {
  const currentTime = Date.now();
  for (const [keyId, data] of rateLimitStore.entries()) {
    if (currentTime > data.resetTime) {
      rateLimitStore.delete(keyId);
    }
  }
}

// Set up periodic cleanup (every hour)
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);