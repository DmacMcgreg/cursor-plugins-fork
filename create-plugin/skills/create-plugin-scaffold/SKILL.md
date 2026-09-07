---
name: create-plugin-scaffold
description: Create a new ZCode / Claude Code plugin scaffold with a valid manifest, component directories, and marketplace wiring. Use when starting a new plugin or adding a plugin to a multi-plugin repository.
---

# Create plugin scaffold

## Trigger

You need to create a new ZCode / Claude Code plugin from scratch and make it ready for local use or marketplace submission.

## Required Inputs

- Plugin name (lowercase kebab-case)
- Plugin purpose and target users
- Component set to include (`commands`, `skills`, `agents`, `hooks`, `mcpServers`)
- Repository style (`single-plugin` or `multi-plugin marketplace`)

## Output Location

By default, create the plugin inside this marketplace repository:

```
<repo-root>/<plugin-name>/
```

Register it in the root `marketplace.json` so the whole repo stays installable as one marketplace. For a personal plugin outside any marketplace, create it in its own directory and add that directory (or its parent repo) as a local marketplace in the client (ZCode: Settings → Plugin management → Discover). If the user specifies a location, respect that choice.

## Workflow

1. Validate plugin name format: lowercase kebab-case, starts and ends with an alphanumeric character (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`).
2. Determine the target directory and create it (and parents) if it does not exist.
3. Create base files inside the target directory:
   - `.zcode-plugin/plugin.json` (the manifest ZCode reads first)
   - `.claude-plugin/plugin.json` (identical content, for Claude Code compatibility)
   - `README.md`
   - `LICENSE`
   - optional `CHANGELOG.md`
4. Populate `plugin.json`:
   - Required: `name`
   - Recommended: `version` (semver), `description`, `author`, `license`, `keywords`
   - Component directories (`commands/`, `skills/`, `agents/`, `hooks/`, `.mcp.json`) are auto-discovered; add explicit manifest fields only for non-default paths.
   - Per-user settings go in `userConfig` (types: `string`, `number`, `boolean`, `directory`, `file`; mark secrets `sensitive: true` and reference them as `${user_config.key}`).
5. Create component files with valid frontmatter:
   - Skills: `skills/<skill-name>/SKILL.md` with `name`, `description`
   - Agents: `agents/*.md` with `name`, `description` (body is the system prompt)
   - Commands: `commands/*.md` with `description` (body may use `$ARGUMENTS`)
   - Hooks: `hooks/hooks.json` with events `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, `Stop`; use `${ZCODE_PLUGIN_ROOT}` for plugin-relative paths
   - MCP servers: `.mcp.json` at the plugin root
6. For a marketplace repo, add a root `marketplace.json` entry:
   - `name` (must equal the manifest `name`), `source` (relative path), `description`, `version` (must equal the manifest `version`), `author`, `category` (`developer-tools`, `productivity`, `utilities`, `finance`, `guides`, `other`), `keywords`
7. Run `node scripts/validate-plugins.mjs` from the repo root and fix what it reports.

## Guardrails

- Keep the plugin focused on one use case.
- Prefer concise, actionable skill and command text over long prose.
- Do not reference files that do not exist.
- Use folder discovery defaults unless custom paths are required.
- Keep secrets, private endpoints, and machine-specific paths out of the plugin.

## Output

- Created file tree for the plugin (with full path to the output directory)
- Final `plugin.json`
- Marketplace entry (if applicable)
- Short validation report of required fields and component metadata
- Confirmation that the plugin passes `node scripts/validate-plugins.mjs` and is ready to install
