# Production Runbook (Quick Start)

1. Install deps

```bash
npm install
```

2. Build assets & service worker

```bash
npm run build
npm run build-sw
```

3. Type-check and tests

```bash
npx tsc --noEmit
npm test
```

4. Deploy functions

- Deploy `supabase/functions/*` as Edge Functions to your Supabase project or host as serverless functions (Vercel, Netlify).
- Ensure environment variables (see `.env.example`) are set in the deployment platform.

5. Supabase DB setup

- Run migrations in `supabase/migrations/init.sql` against your Supabase DB.

6. Secrets (must be stored securely in CI / platform)

- `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_VAPID_KEY`, `FCM_SERVER_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
