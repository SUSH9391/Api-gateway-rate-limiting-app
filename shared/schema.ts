import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiEndpoints = pgTable("api_endpoints", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().unique(),
  method: text("method").notNull().default("GET"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rateLimitPolicies = pgTable("rate_limit_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  endpointPattern: text("endpoint_pattern").notNull(),
  requestLimit: integer("request_limit").notNull(),
  timeWindow: text("time_window").notNull(), // "1m", "5m", "1h", "1d"
  burstLimit: integer("burst_limit").notNull(),
  userScope: text("user_scope").notNull().default("all"), // all, authenticated, specific
  priority: text("priority").notNull().default("medium"), // high, medium, low
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time").notNull(), // in milliseconds
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isRateLimited: boolean("is_rate_limited").notNull().default(false),
  policyId: integer("policy_id").references(() => rateLimitPolicies.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const tokenBuckets = pgTable("token_buckets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  endpointPattern: text("endpoint_pattern").notNull(),
  tokens: integer("tokens").notNull(),
  lastRefill: timestamp("last_refill").defaultNow().notNull(),
  maxTokens: integer("max_tokens").notNull(),
  refillRate: integer("refill_rate").notNull(), // tokens per second
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  requestLogs: many(requestLogs),
  tokenBuckets: many(tokenBuckets),
}));

export const rateLimitPoliciesRelations = relations(rateLimitPolicies, ({ many }) => ({
  requestLogs: many(requestLogs),
}));

export const requestLogsRelations = relations(requestLogs, ({ one }) => ({
  user: one(users, {
    fields: [requestLogs.userId],
    references: [users.id],
  }),
  policy: one(rateLimitPolicies, {
    fields: [requestLogs.policyId],
    references: [rateLimitPolicies.id],
  }),
}));

export const tokenBucketsRelations = relations(tokenBuckets, ({ one }) => ({
  user: one(users, {
    fields: [tokenBuckets.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertApiEndpointSchema = createInsertSchema(apiEndpoints).omit({
  id: true,
  createdAt: true,
});

export const insertRateLimitPolicySchema = createInsertSchema(rateLimitPolicies).omit({
  id: true,
  createdAt: true,
});

export const insertRequestLogSchema = createInsertSchema(requestLogs).omit({
  id: true,
  timestamp: true,
});

export const insertTokenBucketSchema = createInsertSchema(tokenBuckets).omit({
  id: true,
  lastRefill: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type InsertApiEndpoint = z.infer<typeof insertApiEndpointSchema>;
export type RateLimitPolicy = typeof rateLimitPolicies.$inferSelect;
export type InsertRateLimitPolicy = z.infer<typeof insertRateLimitPolicySchema>;
export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = z.infer<typeof insertRequestLogSchema>;
export type TokenBucket = typeof tokenBuckets.$inferSelect;
export type InsertTokenBucket = z.infer<typeof insertTokenBucketSchema>;
