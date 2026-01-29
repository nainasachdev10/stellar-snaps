/**
 * Server Utilities
 *
 * Helper functions for building Stellar Snaps API endpoints.
 */

/**
 * Standard CORS headers for API responses.
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
} as const;

/**
 * Cache headers for different response types.
 */
export const CACHE_HEADERS = {
  /** No caching */
  none: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
  /** Short cache (1 minute) */
  short: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
  },
  /** Medium cache (5 minutes) */
  medium: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
  },
  /** Long cache (1 hour) */
  long: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
  },
  /** Immutable (1 year) */
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
} as const;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Creates a success API response.
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates an error API response.
 */
export function errorResponse(
  message: string,
  code?: string
): ApiResponse<never> {
  return {
    success: false,
    error: message,
    code,
  };
}

/**
 * Validates required fields in a request body.
 *
 * @throws Error if required fields are missing
 */
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): void {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Extracts query parameters from a URL.
 */
export function parseQueryParams(url: string): Record<string, string> {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};

    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}

/**
 * Builds a URL with query parameters.
 */
export function buildUrl(
  base: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(base);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/**
 * Rate limiting bucket.
 */
export interface RateLimitBucket {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter.
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ maxRequests: 100, windowMs: 60000 });
 *
 * // In your API handler:
 * if (!limiter.check(clientIp)) {
 *   return { error: 'Rate limit exceeded' };
 * }
 * ```
 */
export function createRateLimiter(options: {
  maxRequests: number;
  windowMs: number;
}) {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    /**
     * Checks if a key is within rate limits.
     * Returns true if allowed, false if rate limited.
     */
    check(key: string): boolean {
      const now = Date.now();
      const bucket = buckets.get(key);

      // Clean up expired bucket
      if (bucket && bucket.resetAt <= now) {
        buckets.delete(key);
      }

      const current = buckets.get(key);

      if (!current) {
        buckets.set(key, {
          count: 1,
          resetAt: now + options.windowMs,
        });
        return true;
      }

      if (current.count >= options.maxRequests) {
        return false;
      }

      current.count++;
      return true;
    },

    /**
     * Gets remaining requests for a key.
     */
    remaining(key: string): number {
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= Date.now()) {
        return options.maxRequests;
      }
      return Math.max(0, options.maxRequests - bucket.count);
    },

    /**
     * Resets the limiter for a key.
     */
    reset(key: string): void {
      buckets.delete(key);
    },

    /**
     * Clears all rate limit data.
     */
    clear(): void {
      buckets.clear();
    },
  };
}

/**
 * Parses a Stellar address from various formats.
 * Handles federation addresses, muxed accounts, etc.
 */
export function parseAddress(input: string): {
  address: string;
  muxedId?: string;
  federation?: string;
} {
  const trimmed = input.trim();

  // Federation address (user*domain.com)
  if (trimmed.includes('*')) {
    return {
      address: trimmed,
      federation: trimmed,
    };
  }

  // Muxed account (M...)
  if (trimmed.startsWith('M') && trimmed.length === 69) {
    return {
      address: trimmed,
      muxedId: trimmed,
    };
  }

  // Standard G address
  if (trimmed.startsWith('G') && trimmed.length === 56) {
    return {
      address: trimmed,
    };
  }

  throw new Error('Invalid address format');
}
