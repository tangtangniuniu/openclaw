#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${OPENCLAW_BASE_URL:-http://127.0.0.1:18789}"
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-replace-me}"

curl -sS "${BASE_URL}/tools/invoke" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "sessions_list",
    "action": "json",
    "args": {},
    "sessionKey": "main"
  }'
