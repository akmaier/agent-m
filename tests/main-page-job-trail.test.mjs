// MOD-main-page's route `job` — what the job left in its product (ITM-1022), as the accepted text of docs/architecture/MOD-main-page.md (Interfaces: `job`) and UC-036 (step 4) state it: "one job: its inputs, its commits and pull request
// and its CI runs (MOD-runtimes' `jobTrail`)".
// Run: node --test tests/main-page-job-trail.test.mjs
//
// Module: MOD-main-page
// Guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036
// Level: unit
//
// The real MOD-job-ledger, MOD-runtimes, MOD-repository-hosts, MOD-browser-store and MOD-site-frame run as they are; only `fetch` is faked: by tests/main-page-home-harness.mjs (the fake GitHub, the Bridge lab-pc-4 listing the job as
// running) and, over it, by this file, which answers GitHub's lists of commits, pull requests and workflow runs of alice/product for the branch named after the job, as the REST API documents them. No request leaves the fixtures.
//
// Readings the module file leaves open, which the tests state (the pull request names them):
//   - The page has, below the job's facts, <ul class="job-commits"> of <li class="job-commit"> (the first twelve digits of the commit, its first line, its date) — or <p class="job-commits-none"> where the job's branch has none —,
//     <p class="job-pull-request"> ("#<number> <title> — <state>", with <a class="pull-link"> to it; "No pull request." where the branch has none) and <ul class="job-runs"> of <li class="job-run"> (workflow, state, with
//     <a class="run-link"> to the run) — or <p class="job-runs-none">. A trail that cannot be read is <p class="warn job-trail-problem"> with the host's message; the rest of the page stands.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { startRecord, appendToRecord } from "../src/job-ledger/index.mjs";
import { INSTANCE, PRODUCT, browser, byClass, draw, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const job = view.routes.find((candidate) => candidate.name === "job");
const ID = "JOB-20261016-1000-7a01";
let net;
afterEach(() => { net?.restore(); timers.restore(); document.body.replaceChildren(); });

const one = (root, name) => byClass(root, name)[0];
const walk = (root, match) => { const found = []; (function visit(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (match(child)) found.push(child); visit(child); } })(root); return found; };

