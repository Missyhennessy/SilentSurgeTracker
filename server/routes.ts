import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { cryptoDataService } from "./crypto-data-service";
import { insertCryptoAssetSchema, insertAlertSchema, insertVelocityDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe') {
          // Handle subscription to specific assets or alerts
          console.log('Client subscribed to:', data.topic);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
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

  // API Routes
  
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 24;
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

  app.post("/api/ml/retrain", async (req, res) => {
    try {
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

  return httpServer;
}
