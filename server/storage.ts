import { CryptoAsset, InsertCryptoAsset, Alert, InsertAlert, VelocityData, InsertVelocityData } from "@shared/schema";

export interface IStorage {
  // Crypto Assets
  getCryptoAssets(): Promise<CryptoAsset[]>;
  getCryptoAsset(id: number): Promise<CryptoAsset | undefined>;
  getCryptoAssetBySymbol(symbol: string): Promise<CryptoAsset | undefined>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  updateCryptoAsset(id: number, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private cryptoAssets: Map<number, CryptoAsset>;
  private alerts: Map<number, Alert>;
  private velocityData: Map<number, VelocityData>;
  private currentAssetId: number;
  private currentAlertId: number;
  private currentVelocityId: number;

  constructor() {
    this.cryptoAssets = new Map();
    this.alerts = new Map();
    this.velocityData = new Map();
    this.currentAssetId = 1;
    this.currentAlertId = 1;
    this.currentVelocityId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
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
        communityCohesion: 78,
        anchorPressure: 89,
        hypeToHoldRatio: 67,
        historicalVolatility: 45,
        isWatchlisted: true,
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 3421.45,
        marketCap: 410000000000,
        volume24h: 15000000000,
        change24h: 4.12,
        sssScore: 92,
        behavioralActivity: 88,
        velocityAnomaly: 95,
        communityCohesion: 82,
        anchorPressure: 91,
        hypeToHoldRatio: 73,
        historicalVolatility: 52,
        isWatchlisted: true,
      },
      {
        symbol: "SOL",
        name: "Solana",
        price: 198.45,
        marketCap: 89000000000,
        volume24h: 3200000000,
        change24h: 1.87,
        sssScore: 76,
        behavioralActivity: 74,
        velocityAnomaly: 68,
        communityCohesion: 79,
        anchorPressure: 82,
        hypeToHoldRatio: 71,
        historicalVolatility: 58,
        isWatchlisted: false,
      },
      {
        symbol: "ADA",
        name: "Cardano",
        price: 0.8934,
        marketCap: 31000000000,
        volume24h: 890000000,
        change24h: -0.54,
        sssScore: 84,
        behavioralActivity: 81,
        velocityAnomaly: 72,
        communityCohesion: 87,
        anchorPressure: 91,
        hypeToHoldRatio: 65,
        historicalVolatility: 41,
        isWatchlisted: true,
      },
    ];

    sampleAssets.forEach(asset => {
      this.createCryptoAsset(asset);
    });
  }

  async getCryptoAssets(): Promise<CryptoAsset[]> {
    return Array.from(this.cryptoAssets.values());
  }

  async getCryptoAsset(id: number): Promise<CryptoAsset | undefined> {
    return this.cryptoAssets.get(id);
  }

  async getCryptoAssetBySymbol(symbol: string): Promise<CryptoAsset | undefined> {
    return Array.from(this.cryptoAssets.values()).find(asset => asset.symbol === symbol);
  }

  async createCryptoAsset(insertAsset: InsertCryptoAsset): Promise<CryptoAsset> {
    const id = this.currentAssetId++;
    const asset: CryptoAsset = {
      ...insertAsset,
      id,
      lastUpdated: new Date(),
    };
    this.cryptoAssets.set(id, asset);
    return asset;
  }

  async updateCryptoAsset(id: number, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined> {
    const existing = this.cryptoAssets.get(id);
    if (!existing) return undefined;
    
    const updated: CryptoAsset = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    };
    this.cryptoAssets.set(id, updated);
    return updated;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive);
  }

  async getAlertsForAsset(assetId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.assetId === assetId);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, updates: Partial<InsertAlert>): Promise<Alert | undefined> {
    const existing = this.alerts.get(id);
    if (!existing) return undefined;
    
    const updated: Alert = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }

  async getVelocityData(assetId: number, limit: number = 24): Promise<VelocityData[]> {
    return Array.from(this.velocityData.values())
      .filter(data => data.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async createVelocityData(insertData: InsertVelocityData): Promise<VelocityData> {
    const id = this.currentVelocityId++;
    const data: VelocityData = {
      ...insertData,
      id,
      timestamp: new Date(),
    };
    this.velocityData.set(id, data);
    return data;
  }
}

export const storage = new MemStorage();
