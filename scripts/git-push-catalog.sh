#!/usr/bin/env bash
# Shared helper for Actions: commit catalog changes and push with rebase.
set -euo pipefail
MSG="${1:?commit message required}"
shift || true
PATHS=("$@")
if [ "${#PATHS[@]}" -eq 0 ]; then
  PATHS=(docs/catalog.json public/collect-assets/catalog.json)
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add "${PATHS[@]}"
if git diff --cached --quiet; then
  echo "No changes."
  exit 0
fi
git commit -m "$MSG"

# Retry for transient non-fast-forward races. Catalog writers also share
# the catalog-writers concurrency group so conflicts should be rare.
for attempt in 1 2 3 4 5; do
  if git pull --rebase origin main; then
    if git push origin HEAD:main; then
      echo "Pushed on attempt ${attempt}."
      exit 0
    fi
  else
    echo "Rebase failed on attempt ${attempt}; rebuilding commit on origin/main."
    git rebase --abort 2>/dev/null || true
    git fetch origin main
    git reset --soft origin/main
    git add "${PATHS[@]}"
    if git diff --cached --quiet; then
      echo "Remote already contains our changes."
      exit 0
    fi
    git commit -m "$MSG"
  fi
  sleep $((attempt * 3))
done

echo "Failed to push catalog after retries." >&2
exit 1
