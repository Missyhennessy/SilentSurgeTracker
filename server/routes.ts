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
      const { strategy, period, initialCapital } = req.body;
      
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

  return httpServer;
}