const runningJob = () => {
  const { path, text } = startRecord({ id: ID, kind: "implement-item", worksOn: ["ITM-0900"], participant: "dev-cli", model: "model-x", route: "bridge lab-pc-4", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-16T10:00:00Z"), agentM: { version: "2026.1.0", commit: "abc1234" }, inputs: [], limit: 5, task: "in parameters", conversation: null, destinations: [], params: {} });
  return { path, text: appendToRecord(text, { part: "taken", at: new Date("2026-10-16T10:00:00Z"), by: "lab-pc-4" }) };
};
const sha = (n) => String(n).repeat(40);
const commitOf = (n, date, message) => ({ sha: sha(n), parents: [], author: { login: "dev" }, commit: { author: { name: "Dev" }, committer: { date }, message } });
const pullOf = (number, state) => ({ number, title: `Work on ${ID}`, head: { ref: ID, sha: sha(3) }, base: { ref: "main" }, state, draft: false, html_url: `https://github.com/alice/product/pull/${number}`, created_at: "2026-10-16T12:05:00Z",
  merged_at: null, closed_at: null, body: "" });
const runOf = (id, commit, status, conclusion) => ({ id, path: ".github/workflows/tests.yml", head_sha: commit, event: "push", status, conclusion, html_url: `https://github.com/alice/product/actions/runs/${id}`, run_started_at: null, updated_at: null });

/** The world, with what GitHub answers for the job's branch: `commits` (null: the branch does not exist), `pulls`, `runs`, and `refuse` (a status the commits list is answered with). */
function world({ commits = null, pulls = [], runs = [], refuse = null } = {}) {
  net = network({ [PRODUCT]: smallProduct({ jobs: [runningJob()] }), [INSTANCE]: instanceFiles() }, { bridgeLists: ID });
  net.install();
  const inner = globalThis.fetch, asked = [];
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/commits`) {
      asked.push(url.href);
      if (refuse) return json({ message: "Server error" }, refuse);
      return commits === null || url.searchParams.get("sha") !== ID ? json({ message: "No commit found for SHA" }, 404) : json(commits);
    }
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/pulls`) { asked.push(url.href); return json(pulls); }
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/actions/runs`) { asked.push(url.href); return json({ workflow_runs: runs }); }
    return inner(input, init);
  };
  return { asked, context: browser() };
}
const drawJob = (context) => draw(job, context, { id: ID });

// TST-1022004 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036 (step 4)
// given: the running job, whose branch has two commits after its start and one before it, whose pull request #4 is open, and whose CI runs are one for each of its two commits and one for a commit that is not its own
// input: the route job drawn
// expect: two commit lines (the newer first) with the twelve digits of the commit and its first line; the pull request "#4 Work on <id> — open" with a link; two run lines, "tests.yml" with the state success and failure, each with a link, and not the run of the foreign commit
test("TST-1022004 a job's page lists the commits of its branch, its pull request and the CI runs of those commits", async () => {
  const { context } = world({ commits: [commitOf(2, "2026-10-16T12:00:00Z", "Make it pass\n\nbody"), commitOf(1, "2026-10-16T10:30:00Z", "Add the tests"), commitOf(9, "2026-10-15T09:00:00Z", "Older work")],
    pulls: [pullOf(4, "open")], runs: [runOf(101, sha(2), "completed", "success"), runOf(102, sha(1), "completed", "failure"), runOf(103, sha(7), "completed", "success")] });
  const target = await drawJob(context);
  const commits = byClass(target, "job-commit").map((node) => node.textContent);
  assert.equal(commits.length, 2);
  assert.equal(commits[0].includes(sha(2).slice(0, 12)) && commits[0].includes("Make it pass") && !commits[0].includes("body"), true, commits[0]);
  assert.equal(commits[1].includes(sha(1).slice(0, 12)) && commits[1].includes("Add the tests"), true, commits[1]);
  assert.equal(commits.some((text) => text.includes("Older work")), false);
  const pr = one(target, "job-pull-request");
  assert.equal(pr.textContent.includes(`#4 Work on ${ID} — open`), true, pr.textContent);
  assert.equal(walk(pr, (node) => node.localName === "a")[0].getAttribute("href"), "https://github.com/alice/product/pull/4");
  const runs = byClass(target, "job-run");
  assert.deepEqual(runs.map((node) => node.textContent.includes("tests.yml") && node.textContent.includes(node === runs[0] ? "success" : "failure")), [true, true]);
  assert.deepEqual(byClass(target, "run-link").map((node) => node.getAttribute("href")), ["https://github.com/alice/product/actions/runs/101", "https://github.com/alice/product/actions/runs/102"]);
});

// TST-1022005 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036
// given: the running job whose branch does not exist (GitHub answers 404) and which has no pull request
// input: the route job drawn
// expect: no commit line and the line "No commits yet." (class job-commits-none); "No pull request."; no run line and "No CI runs." (class job-runs-none); no request for the runs of the branch
test("TST-1022005 a job whose branch does not exist shows no commits, no pull request and no runs", async () => {
  const { context, asked } = world();
  const target = await drawJob(context);
  assert.deepEqual(byClass(target, "job-commit"), []);
  assert.equal(one(target, "job-commits-none").textContent, "No commits yet.");
  assert.equal(one(target, "job-pull-request").textContent, "No pull request.");
  assert.deepEqual(byClass(target, "job-run"), []);
  assert.equal(one(target, "job-runs-none").textContent, "No CI runs.");
  assert.equal(asked.some((href) => href.includes("/actions/runs")), false);
});

// TST-1022006 · level: unit · module: MOD-main-page
// guards: ONE DASHBOARD SHOWS EVERY JOB; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the running job, and GitHub answering 500 to the list of the branch's commits
// input: the route job drawn
// expect: the facts of the job are still drawn; a warning (class job-trail-problem) names the failure; no commit, pull request or run line is drawn as if there were none
test("TST-1022006 a trail that cannot be read is said so, and the rest of the page stands", async () => {
  const { context } = world({ refuse: 500 });
  const target = await drawJob(context);
  assert.equal(byClass(target, "job-facts").length, 1);
  assert.equal(one(target, "job-trail-problem") !== undefined, true);
  assert.deepEqual([byClass(target, "job-commits-none").length, byClass(target, "job-pull-request").length, byClass(target, "job-runs-none").length], [0, 0, 0]);
});
