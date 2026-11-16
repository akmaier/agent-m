// The probe agent-models of a Bridge — MOD-bridge-jobs' handler as docs/architecture/MOD-bridge-jobs.md states it: "`agent-models` receives `{ agent }`, an
// agent it offers, and returns MOD-agent-processes' `agentModels` for it, asked in its enclosure in its working folder, unchanged — `{ models }` or `{ reason }`
// (UC-044 step 5) —, or `{ reason }` naming that the agent has no working folder, or the enclosure's reason and its one-time step where its enclosure does not
// work; `invalid-request` for an agent it does not offer".
// Run: node --test tests/bridge-jobs-agent-models.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// MOD-agent-processes runs as it is, over a fixture codex on a PATH of its own that writes every call to a file of the test; the enclosures are those of
// tests/enclosure-fixture.mjs, which record what they are asked. Nothing reaches the network and no real agent starts. Each test states its input and its
// expected result before it runs (given / input / expect). The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { jobHandlers } from "../src/bridge-jobs/index.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

const CODEX_MODELS = JSON.stringify({ models: [{ slug: "gpt-6", context_window: 400000, visibility: "list" }, { slug: "gpt-6-mini", context_window: 272000, visibility: "list" }] });

// A computer whose whole PATH is a fixture codex, installed and logged in, that answers `debug models`; `calls` the calls it received.
async function computer(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-agent-models-")));
  const bin = join(root, "bin"), calls = join(root, "calls"), folder = join(root, "work-codex");
  mkdirSync(bin); mkdirSync(folder); writeFileSync(calls, "");
  writeFileSync(join(bin, "codex"), `#!/bin/sh\nprintf '%s\\n' "codex $*" >> '${calls}'\ncase "$*" in\n  --version) echo 'codex 1.2.3';;\n  'login status') echo 'Logged in';;\n  'debug models') printf '%s\\n' '${CODEX_MODELS}';;\n  *) exit 64;;\nesac\n`, { mode: 0o755 });
  const prior = process.env.PATH;
  process.env.PATH = bin;
  try { return await work({ folder, calls: () => readFileSync(calls, "utf8").split("\n").filter(Boolean) }); }
  finally { process.env.PATH = prior; rmSync(root, { recursive: true, force: true }); }
}
const probe = (handlers, args) => handlers["POST /v1/probes/agent-models"]({ params: { kind: "agent-models" }, query: {}, body: { args } });
async function rejection(promise) {
  try { await promise; } catch (error) { return error; }
  assert.fail("the probe was not refused");
}

// TST-20261116111 · level: unit · module: MOD-bridge-jobs
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: codex offered by the Bridge with its working folder, its enclosure working and recording each call
// input: POST /v1/probes/agent-models with { agent: "codex" }
// expect: { answer: { models: [{ model: "gpt-6", context: 400000 }, { model: "gpt-6-mini", context: 272000 }] } } — agentModels' answer unchanged; `codex debug models` was started through the enclosure of
//         codex's working folder, with that folder as its working folder
test("TST-20261116111: agent-models answers agentModels for an offered agent, asked in its enclosure in its working folder", async () => {
  await computer(async ({ folder }) => {
    const asked = [];
    const handlers = jobHandlers({ enclosures: openEnclosures({ asked }), agents: [{ name: "codex", folder }] });
    assert.deepEqual(await probe(handlers, { agent: "codex" }), { answer: { models: [{ model: "gpt-6", context: 400000 }, { model: "gpt-6-mini", context: 272000 }] } });
    const read = asked.filter((call) => call.call === "wrap" && call.args.join(" ") === "debug models");
    assert.equal(read.length, 1, "the models are read once, inside the enclosure");
    assert.equal(read[0].folder, folder);
    assert.equal(read[0].at.workdir, folder);
  });
});

// TST-20261116112 · level: unit · module: MOD-bridge-jobs
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: codex installed; in turn a Bridge that offers it without a working folder, and one that offers it with a folder whose enclosure answers that it does not work, with the reason
//        "bwrap: not found" and the one-time step "an administrator installs the package bubblewrap"
// input: POST /v1/probes/agent-models with { agent: "codex" } on each
// expect: { answer: { reason } }, no models: the first reason names the working folder; the second names "bwrap: not found" and "an administrator installs the package bubblewrap";
//         `codex debug models` was never started; counter-proof: TST-20261116111, with a folder and a working enclosure, reads the models
test("TST-20261116112: agent-models names why nothing was read where the agent has no working folder or its enclosure does not work", async () => {
  await computer(async ({ folder, calls }) => {
    const unplaced = await probe(jobHandlers({ enclosures: openEnclosures(), agents: [{ name: "codex", folder: "" }] }), { agent: "codex" });
    assert.equal(unplaced.answer.models, undefined);
    assert.match(unplaced.answer.reason, /working folder/);
    const broken = openEnclosures({ works: { works: false, reason: "bwrap: not found", setup: "an administrator installs the package bubblewrap" } });
    const unenclosed = await probe(jobHandlers({ enclosures: broken, agents: [{ name: "codex", folder }] }), { agent: "codex" });
    assert.equal(unenclosed.answer.models, undefined);
    assert.match(unenclosed.answer.reason, /bwrap: not found.*an administrator installs the package bubblewrap/);
    assert.equal(calls().some((line) => line === "codex debug models"), false, "codex was not asked for its models");
  });
});

// TST-20261116113 · level: unit · module: MOD-bridge-jobs
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: a Bridge that offers codex with its working folder; opencode is not offered
// input: POST /v1/probes/agent-models with { agent: "opencode" }, with { agent: "nobody" }, with {} and with { agent: 7 }
// expect: each is refused with the code invalid-request; nothing was started; counter-proof: TST-20261116111, for the offered codex, answers
test("TST-20261116113: agent-models refuses an agent the Bridge does not offer with invalid-request", async () => {
  await computer(async ({ folder, calls }) => {
    const handlers = jobHandlers({ enclosures: openEnclosures(), agents: [{ name: "codex", folder }] });
    for (const args of [{ agent: "opencode" }, { agent: "nobody" }, {}, { agent: 7 }]) {
      assert.equal((await rejection(probe(handlers, args))).code, "invalid-request", JSON.stringify(args));
    }
    assert.deepEqual(calls(), [], "a refused probe starts nothing");
  });
});
