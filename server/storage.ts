import { CryptoAsset, InsertCryptoAsset, Alert, InsertAlert, VelocityData, InsertVelocityData, User, UpsertUser, Subscription, InsertSubscription, PaymentHistory, InsertPaymentHistory, ApiKey, InsertApiKey, ApiKeyUsage, InsertApiKeyUsage, HistoricalVolumeData, InsertHistoricalVolumeData, MarketSentiment, InsertMarketSentiment, Portfolio, InsertPortfolio, RiskMetrics, InsertRiskMetrics, TradingSignal, InsertTradingSignal, AdvancedAlert, InsertAdvancedAlert, BacktestResult, InsertBacktestResult } from "@shared/schema";
import { cryptoAssets, alerts, velocityData, users, subscriptions, paymentHistory, apiKeys, apiKeyUsage, historicalVolumeData, marketSentiment, portfolios, riskMetrics, tradingSignals, advancedAlerts, backtestResults } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, ilike, or, sql, gte } from "drizzle-orm";

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
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, subscriptionData: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Subscription management
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  updateSubscription(stripeSubscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  
  // Payment history
  createPaymentRecord(payment: InsertPaymentHistory): Promise<PaymentHistory>;
  getPaymentHistory(userId: string): Promise<PaymentHistory[]>;
  
  // API Key management
  createApiKey(apiKey: InsertApiKey & { fullKey: string }): Promise<ApiKey>;
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKeyByPrefix(keyPrefix: string): Promise<ApiKey | undefined>;
  validateApiKey(keyHash: string): Promise<ApiKey | undefined>;
  updateApiKeyUsage(apiKeyId: number): Promise<void>;
  revokeApiKey(id: number, userId: string): Promise<boolean>;
  trackApiKeyUsage(usage: InsertApiKeyUsage): Promise<ApiKeyUsage>;
  getApiKeyUsage(apiKeyId: number, limit?: number): Promise<ApiKeyUsage[]>;
  
  // Historical Volume Data for Anomaly Detection
  createHistoricalVolumeData(data: InsertHistoricalVolumeData): Promise<HistoricalVolumeData>;
  getHistoricalVolumeData(assetId: number, days?: number): Promise<HistoricalVolumeData[]>;
  getHistoricalVolumeDataBySymbol(symbol: string, days?: number): Promise<HistoricalVolumeData[]>;
  cleanupOldHistoricalData(daysToKeep?: number): Promise<number>; // Returns number of records deleted
  
  // Comprehensive Market Sentiment
  createMarketSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment>;
  getMarketSentiment(assetId: number, hours?: number): Promise<MarketSentiment[]>;
  getOverallMarketSentiment(): Promise<MarketSentiment[]>;
  
  // Portfolio Management
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getUserPortfolios(userId: string): Promise<Portfolio[]>;
  updatePortfolio(id: number, updates: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: number, userId: string): Promise<boolean>;
  
  // Risk Management
  createRiskMetrics(metrics: InsertRiskMetrics): Promise<RiskMetrics>;
  getPortfolioRiskMetrics(portfolioId: number, days?: number): Promise<RiskMetrics[]>;
  getLatestRiskMetrics(portfolioId: number): Promise<RiskMetrics | undefined>;
  
  // Trading Signals
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getActiveTradingSignals(assetId?: number): Promise<TradingSignal[]>;
  getSignalPerformance(modelName: string, days?: number): Promise<TradingSignal[]>;
  updateSignalPerformance(id: number, accuracy: number): Promise<void>;
  
  // Advanced Alerts
  createAdvancedAlert(alert: InsertAdvancedAlert): Promise<AdvancedAlert>;
  getUserAlerts(userId: string): Promise<AdvancedAlert[]>;
  updateAlert(id: number, updates: Partial<InsertAdvancedAlert>): Promise<AdvancedAlert>;
  deleteAdvancedAlert(id: number, userId: string): Promise<boolean>;
  updateAlertTriggerCount(id: number): Promise<void>;
  
  // Backtesting
  createBacktestResult(result: InsertBacktestResult): Promise<BacktestResult>;
  getUserBacktests(userId: string): Promise<BacktestResult[]>;
  getBacktestResult(id: number, userId: string): Promise<BacktestResult | undefined>;
  deleteBacktestResult(id: number, userId: string): Promise<boolean>;
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

  async getAssetBySymbol(symbol: string): Promise<CryptoAsset | undefined> {
    return this.getCryptoAssetBySymbol(symbol);
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
    // Try to find existing asset first
    const existing = await this.getCryptoAssetBySymbol(asset.symbol);
    
    if (existing) {
      // Update existing asset
      const [updatedAsset] = await db
        .update(cryptoAssets)
        .set({
          ...asset,
          lastUpdated: new Date(),
        })
        .where(eq(cryptoAssets.id, existing.id))
        .returning();
      return updatedAsset;
    } else {
      // Create new asset
      const [newAsset] = await db
        .insert(cryptoAssets)
        .values(asset)
        .returning();
      return newAsset;
    }
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Check if this is the founder account
      if (userData.email === 'thennessy01@gmail.com') {
        userData.isFounder = true;
        userData.isPremium = true;
        userData.subscriptionStatus = 'active';
        userData.subscriptionPlan = 'founder';
      }

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

  async updateUserSubscription(userId: string, subscriptionData: Partial<UpsertUser>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({
          ...subscriptionData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return undefined;
    }
  }

  // Subscription management methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      const [newSubscription] = await db
        .insert(subscriptions)
        .values(subscription)
        .returning();
      return newSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt));
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return undefined;
    }
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
      return subscription;
    } catch (error) {
      console.error('Error getting subscription by Stripe ID:', error);
      return undefined;
    }
  }

  async updateSubscription(stripeSubscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db
        .update(subscriptions)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
        .returning();
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return undefined;
    }
  }

  // Payment history methods
  async createPaymentRecord(payment: InsertPaymentHistory): Promise<PaymentHistory> {
    try {
      const [newPayment] = await db
        .insert(paymentHistory)
        .values(payment)
        .returning();
      return newPayment;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      return await db
        .select()
        .from(paymentHistory)
        .where(eq(paymentHistory.userId, userId))
        .orderBy(desc(paymentHistory.createdAt));
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // API Key management methods
  async createApiKey(apiKeyData: InsertApiKey & { fullKey: string }): Promise<ApiKey> {
    try {
      const { fullKey, expirationDays, ...keyData } = apiKeyData;
      
      // Generate key prefix (first 8 chars for display)
      const keyPrefix = fullKey.substring(0, 8);
      
      // Hash the full key for secure storage
      const crypto = await import('crypto');
      const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');
      
      // Calculate expiration date if provided
      const expiresAt = expirationDays 
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
        : null;

      const [newApiKey] = await db
        .insert(apiKeys)
        .values({
          ...keyData,
          keyPrefix,
          keyHash,
          expiresAt,
        })
        .returning();
      
      return newApiKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    try {
      return await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId))
        .orderBy(desc(apiKeys.createdAt));
    } catch (error) {
      console.error('Error getting API keys:', error);
      return [];
    }
  }

  async getApiKeyByPrefix(keyPrefix: string): Promise<ApiKey | undefined> {
    try {
      const [apiKey] = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.keyPrefix, keyPrefix));
      return apiKey;
    } catch (error) {
      console.error('Error getting API key by prefix:', error);
      return undefined;
    }
  }

  async validateApiKey(fullKey: string): Promise<ApiKey | undefined> {
    try {
      // ENTERPRISE SECURITY: Import crypto for HMAC-based validation
      const crypto = await import('crypto');
      const { constantTimeCompare } = await import('./api-key-auth');
      
      // Extract key prefix for lookup optimization
      const keyPrefix = fullKey.substring(0, 12); // Extract "sst_XXXXXXXX"
      
      // Get candidate keys by prefix for efficiency
      const candidateKeys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.keyPrefix, keyPrefix));
      
      // ENTERPRISE SECURITY: Use HMAC with server pepper + constant-time comparison
      const SERVER_PEPPER = process.env.API_KEY_PEPPER || (() => {
        const isDev = process.env.NODE_ENV === 'development';
        if (!isDev) {
          throw new Error('CRITICAL: API_KEY_PEPPER environment variable is required for production security');
        }
        return 'dev-fallback-pepper-not-for-production-2024';
      })();
      const providedKeyHash = crypto.createHmac('sha256', SERVER_PEPPER).update(fullKey).digest('hex');
      
      let validApiKey: ApiKey | undefined;
      for (const candidate of candidateKeys) {
        // Constant-time comparison to prevent timing attacks
        if (constantTimeCompare(providedKeyHash, candidate.keyHash)) {
          validApiKey = candidate;
          break;
        }
      }
      
      // ENTERPRISE SECURITY: Enforce strict validation - active and not expired
      if (!validApiKey) {
        return undefined;
      }
      
      if (!validApiKey.isActive) {
        console.warn(`Attempt to use revoked API key: ${validApiKey.keyPrefix}`);
        return undefined;
      }
      
      if (validApiKey.expiresAt && new Date() > new Date(validApiKey.expiresAt)) {
        console.warn(`Attempt to use expired API key: ${validApiKey.keyPrefix}`);
        return undefined;
      }
      
      return validApiKey;
    } catch (error) {
      console.error('Error validating API key:', error);
      return undefined;
    }
  }

  async updateApiKeyUsage(apiKeyId: number): Promise<void> {
    try {
      await db
        .update(apiKeys)
        .set({
          usageCount: sql`${apiKeys.usageCount} + 1`,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, apiKeyId));
    } catch (error) {
      console.error('Error updating API key usage:', error);
    }
  }

  async revokeApiKey(id: number, userId: string): Promise<boolean> {
    try {
      const [updatedKey] = await db
        .update(apiKeys)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, id) && eq(apiKeys.userId, userId))
        .returning();
      
      return !!updatedKey;
    } catch (error) {
      console.error('Error revoking API key:', error);
      return false;
    }
  }

  async trackApiKeyUsage(usage: InsertApiKeyUsage): Promise<ApiKeyUsage> {
    try {
      const [newUsage] = await db
        .insert(apiKeyUsage)
        .values(usage)
        .returning();
      return newUsage;
    } catch (error) {
      console.error('Error tracking API key usage:', error);
      throw error;
    }
  }

  async getApiKeyUsage(apiKeyId: number, limit: number = 100): Promise<ApiKeyUsage[]> {
    try {
      return await db
        .select()
        .from(apiKeyUsage)
        .where(eq(apiKeyUsage.apiKeyId, apiKeyId))
        .orderBy(desc(apiKeyUsage.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting API key usage:', error);
      return [];
    }
  }

  // Historical Volume Data Implementation
  async createHistoricalVolumeData(data: InsertHistoricalVolumeData): Promise<HistoricalVolumeData> {
    const [created] = await db.insert(historicalVolumeData).values(data).returning();
    return created;
  }

  async getHistoricalVolumeData(assetId: number, days: number = 30): Promise<HistoricalVolumeData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db
      .select()
      .from(historicalVolumeData)
      .where(
        sql`${historicalVolumeData.assetId} = ${assetId} AND ${historicalVolumeData.timestamp} >= ${cutoffDate}`
      )
      .orderBy(desc(historicalVolumeData.timestamp));
  }

  async getHistoricalVolumeDataBySymbol(symbol: string, days: number = 30): Promise<HistoricalVolumeData[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db
      .select()
      .from(historicalVolumeData)
      .where(
        sql`${historicalVolumeData.assetSymbol} = ${symbol} AND ${historicalVolumeData.timestamp} >= ${cutoffDate}`
      )
      .orderBy(desc(historicalVolumeData.timestamp));
  }

  async cleanupOldHistoricalData(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await db
      .delete(historicalVolumeData)
      .where(sql`${historicalVolumeData.timestamp} < ${cutoffDate}`);
    
    return result.rowCount || 0;
  }

  // Comprehensive Market Sentiment Implementation
  async createMarketSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment> {
    const [result] = await db.insert(marketSentiment).values(sentiment).returning();
    return result;
  }

  async getMarketSentiment(assetId: number, hours: number = 24): Promise<MarketSentiment[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db.select().from(marketSentiment)
      .where(eq(marketSentiment.assetId, assetId))
      .where(gte(marketSentiment.timestamp, hoursAgo))
      .orderBy(desc(marketSentiment.timestamp));
  }

  async getOverallMarketSentiment(): Promise<MarketSentiment[]> {
    const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await db.select().from(marketSentiment)
      .where(gte(marketSentiment.timestamp, hoursAgo))
      .orderBy(desc(marketSentiment.timestamp))
      .limit(100);
  }

  // Portfolio Management Implementation
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [result] = await db.insert(portfolios).values(portfolio).returning();
    return result;
  }

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.updatedAt));
  }

  async updatePortfolio(id: number, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [result] = await db.update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return result;
  }

  async deletePortfolio(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(portfolios)
      .where(eq(portfolios.id, id))
      .where(eq(portfolios.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  // Risk Management Implementation
  async createRiskMetrics(metrics: InsertRiskMetrics): Promise<RiskMetrics> {
    const [result] = await db.insert(riskMetrics).values(metrics).returning();
    return result;
  }

  async getPortfolioRiskMetrics(portfolioId: number, days: number = 30): Promise<RiskMetrics[]> {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db.select().from(riskMetrics)
      .where(eq(riskMetrics.portfolioId, portfolioId))
      .where(gte(riskMetrics.timestamp, daysAgo))
      .orderBy(desc(riskMetrics.timestamp));
  }

  async getLatestRiskMetrics(portfolioId: number): Promise<RiskMetrics | undefined> {
    const results = await db.select().from(riskMetrics)
      .where(eq(riskMetrics.portfolioId, portfolioId))
      .orderBy(desc(riskMetrics.timestamp))
      .limit(1);
    return results[0];
  }

  // Trading Signals Implementation
  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [result] = await db.insert(tradingSignals).values(signal).returning();
    return result;
  }

  async getActiveTradingSignals(assetId?: number): Promise<TradingSignal[]> {
    let query = db.select().from(tradingSignals)
      .where(eq(tradingSignals.isActive, true))
      .orderBy(desc(tradingSignals.confidence));
    
    if (assetId) {
      query = query.where(eq(tradingSignals.assetId, assetId));
    }
    
    return await query;
  }

  async getSignalPerformance(modelName: string, days: number = 30): Promise<TradingSignal[]> {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db.select().from(tradingSignals)
      .where(eq(tradingSignals.aiModel, modelName))
      .where(gte(tradingSignals.triggeredAt, daysAgo))
      .orderBy(desc(tradingSignals.triggeredAt));
  }

  async updateSignalPerformance(id: number, accuracy: number): Promise<void> {
    await db.update(tradingSignals)
      .set({ accuracy, isActive: false })
      .where(eq(tradingSignals.id, id));
  }

  // Advanced Alerts Implementation
  async createAdvancedAlert(alert: InsertAdvancedAlert): Promise<AdvancedAlert> {
    const [result] = await db.insert(advancedAlerts).values(alert).returning();
    return result;
  }

  async getUserAlerts(userId: string): Promise<AdvancedAlert[]> {
    return await db.select().from(advancedAlerts)
      .where(eq(advancedAlerts.userId, userId))
      .orderBy(desc(advancedAlerts.createdAt));
  }

  async updateAlert(id: number, updates: Partial<InsertAdvancedAlert>): Promise<AdvancedAlert> {
    const [result] = await db.update(advancedAlerts)
      .set(updates)
      .where(eq(advancedAlerts.id, id))
      .returning();
    return result;
  }

  async deleteAdvancedAlert(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(advancedAlerts)
      .where(eq(advancedAlerts.id, id))
      .where(eq(advancedAlerts.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  async updateAlertTriggerCount(id: number): Promise<void> {
    await db.update(advancedAlerts)
      .set({ 
        triggeredCount: sql`${advancedAlerts.triggeredCount} + 1`,
        lastTriggered: new Date()
      })
      .where(eq(advancedAlerts.id, id));
  }

  // Backtesting Implementation
  async createBacktestResult(result: InsertBacktestResult): Promise<BacktestResult> {
    const [backtest] = await db.insert(backtestResults).values(result).returning();
    return backtest;
  }

  async getUserBacktests(userId: string): Promise<BacktestResult[]> {
    return await db.select().from(backtestResults)
      .where(eq(backtestResults.userId, userId))
      .orderBy(desc(backtestResults.createdAt));
  }

  async getBacktestResult(id: number, userId: string): Promise<BacktestResult | undefined> {
    const results = await db.select().from(backtestResults)
      .where(eq(backtestResults.id, id))
      .where(eq(backtestResults.userId, userId))
      .limit(1);
    return results[0];
  }

  async deleteBacktestResult(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(backtestResults)
      .where(eq(backtestResults.id, id))
      .where(eq(backtestResults.userId, userId));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();