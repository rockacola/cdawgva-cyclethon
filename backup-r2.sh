#!/bin/bash

# Downloads JSON files from Cloudflare R2 and saves them with a UTC datetime stamp.
# Designed to be run as a cron job for hourly backups.
#
# Usage:
#   ./backup-r2.sh
#
# Cron example (hourly):
#   0 * * * * /path/to/cdawgva-cyclethon/backup-r2.sh
#
# Requires: aws CLI (brew install awscli)
# Reads R2 credentials from: scripts/tiltify-api/.env

# Add Homebrew asdf binary and shims to PATH so shims can resolve correctly in cron
export PATH="/opt/homebrew/bin:$HOME/.asdf/shims:$PATH"

DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$DIR/scripts/tiltify-api/.env"

# Load .env
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env not found at $ENV_FILE" >&2
  exit 1
fi

set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE"
set +o allexport

# Validate required vars
for var in R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET_NAME; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set in $ENV_FILE" >&2
    exit 1
  fi
done

TS=$(date -u +%Y%m%d_%H%M%S)
BACKUP_DIR="$DIR/backups/r2/$TS"
mkdir -p "$BACKUP_DIR"

R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

R2_FILES=(
  "donations-full.json"
  "donations-latest-100.json"
  "donations-latest-500.json"
  "donations-stats.json"
)

echo "[START] $TS — downloading ${#R2_FILES[@]} file(s) to $BACKUP_DIR"

for KEY in "${R2_FILES[@]}"; do
  BASE="${KEY%.json}"
  DEST="$BACKUP_DIR/${BASE}_${TS}.json"

  AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
  aws s3 cp \
    --endpoint-url "$R2_ENDPOINT" \
    --region auto \
    --quiet \
    "s3://${R2_BUCKET_NAME}/${KEY}" \
    "$DEST"

  if [ $? -eq 0 ]; then
    echo "  OK  $KEY → $(basename "$DEST")"
  else
    echo "  FAIL $KEY" >&2
  fi
done

echo "[END]   $(date -u +%Y%m%dT%H%M%SZ)"
