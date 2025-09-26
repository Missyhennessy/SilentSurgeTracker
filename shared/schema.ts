import { pgTable, text, serial, integer, real, timestamp, boolean, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("inactive"), // inactive, active, canceled, past_due
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, pro, premium
  isPremium: boolean("is_premium").default(false),
  isFounder: boolean("is_founder").default(false), // For thennessy01@gmail.com
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription tables
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique().notNull(),
  stripeCustomerId: varchar("stripe_customer_id").notNull(),
  status: varchar("status").notNull(), // active, canceled, incomplete, past_due, etc.
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  plan: varchar("plan").notNull(), // pro, premium
  priceId: varchar("price_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("usd"),
  status: varchar("status").notNull(), // succeeded, failed, pending
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;

export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  marketCap: real("market_cap"),
  volume24h: real("volume_24h"),
  change24h: real("change_24h"),
  sssScore: real("sss_score").notNull().default(0),
  behavioralActivity: real("behavioral_activity").default(0),
  velocityAnomaly: real("velocity_anomaly").default(0),
  communityCohesion: real("community_cohesion").default(0),
  anchorPressure: real("anchor_pressure").default(0),
  hypeToHoldRatio: real("hype_to_hold_ratio").default(0),
  historicalVolatility: real("historical_volatility").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isWatchlisted: boolean("is_watchlisted").default(false),
}, (table) => [
  // Performance indexes for frequently queried columns
  index("idx_crypto_assets_symbol").on(table.symbol),
  index("idx_crypto_assets_sss_score").on(table.sssScore),
  index("idx_crypto_assets_last_updated").on(table.lastUpdated),
  index("idx_crypto_assets_symbol_sss").on(table.symbol, table.sssScore), // Composite index
  index("idx_crypto_assets_watchlisted").on(table.isWatchlisted),
  index("idx_crypto_assets_market_cap").on(table.marketCap),
  index("idx_crypto_assets_volume").on(table.volume24h),
]);

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  threshold: real("threshold").notNull(),
  isActive: boolean("is_active").default(true),
  alertType: text("alert_type").notNull(), // 'sss_score', 'velocity', 'price'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Indexes for alert queries
  index("idx_alerts_asset_id").on(table.assetId),
  index("idx_alerts_is_active").on(table.isActive),
  index("idx_alerts_asset_active").on(table.assetId, table.isActive), // Composite for active alerts
]);

export const velocityData = pgTable("velocity_data", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  timestamp: timestamp("timestamp").defaultNow(),
  velocity: real("velocity").notNull(),
  historicalAverage: real("historical_average").notNull(),
  anomalyScore: real("anomaly_score").notNull(),
}, (table) => [
  // Indexes for velocity data queries
  index("idx_velocity_asset_id").on(table.assetId),
  index("idx_velocity_timestamp").on(table.timestamp),
  index("idx_velocity_asset_time").on(table.assetId, table.timestamp), // For time-series queries
]);

