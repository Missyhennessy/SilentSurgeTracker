import { db } from "./db";
import { cryptoAssets, velocityData } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

interface CryptoAsset {
  id: number;
  symbol: string;
  name: string;
  price: number;
  sssScore: number;
  behavioralActivity?: number;
  tokenVelocity?: number;
  communityCohesion?: number;
  anchorPressure?: number;
  hypeToHoldRatio?: number;
  updatedAt: Date;
}

// ML Feature Engineering
interface MLFeatures {
  // Technical indicators
  priceVolatility: number;
  volumeChange: number;
  priceMovementCorrelation: number;
  
  // Behavioral features
  behavioralActivityScore: number;
  tokenVelocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  
  // Market context
  marketCapRank: number;
  socialMentions: number;
  developerActivity: number;
  
  // Time-based features
  hourOfDay: number;
  dayOfWeek: number;
  timeToEvent: number; // Days to significant market events
  
  // Cross-asset correlations
  btcCorrelation: number;
  ethCorrelation: number;
  marketCorrelation: number;
}

interface TrainingData {
  features: MLFeatures;
  actualOutcome: number; // Price change over next 24h/7d
  timestamp: Date;
  assetSymbol: string;
}

class MLScoreOptimizer {
  private models: Map<string, any> = new Map();
  private trainingData: TrainingData[] = [];
  private featureWeights: Map<string, number> = new Map();
  
  constructor() {
    this.initializeFeatureWeights();
  }

  private initializeFeatureWeights() {
    // Initial feature weights based on SSS methodology
    this.featureWeights.set('behavioralActivityScore', 0.20);
    this.featureWeights.set('tokenVelocityAnomaly', 0.20);
    this.featureWeights.set('communityCohesion', 0.20);
    this.featureWeights.set('anchorPressure', 0.25);
    this.featureWeights.set('hypeToHoldRatio', 0.10);
    this.featureWeights.set('priceVolatility', 0.05);
    
    // Additional ML-optimized weights
    this.featureWeights.set('volumeChange', 0.15);
    this.featureWeights.set('socialMentions', 0.08);
    this.featureWeights.set('developerActivity', 0.12);
    this.featureWeights.set('marketCorrelation', 0.10);
  }

  async extractFeatures(asset: CryptoAsset): Promise<MLFeatures> {
    const now = new Date();
    const historicalData = await this.getHistoricalData(asset.symbol, 30); // 30 days
    
    return {
      // Technical indicators
      priceVolatility: this.calculateVolatility(historicalData),
      volumeChange: this.calculateVolumeChange(historicalData),
      priceMovementCorrelation: this.calculatePriceCorrelation(historicalData),
      
      // Current SSS components
      behavioralActivityScore: asset.behavioralActivity || 0,
      tokenVelocityAnomaly: asset.tokenVelocity || 0,
      communityCohesion: asset.communityCohesion || 0,
      anchorPressure: asset.anchorPressure || 0,
      hypeToHoldRatio: asset.hypeToHoldRatio || 0,
      
      // Market context
      marketCapRank: this.estimateMarketCapRank(asset.price),
      socialMentions: this.estimateSocialMentions(asset.symbol),
      developerActivity: this.estimateDeveloperActivity(asset.symbol),
      
      // Time-based features
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      timeToEvent: this.calculateTimeToEvent(),
      
      // Cross-asset correlations
      btcCorrelation: await this.calculateAssetCorrelation(asset.symbol, 'BTC'),
      ethCorrelation: await this.calculateAssetCorrelation(asset.symbol, 'ETH'),
      marketCorrelation: await this.calculateMarketCorrelation(asset.symbol),
    };
  }

  private async getHistoricalData(symbol: string, days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db
      .select()
      .from(velocityData)
      .where(eq(velocityData.assetSymbol, symbol))
      .orderBy(desc(velocityData.timestamp))
      .limit(days * 24); // Hourly data
  }

  private calculateVolatility(data: any[]): number {
    if (data.length < 2) return 0;
    
    const returns = data.slice(1).map((curr, i) => {
      const prev = data[i];
      return Math.log(curr.velocity / prev.velocity);
    });
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(365) * 100; // Annualized volatility
  }

  private calculateVolumeChange(data: any[]): number {
    if (data.length < 2) return 0;
    
    const recent = data.slice(0, 7).reduce((sum, d) => sum + d.velocity, 0) / 7;
    const baseline = data.slice(7, 14).reduce((sum, d) => sum + d.velocity, 0) / 7;
    
    return baseline > 0 ? ((recent - baseline) / baseline) * 100 : 0;
  }

  private calculatePriceCorrelation(data: any[]): number {
    // Simplified correlation calculation
    if (data.length < 10) return 0;
    
    const velocities = data.map(d => d.velocity);
    const prices = data.map(d => d.velocity * Math.random() * 100); // Simulated price data
    
    return this.correlation(velocities, prices);
  }

