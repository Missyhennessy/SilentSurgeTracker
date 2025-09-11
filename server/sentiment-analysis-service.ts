import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

// Enhanced Social Sentiment Analysis Service
interface SentimentData {
  platform: 'twitter' | 'reddit' | 'discord' | 'telegram' | 'news';
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -1.0 to 1.0
  volume: number; // mentions count
  influence: number; // weighted by follower count
  timestamp: Date;
  source: string;
  content?: string;
}

interface InfluencerMetrics {
  handle: string;
  platform: string;
  followers: number;
  accuracy: number; // historical prediction accuracy
  influence_score: number;
  recent_sentiment: 'bullish' | 'bearish' | 'neutral';
  last_prediction: Date;
}

interface SentimentAnalysis {
  symbol: string;
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  sentiment_score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  trend: 'increasing' | 'decreasing' | 'stable';
  platforms: {
    twitter: { score: number; volume: number; trend: string };
    reddit: { score: number; volume: number; trend: string };
    discord: { score: number; volume: number; trend: string };
    telegram: { score: number; volume: number; trend: string };
    news: { score: number; volume: number; trend: string };
  };
  top_influencers: InfluencerMetrics[];
  fear_greed_index: number; // 0-100
  social_dominance: number; // % of total crypto mentions
  timestamp: Date;
}

interface NewsEvent {
  id: string;
  title: string;
  source: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number; // 0.0 to 1.0
  timestamp: Date;
  affected_assets: string[];
  category: 'regulatory' | 'adoption' | 'technical' | 'market' | 'security';
}

export class SentimentAnalysisService {
  private sentimentHistory: Map<string, SentimentData[]> = new Map();
  private influencers: InfluencerMetrics[] = [];
  private newsEvents: NewsEvent[] = [];

  constructor() {
    this.initializeMockInfluencers();
    this.initializeMockNews();
    // this.startSentimentMonitoring(); // DISABLED for development to prevent event loop stalls
  }

