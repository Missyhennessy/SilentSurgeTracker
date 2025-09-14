import { CryptoAsset, SSSScorebBreakdown } from '@/types/crypto';

interface SSSWeights {
  behavioralActivity: number; // 20%
  velocityAnomaly: number;    // 20%
  communityCohesion: number;  // 20%
  anchorPressure: number;     // 25%
  hypeToHoldRatio: number;    // 10%
  historicalVolatility: number; // 5%
}

const DEFAULT_WEIGHTS: SSSWeights = {
  behavioralActivity: 0.20,
  velocityAnomaly: 0.20,
  communityCohesion: 0.20,
  anchorPressure: 0.25,
  hypeToHoldRatio: 0.10,
  historicalVolatility: 0.05,
};

/**
 * Calculate Silent Surge Score using the weighted formula
 * SSS = W1(BAM) + W2(TVA) + W3(CCI) + W4(AP) + W5(HHR) + W6(HV)
 */
export function calculateSSS(asset: CryptoAsset, weights: SSSWeights = DEFAULT_WEIGHTS): SSSScorebBreakdown {
  // Normalize scores to 0-100 scale if needed
  const normalizedScores = {
    behavioralActivity: Math.max(0, Math.min(100, asset.behavioralActivity)),
    velocityAnomaly: Math.max(0, Math.min(100, asset.velocityAnomaly)),
    communityCohesion: Math.max(0, Math.min(100, asset.communityCohesion)),
    anchorPressure: Math.max(0, Math.min(100, asset.anchorPressure)),
    hypeToHoldRatio: Math.max(0, Math.min(100, asset.hypeToHoldRatio)),
    historicalVolatility: Math.max(0, Math.min(100, asset.historicalVolatility)),
  };

  // Historical Volatility acts as a dampener - higher volatility reduces score
  const volatilityDampener = 100 - normalizedScores.historicalVolatility;

  // Calculate weighted total
  const totalScore = 
    (normalizedScores.behavioralActivity * weights.behavioralActivity) +
    (normalizedScores.velocityAnomaly * weights.velocityAnomaly) +
    (normalizedScores.communityCohesion * weights.communityCohesion) +
    (normalizedScores.anchorPressure * weights.anchorPressure) +
    (normalizedScores.hypeToHoldRatio * weights.hypeToHoldRatio) +
    (volatilityDampener * weights.historicalVolatility);

  return {
    ...normalizedScores,
    totalScore: Math.round(totalScore),
  };
}

/**
 * Get score color based on SSS value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get score badge variant
 */
export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

/**
 * Calculate anomaly detection for velocity
 */
export function calculateVelocityAnomaly(currentVelocity: number, historicalAverage: number): {
  anomalyScore: number;
  zScore: number;
  isAnomalous: boolean;
} {
  const deviation = currentVelocity - historicalAverage;
  const zScore = deviation / (historicalAverage * 0.3); // Assuming 30% standard deviation
  const anomalyScore = Math.abs(zScore);
  
  return {
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    zScore: Math.round(zScore * 100) / 100,
    isAnomalous: anomalyScore > 2.0, // 2-sigma threshold
  };
}

/**
 * Generate trend arrow based on change
 */
export function getTrendArrow(change: number): string {
  if (change > 5) return '↗️';
  if (change > 0) return '↑';
  if (change < -5) return '↘️';
  if (change < 0) return '↓';
  return '→';
}
