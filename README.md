# Coy SDE Intern Assignment — Discover Tab & Product Proposal

> Standalone prototype and product engineering submission for the Coy SDE Intern role.  
> Live App Analyzed: [app.getcoy.com](https://app.getcoy.com)

---

## Submission Overview

This repository contains:
1. **Part A: Product Exploration & Core Feature Suggestions** — A product and privacy engineering evaluation of Coy's live mobile web app, proposing two core features with privacy edge-case analysis. Read the full write-up in [PRODUCT.md](./PRODUCT.md).
2. **Part B: "Discover" Tab Implementation** — A mobile-first, swipe-based discovery experience styled to match Coy's neo-brutalist aesthetic, built alongside a placeholder **Home** tab and backed by a privacy-first SQLite API.

---

## Part A: Product Proposals (Summary)

For the full breakdown, user flows, and privacy edge-case threat models, see **[PRODUCT.md](./PRODUCT.md)**.

| Feature Proposal | The Problem It Solves | Key Privacy Safeguard | Expected Impact |
| :--- | :--- | :--- | :--- |
| **1. Time-Bounded Slot Expiry (60–90 Days)** | Permanent slot lock-in when crushes never join Coy, leading to slot exhaustion and churn. | Target is never notified on expiry; 180-day server-side re-add ping cooldown prevents harassment or contact enumeration. | Restores utility every 60–90 days, improves retention, and preserves anti-brute-force protection. |
| **2. Mutual-Only In-App Icebreaker** | Post-match friction ("who texts first?") and missing contact info when crushes are added via email. | Strictly gated behind confirmed mutual match state; two-phase mutual consent for contact sharing; 7-day ephemeral TTL. | Increases match-to-conversation conversion and drives organic word-of-mouth referrals. |

---

## Part B: "Discover" Tab

### Privacy-First Architecture
* **Zero Leakage Invariant:** `GET /api/feed` explicitly projects only public profile fields and strips `has_liked_current_user` server-side. Inspecting network payloads never reveals who has liked the user.
* **Atomic Match Evaluation:** `POST /api/swipe` runs inside a SQLite transaction—recording the swipe and creating a mutual match record only when `direction === "LIKE"` and the target has already liked the current user.
* **Permanent Exclusion & Persistence:** Swiped profiles are persisted in SQLite (`data/coy.db`) with a `UNIQUE(swiper_id, target_user_id)` constraint so they never reappear across page reloads, and duplicate swipes are handled idempotently.

```text
[ User Action: Swipe Right ]
            │
            ▼
[ POST /api/swipe { targetUserId, direction: "LIKE" } ]
            │
            ├─► Persist swipe in SQLite (survives reloads)
            │
            ├─► Check: Did targetUserId already like usr_me?
            │         │
            │         ├─► YES: Insert into matches -> Return { matched: true, match }
            │         └─► NO:  Return { matched: false }
            ▼
[ Client UI: Trigger "It's a Match!" Modal if matched === true ]
```

---

### Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (mobile-first viewport, neo-brutalist borders, hard shadows, Coy pink & warm cream palette)
* **Gestures & Animations:** Framer Motion (physics-based drag gestures, rotation, stamp opacity transforms, spring match modal)
* **Database & Persistence:** SQLite via `better-sqlite3` (WAL mode enabled, zero-leakage SQL queries)
* **Icons:** Lucide React
* **Testing:** Vitest with isolated in-memory SQLite (`:memory:`)

---

### Core Features & UX

* **Mobile-First Bottom Navigation Bar:** Clean toggle between a placeholder **Home** tab (Coy's existing crush list) and the active **Discover** tab.
* **Swipe Deck:**
  * Displays one card at a time with the next card subtly scaled behind for physical depth.
  * Drag gestures on mobile and tactile desktop buttons (Pass `✕` and Like `♥`).
  * Keyboard shortcuts: `ArrowLeft` to Pass, `ArrowRight` to Like.
  * Tilted stamp overlays (`LIKE ♥` in mint/emerald, `PASS ✕` in yellow/amber) that fade in with drag distance.
* **Seeded Profiles:** 32 realistic mock profiles across Indian universities and cities with verified avatars, short bios, and interest tags. 11 profiles are pre-configured to like the current user, including 2 within the first 5 cards for instant demo matches.
* **"It's a Match!" Modal:** Coy's signature overlapping circles motif (User + Match) with spring animations, profile preview, and action CTAs.
* **Matches View Drawer:** Slide-over sheet displaying all confirmed mutual matches with relative timestamps.
* **Empty State:** Clean screen when all cards have been swiped, featuring a **"Reset Demo Deck"** button calling `POST /api/reset` to easily replay the demo.

---

### API Reference

#### `GET /api/feed`
Returns profiles the current user has not yet swiped on.
```json
{
  "profiles": [
    {
      "id": "usr_seed_01",
      "name": "Rhea Sen",
      "age": 22,
      "bio": "Film photography, filter coffee at 2 AM...",
      "cityOrCollege": "NID Ahmedabad / Bengaluru",
      "interests": ["Film Photography", "Indie Music", "Coffee"],
      "avatarUrl": "https://images.unsplash.com/..."
    }
  ]
}
```
*(CRITICAL: `has_liked_current_user` is stripped server-side and never returned).*

#### `POST /api/swipe`
Records a swipe action (`LIKE` or `PASS`) and evaluates mutual matching in a transaction.
```json
// Request Body
{
  "targetUserId": "usr_seed_01",
  "direction": "LIKE" // or "PASS"
}

// Response (Mutual Match)
{
  "success": true,
  "matched": true,
  "match": {
    "id": "match_1732087200000_usr_seed_01",
    "targetUserId": "usr_seed_01",
    "name": "Rhea Sen",
    "age": 22,
    "bio": "Film photography, filter coffee at 2 AM...",
    "cityOrCollege": "NID Ahmedabad / Bengaluru",
    "interests": ["Film Photography", "Indie Music", "Coffee"],
    "avatarUrl": "https://images.unsplash.com/...",
    "matchedAt": "2026-11-20T12:40:00.000Z"
  }
}

// Response (No Match or Pass)
{
  "success": true,
  "matched": false
}
```

#### `GET /api/matches`
Returns all mutual matches for the authenticated user ordered by `matched_at DESC`.
```json
{
  "matches": [
    {
      "id": "match_1732087200000_usr_seed_01",
      "targetUserId": "usr_seed_01",
      "name": "Rhea Sen",
      "age": 22,
      "bio": "Film photography, filter coffee at 2 AM...",
      "cityOrCollege": "NID Ahmedabad / Bengaluru",
      "interests": ["Film Photography", "Indie Music", "Coffee"],
      "avatarUrl": "https://images.unsplash.com/...",
      "matchedAt": "2026-11-20T12:40:00.000Z"
    }
  ]
}
```

#### `POST /api/reset`
Clears swipes and matches so reviewers can replay the discovery feed from scratch.
```json
{
  "success": true,
  "message": "Swipes and matches reset successfully"
}
```

---

### Local Setup & Development

```bash
# Clone the repository
git clone https://github.com/nanthitha25/coy_assignment.git
cd coy_assignment

# Install dependencies
npm install

# Seed mock profiles & database
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js allocates).

---

### Verification & Automated Tests

```bash
# Run Vitest test suite
npm test
```

All 8 tests run against an in-memory SQLite instance verifying:
1. `GET /api/feed` returns unswiped profiles and **never exposes** incoming like status.
2. A swiped profile (`LIKE` or `PASS`) **never appears** in `GET /api/feed` again.
3. Passing (`PASS`) on a profile that liked the user does **NOT** create a match.
4. Liking (`LIKE`) a profile that did not like the user does **NOT** create a match.
5. Liking (`LIKE`) a profile that did like the user creates a match and persists in `GET /api/matches`.
6. Duplicate swipes on the same ID are handled cleanly without duplicate matches.
7. Resetting swipes and matches restores full feed and clears match list.
8. Input validation for invalid swipe directions or missing profile IDs.
