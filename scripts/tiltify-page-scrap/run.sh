#!/bin/bash

# Add Homebrew asdf binary and shims to PATH so shims can resolve correctly in cron
export PATH="/opt/homebrew/bin:$HOME/.asdf/shims:$PATH"

DIR="$(cd "$(dirname "$0")" && pwd)"
TS=$(date -u +%Y%m%d_%H%M%S)

mkdir -p "$DIR/logs" "$DIR/errors"

LOG="$DIR/logs/run_$TS.log"
ERR="$DIR/errors/error_$TS.err"

/Users/travis/.asdf/shims/ts-node "$DIR/src/index.ts" > "$LOG" 2> "$ERR"

[ ! -s "$LOG" ] && rm -f "$LOG"
[ ! -s "$ERR" ] && rm -f "$ERR"
