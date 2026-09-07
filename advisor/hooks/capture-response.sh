#!/bin/bash

# Stop hook for Advisor (runs before stop-hook.sh).
# Keeps the tail of the latest assistant message so the stop hook can tell
# whether the agent ended its turn with a question for the user.
#
# Input:  { "last_assistant_message": "<text>", ...common }
# Output: none

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

HOOK_INPUT=$(cat)

advisor_init_root "$HOOK_INPUT"
advisor_require_enabled
advisor_bind_session "$HOOK_INPUT" || exit 0

jq -r '.last_assistant_message // empty' <<< "$HOOK_INPUT" | tail -c 400 > "$LAST_RESPONSE_FILE"
exit 0
