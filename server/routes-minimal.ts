import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoDataService } from "./crypto-data-service";
import { insertCryptoAssetSchema, insertAlertSchema, insertVelocityDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Start real-time crypto data updates
  cryptoDataService.startRealTimeUpdates(2); // Update every 2 minutes

  // Basic API health check
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all crypto assets
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getCryptoAssets();
      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add a crypto asset
  app.post("/api/assets", async (req, res) => {
    try {
      const result = insertCryptoAssetSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid asset data", errors: result.error.errors });
      }
      const asset = await storage.createCryptoAsset(result.data);
      res.status(201).json(asset);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const result = insertAlertSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid alert data", errors: result.error.errors });
      }
      const alert = await storage.createAlert(result.data);
      res.status(201).json(alert);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update watchlist
  app.post("/api/assets/:id/watchlist", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isWatchlisted } = req.body;
      // Simplified for minimal version
      res.json({ id, isWatchlisted, message: "Watchlist updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get velocity data
  app.get("/api/velocity", async (req, res) => {
    try {
      // Return empty array for minimal version
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}