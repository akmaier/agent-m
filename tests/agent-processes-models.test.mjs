// The models each coding agent reports on its machine — MOD-agent-processes' agentModels as docs/architecture/MOD-agent-processes.md states it:
// "the models the agent reports on the machine, read as its row's Models column says (UC-044 step 5), in the order it reports them, each with its
// context, `null` where the row names none. With an enclosure, the command runs inside it, in `workdir` … A file is read by the calling process
// itself, from the person's own home on the machine and outside every enclosure, as a plain read that starts no process of the agent … Of several
// files the pattern matches, the newest is read. `reason` names why nothing was read … changes nothing and throws nothing." The register's Models
// column: Codex's `codex debug models`, the list `models`, the entries whose `visibility` is `list`, `slug` and `context_window`; Claude Code's
// catalogue `~/.claude/cache/model-catalog/*.json`, the list `catalog.config.models`, `id` and `runtime.max_input_tokens`; opencode's `opencode
// models`, one model per line, no context.
// Run: node --test tests/agent-processes-models.test.mjs
//
// Module: MOD-agent-processes
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// Only controlled executables run: fixture `claude`, `codex` and `opencode` on a PATH of their own, each writing every call to a file of the test,
// and a temporary HOME holding a fixture catalogue of Claude Code — never the person's own ~/.claude and never a real CLI. Each test states its input
// and its expected result before it runs (given / input / expect). The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { agentModels } from "../src/agent-processes/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

const INSTALL = { macos: "https://example.invalid/", windows: "https://example.invalid/", linux: "https://example.invalid/" };
const agent = (name, installed = true) => ({ name, installed, version: installed ? "1.0.0" : null, loggedIn: installed ? true : null, login: `${name} login`, keeps: null, chrome: false, install: INSTALL });
// Codex's answer to `codex debug models`, shaped as the real one (models[].slug, context_window, visibility), with one hidden entry between two listed ones.
const CODEX_MODELS = JSON.stringify({ models: [
  { slug: "gpt-6", display_name: "GPT-6", context_window: 400000, visibility: "list" },
  { slug: "gpt-6-internal", display_name: "internal", context_window: 128000, visibility: "hide" },
  { slug: "gpt-6-mini", display_name: "GPT-6 mini", context_window: 272000, visibility: "list" },
] });
const catalogue = (models) => JSON.stringify({ fetched_at: "2026-11-16T09:00:00Z", catalog: { config: { models } } });

// A computer: a PATH of fixture agents, each answering `--version` and writing every call to `calls`; `answers` gives the script text that answers a
// call whose first argument is the key (e.g. { codex: { debug: "…" } }); a temporary HOME. -> what `work` returns.
async function computer(answers, work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-models-")));
  const bin = join(root, "bin"), home = join(root, "home"), calls = join(root, "calls");
  mkdirSync(bin); mkdirSync(home); writeFileSync(calls, "");
  for (const name of ["claude", "codex", "opencode"]) {
    const cases = Object.entries(answers[name] ?? {}).map(([first, text]) => `  ${first}) ${text};;`).join("\n");
    writeFileSync(join(bin, name), `#!/bin/sh\nprintf '%s\\n' "${name} $*" >> '${calls}'\ncase "$1" in\n  --version) echo 1.0.0;;\n${cases}\n  *) exit 64;;\nesac\n`, { mode: 0o755 });
  }
  const prior = { PATH: process.env.PATH, HOME: process.env.HOME };
  process.env.PATH = bin; process.env.HOME = home;
  try {
    return await work({ root, home, called: () => readFileSync(calls, "utf8").split("\n").filter(Boolean) });
  } finally {
    process.env.PATH = prior.PATH; process.env.HOME = prior.HOME;
    rmSync(root, { recursive: true, force: true });
  }
}
// A file of Claude Code's catalogue under `home`, last written at `seconds` since the epoch.
function catalogueFile(home, name, text, seconds) {
  const folder = join(home, ".claude", "cache", "model-catalog");
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, name), text);
  utimesSync(join(folder, name), seconds, seconds);
}

