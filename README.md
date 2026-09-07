# cursor-plugins-fork

Developer tools, team workflows, and SaaS integrations packaged as **ZCode / Claude Code plugins**. This is a fork of Cursor's plugin marketplace, converted to the open [ZCode plugin format](https://github.com/zai-org/zcode-plugins) (which follows the Claude Code plugin spec).

Every plugin ships a `.zcode-plugin/plugin.json` manifest (with an identical `.claude-plugin/plugin.json` mirror for Claude Code) plus standard component directories: `commands/`, `skills/`, `agents/`, `hooks/hooks.json`, and `.mcp.json`.

## Installing

In ZCode (or Claude Code):

```text
/plugin marketplace add DmacMcgreg/cursor-plugins-fork
/plugin install <plugin-name>@cursor-plugins-fork
```

Plugins that connect to SaaS products use MCP servers declared in each plugin's `.mcp.json`. Servers that need credentials declare them via `userConfig` in the plugin manifest and reference them as `${user_config.key}`; the client prompts for the values and stores them securely.

## Marketplace

65 plugins across these categories:

- **developer-tools** — CI, code review, plugin authoring, orchestration, agent workflows
- **productivity** — email, calendar, docs, meetings, tasks
- **finance** — expenses, banking, accounting
- **utilities** — learning workflows
- **other** — sales, marketing, SEO, HR, and social integrations

### Developer tools

| Plugin | Name | Author | Description |
|:-------|:-------|:---------|:-------------------------------------|
| `advisor` | [Advisor](advisor/) | Cursor | Consult a stronger model at key checkpoints: before major decisions, when stuck on an error, and before declaring a task done. The advisor gets a full briefing plus the conversation transcript, returns guidance, and the main model keeps doing the work. |
| `agent-compatibility` | [Agent Compatibility](agent-compatibility/) | Cursor | CLI-backed repo compatibility scans plus agents that audit startup, validation, and docs against reality. |
| `cli-for-agent` | [CLI for Agents](cli-for-agent/) | Cursor | Patterns for designing CLIs that coding agents can run reliably: non-interactive flags, layered help with examples, pipelines, actionable errors, idempotency, and dry-run. |
| `continual-learning` | [Continual Learning](continual-learning/) | Cursor | Incrementally learns durable user preferences and workspace facts from transcript changes and keeps AGENTS.md up to date with plain bullet points. |
| `create-plugin` | [Create Plugin](create-plugin/) | Cursor | Scaffold and validate new agent plugins. Handles directory setup, manifest generation, and pre-submission quality checks for the marketplace. |
| `cursor-sdk` | [Cursor SDK](cursor-sdk/) | Cursor | Build apps, scripts, and automations with the TypeScript SDK. |
| `cursor-team-kit` | [Cursor Team Kit](cursor-team-kit/) | Cursor | Internal engineering team workflows for CI, code review, shipping, control-cli, control-ui, verify-this, test reliability, code cleanup, and work summaries. Designed to work without requiring third-party service integrations. |
| `docs-canvas` | [Docs Canvas](docs-canvas/) | Cursor | Render documentation as a navigable canvas. |
| `orchestrate` | [Orchestrate](orchestrate/) | Cursor | Fan a large task out across parallel cloud agents via the Cursor SDK: planners publish tasks, workers hand off back up, and a script reconciles the tree from disk and git. |
| `pr-review-canvas` | [PR Review Canvas](pr-review-canvas/) | Cursor | Render PR diffs as review canvases grouped by importance. |
| `pstack` | [pstack](pstack/) | Lauren Tan | if you want to go fast, go deep first. pstack helps you write less, but higher quality code. rigorous agent workflows you can parallelize with confidence. |
| `ralph-loop` | [Ralph Loop](ralph-loop/) | Cursor | Continuous self-referential AI loops for iterative development, implementing the Ralph Wiggum technique. Run the agent in a while-true loop with the same prompt until task completion. |
| `thermos` | [Thermos](thermos/) | Cursor | Thermo-nuclear branch review: deep correctness and security audits plus harsh code-quality rubrics, parallel subagents, thermos orchestration, and optional take-the-wheel and FSD merge-ready flows. |
| `github` | [GitHub](third_party/github/) | Cursor | Manage repos, issues, pull requests, and Actions. |
| `playwright` | [Playwright](third_party/playwright/) | Cursor | Navigate, click, screenshot, and test in a real browser. |

### Productivity

