import { NextRequest, NextResponse } from 'next/server';
import { lstmPredictionService } from '@/server/lstm-prediction-service';
import { pythonEngineService } from '@/server/python-engine-service';

interface TradingSignal {
  id: string;
  asset: string;
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reason: string;
  sssScore: number;
  timestamp: string;
  status: 'active' | 'executed' | 'expired';
  lstmData?: any;
}

interface SignalPerformance {
  accuracy: number;
  profitability: number;
  avgReturn: number;
  winRate: number;
  totalSignals: number;
  activeSignals: number;
  recentSignals: any[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'signals';
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const asset = searchParams.get('asset');

    switch (type) {
      case 'signals':
        const signals = await generateTradingSignals(asset, timeframe, limit);
        return NextResponse.json({
          signals,
          timestamp: new Date().toISOString(),
          total: signals.length
        });
      
      case 'performance':
        const performance = generateSignalPerformance();
        return NextResponse.json(performance);
      
      case 'analysis':
        // Generate analysis using Python engine
        try {
          const analysisResult = await pythonEngineService.runRealisticDemo();
          return NextResponse.json(analysisResult);
        } catch (error) {
          console.error('Python analysis error:', error);
          // Fallback to mock data if Python engine fails
          const mockAnalysis = generateMockAnalysis();
          return NextResponse.json(mockAnalysis);
        }
      
      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: signals, performance, analysis' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Trading Signals API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading signals' },
      { status: 500 }
    );
  }
}

async function generateTradingSignals(
  filterAsset?: string | null, 
  timeframe: string = '24h',
  limit: number = 10
): Promise<TradingSignal[]> {
  try {
    // Get LSTM predictions for market context
    const lstmPredictions = lstmPredictionService.getAllPredictions();
    const topPredictions = lstmPredictionService.getTopPredictions(timeframe, limit);

    const signals: TradingSignal[] = [];

    // Generate signals based on LSTM predictions and SSS analysis
    for (const prediction of topPredictions) {
      if (filterAsset && prediction.asset.toUpperCase() !== filterAsset.toUpperCase()) {
        continue;
      }

      const relevantPrediction = prediction.predictions.find(p => p.timeframe === timeframe) || 
                                prediction.predictions[0];

      // Determine signal type based on prediction direction and confidence
      let signalType: 'buy' | 'sell' | 'hold' = 'hold';
      let strength = relevantPrediction.confidence;
      let reason = '';

      if (relevantPrediction.direction === 'bullish' && relevantPrediction.confidence > 75) {
        signalType = 'buy';
        reason = `Strong bullish LSTM prediction (${relevantPrediction.confidence.toFixed(1)}% confidence)`;
        
        // Boost strength for high-probability signals
        if (relevantPrediction.probability > 0.8) {
          strength = Math.min(95, strength + 10);
          reason += ' + high probability breakout';
        }
      } else if (relevantPrediction.direction === 'bearish' && relevantPrediction.confidence > 75) {
        signalType = 'sell';
        reason = `Strong bearish LSTM prediction (${relevantPrediction.confidence.toFixed(1)}% confidence)`;
      } else {
        reason = `Consolidation expected (${relevantPrediction.confidence.toFixed(1)}% confidence)`;
      }

      // Add market sentiment context
      const sentimentScore = prediction.features.marketSentiment.socialScore;
      if (sentimentScore > 70) {
        reason += ' + positive sentiment';
        strength += 5;
      } else if (sentimentScore < 40) {
        reason += ' + negative sentiment';
        if (signalType === 'buy') strength -= 10;
      }

      // Calculate price targets based on prediction
      const currentPrice = prediction.currentPrice;
      const predictedPrice = relevantPrediction.predictedPrice;
      const priceChange = (predictedPrice - currentPrice) / currentPrice;

      let targetPrice = predictedPrice;
      let stopLoss = currentPrice;

      if (signalType === 'buy') {
        stopLoss = currentPrice * 0.92; // 8% stop loss
        targetPrice = Math.max(predictedPrice, currentPrice * 1.15); // At least 15% target
      } else if (signalType === 'sell') {
        stopLoss = currentPrice * 1.08; // 8% stop loss (opposite direction)
        targetPrice = Math.min(predictedPrice, currentPrice * 0.85); // At least 15% target down
      }

      const signal: TradingSignal = {
        id: `signal-${prediction.asset}-${Date.now()}`,
        asset: prediction.asset,
        type: signalType,
        strength: Math.max(0, Math.min(100, strength)), // Clamp between 0-100
        confidence: relevantPrediction.confidence,
        price: currentPrice,
        targetPrice,
        stopLoss,
        timeframe,
        reason,
        sssScore: sentimentScore, // Using sentiment as proxy for SSS
        timestamp: new Date().toISOString(),
        status: 'active',
        lstmData: {
          accuracy: prediction.modelMetrics.accuracy,
          mape: prediction.modelMetrics.mape,
          technicalIndicators: prediction.features.technicalIndicators,
          whaleActivity: prediction.features.whaleActivity
        }
      };

      signals.push(signal);
    }

    // If no signals generated, create some based on existing mock data
    if (signals.length === 0) {
      signals.push(...generateFallbackSignals(filterAsset, limit));
    }

    return signals.slice(0, limit);
  } catch (error) {
    console.error('Error generating trading signals:', error);
    return generateFallbackSignals(filterAsset, limit);
  }
}