  private correlation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator !== 0 ? numerator / denominator : 0;
  }

  private estimateMarketCapRank(price: number): number {
    // Estimate based on price (simplified)
    if (price > 50000) return 1; // BTC range
    if (price > 3000) return 2;  // ETH range
    if (price > 100) return 3;   // High-cap alts
    if (price > 10) return 10;   // Mid-cap
    return 50; // Lower cap
  }

  private estimateSocialMentions(symbol: string): number {
    // Simulate social media mentions based on symbol popularity
    const popularSymbols = ['BTC', 'ETH', 'SOL', 'ADA'];
    if (popularSymbols.includes(symbol)) {
      return 80 + Math.random() * 20;
    }
    return 20 + Math.random() * 40;
  }

  private estimateDeveloperActivity(symbol: string): number {
    // Simulate GitHub/development activity
    const activeProjects = ['ETH', 'SOL', 'DOT', 'LINK'];
    if (activeProjects.includes(symbol)) {
      return 70 + Math.random() * 30;
    }
    return 30 + Math.random() * 50;
  }

  private calculateTimeToEvent(): number {
    // Days to next significant market event (halving, major updates, etc.)
    return 30 + Math.random() * 300; // Random for simulation
  }

  private async calculateAssetCorrelation(symbol1: string, symbol2: string): Promise<number> {
    if (symbol1 === symbol2) return 1.0;
    
    const data1 = await this.getHistoricalData(symbol1, 30);
    const data2 = await this.getHistoricalData(symbol2, 30);
    
    if (data1.length === 0 || data2.length === 0) return 0;
    
    const velocities1 = data1.map(d => d.velocity);
    const velocities2 = data2.map(d => d.velocity);
    
    return this.correlation(velocities1, velocities2);
  }

  private async calculateMarketCorrelation(symbol: string): Promise<number> {
    // Correlation with overall market (average of major assets)
    const btcCorr = await this.calculateAssetCorrelation(symbol, 'BTC');
    const ethCorr = await this.calculateAssetCorrelation(symbol, 'ETH');
    
    return (btcCorr + ethCorr) / 2;
  }

  // Machine Learning Model Training
  async trainModel(symbol: string): Promise<void> {
    const trainingData = await this.prepareTrainingData(symbol);
    
    if (trainingData.length < 50) {
      console.log(`Insufficient training data for ${symbol}: ${trainingData.length} samples`);
      return;
    }

    // Simple linear regression model
    const model = this.trainLinearRegression(trainingData);
    this.models.set(symbol, model);
    
    console.log(`Trained ML model for ${symbol} with ${trainingData.length} samples`);
  }

  private async prepareTrainingData(symbol: string): Promise<TrainingData[]> {
    const historicalAssets = await db
      .select()
      .from(cryptoAssets)
      .where(eq(cryptoAssets.symbol, symbol))
      .orderBy(desc(cryptoAssets.id))
      .limit(1000);

    const trainingData: TrainingData[] = [];

    for (const asset of historicalAssets) {
      const adaptedAsset: CryptoAsset = {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        sssScore: asset.sssScore,
        behavioralActivity: asset.behavioralActivity || undefined,
        tokenVelocity: asset.tokenVelocity || undefined,
        communityCohesion: asset.communityCohesion || undefined,
        anchorPressure: asset.anchorPressure || undefined,
        hypeToHoldRatio: asset.hypeToHoldRatio || undefined,
        updatedAt: new Date()
      };
      
      const features = await this.extractFeatures(adaptedAsset);
      
      // Calculate actual outcome (price change over next period)
      const futurePrice = await this.getFuturePrice(adaptedAsset, 24); // 24 hours ahead
      const actualOutcome = futurePrice ? ((futurePrice - adaptedAsset.price) / adaptedAsset.price) * 100 : 0;

      trainingData.push({
        features,
        actualOutcome,
        timestamp: adaptedAsset.updatedAt,
        assetSymbol: symbol
      });
    }

    return trainingData;
  }

  private async getFuturePrice(asset: CryptoAsset, hoursAhead: number): Promise<number | null> {
    // In a real implementation, this would look up actual future prices
    // For simulation, we'll use a simple price evolution model
    const volatility = 0.02; // 2% daily volatility
    const randomWalk = (Math.random() - 0.5) * volatility * (hoursAhead / 24);
    return asset.price * (1 + randomWalk);
  }

  private trainLinearRegression(data: TrainingData[]) {
    const X = data.map(d => this.featuresToArray(d.features));
    const y = data.map(d => d.actualOutcome);
    
    // Simple linear regression using normal equation
    // In production, use proper ML libraries like TensorFlow.js
    const weights = this.solveLinearRegression(X, y);
    
    return {
      weights,
      predict: (features: MLFeatures) => {
        const x = this.featuresToArray(features);
        return x.reduce((sum, val, i) => sum + val * weights[i], 0);
      },
      accuracy: this.calculateModelAccuracy(X, y, weights)
    };
  }

  private featuresToArray(features: MLFeatures): number[] {
    return [
      features.priceVolatility,
      features.volumeChange,
      features.priceMovementCorrelation,
      features.behavioralActivityScore,
      features.tokenVelocityAnomaly,
      features.communityCohesion,
      features.anchorPressure,
      features.hypeToHoldRatio,
      features.marketCapRank,
      features.socialMentions,
      features.developerActivity,
      features.hourOfDay / 24,
      features.dayOfWeek / 7,
      features.timeToEvent / 365,
      features.btcCorrelation,
      features.ethCorrelation,
      features.marketCorrelation
    ];
  }

  private solveLinearRegression(X: number[][], y: number[]): number[] {
    // Add bias term (intercept)
    const XWithBias = X.map(row => [1, ...row]);
    
    // Simple gradient descent for demonstration
    const featureCount = XWithBias[0].length;
    let weights = new Array(featureCount).fill(0);
    const learningRate = 0.01;
    const epochs = 1000;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradients = new Array(featureCount).fill(0);
      
      for (let i = 0; i < XWithBias.length; i++) {
        const prediction = XWithBias[i].reduce((sum, x, j) => sum + x * weights[j], 0);
        const error = prediction - y[i];
        
        for (let j = 0; j < featureCount; j++) {
          gradients[j] += error * XWithBias[i][j];
        }
      }
      
      for (let j = 0; j < featureCount; j++) {
        weights[j] -= learningRate * gradients[j] / XWithBias.length;
      }
    }
    
    return weights;
  }

  private calculateModelAccuracy(X: number[][], y: number[], weights: number[]): number {
    let totalError = 0;
    const XWithBias = X.map(row => [1, ...row]);
    
    for (let i = 0; i < XWithBias.length; i++) {
      const prediction = XWithBias[i].reduce((sum, x, j) => sum + x * weights[j], 0);
      const error = Math.abs(prediction - y[i]);
      totalError += error;
    }
    
    return 100 - (totalError / XWithBias.length); // Simple accuracy metric
  }

  // Enhanced SSS Calculation with ML
  async calculateOptimizedSSS(asset: CryptoAsset): Promise<number> {
    const features = await this.extractFeatures(asset);
    const model = this.models.get(asset.symbol);
    
    if (model && model.accuracy > 60) {
      // Use ML prediction if model is sufficiently accurate
      const mlPrediction = model.predict(features);
      const baseSSSScore = this.calculateBaseSSSScore(asset);
      
      // Blend traditional SSS with ML prediction
      const blendRatio = Math.min(model.accuracy / 100, 0.7); // Max 70% ML influence
      return baseSSSScore * (1 - blendRatio) + (mlPrediction + 50) * blendRatio;
    }
    
    // Fall back to traditional SSS calculation
    return this.calculateBaseSSSScore(asset);
  }

  private calculateBaseSSSScore(asset: CryptoAsset): number {
    const weights = {
      behavioralActivity: 0.20,
      tokenVelocity: 0.20,
      communityCohesion: 0.20,
      anchorPressure: 0.25,
      hypeToHoldRatio: 0.10,
      historicalVolatility: 0.05
    };

    const components = {
      behavioralActivity: asset.behavioralActivity || 50,
      tokenVelocity: asset.tokenVelocity || 50,
      communityCohesion: asset.communityCohesion || 50,
      anchorPressure: asset.anchorPressure || 50,
      hypeToHoldRatio: asset.hypeToHoldRatio || 50,
      historicalVolatility: Math.max(0, 100 - (asset.price * 0.001)) // Simplified volatility
    };

    return Object.entries(components).reduce((score, [key, value]) => {
      return score + (value * weights[key as keyof typeof weights]);
    }, 0);
  }

  // Model Performance Monitoring
  async evaluateModelPerformance(): Promise<any> {
    const performance: any = {};
    
    for (const [symbol, model] of this.models.entries()) {
      const recentData = await this.prepareTrainingData(symbol);
      const testData = recentData.slice(0, Math.min(50, recentData.length));
      
      if (testData.length > 10) {
        let correctPredictions = 0;
        
        for (const data of testData) {
          const prediction = model.predict(data.features);
          const actual = data.actualOutcome;
          
          // Count as correct if prediction direction matches actual direction
          if ((prediction > 0 && actual > 0) || (prediction < 0 && actual < 0)) {
            correctPredictions++;
          }
        }
        
        performance[symbol] = {
          accuracy: model.accuracy,
          directionAccuracy: (correctPredictions / testData.length) * 100,
          sampleSize: testData.length,
          lastUpdated: new Date()
        };
      }
    }
    
    return performance;
  }

  // Auto-retraining
  async autoRetrain(): Promise<void> {
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'AVAX', 'DOT', 'NEAR', 'ATOM', 'MATIC'];
    
    for (const symbol of symbols) {
      try {
        await this.trainModel(symbol);
      } catch (error) {
        console.error(`Failed to retrain model for ${symbol}:`, error);
      }
    }
    
    console.log('Auto-retraining completed for all models');
  }
}

export const mlOptimizer = new MLScoreOptimizer();