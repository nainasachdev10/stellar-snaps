import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSnap, getSnap, listSnaps, deleteSnap } from '../create-snap';
import { InvalidAddressError, SnapNotFoundError, SnapUnauthorizedError, SnapApiError } from '../errors';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const VALID_CREATOR = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
const VALID_DESTINATION = 'GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG';

describe('createSnap', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should validate creator address', async () => {
    await expect(
      createSnap({
        creator: 'invalid',
        title: 'Test',
        destination: VALID_DESTINATION,
      })
    ).rejects.toThrow(InvalidAddressError);
  });

  it('should validate destination address', async () => {
    await expect(
      createSnap({
        creator: VALID_CREATOR,
        title: 'Test',
        destination: 'invalid',
      })
    ).rejects.toThrow(InvalidAddressError);
  });

  it('should require title', async () => {
    await expect(
      createSnap({
        creator: VALID_CREATOR,
        title: '',
        destination: VALID_DESTINATION,
      })
    ).rejects.toThrow('Title is required');
  });

  it('should require asset issuer for non-XLM assets', async () => {
    await expect(
      createSnap({
        creator: VALID_CREATOR,
        title: 'Test',
        destination: VALID_DESTINATION,
        assetCode: 'USDC',
      })
    ).rejects.toThrow('Asset issuer is required for non-XLM assets');
  });

  it('should create snap successfully', async () => {
    const mockResponse = {
      id: 'abc12345',
      creator: VALID_CREATOR,
      title: 'Test Snap',
      destination: VALID_DESTINATION,
      assetCode: 'XLM',
      memoType: 'MEMO_TEXT',
      network: 'testnet',
      createdAt: '2024-01-01T00:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await createSnap({
      creator: VALID_CREATOR,
      title: 'Test Snap',
      destination: VALID_DESTINATION,
      baseUrl: 'https://example.com',
    });

    expect(result.id).toBe('abc12345');
    expect(result.url).toBe('https://example.com/s/abc12345');
    expect(result.snap).toEqual(mockResponse);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api/snaps',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should use default baseUrl when not provided', async () => {
    const mockResponse = {
      id: 'xyz',
      creator: VALID_CREATOR,
      title: 'Test',
      destination: VALID_DESTINATION,
      assetCode: 'XLM',
      memoType: 'MEMO_TEXT',
      network: 'testnet',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await createSnap({
      creator: VALID_CREATOR,
      title: 'Test',
      destination: VALID_DESTINATION,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://stellar-snaps.vercel.app/api/snaps',
      expect.any(Object)
    );
  });

  it('should throw SnapApiError on API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid data' }),
    });

    await expect(
      createSnap({
        creator: VALID_CREATOR,
        title: 'Test',
        destination: VALID_DESTINATION,
      })
    ).rejects.toMatchObject({ name: 'SnapApiError', message: 'Invalid data' });
  });
});

describe('getSnap', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should fetch snap by ID using /api/snap/[id]', async () => {
    const mockSnap = {
      id: 'abc12345',
      title: 'Test',
      destination: VALID_DESTINATION,
      assetCode: 'XLM',
      network: 'testnet',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSnap),
    });

    const result = await getSnap('abc12345', { baseUrl: 'https://example.com' });

    expect(result).toEqual(mockSnap);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/snap/abc12345');
  });

  it('should throw SnapNotFoundError for 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getSnap('notfound')).rejects.toThrow(SnapNotFoundError);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    await expect(getSnap('notfound')).rejects.toThrow('Snap not found: notfound');
  });
});

describe('listSnaps', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should list snaps by creator', async () => {
    const mockSnaps = [
      { id: 'snap1', title: 'Snap 1' },
      { id: 'snap2', title: 'Snap 2' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSnaps),
    });

    const result = await listSnaps(VALID_CREATOR, { baseUrl: 'https://example.com' });

    expect(result).toEqual(mockSnaps);
    expect(mockFetch).toHaveBeenCalledWith(
      `https://example.com/api/snaps?creator=${encodeURIComponent(VALID_CREATOR)}`
    );
  });
});

describe('deleteSnap', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should delete snap with id and creator query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    await expect(
      deleteSnap('abc12345', VALID_CREATOR, { baseUrl: 'https://example.com' })
    ).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(
      `https://example.com/api/snaps?id=${encodeURIComponent('abc12345')}&creator=${encodeURIComponent(VALID_CREATOR)}`,
      { method: 'DELETE' }
    );
  });

  it('should throw SnapNotFoundError for 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      deleteSnap('notfound', VALID_CREATOR)
    ).rejects.toThrow(SnapNotFoundError);
  });

  it('should throw SnapUnauthorizedError for 403', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    await expect(
      deleteSnap('abc12345', VALID_CREATOR)
    ).rejects.toThrow(SnapUnauthorizedError);
  });
});
