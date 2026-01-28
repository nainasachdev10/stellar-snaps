import { NextRequest, NextResponse } from 'next/server';

/**
 * Registry of trusted domains that can serve Stellar Snaps
 * 
 * Similar to Dialect's Blinks registry:
 * - Extensions fetch this list to know which domains to trust
 * - Domains must be verified before being marked as "trusted"
 * - Unverified domains can still work but show warning badge
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

// For now, hardcoded registry. Later: move to database
const REGISTRY: RegistryEntry[] = [
  {
    domain: 'stellar-snaps.vercel.app',
    status: 'trusted',
    name: 'Stellar Snaps',
    description: 'Official Stellar Snaps service',
    registeredAt: '2025-01-01T00:00:00Z',
    verifiedAt: '2025-01-01T00:00:00Z',
  },
  {
    domain: 'localhost:3000',
    status: 'trusted',
    name: 'Local Development',
    description: 'Local development server',
    registeredAt: '2025-01-01T00:00:00Z',
    verifiedAt: '2025-01-01T00:00:00Z',
  },
];

// GET /api/registry - returns list of all registered domains
export async function GET(request: NextRequest) {
  // Optional: filter by domain
  const domain = request.nextUrl.searchParams.get('domain');
  
  if (domain) {
    const entry = REGISTRY.find(e => e.domain === domain);
    if (entry) {
      return NextResponse.json(entry, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    }
    return NextResponse.json(
      { error: 'Domain not found', domain },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { domains: REGISTRY },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    }
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
