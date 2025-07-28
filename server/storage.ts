import { CryptoAsset, InsertCryptoAsset, Alert, InsertAlert, VelocityData, InsertVelocityData, User, UpsertUser } from "@shared/schema";
import { cryptoAssets, alerts, velocityData, users } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Crypto Assets
  getCryptoAssets(): Promise<CryptoAsset[]>;
  getCryptoAsset(id: number): Promise<CryptoAsset | undefined>;
  getCryptoAssetBySymbol(symbol: string): Promise<CryptoAsset | undefined>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  updateCryptoAsset(id: number, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined>;
  upsertCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  getCryptoAssetsCount(): Promise<number>;
  searchCryptoAssets(query: string): Promise<CryptoAsset[]>;
  
  // Alerts
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertsForAsset(assetId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;
  
  // Velocity Data
  getVelocityData(assetId: number, limit?: number): Promise<VelocityData[]>;
  createVelocityData(data: InsertVelocityData): Promise<VelocityData>;
  
  // User management for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample data if empty
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if we already have data
      const existingAssets = await db.select().from(cryptoAssets);
      if (existingAssets.length > 0) {
        return; // Data already exists
      }

      const sampleAssets: InsertCryptoAsset[] = [
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: 67234.12,
          marketCap: 1320000000000,
          volume24h: 28000000000,
          change24h: 2.34,
          sssScore: 87,
          behavioralActivity: 85,
          velocityAnomaly: 92,
          communityCohesion: 89,
          anchorPressure: 78,
          hypeToHoldRatio: 45,
          historicalVolatility: 23,
          isWatchlisted: true,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: 3234.67,
          marketCap: 388000000000,
          volume24h: 15000000000,
          change24h: 1.89,
          sssScore: 82,
          behavioralActivity: 78,
          velocityAnomaly: 86,
          communityCohesion: 84,
          anchorPressure: 72,
          hypeToHoldRatio: 52,
          historicalVolatility: 28,
          isWatchlisted: false,
        },
        {
          symbol: "SOL",
          name: "Solana",
          price: 178.45,
          marketCap: 78000000000,
          volume24h: 2800000000,
          change24h: -1.24,
          sssScore: 75,
          behavioralActivity: 92,
          velocityAnomaly: 71,
          communityCohesion: 76,
          anchorPressure: 58,
          hypeToHoldRatio: 68,
          historicalVolatility: 35,
          isWatchlisted: true,
        },
        {
          symbol: "ADA",
          name: "Cardano",
          price: 0.89,
          marketCap: 31000000000,
          volume24h: 980000000,
          change24h: 3.67,
          sssScore: 69,
          behavioralActivity: 66,
          velocityAnomaly: 74,
          communityCohesion: 71,
          anchorPressure: 82,
          hypeToHoldRatio: 35,
          historicalVolatility: 22,
          isWatchlisted: false,
        },
        {
          symbol: "LINK",
          name: "Chainlink",
          price: 23.78,
          marketCap: 14000000000,
          volume24h: 785000000,
          change24h: 5.23,
          sssScore: 79,
          behavioralActivity: 73,
          velocityAnomaly: 87,
          communityCohesion: 79,
          anchorPressure: 72,
          hypeToHoldRatio: 42,
          historicalVolatility: 31,
          isWatchlisted: true,
        },
        {
          symbol: "DOT",
          name: "Polkadot",
          price: 8.45,
          marketCap: 12000000000,
          volume24h: 445000000,
          change24h: -0.89,
          sssScore: 72,
          behavioralActivity: 69,
          velocityAnomaly: 75,
          communityCohesion: 74,
          anchorPressure: 79,
          hypeToHoldRatio: 38,
          historicalVolatility: 27,
          isWatchlisted: false,
        },
      ];

      // Insert sample assets
      for (const asset of sampleAssets) {
        await db.insert(cryptoAssets).values(asset);
      }

      // Add some sample alerts
      const sampleAlerts: InsertAlert[] = [
        {
          assetId: 1,
          threshold: 90,
          isActive: true,
          alertType: "sss_score",
        },
        {
          assetId: 3,
          threshold: 80,
          isActive: true,
          alertType: "velocity",
        },
      ];

      for (const alert of sampleAlerts) {
        await db.insert(alerts).values(alert);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  async getCryptoAssets(): Promise<CryptoAsset[]> {
    return await db.select().from(cryptoAssets);
  }

  async getCryptoAsset(id: number): Promise<CryptoAsset | undefined> {
    const [asset] = await db.select().from(cryptoAssets).where(eq(cryptoAssets.id, id));
    return asset || undefined;
  }

  async getCryptoAssetBySymbol(symbol: string): Promise<CryptoAsset | undefined> {
    const [asset] = await db.select().from(cryptoAssets).where(eq(cryptoAssets.symbol, symbol));
    return asset || undefined;
  }

  async createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [newAsset] = await db
      .insert(cryptoAssets)
      .values(asset)
      .returning();
    return newAsset;
  }

  async updateCryptoAsset(id: number, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined> {
    const [updatedAsset] = await db
      .update(cryptoAssets)
      .set(updates)
      .where(eq(cryptoAssets.id, id))
      .returning();
    return updatedAsset || undefined;
  }

  async upsertCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [upsertedAsset] = await db
      .insert(cryptoAssets)
      .values(asset)
      .onConflictDoUpdate({
        target: cryptoAssets.symbol,
        set: {
          ...asset,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return upsertedAsset;
  }

  async getCryptoAssetsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(cryptoAssets);
    return result.count;
  }

  async searchCryptoAssets(query: string): Promise<CryptoAsset[]> {
    return await db.select().from(cryptoAssets)
      .where(
        or(
          ilike(cryptoAssets.symbol, `%${query}%`),
          ilike(cryptoAssets.name, `%${query}%`)
        )
      )
      .orderBy(desc(cryptoAssets.sssScore))
      .limit(50);
  }

  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.isActive, true));
  }

  async getAlertsForAsset(assetId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.assetId, assetId));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getVelocityData(assetId: number, limit = 100): Promise<VelocityData[]> {
    if (limit) {
      return await db.select().from(velocityData)
        .where(eq(velocityData.assetId, assetId))
        .orderBy(desc(velocityData.timestamp))
        .limit(limit);
    }
    
    return await db.select().from(velocityData).where(eq(velocityData.assetId, assetId));
  }

  async createVelocityData(data: InsertVelocityData): Promise<VelocityData> {
    const [newData] = await db
      .insert(velocityData)
      .values(data)
      .returning();
    return newData;
  }

  // User management methods for authentication
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();