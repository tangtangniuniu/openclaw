#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${OPENCLAW_BASE_URL:-http://127.0.0.1:18789}"
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-replace-me}"

curl -sS "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openclaw/default",
    "messages": [
      {
        "role": "user",
        "content": "请用三条要点介绍 OpenClaw gateway。"
      }
    ]
  }'
