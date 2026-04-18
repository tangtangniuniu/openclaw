#!/usr/bin/env bash
# OpenClaw build/start/stop/restart script for Linux

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="${ROOT_DIR}/node_modules/.bin:${PATH}"

PID_FILE="${HOME}/.openclaw/gateway.pid"
LOG_FILE="${HOME}/.openclaw/gateway.log"

log() { printf '%s\n' "$*"; }
fail() { log "ERROR: $*" >&2; exit 1; }

gateway_pid() {
  if [[ -f "$PID_FILE" ]]; then
    cat "$PID_FILE" 2>/dev/null
  fi
}

gateway_pid_from_pgrep() {
  pgrep -f "openclaw-gateway" 2>/dev/null | head -1 || true
}

gateway_is_running() {
  local pid
  pid=$(gateway_pid)
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    return 0
  fi
  pid=$(gateway_pid_from_pgrep)
  if [[ -n "$pid" ]]; then
    echo "$pid" > "$PID_FILE"
    return 0
  fi
  return 1
}

cmd_build() {
  log "==> Building OpenClaw..."
  cd "$ROOT_DIR"
  pnpm build
}

cmd_start() {
  if gateway_is_running; then
    log "OpenClaw gateway is already running (PID: $(gateway_pid))"
    return 0
  fi
  log "==> Starting OpenClaw gateway..."
  mkdir -p "$(dirname "$LOG_FILE")"
  node "${ROOT_DIR}/openclaw.mjs" gateway run --bind loopback --port 18789 --force > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 2
  if gateway_is_running; then
    log "OpenClaw gateway started (PID: $(gateway_pid))"
  else
    fail "Failed to start gateway. Check $LOG_FILE"
  fi
}

cmd_stop() {
  if ! gateway_is_running; then
    log "OpenClaw gateway is not running"
    rm -f "$PID_FILE"
    return 0
  fi
  log "==> Stopping OpenClaw gateway (PID: $(gateway_pid))..."
  kill "$(gateway_pid)" 2>/dev/null || true
  rm -f "$PID_FILE"
  sleep 1
  if gateway_is_running; then
    pkill -f openclaw-gateway 2>/dev/null || true
  fi
  log "OpenClaw gateway stopped"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  if gateway_is_running; then
    log "OpenClaw gateway is running (PID: $(gateway_pid))"
    if command -v ss &>/dev/null; then
      ss -ltnp 2>/dev/null | grep 18789 || true
    elif command -v lsof &>/dev/null; then
      lsof -i :18789 2>/dev/null || true
    fi
  else
    log "OpenClaw gateway is not running"
  fi
}

case "${1:-}" in
  build)   cmd_build ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_restart ;;
  status)  cmd_status ;;
  *)
    echo "Usage: $0 {build|start|stop|restart|status}"
    exit 1
    ;;
esac