# Coy — Product Exploration & Core Feature Proposals

**Candidate:** Nanthitha Venkatachalapathy  
**Role:** Software Development Engineer (SDE) Intern Assignment  
**Product Analyzed:** [Coy](https://app.getcoy.com)  

---

## Executive Summary

Coy’s core value proposition rests on a single, uncompromising promise: **never reveal one-sided interest while maximizing real-world mutual connections**. Traditional dating and crush apps struggle with two opposing extremes:
1. **Social risk and vulnerability:** Fear of awkward rejection prevents users from expressing feelings.
2. **Brute-force exposure:** Without strict privacy constraints, users can game matching algorithms to infer who likes them.

Through hands-on teardown of Coy’s onboarding, Phone OTP verification, crush slot allocation, email alias linking, invite mechanics, and extra-slot monetization, two structural product challenges emerge:
- **Upstream Slot Decay:** The strict rule (*"Adding is final: you can't remove someone once they're on your list"*) protects against brute-force probing, but causes permanent slot lock-in when crushes never join Coy. This exhausts high-intent users' slots and causes churn.
- **Downstream Match Inertia:** When a mutual match occurs, the app leaves the "first move" friction completely unsolved—especially critical when crushes were added via email or when neither party wants to break the ice off-platform without a bridge.

Below are two core feature proposals designed to address these gaps while strictly upholding Coy's cryptographic and privacy guarantees.

---

## Part A: Feature Proposals

```
+-----------------------------------------------------------------------------------+
|                                  COY LIFECYCLE                                    |
|                                                                                   |
|   [ Add Crush ]  -->  [ Anonymous Alert ]  -->  [ Mutual Match ]  -->  [ Action ]|
|         |                                              |                          |
|         v                                              v                          |
|   FEATURE 1:                                     FEATURE 2:                       |
|   Time-Bounded Slot Expiry                       Mutual-Only In-App Icebreaker   |
|   (Solves slot exhaustion & churn)               (Solves post-match inertia)     |
+-----------------------------------------------------------------------------------+
```

---

### Feature 1: Time-Bounded Slot Expiry (Anti-Brute-Force + Long-Term Retention)

#### 1. The Problem
Coy currently enforces an absolute invariant: *"Adding is final: you can't remove someone once they're on your list."*

* **The Design Intent:** This constraint prevents malicious **brute-force probing**. If a user had an instant "Remove" button, an adversary could systematically add their entire phone contact book one by one: add contact $A$, check if an immediate match occurs, delete $A$, add contact $B$, check for a match, delete $B$, and so forth.
* **The Unintended Consequence:** Real-world crush dynamics are dynamic, but slot allocation is static. Over 3–6 months, users exhaust their initial 3 free slots on friends or acquaintances who may never install the app, have moved away, or are in relationships. Because slots are permanently consumed, active users hit a dead end, app utility drops to zero, and retention collapses unless they pay or spam 3 friends with referral links.

#### 2. Proposed Feature: Silent 60/90-Day Slot Lifecycle
Introduce an automated, server-driven **60- or 90-day silent expiry** for unmatched crushes.

* **Silent Recycled Slots:** If an added crush does not match within the expiry window, the slot quietly transitions from `ACTIVE_UNMATCHED` to `EXPIRED`. The slot is returned to the user's available pool.
* **Zero Target Notification:** The target receives **no notification** upon expiry. They previously received only an anonymous alert (*"Someone likes you on Coy"*), which naturally fades as unverified ambient interest.
* **Sender Countdown:** Senders see a calm, subtle indicator on their slot (e.g., *"Active • Renews in 18 days"*) providing visibility and anticipation without pressure.
* **Optional Extension / Priority Lock:** Users with extra slots or active referral streaks can choose to "extend" a high-conviction crush for an additional cycle.

#### 3. Privacy Edge Cases Handled

| Threat / Edge Case | Attack Vector | Technical Safeguard |
| :--- | :--- | :--- |
| **Serial Probe Attack** | User adds contact $A$, waits for expiry, then adds contact $B$. | **Temporal Rate-Limiting:** A 60–90 day cycle makes contact-list enumeration mathematically unviable (enumerating a 100-contact book would take 15+ years). |
| **Notification Spam & Harassment** | User lets contact $A$ expire, then re-adds contact $A$ to repeatedly trigger anonymous SMS/push pings. | **Target Ping Cooldown (Server-Side):** The backend maintains an anonymous hash `HMAC(target_phone, salt)`. Re-adding the same target within 180 days records the intent silently in the DB for matching, but suppresses outgoing SMS/Push alerts to the target. |
| **Timing & Inference Leakage** | Target registers at Day 59, sender slot expires at Day 60; timing asymmetry reveals sender identity. | **Grace Periods & Asynchronous Batching:** Slot reclamation runs via delayed asynchronous cron workers with random jitter ($T_{expiry} \pm 24\text{h}$) to eliminate millisecond correlation attacks. |
| **Simultaneous Match on Expiry Boundary** | Target installs Coy and adds sender at the exact hour the slot expires. | **Soft Expiry State:** An expired record enters a 7-day `RECONCILIATION_WINDOW`. If the target matches during this grace window, the match is honored and resurrected. |

#### 4. Expected Impact
* **Solves Permanent Lock-in:** High-intent users re-engage every 60–90 days to review their slots.
* **Preserves Monetization & Referrals:** Users who have 5 active crushes *right now* still purchase extra slots or invite friends to expand their concurrent bandwidth.
* **Long-Term Retention (LTV):** Transforms Coy from a "one-and-done" app into a persistent lifestyle utility across college semesters and social circles.

---

### Feature 2: Mutual-Only In-App Icebreaker (Post-Match Conversion)

#### 1. The Problem
Matching on Coy creates high emotional valence (*"They like me back!"*), but immediately hits an awkward friction cliff: **the off-platform transition**.

* **Channel Ambiguity:** If user $A$ added user $B$ using an email address (supported by Coy's email alias feature), neither user necessarily has the other's phone number or WhatsApp.
* **The "First Move" Freeze:** Even with mutual confirmation, psychological hesitation often paralyzes both users (*"Do I text them on WhatsApp immediately? Will I look desperate? Should I wait?"*).
* **Drop-off & Churn:** Because Coy has no post-match interaction surface, the app cannot measure whether a match led to a successful real-world conversation or fizzled out.

#### 2. Proposed Feature: Ephemeral 1-Tap Match Chamber
Upon mutual match confirmation, Coy unlocks a lightweight, **mutual-only 7-day Icebreaker Chamber** directly inside the match view.

* **Playful 1-Tap Prompts:** Rather than open-ended blank chat, users select from low-stakes, pre-set icebreakers:
  - *"Guess who added who first?"*
  - *"Coffee this week or drinks on Friday?"*
  - *"Truth: How long have you had a crush on me?"*
* **Mutual "Share Contact / Social Handle" Handshake:**
  - A dual-consent button: `[Share my Instagram / WhatsApp]`.
  - Contact details (Phone, Instagram handle, or Email) are **only revealed when both parties tap Share**. If only one person taps it, the state remains private (*"Waiting for mutual reveal"*).
* **7-Day Ephemeral TTL:** The chat room automatically self-destructs after 7 days, nudging both parties to exchange contact details and take the connection to the real world.

#### 3. Privacy Edge Cases Handled

```
User A (Taps "Share Contact") ---> [ Contact Info Staged ]
                                           |
                                 Is User B Opted-In?
                                   /              \
                             NO  /                  \  YES
                                v                    v
                    "Waiting for both to share"    Both Contact Details Revealed!
                    (Zero data leaked to B)        (Mutual Consent Satisfied)
```

| Threat / Edge Case | Attack Vector | Technical Safeguard |
| :--- | :--- | :--- |
| **One-Sided Profile Snooping** | Unmatched user probes the API to retrieve candidate social handles or contact details. | **Zero-Leakage Endpoint Design:** Icebreaker endpoints (`/api/matches/:id/messages`, `/api/matches/:id/share`) perform hard server-side session checks verifying `match.status === 'MUTUAL_CONFIRMED'`. If not mutual, returns `404 Not Found`. |
| **Harassment or Unsolicited Contact** | Malicious matched user spams offensive content in the chat room. | **1-Tap Instant Block & Match Revocation:** Either party can tap "Sever Match", which permanently dissolves the match, deletes the chat log, and blocks further interaction. |
| **Data Lingering / Subpoena Risk** | Unencrypted personal conversations stored indefinitely on Coy servers. | **Ephemeral In-Memory / Strict TTL:** Messages and chat threads have a strict 7-day Time-To-Live (TTL). Once expired or once contact info is exchanged, raw messages are permanently wiped from the database. |
| **Contact Info Scraping** | One user extracts the other’s phone number without giving up their own. | **Atomic Two-Phase Reveal:** Phone numbers/socials are never returned in match payloads until `user_a_shared === true AND user_b_shared === true`. |

#### 4. Expected Impact
* **Maximizes Match-to-Conversation Rate:** Eliminates cold-start anxiety and bridges digital discovery into real-world dates.
* **Closes the Loop for Email-Only Adds:** Solves the unreachable crush edge case where users don't share WhatsApp/iMessage contacts initially.
* **Organic Virality:** Successful matches who break the ice in-app become vocal ambassadors, accelerating invite-link sharing and organic TikTok/Instagram word of mouth.

---

## Technical Feasibility & Architectural Summary

| Dimension | Feature 1: Slot Expiry | Feature 2: Match Icebreaker |
| :--- | :--- | :--- |
| **Database Changes** | `expires_at` (TIMESTAMP), `status` enum (`PENDING`, `EXPIRED`, `MATCHED`), `last_pinged_at` (TIMESTAMP) | `matches` table extension (`user1_shared_contact`, `user2_shared_contact`), ephemeral `messages` table with TTL index |
| **Background Jobs** | Scheduled daily cron / Redis delayed queue for expiring slots and issuing state changes | Scheduled cleanup worker deleting expired chat logs (> 7 days) |
| **Client Overhead** | Minimal (countdown badge on slot card) | Lightweight modal / drawer with pre-set buttons and optional WebSockets / SSE for live updates |
| **Security Impact** | Strengthens anti-enumeration by preventing permanent state accumulation | Preserves zero-knowledge promise via two-phase cryptographic commit |
