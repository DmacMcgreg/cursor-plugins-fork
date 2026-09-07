// Stop hook for Continual Learning (ZCode / Claude Code plugin hook protocol).
// Counts completed turns and, when the cadence threshold is reached, returns a
// block continuation asking the agent to run the continual-learning skill.
//
// stdin:  { session_id, stop_hook_active, transcript_path, cwd, hook_event_name, ... }
// stdout: { "decision": "block", "reason": "<follow-up>" } when triggering, else nothing.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

const DEFAULT_MIN_TURNS = 10;
const DEFAULT_MIN_MINUTES = 120;
const TRIAL_DEFAULT_MIN_TURNS = 3;
const TRIAL_DEFAULT_MIN_MINUTES = 15;
const TRIAL_DEFAULT_DURATION_MINUTES = 24 * 60;

const FOLLOWUP_MESSAGE =
  `Run the \`continual-learning\` skill now. Use the \`agents-memory-updater\` subagent for the full memory update flow. Use incremental transcript processing with index file \`${join(".zcode", "hooks", "state", "continual-learning-index.json")}\`: only consider transcripts not in the index or transcripts whose mtime is newer than indexed mtime. Have the subagent refresh index mtimes, remove entries for deleted transcripts, and update \`AGENTS.md\` only for high-signal recurring user corrections and durable workspace facts. Exclude one-off/transient details and secrets. If no meaningful updates exist, respond exactly: No high-signal memory updates.`;

async function readStdinJson() {
  let raw = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function readEnvValue(primary, legacy) {
  return process.env[primary] ?? process.env[legacy];
}

function loadState(statePath) {
  const fallback = {
    version: 2,
    lastRunAtMs: 0,
    turnsSinceLastRun: 0,
    lastTranscriptMtimeMs: null,
    lastProcessedTurnKey: null,
    trialStartedAtMs: null,
  };

  if (!existsSync(statePath)) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(readFileSync(statePath, "utf-8"));
    if (parsed.version !== 2) {
      return fallback;
    }
    return {
      version: 2,
      lastRunAtMs:
        typeof parsed.lastRunAtMs === "number" && Number.isFinite(parsed.lastRunAtMs)
          ? parsed.lastRunAtMs
          : 0,
      turnsSinceLastRun:
        typeof parsed.turnsSinceLastRun === "number" &&
        Number.isFinite(parsed.turnsSinceLastRun) &&
        parsed.turnsSinceLastRun >= 0
          ? parsed.turnsSinceLastRun
          : 0,
      lastTranscriptMtimeMs:
        typeof parsed.lastTranscriptMtimeMs === "number" &&
        Number.isFinite(parsed.lastTranscriptMtimeMs)
          ? parsed.lastTranscriptMtimeMs
          : null,
      lastProcessedTurnKey:
        typeof parsed.lastProcessedTurnKey === "string"
          ? parsed.lastProcessedTurnKey
          : null,
      trialStartedAtMs:
        typeof parsed.trialStartedAtMs === "number" && Number.isFinite(parsed.trialStartedAtMs)
          ? parsed.trialStartedAtMs
          : null,
    };
  } catch {
    return fallback;
  }
}

function saveState(statePath, state) {
  const directory = dirname(statePath);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
}

function getTranscriptMtimeMs(transcriptPath) {
  if (!transcriptPath) {
    return null;
  }
  try {
    return statSync(transcriptPath).mtimeMs;
  } catch {
    return null;
  }
}

function parsePositiveInt(value, fallback) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseBoolean(value) {
  if (!value) {
    return false;
  }
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

async function main() {
  try {
    const input = await readStdinJson();
    const cwd = input.cwd || process.cwd();
    const statePath = resolve(cwd, ".zcode", "hooks", "state", "continual-learning.json");
    const state = loadState(statePath);

    // A completed turn: a Stop that was not itself caused by a hook
    // continuation. stop_hook_active is the runtime's signal for that.
    const completedTurn = !input.stop_hook_active;

    // Dedupe repeated Stops within the same turn (same session + transcript
    // mtime means the transcript has not advanced since we last saw it).
    const transcriptMtimeMs = getTranscriptMtimeMs(input.transcript_path);
    const turnKey = `${input.session_id ?? "unknown"}:${transcriptMtimeMs ?? "none"}`;
    if (turnKey === state.lastProcessedTurnKey) {
      return;
    }
    state.lastProcessedTurnKey = turnKey;

    const turnIncrement = completedTurn ? 1 : 0;
    const turnsSinceLastRun = state.turnsSinceLastRun + turnIncrement;
    const now = Date.now();

    const trialEnabled = parseBoolean(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MODE", "CONTINUOUS_LEARNING_TRIAL_MODE")
    );
    if (trialEnabled && completedTurn && state.trialStartedAtMs === null) {
      state.trialStartedAtMs = now;
    }

    const trialDurationMinutes = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_DURATION_MINUTES", "CONTINUOUS_LEARNING_TRIAL_DURATION_MINUTES"),
      TRIAL_DEFAULT_DURATION_MINUTES
    );
    const trialMinTurns = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MIN_TURNS", "CONTINUOUS_LEARNING_TRIAL_MIN_TURNS"),
      TRIAL_DEFAULT_MIN_TURNS
    );
    const trialMinMinutes = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MIN_MINUTES", "CONTINUOUS_LEARNING_TRIAL_MIN_MINUTES"),
      TRIAL_DEFAULT_MIN_MINUTES
    );
    const inTrialWindow =
      trialEnabled &&
      state.trialStartedAtMs !== null &&
      now - state.trialStartedAtMs < trialDurationMinutes * 60_000;

    const minTurns = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_MIN_TURNS", "CONTINUOUS_LEARNING_MIN_TURNS"),
      DEFAULT_MIN_TURNS
    );
    const minMinutes = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_MIN_MINUTES", "CONTINUOUS_LEARNING_MIN_MINUTES"),
      DEFAULT_MIN_MINUTES
    );

    const effectiveMinTurns = inTrialWindow ? trialMinTurns : minTurns;
    const effectiveMinMinutes = inTrialWindow ? trialMinMinutes : minMinutes;
    const minutesSinceLastRun =
      state.lastRunAtMs > 0
        ? Math.floor((now - state.lastRunAtMs) / 60000)
        : Number.POSITIVE_INFINITY;
    const hasTranscriptAdvanced =
      transcriptMtimeMs !== null &&
      (state.lastTranscriptMtimeMs === null || transcriptMtimeMs > state.lastTranscriptMtimeMs);

    const shouldTrigger =
      completedTurn &&
      turnsSinceLastRun >= effectiveMinTurns &&
      minutesSinceLastRun >= effectiveMinMinutes &&
      hasTranscriptAdvanced;

    if (shouldTrigger) {
      state.lastRunAtMs = now;
      state.turnsSinceLastRun = 0;
      state.lastTranscriptMtimeMs = transcriptMtimeMs;
      saveState(statePath, state);

      process.stdout.write(
        JSON.stringify({ decision: "block", reason: FOLLOWUP_MESSAGE }) + "\n"
      );
      return;
    }

    state.turnsSinceLastRun = turnsSinceLastRun;
    saveState(statePath, state);
  } catch (error) {
    console.error("[continual-learning-stop] failed", error);
  }
}

await main();
