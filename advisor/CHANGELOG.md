# Changelog

## 1.1.0

- Ported to the ZCode / Claude Code plugin format: `.zcode-plugin/plugin.json`, `hooks/hooks.json` with `PostToolUse` / `Stop` events, and `${ZCODE_PLUGIN_ROOT}`.
- Stop hook now uses the `decision: block` continuation protocol; consult recording moved from `subagentStop` (not available in ZCode) to a `PostToolUse` hook matching the `Task|Agent` tools.
- State moved from `.cursor/advisor/` to `.zcode/advisor/`; the advisor subagent is no longer pinned to a Cursor-only model slug.

## 1.0.0

- Initial Advisor plugin release.
- Skill: `advisor` (`/advisor [model|off|status|ask ...|nudge on|off]`), usable as a Custom Mode.
- Agent: `advisor-subagent`, a read-only subagent pinned to Grok 4.6 at xhigh effort by default (any model via `/advisor <model>`) that returns a verdict and guidance.
- Hooks: track edits since the last consult, log each consult to `.zcode/advisor/log.md`, and nudge a pre-completion consult at the end of a turn.
