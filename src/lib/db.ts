import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { MOCK_PROFILES } from './mockProfiles';

export const CURRENT_USER_ID = 'usr_me';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'coy.db');

export function initDatabase(dbPath: string = DEFAULT_DB_PATH): Database.Database {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Performance and integrity pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      bio TEXT NOT NULL,
      city_or_college TEXT NOT NULL,
      interests TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      has_liked_current_user INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      swiper_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      direction TEXT NOT NULL CHECK (direction IN ('LIKE', 'PASS')),
      created_at TEXT NOT NULL,
      UNIQUE(swiper_id, target_user_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL UNIQUE,
      matched_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_swipes_lookup ON swipes(swiper_id, target_user_id);
    CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id);
  `);

  // Auto-seed if profiles table is empty
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
  if (rowCount.count === 0) {
    seedProfiles(db);
  }

  return db;
}

export function seedProfiles(db: Database.Database, force: boolean = false): void {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO profiles (
      id, name, age, bio, city_or_college, interests, avatar_url, has_liked_current_user
    ) VALUES (
      @id, @name, @age, @bio, @city_or_college, @interests, @avatar_url, @has_liked_current_user
    )
  `);

  const runSeed = db.transaction(() => {
    if (force) {
      db.prepare('DELETE FROM matches').run();
      db.prepare('DELETE FROM swipes').run();
      db.prepare('DELETE FROM profiles').run();
    }

    for (const p of MOCK_PROFILES) {
      insert.run({
        id: p.id,
        name: p.name,
        age: p.age,
        bio: p.bio,
        city_or_college: p.city_or_college,
        interests: JSON.stringify(p.interests),
        avatar_url: p.avatar_url,
        has_liked_current_user: p.has_liked_current_user,
      });
    }
  });

  runSeed();
}

// Global cached database singleton for Next.js App Router server runtimes
let cachedDb: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!cachedDb) {
    cachedDb = initDatabase();
  }
  return cachedDb;
}
