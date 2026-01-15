#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/set-github-secrets.sh [owner/repo]
# Prompts for each secret (silent input) and uses `gh secret set` to store them in the repo.

REPO=${1:-}
if [ -z "$REPO" ]; then
  if command -v gh >/dev/null 2>&1; then
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
  fi
fi

if [ -z "$REPO" ]; then
  echo "Repository not specified and gh CLI couldn't detect it. Provide owner/repo as first argument." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI required. Install: https://cli.github.com/" >&2
  exit 1
fi

SECRETS=(
  "SUPABASE_SERVICE_ROLE_KEY"
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_FIREBASE_VAPID_KEY"
  "FCM_SERVER_KEY"
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_PROJECT_ID"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "STRIPE_PUBLISHABLE_KEY"
  "TWILIO_ACCOUNT_SID"
  "TWILIO_AUTH_TOKEN"
  "TWILIO_FROM_NUMBER"
  "EMERGENCY_CONTACT_NUMBER"
)

echo "Setting GitHub secrets for repository: $REPO"
for name in "${SECRETS[@]}"; do
  printf "Enter value for %s (leave empty to skip): " "$name"
  # read silently
  IFS= read -r -s val
  echo
  if [ -z "$val" ]; then
    echo "Skipping $name"
    continue
  fi
  echo "Setting secret $name"
  echo -n "$val" | gh secret set "$name" --repo "$REPO" --body -
done

echo "Done. Secrets set (skipped any left empty)."
