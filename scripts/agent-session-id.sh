#!/bin/sh
set -eu

agent="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]')"

case "$agent" in
  *claude*|*gemini*)
    if [ -z "${SHARKBAY_SESSION_ID:-}" ]; then
      echo "SHARKBAY_SESSION_ID not set" >&2
      exit 1
    fi
    printf '%s\n' "$SHARKBAY_SESSION_ID"
    exit 0
    ;;
  *codex*) ;;
  *)
    echo "usage: $0 codex|claude|gemini" >&2
    exit 64
    ;;
esac

transcript="$(
  lsof -p "$PPID" 2>/dev/null |
    awk '/\/\.codex\/sessions\/.*\.jsonl$/ {print $NF; exit}'
)"

if [ -z "$transcript" ]; then
  echo "codex session transcript not found" >&2
  exit 1
fi

session_id="$(
  head -n 1 "$transcript" |
    sed -n 's/.*"payload":{"id":"\([^"]*\)".*/\1/p'
)"

if [ -z "$session_id" ]; then
  echo "codex session id not found" >&2
  exit 1
fi

printf '%s\n' "$session_id"
