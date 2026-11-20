import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initDatabase, CURRENT_USER_ID } from '../db';
import {
  getFeed,
  recordSwipe,
  getMatches,
  resetSwipesAndMatches,
} from '../discoverService';
import { MOCK_PROFILES } from '../mockProfiles';

describe('Discover Service & Privacy Guarantees', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Isolated in-memory database for each test
    db = initDatabase(':memory:');
  });

  it('1. GET feed returns unswiped profiles and NEVER exposes incoming like status', () => {
    const feed = getFeed(db);

    expect(feed.length).toBe(MOCK_PROFILES.length);

    // Verify privacy invariant across every returned profile
    for (const profile of feed) {
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('age');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('cityOrCollege');
      expect(profile).toHaveProperty('interests');
      expect(profile).toHaveProperty('avatarUrl');

      // CRITICAL PRIVACY ASSERTIONS:
      // Client feed payloads must NEVER contain `has_liked_current_user` or any variant
      const keys = Object.keys(profile);
      expect(keys).not.toContain('has_liked_current_user');
      expect(keys).not.toContain('hasLikedCurrentUser');
      expect(keys).not.toContain('has_liked');
      expect(keys).not.toContain('isLiked');
      expect((profile as Record<string, unknown>).has_liked_current_user).toBeUndefined();
    }
  });

  it('2. A swiped profile (LIKE or PASS) never appears in feed again', () => {
    const initialFeed = getFeed(db);
    expect(initialFeed.length).toBe(32);

    const firstProfile = initialFeed[0];
    const secondProfile = initialFeed[1];

    // Pass on first profile, like on second profile
    recordSwipe(db, firstProfile.id, 'PASS');
    recordSwipe(db, secondProfile.id, 'LIKE');

    const updatedFeed = getFeed(db);
    expect(updatedFeed.length).toBe(30);

    const remainingIds = updatedFeed.map((p) => p.id);
    expect(remainingIds).not.toContain(firstProfile.id);
    expect(remainingIds).not.toContain(secondProfile.id);
  });

  it('3. Passing (PASS) on a profile that liked the user does NOT create a match', () => {
    // usr_seed_01 has pre-liked current user
    const preLikedProfile = MOCK_PROFILES.find((p) => p.has_liked_current_user === 1)!;
    expect(preLikedProfile).toBeDefined();

    const result = recordSwipe(db, preLikedProfile.id, 'PASS');

    expect(result.success).toBe(true);
    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();

    const matches = getMatches(db);
    expect(matches).toHaveLength(0);
  });

  it('4. Liking (LIKE) a profile that did NOT like the user does NOT create a match', () => {
    // usr_seed_02 has NOT liked current user
    const nonLikingProfile = MOCK_PROFILES.find((p) => p.has_liked_current_user === 0)!;
    expect(nonLikingProfile).toBeDefined();

    const result = recordSwipe(db, nonLikingProfile.id, 'LIKE');

    expect(result.success).toBe(true);
    expect(result.matched).toBe(false);
    expect(result.match).toBeUndefined();

    const matches = getMatches(db);
    expect(matches).toHaveLength(0);
  });

  it('5. Liking (LIKE) a profile that DID like the user creates a match and persists in matches list', () => {
    const preLikedProfile = MOCK_PROFILES.find((p) => p.has_liked_current_user === 1)!;

    const result = recordSwipe(db, preLikedProfile.id, 'LIKE');

    expect(result.success).toBe(true);
    expect(result.matched).toBe(true);
    expect(result.match).toBeDefined();
    expect(result.match?.targetUserId).toBe(preLikedProfile.id);
    expect(result.match?.name).toBe(preLikedProfile.name);
    expect(result.match?.matchedAt).toBeTruthy();

    // Verify persistence in getMatches
    const matches = getMatches(db);
    expect(matches).toHaveLength(1);
    expect(matches[0].targetUserId).toBe(preLikedProfile.id);
    expect(matches[0].name).toBe(preLikedProfile.name);
    expect(matches[0].cityOrCollege).toBe(preLikedProfile.city_or_college);
    expect(matches[0].interests).toEqual(preLikedProfile.interests);
  });

  it('6. Duplicate swipes on the same targetUserId are handled safely without duplicate matches', () => {
    const preLikedProfile = MOCK_PROFILES.find((p) => p.has_liked_current_user === 1)!;

    // First swipe
    const firstResult = recordSwipe(db, preLikedProfile.id, 'LIKE');
    expect(firstResult.matched).toBe(true);

    // Duplicate swipe attempt
    const secondResult = recordSwipe(db, preLikedProfile.id, 'LIKE');
    expect(secondResult.success).toBe(true);
    expect(secondResult.alreadySwiped).toBe(true);

    // Verify DB integrity: exactly 1 match and 1 swipe record exist
    const matches = getMatches(db);
    expect(matches).toHaveLength(1);

    const swipeCount = db
      .prepare('SELECT COUNT(*) as count FROM swipes WHERE target_user_id = ?')
      .get(preLikedProfile.id) as { count: number };
    expect(swipeCount.count).toBe(1);
  });

  it('7. Resetting swipes and matches restores full feed and clears match list', () => {
    // Swipe on several profiles
    recordSwipe(db, 'usr_seed_01', 'LIKE');
    recordSwipe(db, 'usr_seed_02', 'PASS');
    recordSwipe(db, 'usr_seed_03', 'LIKE');

    expect(getFeed(db).length).toBe(29);
    expect(getMatches(db).length).toBeGreaterThanOrEqual(1);

    // Reset
    resetSwipesAndMatches(db, CURRENT_USER_ID);

    expect(getFeed(db).length).toBe(32);
    expect(getMatches(db)).toHaveLength(0);
  });

  it('8. Validates invalid inputs and non-existent profiles', () => {
    // Invalid direction
    expect(() =>
      recordSwipe(db, 'usr_seed_01', 'SUPERLIKE' as unknown as 'LIKE')
    ).toThrow('Direction must be either "LIKE" or "PASS"');

    // Non-existent target
    expect(() =>
      recordSwipe(db, 'usr_non_existent', 'LIKE')
    ).toThrow("Target profile 'usr_non_existent' not found");
  });
});
