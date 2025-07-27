import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

// Advanced Multi-Condition Alert System
interface AlertCondition {
  type: 'price' | 'sss_score' | 'volume' | 'sentiment' | 'technical' | 'news' | 'whale_movement';
  operator: 'greater_than' | 'less_than' | 'equals' | 'percentage_change' | 'crosses_above' | 'crosses_below';
  value: number;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  comparison?: 'current' | 'moving_average' | 'previous_period';
}

interface AlertRule {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  conditions: AlertCondition[];
  logic: 'AND' | 'OR'; // How to combine multiple conditions
  channels: Array<'push' | 'email' | 'sms' | 'discord' | 'telegram'>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  cooldown: number; // Minutes between same alert triggers
  lastTriggered?: Date;
  createdAt: Date;
  triggers: number; // Count of times triggered
}

interface TriggeredAlert {
  id: string;
  ruleId: string;
  symbol: string;
  ruleName: string;
  priority: string;
  message: string;
  triggeredConditions: string[];
  currentValues: Record<string, number>;
  timestamp: Date;
  acknowledged: boolean;
  channels: string[];
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
}

interface WhaleMovement {
  wallet: string;
  symbol: string;
  amount: number;
  direction: 'in' | 'out';
  exchange?: string;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
}

export class AdvancedAlertsService {
  private alertRules: Map<string, AlertRule> = new Map();
  private triggeredAlerts: TriggeredAlert[] = [];
  private technicalIndicators: Map<string, TechnicalIndicator[]> = new Map();
  private whaleMovements: WhaleMovement[] = [];

  constructor() {
    this.initializeTechnicalIndicators();
    this.initializeWhaleMovements();
    this.startAlertMonitoring();
  }

  // Initialize mock technical indicators
  private initializeTechnicalIndicators() {
    const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA'];
    
    symbols.forEach(symbol => {
      const indicators: TechnicalIndicator[] = [
        {
          name: 'RSI',
          value: Math.random() * 100,
          signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'sell' : 'neutral',
          strength: Math.random() * 100
        },
        {
          name: 'MACD',
          value: (Math.random() - 0.5) * 2,
          signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'sell' : 'neutral',
          strength: Math.random() * 100
        },
        {
          name: 'Bollinger Bands',
          value: Math.random(),
          signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'sell' : 'neutral',
          strength: Math.random() * 100
        },
        {
          name: 'Moving Average Convergence',
          value: (Math.random() - 0.5) * 10,
          signal: Math.random() > 0.6 ? 'buy' : Math.random() > 0.3 ? 'sell' : 'neutral',
          strength: Math.random() * 100
        }
      ];
      
      this.technicalIndicators.set(symbol, indicators);
    });
  }

  // Initialize mock whale movements
  private initializeWhaleMovements() {
    const symbols = ['BTC', 'ETH', 'SOL'];
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex'];
    
    // Generate some recent whale movements
    for (let i = 0; i < 10; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const movement: WhaleMovement = {
        wallet: `0x${Math.random().toString(16).substr(2, 8)}...`,
        symbol,
        amount: Math.random() * 10000 + 1000,
        direction: Math.random() > 0.5 ? 'in' : 'out',
        exchange: Math.random() > 0.3 ? exchanges[Math.floor(Math.random() * exchanges.length)] : undefined,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };
      this.whaleMovements.push(movement);
    }
  }

  // Create a new alert rule
  public async createAlertRule(userId: string, rule: Omit<AlertRule, 'id' | 'userId' | 'createdAt' | 'triggers' | 'lastTriggered'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...rule,
      id: Math.random().toString(36).substring(7),
      userId,
      createdAt: new Date(),
      triggers: 0
    };

