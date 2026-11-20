import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { recordSwipe } from '@/lib/discoverService';
import { SwipeDirection } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { targetUserId, direction } = body as {
      targetUserId?: string;
      direction?: SwipeDirection;
    };

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid targetUserId' },
        { status: 400 }
      );
    }

    if (direction !== 'LIKE' && direction !== 'PASS') {
      return NextResponse.json(
        { error: 'Direction must be either "LIKE" or "PASS"' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = recordSwipe(db, targetUserId, direction);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error processing swipe:', err);

    if (err.message.includes('not found')) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: err.message || 'Failed to record swipe' },
      { status: 500 }
    );
  }
}
