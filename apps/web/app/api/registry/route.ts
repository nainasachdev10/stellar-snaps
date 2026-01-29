import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { registry, type RegistryEntryRow } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Registry of trusted domains that can serve Stellar Snaps.
 * Stored in the database. Extension fetches this list to know which domains to trust.
 */

export interface RegistryEntry {
  domain: string;
  status: 'trusted' | 'unverified' | 'blocked';
  name?: string;
  description?: string;
  icon?: string;
  registeredAt: string;
  verifiedAt?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300',
};

const DEFAULT_DOMAINS: Omit<RegistryEntry, 'registeredAt' | 'verifiedAt'>[] = [
  {
    domain: 'stellar-snaps.vercel.app',
    status: 'trusted',
    name: 'Stellar Snaps',
    description: 'Official Stellar Snaps service',
  },
  {
    domain: 'localhost:3000',
    status: 'trusted',
    name: 'Local Development',
    description: 'Local development server',
  },
  {
    domain: 'test-sdk-kappa.vercel.app',
    status: 'trusted',
    name: 'Stellar Snaps SDK Demo',
    description: 'SDK v0.3.2 test and demo site',
  },
];

async function ensureRegistrySeeded() {
  const existing = await db.select().from(registry).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  await db
    .insert(registry)
    .values(
      DEFAULT_DOMAINS.map((d) => ({
        domain: d.domain,
        status: d.status,
        name: d.name ?? null,
        description: d.description ?? null,
        icon: d.icon ?? null,
        registeredAt: now,
        verifiedAt: d.status === 'trusted' ? now : null,
      }))
    )
    .onConflictDoNothing({ target: registry.domain });
}

function rowToEntry(row: RegistryEntryRow): RegistryEntry {
  return {
    domain: row.domain,
    status: (row.status as RegistryEntry['status']) ?? 'unverified',
    name: row.name ?? undefined,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    registeredAt: row.registeredAt?.toISOString() ?? new Date().toISOString(),
    verifiedAt: row.verifiedAt?.toISOString(),
  };
}

// GET /api/registry - returns list of all registered domains (or single domain if ?domain=)
export async function GET(request: NextRequest) {
  try {
    await ensureRegistrySeeded();
  } catch (e) {
    console.error('[registry] Seed failed:', e);
  }

  const domain = request.nextUrl.searchParams.get('domain');

  if (domain) {
    const rows = await db.select().from(registry).where(eq(registry.domain, domain));
    const entry = rows[0];
    if (!entry) {
      return NextResponse.json(
        { error: 'Domain not found', domain },
        { status: 404, headers: CORS_HEADERS }
      );
    }
    return NextResponse.json(rowToEntry(entry), { headers: CORS_HEADERS });
  }

  const rows = await db.select().from(registry);
  const domains = rows.map(rowToEntry);
  return NextResponse.json(
    { domains },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
