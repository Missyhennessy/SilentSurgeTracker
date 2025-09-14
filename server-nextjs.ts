import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { parse } from 'url';
import { registerRoutes } from './server/routes';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  const server = express();
  const httpServer = createServer(server);

  // Security: Limit request size to prevent DoS attacks
  server.use(express.json({ limit: '10mb' }));
  server.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Security: Set trust proxy for accurate IP addresses
  server.set('trust proxy', 1);

  // Initialize existing backend routes and services
  await registerRoutes(server, httpServer);

  // Setup WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Handle Next.js routes
  server.all('*', (req, res) => {
    // Skip API routes - they're handled by the existing backend
    if (req.url?.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Next.js + Express server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});