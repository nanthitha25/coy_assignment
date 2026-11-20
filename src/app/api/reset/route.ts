import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { resetSwipesAndMatches } from '@/lib/discoverService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    resetSwipesAndMatches(db);
    return NextResponse.json({
      success: true,
      message: 'Swipes and matches reset successfully',
    });
  } catch (error: unknown) {
    console.error('Error resetting swipes and matches:', error);
    return NextResponse.json(
      { error: 'Failed to reset state' },
      { status: 500 }
    );
  }
}
