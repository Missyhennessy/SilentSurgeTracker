import { randomInt, randomUUID } from "crypto";

// Types for institutional APIs
interface InstitutionalClient {
  id: string;
  name: string;
  type: 'hedge_fund' | 'bank' | 'exchange' | 'family_office' | 'asset_manager' | 'broker_dealer';
  tier: 'standard' | 'premium' | 'enterprise' | 'white_label';
  aum: number; // Assets Under Management
  region: string;
  complianceLevel: 'basic' | 'enhanced' | 'premium';
  apiQuota: {
    daily: number;
    monthly: number;
    used: number;
  };
  features: string[];
  onboardingDate: Date;
  lastActive: Date;
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
  };
}

interface APIMetrics {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  calls24h: number;
  avgResponseTime: number;
  errorRate: number;
  popularity: number;
  clients: number;
  region: string;
  tier: string;
}

interface CustomIndicator {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'fundamental' | 'sentiment' | 'onchain' | 'macro';
  formula: string;
  parameters: Record<string, any>;
  outputType: 'number' | 'percentage' | 'signal' | 'category';
  updateFrequency: 'realtime' | 'minute' | 'hourly' | 'daily';
  accuracy: number;
  backtestPeriod: string;
  createdBy: string;
  subscribers: number;
}

interface MarketDataFeed {
  id: string;
  name: string;
  description: string;
  coverage: string[];
  latency: number; // milliseconds
  reliability: number; // percentage
  cost: number; // per month
  features: string[];
  sampleRate: 'tick' | '1s' | '1m' | '5m' | '15m' | '1h';
  historicalDepth: string;
  clientCount: number;
}

interface RiskModel {
  id: string;
  name: string;
  description: string;
  type: 'VaR' | 'CVaR' | 'stress_test' | 'correlation' | 'concentration' | 'liquidity';
  confidence: number;
  timeHorizon: string;
  methodology: string;
  parameters: Record<string, any>;
  accuracy: number;
  lastCalibration: Date;
  portfolioCount: number;
  avgPortfolioSize: number;
}

