import { CryptoAsset, VelocityDataPoint } from '@/types/crypto';

/**
 * Generate mock velocity data points for charts
 */
export function generateVelocityData(assetId: number, hours: number = 24): VelocityDataPoint[] {
  const data: VelocityDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const baseVelocity = 1.0 + (Math.sin(i * 0.1) * 0.3);
    const noise = (Math.random() - 0.5) * 0.4;
    const velocity = Math.max(0.1, baseVelocity + noise);
    
    data.push({
      id: i + 1,
      assetId,
      timestamp,
      velocity,
      historicalAverage: 1.0,
      anomalyScore: Math.abs(velocity - 1.0) / 0.3,
    });
  }
  
  return data;
}

/**
 * Generate random price history for sparkline charts
 */
export function generatePriceHistory(basePrice: number, points: number = 20): number[] {
  const prices: number[] = [basePrice];
  
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * 0.05; // ±2.5% change
    const newPrice = prices[i - 1] * (1 + change);
    prices.push(newPrice);
  }
  
  return prices;
}

/**
 * Simulate real-time price updates
 */
export function simulatePriceUpdate(currentPrice: number): number {
  const change = (Math.random() - 0.5) * 0.02; // ±1% change
  return currentPrice * (1 + change);
}

/**
 * Generate mock social sentiment data
 */
export function generateSentimentData() {
  return {
    telegram: Math.round(Math.random() * 100),
    discord: Math.round(Math.random() * 100),
    twitter: Math.round(Math.random() * 100),
    reddit: Math.round(Math.random() * 100),
  };
}

/**
 * Generate mock whale wallet activity
 */
export function generateWhaleActivity() {
  const activities = ['accumulating', 'holding', 'distributing', 'inactive'];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  const confidence = Math.round(Math.random() * 40 + 60); // 60-100%
  
  return {
    activity,
    confidence,
    walletsTracked: Math.floor(Math.random() * 50 + 10),
    totalValue: Math.floor(Math.random() * 1000000000 + 100000000), // $100M - $1B
  };
}

/**
 * Generate mock anchor pressure data
 */
export function generateAnchorPressureData() {
  return {
    supply90Days: Math.round(Math.random() * 30 + 60), // 60-90%
    supply180Days: Math.round(Math.random() * 20 + 50), // 50-70%
    supply365Days: Math.round(Math.random() * 15 + 40), // 40-55%
    avgHoldTime: Math.round(Math.random() * 200 + 100), // 100-300 days
  };
}

/**
 * Generate time series data for various metrics
 */
export function generateMetricTimeSeries(metric: string, points: number = 24): Array<{
  timestamp: Date;
  value: number;
}> {
  const data = [];
  const now = new Date();
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    let value: number;
    
    switch (metric) {
      case 'velocity':
        value = 1.0 + Math.sin(i * 0.2) * 0.5 + (Math.random() - 0.5) * 0.3;
        break;
      case 'sentiment':
        value = 70 + Math.sin(i * 0.15) * 15 + (Math.random() - 0.5) * 10;
        break;
      case 'activity':
        value = 50 + Math.sin(i * 0.1) * 20 + (Math.random() - 0.5) * 15;
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      timestamp,
      value: Math.max(0, value),
    });
  }
  
  return data;
}