function generateFallbackSignals(filterAsset?: string | null, limit: number = 10): TradingSignal[] {
  const fallbackSignals: TradingSignal[] = [
    {
      id: 'signal-sol-1',
      asset: 'SOL',
      type: 'buy',
      strength: 92,
      confidence: 88,
      price: 186.83,
      targetPrice: 215.00,
      stopLoss: 170.00,
      timeframe: '4h',
      reason: 'SSS breakout above 80 + volume surge',
      sssScore: 82.6,
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 min ago
      status: 'active'
    },
    {
      id: 'signal-eth-1',
      asset: 'ETH',
      type: 'buy',
      strength: 78,
      confidence: 82,
      price: 3758.13,
      targetPrice: 4200.00,
      stopLoss: 3500.00,
      timeframe: '1d',
      reason: 'Strong anchor pressure + bullish sentiment',
      sssScore: 76.7,
      timestamp: new Date(Date.now() - 1500000).toISOString(), // 25 min ago
      status: 'active'
    },
    {
      id: 'signal-btc-1',
      asset: 'BTC',
      type: 'hold',
      strength: 65,
      confidence: 70,
      price: 117491.00,
      targetPrice: 125000.00,
      stopLoss: 110000.00,
      timeframe: '1w',
      reason: 'Consolidation phase, await breakout',
      sssScore: 63.1,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'active'
    }
  ];

  if (filterAsset) {
    return fallbackSignals.filter(s => s.asset.toUpperCase() === filterAsset.toUpperCase());
  }

  return fallbackSignals.slice(0, limit);
}

function generateSignalPerformance(): SignalPerformance {
  return {
    accuracy: 84.2,
    profitability: 76.8,
    avgReturn: 12.4,
    winRate: 78.5,
    totalSignals: 247,
    activeSignals: 8,
    recentSignals: [
      { asset: 'SOL', type: 'BUY', confidence: 88, timestamp: new Date().toISOString() },
      { asset: 'ETH', type: 'BUY', confidence: 82, timestamp: new Date().toISOString() },
      { asset: 'BTC', type: 'HOLD', confidence: 70, timestamp: new Date().toISOString() }
    ]
  };
}

function generateMockAnalysis() {
  return {
    timestamp: new Date().toISOString(),
    total_analyzed: 15,
    avg_breakout_probability: 67.3,
    strong_signals: 4,
    market_summary: {
      strong_buy_count: 2,
      buy_count: 3,
      accumulate_count: 4,
      high_risk_count: 1
    },
    top_opportunities: [
      { token: 'SOL', action: 'STRONG BUY', confidence: 'High', prob_7d: 82.1 },
      { token: 'ETH', action: 'BUY', confidence: 'High', prob_7d: 76.4 },
      { token: 'LINK', action: 'BUY', confidence: 'Medium', prob_7d: 68.9 }
    ]
  };
}