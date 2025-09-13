export interface CryptoAsset {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap?: number;
  volume24h?: number;
  change24h: number;
  sssScore: number;
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  historicalVolatility: number;
  lastUpdated: Date | string;
  isWatchlisted: boolean;
}

export interface Alert {
  id: number;
  assetId?: number;
  threshold: number;
  isActive: boolean;
  alertType: string;
  createdAt: Date | string;
}

export interface VelocityDataPoint {
  id: number;
  assetId?: number;
  timestamp: Date | string;
  velocity: number;
  historicalAverage: number;
  anomalyScore: number;
}

export interface SSSScorebBreakdown {
  behavioralActivity: number;
  velocityAnomaly: number;
  communityCohesion: number;
  anchorPressure: number;
  hypeToHoldRatio: number;
  historicalVolatility: number;
  totalScore: number;
}

export interface DashboardModule {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

export interface WebSocketMessage {
  type: 'asset_update' | 'bulk_update' | 'crypto_update' | 'alert_triggered';
  data: any;
  timestamp?: string;
}
