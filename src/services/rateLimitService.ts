interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimitService {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];

    // Filter out old requests outside the window
    timestamps = timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return true;
  }

  getRemainingRequests(key: string, config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const timestamps = this.requests.get(key) || [];
    const recentRequests = timestamps.filter(ts => ts > windowStart);

    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  reset(key: string) {
    this.requests.delete(key);
  }

  clearAll() {
    this.requests.clear();
  }
}

export const rateLimitService = new RateLimitService();