// TST-20261116101 · level: unit · module: MOD-agent-processes
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: an installed codex whose `codex debug models` prints three models — gpt-6 (context 400000, visibility list), gpt-6-internal (128000, hide), gpt-6-mini (272000, list)
// input: agentModels(codex)
// expect: { models: [{ model: "gpt-6", context: 400000 }, { model: "gpt-6-mini", context: 272000 }] } — the listed ones in the order codex reports them; codex was called once, with `debug models`;
//         counter-proof: the hidden gpt-6-internal is not among them
test("TST-20261116101: codex's models are those `codex debug models` lists, with their context windows, the hidden ones left out", async () => {
  await computer({ codex: { debug: `[ "$2" = models ] && printf '%s\\n' '${CODEX_MODELS}'` } }, async ({ called }) => {
    const read = await agentModels(agent("codex"));
    assert.deepEqual(read, { models: [{ model: "gpt-6", context: 400000 }, { model: "gpt-6-mini", context: 272000 }] });
    assert.ok(!read.models.some((each) => each.model === "gpt-6-internal"), "a model codex does not list is not read");
    assert.deepEqual(called(), ["codex debug models"]);
  });
});

// TST-20261116102 · level: unit · module: MOD-agent-processes
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: an installed claude and, under the person's home, two files of Claude Code's catalogue: z-older.json, written first, naming claude-old (200000), and a-newer.json, written later,
//        naming claude-opus-5-5 (runtime.max_input_tokens 1000000) and claude-haiku-5 with no max_input_tokens
// input: agentModels(claude)
// expect: { models: [{ model: "claude-opus-5-5", context: 1000000 }, { model: "claude-haiku-5", context: null }] } — the newest file by when it was written, not by its name; a model without
//         its context stays without one; no process of claude was started (no call of the fixture)
test("TST-20261116102: claude's models are read from the newest file of the person's own catalogue, without starting claude", async () => {
  await computer({ claude: { auth: "exit 0" } }, async ({ home, called }) => {
    catalogueFile(home, "z-older.json", catalogue([{ id: "claude-old", runtime: { max_input_tokens: 200000 } }]), 1_700_000_000);
    catalogueFile(home, "a-newer.json", catalogue([{ id: "claude-opus-5-5", runtime: { max_input_tokens: 1000000 } }, { id: "claude-haiku-5", runtime: {} }]), 1_800_000_000);
    const read = await agentModels(agent("claude"));
    assert.deepEqual(read, { models: [{ model: "claude-opus-5-5", context: 1000000 }, { model: "claude-haiku-5", context: null }] });
    assert.deepEqual(called(), [], "reading the catalogue starts no process of claude");
  });
});

// TST-20261116103 · level: unit · module: MOD-agent-processes
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: an installed opencode whose `opencode models` prints "opencode/big-pickle", an empty line and "anthropic/claude-opus-5-5", one per line
// input: agentModels(opencode)
// expect: { models: [{ model: "opencode/big-pickle", context: null }, { model: "anthropic/claude-opus-5-5", context: null }] } — opencode reports no context; the empty line is no model;
//         opencode was called once, its first argument `models`
test("TST-20261116103: opencode's models are the lines `opencode models` prints, each without a context", async () => {
  await computer({ opencode: { models: "printf 'opencode/big-pickle\\n\\nanthropic/claude-opus-5-5\\n'" } }, async ({ called }) => {
    assert.deepEqual(await agentModels(agent("opencode")),
      { models: [{ model: "opencode/big-pickle", context: null }, { model: "anthropic/claude-opus-5-5", context: null }] });
    const calls = called();
    assert.equal(calls.length, 1);
    assert.match(calls[0], /^opencode models( |$)/);
  });
});

