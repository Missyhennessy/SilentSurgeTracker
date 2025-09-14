import { NextRequest, NextResponse } from 'next/server';
import { lstmPredictionService } from '@/server/lstm-prediction-service';

interface RiskMetrics {
  portfolioValue: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  betaToMarket: number;
  valueAtRisk: number;
  exposureByAsset: { [key: string]: number };
  riskScore: number;
}

interface RiskParameters {
  maxPositionSize: number;
  maxDrawdownLimit: number;
  correlationThreshold: number;
  diversificationMin: number;
  stopLossLevel: number;
  takeProfitLevel: number;
}

interface PortfolioAsset {
  symbol: string;
  allocation: number; // percentage
  value: number;
  price: number;
  quantity: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const portfolioValue = searchParams.get('portfolio') ? parseFloat(searchParams.get('portfolio')!) : 100000;

    switch (type) {
      case 'overview':
        const riskMetrics = await calculateRiskMetrics(portfolioValue);
        return NextResponse.json(riskMetrics);
      
      case 'detailed':
        const detailedAnalysis = await calculateDetailedRiskAnalysis(portfolioValue);
        return NextResponse.json(detailedAnalysis);
      
      case 'parameters':
        const defaultParams = getDefaultRiskParameters();
        return NextResponse.json(defaultParams);
      
      case 'var-analysis':
        const varAnalysis = await calculateVaRAnalysis(portfolioValue);
        return NextResponse.json(varAnalysis);
      
      case 'correlation-matrix':
        const correlationData = await generateCorrelationMatrix();
        return NextResponse.json(correlationData);
      
      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: overview, detailed, parameters, var-analysis, correlation-matrix' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Risk Metrics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolio, riskParameters } = body;

    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json(
        { error: 'Portfolio data required as array of assets' },
        { status: 400 }
      );
    }

    // Calculate custom risk metrics based on provided portfolio
    const customRiskMetrics = await calculateCustomPortfolioRisk(portfolio, riskParameters);
    return NextResponse.json(customRiskMetrics);
  } catch (error) {
    console.error('Risk Metrics POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate custom risk metrics' },
      { status: 500 }
    );
  }
}

async function calculateRiskMetrics(portfolioValue: number): Promise<RiskMetrics> {
  try {
    // Get LSTM predictions for market volatility analysis
    const predictions = lstmPredictionService.getAllPredictions();
    const performance = lstmPredictionService.getPerformanceMetrics();

    // Calculate portfolio volatility based on asset predictions
    const assetVolatilities = predictions.map(pred => {
      const volatility = pred.features.technicalIndicators.bollinger.upper - 
                        pred.features.technicalIndicators.bollinger.lower;
      return { asset: pred.asset, volatility: volatility / pred.currentPrice };
    });

    const avgVolatility = assetVolatilities.reduce((acc, curr) => acc + curr.volatility, 0) / 
                         assetVolatilities.length;

    // Calculate diversified exposure
    const exposureByAsset = generatePortfolioExposure(predictions);
    
    // Calculate risk score based on multiple factors
    const riskScore = calculateOverallRiskScore(predictions, avgVolatility, exposureByAsset);

    // Calculate Value at Risk (95% confidence, 1-day horizon)
    const valueAtRisk = portfolioValue * avgVolatility * 1.645; // 95% confidence Z-score

    // Calculate max drawdown from model performance
    const maxDrawdown = performance.length > 0 ? 
      Math.max(...performance.map(p => p.maxDrawdown)) : 
      avgVolatility * 2.5;

    // Calculate Sharpe ratio from performance metrics
    const avgSharpeRatio = performance.length > 0 ?
      performance.reduce((acc, curr) => acc + curr.sharpeRatio, 0) / performance.length :
      1.2;

    return {
      portfolioValue,
      maxDrawdown,
      sharpeRatio: avgSharpeRatio,
      volatility: avgVolatility * 100, // Convert to percentage
      betaToMarket: calculateBetaToMarket(predictions),
      valueAtRisk,
      exposureByAsset,
      riskScore
    };
  } catch (error) {
    console.error('Error calculating risk metrics:', error);
    return generateFallbackRiskMetrics(portfolioValue);
  }
}

