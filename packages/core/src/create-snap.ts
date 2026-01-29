/**
 * Shareable Snap API
 *
 * Functions that mirror the Stellar Snaps web app API. Create, fetch, list,
 * and delete database-backed snaps so developers get the same behavior as
 * the dashboard. Uses https://stellar-snaps.vercel.app by default.
 */

import {
  InvalidAddressError,
  SnapNotFoundError,
  SnapUnauthorizedError,
  SnapApiError,
} from './errors';

const DEFAULT_BASE_URL = 'https://stellar-snaps.vercel.app';

/** Snap as returned by the web app API (GET /api/snap/[id] omits creator; list/create include it). */
export interface Snap {
  id: string;
  creator?: string;
  title: string;
  description?: string | null;
  destination: string;
  amount?: string | null;
  assetCode: string;
  assetIssuer?: string | null;
  memo?: string | null;
  memoType?: string;
  network: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSnapOptions {
  /** Creator's Stellar address (required) */
  creator: string;
  /** Display title for the snap (required) */
  title: string;
  /** Payment destination address (required) */
  destination: string;
  /** Optional description */
  description?: string;
  /** Payment amount (optional - if not set, payer enters amount) */
  amount?: string;
  /** Asset code (default: 'XLM') */
  assetCode?: string;
  /** Asset issuer (required for non-XLM assets) */
  assetIssuer?: string;
  /** Transaction memo */
  memo?: string;
  /** Memo type (default: 'MEMO_TEXT') */
  memoType?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';
  /** Network (default: 'testnet') */
  network?: 'public' | 'testnet';
  /** Optional image URL for the snap */
  imageUrl?: string;
  /** Stellar Snaps server base URL (default: 'https://stellar-snaps.vercel.app') */
  baseUrl?: string;
}

export interface CreateSnapResult {
  /** The created snap ID */
  id: string;
  /** Full shareable URL (e.g. https://stellar-snaps.vercel.app/s/abc123) */
  url: string;
  /** The snap data as returned by the API */
  snap: Snap;
}

/**
 * Creates a shareable snap on a Stellar Snaps server.
 *
 * @example
 * ```typescript
 * const result = await createSnap({
 *   creator: 'GCREATOR...',
 *   title: 'Coffee Payment',
 *   destination: 'GDEST...',
 *   amount: '5',
 *   baseUrl: 'https://stellar-snaps.vercel.app'
 * });
 * console.log(result.url);
 * // https://stellar-snaps.vercel.app/s/abc12345
 * ```
 */
export async function createSnap(
  options: CreateSnapOptions
): Promise<CreateSnapResult> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const {
    creator,
    title,
    destination,
    description,
    amount,
    assetCode = 'XLM',
    assetIssuer,
    memo,
    memoType = 'MEMO_TEXT',
    network = 'testnet',
    imageUrl,
  } = options;

  if (!creator || creator.length !== 56 || !creator.startsWith('G')) {
    throw new InvalidAddressError(creator || '');
  }

  if (!title || title.trim().length === 0) {
    throw new SnapApiError('Title is required');
  }

  if (!destination || destination.length !== 56 || !destination.startsWith('G')) {
    throw new InvalidAddressError(destination || '');
  }

  if (assetCode !== 'XLM' && !assetIssuer) {
    throw new SnapApiError('Asset issuer is required for non-XLM assets');
  }

  const body = {
    creator,
    title,
    destination,
    description,
    amount,
    assetCode,
    assetIssuer,
    memo,
    memoType,
    network,
    imageUrl,
  };

  const response = await fetch(`${baseUrl}/api/snaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unknown error' }));
    const message = (data as { error?: string }).error || `Failed to create snap: ${response.status}`;
    throw new SnapApiError(message, response.status);
  }

  const snap: Snap = await response.json();

  return {
    id: snap.id,
    url: `${baseUrl}/s/${snap.id}`,
    snap,
  };
}

/**
 * Fetches a snap by ID from the Stellar Snaps server.
 * Uses GET /api/snap/[id] (singular path, same as web app).
 *
 * @throws SnapNotFoundError if the snap does not exist
 * @throws SnapApiError if the request fails
 */
export async function getSnap(
  id: string,
  options: { baseUrl?: string } = {}
): Promise<Snap> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(`${baseUrl}/api/snap/${id}`);

  if (response.status === 404) {
    throw new SnapNotFoundError(id);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { error?: string }).error || `Failed to fetch snap: ${response.status}`;
    throw new SnapApiError(message, response.status);
  }

  return response.json();
}

/**
 * Lists snaps created by a specific address (GET /api/snaps?creator=...).
 */
export async function listSnaps(
  creator: string,
  options: { baseUrl?: string } = {}
): Promise<Snap[]> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  const response = await fetch(
    `${baseUrl}/api/snaps?creator=${encodeURIComponent(creator)}`
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { error?: string }).error || `Failed to list snaps: ${response.status}`;
    throw new SnapApiError(message, response.status);
  }

  return response.json();
}

/**
 * Deletes a snap by ID. Requires the creator's address (same as web app: DELETE /api/snaps?id=...&creator=...).
 *
 * @throws SnapNotFoundError if the snap does not exist
 * @throws SnapUnauthorizedError if the creator does not own the snap
 * @throws SnapApiError if the request fails
 */
export async function deleteSnap(
  id: string,
  creator: string,
  options: { baseUrl?: string } = {}
): Promise<void> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;

  const url = `${baseUrl}/api/snaps?id=${encodeURIComponent(id)}&creator=${encodeURIComponent(creator)}`;
  const response = await fetch(url, { method: 'DELETE' });

  if (response.status === 404) {
    throw new SnapNotFoundError(id);
  }

  if (response.status === 403) {
    throw new SnapUnauthorizedError('You do not have permission to delete this snap');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { error?: string }).error || `Failed to delete snap: ${response.status}`;
    throw new SnapApiError(message, response.status);
  }
}
