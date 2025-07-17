import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { TokenBucketService } from "../services/tokenBucket";
import { AuthenticatedRequest } from "./auth";

const tokenBucketService = new TokenBucketService();

export const rateLimiter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user?.id || 0; // 0 for anonymous users
    const endpoint = req.path;
    const method = req.method;

    // Get applicable rate limit policies
    const policies = await storage.getActivePoliciesForEndpoint(endpoint);
    
    let isRateLimited = false;
    let appliedPolicy = null;

    // Check each policy
    for (const policy of policies) {
      const allowed = await tokenBucketService.consumeToken(userId, policy);
      
      if (!allowed) {
        isRateLimited = true;
        appliedPolicy = policy;
        break;
      }
    }

    // Log the request
    const responseTime = Date.now() - startTime;
    await storage.createRequestLog({
      userId: userId || null,
      endpoint,
      method,
      statusCode: isRateLimited ? 429 : 200,
      responseTime,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || '',
      isRateLimited,
      policyId: appliedPolicy?.id || null,
    });

    if (isRateLimited) {
      return res.status(429).json({
        message: 'Rate limit exceeded',
        policy: appliedPolicy?.name,
        retryAfter: tokenBucketService.getRetryAfter(appliedPolicy!),
      });
    }

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
};
