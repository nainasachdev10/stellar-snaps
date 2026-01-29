/**
 * Database Schema Types
 *
 * Type definitions for snap storage. These types can be used
 * with any database (PostgreSQL, SQLite, MongoDB, etc.).
 */

import type { Network, MemoType } from './constants';

/**
 * Snap record as stored in the database.
 */
export interface Snap {
  /** Unique snap ID (e.g., 'nk1VNcxo') */
  id: string;

  /** Creator's Stellar address */
  creator: string;

  /** Display title */
  title: string;

  /** Optional description */
  description?: string | null;

  /** Optional image URL */
  imageUrl?: string | null;

  /** Payment destination address */
  destination: string;

  /** Asset code (default: 'XLM') */
  assetCode: string;

  /** Asset issuer (required for non-XLM) */
  assetIssuer?: string | null;

  /** Fixed amount (null = payer chooses) */
  amount?: string | null;

  /** Transaction memo */
  memo?: string | null;

  /** Memo type */
  memoType: MemoType | string;

  /** Network ('public' or 'testnet') */
  network: Network | string;

  /** Creation timestamp */
  createdAt: Date | string;

  /** Last update timestamp */
  updatedAt: Date | string;
}

/**
 * Input for creating a new snap.
 */
export interface CreateSnapInput {
  /** Creator's Stellar address (required) */
  creator: string;

  /** Display title (required) */
  title: string;

  /** Payment destination address (required) */
  destination: string;

  /** Optional description */
  description?: string;

  /** Optional image URL */
  imageUrl?: string;

  /** Asset code (default: 'XLM') */
  assetCode?: string;

  /** Asset issuer (required for non-XLM) */
  assetIssuer?: string;

  /** Fixed amount */
  amount?: string;

  /** Transaction memo */
  memo?: string;

  /** Memo type (default: 'MEMO_TEXT') */
  memoType?: MemoType;

  /** Network (default: 'testnet') */
  network?: Network;
}

/**
 * Input for updating a snap.
 */
export interface UpdateSnapInput {
  /** Display title */
  title?: string;

  /** Description */
  description?: string | null;

  /** Image URL */
  imageUrl?: string | null;

  /** Payment amount */
  amount?: string | null;

  /** Transaction memo */
  memo?: string | null;

  /** Memo type */
  memoType?: MemoType;
}

/**
 * Validates snap input data.
 *
 * @throws Error if validation fails
 */
export function validateSnapInput(input: CreateSnapInput): void {
  // Validate creator
  if (!input.creator || input.creator.length !== 56 || !input.creator.startsWith('G')) {
    throw new Error('Invalid creator address');
  }

  // Validate destination
  if (!input.destination || input.destination.length !== 56 || !input.destination.startsWith('G')) {
    throw new Error('Invalid destination address');
  }

  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Title is required');
  }

  if (input.title.length > 100) {
    throw new Error('Title must be 100 characters or less');
  }

  // Validate description
  if (input.description && input.description.length > 500) {
    throw new Error('Description must be 500 characters or less');
  }

  // Validate asset
  if (input.assetCode && input.assetCode !== 'XLM' && !input.assetIssuer) {
    throw new Error('Asset issuer is required for non-XLM assets');
  }

  if (input.assetIssuer && (input.assetIssuer.length !== 56 || !input.assetIssuer.startsWith('G'))) {
    throw new Error('Invalid asset issuer address');
  }

  // Validate amount
  if (input.amount) {
    const amountNum = parseFloat(input.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Amount must be a positive number');
    }
  }

  // Validate network
  if (input.network && !['public', 'testnet'].includes(input.network)) {
    throw new Error('Network must be "public" or "testnet"');
  }

  // Validate memo type
  if (input.memoType && !['MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'].includes(input.memoType)) {
    throw new Error('Invalid memo type');
  }
}

/**
 * Creates a snap object with defaults.
 */
export function createSnapObject(id: string, input: CreateSnapInput): Snap {
  validateSnapInput(input);

  const now = new Date().toISOString();

  return {
    id,
    creator: input.creator,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl || null,
    destination: input.destination,
    assetCode: input.assetCode || 'XLM',
    assetIssuer: input.assetIssuer || null,
    amount: input.amount || null,
    memo: input.memo || null,
    memoType: input.memoType || 'MEMO_TEXT',
    network: input.network || 'testnet',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * SQL schema for PostgreSQL.
 *
 * @example
 * ```typescript
 * // Run this SQL to create the snaps table:
 * await db.execute(POSTGRES_SCHEMA);
 * ```
 */
export const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS snaps (
  id TEXT PRIMARY KEY,
  creator TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  destination TEXT NOT NULL,
  asset_code TEXT NOT NULL DEFAULT 'XLM',
  asset_issuer TEXT,
  amount TEXT,
  memo TEXT,
  memo_type TEXT NOT NULL DEFAULT 'MEMO_TEXT',
  network TEXT NOT NULL DEFAULT 'testnet',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snaps_creator ON snaps(creator);
CREATE INDEX IF NOT EXISTS idx_snaps_destination ON snaps(destination);
`;

/**
 * SQL schema for SQLite.
 */
export const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS snaps (
  id TEXT PRIMARY KEY,
  creator TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  destination TEXT NOT NULL,
  asset_code TEXT NOT NULL DEFAULT 'XLM',
  asset_issuer TEXT,
  amount TEXT,
  memo TEXT,
  memo_type TEXT NOT NULL DEFAULT 'MEMO_TEXT',
  network TEXT NOT NULL DEFAULT 'testnet',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_snaps_creator ON snaps(creator);
CREATE INDEX IF NOT EXISTS idx_snaps_destination ON snaps(destination);
`;