| `calendly` | [Calendly](third_party/calendly/) | Cursor | Check availability and book, cancel, or reschedule. |
| `circleback` | [Circleback](third_party/circleback/) | Cursor | Search meetings, transcripts, action items, and emails. |
| `coda` | [Coda](third_party/coda/) | Cursor | Search docs, read pages, and update tables. |
| `craft` | [Craft](third_party/craft/) | Cursor | Search, create, and update documents and daily notes. |
| `fathom` | [Fathom](third_party/fathom/) | Cursor | Search meetings and pull transcripts and summaries. |
| `fireflies` | [Fireflies](third_party/fireflies/) | Cursor | Search meeting transcripts, summaries, and action items. |
| `gmail` | [Gmail](third_party/gmail/) | Cursor | Search, read, draft, and manage email. |
| `google-calendar` | [Google Calendar](third_party/google-calendar/) | Cursor | Search events and schedule meetings. |
| `google-drive` | [Google Drive](third_party/google-drive/) | Cursor | Search, read, create, and share files. |
| `guru` | [Guru](third_party/guru/) | Cursor | Search company knowledge and draft verified answers. |
| `mem` | [Mem](third_party/mem/) | Cursor | Capture, search, and organize notes and collections. |
| `onedrive` | [OneDrive](third_party/onedrive/) | Cursor | Browse, search, and read Microsoft OneDrive files. |
| `otter` | [Otter.ai](third_party/otter/) | Cursor | Search meeting history and pull full transcripts. |
| `outlook` | [Outlook](third_party/outlook/) | Cursor | Search, read, and send Microsoft Outlook email, and look up contacts. |
| `outlook-calendar` | [Outlook Calendar](third_party/outlook-calendar/) | Cursor | List, create, update, and cancel Microsoft Outlook calendar events. |
| `readwise` | [Readwise](third_party/readwise/) | Cursor | Search highlights and Reader documents, save articles. |
| `smartsheet` | [Smartsheet](third_party/smartsheet/) | Cursor | Query and update sheets, rows, and workspaces. |
| `todoist` | [Todoist](third_party/todoist/) | Cursor | Create, find, and complete tasks and projects. |
| `wrike` | [Wrike](third_party/wrike/) | Cursor | Search projects, create tasks, and post comments. |
| `zoom` | [Zoom](third_party/zoom/) | Cursor | Search meetings, pull transcripts, and work with Zoom Docs. |

### Finance

| `brex` | [Brex](third_party/brex/) | Cursor | Query expenses, receipts, bills, cards, and travel. |
| `docusign` | [Docusign](third_party/docusign/) | Cursor | Manage envelopes, templates, workflows, and agreements. |
| `mercury` | [Mercury](third_party/mercury/) | Cursor | Read balances, transactions, statements, and cards. |
| `navan` | [Navan](third_party/navan/) | Cursor | Query expenses, travel bookings, policies, and cards. |
| `xero` | [Xero](third_party/xero/) | Cursor | Read and write invoices, contacts, reports, and payroll. |

### Utilities

| `teaching` | [Teaching](teaching/) | Cursor | Skill mapping, practice plans, and learning retrospectives. Builds personalized roadmaps with milestones and practice checkpoints, and runs periodic reviews to adjust based on progress. |

### Other

| `ahrefs` | [Ahrefs](third_party/ahrefs/) | Cursor | Research keywords, backlinks, rankings, and site health. |
| `amplemarket` | [Amplemarket](third_party/amplemarket/) | Cursor | Search people and companies, enrich leads, run sequences. |
| `ashby` | [Ashby](third_party/ashby/) | Cursor | Search candidates, prep interviews, and manage pipeline tasks. |
| `brevo` | [Brevo](third_party/brevo/) | Cursor | Manage contacts, email and SMS campaigns, and CRM deals. |
| `clay` | [Clay](third_party/clay/) | Cursor | Enrich people and companies, run AI research agents. |
| `customer-io` | [Customer.io](third_party/customer-io/) | Cursor | Build campaigns, manage segments, and query people. |
| `godaddy` | [GoDaddy](third_party/godaddy/) | Cursor | Brainstorm domain names and check availability. |
| `gong` | [Gong](third_party/gong/) | Cursor | Pull account summaries, deal insights, and call briefs. |
| `hubspot` | [HubSpot](third_party/hubspot/) | Cursor | Search and update contacts, companies, deals, and tickets. |
| `intercom` | [Intercom](third_party/intercom/) | Cursor | Search conversations, contacts, and Help Center articles. |
| `jotform` | [Jotform](third_party/jotform/) | Cursor | Create and edit forms, then read submissions. |
| `juicebox` | [Juicebox](third_party/juicebox/) | Cursor | Query recruiting analytics, shortlists, and sourcing agents. |
| `klaviyo` | [Klaviyo](third_party/klaviyo/) | Cursor | Manage profiles, segments, campaigns, and flows. |
| `mailerlite` | [MailerLite](third_party/mailerlite/) | Cursor | Manage subscribers, groups, campaigns, and automations. |
| `outreach` | [Outreach](third_party/outreach/) | Cursor | Search sequences, prospects, and Kaia meetings. |
| `profound` | [Profound](third_party/profound/) | Cursor | Track AI visibility, sentiment, and citations. |
| `salesforce` | [Salesforce](third_party/salesforce/) | Cursor | Query, create, and update records in your org. |
| `semrush` | [Semrush](third_party/semrush/) | Cursor | Research keywords, backlinks, traffic, and competitors. |
| `similarweb` | [Similarweb](third_party/similarweb/) | Cursor | Analyze website traffic, audiences, and competitors. |
| `typeform` | [Typeform](third_party/typeform/) | Cursor | Build forms, analyze responses, and manage contacts. |
| `upwork` | [Upwork](third_party/upwork/) | Cursor | Search talent, post jobs, and manage contracts. |
| `workable` | [Workable](third_party/workable/) | Cursor | Search candidates, move pipelines, and manage HR records. |
| `x` | [X](third_party/x/) | Cursor | Search posts, read timelines, pull trends, and manage bookmarks. |
| `x-ads` | [X Ads](third_party/x-ads/) | Cursor | Manage ad campaigns, create ads, track conversions, and pull performance stats. |

