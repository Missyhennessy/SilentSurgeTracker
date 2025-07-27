import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";

// Macro Economic Integration Service
interface EconomicEvent {
  id: string;
  title: string;
  description: string;
  category: 'monetary_policy' | 'inflation' | 'employment' | 'gdp' | 'commodity' | 'currency' | 'geopolitical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  country: string;
  currency: string;
  scheduledTime: Date;
  actualTime?: Date;
  forecast?: string;
  actual?: string;
  previous?: string;
  market_impact: {
    traditional: 'positive' | 'negative' | 'neutral';
    crypto: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0-100
  };
  affected_assets: string[];
}

interface MarketCorrelation {
  asset: string;
  correlations: {
    sp500: number;
    gold: number;
    dxy: number; // Dollar Index
    oil: number;
    bonds_10y: number;
    nasdaq: number;
    vix: number; // Volatility Index
  };
  strength: 'weak' | 'moderate' | 'strong';
  timeframe: '1d' | '7d' | '30d' | '90d';
  last_updated: Date;
}

interface InflationData {
  country: string;
  cpi: number; // Consumer Price Index
  core_cpi: number;
  ppi: number; // Producer Price Index
  month: string;
  year_over_year: number;
  month_over_month: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  crypto_impact: {
    score: number; // -100 to 100
    reasoning: string;
  };
}

interface CurrencyStrength {
  currency: string;
  strength_index: number; // 0-100
  change_24h: number;
  change_7d: number;
  change_30d: number;
  vs_major_currencies: {
    EUR: number;
    GBP: number;
    JPY: number;
    CHF: number;
    CAD: number;
    AUD: number;
  };
  crypto_correlation: number; // -1 to 1
}

interface GlobalRiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'extreme';
  risk_score: number; // 0-100
  factors: {
    geopolitical: number;
    economic: number;
    financial: number;
    regulatory: number;
    technological: number;
  };
  safe_haven_flows: {
    to_gold: boolean;
    to_usd: boolean;
    to_crypto: boolean;
    to_bonds: boolean;
  };
  market_sentiment: 'risk_on' | 'risk_off' | 'neutral';
  recommendation: string;
  last_updated: Date;
}

export class MacroEconomicService {
  private economicEvents: EconomicEvent[] = [];
  private marketCorrelations: Map<string, MarketCorrelation> = new Map();
  private inflationData: Map<string, InflationData> = new Map();
  private currencyStrengths: Map<string, CurrencyStrength> = new Map();
  private riskAssessment: GlobalRiskAssessment;

  constructor() {
    this.initializeEconomicEvents();
    this.initializeMarketCorrelations();
    this.initializeInflationData();
    this.initializeCurrencyData();
    this.riskAssessment = this.generateRiskAssessment();
    this.startMacroMonitoring();
  }

  // Initialize upcoming economic events
  private initializeEconomicEvents() {
    const events: EconomicEvent[] = [
      {
        id: '1',
        title: 'Federal Reserve Interest Rate Decision',
        description: 'FOMC announces monetary policy decision and interest rate changes',
        category: 'monetary_policy',
        impact: 'critical',
        country: 'US',
        currency: 'USD',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        forecast: '5.25%',
        previous: '5.25%',
        market_impact: {
          traditional: 'negative',
          crypto: 'positive',
          confidence: 85
        },
        affected_assets: ['BTC', 'ETH', 'SOL']
      },
      {
        id: '2',
        title: 'US Consumer Price Index (CPI)',
        description: 'Monthly inflation data release',
        category: 'inflation',
        impact: 'high',
        country: 'US',
        currency: 'USD',
        scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        forecast: '3.2%',
        previous: '3.4%',
        market_impact: {
          traditional: 'neutral',
          crypto: 'positive',
          confidence: 70
        },
        affected_assets: ['BTC', 'ETH']
      },
      {
        id: '3',
        title: 'European Central Bank Monetary Policy',
        description: 'ECB announces policy decisions and economic projections',
        category: 'monetary_policy',
        impact: 'high',
        country: 'EU',
        currency: 'EUR',
        scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        forecast: 'Hold at 4.0%',
        previous: '4.0%',
        market_impact: {
          traditional: 'neutral',
          crypto: 'neutral',
          confidence: 60
        },
        affected_assets: ['BTC', 'ETH']
      },
      {
        id: '4',
        title: 'US Non-Farm Payrolls',
        description: 'Monthly employment data and unemployment rate',
        category: 'employment',
        impact: 'medium',
        country: 'US',
        currency: 'USD',
        scheduledTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        forecast: '200K',
        previous: '216K',
        market_impact: {
          traditional: 'positive',
          crypto: 'neutral',
          confidence: 55
        },
        affected_assets: ['BTC']
      }
    ];

    this.economicEvents = events;
  }

