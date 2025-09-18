import Redis from 'ioredis';
import { log } from './vite';

class RedisCacheService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    // Redis connection configuration for Replit environment
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 1, // Reduced retries
      lazyConnect: true,
      connectTimeout: 5000,
      onClusterError: (err) => console.log('Redis cluster issue - running without cache'),
      onFailover: () => log('Redis failover - continuing without cache'),
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      log('✅ Redis connected - caching enabled');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      if (!err.message.includes('ECONNREFUSED')) {
        console.log('Redis issue - running without cache');
      }
    });

    this.client.on('ready', () => {
      log('✅ Redis ready - performance caching active');
    });

    // Initialize connection with timeout
    this.connectWithTimeout();
  }

  private async connectWithTimeout() {
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000));
      const connect = this.client.connect();
      
      await Promise.race([connect, timeout]);
    } catch (error) {
      this.isConnected = false;
      log('Running without Redis cache - performance may be reduced');
    }
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  // Crypto data caching with TTL (Time To Live)
  async cacheCryptoAssets(key: string, data: any[], ttlSeconds: number = 120): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(data));
      log(`Cached crypto data: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async getCachedCryptoAssets(key: string): Promise<any[] | null> {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(key);
      if (cached) {
        log(`Cache HIT for: ${key}`);
        return JSON.parse(cached);
      }
      log(`Cache MISS for: ${key}`);
      return null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  // ML predictions caching with longer TTL
  async cacheMLPrediction(symbol: string, prediction: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const key = `ml:prediction:${symbol}`;
      await this.client.setex(key, ttlSeconds, JSON.stringify(prediction));
      log(`Cached ML prediction: ${symbol} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error('Redis ML cache error:', error);
    }
  }

  async getCachedMLPrediction(symbol: string): Promise<any | null> {
    if (!this.isConnected) return null;
    
    try {
      const key = `ml:prediction:${symbol}`;
      const cached = await this.client.get(key);
      if (cached) {
        log(`ML Cache HIT for: ${symbol}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Redis ML cache get error:', error);
      return null;
    }
  }

  // User session caching
  async cacheUserData(userId: string, userData: any, ttlSeconds: number = 600): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const key = `user:${userId}`;
      await this.client.setex(key, ttlSeconds, JSON.stringify(userData));
    } catch (error) {
      console.error('Redis user cache error:', error);
    }
  }

  async getCachedUserData(userId: string): Promise<any | null> {
    if (!this.isConnected) return null;
    
    try {
      const key = `user:${userId}`;
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis user cache get error:', error);
      return null;
    }
  }

  // Cache invalidation utilities
  async invalidateCache(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        log(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
      }
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  // Cleanup on shutdown
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      log('Redis disconnected');
    }
  }
}

// Export singleton instance
export const redisCacheService = new RedisCacheService();