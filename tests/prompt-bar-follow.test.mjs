// MOD-prompt-bar's followJob (follow.mjs) — what a followed job shows when its runtime does not answer, and when its
// record cannot be read. Run: node --test tests/prompt-bar-follow.test.mjs
//
// Module: MOD-prompt-bar
// Guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049 (5a)
// Level: unit
//
// The host is a fixture in memory: repositoryInfo, readSnapshot and listCiRuns; nothing reaches a network, sleeps or waits.

import test from "node:test";
import assert from "node:assert/strict";
import { followJob } from "../src/prompt-bar/follow.mjs";

const ID = "JOB-20261011-2300-f922";
const RUN = "https://github.com/acme/repo/actions/runs/77";
const RECORD = ["---", `id: ${ID}`, "kind: run-tests", "works_on:", "  - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "route: ci hosted",
  "started_by: akmaier", "start: 2026-10-11 23:00 UTC", "agent_m: unknown, commit unknown", "limit: 1", "---", "## Destinations", "", "## Parameters", "",
  "```json", "{}", "```", "", "## Taken", "", "at: 2026-10-11 23:01 UTC", `by: ${RUN}`, ""].join("\n");

// A host whose default branch holds `files`; listCiRuns fails the first time it is asked (the live state) and lists nothing after (the log).
function hostOf(files) {
  let asked = 0;
  return {
    async repositoryInfo() { return { defaultBranch: "trunk" }; },
    async readSnapshot() { return { commit: "c1", paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) }; },
    async listCiRuns() { asked += 1; if (asked === 1) throw new Error("Unreachable: the server gave no answer"); return []; },
  };
}

const firstView = (host) => new Promise((resolve) => {
  const handle = followJob({ id: ID, address: "acme/repo", host, store: null, show: (view) => { handle.stop(); resolve(view); } });
});

// TST-881002 · level: unit · module: MOD-prompt-bar
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a followed job, taken on CI and not ended, whose runtime (the CI server) fails to answer
// input: followJob, its first poll
// expect: state "running"; problem "The runtime is not reachable: Unreachable: the server gave no answer" and not the record could not be read
test("followJob — a followed job whose runtime is unreachable is shown as not reachable, not as unreadable", async () => {
  const view = await firstView(hostOf({ [`docs/jobs/${ID}.md`]: RECORD }));
  assert.equal(view.state, "running");
  assert.equal(view.problem, "The runtime is not reachable: Unreachable: the server gave no answer");
});

// A host whose CI server fails every call it is asked, the live state's and the log's alike.
function failingHostOf(files) {
  return { ...hostOf(files), async listCiRuns() { throw new Error("Unreachable: the server gave no answer"); } };
}

// TST-901001 · level: unit · module: MOD-prompt-bar
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a followed job, taken on CI and not ended, whose CI server fails every call, the live state's and the log's
// input: followJob, its first poll
// expect: state "running"; problem "The runtime is not reachable: Unreachable: the server gave no answer", not "The job could not be followed"
test("followJob — a job on CI whose server fails every call is shown as not reachable, not as not followable", async () => {
  const view = await firstView(failingHostOf({ [`docs/jobs/${ID}.md`]: RECORD }));
  assert.equal(view.state, "running");
  assert.equal(view.problem, "The runtime is not reachable: Unreachable: the server gave no answer");
});

// TST-901002 · level: unit · module: MOD-prompt-bar
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a followed job, not ended, taken on the Bridge "po-sol, manual Codex CLI session", which this browser does not keep
// input: followJob, its first poll
// expect: state "running"; problem "The runtime is not reachable: no Bridge named po-sol, manual Codex CLI session is among the Bridges"
test("followJob — a job on a Bridge this browser does not keep is shown as not reachable, not as not followable", async () => {
  const record = RECORD.replace(`by: ${RUN}`, "by: po-sol, manual Codex CLI session");
  const view = await firstView(hostOf({ [`docs/jobs/${ID}.md`]: record }));
  assert.equal(view.state, "running");
  assert.equal(view.problem, "The runtime is not reachable: no Bridge named po-sol, manual Codex CLI session is among the Bridges");
});
