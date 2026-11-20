export type SwipeDirection = 'LIKE' | 'PASS';

export interface ProfileRecord {
  id: string;
  name: string;
  age: number;
  bio: string;
  city_or_college: string;
  interests: string; // JSON string array in SQLite
  avatar_url: string;
  has_liked_current_user: number; // 0 or 1 (STRICTLY SERVER-SIDE ONLY)
}

export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  cityOrCollege: string;
  interests: string[];
  avatarUrl: string;
}

export interface SwipeRecord {
  id: number;
  swiper_id: string;
  target_user_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface MatchRecord {
  id: string;
  user_id: string;
  target_user_id: string;
  matched_at: string;
}

export interface MatchWithProfile {
  id: string;
  targetUserId: string;
  name: string;
  age: number;
  bio: string;
  cityOrCollege: string;
  interests: string[];
  avatarUrl: string;
  matchedAt: string;
}

export interface SwipeResult {
  success: boolean;
  matched: boolean;
  match?: MatchWithProfile;
  alreadySwiped?: boolean;
}
