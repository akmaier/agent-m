// Module: MOD-runtimes
// The fixture of the live-state tests of ITM-535 (tests/runtimes-live-state.test.mjs, tests/runtimes-live-tab.test.mjs), no test of its own: a fake repository host in memory
// (default branch `trunk`) that keeps every call and every commit in the order it happened, with a CI that lists the runs it is given and cancels the one asked; the job's
// start and a record of it as a given route has taken it. No expected result is computed here; each test states its own. Nothing reaches the network.

import { appendToRecord, recordsNewestFirst, startRecord } from "../src/job-ledger/index.mjs";

export const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
export const START = {
  id: "JOB-20261016-1100-c0de", kind: "write-tests", worksOn: ["ITM-535"], participant: "drafter-a", model: "example-model", route: "ci hosted", run: null, retries: null,
  startedBy: "alice", start: new Date("2026-10-16T11:00:00Z"), agentM: { version: "2026.10.0", commit: "a".repeat(40) }, inputs: ["SPEC.md@deadbeef"], limit: 5,
  task: "in parameters", conversation: null, destinations: [{ participant: "drafter-a", place: "CI", parts: ["the draft"] }], params: {},
};
export const RECORD_PATH = `docs/jobs/${START.id}.md`;
export const RUN_URL = "https://github.com/alice/product/actions/runs/7";
export const OTHER_RUN_URL = "https://github.com/alice/product/actions/runs/8";
export const failure = (name, fields = {}, message = name) => Object.assign(new Error(message), { name, ...fields });
export const ciRun = (id, state, workflow = "agent-m-jobs.yml") => ({ id: String(id), workflow, commit: "c0", event: "push", state,
  url: `https://github.com/alice/product/actions/runs/${id}`, started: null, ended: null });

// The fake host. `taken` is the `by:` of the record's `## Taken` (null: not taken). `runs` is what the CI lists; `calls` keeps, in order, `list <workflow>`, `cancel <id>`
// and `log <id>`; `afterCancel(id, runs)` may change the runs when a cancel arrives. `listFails` / `cancelFails` make that call reject with the error given;
// `id` is the job's identifier; `commitFails` makes every commit reject; `withoutCi` leaves out the CI calls altogether.
export function fakeHost({ id = START.id, taken = null, runs = [], afterCancel = () => {}, listFails = null, cancelFails = null, commitFails = null, withoutCi = false } = {}) {
  const tree = new Map();
  const path = `docs/jobs/${id}.md`;
  const base = startRecord({ ...START, id }).text;
  tree.set(path, taken === null ? base : appendToRecord(base, { part: "taken", at: new Date("2026-10-16T11:01:00Z"), by: taken }));
  const writes = [], calls = [];
  let head = "c0", made = 0;
  const snapshot = () => ({ repository: REPOSITORY, ref: "trunk", commit: head, paths: [...tree.keys()].sort(), read: async (path) => tree.get(path) ?? null, blob: () => null });
  const host = {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshot(); },
    async commitFiles(change) {
      if (commitFails) throw commitFails;
      if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
      writes.push(structuredClone(change));
      for (const file of change.files) tree.set(file.path, file.text);
      head = `c${++made}`;
      return { commit: head, url: `${REPOSITORY.web}/commit/${head}` };
    },
  };
  if (!withoutCi) {
    host.listCiRuns = async (filter) => {
      calls.push(`list ${filter?.workflow}`);
      if (listFails) throw listFails;
      return runs.filter((run) => !filter?.workflow || run.workflow === filter.workflow).map((run) => ({ ...run }));
    };
    host.cancelCiRun = async (id) => {
      calls.push(`cancel ${id}`);
      if (cancelFails) throw cancelFails;
      afterCancel(id, runs);
    };
    host.ciRunLog = async (id) => { calls.push(`log ${id}`); return "the log"; };
  }
  return { host, writes, calls, tree, head: () => head,
    record: async () => { for await (const each of recordsNewestFirst(snapshot())) return each; return null; } };
}

// The global fetch while a test runs: a spy that keeps every request and answers none, so that a request to the network is seen. Call `restoreFetch()` after each test.
const realFetch = globalThis.fetch;
export const fetched = [];
export function spyOnFetch() {
  fetched.length = 0;
  globalThis.fetch = async (url) => { fetched.push(String(url)); throw new TypeError("fetch is spied: no request leaves the test"); };
}
export const restoreFetch = () => { globalThis.fetch = realFetch; };
