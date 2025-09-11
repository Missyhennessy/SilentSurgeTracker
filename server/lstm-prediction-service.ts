import type { Express } from "express";

interface LSTMPrediction {
  asset: string;
  currentPrice: number;
  predictions: {
    timeframe: string;
    predictedPrice: number;
    confidence: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    probability: number;
  }[];
  modelMetrics: {
    accuracy: number;
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    lastTrainingDate: Date;
    dataPoints: number;
  };
  features: {
    technicalIndicators: {
      rsi: number;
      macd: number;
      bollinger: { upper: number; middle: number; lower: number };
      volumeOscillator: number;
    };
    marketSentiment: {
      socialScore: number;
      newsScore: number;
      fearGreedIndex: number;
    };
    whaleActivity: {
      netFlow: number;
      largeTransactions: number;
      accumulationScore: number;
    };
  };
}

interface ModelPerformance {
  asset: string;
  period: string;
  predictions: number;
  correct: number;
  accuracy: number;
  profitability: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

class LSTMPredictionService {
  private predictions: Map<string, LSTMPrediction> = new Map();
  private performance: ModelPerformance[] = [];

  constructor() {
    this.initializeModels();
    // this.startPredictionUpdates(); // DISABLED for development to prevent event loop stalls
  }

  private initializeModels() {
    const assets = ['BTC', 'ETH', 'SOL', 'PEPE', 'BONK', 'WIF', 'DOGE', 'SHIB', 'ADA', 'DOT'];
    
    assets.forEach(asset => {
      this.generatePrediction(asset);
      this.generatePerformanceMetrics(asset);
    });
  }

  private generatePrediction(asset: string): LSTMPrediction {
    const basePrice = this.getAssetPrice(asset);
    
    // Simulate LSTM predictions with realistic variance
    const shortTermVariance = 0.05; // 5% variance for 1-hour
    const mediumTermVariance = 0.15; // 15% variance for 24-hour
    const longTermVariance = 0.35; // 35% variance for 7-day

    const prediction: LSTMPrediction = {
      asset,
      currentPrice: basePrice,
      predictions: [
        {
          timeframe: '1h',
          predictedPrice: basePrice * (1 + (Math.random() - 0.5) * shortTermVariance),
          confidence: 85 + Math.random() * 10,
          direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
          probability: 0.6 + Math.random() * 0.3
        },
        {
          timeframe: '24h',
          predictedPrice: basePrice * (1 + (Math.random() - 0.5) * mediumTermVariance),
          confidence: 75 + Math.random() * 15,
          direction: Math.random() > 0.4 ? 'bullish' : 'bearish',
          probability: 0.55 + Math.random() * 0.35
        },
        {
          timeframe: '7d',
          predictedPrice: basePrice * (1 + (Math.random() - 0.5) * longTermVariance),
          confidence: 65 + Math.random() * 20,
          direction: Math.random() > 0.45 ? 'bullish' : 'bearish',
          probability: 0.5 + Math.random() * 0.4
        }
      ],
      modelMetrics: {
        accuracy: 72 + Math.random() * 18, // 72-90% accuracy
        mape: 3 + Math.random() * 7, // 3-10% MAPE
        rmse: 50 + Math.random() * 150, // Realistic RMSE
        lastTrainingDate: new Date(Date.now() - Math.random() * 86400000 * 3), // Last 3 days
        dataPoints: 10000 + Math.floor(Math.random() * 50000) // 10k-60k data points
      },
      features: {
        technicalIndicators: {
          rsi: 30 + Math.random() * 40, // 30-70 RSI range
          macd: (Math.random() - 0.5) * 10,
          bollinger: {
            upper: basePrice * (1 + 0.02),
            middle: basePrice,
            lower: basePrice * (1 - 0.02)
          },
          volumeOscillator: (Math.random() - 0.5) * 20
        },
        marketSentiment: {
          socialScore: 40 + Math.random() * 40, // 40-80 range
          newsScore: 45 + Math.random() * 35,   // 45-80 range
          fearGreedIndex: 20 + Math.random() * 60 // 20-80 range
        },
        whaleActivity: {
          netFlow: (Math.random() - 0.5) * 100000000, // -50M to +50M
          largeTransactions: Math.floor(Math.random() * 50),
          accumulationScore: 30 + Math.random() * 40
        }
      }
    };

    this.predictions.set(asset, prediction);
    return prediction;
  }

