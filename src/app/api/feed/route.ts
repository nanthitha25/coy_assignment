import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getFeed } from '@/lib/discoverService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const profiles = getFeed(db);
    return NextResponse.json({ profiles });
  } catch (error: unknown) {
    console.error('Error fetching discover feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discover feed' },
      { status: 500 }
    );
  }
}
