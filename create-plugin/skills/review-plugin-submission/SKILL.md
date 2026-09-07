---
name: review-plugin-submission
description: Audit a ZCode / Claude Code plugin for marketplace readiness. Use when validating manifests, component metadata, discovery paths, and submission quality before publishing.
---

# Review plugin submission

## Trigger

A plugin is implemented and needs a final quality check before submission or release.

## Workflow

1. Verify manifest validity:
   - `.zcode-plugin/plugin.json` exists (with an identical `.claude-plugin/plugin.json` mirror)
   - `name` is valid lowercase kebab-case (`^[a-z0-9][a-z0-9._-]{0,127}$`)
   - `version` is semver
   - metadata fields are coherent (`description`, `version`, `author`, `license`)
2. Verify component discoverability:
   - Skills in `skills/<name>/SKILL.md` with `name` and `description` frontmatter
   - Agents in `agents/*.md` with `name` and `description`
   - Commands in `commands/*.md` with `description`
   - Hooks in `hooks/hooks.json` using only supported events (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, `Stop`)
   - MCP config in `.mcp.json` at the plugin root
3. Verify paths and substitutions:
   - All declared paths exist, are relative, and stay inside the plugin directory
   - `${ZCODE_PLUGIN_ROOT}` / `${user_config.key}` references match a real `userConfig` entry
4. Verify repository integration:
   - For marketplace repos, the plugin has an entry in the root `marketplace.json`
   - `source` resolves to the plugin directory; names are unique kebab-case
   - Entry `name`, `version`, and `description` match the manifest exactly
   - `category` is one of the allowed marketplace categories
5. Verify documentation quality:
   - `README.md` states purpose, installation, and component coverage

## Checklist

- Manifest exists and parses as valid JSON (both copies identical)
- All declared paths exist and are relative
- No broken file references
- No missing frontmatter on skills/agents/commands
- No duplicate or unsupported hook events
- Plugin scope is clear and focused
- Marketplace registration complete and in sync (if multi-plugin repo)
- `node scripts/validate-plugins.mjs` passes

## Output

- Pass/fail report by section
- Prioritized fix list
- Final submission recommendation
