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
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  threshold: real("threshold").notNull(),
  isActive: boolean("is_active").default(true),
  alertType: text("alert_type").notNull(), // 'sss_score', 'velocity', 'price'
  createdAt: timestamp("created_at").defaultNow(),
});

export const velocityData = pgTable("velocity_data", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  timestamp: timestamp("timestamp").defaultNow(),
  velocity: real("velocity").notNull(),
  historicalAverage: real("historical_average").notNull(),
  anomalyScore: real("anomaly_score").notNull(),
});

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

export type CryptoAsset = typeof cryptoAssets.$inferSelect;
export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type VelocityData = typeof velocityData.$inferSelect;
export type InsertVelocityData = z.infer<typeof insertVelocityDataSchema>;