// TST-20261116104 · level: unit · module: MOD-agent-processes
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: an installed codex as in TST-20261116101, claude's catalogue under the person's home, and an enclosure that records each call (tests/enclosure-fixture.mjs)
// input: agentModels(codex, { enclosure, workdir: <root>/codex }); agentModels(claude, { enclosure, workdir: <root>/claude })
// expect: codex's command is started through the enclosure's wrap — command codex, arguments debug models, its working folder <root>/codex — and its models are read as without one;
//         claude's catalogue is read by this process itself: the enclosure wraps nothing for it, and its models are read
test("TST-20261116104: with an enclosure, codex's command runs inside it, in its working folder, and claude's catalogue is read outside it", async () => {
  await computer({ codex: { debug: `[ "$2" = models ] && printf '%s\\n' '${CODEX_MODELS}'` } }, async ({ root, home }) => {
    catalogueFile(home, "catalog.json", catalogue([{ id: "claude-opus-5-5", runtime: { max_input_tokens: 1000000 } }]), 1_800_000_000);
    const asked = [], enclosures = openEnclosures({ asked });
    const codexFolder = join(root, "codex"), claudeFolder = join(root, "claude");
    mkdirSync(codexFolder); mkdirSync(claudeFolder);
    const codex = await agentModels(agent("codex"), { enclosure: enclosures(codexFolder), workdir: codexFolder });
    assert.deepEqual(codex.models.map((each) => each.model), ["gpt-6", "gpt-6-mini"]);
    const wraps = asked.filter((call) => call.call === "wrap");
    assert.equal(wraps.length, 1, "codex's command is started once, inside the enclosure");
    assert.deepEqual({ command: wraps[0].command, args: wraps[0].args, workdir: wraps[0].at.workdir }, { command: "codex", args: ["debug", "models"], workdir: codexFolder });
    asked.length = 0;
    const claude = await agentModels(agent("claude"), { enclosure: enclosures(claudeFolder), workdir: claudeFolder });
    assert.deepEqual(claude, { models: [{ model: "claude-opus-5-5", context: 1000000 }] });
    assert.deepEqual(asked.filter((call) => call.call === "wrap"), [], "nothing of claude is started in or outside the enclosure");
  });
});

// TST-20261116105 · level: unit · module: MOD-agent-processes
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: in turn — codex not installed; codex whose `debug models` ends 3 with "not signed in" on its error output; codex whose `debug models` prints "no json here"; claude with no catalogue
//        under the person's home; opencode whose `models` prints nothing
// input: agentModels for each
// expect: each resolves with { reason } — a non-empty text and no models —, none throws; the codex that is not installed is not started; the failing codex's reason names its error output
test("TST-20261116105: where nothing can be read, agentModels names why and throws nothing", async () => {
  await computer({}, async ({ called }) => {
    const notInstalled = await agentModels(agent("codex", false));
    assert.equal(typeof notInstalled.reason, "string"); assert.ok(notInstalled.reason.length > 0); assert.equal(notInstalled.models, undefined);
    assert.deepEqual(called(), [], "an agent that is not installed is not started");
  });
  await computer({ codex: { debug: "echo 'not signed in' >&2; exit 3" } }, async () => {
    const failed = await agentModels(agent("codex"));
    assert.equal(failed.models, undefined);
    assert.match(failed.reason, /not signed in/);
  });
  await computer({ codex: { debug: "echo 'no json here'" } }, async () => {
    const unreadable = await agentModels(agent("codex"));
    assert.equal(unreadable.models, undefined); assert.ok(unreadable.reason.length > 0);
  });
  await computer({}, async () => {
    const missing = await agentModels(agent("claude"));
    assert.equal(missing.models, undefined); assert.ok(missing.reason.length > 0);
  });
  await computer({ opencode: { models: "true" } }, async () => {
    const none = await agentModels(agent("opencode"));
    assert.equal(none.models, undefined); assert.ok(none.reason.length > 0);
  });
});
