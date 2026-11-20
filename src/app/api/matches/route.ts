import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getMatches } from '@/lib/discoverService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const matches = getMatches(db);
    return NextResponse.json({ matches });
  } catch (error: unknown) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
