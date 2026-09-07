#!/usr/bin/env node
// Validates this marketplace against the ZCode / Claude Code plugin format.
// No external dependencies: node scripts/validate-plugins.mjs
//
// Checks:
// - root marketplace.json: required fields, kebab-case unique names, semver
//   versions, allowed categories, sources resolve to existing directories
// - every plugin: .zcode-plugin/plugin.json manifest (plus identical
//   .claude-plugin/plugin.json mirror), name/version/description synced with
//   the marketplace entry, no Cursor-format leftovers
// - skills/agents frontmatter, hooks.json event names, .mcp.json structure,
//   and ${user_config.*} references

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const CATEGORIES = new Set([
  "developer-tools", "productivity", "utilities", "guides", "finance", "other",
]);
const HOOK_EVENTS = new Set([
  "SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest",
  "PostToolUse", "PostToolUseFailure", "Stop",
]);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const CURSOR_FIELDS = ["rules", "variables", "minClientVersions", "logo", "emails"];

let errors = 0;
const fail = (m) => { console.error(`ERROR: ${m}`); errors++; };

function loadJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    fail(`${relative(root, path)}: invalid JSON (${e.message})`);
    return null;
  }
}

// --- marketplace.json ---
const mktPath = resolve(root, "marketplace.json");
if (!existsSync(mktPath)) {
  console.error("ERROR: marketplace.json not found at repo root");
  process.exit(1);
}
const marketplace = loadJSON(mktPath);
if (!marketplace) process.exit(1);

for (const field of ["name", "description", "owner", "plugins"]) {
  if (!marketplace[field]) fail(`marketplace.json: missing required field '${field}'`);
}
if (!Array.isArray(marketplace.plugins)) {
  fail("marketplace.json: 'plugins' must be a list");
  process.exit(1);
}

const seen = new Set();
for (const [i, entry] of marketplace.plugins.entries()) {
  const label = `marketplace.json plugins[${i}]`;
  const name = entry.name;
  if (!name) { fail(`${label}: missing 'name'`); continue; }
  if (!KEBAB.test(name)) fail(`${label} (${name}): name must be kebab-case`);
  if (seen.has(name)) fail(`${label} (${name}): duplicate plugin name`);
  seen.add(name);

  for (const field of ["source", "description", "version", "category"]) {
    if (!entry[field]) fail(`${label} (${name}): missing '${field}'`);
  }
  if (entry.version && !SEMVER.test(entry.version)) {
    fail(`${label} (${name}): version '${entry.version}' is not semver`);
  }
  if (entry.category && !CATEGORIES.has(entry.category)) {
    fail(`${label} (${name}): category '${entry.category}' not in ${[...CATEGORIES].join(", ")}`);
  }
  const source = entry.source ?? "";
  const dir = resolve(root, source);
  if (!source.startsWith("./") || source.includes("..")) {
    fail(`${label} (${name}): source must be a ./relative path`);
    continue;
  }
  if (!existsSync(dir) || !dir.startsWith(root)) {
    fail(`${label} (${name}): source directory '${source}' does not exist`);
    continue;
  }
  entry.__dir = dir;
}

// --- per-plugin checks ---
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return fm;
}

