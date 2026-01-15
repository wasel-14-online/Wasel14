#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/prepare-pr.sh "branch-name" "PR title"

BRANCH=${1:-feature/prepare-secrets}
TITLE=${2:-"chore: prepare secrets & deployment configs"}

git checkout -b "$BRANCH"
git add -A
git commit -m "$TITLE" || echo "No changes to commit"
git push -u origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  gh pr create --title "$TITLE" --body "Automated PR: prepare secrets and deployment helpers. See docs/SECRETS_SETUP.md" --base main
else
  echo "Branch pushed: $BRANCH. Create a PR manually against main."
fi