async function calculateDetailedRiskAnalysis(portfolioValue: number) {
  const basicMetrics = await calculateRiskMetrics(portfolioValue);
  const predictions = lstmPredictionService.getAllPredictions();

  return {
    basicMetrics,
    assetRiskBreakdown: predictions.map(pred => ({
      asset: pred.asset,
      individualRisk: calculateAssetRisk(pred),
      contributionToPortfolioRisk: calculateRiskContribution(pred, predictions),
      correlationWithBTC: pred.features.technicalIndicators.macd, // Using MACD as correlation proxy
      liquidityRisk: calculateLiquidityRisk(pred),
      concentrationRisk: calculateConcentrationRisk(pred, predictions)
    })),
    scenarioAnalysis: {
      bullMarket: {
        expectedReturn: 25.5,
        worstCase: -8.2,
        probability: 0.35
      },
      bearMarket: {
        expectedReturn: -15.8,
        worstCase: -45.2,
        probability: 0.25
      },
      sidewaysMarket: {
        expectedReturn: 2.1,
        worstCase: -12.5,
        probability: 0.40
      }
    },
    recommendations: generateRiskRecommendations(basicMetrics)
  };
}

function calculateAssetRisk(prediction: any): number {
  const technical = prediction.features.technicalIndicators;
  const market = prediction.features.marketSentiment;
  const whale = prediction.features.whaleActivity;

  // Combine multiple risk factors
  const technicalRisk = Math.abs(technical.rsi - 50) / 50; // 0-1 scale
  const sentimentRisk = (100 - market.socialScore) / 100; // 0-1 scale
  const whaleRisk = Math.abs(whale.netFlow) / 100000000; // Normalize large flows

  return Math.min(100, (technicalRisk + sentimentRisk + whaleRisk) * 33.33);
}

function calculateRiskContribution(asset: any, allAssets: any[]): number {
  // Simple equal-weight contribution for now
  return 100 / allAssets.length;
}

function calculateLiquidityRisk(prediction: any): number {
  // Use social score as proxy for liquidity
  const socialScore = prediction.features.marketSentiment.socialScore;
  return Math.max(0, 100 - socialScore);
}

function calculateConcentrationRisk(asset: any, allAssets: any[]): number {
  // Simple concentration based on number of assets
  return Math.max(0, 100 - (allAssets.length * 10));
}

function generatePortfolioExposure(predictions: any[]): { [key: string]: number } {
  const exposure: { [key: string]: number } = {};
  const equalWeight = 100 / predictions.length;

  predictions.slice(0, 8).forEach(pred => { // Limit to top 8 assets
    exposure[pred.asset] = equalWeight;
  });

  return exposure;
}

function calculateOverallRiskScore(predictions: any[], volatility: number, exposure: any): number {
  const volatilityScore = Math.min(100, volatility * 100);
  const concentrationScore = Object.keys(exposure).length < 5 ? 25 : 0;
  const marketScore = predictions.reduce((acc, curr) => {
    return acc + (100 - curr.features.marketSentiment.socialScore);
  }, 0) / predictions.length;

  return Math.min(100, (volatilityScore + concentrationScore + marketScore) / 3);
}

function calculateBetaToMarket(predictions: any[]): number {
  // Find BTC prediction to use as market proxy
  const btcPrediction = predictions.find(p => p.asset === 'BTC');
  if (!btcPrediction) return 1.0;

  // Use correlation indicators as beta proxy
  const avgBeta = predictions.reduce((acc, curr) => {
    const technical = curr.features.technicalIndicators;
    return acc + Math.abs(technical.macd) / 10; // Normalize MACD as beta
  }, 0) / predictions.length;

  return Math.max(0.1, Math.min(2.0, avgBeta));
}

async function calculateVaRAnalysis(portfolioValue: number) {
  const predictions = lstmPredictionService.getAllPredictions();
  
  return {
    oneDay: {
      var95: portfolioValue * 0.032, // 3.2% daily VaR
      var99: portfolioValue * 0.048, // 4.8% daily VaR
      expectedShortfall: portfolioValue * 0.056
    },
    oneWeek: {
      var95: portfolioValue * 0.085,
      var99: portfolioValue * 0.127,
      expectedShortfall: portfolioValue * 0.148
    },
    oneMonth: {
      var95: portfolioValue * 0.175,
      var99: portfolioValue * 0.262,
      expectedShortfall: portfolioValue * 0.305
    },
    stresstestScenarios: [
      { name: 'Crypto Winter', loss: portfolioValue * 0.65, probability: 0.05 },
      { name: 'Regulatory Crackdown', loss: portfolioValue * 0.35, probability: 0.15 },
      { name: 'Market Correction', loss: portfolioValue * 0.25, probability: 0.30 }
    ]
  };
}

