// The input `secret` of a run a hand-over started reaches the entry (ITM-1189) — MOD-workflow-entries' CiEnvironment, as the accepted text of
// docs/architecture/MOD-workflow-entries.md states it (Data: the contract between the workflow files and the entries; Interfaces: onDispatch): "the key from the CI secret the
// input `secret` names". The job workflow of MOD-runtimes sets AGENT_M_INPUT_SECRET on GitLab and declares the input `secret` on GitHub (ITM-1188); the entry reads the
// payload's inputs. What the entry then does with the name is tests/workflow-entries-hand-over.test.mjs.
// Run: node --test tests/workflow-entries-dispatch-secret.test.mjs
//
// Module: MOD-workflow-entries
// Guards: UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. A reading of this file: an empty AGENT_M_INPUT_SECRET is no input, as the empty
// values of the other inputs are none. A name the module does not provide yet is undefined here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const composed = await import("../src/workflow-entries/compose.mjs").catch((error) => ({ error }));
const { ciEnvironment } = composed;
const NOW = new Date("2026-10-23T09:00:00Z");
const gitlab = (extra = {}) => ({ GITLAB_CI: "true", CI_PIPELINE_SOURCE: "api", CI_PROJECT_DIR: "/builds/alice/thesis-tool", CI_PROJECT_URL: "https://gitlab.example.test/alice/thesis-tool",
  CI_COMMIT_REF_NAME: "main", CI_COMMIT_SHA: "a".repeat(40), AGENT_M_RUNNER: "hosted", AGENT_M_TOKEN_NAME: "ALICE_TOKEN", AGENT_M_TOKEN: "tok", AGENT_M_KEY_NAMES: "EP1_KEY",
  EP1_KEY: "value", AGENT_M_INPUT_JOB: "JOB-1", AGENT_M_INPUT_TASK: "a task", AGENT_M_INPUT_ENDPOINT: "{}", ...extra });

// TST-1189005 · level: unit · module: MOD-workflow-entries
// guards: UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a GitLab job's environment with AGENT_M_INPUT_SECRET `EP1_KEY`, and the same with it empty and with it unset
// input: ciEnvironment("onDispatch", each, NOW)
// expect: with the name, the payload's inputs hold secret "EP1_KEY" beside job, task and endpoint, and the keys hold EP1_KEY's value; with it empty or unset, the payload's inputs hold no key `secret`
test("ciEnvironment — a GitLab job's AGENT_M_INPUT_SECRET is the input secret, and an empty one is none", () => {
  assert.ok(ciEnvironment, `ciEnvironment: ${composed.error?.message}`);
  const named = ciEnvironment("onDispatch", gitlab({ AGENT_M_INPUT_SECRET: "EP1_KEY" }), NOW);
  assert.deepEqual(named.event.payload.inputs, { job: "JOB-1", task: "a task", endpoint: "{}", secret: "EP1_KEY" });
  assert.deepEqual(named.job.keys, { EP1_KEY: "value" });
  for (const env of [gitlab({ AGENT_M_INPUT_SECRET: "" }), gitlab()]) {
    assert.equal(Object.hasOwn(ciEnvironment("onDispatch", env, NOW).event.payload.inputs, "secret"), false);
  }
});

// TST-1189006 · level: unit · module: MOD-workflow-entries
// guards: UC-049
// given: a GitHub dispatch whose event file holds the inputs job, task, endpoint and secret "EP1_KEY"
// input: ciEnvironment("onDispatch", the GitHub names, NOW)
// expect: the payload's inputs are exactly those four, with secret "EP1_KEY"
test("ciEnvironment — a GitHub dispatch's input secret is read from the event file", () => {
  assert.ok(ciEnvironment, `ciEnvironment: ${composed.error?.message}`);
  const dir = mkdtempSync(join(tmpdir(), "agent-m-ITM-1189-"));
  try {
    const inputs = { job: "JOB-1", task: "a task", endpoint: "{}", secret: "EP1_KEY" };
    writeFileSync(join(dir, "event.json"), JSON.stringify({ inputs }));
    const env = ciEnvironment("onDispatch", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: join(dir, "event.json"), GITHUB_WORKSPACE: "/w",
      GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: "b".repeat(40), AGENT_M_RUNNER: "hosted" }, NOW);
    assert.deepEqual(env.event.payload.inputs, inputs);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