## Plugin format

A plugin is a directory at the repository root (or under `third_party/`) containing:

```text
my-plugin/
├── .zcode-plugin/plugin.json   # manifest (required) — .claude-plugin/plugin.json is an identical mirror
├── commands/                   # one .md file per slash command
├── skills/<name>/SKILL.md      # agent skills
├── agents/                     # sub-agent .md files (frontmatter: name, description)
├── hooks/hooks.json            # hooks: SessionStart, UserPromptSubmit, PreToolUse,
│                               # PermissionRequest, PostToolUse, PostToolUseFailure, Stop
├── .mcp.json                   # MCP server declarations
└── README.md
```

The manifest only requires `name`; recommended fields are `version` (semver), `description`, `author`, `license`, `keywords`, and `userConfig` for per-user settings. Hooks and MCP config are auto-discovered from their standard locations and must not be referenced from the manifest again. Hook scripts receive JSON on stdin and can use `${ZCODE_PLUGIN_ROOT}` (plugin install dir), `${ZCODE_PLUGIN_DATA}` (durable data dir), and `${ZCODE_PROJECT_DIR}`.

The root [`marketplace.json`](marketplace.json) is the catalog. A `.claude-plugin/marketplace.json` mirror is kept for Claude Code, which looks for the marketplace file there. Each entry's `name`, `version`, and `description` must match the plugin manifest exactly.

## Validation

```bash
node scripts/validate-plugins.mjs
```

The validator checks marketplace/manifest sync, kebab-case names, semver versions, allowed categories, skill/agent frontmatter, hook event names, `.mcp.json` structure, and `${user_config.*}` references. CI runs it on every PR.

## Conversion notes (Cursor → ZCode)

This repo was converted from Cursor's plugin format. The mapping:

| Cursor | ZCode / Claude Code |
|:-------|:--------------------|
| `.cursor-plugin/plugin.json` | `.zcode-plugin/plugin.json` + `.claude-plugin/plugin.json` mirror |
| `.cursor-plugin/marketplace.json` | root `marketplace.json` (+ `.claude-plugin/marketplace.json` mirror) |
| `variables` + `${VAR}` in `mcp.json` | `userConfig` + `${user_config.key}` in `.mcp.json` |
| `mcp.json` | `.mcp.json` (auto-discovered) |
| `rules/*.mdc` | converted to `skills/<name>/SKILL.md` (ZCode has no auto-attached rules) |
| Hook events `afterFileEdit`, `afterAgentResponse`, `subagentStop`, `stop` | `PostToolUse` (matcher `Write\|Edit` / `Task\|Agent`), `Stop` |
| `{ "followup_message": ... }` hook output | `{ "decision": "block", "reason": ... }` |
| `${CURSOR_PLUGIN_ROOT}`, `${CURSOR_PROJECT_DIR}` | `${ZCODE_PLUGIN_ROOT}`, `${ZCODE_PROJECT_DIR}` |
| state in `.cursor/...` | state in `.zcode/...` |

Known platform differences to be aware of:

- **Stop continuations are capped at three consecutive rounds** by the ZCode runtime. This affects `ralph-loop` (long loops pause and resume on your next message) and the advisor's end-of-turn nudge (fires at most three times per stop chain).
- **There is no `SubagentStop` hook event.** The advisor now records consults via a `PostToolUse` hook matching the `Task`/`Agent` tools.
- **Hook transcript paths are temporary** (removed after the hook exits), so transcript-based features degrade gracefully to briefing-only behavior.
- **Cursor `auth` blocks on remote MCP servers** (Zoom, Gong, HubSpot, DocuSign) have no equivalent; those servers rely on the client's OAuth flow instead of static credentials.
- **Cursor-product-specific content is preserved as reference**: the `cursor-sdk` and `orchestrate` plugins teach Cursor's TypeScript SDK, `pstack`'s automations/rules reference Cursor paths, and `pr-review-canvas`/`docs-canvas` render through the client's canvas skill. These plugins install fine, but portions of their content only apply when running inside Cursor.

## Contributing

1. Copy an existing plugin directory and adjust the manifest, components, and README.
2. Register the plugin in `marketplace.json` with a matching `name`, `version`, `description`, and `category` (`developer-tools`, `productivity`, `utilities`, `finance`, `guides`, `other`).
3. Run `node scripts/validate-plugins.mjs` and make it pass.
4. Bump the plugin's `version` in the manifest and `marketplace.json` for any change to installable files.

## License

Each plugin carries its own license (mostly MIT); the marketplace scaffolding is MIT. Upstream: [cursor/plugins](https://github.com/cursor/plugins).