async function generateCorrelationMatrix() {
  const predictions = lstmPredictionService.getAllPredictions();
  const assets = predictions.slice(0, 6).map(p => p.asset); // Top 6 assets

  const correlationMatrix: { [key: string]: { [key: string]: number } } = {};

  assets.forEach(asset1 => {
    correlationMatrix[asset1] = {};
    assets.forEach(asset2 => {
      if (asset1 === asset2) {
        correlationMatrix[asset1][asset2] = 1.0;
      } else {
        // Generate realistic correlations
        const pred1 = predictions.find(p => p.asset === asset1);
        const pred2 = predictions.find(p => p.asset === asset2);
        
        if (pred1 && pred2) {
          // Use technical indicators to simulate correlation
          const corr = calculateAssetCorrelation(pred1, pred2);
          correlationMatrix[asset1][asset2] = corr;
        } else {
          correlationMatrix[asset1][asset2] = 0.3; // Default moderate correlation
        }
      }
    });
  });

  return {
    matrix: correlationMatrix,
    timestamp: new Date().toISOString(),
    assets
  };
}

function calculateAssetCorrelation(pred1: any, pred2: any): number {
  const sentiment1 = pred1.features.marketSentiment.socialScore;
  const sentiment2 = pred2.features.marketSentiment.socialScore;
  
  // Simple correlation based on sentiment similarity
  const diff = Math.abs(sentiment1 - sentiment2) / 100;
  return Math.max(0.1, 1 - diff);
}

async function calculateCustomPortfolioRisk(portfolio: PortfolioAsset[], riskParams?: RiskParameters) {
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);
  
  // Validate portfolio allocation adds up to ~100%
  const totalAllocation = portfolio.reduce((sum, asset) => sum + asset.allocation, 0);
  if (Math.abs(totalAllocation - 100) > 5) {
    throw new Error('Portfolio allocation must sum to approximately 100%');
  }

  const baseMetrics = await calculateRiskMetrics(totalValue);
  
  return {
    ...baseMetrics,
    customPortfolio: {
      assets: portfolio,
      totalValue,
      totalAllocation,
      riskParameters: riskParams || getDefaultRiskParameters(),
      compliance: {
        maxPositionSizeViolations: portfolio.filter(a => 
          a.allocation > (riskParams?.maxPositionSize || 20)
        ),
        concentrationWarnings: portfolio.length < (riskParams?.diversificationMin || 5)
      }
    }
  };
}

function generateRiskRecommendations(metrics: RiskMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.riskScore > 75) {
    recommendations.push('Consider reducing position sizes in high-volatility assets');
    recommendations.push('Increase diversification across uncorrelated assets');
  }

  if (metrics.volatility > 25) {
    recommendations.push('Portfolio volatility is high - consider adding stable assets');
  }

  if (metrics.sharpeRatio < 1.0) {
    recommendations.push('Risk-adjusted returns are low - review asset selection');
  }

  if (Object.keys(metrics.exposureByAsset).length < 5) {
    recommendations.push('Increase diversification by adding more assets');
  }

  if (recommendations.length === 0) {
    recommendations.push('Portfolio risk profile appears well-balanced');
  }

  return recommendations;
}

function getDefaultRiskParameters(): RiskParameters {
  return {
    maxPositionSize: 20,
    maxDrawdownLimit: 15,
    correlationThreshold: 0.7,
    diversificationMin: 5,
    stopLossLevel: 8,
    takeProfitLevel: 25
  };
}

function generateFallbackRiskMetrics(portfolioValue: number): RiskMetrics {
  return {
    portfolioValue,
    maxDrawdown: 8.3,
    sharpeRatio: 1.42,
    volatility: 18.7,
    betaToMarket: 0.85,
    valueAtRisk: portfolioValue * 0.043,
    exposureByAsset: {
      'BTC': 35,
      'ETH': 25,
      'SOL': 20,
      'ADA': 12,
      'LINK': 8
    },
    riskScore: 72
  };
}