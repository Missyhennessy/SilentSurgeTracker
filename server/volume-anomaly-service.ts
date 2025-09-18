import { CryptoAsset, VolumeAnomaly, InsertVolumeAnomaly, VolumePattern, InsertVolumePattern, VolumeModelPerformance } from "../shared/schema";

// Statistical analysis utilities
class VolumeStatistics {
  static calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  static calculateIQR(values: number[]): { q1: number; q3: number; iqr: number } {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.quartile(sorted, 0.25);
    const q3 = this.quartile(sorted, 0.75);
    return { q1, q3, iqr: q3 - q1 };
  }

  private static quartile(sorted: number[], q: number): number {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }

  static calculateMovingAverage(values: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
    return result;
  }

  static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

// AI-powered anomaly detection algorithms
export class VolumeAnomalyDetector {
  private readonly ANOMALY_THRESHOLDS = {
    zScore: { low: 1.5, medium: 2.0, high: 2.5, critical: 3.0 },
    iqrMultiplier: { low: 1.5, medium: 2.0, high: 2.5, critical: 3.0 },
    percentageChange: { low: 50, medium: 100, high: 200, critical: 500 }
  };

  async detectZScoreAnomalies(assets: CryptoAsset[]): Promise<VolumeAnomaly[]> {
    const anomalies: VolumeAnomaly[] = [];
    
    for (const asset of assets) {
      if (!asset.volume24h) continue;
      
      // Get historical volume data (simulate with random data for now)
      const historicalVolumes = this.generateHistoricalVolumes(asset.volume24h);
      const mean = historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length;
      const stdDev = VolumeStatistics.calculateVolatility(historicalVolumes);
      
      const zScore = VolumeStatistics.calculateZScore(asset.volume24h, mean, stdDev);
      const percentageChange = ((asset.volume24h - mean) / mean) * 100;
      
      if (Math.abs(zScore) >= this.ANOMALY_THRESHOLDS.zScore.low) {
        const severity = this.determineSeverity(Math.abs(zScore), 'zScore');
        const anomalyType = this.determineAnomalyType(asset.volume24h, mean);
        
        const anomaly: VolumeAnomaly = {
          id: 0, // Will be set by database
          assetId: asset.id,
          assetSymbol: asset.symbol,
          timestamp: new Date(),
          currentVolume: asset.volume24h,
          historicalAverage: mean,
          percentageChange,
          zScore,
          anomalyScore: this.calculateAnomalyScore(zScore, percentageChange),
          anomalyType,
          severity,
          detectionMethod: 'zscore',
          priceCorrelation: this.calculatePriceCorrelation(asset),
          marketCapImpact: this.calculateMarketCapImpact(asset, percentageChange),
          exchangeBreakdown: this.generateExchangeBreakdown(asset.volume24h),
          timeframe: '24h',
          isConfirmed: false,
          alertTriggered: false,
          sssImpact: this.calculateSSImpact(asset, zScore),
          volumePattern: this.analyzeVolumePattern(historicalVolumes, asset.volume24h),
          metadata: {
            news: [],
            social_sentiment: Math.random() * 100,
            whale_activity: Math.abs(zScore) > 2.5,
            exchange_listings: [],
            technical_indicators: {
              rsi: Math.random() * 100,
              macd: (Math.random() - 0.5) * 10,
              bb_position: Math.random()
            }
          }
        };
        
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }

  async detectIQRAnomalies(assets: CryptoAsset[]): Promise<VolumeAnomaly[]> {
    const anomalies: VolumeAnomaly[] = [];
    
    for (const asset of assets) {
      if (!asset.volume24h) continue;
      
      const historicalVolumes = this.generateHistoricalVolumes(asset.volume24h);
      const { q1, q3, iqr } = VolumeStatistics.calculateIQR(historicalVolumes);
      
      const lowerBound = q1 - (1.5 * iqr);
      const upperBound = q3 + (1.5 * iqr);
      
      if (asset.volume24h < lowerBound || asset.volume24h > upperBound) {
        const mean = (q1 + q3) / 2;
        const percentageChange = ((asset.volume24h - mean) / mean) * 100;
        const deviation = asset.volume24h > upperBound ? 
          (asset.volume24h - upperBound) / iqr : 
          (lowerBound - asset.volume24h) / iqr;
        
        const severity = this.determineSeverity(deviation, 'iqr');
        const anomalyType = this.determineAnomalyType(asset.volume24h, mean);
        
        const anomaly: VolumeAnomaly = {
          id: 0,
          assetId: asset.id,
          assetSymbol: asset.symbol,
          timestamp: new Date(),
          currentVolume: asset.volume24h,
          historicalAverage: mean,
          percentageChange,
          zScore: deviation, // Using deviation as pseudo z-score
          anomalyScore: this.calculateAnomalyScore(deviation, percentageChange),
          anomalyType,
          severity,
          detectionMethod: 'iqr',
          priceCorrelation: this.calculatePriceCorrelation(asset),
          marketCapImpact: this.calculateMarketCapImpact(asset, percentageChange),
          exchangeBreakdown: this.generateExchangeBreakdown(asset.volume24h),
          timeframe: '24h',
          isConfirmed: false,
          alertTriggered: false,
          sssImpact: this.calculateSSImpact(asset, deviation),
          volumePattern: this.analyzeVolumePattern(historicalVolumes, asset.volume24h),
          metadata: {
            social_sentiment: Math.random() * 100,
            whale_activity: deviation > 2.5,
            technical_indicators: {
              rsi: Math.random() * 100,
              volume_sma: mean,
              volume_ema: mean * 1.1
            }
          }
        };
        
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }

  async detectMLAnomalies(assets: CryptoAsset[]): Promise<VolumeAnomaly[]> {
    // Simulated ML-based ensemble detection
    const anomalies: VolumeAnomaly[] = [];
    
    for (const asset of assets) {
      if (!asset.volume24h) continue;
      
      const historicalVolumes = this.generateHistoricalVolumes(asset.volume24h);
      const features = this.extractMLFeatures(asset, historicalVolumes);
      
      // Simulated ML prediction (would use actual ML model in production)
      const anomalyProbability = this.simulateMLPrediction(features);
      
      if (anomalyProbability > 0.7) {
        const mean = historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length;
        const percentageChange = ((asset.volume24h - mean) / mean) * 100;
        
        const anomaly: VolumeAnomaly = {
          id: 0,
          assetId: asset.id,
          assetSymbol: asset.symbol,
          timestamp: new Date(),
          currentVolume: asset.volume24h,
          historicalAverage: mean,
          percentageChange,
          zScore: 0, // ML doesn't use traditional z-score
          anomalyScore: anomalyProbability * 100,
          anomalyType: this.determineAnomalyType(asset.volume24h, mean),
          severity: anomalyProbability > 0.95 ? 'critical' : 
                   anomalyProbability > 0.85 ? 'high' : 
                   anomalyProbability > 0.75 ? 'medium' : 'low',
          detectionMethod: 'ml_ensemble',
          priceCorrelation: this.calculatePriceCorrelation(asset),
          marketCapImpact: this.calculateMarketCapImpact(asset, percentageChange),
          exchangeBreakdown: this.generateExchangeBreakdown(asset.volume24h),
          timeframe: '24h',
          isConfirmed: false,
          alertTriggered: false,
          sssImpact: this.calculateSSImpact(asset, anomalyProbability * 3),
          volumePattern: this.analyzeVolumePattern(historicalVolumes, asset.volume24h),
          metadata: {
            social_sentiment: Math.random() * 100,
            whale_activity: anomalyProbability > 0.9,
            technical_indicators: features.technicalIndicators
          }
        };
        
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }

  async detectVolumePatterns(assets: CryptoAsset[]): Promise<VolumePattern[]> {
    const patterns: VolumePattern[] = [];
    
    for (const asset of assets) {
      if (!asset.volume24h) continue;
      
      const historicalVolumes = this.generateHistoricalVolumes(asset.volume24h);
      const pattern = this.identifyVolumePattern(historicalVolumes, asset);
      
      if (pattern) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }

  private generateHistoricalVolumes(currentVolume: number): number[] {
    // Simulate 30 days of historical volume data
    const volumes: number[] = [];
    const baseVolume = currentVolume * (0.7 + Math.random() * 0.6);
    
    for (let i = 0; i < 30; i++) {
      const randomFactor = 0.5 + Math.random() * 1.5;
      volumes.push(baseVolume * randomFactor);
    }
    
    return volumes;
  }

  private determineSeverity(value: number, method: 'zScore' | 'iqr'): 'low' | 'medium' | 'high' | 'critical' {
    const thresholds = this.ANOMALY_THRESHOLDS[method === 'zScore' ? 'zScore' : 'iqrMultiplier'];
    
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.high) return 'high';
    if (value >= thresholds.medium) return 'medium';
    return 'low';
  }

  private determineAnomalyType(currentVolume: number, historicalAverage: number): 'spike' | 'drop' | 'sustained_high' | 'sustained_low' {
    const ratio = currentVolume / historicalAverage;
    
    if (ratio > 2) return 'spike';
    if (ratio < 0.5) return 'drop';
    if (ratio > 1.5) return 'sustained_high';
    return 'sustained_low';
  }

  private calculateAnomalyScore(zScore: number, percentageChange: number): number {
    const zScoreComponent = Math.min(Math.abs(zScore) * 20, 60);
    const changeComponent = Math.min(Math.abs(percentageChange) * 0.2, 40);
    return Math.min(zScoreComponent + changeComponent, 100);
  }

  private calculatePriceCorrelation(asset: CryptoAsset): number {
    // Simulate price-volume correlation (would use actual price data in production)
    return -1 + Math.random() * 2; // Random correlation between -1 and 1
  }

  private calculateMarketCapImpact(asset: CryptoAsset, percentageChange: number): number {
    if (!asset.marketCap) return 0;
    return (asset.marketCap * percentageChange) / 10000; // Simplified impact calculation
  }

  private calculateSSImpact(asset: CryptoAsset, anomalyStrength: number): number {
    // Simulate SSS score impact based on volume anomaly
    return anomalyStrength * 5; // Simplified calculation
  }

  private generateExchangeBreakdown(totalVolume: number): Record<string, number> {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Huobi'];
    const breakdown: Record<string, number> = {};
    let remaining = totalVolume;
    
    exchanges.forEach((exchange, index) => {
      if (index === exchanges.length - 1) {
        breakdown[exchange] = remaining;
      } else {
        const portion = remaining * (0.1 + Math.random() * 0.3);
        breakdown[exchange] = portion;
        remaining -= portion;
      }
    });
    
    return breakdown;
  }

  private analyzeVolumePattern(historicalVolumes: number[], currentVolume: number): {
    trend: 'increasing' | 'decreasing' | 'volatile' | 'stable';
    momentum: number;
    acceleration: number;
    volatility: number;
  } {
    const recentVolumes = historicalVolumes.slice(-7); // Last 7 days
    const trend = this.calculateTrend(recentVolumes);
    const momentum = this.calculateMomentum(recentVolumes, currentVolume);
    const acceleration = this.calculateAcceleration(recentVolumes);
    const volatility = VolumeStatistics.calculateVolatility(recentVolumes);
    
    const trendType: 'increasing' | 'decreasing' | 'volatile' | 'stable' = 
      trend > 0.1 ? 'increasing' : 
      trend < -0.1 ? 'decreasing' : 
      volatility > 0.5 ? 'volatile' : 'stable';
    
    return {
      trend: trendType,
      momentum,
      acceleration,
      volatility
    };
  }

  private calculateTrend(volumes: number[]): number {
    if (volumes.length < 2) return 0;
    const first = volumes[0];
    const last = volumes[volumes.length - 1];
    return (last - first) / first;
  }

  private calculateMomentum(volumes: number[], currentVolume: number): number {
    const avgHistorical = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    return (currentVolume - avgHistorical) / avgHistorical;
  }

  private calculateAcceleration(volumes: number[]): number {
    if (volumes.length < 3) return 0;
    const recent = volumes.slice(-3);
    const changes = [];
    for (let i = 1; i < recent.length; i++) {
      changes.push((recent[i] - recent[i-1]) / recent[i-1]);
    }
    return changes[changes.length - 1] - changes[0];
  }

  private extractMLFeatures(asset: CryptoAsset, historicalVolumes: number[]) {
    const movingAverage = VolumeStatistics.calculateMovingAverage(historicalVolumes, 7);
    const volatility = VolumeStatistics.calculateVolatility(historicalVolumes);
    
    return {
      currentVolume: asset.volume24h || 0,
      avgVolume: historicalVolumes.reduce((a, b) => a + b, 0) / historicalVolumes.length,
      volatility,
      priceChange: asset.change24h || 0,
      marketCap: asset.marketCap || 0,
      sssScore: asset.sssScore || 0,
      movingAverageRatio: asset.volume24h ? (asset.volume24h / (movingAverage[movingAverage.length - 1] || 1)) : 1,
      technicalIndicators: {
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 10,
        volume_sma: movingAverage[movingAverage.length - 1] || 0,
        price_volume_trend: Math.random() * 100
      }
    };
  }

  private simulateMLPrediction(features: any): number {
    // Simulate ML model prediction based on features
    let score = 0;
    
    // Volume ratio factor
    if (features.movingAverageRatio > 2) score += 0.3;
    if (features.movingAverageRatio < 0.5) score += 0.2;
    
    // Volatility factor
    if (features.volatility > 0.8) score += 0.2;
    
    // Price correlation factor
    if (Math.abs(features.priceChange) > 20) score += 0.15;
    
    // SSS correlation factor
    if (features.sssScore > 200) score += 0.15;
    
    // Add some randomness to simulate model uncertainty
    score += (Math.random() - 0.5) * 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  private identifyVolumePattern(historicalVolumes: number[], asset: CryptoAsset): VolumePattern | null {
    const pattern = this.analyzeVolumePattern(historicalVolumes, asset.volume24h || 0);
    
    // Only create pattern if it's significant enough
    if (Math.abs(pattern.momentum) > 0.2 || pattern.volatility > 0.5) {
      return {
        id: 0,
        assetId: asset.id,
        patternType: pattern.trend === 'increasing' && pattern.momentum > 0.5 ? 'accumulation' :
                     pattern.trend === 'decreasing' && pattern.momentum < -0.5 ? 'distribution' :
                     pattern.volatility > 0.8 ? 'breakout' : 'reversal',
        confidence: Math.min(Math.abs(pattern.momentum) + pattern.volatility, 1),
        duration: 24, // 24 hours for current analysis
        volumeProfile: {
          peak_times: ['09:00', '21:00'], // Simulated peak trading hours
          distribution: { morning: 0.3, afternoon: 0.2, evening: 0.5 },
          intensity: Math.abs(pattern.momentum)
        },
        priceAction: {
          support_levels: [(asset.price || 0) * 0.95],
          resistance_levels: [(asset.price || 0) * 1.05],
          breakout_probability: pattern.momentum > 0.3 ? 0.7 : 0.3
        },
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endedAt: null,
        isActive: true,
        accuracy: 0.75 + Math.random() * 0.2 // Simulated historical accuracy
      };
    }
    
    return null;
  }
}

// Volume Anomaly Service
export class VolumeAnomalyService {
  private detector = new VolumeAnomalyDetector();
  private anomalies: VolumeAnomaly[] = [];
  private patterns: VolumePattern[] = [];
  private modelPerformance: VolumeModelPerformance[] = [];

  async detectAnomalies(assets: CryptoAsset[]): Promise<{
    anomalies: VolumeAnomaly[];
    patterns: VolumePattern[];
    summary: {
      totalAnomalies: number;
      severityBreakdown: Record<string, number>;
      methodBreakdown: Record<string, number>;
      topAnomalies: VolumeAnomaly[];
    };
  }> {
    console.log(`🔍 Analyzing volume anomalies for ${assets.length} assets...`);
    
    // Run all detection methods in parallel
    const [zScoreAnomalies, iqrAnomalies, mlAnomalies, patterns] = await Promise.all([
      this.detector.detectZScoreAnomalies(assets),
      this.detector.detectIQRAnomalies(assets),
      this.detector.detectMLAnomalies(assets),
      this.detector.detectVolumePatterns(assets)
    ]);
    
    // Combine and deduplicate anomalies
    const allAnomalies = [...zScoreAnomalies, ...iqrAnomalies, ...mlAnomalies];
    const uniqueAnomalies = this.deduplicateAnomalies(allAnomalies);
    
    // Store results
    this.anomalies = uniqueAnomalies;
    this.patterns = patterns;
    
    // Generate summary
    const summary = this.generateSummary(uniqueAnomalies);
    
    console.log(`✅ Volume analysis complete: ${uniqueAnomalies.length} anomalies, ${patterns.length} patterns detected`);
    
    return {
      anomalies: uniqueAnomalies,
      patterns,
      summary
    };
  }

  async getAnomaliesByAsset(assetId: number): Promise<VolumeAnomaly[]> {
    return this.anomalies.filter(anomaly => anomaly.assetId === assetId);
  }

  async getPatternsByAsset(assetId: number): Promise<VolumePattern[]> {
    return this.patterns.filter(pattern => pattern.assetId === assetId);
  }

  async getAnomaliesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Promise<VolumeAnomaly[]> {
    return this.anomalies.filter(anomaly => anomaly.severity === severity);
  }

  async getModelPerformanceMetrics(): Promise<VolumeModelPerformance[]> {
    // Simulate model performance data
    if (this.modelPerformance.length === 0) {
      this.modelPerformance = [
        {
          id: 1,
          modelName: 'Z-Score Detector',
          modelVersion: '1.0.0',
          testPeriod: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            sample_size: 10000
          },
          metrics: {
            accuracy: 0.847,
            precision: 0.823,
            recall: 0.891,
            f1_score: 0.856,
            false_positive_rate: 0.089,
            auc_roc: 0.923
          },
          anomalyTypeAccuracy: {
            spike: 0.912,
            drop: 0.834,
            sustained_high: 0.798,
            sustained_low: 0.756
          },
          lastEvaluatedAt: new Date(),
          isActive: true
        },
        {
          id: 2,
          modelName: 'ML Ensemble',
          modelVersion: '2.1.0',
          testPeriod: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            sample_size: 15000
          },
          metrics: {
            accuracy: 0.913,
            precision: 0.889,
            recall: 0.934,
            f1_score: 0.911,
            false_positive_rate: 0.067,
            auc_roc: 0.956
          },
          anomalyTypeAccuracy: {
            spike: 0.945,
            drop: 0.901,
            sustained_high: 0.887,
            sustained_low: 0.823
          },
          lastEvaluatedAt: new Date(),
          isActive: true
        }
      ];
    }
    
    return this.modelPerformance;
  }

  private deduplicateAnomalies(anomalies: VolumeAnomaly[]): VolumeAnomaly[] {
    const uniqueMap = new Map<string, VolumeAnomaly>();
    
    anomalies.forEach(anomaly => {
      const key = `${anomaly.assetId}-${anomaly.timeframe}`;
      const existing = uniqueMap.get(key);
      
      if (!existing || anomaly.anomalyScore > existing.anomalyScore) {
        uniqueMap.set(key, anomaly);
      }
    });
    
    return Array.from(uniqueMap.values());
  }

  private generateSummary(anomalies: VolumeAnomaly[]) {
    const severityBreakdown = anomalies.reduce((acc, anomaly) => {
      acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const methodBreakdown = anomalies.reduce((acc, anomaly) => {
      acc[anomaly.detectionMethod] = (acc[anomaly.detectionMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAnomalies = anomalies
      .sort((a, b) => b.anomalyScore - a.anomalyScore)
      .slice(0, 10);
    
    return {
      totalAnomalies: anomalies.length,
      severityBreakdown,
      methodBreakdown,
      topAnomalies
    };
  }
}

// Export singleton instance
export const volumeAnomalyService = new VolumeAnomalyService();