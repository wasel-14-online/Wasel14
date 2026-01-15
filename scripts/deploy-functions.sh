#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install with: npm i -g supabase"
  exit 1
fi

echo "Deploying supabase functions from supabase/functions..."
cd supabase/functions
for fn in */ ; do
  fnName=$(basename "$fn")
  echo "Deploying function: $fnName"
  supabase functions deploy "$fnName" --project-ref "$SUPABASE_URL"
done

echo "Functions deployed."
