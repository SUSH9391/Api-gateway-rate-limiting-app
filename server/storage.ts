import { 
  users, 
  apiEndpoints, 
  rateLimitPolicies, 
  requestLogs, 
  tokenBuckets,
  type User, 
  type InsertUser,
  type ApiEndpoint,
  type InsertApiEndpoint,
  type RateLimitPolicy,
  type InsertRateLimitPolicy,
  type RequestLog,
  type InsertRequestLog,
  type TokenBucket,
  type InsertTokenBucket
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  
  // API Endpoints
  getApiEndpoint(id: number): Promise<ApiEndpoint | undefined>;
  getApiEndpoints(limit?: number, offset?: number): Promise<ApiEndpoint[]>;
  createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint>;
  updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined>;
  deleteApiEndpoint(id: number): Promise<boolean>;
  
  // Rate Limit Policies
  getRateLimitPolicy(id: number): Promise<RateLimitPolicy | undefined>;
  getRateLimitPolicies(limit?: number, offset?: number): Promise<RateLimitPolicy[]>;
  createRateLimitPolicy(policy: InsertRateLimitPolicy): Promise<RateLimitPolicy>;
  updateRateLimitPolicy(id: number, policy: Partial<InsertRateLimitPolicy>): Promise<RateLimitPolicy | undefined>;
  deleteRateLimitPolicy(id: number): Promise<boolean>;
  getActivePoliciesForEndpoint(endpoint: string): Promise<RateLimitPolicy[]>;
  
  // Request Logs
  createRequestLog(log: InsertRequestLog): Promise<RequestLog>;
  getRequestLogs(limit?: number, offset?: number): Promise<RequestLog[]>;
  getRequestLogsByDateRange(startDate: Date, endDate: Date): Promise<RequestLog[]>;
  getRequestMetrics(): Promise<{
    totalRequests: number;
    rateLimitedRequests: number;
    avgResponseTime: number;
    activeUsers: number;
  }>;
  
  // Token Buckets
  getTokenBucket(userId: number, endpointPattern: string): Promise<TokenBucket | undefined>;
  createTokenBucket(bucket: InsertTokenBucket): Promise<TokenBucket>;
  updateTokenBucket(id: number, bucket: Partial<InsertTokenBucket>): Promise<TokenBucket | undefined>;
  getTopEndpoints(limit?: number): Promise<Array<{ endpoint: string; requestCount: number; status: string }>>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result as any).changes > 0;
  }

  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
  }

  // API Endpoints
  async getApiEndpoint(id: number): Promise<ApiEndpoint | undefined> {
    const [endpoint] = await db.select().from(apiEndpoints).where(eq(apiEndpoints.id, id));
    return endpoint || undefined;
  }

  async getApiEndpoints(limit = 50, offset = 0): Promise<ApiEndpoint[]> {
    return await db.select().from(apiEndpoints).limit(limit).offset(offset).orderBy(desc(apiEndpoints.createdAt));
  }

  async createApiEndpoint(endpoint: InsertApiEndpoint): Promise<ApiEndpoint> {
    const [newEndpoint] = await db.insert(apiEndpoints).values(endpoint).returning();
    return newEndpoint;
  }

  async updateApiEndpoint(id: number, endpoint: Partial<InsertApiEndpoint>): Promise<ApiEndpoint | undefined> {
    const [updatedEndpoint] = await db.update(apiEndpoints).set(endpoint).where(eq(apiEndpoints.id, id)).returning();
    return updatedEndpoint || undefined;
  }

  async deleteApiEndpoint(id: number): Promise<boolean> {
    const result = await db.delete(apiEndpoints).where(eq(apiEndpoints.id, id));
    return (result as any).changes > 0;
  }

  // Rate Limit Policies
  async getRateLimitPolicy(id: number): Promise<RateLimitPolicy | undefined> {
    const [policy] = await db.select().from(rateLimitPolicies).where(eq(rateLimitPolicies.id, id));
    return policy || undefined;
  }

  async getRateLimitPolicies(limit = 50, offset = 0): Promise<RateLimitPolicy[]> {
    return await db.select().from(rateLimitPolicies).limit(limit).offset(offset).orderBy(desc(rateLimitPolicies.createdAt));
  }

  async createRateLimitPolicy(policy: InsertRateLimitPolicy): Promise<RateLimitPolicy> {
    const [newPolicy] = await db.insert(rateLimitPolicies).values(policy).returning();
    return newPolicy;
  }

  async updateRateLimitPolicy(id: number, policy: Partial<InsertRateLimitPolicy>): Promise<RateLimitPolicy | undefined> {
    const [updatedPolicy] = await db.update(rateLimitPolicies).set(policy).where(eq(rateLimitPolicies.id, id)).returning();
    return updatedPolicy || undefined;
  }

  async deleteRateLimitPolicy(id: number): Promise<boolean> {
    const result = await db.delete(rateLimitPolicies).where(eq(rateLimitPolicies.id, id));
    return (result as any).changes > 0;
  }

  async getActivePoliciesForEndpoint(endpoint: string): Promise<RateLimitPolicy[]> {
    return await db.select().from(rateLimitPolicies)
      .where(and(
        eq(rateLimitPolicies.isActive, true),
        sql`${endpoint} LIKE ${rateLimitPolicies.endpointPattern}`
      ))
      .orderBy(desc(rateLimitPolicies.priority));
  }

  // Request Logs
  async createRequestLog(log: InsertRequestLog): Promise<RequestLog> {
    const [newLog] = await db.insert(requestLogs).values(log).returning();
    return newLog;
  }

  async getRequestLogs(limit = 50, offset = 0): Promise<RequestLog[]> {
    return await db.select().from(requestLogs).limit(limit).offset(offset).orderBy(desc(requestLogs.timestamp));
  }

  async getRequestLogsByDateRange(startDate: Date, endDate: Date): Promise<RequestLog[]> {
    return await db.select().from(requestLogs)
      .where(and(
        gte(requestLogs.timestamp, startDate),
        lte(requestLogs.timestamp, endDate)
      ))
      .orderBy(desc(requestLogs.timestamp));
  }

  async getRequestMetrics(): Promise<{
    totalRequests: number;
    rateLimitedRequests: number;
    avgResponseTime: number;
    activeUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRequestsResult] = await db.select({ count: count() }).from(requestLogs)
      .where(gte(requestLogs.timestamp, today));

    const [rateLimitedResult] = await db.select({ count: count() }).from(requestLogs)
      .where(and(
        gte(requestLogs.timestamp, today),
        eq(requestLogs.isRateLimited, true)
      ));

    const [avgResponseResult] = await db.select({ avg: sql<number>`avg(${requestLogs.responseTime})` })
      .from(requestLogs)
      .where(gte(requestLogs.timestamp, today));

    const [activeUsersResult] = await db.select({ count: sql<number>`COUNT(DISTINCT ${requestLogs.userId})` })
      .from(requestLogs)
      .where(gte(requestLogs.timestamp, today));

    return {
      totalRequests: totalRequestsResult.count,
      rateLimitedRequests: rateLimitedResult.count,
      avgResponseTime: Math.round(avgResponseResult.avg || 0),
      activeUsers: activeUsersResult.count,
    };
  }

  // Token Buckets
  async getTokenBucket(userId: number, endpointPattern: string): Promise<TokenBucket | undefined> {
    const [bucket] = await db.select().from(tokenBuckets)
      .where(and(
        eq(tokenBuckets.userId, userId),
        eq(tokenBuckets.endpointPattern, endpointPattern)
      ));
    return bucket || undefined;
  }

  async createTokenBucket(bucket: InsertTokenBucket): Promise<TokenBucket> {
    const [newBucket] = await db.insert(tokenBuckets).values(bucket).returning();
    return newBucket;
  }

  async updateTokenBucket(id: number, bucket: Partial<InsertTokenBucket>): Promise<TokenBucket | undefined> {
    const [updatedBucket] = await db.update(tokenBuckets).set(bucket).where(eq(tokenBuckets.id, id)).returning();
    return updatedBucket || undefined;
  }

  async getTopEndpoints(limit = 10): Promise<Array<{ endpoint: string; requestCount: number; status: string }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await db.select({
      endpoint: requestLogs.endpoint,
      requestCount: count(),
      rateLimitedCount: count(sql`case when ${requestLogs.isRateLimited} then 1 end`),
    })
      .from(requestLogs)
      .where(gte(requestLogs.timestamp, today))
      .groupBy(requestLogs.endpoint)
      .orderBy(desc(count()))
      .limit(limit);

    return result.map(row => ({
      endpoint: row.endpoint,
      requestCount: row.requestCount,
      status: row.rateLimitedCount > 0 ? 'Limited' : 'Active',
    }));
  }
}

export const storage = new DatabaseStorage();