  // Initialize mock influencer data
  private initializeMockInfluencers() {
    this.influencers = [
      {
        handle: '@elonmusk',
        platform: 'twitter',
        followers: 150000000,
        accuracy: 0.65,
        influence_score: 0.95,
        recent_sentiment: 'bullish',
        last_prediction: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        handle: '@michael_saylor',
        platform: 'twitter',
        followers: 3200000,
        accuracy: 0.78,
        influence_score: 0.88,
        recent_sentiment: 'bullish',
        last_prediction: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        handle: 'r/cryptocurrency',
        platform: 'reddit',
        followers: 6500000,
        accuracy: 0.52,
        influence_score: 0.72,
        recent_sentiment: 'neutral',
        last_prediction: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        handle: '@VitalikButerin',
        platform: 'twitter',
        followers: 5100000,
        accuracy: 0.71,
        influence_score: 0.85,
        recent_sentiment: 'bullish',
        last_prediction: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        handle: '@APompliano',
        platform: 'twitter',
        followers: 1800000,
        accuracy: 0.69,
        influence_score: 0.79,
        recent_sentiment: 'bullish',
        last_prediction: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];
  }

  // Initialize mock news events
  private initializeMockNews() {
    this.newsEvents = [
      {
        id: '1',
        title: 'SEC Approves Bitcoin ETF Applications from Major Asset Managers',
        source: 'Bloomberg',
        impact: 'critical',
        sentiment: 'positive',
        relevance: 0.95,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        affected_assets: ['BTC', 'ETH'],
        category: 'regulatory'
      },
      {
        id: '2',
        title: 'Major Banking Institution Announces Crypto Custody Services',
        source: 'Reuters',
        impact: 'high',
        sentiment: 'positive',
        relevance: 0.82,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        affected_assets: ['BTC', 'ETH', 'SOL'],
        category: 'adoption'
      },
      {
        id: '3',
        title: 'Ethereum Layer 2 Network Reports Record Transaction Volume',
        source: 'CoinDesk',
        impact: 'medium',
        sentiment: 'positive',
        relevance: 0.76,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        affected_assets: ['ETH'],
        category: 'technical'
      },
      {
        id: '4',
        title: 'Central Bank Digital Currency Development Accelerates',
        source: 'Financial Times',
        impact: 'medium',
        sentiment: 'neutral',
        relevance: 0.68,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        affected_assets: ['BTC', 'ETH', 'XRP'],
        category: 'regulatory'
      }
    ];
  }

  // Generate realistic sentiment data for a symbol
  private generateSentimentData(symbol: string): SentimentData[] {
    const platforms: Array<SentimentData['platform']> = ['twitter', 'reddit', 'discord', 'telegram', 'news'];
    const sentiments: Array<SentimentData['sentiment']> = ['bullish', 'bearish', 'neutral'];
    
    return platforms.map(platform => {
      const baseScore = Math.random() * 2 - 1; // -1 to 1
      const sentiment: SentimentData['sentiment'] = 
        baseScore > 0.2 ? 'bullish' : 
        baseScore < -0.2 ? 'bearish' : 'neutral';
      
      // Platform-specific volume patterns
      const volumeMultiplier = {
        twitter: 1000,
        reddit: 500,
        discord: 200,
        telegram: 300,
        news: 50
      };

      return {
        platform,
        symbol,
        sentiment,
        score: baseScore,
        volume: Math.floor(Math.random() * volumeMultiplier[platform]) + 50,
        influence: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
        timestamp: new Date(),
        source: `Mock ${platform} data`
      };
    });
  }

  // Analyze sentiment for a specific symbol
  public analyzeSentiment(symbol: string): SentimentAnalysis {
    const sentimentData = this.generateSentimentData(symbol);
    
    // Store in history
    if (!this.sentimentHistory.has(symbol)) {
      this.sentimentHistory.set(symbol, []);
    }
    this.sentimentHistory.get(symbol)!.push(...sentimentData);

    // Calculate overall sentiment
    const totalVolume = sentimentData.reduce((sum, data) => sum + data.volume, 0);
    const weightedScore = sentimentData.reduce((sum, data) => 
      sum + (data.score * data.volume * data.influence), 0) / totalVolume;

    const overall_sentiment: SentimentAnalysis['overall_sentiment'] = 
      weightedScore > 0.15 ? 'bullish' : 
      weightedScore < -0.15 ? 'bearish' : 'neutral';

    // Calculate platform-specific metrics
    const platforms = sentimentData.reduce((acc, data) => {
      acc[data.platform] = {
        score: data.score,
        volume: data.volume,
        trend: this.calculateTrend(symbol, data.platform)
      };
      return acc;
    }, {} as SentimentAnalysis['platforms']);

    // Filter relevant influencers
    const top_influencers = this.influencers
      .filter(inf => Math.random() > 0.3) // Simulate some influencers talking about this asset
      .slice(0, 3);

    return {
      symbol,
      overall_sentiment,
      sentiment_score: weightedScore,
      confidence: Math.min(totalVolume / 1000, 1.0), // Higher volume = higher confidence
      trend: this.calculateOverallTrend(symbol),
      platforms,
      top_influencers,
      fear_greed_index: Math.floor(Math.random() * 100), // 0-100
      social_dominance: Math.random() * 15 + 1, // 1-16%
      timestamp: new Date()
    };
  }

  // Calculate trend for a platform
  private calculateTrend(symbol: string, platform: string): string {
    const history = this.sentimentHistory.get(symbol) || [];
    const platformHistory = history.filter(h => h.platform === platform);
    
    if (platformHistory.length < 2) return 'stable';
    
    const recent = platformHistory.slice(-2);
    const scoreDiff = recent[1].score - recent[0].score;
    
    return scoreDiff > 0.1 ? 'increasing' : 
           scoreDiff < -0.1 ? 'decreasing' : 'stable';
  }

  // Calculate overall trend
  private calculateOverallTrend(symbol: string): 'increasing' | 'decreasing' | 'stable' {
    const trends = ['increasing', 'decreasing', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)] as any;
  }

