import Database from 'better-sqlite3';
import { CURRENT_USER_ID } from './db';
import {
  PublicProfile,
  SwipeDirection,
  SwipeResult,
  MatchWithProfile,
} from './types';

/**
 * Returns profiles that the current user has not yet swiped on.
 * 
 * PRIVACY INVARIANT:
 * Explicitly select ONLY public columns.
 * The column `has_liked_current_user` is STRICTLY EXCLUDED from this query.
 * Clients cannot infer or inspect incoming likes from the feed payload.
 */
export function getFeed(
  db: Database.Database,
  userId: string = CURRENT_USER_ID
): PublicProfile[] {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.age,
      p.bio,
      p.city_or_college,
      p.interests,
      p.avatar_url
    FROM profiles p
    WHERE p.id NOT IN (
      SELECT s.target_user_id
      FROM swipes s
      WHERE s.swiper_id = ?
    )
    ORDER BY p.rowid ASC
  `;

  interface RawFeedRow {
    id: string;
    name: string;
    age: number;
    bio: string;
    city_or_college: string;
    interests: string;
    avatar_url: string;
    has_liked_current_user?: unknown;
  }

  const rows = db.prepare(query).all(userId) as RawFeedRow[];

  return rows.map((row) => {
    let parsedInterests: string[] = [];
    try {
      parsedInterests = JSON.parse(row.interests);
    } catch {
      parsedInterests = [];
    }

    return {
      id: row.id,
      name: row.name,
      age: row.age,
      bio: row.bio,
      cityOrCollege: row.city_or_college,
      interests: parsedInterests,
      avatarUrl: row.avatar_url,
    };
  });
}

/**
 * Records a swipe (LIKE or PASS) and evaluates mutual match condition inside a transaction.
 */
export function recordSwipe(
  db: Database.Database,
  targetUserId: string,
  direction: SwipeDirection,
  swiperId: string = CURRENT_USER_ID
): SwipeResult {
  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new Error('Invalid or missing targetUserId');
  }

  if (direction !== 'LIKE' && direction !== 'PASS') {
    throw new Error('Direction must be either "LIKE" or "PASS"');
  }

  // Verify target profile exists
  interface TargetRow {
    id: string;
    name: string;
    age: number;
    bio: string;
    city_or_college: string;
    interests: string;
    avatar_url: string;
    has_liked_current_user: number;
  }

  const target = db
    .prepare('SELECT * FROM profiles WHERE id = ?')
    .get(targetUserId) as TargetRow | undefined;

  if (!target) {
    throw new Error(`Target profile '${targetUserId}' not found`);
  }

  // Check if already swiped (idempotency guard)
  const existingSwipe = db
    .prepare(
      'SELECT direction FROM swipes WHERE swiper_id = ? AND target_user_id = ?'
    )
    .get(swiperId, targetUserId) as { direction: string } | undefined;

  if (existingSwipe) {
    // If already swiped and matched, retrieve match
    const existingMatch = db
      .prepare(
        'SELECT * FROM matches WHERE user_id = ? AND target_user_id = ?'
      )
      .get(swiperId, targetUserId) as
      | { id: string; matched_at: string }
      | undefined;

    let parsedInterests: string[] = [];
    try {
      parsedInterests = JSON.parse(target.interests);
    } catch {
      parsedInterests = [];
    }

    if (existingMatch) {
      return {
        success: true,
        matched: true,
        alreadySwiped: true,
        match: {
          id: existingMatch.id,
          targetUserId: target.id,
          name: target.name,
          age: target.age,
          bio: target.bio,
          cityOrCollege: target.city_or_college,
          interests: parsedInterests,
          avatarUrl: target.avatar_url,
          matchedAt: existingMatch.matched_at,
        },
      };
    }

    return {
      success: true,
      matched: false,
      alreadySwiped: true,
    };
  }

  const now = new Date().toISOString();

  // Execute swipe and match resolution atomically
  const executeTransaction = db.transaction(() => {
    // 1. Insert swipe record
    db.prepare(`
      INSERT INTO swipes (swiper_id, target_user_id, direction, created_at)
      VALUES (?, ?, ?, ?)
    `).run(swiperId, targetUserId, direction, now);

    // 2. Evaluate mutual match
    const isMutualMatch = direction === 'LIKE' && target.has_liked_current_user === 1;

    if (isMutualMatch) {
      const matchId = `match_${Date.now()}_${target.id}`;
      db.prepare(`
        INSERT INTO matches (id, user_id, target_user_id, matched_at)
        VALUES (?, ?, ?, ?)
      `).run(matchId, swiperId, target.id, now);

      let parsedInterests: string[] = [];
      try {
        parsedInterests = JSON.parse(target.interests);
      } catch {
        parsedInterests = [];
      }

      return {
        success: true,
        matched: true,
        match: {
          id: matchId,
          targetUserId: target.id,
          name: target.name,
          age: target.age,
          bio: target.bio,
          cityOrCollege: target.city_or_college,
          interests: parsedInterests,
          avatarUrl: target.avatar_url,
          matchedAt: now,
        },
      };
    }

    return {
      success: true,
      matched: false,
    };
  });

  return executeTransaction();
}

/**
 * Returns all mutual matches for the current user.
 */
export function getMatches(
  db: Database.Database,
  userId: string = CURRENT_USER_ID
): MatchWithProfile[] {
  const query = `
    SELECT 
      m.id as match_id,
      m.matched_at,
      p.id as profile_id,
      p.name,
      p.age,
      p.bio,
      p.city_or_college,
      p.interests,
      p.avatar_url
    FROM matches m
    JOIN profiles p ON m.target_user_id = p.id
    WHERE m.user_id = ?
    ORDER BY m.matched_at DESC
  `;

  interface RawMatchRow {
    match_id: string;
    matched_at: string;
    profile_id: string;
    name: string;
    age: number;
    bio: string;
    city_or_college: string;
    interests: string;
    avatar_url: string;
  }

  const rows = db.prepare(query).all(userId) as RawMatchRow[];

  return rows.map((row) => {
    let parsedInterests: string[] = [];
    try {
      parsedInterests = JSON.parse(row.interests);
    } catch {
      parsedInterests = [];
    }

    return {
      id: row.match_id,
      targetUserId: row.profile_id,
      name: row.name,
      age: row.age,
      bio: row.bio,
      cityOrCollege: row.city_or_college,
      interests: parsedInterests,
      avatarUrl: row.avatar_url,
      matchedAt: row.matched_at,
    };
  });
}

/**
 * Resets swipes and matches for testing and demo purposes.
 */
export function resetSwipesAndMatches(
  db: Database.Database,
  userId: string = CURRENT_USER_ID
): void {
  const resetTx = db.transaction(() => {
    db.prepare('DELETE FROM matches WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM swipes WHERE swiper_id = ?').run(userId);
  });
  resetTx();
}
