#!/bin/bash

# Add Homebrew asdf binary and shims to PATH so shims can resolve correctly in cron
export PATH="/opt/homebrew/bin:$HOME/.asdf/shims:$PATH"

DIR="$(cd "$(dirname "$0")" && pwd)"
TS=$(date -u +%Y%m%d_%H%M%S)

mkdir -p "$DIR/logs" "$DIR/errors"

LOG="$DIR/logs/run_$TS.log"
ERR="$DIR/errors/error_$TS.err"

# Prevent overlapping cron runs
LOCK="$DIR/.run.lock"
if [ -f "$LOCK" ]; then
  echo "Already running (lock: $LOCK). Exiting." >> "$ERR"
  exit 1
fi
trap "rm -f '$LOCK'" EXIT
touch "$LOCK"

NODE_NO_WARNINGS=1 /Users/travis/.asdf/shims/ts-node "$DIR/src/fetch-donations.ts" > "$LOG" 2> "$ERR"
EXIT_CODE=$?

[ ! -s "$LOG" ] && rm -f "$LOG"
[ ! -s "$ERR" ] && rm -f "$ERR"

exit $EXIT_CODE
