# Ralph Loop

Ralph Loop runs your coding agent in a self-referential loop, feeding the same prompt back after every turn until the task is complete. It implements the [Ralph Wiggum technique](https://ghuntley.com/ralph/) pioneered by Geoffrey Huntley.

## How it works

Two hooks drive the loop. Both run on the agent's `Stop` event: `capture-response.sh` checks the agent's final message for a `<promise>` tag matching the completion phrase, and `stop-hook.sh` fires when the agent finishes a turn. If the promise hasn't been detected and the iteration limit hasn't been reached, the stop hook returns a `decision: block` continuation carrying the original prompt, starting the next iteration. The agent sees its own previous edits in the working tree and git history, iterates on them, and repeats. The prompt never changes. The code does.

> Note for ZCode: the runtime allows at most three consecutive `Stop` continuations before it pauses for the user. A loop that does not reach its completion promise within three consecutive turns will stop and resume on your next message. `--max-iterations` still applies across those resumes.

## Installation

Install from this marketplace in ZCode (or Claude Code):

```text
/plugin marketplace add DmacMcgreg/cursor-plugins-fork
/plugin install ralph-loop@cursor-plugins-fork
```

## Quick start

> Start a ralph loop: "Build a REST API for todos. CRUD operations, input validation, tests. Output COMPLETE when done." --completion-promise "COMPLETE" --max-iterations 50

The agent will implement the API, run tests, see failures, fix them, and repeat until all requirements are met.

## Skills

**ralph-loop** starts the loop. Provide a prompt and options:

> Start a ralph loop: "Refactor the cache layer" --max-iterations 20 --completion-promise "DONE"

- `--max-iterations <N>` stops after N iterations (default: unlimited)
- `--completion-promise <text>` sets the phrase that signals completion

**cancel-ralph** removes the state file and stops the loop.

**ralph-loop-help** explains the technique and usage in detail.

## Writing good prompts

Define explicit completion criteria. Vague goals like "make it good" give the agent nothing to verify against.

```markdown
Build a REST API for todos.

When complete:
- All CRUD endpoints working
- Input validation in place
- Tests passing (coverage > 80%)
- Output: <promise>COMPLETE</promise>
```

Break large tasks into phases. Encourage self-correction by including test/fix cycles in the prompt. Always pass `--max-iterations` to prevent runaway loops.

## When to use Ralph Loop

Works well for tasks with clear, verifiable success criteria: getting tests to pass, completing a migration, building a feature from a spec. Not a good fit for tasks that need human judgment or have ambiguous goals.

## Learn more

- [Original technique by Geoffrey Huntley](https://ghuntley.com/ralph/)
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator)

## License

MIT