  // Initialize market correlations
  private initializeMarketCorrelations() {
    const cryptoAssets = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'];
    
    cryptoAssets.forEach(asset => {
      const correlation: MarketCorrelation = {
        asset,
        correlations: {
          sp500: -0.1 + Math.random() * 0.8, // -0.1 to 0.7
          gold: 0.1 + Math.random() * 0.4, // 0.1 to 0.5
          dxy: -0.6 + Math.random() * 0.4, // -0.6 to -0.2 (negative correlation with USD)
          oil: -0.2 + Math.random() * 0.6, // -0.2 to 0.4
          bonds_10y: -0.4 + Math.random() * 0.6, // -0.4 to 0.2
          nasdaq: 0.2 + Math.random() * 0.6, // 0.2 to 0.8
          vix: -0.3 + Math.random() * 0.2 // -0.3 to -0.1 (negative correlation with volatility)
        },
        strength: Math.random() > 0.6 ? 'strong' : Math.random() > 0.3 ? 'moderate' : 'weak',
        timeframe: '30d',
        last_updated: new Date()
      };
      
      this.marketCorrelations.set(asset, correlation);
    });
  }

  // Initialize inflation data
  private initializeInflationData() {
    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'EU', name: 'European Union' },
      { code: 'UK', name: 'United Kingdom' },
      { code: 'JP', name: 'Japan' },
      { code: 'CN', name: 'China' }
    ];

    countries.forEach(country => {
      const yoy = 2.0 + Math.random() * 4.0; // 2-6% year-over-year
      const inflation: InflationData = {
        country: country.code,
        cpi: 100 + Math.random() * 20,
        core_cpi: 100 + Math.random() * 15,
        ppi: 100 + Math.random() * 25,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        year_over_year: yoy,
        month_over_month: -0.2 + Math.random() * 0.8, // -0.2% to 0.6%
        trend: yoy > 3.5 ? 'increasing' : yoy < 2.5 ? 'decreasing' : 'stable',
        crypto_impact: {
          score: yoy > 4 ? 40 + Math.random() * 40 : -20 + Math.random() * 40, // High inflation = positive for crypto
          reasoning: yoy > 4 ? 'High inflation drives demand for alternative stores of value' : 
                    yoy < 2 ? 'Low inflation reduces crypto as inflation hedge' :
                    'Moderate inflation has mixed impact on crypto demand'
        }
      };
      
      this.inflationData.set(country.code, inflation);
    });
  }

  // Initialize currency strength data
  private initializeCurrencyData() {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    
    currencies.forEach(currency => {
      const strength: CurrencyStrength = {
        currency,
        strength_index: 40 + Math.random() * 20, // 40-60 range
        change_24h: -2 + Math.random() * 4, // -2% to 2%
        change_7d: -5 + Math.random() * 10, // -5% to 5%
        change_30d: -10 + Math.random() * 20, // -10% to 10%
        vs_major_currencies: {
          EUR: -0.05 + Math.random() * 0.1,
          GBP: -0.05 + Math.random() * 0.1,
          JPY: -0.05 + Math.random() * 0.1,
          CHF: -0.05 + Math.random() * 0.1,
          CAD: -0.05 + Math.random() * 0.1,
          AUD: -0.05 + Math.random() * 0.1
        },
        crypto_correlation: currency === 'USD' ? -0.4 + Math.random() * 0.2 : -0.2 + Math.random() * 0.4
      };
      
      this.currencyStrengths.set(currency, strength);
    });
  }

  // Generate global risk assessment
  private generateRiskAssessment(): GlobalRiskAssessment {
    const factors = {
      geopolitical: Math.random() * 100,
      economic: Math.random() * 100,
      financial: Math.random() * 100,
      regulatory: Math.random() * 100,
      technological: Math.random() * 100
    };

    const risk_score = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / 5;
    
    let overall_risk: 'low' | 'medium' | 'high' | 'extreme';
    if (risk_score < 25) overall_risk = 'low';
    else if (risk_score < 50) overall_risk = 'medium';
    else if (risk_score < 75) overall_risk = 'high';
    else overall_risk = 'extreme';

    return {
      overall_risk,
      risk_score,
      factors,
      safe_haven_flows: {
        to_gold: risk_score > 60,
        to_usd: risk_score > 70,
        to_crypto: risk_score > 50 && risk_score < 80, // Moderate risk favors crypto
        to_bonds: risk_score > 65
      },
      market_sentiment: risk_score > 60 ? 'risk_off' : risk_score < 40 ? 'risk_on' : 'neutral',
      recommendation: this.generateRiskRecommendation(overall_risk, risk_score),
      last_updated: new Date()
    };
  }

  // Generate risk-based recommendation
  private generateRiskRecommendation(riskLevel: string, score: number): string {
    switch (riskLevel) {
      case 'low':
        return 'Low global risk environment. Consider growth-oriented crypto assets with higher risk tolerance.';
      case 'medium':
        return 'Moderate risk environment. Balanced approach between established and emerging crypto assets recommended.';
      case 'high':
        return 'Elevated risk environment. Focus on established cryptocurrencies and reduce position sizes.';
      case 'extreme':
        return 'Extreme risk environment. Consider defensive positioning and cash preservation strategies.';
      default:
        return 'Monitor risk factors closely and adjust portfolio accordingly.';
    }
  }

  // Get upcoming economic events
  public getUpcomingEvents(days: number = 30): EconomicEvent[] {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.economicEvents
      .filter(event => event.scheduledTime <= cutoffDate)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  // Get market correlations
  public getMarketCorrelations(asset?: string): MarketCorrelation[] | MarketCorrelation | null {
    if (asset) {
      return this.marketCorrelations.get(asset) || null;
    }
    return Array.from(this.marketCorrelations.values());
  }

  // Get inflation data
  public getInflationData(country?: string): InflationData[] | InflationData | null {
    if (country) {
      return this.inflationData.get(country) || null;
    }
    return Array.from(this.inflationData.values());
  }

  // Get currency strength data
  public getCurrencyStrengths(currency?: string): CurrencyStrength[] | CurrencyStrength | null {
    if (currency) {
      return this.currencyStrengths.get(currency) || null;
    }
    return Array.from(this.currencyStrengths.values());
  }

  // Get global risk assessment
  public getRiskAssessment(): GlobalRiskAssessment {
    return this.riskAssessment;
  }

  // Analyze economic impact on crypto
  public analyzeEconomicImpact(symbol: string): {
    symbol: string;
    overall_sentiment: 'bullish' | 'bearish' | 'neutral';
    impact_score: number; // -100 to 100
    key_factors: Array<{
      factor: string;
      impact: number;
      reasoning: string;
    }>;
    upcoming_events: EconomicEvent[];
    correlations: MarketCorrelation | null;
    recommendation: string;
    timestamp: Date;
  } {
    const correlations = this.marketCorrelations.get(symbol);
    const upcomingEvents = this.getUpcomingEvents(7).filter(event => 
      event.affected_assets.includes(symbol)
    );
    const riskAssessment = this.getRiskAssessment();
    const usdStrength = this.currencyStrengths.get('USD');
    const usInflation = this.inflationData.get('US');

    const factors = [];
    let impact_score = 0;

    // USD strength impact
    if (usdStrength && correlations) {
      const usdImpact = usdStrength.change_7d * correlations.correlations.dxy * -1; // Negative correlation
      factors.push({
        factor: 'USD Strength',
        impact: usdImpact,
        reasoning: `${usdStrength.change_7d > 0 ? 'Strengthening' : 'Weakening'} USD ${usdStrength.change_7d > 0 ? 'negative' : 'positive'} for crypto`
      });
      impact_score += usdImpact;
    }

    // Inflation impact
    if (usInflation) {
      const inflationImpact = usInflation.crypto_impact.score * 0.3;
      factors.push({
        factor: 'Inflation Environment',
        impact: inflationImpact,
        reasoning: usInflation.crypto_impact.reasoning
      });
      impact_score += inflationImpact;
    }

    // Risk environment impact
    const riskImpact = riskAssessment.safe_haven_flows.to_crypto ? 20 : 
                      riskAssessment.overall_risk === 'extreme' ? -30 : 0;
    factors.push({
      factor: 'Global Risk Environment',
      impact: riskImpact,
      reasoning: `${riskAssessment.overall_risk} risk environment ${riskImpact > 0 ? 'favors' : 'pressures'} crypto assets`
    });
    impact_score += riskImpact;

    // Upcoming events impact
    const eventsImpact = upcomingEvents.reduce((sum, event) => {
      const eventImpact = event.market_impact.crypto === 'positive' ? 15 :
                         event.market_impact.crypto === 'negative' ? -15 : 0;
      return sum + (eventImpact * (event.market_impact.confidence / 100));
    }, 0);
    
    if (upcomingEvents.length > 0) {
      factors.push({
        factor: 'Upcoming Economic Events',
        impact: eventsImpact,
        reasoning: `${upcomingEvents.length} upcoming events with ${eventsImpact > 0 ? 'positive' : eventsImpact < 0 ? 'negative' : 'neutral'} outlook`
      });
      impact_score += eventsImpact;
    }

    const overall_sentiment: 'bullish' | 'bearish' | 'neutral' = 
      impact_score > 20 ? 'bullish' : 
      impact_score < -20 ? 'bearish' : 'neutral';

    const recommendation = this.generateEconomicRecommendation(overall_sentiment, impact_score, factors);

    return {
      symbol,
      overall_sentiment,
      impact_score,
      key_factors: factors,
      upcoming_events: upcomingEvents,
      correlations,
      recommendation,
      timestamp: new Date()
    };
  }

  // Generate economic recommendation
  private generateEconomicRecommendation(sentiment: string, score: number, factors: any[]): string {
    const strongestFactor = factors.reduce((max, factor) => 
      Math.abs(factor.impact) > Math.abs(max.impact) ? factor : max
    );

    switch (sentiment) {
      case 'bullish':
        return `Strong macro tailwinds with ${strongestFactor.factor} as primary driver. Consider increasing position.`;
      case 'bearish':
        return `Macro headwinds present with ${strongestFactor.factor} as main concern. Consider reducing exposure.`;
      default:
        return `Mixed macro signals. Monitor ${strongestFactor.factor} closely for directional clarity.`;
    }
  }

  // Start monitoring macro economic data
  private startMacroMonitoring() {
    // Update risk assessment every hour
    setInterval(() => {
      this.riskAssessment = this.generateRiskAssessment();
    }, 60 * 60 * 1000);

    // Update currency strengths every 15 minutes
    setInterval(() => {
      this.currencyStrengths.forEach((strength, currency) => {
        strength.change_24h = -2 + Math.random() * 4;
        strength.strength_index = Math.max(0, Math.min(100, strength.strength_index + (-1 + Math.random() * 2)));
        this.currencyStrengths.set(currency, strength);
      });
    }, 15 * 60 * 1000);

    // Update correlations daily
    setInterval(() => {
      this.initializeMarketCorrelations();
    }, 24 * 60 * 60 * 1000);
  }
}

