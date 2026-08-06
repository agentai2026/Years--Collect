#!/usr/bin/env bash
# Shared helper for Actions: commit catalog changes and push with rebase.
set -euo pipefail
MSG="${1:?commit message required}"
shift || true
PATHS=("$@")
if [ "${#PATHS[@]}" -eq 0 ]; then
  PATHS=(docs/catalog.json)
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add "${PATHS[@]}"
if git diff --cached --quiet; then
  echo "No changes."
  exit 0
fi
git commit -m "$MSG"
# Rebase onto latest main to avoid non-fast-forward failures when
# multiple automations commit close together.
git pull --rebase origin main
git push origin HEAD:main
