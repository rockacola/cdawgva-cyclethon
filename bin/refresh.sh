#!/bin/bash

# Local convenience script for manually triggering a donation fetch.
# In production, GitHub Actions (.github/workflows/refresh.yml) handles this automatically.

# Add Homebrew asdf binary and shims to PATH so shims can resolve correctly in cron
export PATH="/opt/homebrew/bin:$HOME/.asdf/shims:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TS=$(date -u +%Y%m%d_%H%M%S)

mkdir -p "$ROOT_DIR/logs" "$ROOT_DIR/errors"

LOG="$ROOT_DIR/logs/refresh_$TS.log"
ERR="$ROOT_DIR/errors/refresh_$TS.err"

# Prevent overlapping runs
LOCK="$ROOT_DIR/.refresh.lock"
if [ -f "$LOCK" ]; then
  echo "Already running (lock: $LOCK). Exiting." >> "$ERR"
  exit 1
fi
trap "rm -f '$LOCK'" EXIT
touch "$LOCK"

run() {
  echo "[START] $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  cd "$ROOT_DIR" || exit 1
  DATA_STORE=r2 npm run fetch-donations || exit 1

  echo "[END] $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

run > "$LOG" 2> "$ERR"
EXIT_CODE=$?

[ ! -s "$LOG" ] && rm -f "$LOG"
[ ! -s "$ERR" ] && rm -f "$ERR"

exit $EXIT_CODE