// Export service instance
export const macroEconomicService = new MacroEconomicService();

// Register macro economic routes
export function registerMacroEconomicRoutes(app: Express) {
  // Get upcoming economic events
  app.get('/api/macro/events', isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const events = macroEconomicService.getUpcomingEvents(days);
      res.json(events);
    } catch (error) {
      console.error('Error fetching economic events:', error);
      res.status(500).json({ message: 'Failed to fetch economic events' });
    }
  });

  // Get market correlations
  app.get('/api/macro/correlations/:asset?', isAuthenticated, async (req, res) => {
    try {
      const { asset } = req.params;
      const correlations = macroEconomicService.getMarketCorrelations(asset?.toUpperCase());
      res.json(correlations);
    } catch (error) {
      console.error('Error fetching market correlations:', error);
      res.status(500).json({ message: 'Failed to fetch market correlations' });
    }
  });

  // Get inflation data
  app.get('/api/macro/inflation/:country?', isAuthenticated, async (req, res) => {
    try {
      const { country } = req.params;
      const inflation = macroEconomicService.getInflationData(country?.toUpperCase());
      res.json(inflation);
    } catch (error) {
      console.error('Error fetching inflation data:', error);
      res.status(500).json({ message: 'Failed to fetch inflation data' });
    }
  });

  // Get currency strengths
  app.get('/api/macro/currencies/:currency?', isAuthenticated, async (req, res) => {
    try {
      const { currency } = req.params;
      const strengths = macroEconomicService.getCurrencyStrengths(currency?.toUpperCase());
      res.json(strengths);
    } catch (error) {
      console.error('Error fetching currency data:', error);
      res.status(500).json({ message: 'Failed to fetch currency data' });
    }
  });

  // Get global risk assessment
  app.get('/api/macro/risk', isAuthenticated, async (req, res) => {
    try {
      const risk = macroEconomicService.getRiskAssessment();
      res.json(risk);
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      res.status(500).json({ message: 'Failed to fetch risk assessment' });
    }
  });

  // Get economic impact analysis for a specific asset
  app.get('/api/macro/impact/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const analysis = macroEconomicService.analyzeEconomicImpact(symbol.toUpperCase());
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing economic impact:', error);
      res.status(500).json({ message: 'Failed to analyze economic impact' });
    }
  });
}