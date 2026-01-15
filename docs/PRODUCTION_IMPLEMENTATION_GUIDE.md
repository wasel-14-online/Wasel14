**Production Implementation Guide**

This document captures implementation-ready architecture, APIs, frontend flows, config examples, security guidance, and edge-case handling across the requested scope: PWA, Firebase push, Stripe, Twilio, Supabase-backed APIs, admin/monitoring, and strategic scaffolds.

**1. PWA Completion**
- **Architecture Decision:** Use a single service worker at `/service-worker.js` with a small precache list and runtime caching. Use Background Sync + IndexedDB queue for offline writes. Keep SW minimal and test with Workbox locally for reliability.
- **Folder/File Structure:**
  - public/manifest.json
  - public/service-worker.js
  - public/icons/* (192, 512, maskable)
  - public/robots.txt
- **Backend APIs Needed:** None. SW caches network responses; POST queue replays to existing endpoints (e.g., `/api/*` or Supabase functions).
- **Frontend Components & Flows:** App shell registers SW (see `src/services/sw-register.ts`), shows install prompt, uses `navigator.serviceWorker.ready` to register for push.
- **Config / Env Examples:** See `.env.example` for VAPID and SUPABASE keys.
- **Security Considerations:** Serve SW over HTTPS only; do not cache sensitive API responses (auth tokens) — use `Cache-Control` headers. Keep `service-worker.js` small.
- **Edge Cases & Failure Handling:** If background sync fails, store failures in IndexedDB and surface retry UI in Admin Dashboard.

**2. Firebase & Push Infrastructure**
- **Architecture Decision:** Use Firebase Cloud Messaging for web push. Keep server keys (VAPID) in env; register tokens via serverless endpoint (Supabase Edge Function) that stores tokens with owner mapping. Use FCM for mobile/cordova/React Native with separate native config.
- **Folder/File Structure:**
  - src/firebase.client.ts (client init)
  - public/service-worker.js (push handling)
  - src/services/push.ts (client registration & token lifecycle)
  - supabase/functions/register-push-token/index.ts (server)
  - supabase/functions/unregister-push-token/index.ts (server)
- **Backend APIs (routes, schemas, logic):**
  - POST /register-push-token { token, user_id, platform } -> validate, upsert into `push_tokens` (columns: id, user_id, token, platform, created_at, last_seen)
  - POST /unregister-push-token { token } -> delete
- **Frontend Components & Flows:** On login, call `requestPushPermissionAndGetToken()` then POST token to `/register-push-token`. Listen for token refreshes and re-register. Show a UI toggle to opt-out.
- **Config / Env Examples:** `VITE_FIREBASE_VAPID_KEY`, `VITE_FIREBASE_PROJECT_ID`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Security Considerations:** Only store tokens server-side via a service-role key. Do not leak service-role keys to client. Validate tokens server-side and rate-limit registration endpoints.
- **Edge Cases & Failure Handling:** If token registration fails, retry with exponential backoff and queue via IndexedDB; notify user if push unavailable.

**3. External Integrations (Stripe, Twilio, Emergency)**
- **Architecture Decision:** Keep payment and Twilio webhook handling server-side (Supabase Edge Functions). Use Stripe Checkout for payments; verify webhook signatures. Twilio inbound SMS/voice handled in a webhook that persists to `incoming_sms` and triggers alerts.
- **Folder/File Structure:**
  - supabase/functions/stripe-webhook/index.ts
  - supabase/functions/twilio-webhook/index.ts
  - supabase/functions/emergency-alert/index.ts (creates alerts and notifies admins)
- **Backend APIs:**
  - POST /stripe-webhook -> verify, handle `checkout.session.completed` and billing events
  - POST /twilio-webhook -> validate (optional), persist to `incoming_sms`, possibly create `emergency_alert`
  - POST /emergency-alert -> (internal) create alert, notify mobile push + SMS via Twilio + email
- **Frontend Components & Flows:** In LiveTrip users can trigger emergency -> front-end calls secured endpoint `/api/emergency` -> server writes `emergency_alerts` and triggers notifications.
- **Security Considerations:** Protect endpoints with API keys and verify signatures (Stripe/Twilio). Use role-based access for admin operations.
- **Edge Cases:** Network failover: enqueue emergency actions to Supabase and replay when connection restored; send SMS fallback when push fails.

**4. Backend APIs & UX Flows**
- **Architecture Decision:** Use Supabase REST/Edge Functions for server-side operations; frontend uses those endpoints or Supabase JS with anon key for read-only operations.
- **Key Endpoints:**
  - GET /api/trips/:id -> returns trip object (readable with anon key)
  - PATCH /update-trip (serverless) -> requires service-role key (already added)
  - POST /register-push-token -> upsert push token
  - POST /unregister-push-token -> delete token
  - POST /emergency-alert -> create emergency and notify
- **Frontend Components:** `TripDetails` route (see `src/routes/TripDetails.tsx`), `LiveTrip` should call `update-trip` for status changes; `useTrips` hooks should call Supabase JS and expose optimistic UI updates.
- **Config / Env Examples:** See `src/config/index.ts` and `.env.example`.
- **Security:** Use service-role for write operations from trusted server; validate and sanitize all inputs; use prepared statements in SQL or Supabase policies.
- **Edge Cases:** Conflicting updates resolved using timestamps and server-authoritative merges. Retryable transient errors should use exponential backoff.

**5. Admin & Monitoring Features**
- **Architecture Decision:** Admin features run in a protected Admin UI path and call server-side endpoints that require an admin API token.
- **Folder/File Structure:**
  - src/admin/AdminDashboard.tsx
  - src/components/TripMonitoring.tsx
  - supabase/functions/admin/close-alert.ts
- **Backend APIs:**
  - GET /api/admin/alerts -> list alerts
  - POST /api/admin/alerts/:id/action -> acknowledge/close/escalate
- **Frontend:** Admin dashboard shows alerts table, live trip monitoring modal (wired to `TripMonitoring`), and controls to escalate (SMS + call via Twilio).
- **Security:** Admin auth (JWT + RBAC). Protect admin routes with SSO or strong 2FA.
- **Edge Cases:** Concurrent admin actions should be idempotent; show conflict warnings.

**6. Strategic High-Value Features (Scaffolding)**
- **AutonomousOperationsCenter:** A server-side orchestrator that automates common interventions (cancel, reassign driver, auto-refund). Implement as a queue worker subscribed to `trip_events` and `emergency_alerts`.
- **NetworkEffectsEngine:** Referral and loyalty engine that tracks invites, viral loops, and driver incentives. Schema: `referrals`, `incentives`, and `referral_rewards` and edge function to credit rewards.
- **AsymmetricRevenueEngine:** Implement marketplace upsells (surge, add-ons, subscriptions) + per-trip microtransactions + AI-driven pricing. Provide server-side rules and webhook handlers for Stripe.
- **Folder Structure:** `services/ops-center/`, `services/network-engine/`, `services/revenue-engine/` with Edge Functions and background workers.

**Quick Deploy Checklist**
- Required secrets: `SUPABASE_SERVICE_ROLE_KEY`, `VITE_FIREBASE_VAPID_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_AUTH_TOKEN`, `TWILIO_ACCOUNT_SID`.
- CI: add GitHub Actions secrets and run `npx tsc --noEmit` and `npx jest`.

**Files added in repo (scaffolds & implementation)**
- `src/config/index.ts` — centralized env helpers
- `src/firebase.client.ts` — client firebase init + token logic
- `supabase/functions/unregister-push-token/index.ts` — unregister push token
- `supabase/functions/stripe-webhook/index.ts` — Stripe webhook
- `supabase/functions/twilio-webhook/index.ts` — Twilio webhook
- `src/routes/TripDetails.tsx` — trip details page
- `src/admin/AdminDashboard.tsx` — admin alerts UI
- `src/components/TripMonitoring.tsx` — live trip monitoring

**Next Steps / Optional TODOs**
- Integrate Workbox for robust service-worker build and background sync queue.
- Implement full `emergency-alert` edge function to orchestrate Twilio and push notifications.
- Add DB migrations and RBAC policies for Supabase tables: `push_tokens`, `trip_events`, `emergency_alerts`, `incoming_sms`.

---
For implementation details per file and usage examples, the repository includes the above scaffolds. Use the provided `src/config` to wire secrets.