  // Get recent news events
  public getRecentNews(symbol?: string): NewsEvent[] {
    if (symbol) {
      return this.newsEvents.filter(event => 
        event.affected_assets.includes(symbol)
      ).slice(0, 10);
    }
    return this.newsEvents.slice(0, 10);
  }

  // Get fear and greed index
  public getFearGreedIndex(): {
    value: number;
    classification: string;
    description: string;
    timestamp: Date;
  } {
    const value = Math.floor(Math.random() * 100);
    let classification: string;
    let description: string;

    if (value <= 25) {
      classification = 'Extreme Fear';
      description = 'Market showing signs of extreme fear. Potential buying opportunity.';
    } else if (value <= 45) {
      classification = 'Fear';
      description = 'Market sentiment is fearful. Proceed with caution.';
    } else if (value <= 55) {
      classification = 'Neutral';
      description = 'Market sentiment is balanced.';
    } else if (value <= 75) {
      classification = 'Greed';
      description = 'Market showing signs of greed. Consider taking profits.';
    } else {
      classification = 'Extreme Greed';
      description = 'Market in extreme greed. High risk of correction.';
    }

    return {
      value,
      classification,
      description,
      timestamp: new Date()
    };
  }

  // Get trending topics
  public getTrendingTopics(): Array<{
    topic: string;
    mentions: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    change: number; // % change in mentions
  }> {
    const topics = [
      'Bitcoin ETF', 'DeFi Summer', 'NFT Gaming', 'Layer 2 Scaling',
      'Regulatory Clarity', 'Institutional Adoption', 'Quantum Computing',
      'Central Bank Digital Currencies', 'Metaverse Integration'
    ];

    return topics.slice(0, 5).map(topic => ({
      topic,
      mentions: Math.floor(Math.random() * 10000) + 1000,
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
      change: (Math.random() - 0.5) * 200 // -100% to +100%
    }));
  }

  // Start monitoring sentiment (simulate real-time updates)
  private startSentimentMonitoring() {
    setInterval(() => {
      // Add new sentiment data periodically
      const symbols = ['BTC', 'ETH', 'SOL', 'XRP'];
      symbols.forEach(symbol => {
        const newData = this.generateSentimentData(symbol);
        if (!this.sentimentHistory.has(symbol)) {
          this.sentimentHistory.set(symbol, []);
        }
        this.sentimentHistory.get(symbol)!.push(...newData);
        
        // Keep only last 100 entries per symbol
        const history = this.sentimentHistory.get(symbol)!;
        if (history.length > 100) {
          this.sentimentHistory.set(symbol, history.slice(-100));
        }
      });
    }, 5 * 60 * 1000); // Update every 5 minutes
  }
}

// Export service instance
export const sentimentAnalysisService = new SentimentAnalysisService();

// Register sentiment analysis routes
export function registerSentimentRoutes(app: Express) {
  // Get sentiment analysis for a specific symbol
  app.get('/api/sentiment/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const analysis = sentimentAnalysisService.analyzeSentiment(symbol.toUpperCase());
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      res.status(500).json({ message: 'Failed to analyze sentiment' });
    }
  });

  // Get recent news events
  app.get('/api/sentiment/news/:symbol?', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const news = sentimentAnalysisService.getRecentNews(symbol?.toUpperCase());
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });

  // Get fear and greed index
  app.get('/api/sentiment/fear-greed', isAuthenticated, async (req, res) => {
    try {
      const fearGreedIndex = sentimentAnalysisService.getFearGreedIndex();
      res.json(fearGreedIndex);
    } catch (error) {
      console.error('Error fetching fear-greed index:', error);
      res.status(500).json({ message: 'Failed to fetch fear-greed index' });
    }
  });

  // Get trending topics
  app.get('/api/sentiment/trending', isAuthenticated, async (req, res) => {
    try {
      const trending = sentimentAnalysisService.getTrendingTopics();
      res.json(trending);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      res.status(500).json({ message: 'Failed to fetch trending topics' });
    }
  });
}