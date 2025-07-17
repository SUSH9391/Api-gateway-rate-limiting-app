export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface RateLimitPolicy {
  id: number;
  name: string;
  description?: string;
  endpointPattern: string;
  requestLimit: number;
  timeWindow: string;
  burstLimit: number;
  userScope: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiEndpoint {
  id: number;
  path: string;
  method: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RequestLog {
  id: number;
  userId?: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ipAddress?: string;
  isRateLimited: boolean;
  policyId?: number;
  timestamp: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  rateLimitedRequests: number;
  avgResponseTime: number;
  activeUsers: number;
}

export interface TopEndpoint {
  endpoint: string;
  requestCount: number;
  status: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
