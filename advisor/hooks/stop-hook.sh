#!/bin/bash

# Stop hook for Advisor.
# If files changed since the last advisor consult and the turn ended without one,
# ask the agent to run the pre-completion consult. Blocks at most three
# consecutive stops (the ZCode runtime also caps Stop continuations at three).
#
# Input:  { "stop_hook_active": bool, "last_assistant_message": "...", ...common }
# Output: { "decision": "block", "reason": "<text>" } to continue, or exit 0 with no output

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

HOOK_INPUT=$(cat)

advisor_init_root "$HOOK_INPUT"
advisor_require_enabled
advisor_bind_session "$HOOK_INPUT" || exit 0

# The agent stopped to ask the user something. Stay quiet and leave the marker
# armed so the reminder fires after the user answers and the work resumes.
if [[ -f "$LAST_RESPONSE_FILE" ]]; then
  LAST_CHAR=$(tr -d '[:space:]' < "$LAST_RESPONSE_FILE" | tail -c 1)
  if [[ "$LAST_CHAR" == "?" ]]; then
    exit 0
  fi
fi

NUDGE=$(jq -r 'if .nudge == false then "false" else "true" end' "$STATE_FILE")
if [[ "$NUDGE" != "true" ]]; then
  exit 0
fi

if [[ ! -f "$PENDING_FILE" ]]; then
  exit 0
fi

# Count consecutive nudges so we never argue with the runtime's stop limit.
NUDGES=$(jq -r '.nudges // 0' "$STATE_FILE" 2>/dev/null || echo 0)
if [[ "$(jq -r '.stop_hook_active // false' <<< "$HOOK_INPUT")" == "true" ]]; then
  NUDGES=$((NUDGES + 1))
  advisor_state_update '.nudges = $n' --argjson n "$NUDGES"
fi
if [[ "$NUDGES" -ge 3 ]]; then
  exit 0
fi

rm -f "$PENDING_FILE"

MODEL=$(jq -r '.model // "the configured advisor model"' "$STATE_FILE")
MESSAGE="[Advisor] Files changed since the last advisor consult and the turn ended without one. If this work is done, or you were about to declare it done, run the pre-completion consult now per the advisor skill: build the briefing, spawn the \`advisor-subagent\` subagent (model: $MODEL), act on the verdict, and report it in one line. If the change was trivial, or you are waiting on the user, say so in one line and stop."

jq -n --arg msg "$MESSAGE" '{decision: "block", reason: $msg}'
exit 0
