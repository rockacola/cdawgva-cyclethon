#!/bin/bash

# Local convenience script for manually triggering a donation fetch.
# In production, GitHub Actions (.github/workflows/refresh.yml) handles this automatically.

# Add Homebrew asdf binary and shims to PATH so shims can resolve correctly in cron
export PATH="/opt/homebrew/bin:$HOME/.asdf/shims:$PATH"

DIR="$(cd "$(dirname "$0")" && pwd)"
TS=$(date -u +%Y%m%d_%H%M%S)

mkdir -p "$DIR/logs" "$DIR/errors"

LOG="$DIR/logs/refresh_$TS.log"
ERR="$DIR/errors/refresh_$TS.err"

# Prevent overlapping runs
LOCK="$DIR/.refresh.lock"
if [ -f "$LOCK" ]; then
  echo "Already running (lock: $LOCK). Exiting." >> "$ERR"
  exit 1
fi
trap "rm -f '$LOCK'" EXIT
touch "$LOCK"

run() {
  echo "[START] $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  cd "$DIR/scripts/tiltify-api" || exit 1
  NODE_NO_WARNINGS=1 /Users/travis/.asdf/shims/ts-node src/fetch-donations.ts || exit 1

  echo "[END] $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

run > "$LOG" 2> "$ERR"
EXIT_CODE=$?

[ ! -s "$LOG" ] && rm -f "$LOG"
[ ! -s "$ERR" ] && rm -f "$ERR"

exit $EXIT_CODE
