## Secrets Setup

This document explains how to securely provision the secrets required by the project.

1) Local interactive setup (recommended when running from your machine)

Prereqs: `gh` CLI installed and authenticated with access to the repository.

Run:

```bash
./scripts/set-github-secrets.sh owner/repo
```

The script will prompt for each secret. Leave empty to skip a secret.

2) CI: GitHub Actions

Add the following repository secrets via the GitHub UI or the `gh` CLI. These names are referenced in CI and functions:

- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_VAPID_KEY`
- `FCM_SERVER_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `EMERGENCY_CONTACT_NUMBER`

3) Supabase Edge Functions

Set the same environment values in the Supabase project settings so your functions can use them at runtime.

4) Local development 

Create a `.env.local` file (gitignored), copy keys from `.env.example`, and set actual values locally. Example:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_FIREBASE_VAPID_KEY=...
STRIPE_SECRET_KEY=...
TWILIO_AUTH_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_FROM_NUMBER=...
EMERGENCY_CONTACT_NUMBER=...
```

Security notes:
- Never commit secrets. Use `.env.example` only for names and placeholders.
- Rotate keys if they have been exposed in public channels.
- Use least-privilege keys for CI/build and separate service-role keys for server operations.
