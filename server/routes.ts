import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { authenticateToken, requireAdmin, generateToken, type AuthenticatedRequest } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimiter";
import { insertUserSchema, insertRateLimitPolicySchema, insertApiEndpointSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = generateToken(user.id);
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Protected routes (with rate limiting)
  app.use("/api", rateLimiter);

  // Dashboard metrics
  app.get("/api/dashboard/metrics", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const metrics = await storage.getRequestMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/dashboard/top-endpoints", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const topEndpoints = await storage.getTopEndpoints(10);
      res.json(topEndpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top endpoints" });
    }
  });

  // Rate limit policies
  app.get("/api/policies", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const policies = await storage.getRateLimitPolicies(Number(limit), Number(offset));
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const policyData = insertRateLimitPolicySchema.parse(req.body);
      const policy = await storage.createRateLimitPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      res.status(400).json({ message: "Failed to create policy" });
    }
  });

  app.put("/api/policies/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policyData = insertRateLimitPolicySchema.partial().parse(req.body);
      const policy = await storage.updateRateLimitPolicy(id, policyData);
      
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      
      res.json(policy);
    } catch (error) {
      res.status(400).json({ message: "Failed to update policy" });
    }
  });

  app.delete("/api/policies/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRateLimitPolicy(id);
      
      if (!success) {
        return res.status(404).json({ message: "Policy not found" });
      }
      
      res.json({ message: "Policy deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });

  // API endpoints management
  app.get("/api/endpoints", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const endpoints = await storage.getApiEndpoints(Number(limit), Number(offset));
      res.json(endpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoints" });
    }
  });

  app.post("/api/endpoints", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const endpointData = insertApiEndpointSchema.parse(req.body);
      const endpoint = await storage.createApiEndpoint(endpointData);
      res.status(201).json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Failed to create endpoint" });
    }
  });

  // Users management
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const users = await storage.getUsers(Number(limit), Number(offset));
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Request logs
  app.get("/api/logs", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const logs = await storage.getRequestLogs(Number(limit), Number(offset));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Example API endpoint for testing rate limiting
  app.get("/api/test", authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({ message: "API test endpoint", user: req.user });
  });

  const httpServer = createServer(app);
  return httpServer;
}
