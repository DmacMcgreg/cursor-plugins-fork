#!/bin/bash

# PostToolUse hook for Advisor (matcher: Write|Edit).
# Remembers that files changed since the last advisor consult, so the stop hook
# can ask for a pre-completion review if the turn ends without one.
#
# Input:  { "tool_name": "Write", "tool_input": { "file_path": "...", ... }, ...common }
# Output: none

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

HOOK_INPUT=$(cat)

advisor_init_root "$HOOK_INPUT"
advisor_require_enabled
advisor_bind_session "$HOOK_INPUT" || exit 0

FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<< "$HOOK_INPUT")

# The plugin's own state is not work product.
case "$FILE_PATH" in
  */.zcode/advisor/*) exit 0 ;;
esac

touch "$PENDING_FILE"
exit 0