for (const entry of marketplace.plugins) {
  if (!entry.__dir) continue;
  const rel = relative(root, entry.__dir);
  const label = entry.name;

  // manifest
  const manifestPath = join(entry.__dir, ".zcode-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    fail(`${label}: missing .zcode-plugin/plugin.json`);
    continue;
  }
  const manifest = loadJSON(manifestPath);
  if (!manifest) continue;

  if (manifest.name !== entry.name) {
    fail(`${label}: manifest name '${manifest.name}' != marketplace name '${entry.name}'`);
  }
  if (manifest.version !== entry.version) {
    fail(`${label}: manifest version '${manifest.version}' != marketplace version '${entry.version}'`);
  }
  if (manifest.description !== entry.description) {
    fail(`${label}: manifest description differs from marketplace entry`);
  }
  for (const field of CURSOR_FIELDS) {
    if (field in manifest) fail(`${label}: manifest has Cursor-only field '${field}'`);
  }
  if (manifest.hooks) {
    fail(`${label}: manifest sets 'hooks'; hooks/hooks.json is auto-discovered and must not be referenced`);
  }
  if (manifest.mcpServers) {
    fail(`${label}: manifest sets 'mcpServers'; .mcp.json is auto-discovered and must not be referenced`);
  }

  // claude mirror
  const mirrorPath = join(entry.__dir, ".claude-plugin", "plugin.json");
  if (!existsSync(mirrorPath)) {
    fail(`${label}: missing .claude-plugin/plugin.json mirror`);
  } else if (readFileSync(manifestPath, "utf-8") !== readFileSync(mirrorPath, "utf-8")) {
    fail(`${label}: .claude-plugin/plugin.json differs from .zcode-plugin/plugin.json`);
  }

  // cursor leftovers
  if (existsSync(join(entry.__dir, ".cursor-plugin"))) {
    fail(`${label}: leftover .cursor-plugin directory`);
  }
  if (existsSync(join(entry.__dir, "mcp.json"))) {
    fail(`${label}: found mcp.json; rename to .mcp.json`);
  }

  // skills
  const skillsDir = join(entry.__dir, "skills");
  if (existsSync(skillsDir)) {
    for (const dir of readdirSafe(skillsDir)) {
      const skillFile = join(skillsDir, dir, "SKILL.md");
      if (!existsSync(skillFile)) {
        fail(`${label}: skills/${dir}/ has no SKILL.md`);
        continue;
      }
      const fm = parseFrontmatter(readFileSync(skillFile, "utf-8"));
      if (!fm.name) fail(`${label}: skills/${dir}/SKILL.md missing 'name' frontmatter`);
      else if (fm.name !== dir) fail(`${label}: skills/${dir}/SKILL.md name '${fm.name}' != directory name`);
      if (!fm.description) fail(`${label}: skills/${dir}/SKILL.md missing 'description' frontmatter`);
    }
  }

  // agents
  const agentsDir = join(entry.__dir, "agents");
  if (existsSync(agentsDir)) {
    for (const file of readdirSafe(agentsDir)) {
      if (!file.endsWith(".md")) continue;
      const fm = parseFrontmatter(readFileSync(join(agentsDir, file), "utf-8"));
      if (!fm.name) fail(`${label}: agents/${file} missing 'name' frontmatter`);
      if (!fm.description) fail(`${label}: agents/${file} missing 'description' frontmatter`);
    }
  }

  // hooks
  const hooksPath = join(entry.__dir, "hooks", "hooks.json");
  if (existsSync(hooksPath)) {
    const hooks = loadJSON(hooksPath);
    if (hooks) {
      for (const [event, matchers] of Object.entries(hooks.hooks ?? {})) {
        if (!HOOK_EVENTS.has(event)) {
          fail(`${label}: hooks.json event '${event}' is not supported (use: ${[...HOOK_EVENTS].join(", ")})`);
        }
        for (const m of matchers ?? []) {
          if (!Array.isArray(m.hooks)) fail(`${label}: hooks.json ${event} entry missing 'hooks' array`);
          const text = JSON.stringify(m);
          if (text.includes("CURSOR_")) fail(`${label}: hooks.json ${event} references CURSOR_ variables`);
          if (text.includes("followup_message")) {
            fail(`${label}: hooks.json ${event} uses Cursor's followup_message; use { decision: "block", reason }`);
          }
        }
      }
    }
  }

  // mcp + userConfig references
  const mcpPluginPath = join(entry.__dir, ".mcp.json");
  const userConfig = manifest.userConfig ?? {};
  const mcpFiles = existsSync(mcpPluginPath) ? [mcpPluginPath] : [];
  for (const mcpFile of mcpFiles) {
    const mcp = loadJSON(mcpFile);
    if (!mcp) continue;
    for (const [serverName, server] of Object.entries(mcp.mcpServers ?? {})) {
      if (!server || typeof server !== "object") {
        fail(`${label}: .mcp.json server '${serverName}' is not an object`);
        continue;
      }
      if (!server.command && !server.url) {
        fail(`${label}: .mcp.json server '${serverName}' needs 'command' (stdio) or 'url' (http)`);
      }
      if (server.auth) {
        fail(`${label}: .mcp.json server '${serverName}' uses Cursor-only 'auth'; use headers/env with \${user_config.*}`);
      }
    }
    const refs = [...JSON.stringify(mcp).matchAll(/\$\{user_config\.([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);
    for (const key of new Set(refs)) {
      if (!(key in userConfig)) {
        fail(`${label}: .mcp.json references \${user_config.${key}} but manifest userConfig has no such key`);
      }
    }
    if (/\$\{[A-Z][A-Z0-9_]*\}/.test(JSON.stringify(mcp))) {
      fail(`${label}: .mcp.json uses bare \${VAR} references; use \${user_config.key} or \${ZCODE_PLUGIN_ROOT}`);
    }
  }
}

function readdirSafe(dir) {
  return readdirSync(dir).filter((f) => statSync(join(dir, f)).isDirectory());
}

if (errors > 0) {
  console.error(`\nFAIL: ${errors} problem(s)`);
  process.exit(1);
}
console.log(`OK: ${marketplace.plugins.length} plugin(s) validated`);
