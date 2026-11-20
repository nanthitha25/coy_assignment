import { initDatabase, seedProfiles } from './db';
import { MOCK_PROFILES } from './mockProfiles';

console.log('🌱 Seeding Coy SQLite database...');

const db = initDatabase();
seedProfiles(db, true);

const likedCount = MOCK_PROFILES.filter((p) => p.has_liked_current_user === 1).length;

console.log(`✅ Successfully seeded ${MOCK_PROFILES.length} profiles.`);
console.log(`❤️  ${likedCount} profiles are pre-configured to like the current user for instant match demos.`);
console.log('✨ Cleared all previous swipes and matches for a fresh demo run.');
