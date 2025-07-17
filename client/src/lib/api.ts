import { apiRequest } from "./queryClient";
import type { 
  LoginRequest, 
  LoginResponse, 
  DashboardMetrics, 
  TopEndpoint, 
  RateLimitPolicy, 
  ApiEndpoint, 
  User, 
  RequestLog 
} from "../types";

export const auth = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  register: async (data: LoginRequest & { email: string }): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },
};

export const dashboard = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  },

  getTopEndpoints: async (): Promise<TopEndpoint[]> => {
    const response = await apiRequest("GET", "/api/dashboard/top-endpoints");
    return response.json();
  },
};

export const policies = {
  list: async (limit = 50, offset = 0): Promise<RateLimitPolicy[]> => {
    const response = await apiRequest("GET", `/api/policies?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  create: async (policy: Omit<RateLimitPolicy, "id" | "createdAt">): Promise<RateLimitPolicy> => {
    const response = await apiRequest("POST", "/api/policies", policy);
    return response.json();
  },

  update: async (id: number, policy: Partial<RateLimitPolicy>): Promise<RateLimitPolicy> => {
    const response = await apiRequest("PUT", `/api/policies/${id}`, policy);
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/policies/${id}`);
  },
};

export const endpoints = {
  list: async (limit = 50, offset = 0): Promise<ApiEndpoint[]> => {
    const response = await apiRequest("GET", `/api/endpoints?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  create: async (endpoint: Omit<ApiEndpoint, "id" | "createdAt">): Promise<ApiEndpoint> => {
    const response = await apiRequest("POST", "/api/endpoints", endpoint);
    return response.json();
  },
};

export const users = {
  list: async (limit = 50, offset = 0): Promise<User[]> => {
    const response = await apiRequest("GET", `/api/users?limit=${limit}&offset=${offset}`);
    return response.json();
  },
};

export const logs = {
  list: async (limit = 50, offset = 0): Promise<RequestLog[]> => {
    const response = await apiRequest("GET", `/api/logs?limit=${limit}&offset=${offset}`);
    return response.json();
  },
};
