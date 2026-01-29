import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const registry = pgTable('registry', {
  domain: text('domain').primaryKey(),
  status: text('status').notNull().default('unverified'), // 'trusted' | 'unverified' | 'blocked'
  name: text('name'),
  description: text('description'),
  icon: text('icon'),
  registeredAt: timestamp('registered_at').defaultNow(),
  verifiedAt: timestamp('verified_at'),
});

export const snaps = pgTable('snaps', {
  id: text('id').primaryKey(),
  creator: text('creator').notNull(),

  // Display
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),

  // Payment
  destination: text('destination').notNull(),
  assetCode: text('asset_code').default('XLM'),
  assetIssuer: text('asset_issuer'),
  amount: text('amount'),
  memo: text('memo'),
  memoType: text('memo_type').default('MEMO_TEXT'),

  // Config
  network: text('network').default('testnet'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Snap = typeof snaps.$inferSelect;
export type NewSnap = typeof snaps.$inferInsert;

export type RegistryEntryRow = typeof registry.$inferSelect;
export type NewRegistryEntry = typeof registry.$inferInsert;
