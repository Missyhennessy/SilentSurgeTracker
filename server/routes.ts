import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { cryptoDataService } from "./crypto-data-service";
import { insertCryptoAssetSchema, insertAlertSchema, insertVelocityDataSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { registerAuthRoutes } from "./auth-routes";
import { registerSecurityRoutes } from "./security-integrations";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Re-enable authentication
  await setupAuth(app);

  // Register additional auth and security routes
  registerAuthRoutes(app);
  registerSecurityRoutes(app);

  // WebSocket server for real-time updates with security improvements
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectionCount = new Map<string, number>();
  const MAX_CONNECTIONS_PER_IP = 5;
  
  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress || 'unknown';
    const currentConnections = connectionCount.get(clientIP) || 0;
    
    // Limit connections per IP
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
      ws.close(1008, 'Too many connections from this IP');
      return;
    }
    
    connectionCount.set(clientIP, currentConnections + 1);
    console.log('Client connected to WebSocket');
    
    // Set up heartbeat to detect dead connections
    let isAlive = true;
    ws.on('pong', () => { isAlive = true; });
    
    const heartbeat = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 30000);
    
    ws.on('message', (message) => {
      try {
        const messageString = message.toString();
        
        // Limit message size
        if (messageString.length > 1024) {
          ws.close(1009, 'Message too large');
          return;
        }
        
        const data = JSON.parse(messageString);
        if (data.type === 'subscribe') {
          // Handle subscription to specific assets or alerts
          console.log('Client subscribed to:', data.topic);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.close(1003, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(heartbeat);
      const connections = connectionCount.get(clientIP) || 1;
      connectionCount.set(clientIP, Math.max(0, connections - 1));
    });
  });

  // Broadcast updates to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Start real-time crypto data updates
  cryptoDataService.startRealTimeUpdates(2); // Update every 2 minutes
  
  // Set up periodic broadcasting of updated data
  setInterval(async () => {
    try {
      const assets = await storage.getCryptoAssets();
      broadcast({
        type: 'crypto_update',
        data: assets,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error broadcasting crypto updates:', error);
    }
  }, 30000); // Broadcast every 30 seconds

  // Authentication API endpoints
  registerAuthRoutes(app);
  
  // External Security API endpoints
  registerSecurityRoutes(app);

  // Phase 1 Advanced Features API endpoints
  const sentimentService = await import('./sentiment-analysis-service');
  const alertsService = await import('./advanced-alerts-service');
  const exchangeService = await import('./cross-exchange-service');
  const macroService = await import('./macro-economic-service');
  
  // Register Phase 1 service routes
  if (sentimentService.registerSentimentRoutes) {
    sentimentService.registerSentimentRoutes(app);
  }
  if (alertsService.registerAdvancedAlertsRoutes) {
    alertsService.registerAdvancedAlertsRoutes(app);
  }
  if (exchangeService.registerCrossExchangeRoutes) {
    exchangeService.registerCrossExchangeRoutes(app);
  }
  if (macroService.registerMacroEconomicRoutes) {
    macroService.registerMacroEconomicRoutes(app);
  }

  // Phase 2 Advanced Features API endpoints
  const whaleService = await import('./whale-tracking-service');
  const lstmService = await import('./lstm-prediction-service');
  const defiService = await import('./defi-integration-service');
  
  // Register Phase 2 service routes
  if (whaleService.registerWhaleTrackingRoutes) {
    whaleService.registerWhaleTrackingRoutes(app);
  }
  if (lstmService.registerLSTMRoutes) {
    lstmService.registerLSTMRoutes(app);
  }
  if (defiService.registerDeFiRoutes) {
    defiService.registerDeFiRoutes(app);
  }

  // Phase 3 Advanced Features API endpoints
  const { blockchainForensicsService } = await import('./blockchain-forensics-service');
  const { regulatoryComplianceService } = await import('./regulatory-compliance-service');
  const { institutionalAPIService } = await import('./institutional-api-service');
  
  // Blockchain Forensics API endpoints
  app.get("/api/forensics/trace/:hash", async (req, res) => {
    try {
      const hash = req.params.hash;
      
      // Validate transaction hash format (64 character hex string)
      if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
        return res.status(400).json({ error: "Invalid transaction hash format" });
      }
      
      const trace = blockchainForensicsService.generateTransactionTrace(hash);
      res.json(trace);
    } catch (error) {
      res.status(500).json({ error: "Failed to trace transaction" });
    }
  });

  app.get("/api/forensics/address/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const risk = blockchainForensicsService.generateAddressRisk(address);
      res.json(risk);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze address" });
    }
  });

  app.get("/api/forensics/address/:address/traces", async (req, res) => {
    try {
      const address = req.params.address;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const traces = blockchainForensicsService.getTransactionTraces(address, limit);
      res.json(traces);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transaction traces" });
    }
  });

  app.get("/api/forensics/cluster/:address", async (req, res) => {
    try {
      const address = req.params.address;
      
      // Validate blockchain address format (basic validation)
      if (!/^[a-zA-Z0-9]{26,62}$/.test(address)) {
        return res.status(400).json({ error: "Invalid blockchain address format" });
      }
      
      const cluster = blockchainForensicsService.getAddressCluster(address);
      res.json(cluster);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze address cluster" });
    }
  });

  app.post("/api/forensics/sanction-check", async (req, res) => {
    try {
      const { addresses } = req.body;
      
      if (!Array.isArray(addresses)) {
        return res.status(400).json({ error: "Addresses must be an array" });
      }
      
      if (addresses.length === 0 || addresses.length > 500) {
        return res.status(400).json({ error: "Address array must contain 1-500 addresses" });
      }
      
      // Validate each address format
      for (const address of addresses) {
        if (typeof address !== 'string' || !/^[a-zA-Z0-9]{26,62}$/.test(address)) {
          return res.status(400).json({ error: `Invalid address format: ${address}` });
        }
      }
      
      const results = blockchainForensicsService.batchSanctionCheck(addresses);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform sanction checks" });
    }
  });

  // Regulatory Compliance API endpoints
  app.get("/api/compliance/rules", async (req, res) => {
    try {
      const rules = regulatoryComplianceService.generateComplianceRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance rules" });
    }
  });

  app.get("/api/compliance/alerts", async (req, res) => {
    try {
      const countParam = req.query.count as string;
      const count = countParam ? Math.max(1, Math.min(100, parseInt(countParam) || 20)) : 20;
      if (isNaN(count)) {
        return res.status(400).json({ error: "Invalid count parameter" });
      }
      const alerts = regulatoryComplianceService.generateComplianceAlerts(count);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance alerts" });
    }
  });

  app.get("/api/compliance/reports/:type/:jurisdiction", async (req, res) => {
    try {
      const { type, jurisdiction } = req.params;
      
      // Validate input parameters to prevent path traversal
      const allowedTypes = ['aml', 'kyc', 'sanctions', 'reporting'];
      const allowedJurisdictions = ['us', 'eu', 'uk', 'ca', 'au', 'jp'];
      
      if (!allowedTypes.includes(type.toLowerCase())) {
        return res.status(400).json({ error: "Invalid report type" });
      }
      
      if (!allowedJurisdictions.includes(jurisdiction.toLowerCase())) {
        return res.status(400).json({ error: "Invalid jurisdiction" });
      }
      
      const report = regulatoryComplianceService.generateRegulatoryReport(type, jurisdiction);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate regulatory report" });
    }
  });

  app.get("/api/compliance/jurisdictions", async (req, res) => {
    try {
      const requirements = regulatoryComplianceService.getJurisdictionRequirements();
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jurisdiction requirements" });
    }
  });

  app.post("/api/compliance/risk-assessment", async (req, res) => {
    try {
      const { amount, addresses, jurisdiction } = req.body;
      
      // Validate input parameters
      if (typeof amount !== 'number' || amount <= 0 || amount > 1000000000) {
        return res.status(400).json({ error: "Invalid transaction amount" });
      }
      
      if (!Array.isArray(addresses) || addresses.length === 0 || addresses.length > 100) {
        return res.status(400).json({ error: "Invalid addresses array (max 100 addresses)" });
      }
      
      if (typeof jurisdiction !== 'string' || jurisdiction.length > 10) {
        return res.status(400).json({ error: "Invalid jurisdiction" });
      }
      
      const assessment = regulatoryComplianceService.assessTransactionRisk(amount, addresses, jurisdiction);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to assess transaction risk" });
    }
  });

  // Institutional API endpoints
  app.get("/api/institutional/clients", async (req, res) => {
    try {
      const clients = institutionalAPIService.generateInstitutionalClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch institutional clients" });
    }
  });

  app.get("/api/institutional/metrics", async (req, res) => {
    try {
      const metrics = institutionalAPIService.generateAPIMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API metrics" });
    }
  });

  app.get("/api/institutional/indicators", async (req, res) => {
    try {
      const indicators = institutionalAPIService.generateCustomIndicators();
      res.json(indicators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom indicators" });
    }
  });

  app.get("/api/institutional/data-feeds", async (req, res) => {
    try {
      const feeds = institutionalAPIService.generateMarketDataFeeds();
      res.json(feeds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data feeds" });
    }
  });

  app.get("/api/institutional/risk-models", async (req, res) => {
    try {
      const models = institutionalAPIService.generateRiskModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk models" });
    }
  });

  app.get("/api/institutional/client/:id/usage", async (req, res) => {
    try {
      const clientId = req.params.id;
      
      // Validate client ID format (alphanumeric with hyphens only)
      if (!/^[a-zA-Z0-9-]+$/.test(clientId) || clientId.length > 50) {
        return res.status(400).json({ error: "Invalid client ID format" });
      }
      
      const usage = institutionalAPIService.getClientUsageAnalytics(clientId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client usage analytics" });
    }
  });

  app.get("/api/institutional/revenue", async (req, res) => {
    try {
      const revenue = institutionalAPIService.getRevenueAnalytics();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  // API Routes

  // Health check endpoint (no auth required)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock endpoints for crypto detail page data
  app.get('/api/assets/:symbol/price-history', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const timeframe = req.query.timeframe || '7d';
      
      // Generate mock price history data based on current price
      const asset = await storage.getAssetBySymbol(symbol);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const interval = timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // hours or days
      
      const priceHistory = Array.from({ length: points }, (_, i) => {
        const timestamp = new Date(Date.now() - (points - 1 - i) * interval).toISOString();
        const variance = (Math.random() - 0.5) * 0.1; // 10% variance
        const price = asset.price * (1 + variance);
        return {
          timestamp,
          price: Math.max(0, price),
          volume: Math.random() * 1000000,
          marketCap: price * 1000000,
        };
      });

      res.json(priceHistory);
    } catch (error) {
      console.error('Error fetching price history:', error);
      res.status(500).json({ message: 'Failed to fetch price history' });
    }
  });

  app.get('/api/assets/:symbol/details', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const asset = await storage.getAssetBySymbol(symbol);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      // Generate mock details
      const details = {
        description: `${asset.name} is a leading cryptocurrency that leverages blockchain technology to provide decentralized financial solutions. It aims to revolutionize the traditional financial system by offering faster, cheaper, and more transparent transactions.`,
        website: `https://${symbol.toLowerCase()}.org`,
        whitepaper: `https://${symbol.toLowerCase()}.org/whitepaper.pdf`,
        github: `https://github.com/${symbol.toLowerCase()}`,
        twitter: `https://twitter.com/${symbol.toLowerCase()}`,
        marketCap: asset.price * 1000000,
        circulatingSupply: 1000000,
        totalSupply: 1000000,
        maxSupply: 2000000,
        allTimeHigh: asset.price * 1.5,
        allTimeLow: asset.price * 0.1,
        ath24hChange: -15.2,
        atl24hChange: 45.8,
        marketCapRank: Math.floor(Math.random() * 100) + 1,
      };

      res.json(details);
    } catch (error) {
      console.error('Error fetching asset details:', error);
      res.status(500).json({ message: 'Failed to fetch asset details' });
    }
  });

  app.get('/api/assets/:symbol/news', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Generate mock news data
      const news = [
        {
          id: '1',
          title: `${symbol} Partnership Announcement with Major Financial Institution`,
          summary: 'Strategic partnership aims to enhance blockchain adoption in traditional finance sector.',
          source: 'CoinDesk',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          impact: 'high',
          url: '#',
          category: 'partnership'
        },
        {
          id: '2',
          title: 'New Regulatory Framework Could Impact Cryptocurrency Trading',
          summary: 'Proposed regulations may require additional compliance measures for crypto exchanges.',
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sentiment: 'negative',
          impact: 'medium',
          url: '#',
          category: 'regulatory'
        },
        {
          id: '3',
          title: `${symbol} Technical Upgrade Improves Network Efficiency`,
          summary: 'Latest protocol update reduces transaction fees and increases throughput.',
          source: 'CoinTelegraph',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          impact: 'medium',
          url: '#',
          category: 'technical'
        }
      ];

      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });
  
  // Get asset by symbol
  app.get("/api/assets/symbol/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const asset = await storage.getAssetBySymbol(symbol);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error('Error fetching asset by symbol:', error);
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  // Get all crypto assets
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getCryptoAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Get single asset by ID
  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      const asset = await storage.getCryptoAsset(id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  // Update asset SSS scores and metrics
  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      const updates = req.body;
      const asset = await storage.updateCryptoAsset(id, updates);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      
      // Broadcast update to WebSocket clients
      broadcast({
        type: 'asset_update',
        data: asset
      });
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to update asset" });
    }
  });

  // Get watchlisted assets
  app.get("/api/watchlist", async (req, res) => {
    try {
      const assets = await storage.getCryptoAssets();
      const watchlisted = assets.filter(asset => asset.isWatchlisted);
      res.json(watchlisted);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Toggle watchlist status
  app.patch("/api/assets/:id/watchlist", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      const asset = await storage.getCryptoAsset(id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      
      const updated = await storage.updateCryptoAsset(id, {
        isWatchlisted: !asset.isWatchlisted
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update watchlist status" });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  // Delete alert
  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid alert ID" });
      }
      const success = await storage.deleteAlert(id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Get velocity data for asset
  app.get("/api/assets/:id/velocity", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid asset ID" });
      }
      const limitParam = req.query.limit as string;
      const limit = limitParam ? Math.max(1, Math.min(1000, parseInt(limitParam) || 24)) : 24;
      if (isNaN(limit)) {
        return res.status(400).json({ error: "Invalid limit parameter" });
      }
      const velocityData = await storage.getVelocityData(id, limit);
      res.json(velocityData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch velocity data" });
    }
  });

  // Manual trigger for crypto data update
  app.post("/api/update-crypto-data", async (req, res) => {
    try {
      await cryptoDataService.updateCryptoAssets();
      const assets = await storage.getCryptoAssets();
      
      // Broadcast the update to all connected clients
      broadcast({
        type: 'crypto_update',
        data: assets,
        timestamp: new Date().toISOString()
      });
      
      res.json({ 
        success: true, 
        message: "Crypto data updated successfully",
        assetsCount: assets.length 
      });
    } catch (error) {
      console.error('Manual crypto update error:', error);
      res.status(500).json({ 
        error: "Failed to update crypto data",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simulate real-time data updates
  setInterval(async () => {
    try {
      const assets = await storage.getCryptoAssets();
      
      for (const asset of assets) {
        // Simulate small price changes
        const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
        const newPrice = asset.price * (1 + priceChange);
        
        // Simulate SSS score fluctuations
        const sssChange = (Math.random() - 0.5) * 6; // ±3 point change
        const newSSS = Math.max(0, Math.min(100, asset.sssScore + sssChange));
        
        await storage.updateCryptoAsset(asset.id, {
          price: newPrice,
          sssScore: newSSS,
          change24h: priceChange * 100,
        });

        // Create velocity data point
        await storage.createVelocityData({
          assetId: asset.id,
          velocity: Math.random() * 3 + 0.5,
          historicalAverage: 1.0,
          anomalyScore: Math.random() * 4,
        });
      }

      // Broadcast updates
      const updatedAssets = await storage.getCryptoAssets();
      broadcast({
        type: 'bulk_update',
        data: updatedAssets
      });

    } catch (error) {
      console.error('Error in data simulation:', error);
    }
  }, 30000); // Update every 30 seconds

  // ML Performance endpoints
  app.get("/api/ml/performance", async (req, res) => {
    try {
      // Simulate ML performance data
      const performance = {
        'BTC': {
          accuracy: 78.5,
          directionAccuracy: 82.3,
          sampleSize: 150,
          lastUpdated: new Date().toISOString()
        },
        'ETH': {
          accuracy: 81.2,
          directionAccuracy: 85.1,
          sampleSize: 142,
          lastUpdated: new Date().toISOString()
        },
        'SOL': {
          accuracy: 75.8,
          directionAccuracy: 79.4,
          sampleSize: 98,
          lastUpdated: new Date().toISOString()
        },
        'ADA': {
          accuracy: 73.1,
          directionAccuracy: 77.8,
          sampleSize: 87,
          lastUpdated: new Date().toISOString()
        }
      };
      res.json(performance);
    } catch (error) {
      console.error("Error fetching ML performance:", error);
      res.status(500).json({ error: "Failed to fetch ML performance" });
    }
  });

  app.get("/api/ml/metrics", async (req, res) => {
    try {
      const metrics = {
        totalModels: 10,
        averageAccuracy: 77.2,
        bestPerformer: 'ETH',
        worstPerformer: 'MATIC',
        predictionCount: 1247,
        successRate: 79.8
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching ML metrics:", error);
      res.status(500).json({ error: "Failed to fetch ML metrics" });
    }
  });

  // Rate limiting for expensive operations
  const rateLimitMap = new Map<string, number>();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 5;

  const checkRateLimit = (ip: string): boolean => {
    const now = Date.now();
    const userRequests = rateLimitMap.get(ip) || 0;
    
    if (userRequests >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }
    
    rateLimitMap.set(ip, userRequests + 1);
    
    // Clean up old entries every minute
    setTimeout(() => {
      rateLimitMap.delete(ip);
    }, RATE_LIMIT_WINDOW);
    
    return true;
  };

  app.post("/api/ml/retrain", async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (!checkRateLimit(clientIP)) {
        return res.status(429).json({ error: "Rate limit exceeded. Please wait before retrying." });
      }
      
      // Simulate model retraining
      console.log("Starting ML model retraining...");
      
      // In a real implementation, this would trigger the ML optimizer
      // await mlOptimizer.autoRetrain();
      
      setTimeout(() => {
        console.log("ML model retraining completed");
      }, 2000);
      
      res.json({ success: true, message: "Model retraining initiated" });
    } catch (error) {
      console.error("Error retraining models:", error);
      res.status(500).json({ error: "Failed to retrain models" });
    }
  });

  // Backtesting endpoints
  app.get("/api/backtest/results", async (req, res) => {
    try {
      // Simulate historical backtest results
      const backtestResults = [
        {
          strategyId: 'high_sss_momentum',
          startDate: '2024-01-01',
          endDate: '2024-07-01',
          initialCapital: 10000,
          finalCapital: 12350,
          totalReturn: 23.5,
          totalTrades: 42,
          winningTrades: 28,
          losingTrades: 14,
          winRate: 66.7,
          averageReturn: 2.8,
          maxDrawdown: -18.5,
          sharpeRatio: 1.42,
          profitFactor: 1.85,
          trades: generateMockTrades(42),
          dailyReturns: generateMockDailyReturns(180)
        },
        {
          strategyId: 'medium_sss_swing',
          startDate: '2024-01-01',
          endDate: '2024-07-01',
          initialCapital: 10000,
          finalCapital: 11890,
          totalReturn: 18.9,
          totalTrades: 38,
          winningTrades: 24,
          losingTrades: 14,
          winRate: 63.2,
          averageReturn: 2.1,
          maxDrawdown: -15.2,
          sharpeRatio: 1.28,
          profitFactor: 1.62,
          trades: generateMockTrades(38),
          dailyReturns: generateMockDailyReturns(180)
        }
      ];
      
      res.json(backtestResults);
    } catch (error) {
      console.error("Error fetching backtest results:", error);
      res.status(500).json({ error: "Failed to fetch backtest results" });
    }
  });

  app.post("/api/backtest/run", async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (!checkRateLimit(clientIP)) {
        return res.status(429).json({ error: "Rate limit exceeded. Please wait before retrying." });
      }
      
      const { strategy, period, initialCapital } = req.body;
      
      // Validate input parameters
      if (!strategy || !strategy.name || !period || !initialCapital) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      if (typeof initialCapital !== 'number' || initialCapital <= 0 || initialCapital > 10000000) {
        return res.status(400).json({ error: "Invalid initial capital amount" });
      }
      
      console.log(`Running backtest for strategy: ${strategy.name}`);
      console.log(`Period: ${period}, Initial Capital: $${initialCapital}`);
      
      // Simulate backtest execution delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate realistic backtest results based on strategy parameters
      const periodMonths = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : period === '1y' ? 12 : 24;
      const totalDays = periodMonths * 30;
      const expectedTrades = Math.floor(totalDays / strategy.parameters.holdingPeriod) * strategy.parameters.maxPositions;
      
      // Calculate performance based on SSS threshold (higher threshold = better performance but fewer trades)
      const baseReturn = strategy.parameters.sssThreshold >= 80 ? 25 : strategy.parameters.sssThreshold >= 70 ? 18 : 12;
      const volatilityAdjustment = (100 - strategy.parameters.sssThreshold) * 0.2;
      const finalReturn = baseReturn + (Math.random() - 0.5) * volatilityAdjustment;
      
      const winRate = Math.max(50, Math.min(85, 55 + (strategy.parameters.sssThreshold - 60) * 0.5));
      const winningTrades = Math.floor(expectedTrades * (winRate / 100));
      const losingTrades = expectedTrades - winningTrades;
      
      const result = {
        strategyId: strategy.id,
        startDate: new Date(Date.now() - totalDays * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        initialCapital,
        finalCapital: initialCapital * (1 + finalReturn / 100),
        totalReturn: finalReturn,
        totalTrades: expectedTrades,
        winningTrades,
        losingTrades,
        winRate,
        averageReturn: finalReturn / expectedTrades,
        maxDrawdown: -(Math.random() * 15 + 10),
        sharpeRatio: Math.random() * 1.5 + 0.8,
        profitFactor: Math.random() * 1.2 + 1.3,
        trades: generateMockTrades(expectedTrades),
        dailyReturns: generateMockDailyReturns(totalDays)
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error running backtest:", error);
      res.status(500).json({ error: "Failed to run backtest" });
    }
  });

  // Helper functions for generating mock data
  function generateMockTrades(count: number) {
    const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'AVAX', 'DOT', 'NEAR'];
    const trades = [];
    
    for (let i = 0; i < count; i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const entryDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const exitDate = new Date(entryDate.getTime() + (Math.random() * 21 + 1) * 24 * 60 * 60 * 1000);
      const entryPrice = Math.random() * 1000 + 10;
      const returnPercent = (Math.random() - 0.35) * 50; // Slight positive bias
      const exitPrice = entryPrice * (1 + returnPercent / 100);
      
      trades.push({
        id: `trade_${i}`,
        asset,
        entryDate: entryDate.toISOString(),
        exitDate: exitDate.toISOString(),
        entryPrice,
        exitPrice,
        quantity: Math.random() * 10 + 0.1,
        return: returnPercent,
        sssAtEntry: Math.random() * 40 + 60,
        reason: Math.random() > 0.7 ? 'take_profit' : Math.random() > 0.5 ? 'time_exit' : 'stop_loss'
      });
    }
    
    return trades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }

  function generateMockDailyReturns(days: number) {
    const dailyReturns = [];
    let portfolioValue = 10000;
    let cumulativeReturn = 0;
    
    for (let i = 0; i < days; i++) {
      const dailyReturn = (Math.random() - 0.48) * 3; // Slight positive bias
      portfolioValue *= (1 + dailyReturn / 100);
      cumulativeReturn = ((portfolioValue - 10000) / 10000) * 100;
      
      dailyReturns.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        portfolioValue: Math.round(portfolioValue),
        dailyReturn: parseFloat(dailyReturn.toFixed(2)),
        cumulativeReturn: parseFloat(cumulativeReturn.toFixed(2))
      });
    }
    
    return dailyReturns;
  }

  // Trading Signals API
  app.get("/api/trading/signals", async (req, res) => {
    try {
      const signals = [
        {
          id: 1,
          asset: "SOL",
          type: "BUY",
          confidence: 87.5,
          price: 187.14,
          targetPrice: 210.50,
          stopLoss: 175.80,
          reasoning: "Strong SSS surge detected with high community cohesion",
          timestamp: new Date().toISOString(),
          status: "active"
        },
        {
          id: 2,
          asset: "ETH",
          type: "HOLD",
          confidence: 72.3,
          price: 3757.84,
          targetPrice: 4200.00,
          stopLoss: 3500.00,
          reasoning: "Moderate SSS with stable anchor pressure",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "active"
        },
        {
          id: 3,
          asset: "LINK",
          type: "SELL",
          confidence: 65.8,
          price: 18.32,
          targetPrice: 15.50,
          stopLoss: 19.80,
          reasoning: "Declining SSS with weakening behavioral activity",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: "completed"
        }
      ];
      res.json(signals);
    } catch (error) {
      console.error("Error fetching trading signals:", error);
      res.status(500).json({ error: "Failed to fetch trading signals" });
    }
  });

  app.get("/api/signals", async (req, res) => {
    try {
      const signalPerformance = {
        totalSignals: 156,
        accuracy: 78.2,
        avgReturn: 12.5,
        winRate: 68.4,
        activeSignals: 8,
        recentSignals: [
          { asset: "SOL", type: "BUY", confidence: 87.5, timestamp: new Date().toISOString() },
          { asset: "ETH", type: "HOLD", confidence: 72.3, timestamp: new Date().toISOString() },
          { asset: "LINK", type: "SELL", confidence: 65.8, timestamp: new Date().toISOString() }
        ]
      };
      res.json(signalPerformance);
    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ error: "Failed to fetch signals" });
    }
  });

  // Market Scanner API
  app.get("/api/market-scan", async (req, res) => {
    try {
      const scanResults = {
        totalScanned: 2847,
        anomaliesDetected: 23,
        highPotential: 8,
        lastScan: new Date().toISOString(),
        results: [
          {
            symbol: "NEAR",
            name: "NEAR Protocol",
            anomalyType: "volume_surge",
            severity: "high",
            description: "400% volume increase with SSS spike",
            confidence: 92.3,
            timestamp: new Date().toISOString()
          },
          {
            symbol: "ATOM",
            name: "Cosmos Hub",
            anomalyType: "whale_activity",
            severity: "medium",
            description: "Large wallet accumulation detected",
            confidence: 78.9,
            timestamp: new Date().toISOString()
          }
        ]
      };
      res.json(scanResults);
    } catch (error) {
      console.error("Error in market scan:", error);
      res.status(500).json({ error: "Failed to perform market scan" });
    }
  });

  // Comprehensive cryptocurrency search and data endpoint
  app.get("/api/crypto/search/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { default: CryptoDataService } = await import('./crypto-data-service');
      const cryptoService = new CryptoDataService();
      
      // Try to get data for the requested cryptocurrency
      const coinData = await cryptoService.fetchSingleCoinData(symbol);
      
      if (!coinData) {
        return res.status(404).json({ 
          error: `Cryptocurrency ${symbol.toUpperCase()} not found`,
          suggestion: "Try searching for the full name or check the symbol spelling"
        });
      }

      // Generate SSS score for the coin
      const behavioralMetrics = {
        behavioralActivity: Math.floor(Math.random() * 40) + 40,
        velocityAnomaly: Math.floor(Math.random() * 40) + 50,
        communityCohesion: Math.floor(Math.random() * 30) + 60,
        anchorPressure: Math.floor(Math.random() * 50) + 30,
        hypeToHoldRatio: Math.floor(Math.random() * 60) + 20,
        historicalVolatility: Math.floor(Math.random() * 15) + 2
      };

      const sssScore = (
        (behavioralMetrics.anchorPressure * 0.25) +
        (behavioralMetrics.behavioralActivity * 0.20) +
        (behavioralMetrics.velocityAnomaly * 0.20) +
        (behavioralMetrics.communityCohesion * 0.20) +
        (behavioralMetrics.hypeToHoldRatio * 0.10) +
        (behavioralMetrics.historicalVolatility * 0.05)
      );

      const enhancedData = {
        id: coinData.id || symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: coinData.name || symbol,
        price: coinData.current_price || 0,
        marketCap: coinData.market_cap || 0,
        volume24h: coinData.total_volume || 0,
        change24h: coinData.price_change_percentage_24h || 0,
        sssScore: Math.min(100, Math.max(0, sssScore)),
        ...behavioralMetrics,
        lastUpdated: new Date().toISOString(),
        isWatchlisted: false,
        marketCapRank: coinData.market_cap_rank || null,
        circulatingSupply: coinData.circulating_supply || null,
        totalSupply: coinData.total_supply || null,
        maxSupply: coinData.max_supply || null
      };

      res.json(enhancedData);
    } catch (error: any) {
      console.error(`Error searching for crypto ${req.params.symbol}:`, error);
      res.status(500).json({ 
        error: "Failed to fetch cryptocurrency data",
        details: error.message 
      });
    }
  });

  // Get trending/new cryptocurrencies
  app.get("/api/crypto/trending", async (req, res) => {
    try {
      const url = "https://api.coingecko.com/api/v3/search/trending";
      const headers: HeadersInit = { 'accept': 'application/json' };
      
      if (process.env.COINGECKO_API_KEY) {
        headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const trending = data.coins?.slice(0, 10).map((coin: any) => ({
        id: coin.item.id,
        symbol: coin.item.symbol,
        name: coin.item.name,
        marketCapRank: coin.item.market_cap_rank,
        thumb: coin.item.thumb,
        small: coin.item.small,
        large: coin.item.large,
        score: coin.item.score
      })) || [];

      res.json({
        trending,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching trending cryptocurrencies:", error);
      res.status(500).json({ error: "Failed to fetch trending data" });
    }
  });

  // Add cryptocurrency to tracking (dynamic addition)
  app.post("/api/crypto/add", async (req, res) => {
    try {
      const { symbol } = req.body;
      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      const { default: CryptoDataService } = await import('./crypto-data-service');
      const cryptoService = new CryptoDataService();
      const coinData = await cryptoService.fetchSingleCoinData(symbol);
      
      if (!coinData) {
        return res.status(404).json({ 
          error: `Cryptocurrency ${symbol} not found` 
        });
      }

      // For now, just return the coin data since we don't have persistent asset creation
      // This feature will be expanded when full database integration is implemented
      res.json({
        message: "Cryptocurrency data retrieved successfully",
        asset: {
          symbol: symbol.toUpperCase(),
          name: coinData.name,
          price: coinData.current_price,
          marketCap: coinData.market_cap,
          volume24h: coinData.total_volume,
          change24h: coinData.price_change_percentage_24h,
          sssScore: 50,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error adding cryptocurrency:", error);
      res.status(500).json({ error: "Failed to add cryptocurrency" });
    }
  });

  // Comprehensive Cryptocurrency Expansion APIs
  
  // Search any cryptocurrency and add to tracking
  app.get("/api/crypto/search/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const CryptoDataService = (await import("./crypto-data-service")).default;
      const cryptoService = new CryptoDataService();
      
      // Try to find in database first
      const existing = await storage.getCryptoAssetBySymbol(symbol.toUpperCase());
      if (existing) {
        return res.json(existing);
      }
      
      // Search via CoinGecko API
      const coinData = await cryptoService.fetchSingleCoinData(symbol);
      if (!coinData) {
        return res.status(404).json({ error: `Cryptocurrency ${symbol} not found` });
      }
      
      // Calculate SSS metrics - use public methods
      const behavioralMetrics = {
        behavioralActivity: Math.floor(Math.random() * 40) + 60,
        velocityAnomaly: Math.floor(Math.random() * 40) + 60,
        communityCohesion: Math.floor(Math.random() * 40) + 60,
        anchorPressure: Math.floor(Math.random() * 40) + 60,
        hypeToHoldRatio: Math.floor(Math.random() * 40) + 30,
        historicalVolatility: Math.floor(Math.random() * 30) + 20,
        isWatchlisted: false
      };
      const sssScore = Math.floor(
        (behavioralMetrics.behavioralActivity * 0.2 +
         behavioralMetrics.velocityAnomaly * 0.2 +
         behavioralMetrics.communityCohesion * 0.2 +
         behavioralMetrics.anchorPressure * 0.25 +
         behavioralMetrics.hypeToHoldRatio * 0.1 +
         (100 - behavioralMetrics.historicalVolatility) * 0.05)
      );
      
      // Add to database
      const newAsset = await storage.upsertCryptoAsset({
        symbol: symbol.toUpperCase(),
        name: coinData.name,
        price: coinData.current_price,
        marketCap: coinData.market_cap || 0,
        volume24h: coinData.total_volume || 0,
        change24h: coinData.price_change_percentage_24h || 0,
        sssScore,
        ...behavioralMetrics,
      });
      
      res.json(newAsset);
    } catch (error) {
      console.error('Search crypto error:', error);
      res.status(500).json({ error: 'Failed to search cryptocurrency' });
    }
  });

  // Get trending cryptocurrencies
  app.get("/api/crypto/trending", async (req, res) => {
    try {
      const CryptoDataService = (await import("./crypto-data-service")).default;
      const cryptoService = new CryptoDataService();
      const trending = await cryptoService.getTrendingCoins();
      res.json(trending);
    } catch (error) {
      console.error('Trending crypto error:', error);
      res.status(500).json({ error: 'Failed to fetch trending cryptocurrencies' });
    }
  });

  // Batch update cryptocurrency database (expand to thousands)
  app.post("/api/crypto/batch-update", async (req, res) => {
    try {
      const CryptoDataService = (await import("./crypto-data-service")).default;
      const cryptoService = new CryptoDataService();
      await cryptoService.updateAllCryptocurrencies();
      
      const totalAssets = await storage.getCryptoAssetsCount();
      res.json({ 
        success: true, 
        message: `Comprehensive cryptocurrency database updated: ${totalAssets} total assets now tracked` 
      });
    } catch (error) {
      console.error('Batch update error:', error);
      res.status(500).json({ error: 'Failed to update cryptocurrency database' });
    }
  });

  // Get cryptocurrency count and statistics
  app.get("/api/crypto/stats", async (req, res) => {
    try {
      const totalAssets = await storage.getCryptoAssetsCount();
      const topAssets = await storage.getCryptoAssets();
      const topSSS = topAssets
        .sort((a, b) => b.sssScore - a.sssScore)
        .slice(0, 10)
        .map(asset => ({ symbol: asset.symbol, sssScore: asset.sssScore }));
      
      res.json({
        totalCryptocurrencies: totalAssets,
        topSSSPerformers: topSSS,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Crypto stats error:', error);
      res.status(500).json({ error: 'Failed to fetch cryptocurrency statistics' });
    }
  });

  return httpServer;
}
