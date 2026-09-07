---
name: plugin-quality-gates
description: Keep ZCode / Claude Code plugin manifests, paths, and component metadata valid during plugin authoring. Use when creating or editing any plugin in this marketplace.
---

# Plugin quality gates

When creating or editing plugins:

1. Ensure `.zcode-plugin/plugin.json` exists (with an identical `.claude-plugin/plugin.json` mirror) and includes a valid `name`.
2. Keep paths relative and within the plugin directory (no absolute paths, no `..` traversal).
3. Rely on standard component discovery: `commands/`, `skills/<name>/SKILL.md`, `agents/`, `hooks/hooks.json`, and `.mcp.json`. Do not point the manifest at `hooks/hooks.json` or `.mcp.json` again.
4. Include YAML frontmatter for skills, agents, and commands with required metadata (`name`, `description`).
5. Keep plugin scope focused and document installation and usage in `README.md`.
6. Save new plugins inside this marketplace repository and register them in the root `marketplace.json`. For personal local use, add the folder or repo as a local marketplace (ZCode: Settings → Plugin management → Discover).
7. Keep the manifest `name` and `version` identical to the plugin's `marketplace.json` entry, and bump both whenever an installable file changes.
