import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import next from 'next';
import { createServer } from 'http';
import { parse } from 'url';
import { registerRoutes } from "./routes";
import { log } from "./vite";

const app = express();

// Performance: Enable gzip/deflate compression for all responses
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Balanced compression level (1-9, 6 is default)
  filter: (req, res) => {
    // Don't compress images or already compressed content
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Security: Set security headers + performance headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Next.js compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Security: Limit request size to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Security: Set trust proxy for accurate IP addresses
app.set('trust proxy', 1);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Next.js
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();
  
  await nextApp.prepare();
  
  // Create HTTP server
  const httpServer = createServer();
  
  // Register existing API routes and WebSocket
  await registerRoutes(app, httpServer);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Handle all other routes with Next.js
  app.all('*', (req, res) => {
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });
  
  // Mount Express app on HTTP server
  httpServer.on('request', app);

  const port = parseInt(process.env.PORT || '5000', 10);
  
  console.log(`Environment PORT: ${process.env.PORT}`);
  console.log(`Attempting to listen on port: ${port}`);
  console.log(`Host: 0.0.0.0`);
  
  httpServer.listen(port, "0.0.0.0", () => {
    log(`Next.js + Express server running on port ${port}`);
    console.log(`Server successfully started on http://0.0.0.0:${port}`);
  });
})();