    this.alertRules.set(alertRule.id, alertRule);
    return alertRule;
  }

  // Get alert rules for a user
  public getUserAlertRules(userId: string): AlertRule[] {
    return Array.from(this.alertRules.values()).filter(rule => rule.userId === userId);
  }

  // Update alert rule
  public async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.alertRules.set(ruleId, updatedRule);
    return updatedRule;
  }

  // Delete alert rule
  public async deleteAlertRule(ruleId: string): Promise<boolean> {
    return this.alertRules.delete(ruleId);
  }

  // Get current market data for evaluation
  private async getCurrentMarketData(symbol: string): Promise<{
    price: number;
    sss_score: number;
    volume: number;
    sentiment: number;
    technical: Record<string, number>;
  }> {
    // In production, this would fetch real market data
    // For now, simulate with reasonable values
    const technical = this.technicalIndicators.get(symbol) || [];
    const technicalMap = technical.reduce((acc, indicator) => {
      acc[indicator.name.toLowerCase().replace(/\s+/g, '_')] = indicator.value;
      return acc;
    }, {} as Record<string, number>);

    return {
      price: Math.random() * 100000 + 1000,
      sss_score: Math.random() * 100,
      volume: Math.random() * 1000000 + 100000,
      sentiment: (Math.random() - 0.5) * 2, // -1 to 1
      technical: technicalMap
    };
  }

  // Evaluate a single condition
  private evaluateCondition(condition: AlertCondition, currentData: any): boolean {
    const { type, operator, value } = condition;
    let currentValue: number;

    switch (type) {
      case 'price':
        currentValue = currentData.price;
        break;
      case 'sss_score':
        currentValue = currentData.sss_score;
        break;
      case 'volume':
        currentValue = currentData.volume;
        break;
      case 'sentiment':
        currentValue = currentData.sentiment;
        break;
      case 'technical':
        // For technical indicators, we'll use RSI as default
        currentValue = currentData.technical.rsi || 50;
        break;
      default:
        return false;
    }

    switch (operator) {
      case 'greater_than':
        return currentValue > value;
      case 'less_than':
        return currentValue < value;
      case 'equals':
        return Math.abs(currentValue - value) < 0.01;
      case 'percentage_change':
        // Simplified: assume 5% change for demo
        return Math.abs((currentValue - value) / value * 100) > 5;
      case 'crosses_above':
        return currentValue > value; // Simplified
      case 'crosses_below':
        return currentValue < value; // Simplified
      default:
        return false;
    }
  }

  // Check if alert rule should trigger
  private async shouldTriggerAlert(rule: AlertRule): Promise<{
    shouldTrigger: boolean;
    triggeredConditions: string[];
    currentValues: Record<string, number>;
  }> {
    if (!rule.isActive) {
      return { shouldTrigger: false, triggeredConditions: [], currentValues: {} };
    }

    // Check cooldown
    if (rule.lastTriggered) {
      const cooldownMs = rule.cooldown * 60 * 1000;
      if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
        return { shouldTrigger: false, triggeredConditions: [], currentValues: {} };
      }
    }

    const currentData = await this.getCurrentMarketData(rule.symbol);
    const triggeredConditions: string[] = [];
    const currentValues: Record<string, number> = {
      price: currentData.price,
      sss_score: currentData.sss_score,
      volume: currentData.volume,
      sentiment: currentData.sentiment
    };

    // Evaluate each condition
    const conditionResults = rule.conditions.map(condition => {
      const result = this.evaluateCondition(condition, currentData);
      if (result) {
        triggeredConditions.push(`${condition.type} ${condition.operator} ${condition.value}`);
      }
      return result;
    });

    // Apply logic (AND/OR)
    const shouldTrigger = rule.logic === 'AND' 
      ? conditionResults.every(result => result)
      : conditionResults.some(result => result);

    return { shouldTrigger, triggeredConditions, currentValues };
  }

  // Trigger an alert
  private async triggerAlert(rule: AlertRule, triggeredConditions: string[], currentValues: Record<string, number>) {
    const alert: TriggeredAlert = {
      id: Math.random().toString(36).substring(7),
      ruleId: rule.id,
      symbol: rule.symbol,
      ruleName: rule.name,
      priority: rule.priority,
      message: this.generateAlertMessage(rule, triggeredConditions, currentValues),
      triggeredConditions,
      currentValues,
      timestamp: new Date(),
      acknowledged: false,
      channels: rule.channels
    };

    this.triggeredAlerts.push(alert);

    // Update rule statistics
    rule.triggers++;
    rule.lastTriggered = new Date();
    this.alertRules.set(rule.id, rule);

    // Send notifications (simulated)
    await this.sendNotifications(alert);

    console.log(`🚨 Alert triggered: ${alert.message}`);
    return alert;
  }

  // Generate alert message
  private generateAlertMessage(rule: AlertRule, triggeredConditions: string[], currentValues: Record<string, number>): string {
    const symbol = rule.symbol;
    const price = currentValues.price?.toFixed(2) || 'N/A';
    const sssScore = currentValues.sss_score?.toFixed(1) || 'N/A';
    
    return `🚨 ${rule.name}: ${symbol} - Price: $${price}, SSS: ${sssScore}. Conditions: ${triggeredConditions.join(', ')}`;
  }

  // Send notifications
  private async sendNotifications(alert: TriggeredAlert) {
    // Simulate sending notifications to different channels
    alert.channels.forEach(channel => {
      console.log(`📱 Sending ${alert.priority} alert via ${channel}: ${alert.message}`);
    });
  }

  // Get triggered alerts
  public getTriggeredAlerts(userId: string, limit: number = 50): TriggeredAlert[] {
    // Filter alerts by user's rules
    const userRuleIds = this.getUserAlertRules(userId).map(rule => rule.id);
    return this.triggeredAlerts
      .filter(alert => userRuleIds.includes(alert.ruleId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Acknowledge alert
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.triggeredAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  // Get technical indicators
  public getTechnicalIndicators(symbol: string): TechnicalIndicator[] {
    return this.technicalIndicators.get(symbol) || [];
  }

  // Get whale movements
  public getWhaleMovements(symbol?: string, limit: number = 20): WhaleMovement[] {
    let movements = this.whaleMovements;
    if (symbol) {
      movements = movements.filter(m => m.symbol === symbol);
    }
    return movements
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Start monitoring alerts
  private startAlertMonitoring() {
    setInterval(async () => {
      for (const rule of this.alertRules.values()) {
        try {
          const { shouldTrigger, triggeredConditions, currentValues } = await this.shouldTriggerAlert(rule);
          if (shouldTrigger) {
            await this.triggerAlert(rule, triggeredConditions, currentValues);
          }
        } catch (error) {
          console.error(`Error checking alert rule ${rule.id}:`, error);
        }
      }
    }, 30000); // Check every 30 seconds

    // Generate new whale movements periodically
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every minute
        const symbols = ['BTC', 'ETH', 'SOL'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const movement: WhaleMovement = {
          wallet: `0x${Math.random().toString(16).substr(2, 8)}...`,
          symbol,
          amount: Math.random() * 5000 + 500,
          direction: Math.random() > 0.5 ? 'in' : 'out',
          timestamp: new Date(),
          impact: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
        };
        this.whaleMovements.unshift(movement);
        
        // Keep only last 50 movements
        this.whaleMovements = this.whaleMovements.slice(0, 50);
      }
    }, 60000); // Check every minute
  }
}

// Export service instance
export const advancedAlertsService = new AdvancedAlertsService();

// Register advanced alerts routes
export function registerAdvancedAlertsRoutes(app: Express) {
  // Create alert rule
  app.post('/api/alerts/rules', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const rule = await advancedAlertsService.createAlertRule(userId, req.body);
      res.json(rule);
    } catch (error) {
      console.error('Error creating alert rule:', error);
      res.status(500).json({ message: 'Failed to create alert rule' });
    }
  });

  // Get user's alert rules
  app.get('/api/alerts/rules', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const rules = advancedAlertsService.getUserAlertRules(userId);
      res.json(rules);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
      res.status(500).json({ message: 'Failed to fetch alert rules' });
    }
  });

  // Update alert rule
  app.put('/api/alerts/rules/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const rule = await advancedAlertsService.updateAlertRule(id, req.body);
      if (!rule) {
        return res.status(404).json({ message: 'Alert rule not found' });
      }
      res.json(rule);
    } catch (error) {
      console.error('Error updating alert rule:', error);
      res.status(500).json({ message: 'Failed to update alert rule' });
    }
  });

  // Delete alert rule
  app.delete('/api/alerts/rules/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await advancedAlertsService.deleteAlertRule(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Alert rule not found' });
      }
      res.json({ message: 'Alert rule deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      res.status(500).json({ message: 'Failed to delete alert rule' });
    }
  });

  // Get triggered alerts
  app.get('/api/alerts/triggered', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const alerts = advancedAlertsService.getTriggeredAlerts(userId, limit);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching triggered alerts:', error);
      res.status(500).json({ message: 'Failed to fetch triggered alerts' });
    }
  });

  // Acknowledge alert
  app.post('/api/alerts/acknowledge/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const acknowledged = advancedAlertsService.acknowledgeAlert(id);
      if (!acknowledged) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      res.json({ message: 'Alert acknowledged' });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({ message: 'Failed to acknowledge alert' });
    }
  });

  // Get technical indicators
  app.get('/api/alerts/technical/:symbol', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const indicators = advancedAlertsService.getTechnicalIndicators(symbol.toUpperCase());
      res.json(indicators);
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      res.status(500).json({ message: 'Failed to fetch technical indicators' });
    }
  });

  // Get whale movements
  app.get('/api/alerts/whale-movements/:symbol?', isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const movements = advancedAlertsService.getWhaleMovements(symbol?.toUpperCase(), limit);
      res.json(movements);
    } catch (error) {
      console.error('Error fetching whale movements:', error);
      res.status(500).json({ message: 'Failed to fetch whale movements' });
    }
  });
}