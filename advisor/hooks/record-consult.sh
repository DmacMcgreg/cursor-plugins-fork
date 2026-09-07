#!/bin/bash

# PostToolUse hook for Advisor (matcher: Task|Agent).
# When the advisor-subagent subagent finishes a consult, count it, clear the
# pending-edits marker, and append the advice to .zcode/advisor/log.md so the
# user can review it later.
#
# Input:  { "tool_name": "Task", "tool_input": { "subagent_type": "...", "description": "..." },
#           "tool_response": <subagent result>, ...common }
# Output: none

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

HOOK_INPUT=$(cat)

advisor_init_root "$HOOK_INPUT"
advisor_require_enabled
advisor_bind_session "$HOOK_INPUT" || exit 0

SUBAGENT_TYPE=$(jq -r '.tool_input.subagent_type // empty' <<< "$HOOK_INPUT")
if [[ "$SUBAGENT_TYPE" != "advisor-subagent" ]]; then
  exit 0
fi

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
advisor_state_update '.consults = ((.consults // 0) + 1) | .last_consult_at = $now | .nudges = 0' --arg now "$NOW"
rm -f "$PENDING_FILE"

DESCRIPTION=$(jq -r '.tool_input.description // "Advisor consult"' <<< "$HOOK_INPUT")
SUMMARY=$(jq -r 'if (.tool_response | type) == "object" then (.tool_response.summary // (.tool_response | tostring)) else (.tool_response // "" | tostring) end' <<< "$HOOK_INPUT" | head -c 6000)
{
  printf '## %s — %s\n\n' "$NOW" "$DESCRIPTION"
  if [[ -n "$SUMMARY" ]]; then
    printf '%s\n\n' "$SUMMARY"
  else
    printf '_No summary captured._\n\n'
  fi
} >> "$LOG_FILE"

exit 0
