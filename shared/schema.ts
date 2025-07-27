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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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
