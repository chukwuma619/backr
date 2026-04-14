#!/bin/sh
set -e

if [ -z "$FIBER_SECRET_KEY_PASSWORD" ]; then
  echo "error: set FIBER_SECRET_KEY_PASSWORD (wallet encryption password for fnn)" >&2
  exit 1
fi

DATA="${FIBER_DATA_DIR:-/data}"
mkdir -p "$DATA"

exec fnn -c /opt/fiber/config.yml -d "$DATA"
