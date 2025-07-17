import { storage } from "../storage";
import { RateLimitPolicy } from "@shared/schema";

export class TokenBucketService {
  private parseTimeWindow(timeWindow: string): number {
    const unit = timeWindow.slice(-1);
    const value = parseInt(timeWindow.slice(0, -1));
    
    switch (unit) {
      case 'm': return value * 60; // minutes to seconds
      case 'h': return value * 3600; // hours to seconds
      case 'd': return value * 86400; // days to seconds
      default: return 60; // default to 1 minute
    }
  }

  async consumeToken(userId: number, policy: RateLimitPolicy): Promise<boolean> {
    const now = new Date();
    const timeWindowSeconds = this.parseTimeWindow(policy.timeWindow);
    
    // Get or create token bucket
    let bucket = await storage.getTokenBucket(userId, policy.endpointPattern);
    
    if (!bucket) {
      bucket = await storage.createTokenBucket({
        userId,
        endpointPattern: policy.endpointPattern,
        tokens: policy.requestLimit,
        maxTokens: policy.requestLimit,
        refillRate: Math.floor(policy.requestLimit / timeWindowSeconds),
      });
    }

    // Calculate token refill
    const timeDiff = Math.floor((now.getTime() - bucket.lastRefill.getTime()) / 1000);
    const tokensToAdd = Math.min(
      bucket.refillRate * timeDiff,
      bucket.maxTokens - bucket.tokens
    );

    const newTokens = Math.min(bucket.tokens + tokensToAdd, bucket.maxTokens);

    // Check if we can consume a token
    if (newTokens >= 1) {
      // Consume token
      await storage.updateTokenBucket(bucket.id, {
        tokens: newTokens - 1,
        lastRefill: now,
      });
      return true;
    }

    // Update last refill time even if no tokens were consumed
    await storage.updateTokenBucket(bucket.id, {
      tokens: newTokens,
      lastRefill: now,
    });

    return false;
  }

  getRetryAfter(policy: RateLimitPolicy): number {
    const timeWindowSeconds = this.parseTimeWindow(policy.timeWindow);
    return Math.ceil(timeWindowSeconds / policy.requestLimit);
  }
}