export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({
  id: true,
  lastUpdated: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertVelocityDataSchema = createInsertSchema(velocityData).omit({
  id: true,
});

// API Keys for enterprise access
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  keyName: varchar("key_name").notNull(), // User-friendly name for the key
  keyPrefix: varchar("key_prefix").notNull(), // First 8 chars for identification (e.g., "sst_1234")
  keyHash: varchar("key_hash").notNull(), // Hashed version of the full key
  scopes: jsonb("scopes").$type<string[]>().notNull().default(['read']), // Array of permissions: read, write, admin
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"), // Optional expiration
  usageCount: integer("usage_count").default(0),
  rateLimit: integer("rate_limit").default(1000), // Requests per hour
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Key usage tracking
export const apiKeyUsage = pgTable("api_key_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id).notNull(),
  endpoint: varchar("endpoint").notNull(),
  method: varchar("method").notNull(),
  responseCode: integer("response_code").notNull(),
  responseTime: integer("response_time"), // milliseconds
  userAgent: varchar("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  keyHash: true,
  keyPrefix: true,
  usageCount: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expirationDays: z.number().optional(), // Helper field for easier expiration setting
});

export const insertApiKeyUsageSchema = createInsertSchema(apiKeyUsage).omit({
  id: true,
  createdAt: true,
});

export type CryptoAsset = typeof cryptoAssets.$inferSelect;
export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type VelocityData = typeof velocityData.$inferSelect;
export type InsertVelocityData = z.infer<typeof insertVelocityDataSchema>;

// Behavioral Heatmap Data Types
export interface BehavioralMetrics {
  whaleMovements: number;
  retailActivity: number;
  institutionalFlow: number;
  hodlerBehavior: number;
  tradingVelocity: number;
  socialSentiment: number;
}

export interface TimeSlotData {
  hour: number;
  day: number;
  activity: number;
  whaleCount: number;
  volume: number;
  sentiment: number;
}

export interface BehavioralHeatmapData {
  symbol: string;
  name: string;
  price: number;
  sssScore: number;
  confidence: number;
  deviation: number;
  influence: number;
  behavioralMetrics: BehavioralMetrics;
  timeSlots: TimeSlotData[][];
  lastUpdated: string;
}
// Flow Intelligence - Whale Transactions
export const whaleTransactions = pgTable("whale_transactions", {
  id: serial("id").primaryKey(),
  transactionHash: varchar("transaction_hash").unique().notNull(),
  assetSymbol: varchar("asset_symbol").notNull(),
  fromAddress: varchar("from_address").notNull(),
  toAddress: varchar("to_address").notNull(),
  amount: real("amount").notNull(),
  amountUsd: real("amount_usd").notNull(),
  transactionType: varchar("transaction_type").notNull(), // 'buy', 'sell', 'transfer'
  exchangeName: varchar("exchange_name"), // null if not exchange-related
  blockNumber: integer("block_number"),
  blockTimestamp: timestamp("block_timestamp").notNull(),
  gasUsed: integer("gas_used"),
  gasPriceGwei: real("gas_price_gwei"),
  sssScoreAtTime: real("sss_score_at_time"), // SSS score when transaction occurred
  priceImpact: real("price_impact"), // Price impact percentage
  isSmartMoney: boolean("is_smart_money").default(false),
  walletLabel: varchar("wallet_label"), // Exchange, Institution, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Exchange Flow Analytics
export const exchangeFlows = pgTable("exchange_flows", {
  id: serial("id").primaryKey(),
  exchangeName: varchar("exchange_name").notNull(),
  assetSymbol: varchar("asset_symbol").notNull(),
  flowType: varchar("flow_type").notNull(), // 'inflow', 'outflow'
  amount: real("amount").notNull(),
  amountUsd: real("amount_usd").notNull(),
  avgTransactionSize: real("avg_transaction_size"),
  transactionCount: integer("transaction_count").default(1),
  timeframe: varchar("timeframe").notNull(), // '1h', '24h', '7d'
  netFlow: real("net_flow"), // inflow - outflow
  flowVelocity: real("flow_velocity"), // rate of flow change
  isAnomaly: boolean("is_anomaly").default(false),
  anomalyScore: real("anomaly_score").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Liquidity Pool Events
export const liquidityEvents = pgTable("liquidity_events", {
  id: serial("id").primaryKey(),
  poolAddress: varchar("pool_address").notNull(),
  dexName: varchar("dex_name").notNull(), // Uniswap, SushiSwap, etc.
  token0Symbol: varchar("token0_symbol").notNull(),
  token1Symbol: varchar("token1_symbol").notNull(),
  eventType: varchar("event_type").notNull(), // 'mint', 'burn', 'swap'
  amount0: real("amount0").notNull(),
  amount1: real("amount1").notNull(),
  amountUsd: real("amount_usd").notNull(),
  liquidityChange: real("liquidity_change"), // positive for add, negative for remove
  priceAfter: real("price_after"),
  priceBefore: real("price_before"),
  priceImpact: real("price_impact"),
  transactionHash: varchar("transaction_hash").notNull(),
  blockNumber: integer("block_number"),
  logIndex: integer("log_index"),
  userAddress: varchar("user_address"),
  isLargeTransaction: boolean("is_large_transaction").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Smart Money Wallets
export const smartMoneyWallets = pgTable("smart_money_wallets", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address").unique().notNull(),
  walletLabel: varchar("wallet_label").notNull(), // Institution name, Known Trader, etc.
  walletType: varchar("wallet_type").notNull(), // 'institution', 'whale', 'smart_trader', 'exchange'
  totalBalance: real("total_balance"),
  balanceUsd: real("balance_usd"),
  successRate: real("success_rate").default(0), // Historical success rate
  avgHoldTime: integer("avg_hold_time"), // Average holding time in hours
  riskScore: real("risk_score").default(50), // 0-100 risk assessment
  isActive: boolean("is_active").default(true),
  firstSeenAt: timestamp("first_seen_at"),
  lastActivityAt: timestamp("last_activity_at"),
  totalTransactions: integer("total_transactions").default(0),
  profitLoss: real("profit_loss").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cohort Flow Analysis
export const cohortFlows = pgTable("cohort_flows", {
  id: serial("id").primaryKey(),
  cohortType: varchar("cohort_type").notNull(), // 'whale', 'retail', 'institution', 'smart_money'
  assetSymbol: varchar("asset_symbol").notNull(),
  flowDirection: varchar("flow_direction").notNull(), // 'accumulating', 'distributing', 'holding'
  totalAmount: real("total_amount").notNull(),
  totalAmountUsd: real("total_amount_usd").notNull(),
  transactionCount: integer("transaction_count").notNull(),
  uniqueWallets: integer("unique_wallets").notNull(),
  avgTransactionSize: real("avg_transaction_size"),
  flowStrength: real("flow_strength"), // 0-100 intensity of the flow
  timeframe: varchar("timeframe").notNull(), // '1h', '4h', '24h'
  correlationWithSss: real("correlation_with_sss"), // Correlation with SSS changes
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertWhaleTransactionSchema = createInsertSchema(whaleTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertExchangeFlowSchema = createInsertSchema(exchangeFlows).omit({
  id: true,
  timestamp: true,
});

export const insertLiquidityEventSchema = createInsertSchema(liquidityEvents).omit({
  id: true,
  timestamp: true,
});

export const insertSmartMoneyWalletSchema = createInsertSchema(smartMoneyWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCohortFlowSchema = createInsertSchema(cohortFlows).omit({
  id: true,
  timestamp: true,
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;
export type InsertApiKeyUsage = z.infer<typeof insertApiKeyUsageSchema>;

// Flow Intelligence Types
export type WhaleTransaction = typeof whaleTransactions.$inferSelect;
export type InsertWhaleTransaction = z.infer<typeof insertWhaleTransactionSchema>;
export type ExchangeFlow = typeof exchangeFlows.$inferSelect;
export type InsertExchangeFlow = z.infer<typeof insertExchangeFlowSchema>;
export type LiquidityEvent = typeof liquidityEvents.$inferSelect;
export type InsertLiquidityEvent = z.infer<typeof insertLiquidityEventSchema>;
export type SmartMoneyWallet = typeof smartMoneyWallets.$inferSelect;
export type InsertSmartMoneyWallet = z.infer<typeof insertSmartMoneyWalletSchema>;
export type CohortFlow = typeof cohortFlows.$inferSelect;
export type InsertCohortFlow = z.infer<typeof insertCohortFlowSchema>;

// Historical Volume Data for Real Anomaly Detection
export const historicalVolumeData = pgTable("historical_volume_data", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id).notNull(),
  assetSymbol: varchar("asset_symbol").notNull(),
  volume24h: real("volume_24h").notNull(),
  price: real("price").notNull(),
  marketCap: real("market_cap"),
  timestamp: timestamp("timestamp").notNull(),
  source: varchar("source").notNull(), // 'coingecko', 'cryptocompare', 'mobula'
  timeframe: varchar("timeframe").notNull().default("24h"), // '1h', '4h', '24h'
});

// Volume Anomaly Detection
export const volumeAnomalies = pgTable("volume_anomalies", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id).notNull(),
  assetSymbol: varchar("asset_symbol").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  currentVolume: real("current_volume").notNull(),
  historicalAverage: real("historical_average").notNull(),
  percentageChange: real("percentage_change").notNull(),
  zScore: real("z_score").notNull(),
  anomalyScore: real("anomaly_score").notNull(), // 0-100 confidence score
  anomalyType: varchar("anomaly_type").notNull(), // 'spike', 'drop', 'sustained_high', 'sustained_low'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  detectionMethod: varchar("detection_method").notNull(), // 'zscore', 'iqr', 'ml_ensemble', 'isolation_forest'
  priceCorrelation: real("price_correlation"), // Correlation with price movement
  marketCapImpact: real("market_cap_impact"), // Impact on market cap
  exchangeBreakdown: jsonb("exchange_breakdown").$type<Record<string, number>>(), // Volume by exchange
  timeframe: varchar("timeframe").notNull().default("24h"), // '1h', '4h', '24h', '7d'
  isConfirmed: boolean("is_confirmed").default(false),
  alertTriggered: boolean("alert_triggered").default(false),
  sssImpact: real("sss_impact"), // Impact on SSS score
  volumePattern: jsonb("volume_pattern").$type<{
    trend: 'increasing' | 'decreasing' | 'volatile' | 'stable';
    momentum: number;
    acceleration: number;
    volatility: number;
  }>(),
  metadata: jsonb("metadata").$type<{
    news?: string[];
    social_sentiment?: number;
    whale_activity?: boolean;
    exchange_listings?: string[];
    technical_indicators?: Record<string, number>;
  }>(),
});

// Volume Pattern Analysis
export const volumePatterns = pgTable("volume_patterns", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id).notNull(),
  patternType: varchar("pattern_type").notNull(), // 'accumulation', 'distribution', 'breakout', 'reversal'
  confidence: real("confidence").notNull(), // 0-1 confidence score
  duration: integer("duration").notNull(), // Pattern duration in hours
  volumeProfile: jsonb("volume_profile").$type<{
    peak_times: string[];
    distribution: Record<string, number>;
    intensity: number;
  }>(),
  priceAction: jsonb("price_action").$type<{
    support_levels: number[];
    resistance_levels: number[];
    breakout_probability: number;
  }>(),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true),
  accuracy: real("accuracy"), // Historical accuracy of this pattern type
});

// ML Model Performance for Volume Detection
export const volumeModelPerformance = pgTable("volume_model_performance", {
  id: serial("id").primaryKey(),
  modelName: varchar("model_name").notNull(),
  modelVersion: varchar("model_version").notNull(),
  testPeriod: jsonb("test_period").$type<{
    start_date: string;
    end_date: string;
    sample_size: number;
  }>(),
  metrics: jsonb("metrics").$type<{
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    auc_roc: number;
  }>(),
  anomalyTypeAccuracy: jsonb("anomaly_type_accuracy").$type<Record<string, number>>(),
  lastEvaluatedAt: timestamp("last_evaluated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Comprehensive Schema Extensions for Institutional Features

// Market Sentiment Analysis
export const marketSentiment = pgTable("market_sentiment", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  timestamp: timestamp("timestamp").defaultNow(),
  overallScore: real("overall_score").notNull(), // -100 to 100
  sources: jsonb("sources").$type<{
    twitter: number;
    reddit: number;
    discord: number;
    telegram: number;
    news: number;
  }>(),
  fearGreedIndex: real("fear_greed_index"),
  trendingTopics: jsonb("trending_topics").$type<string[]>(),
  influencerScore: real("influencer_score"),
});

// Portfolio Tracking
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  totalValue: real("total_value").default(0),
  allocations: jsonb("allocations").$type<Record<string, number>>(), // symbol -> percentage
  riskProfile: varchar("risk_profile").default("moderate"), // conservative, moderate, aggressive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Management Metrics
export const riskMetrics = pgTable("risk_metrics", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  timestamp: timestamp("timestamp").defaultNow(),
  var95: real("var_95"), // Value at Risk 95%
  var99: real("var_99"), // Value at Risk 99%
  sharpeRatio: real("sharpe_ratio"),
  maxDrawdown: real("max_drawdown"),
  beta: real("beta"), // Market beta
  correlation: jsonb("correlation").$type<Record<string, number>>(),
  exposures: jsonb("exposures").$type<{
    byAsset: Record<string, number>;
    bySector: Record<string, number>;
    byExchange: Record<string, number>;
  }>(),
});

// Trading Signals
export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  signalType: varchar("signal_type").notNull(), // buy, sell, hold
  confidence: real("confidence").notNull(), // 0-100
  aiModel: varchar("ai_model").notNull(), // lstm, ensemble, hybrid
  technicalScore: real("technical_score"),
  fundamentalScore: real("fundamental_score"),
  sentimentScore: real("sentiment_score"),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  timeHorizon: varchar("time_horizon"), // short, medium, long
  accuracy: real("accuracy"), // Historical accuracy
  isActive: boolean("is_active").default(true),
  triggeredAt: timestamp("triggered_at").defaultNow(),
});

// Advanced Alert System
export const advancedAlerts = pgTable("advanced_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  conditions: jsonb("conditions").$type<{
    assets: string[];
    triggers: {
      type: 'price' | 'volume' | 'sss' | 'sentiment' | 'whale' | 'technical';
      operator: 'above' | 'below' | 'crosses' | 'diverges';
      value: number;
      timeframe?: string;
    }[];
    logic: 'AND' | 'OR';
  }>(),
  channels: jsonb("channels").$type<{
    email: boolean;
    push: boolean;
    sms: boolean;
    discord?: string;
  }>(),
  isActive: boolean("is_active").default(true),
  triggeredCount: integer("triggered_count").default(0),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Backtesting Results
export const backtestResults = pgTable("backtest_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  strategyName: varchar("strategy_name").notNull(),
  parameters: jsonb("parameters").$type<Record<string, any>>(),
  timeframe: jsonb("timeframe").$type<{
    start: string;
    end: string;
  }>(),
  assets: jsonb("assets").$type<string[]>(),
  results: jsonb("results").$type<{
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    sortino: number;
  }>(),
  trades: jsonb("trades").$type<{
    timestamp: string;
    asset: string;
    action: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl?: number;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for volume anomaly detection
export const insertHistoricalVolumeDataSchema = createInsertSchema(historicalVolumeData).omit({
  id: true,
});

export const insertVolumeAnomalySchema = createInsertSchema(volumeAnomalies).omit({
  id: true,
  timestamp: true,
});

export const insertVolumePatternSchema = createInsertSchema(volumePatterns).omit({
  id: true,
});

export const insertVolumeModelPerformanceSchema = createInsertSchema(volumeModelPerformance).omit({
  id: true,
  lastEvaluatedAt: true,
});

// Volume Anomaly Types
export type HistoricalVolumeData = typeof historicalVolumeData.$inferSelect;
export type InsertHistoricalVolumeData = z.infer<typeof insertHistoricalVolumeDataSchema>;
export type VolumeAnomaly = typeof volumeAnomalies.$inferSelect;
export type InsertVolumeAnomaly = z.infer<typeof insertVolumeAnomalySchema>;
export type VolumePattern = typeof volumePatterns.$inferSelect;
export type InsertVolumePattern = z.infer<typeof insertVolumePatternSchema>;
export type VolumeModelPerformance = typeof volumeModelPerformance.$inferSelect;
export type InsertVolumeModelPerformance = z.infer<typeof insertVolumeModelPerformanceSchema>;

// Comprehensive Feature Types
export type MarketSentiment = typeof marketSentiment.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type RiskMetrics = typeof riskMetrics.$inferSelect;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type AdvancedAlert = typeof advancedAlerts.$inferSelect;
export type BacktestResult = typeof backtestResults.$inferSelect;

// Insert schemas for comprehensive features
export const insertMarketSentimentSchema = createInsertSchema(marketSentiment).omit({
  id: true,
  timestamp: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskMetricsSchema = createInsertSchema(riskMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  triggeredAt: true,
});

export const insertAdvancedAlertSchema = createInsertSchema(advancedAlerts).omit({
  id: true,
  triggeredCount: true,
  lastTriggered: true,
  createdAt: true,
});

export const insertBacktestResultSchema = createInsertSchema(backtestResults).omit({
  id: true,
  createdAt: true,
});

// Insert types
export type InsertMarketSentiment = z.infer<typeof insertMarketSentimentSchema>;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type InsertRiskMetrics = z.infer<typeof insertRiskMetricsSchema>;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type InsertAdvancedAlert = z.infer<typeof insertAdvancedAlertSchema>;
export type InsertBacktestResult = z.infer<typeof insertBacktestResultSchema>;