class InstitutionalAPIService {
  private clientTypes = ['hedge_fund', 'bank', 'exchange', 'family_office', 'asset_manager', 'broker_dealer'] as const;
  private tiers = ['standard', 'premium', 'enterprise', 'white_label'] as const;
  private regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];

  // Generate institutional clients
  generateInstitutionalClients(): InstitutionalClient[] {
    const clients: InstitutionalClient[] = [
      {
        id: 'client_001',
        name: 'Quantum Capital Management',
        type: 'hedge_fund',
        tier: 'enterprise',
        aum: 12500000000,
        region: 'North America',
        complianceLevel: 'premium',
        apiQuota: { daily: 100000, monthly: 3000000, used: 45000 },
        features: ['Real-time Data', 'Advanced Analytics', 'Custom Indicators', 'Risk Models'],
        onboardingDate: new Date('2023-03-15'),
        lastActive: new Date(),
        contactInfo: {
          primaryContact: 'Sarah Chen',
          email: 'sarah.chen@quantumcap.com',
          phone: '+1-555-0123'
        }
      },
      {
        id: 'client_002',
        name: 'Swiss Digital Bank AG',
        type: 'bank',
        tier: 'white_label',
        aum: 85000000000,
        region: 'Europe',
        complianceLevel: 'premium',
        apiQuota: { daily: 250000, monthly: 7500000, used: 125000 },
        features: ['White Label Solution', 'Compliance Tools', 'Regulatory Reporting', 'Custody Integration'],
        onboardingDate: new Date('2022-11-08'),
        lastActive: new Date(Date.now() - 3600000),
        contactInfo: {
          primaryContact: 'Klaus Mueller',
          email: 'k.mueller@swissdigital.ch',
          phone: '+41-44-123-4567'
        }
      },
      {
        id: 'client_003',
        name: 'Tokyo Crypto Exchange',
        type: 'exchange',
        tier: 'premium',
        aum: 2500000000,
        region: 'Asia Pacific',
        complianceLevel: 'enhanced',
        apiQuota: { daily: 500000, monthly: 15000000, used: 285000 },
        features: ['Market Data Feeds', 'Trading Infrastructure', 'Liquidity Analytics'],
        onboardingDate: new Date('2023-01-22'),
        lastActive: new Date(Date.now() - 1800000),
        contactInfo: {
          primaryContact: 'Hiroshi Tanaka',
          email: 'h.tanaka@tokyocrypto.jp',
          phone: '+81-3-1234-5678'
        }
      }
    ];

    // Generate additional random clients
    for (let i = 4; i <= 15; i++) {
      clients.push(this.generateRandomClient(i));
    }

    return clients;
  }

  // Generate API metrics
  generateAPIMetrics(): APIMetrics[] {
    const endpoints = [
      '/api/v2/market-data/realtime',
      '/api/v2/analytics/sss-scores',
      '/api/v2/whale-tracking/transactions',
      '/api/v2/lstm/predictions',
      '/api/v2/defi/opportunities',
      '/api/v2/compliance/screening',
      '/api/v2/forensics/trace',
      '/api/v2/risk/portfolio-analysis',
      '/api/v2/sentiment/aggregated',
      '/api/v2/alerts/custom'
    ];

    return endpoints.map(endpoint => ({
      endpoint,
      method: ['GET', 'POST'][randomInt(0, 2)] as 'GET' | 'POST',
      calls24h: randomInt(10000, 500000),
      avgResponseTime: 50 + Math.random() * 200,
      errorRate: Math.random() * 2,
      popularity: Math.random() * 100,
      clients: randomInt(5, 50),
      region: this.regions[randomInt(0, this.regions.length)],
      tier: this.tiers[randomInt(0, this.tiers.length)]
    }));
  }

  // Generate custom indicators
  generateCustomIndicators(): CustomIndicator[] {
    return [
      {
        id: 'ind_001',
        name: 'Whale Accumulation Index',
        description: 'Measures large wallet accumulation patterns across multiple chains',
        category: 'onchain',
        formula: 'WAI = (Σ(whale_inflows) - Σ(whale_outflows)) / total_volume * 100',
        parameters: { min_wallet_size: 1000000, lookback_days: 30 },
        outputType: 'percentage',
        updateFrequency: 'hourly',
        accuracy: 87.5,
        backtestPeriod: '2 years',
        createdBy: 'Quantum Capital',
        subscribers: 23
      },
      {
        id: 'ind_002',
        name: 'Cross-Chain Arbitrage Signal',
        description: 'Identifies profitable arbitrage opportunities across DEX and CEX',
        category: 'technical',
        formula: 'CAS = max(price_diff) / avg(price) * liquidity_factor',
        parameters: { min_profit_threshold: 0.5, max_slippage: 2.0 },
        outputType: 'signal',
        updateFrequency: 'realtime',
        accuracy: 92.1,
        backtestPeriod: '6 months',
        createdBy: 'Swiss Digital Bank',
        subscribers: 45
      },
      {
        id: 'ind_003',
        name: 'DeFi TVL Momentum',
        description: 'Tracks total value locked momentum across major DeFi protocols',
        category: 'fundamental',
        formula: 'DTM = (TVL_current - TVL_7d) / TVL_7d * volume_weight',
        parameters: { protocols: ['Uniswap', 'Aave', 'Compound'], weight_factor: 1.2 },
        outputType: 'percentage',
        updateFrequency: 'daily',
        accuracy: 78.9,
        backtestPeriod: '18 months',
        createdBy: 'Tokyo Crypto Exchange',
        subscribers: 67
      }
    ];
  }

  // Generate market data feeds
  generateMarketDataFeeds(): MarketDataFeed[] {
    return [
      {
        id: 'feed_001',
        name: 'Real-time Crypto Market Data',
        description: 'Ultra-low latency market data from top 20 exchanges',
        coverage: ['Binance', 'Coinbase', 'Kraken', 'Uniswap', 'PancakeSwap'],
        latency: 15,
        reliability: 99.98,
        cost: 5000,
        features: ['Level 2 Order Book', 'Trade Feed', 'OHLCV', 'Funding Rates'],
        sampleRate: 'tick',
        historicalDepth: '5 years',
        clientCount: 127
      },
      {
        id: 'feed_002',
        name: 'DeFi Protocol Analytics',
        description: 'Comprehensive DeFi protocol metrics and TVL tracking',
        coverage: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche'],
        latency: 300,
        reliability: 99.95,
        cost: 3000,
        features: ['TVL Tracking', 'Yield Calculations', 'Pool Analytics', 'Governance Data'],
        sampleRate: '1m',
        historicalDepth: '3 years',
        clientCount: 89
      },
      {
        id: 'feed_003',
        name: 'On-chain Analytics Suite',
        description: 'Advanced blockchain analytics and whale tracking',
        coverage: ['Bitcoin', 'Ethereum', 'Solana', 'BNB Chain', 'Cardano'],
        latency: 120,
        reliability: 99.92,
        cost: 8000,
        features: ['Whale Tracking', 'Address Clustering', 'Flow Analysis', 'UTXO Tracking'],
        sampleRate: '1m',
        historicalDepth: '7 years',
        clientCount: 56
      }
    ];
  }

  // Generate risk models
  generateRiskModels(): RiskModel[] {
    return [
      {
        id: 'risk_001',
        name: 'Crypto Portfolio VaR',
        description: 'Value at Risk model optimized for cryptocurrency portfolios',
        type: 'VaR',
        confidence: 95,
        timeHorizon: '1 day',
        methodology: 'Monte Carlo simulation with fat-tail distributions',
        parameters: { confidence_level: 0.95, simulations: 10000, lookback: 252 },
        accuracy: 89.7,
        lastCalibration: new Date(Date.now() - 86400000 * 7),
        portfolioCount: 234,
        avgPortfolioSize: 12500000
      },
      {
        id: 'risk_002',
        name: 'DeFi Liquidity Risk Model',
        description: 'Assesses liquidity risk across DeFi protocols and pools',
        type: 'liquidity',
        confidence: 90,
        timeHorizon: '7 days',
        methodology: 'Liquidity-adjusted VaR with protocol risk factors',
        parameters: { slippage_threshold: 5, pool_concentration: 0.3 },
        accuracy: 82.4,
        lastCalibration: new Date(Date.now() - 86400000 * 3),
        portfolioCount: 156,
        avgPortfolioSize: 8750000
      },
      {
        id: 'risk_003',
        name: 'Cross-Chain Concentration Risk',
        description: 'Measures concentration risk across different blockchain networks',
        type: 'concentration',
        confidence: 99,
        timeHorizon: '30 days',
        methodology: 'Herfindahl-Hirschman Index with blockchain correlations',
        parameters: { max_concentration: 0.4, correlation_threshold: 0.7 },
        accuracy: 91.2,
        lastCalibration: new Date(Date.now() - 86400000 * 14),
        portfolioCount: 89,
        avgPortfolioSize: 25000000
      }
    ];
  }

  // Client usage analytics
  getClientUsageAnalytics(clientId: string): {
    totalCalls: number;
    avgResponseTime: number;
    errorRate: number;
    popularEndpoints: string[];
    monthlyTrend: number[];
    complianceScore: number;
  } {
    return {
      totalCalls: randomInt(50000, 500000),
      avgResponseTime: 75 + Math.random() * 100,
      errorRate: Math.random() * 3,
      popularEndpoints: [
        '/api/v2/market-data/realtime',
        '/api/v2/analytics/sss-scores',
        '/api/v2/whale-tracking/transactions'
      ],
      monthlyTrend: Array.from({ length: 12 }, () => randomInt(10000, 100000)),
      complianceScore: 85 + Math.random() * 15
    };
  }

  // Generate revenue analytics
  getRevenueAnalytics(): {
    monthlyRevenue: number;
    clientCount: number;
    avgRevenuePerClient: number;
    tierDistribution: Record<string, number>;
    regionDistribution: Record<string, number>;
    growthRate: number;
  } {
    const monthlyRevenue = 1250000 + Math.random() * 500000;
    const clientCount = 127;
    
    return {
      monthlyRevenue,
      clientCount,
      avgRevenuePerClient: monthlyRevenue / clientCount,
      tierDistribution: {
        standard: 45,
        premium: 35,
        enterprise: 15,
        white_label: 5
      },
      regionDistribution: {
        'North America': 40,
        'Europe': 35,
        'Asia Pacific': 20,
        'Others': 5
      },
      growthRate: 15 + Math.random() * 10
    };
  }

  // Helper methods
  private generateRandomClient(index: number): InstitutionalClient {
    const type = this.clientTypes[randomInt(0, this.clientTypes.length)];
    const tier = this.tiers[randomInt(0, this.tiers.length)];
    const region = this.regions[randomInt(0, this.regions.length)];
    
    return {
      id: `client_${String(index).padStart(3, '0')}`,
      name: `${this.getRandomCompanyName()} ${this.getCompanySuffix(type)}`,
      type,
      tier,
      aum: Math.random() * 50000000000,
      region,
      complianceLevel: ['basic', 'enhanced', 'premium'][randomInt(0, 3)] as any,
      apiQuota: {
        daily: randomInt(1000, 100000),
        monthly: randomInt(30000, 3000000),
        used: randomInt(500, 50000)
      },
      features: this.getRandomFeatures(tier),
      onboardingDate: new Date(Date.now() - randomInt(86400000 * 30, 86400000 * 730)),
      lastActive: new Date(Date.now() - randomInt(0, 86400000 * 7)),
      contactInfo: {
        primaryContact: this.getRandomName(),
        email: `contact@${this.getRandomCompanyName().toLowerCase().replace(' ', '')}.com`,
        phone: this.getRandomPhone()
      }
    };
  }

  private getRandomCompanyName(): string {
    const names = [
      'Apex', 'Quantum', 'Digital', 'Alpha', 'Beta', 'Gamma', 'Prime',
      'Global', 'International', 'Strategic', 'Advanced', 'Elite'
    ];
    return names[randomInt(0, names.length)];
  }

  private getCompanySuffix(type: string): string {
    const suffixes = {
      hedge_fund: 'Capital',
      bank: 'Bank',
      exchange: 'Exchange',
      family_office: 'Family Office',
      asset_manager: 'Asset Management',
      broker_dealer: 'Securities'
    };
    return suffixes[type as keyof typeof suffixes];
  }

  private getRandomFeatures(tier: string): string[] {
    const baseFeatures = ['Market Data', 'Basic Analytics'];
    const premiumFeatures = ['Advanced Analytics', 'Custom Alerts', 'API Priority'];
    const enterpriseFeatures = ['White Label', 'Dedicated Support', 'Custom Indicators'];
    
    if (tier === 'enterprise' || tier === 'white_label') {
      return [...baseFeatures, ...premiumFeatures, ...enterpriseFeatures];
    }
    if (tier === 'premium') {
      return [...baseFeatures, ...premiumFeatures];
    }
    return baseFeatures;
  }

  private getRandomName(): string {
    const names = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Davis', 'James Wilson'];
    return names[randomInt(0, names.length)];
  }

  private getRandomPhone(): string {
    return `+1-555-${String(randomInt(1000, 9999))}`;
  }
}

export const institutionalAPIService = new InstitutionalAPIService();
export type { InstitutionalClient, APIMetrics, CustomIndicator, MarketDataFeed, RiskModel };