  private generatePerformanceMetrics(asset: string) {
    const periods = ['1h', '24h', '7d', '30d'];
    
    periods.forEach(period => {
      const predictions = 100 + Math.floor(Math.random() * 900); // 100-1000 predictions
      const correct = Math.floor(predictions * (0.6 + Math.random() * 0.3)); // 60-90% accuracy
      
      this.performance.push({
        asset,
        period,
        predictions,
        correct,
        accuracy: (correct / predictions) * 100,
        profitability: 5 + Math.random() * 45, // 5-50% profitability
        sharpeRatio: 0.5 + Math.random() * 2.5, // 0.5-3.0 Sharpe ratio
        maxDrawdown: -(5 + Math.random() * 25) // -5% to -30% max drawdown
      });
    });
  }

  private getAssetPrice(asset: string): number {
    // Simulated current prices - in real implementation, get from crypto service
    const prices: Record<string, number> = {
      'BTC': 118200,
      'ETH': 3780,
      'SOL': 187,
      'PEPE': 0.0000126,
      'BONK': 0.0000350,
      'WIF': 1.09,
      'DOGE': 0.24,
      'SHIB': 0.0000187,
      'ADA': 0.83,
      'DOT': 4.18
    };
    return prices[asset] || 1;
  }

  private startPredictionUpdates() {
    // Update predictions every 5 minutes
    setInterval(() => {
      this.updatePredictions();
    }, 300000);
  }

  private updatePredictions() {
    this.predictions.forEach((_, asset) => {
      this.generatePrediction(asset);
    });
    console.log('LSTM predictions updated for all assets');
  }

  getPrediction(asset: string): LSTMPrediction | undefined {
    return this.predictions.get(asset.toUpperCase());
  }

  getAllPredictions(): LSTMPrediction[] {
    return Array.from(this.predictions.values());
  }

  getTopPredictions(timeframe: string = '24h', limit: number = 10): LSTMPrediction[] {
    return Array.from(this.predictions.values())
      .map(prediction => ({
        ...prediction,
        selectedPrediction: prediction.predictions.find(p => p.timeframe === timeframe)
      }))
      .filter(p => p.selectedPrediction)
      .sort((a, b) => (b.selectedPrediction?.confidence || 0) - (a.selectedPrediction?.confidence || 0))
      .slice(0, limit);
  }

  getPerformanceMetrics(asset?: string, period?: string): ModelPerformance[] {
    let metrics = this.performance;
    
    if (asset) {
      metrics = metrics.filter(m => m.asset === asset.toUpperCase());
    }
    
    if (period) {
      metrics = metrics.filter(m => m.period === period);
    }
    
    return metrics;
  }

  getBestPerformingModels(): {
    byAccuracy: ModelPerformance[];
    byProfitability: ModelPerformance[];
    bySharpeRatio: ModelPerformance[];
  } {
    return {
      byAccuracy: [...this.performance].sort((a, b) => b.accuracy - a.accuracy).slice(0, 10),
      byProfitability: [...this.performance].sort((a, b) => b.profitability - a.profitability).slice(0, 10),
      bySharpeRatio: [...this.performance].sort((a, b) => b.sharpeRatio - a.sharpeRatio).slice(0, 10)
    };
  }
}

export const lstmPredictionService = new LSTMPredictionService();

export function registerLSTMRoutes(app: Express) {
  // Get prediction for specific asset
  app.get("/api/lstm/prediction/:asset", (req, res) => {
    try {
      const asset = req.params.asset.toUpperCase();
      const prediction = lstmPredictionService.getPrediction(asset);
      
      if (!prediction) {
        return res.status(404).json({ error: "Asset not found" });
      }
      
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch LSTM prediction" });
    }
  });

  // Get all predictions
  app.get("/api/lstm/predictions", (req, res) => {
    try {
      const predictions = lstmPredictionService.getAllPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch LSTM predictions" });
    }
  });

  // Get top predictions by confidence
  app.get("/api/lstm/top", (req, res) => {
    try {
      const timeframe = req.query.timeframe as string || '24h';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topPredictions = lstmPredictionService.getTopPredictions(timeframe, limit);
      res.json(topPredictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top LSTM predictions" });
    }
  });

  // Get model performance metrics
  app.get("/api/lstm/performance", (req, res) => {
    try {
      const asset = req.query.asset as string;
      const period = req.query.period as string;
      const metrics = lstmPredictionService.getPerformanceMetrics(asset, period);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  // Get best performing models
  app.get("/api/lstm/best", (req, res) => {
    try {
      const bestModels = lstmPredictionService.getBestPerformingModels();
      res.json(bestModels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch best performing models" });
    }
  });
}