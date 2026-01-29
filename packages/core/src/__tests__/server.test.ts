import { describe, it, expect } from 'vitest';
import {
  successResponse,
  errorResponse,
  validateRequired,
  parseQueryParams,
  buildUrl,
  createRateLimiter,
  parseAddress,
  CORS_HEADERS,
} from '../server';

describe('successResponse', () => {
  it('should create success response', () => {
    const response = successResponse({ id: '123' });
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: '123' });
  });
});

describe('errorResponse', () => {
  it('should create error response', () => {
    const response = errorResponse('Something went wrong', 'ERR_CODE');
    expect(response.success).toBe(false);
    expect(response.error).toBe('Something went wrong');
    expect(response.code).toBe('ERR_CODE');
  });
});

describe('validateRequired', () => {
  it('should pass for valid input', () => {
    expect(() =>
      validateRequired({ name: 'test', email: 'test@test.com' }, ['name', 'email'])
    ).not.toThrow();
  });

  it('should throw for missing field', () => {
    expect(() =>
      validateRequired({ name: 'test' }, ['name', 'email'])
    ).toThrow('Missing required field: email');
  });

  it('should throw for empty string', () => {
    expect(() =>
      validateRequired({ name: '' }, ['name'])
    ).toThrow('Missing required field: name');
  });
});

describe('parseQueryParams', () => {
  it('should parse query parameters', () => {
    const params = parseQueryParams('https://example.com?foo=bar&baz=123');
    expect(params.foo).toBe('bar');
    expect(params.baz).toBe('123');
  });

  it('should return empty object for invalid URL', () => {
    expect(parseQueryParams('not-a-url')).toEqual({});
  });
});

describe('buildUrl', () => {
  it('should build URL with params', () => {
    const url = buildUrl('https://example.com/api', { foo: 'bar', baz: '123' });
    expect(url).toBe('https://example.com/api?foo=bar&baz=123');
  });

  it('should skip undefined params', () => {
    const url = buildUrl('https://example.com/api', { foo: 'bar', baz: undefined });
    expect(url).toBe('https://example.com/api?foo=bar');
  });
});

describe('createRateLimiter', () => {
  it('should allow requests within limit', () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 1000 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
  });

  it('should block requests over limit', () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
  });

  it('should track different keys separately', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });
    expect(limiter.check('user1')).toBe(true);
    expect(limiter.check('user2')).toBe(true);
    expect(limiter.check('user1')).toBe(false);
  });

  it('should report remaining requests', () => {
    const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });
    expect(limiter.remaining('user1')).toBe(5);
    limiter.check('user1');
    expect(limiter.remaining('user1')).toBe(4);
  });

  it('should reset for key', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });
    limiter.check('user1');
    limiter.reset('user1');
    expect(limiter.check('user1')).toBe(true);
  });
});

describe('parseAddress', () => {
  it('should parse standard G address', () => {
    const result = parseAddress('GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7');
    expect(result.address).toBe('GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7');
  });

  it('should parse federation address', () => {
    const result = parseAddress('user*domain.com');
    expect(result.federation).toBe('user*domain.com');
  });

  it('should throw for invalid address', () => {
    expect(() => parseAddress('invalid')).toThrow('Invalid address format');
  });
});

describe('CORS_HEADERS', () => {
  it('should have required headers', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Origin']).toBe('*');
    expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('GET');
    expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('POST');
  });
});
