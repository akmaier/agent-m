// MOD-repository-hosts' ciRunLabels (ITM-1081), as the accepted text of docs/architecture/MOD-repository-hosts.md:238-240 states it:
// "ciRunLabels(id: string) -> Promise<string[]> — the runner labels the run's jobs ask for: on GitHub the `labels` of each job of the workflow run, on GitLab the tags of
// each job of the pipeline; each once, empty for a run whose jobs ask for none. Crosses the network; fails as `readSnapshot`."
// Deterministic, no network: the servers are fakes of `fetch` answering as the real APIs document — GitHub "List jobs for a workflow run" (GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs;
// the answer's jobs, each with labels), GitLab "List pipeline jobs" (GET /projects/:id/pipelines/:pipeline_id/jobs; each job with tag_list).
// Run: node --test tests/repository-hosts-ci-run-labels.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-027; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// Readings the text leaves open, each stated by the test that takes it:
//   - The labels come in the order of the jobs as the server lists them and, within a job, as it lists them; a label of two jobs is given once.
//   - A run the server does not know fails NotFound, as ciRunLog does (the list of its jobs answers 404); a clone without a token throws NotSupported with no request.
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GH = "/repos/carol/sprint-tool";
const GL = "/api/v4/projects/space%2Fsprint-tool";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const raw = init.headers ?? {};
    const headers = raw instanceof Headers ? Object.fromEntries(raw.entries()) : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const request = { method: String(init.method ?? "GET").toUpperCase(), href: url.href, path: url.pathname, query: url.searchParams, headers };
    requests.push(request);
    return answer(request);
  };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);
const lines = (requests) => requests.map((r) => `${r.method} ${r.path}`);

// GitHub's jobs of run 9002 and GitLab's of pipeline 62: each job as [name, labels].
const ghJobs = (jobs) => (r) => (r.path === `${GH}/actions/runs/9002/jobs`
  ? json(200, { total_count: jobs.length, jobs: jobs.map(([name, labels], at) => ({ id: 700 + at, name, run_id: 9002, labels })) }) : json(404, { message: "Not Found" }));
const glJobs = (jobs) => (r) => (r.path === `${GL}/pipelines/62/jobs`
  ? json(200, jobs.map(([name, tags], at) => ({ id: 800 + at, name, status: "pending", tag_list: tags, pipeline: { id: 62 } }))) : json(404, { message: "404 Not found" }));

// TST-1081001 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitHub run 9002 whose jobs ask for [self-hosted, lab], [lab, gpu] and none
// input: ciRunLabels("9002")
// expect: ["self-hosted", "lab", "gpu"] — in the order the server lists them, each once; one request, GET …/actions/runs/9002/jobs (per_page 100, page 1), with the token as a Bearer header and in no address
test("ciRunLabels on GitHub — the labels of the jobs of the run, in the order listed, each once", async () => {
  const { result, requests } = await serving(ghJobs([["build", ["self-hosted", "lab"]], ["test", ["lab", "gpu"]], ["lint", []]]), () => connect(GITHUB, { token: GH_TOKEN }).ciRunLabels("9002"));
  assert.deepEqual(result, ["self-hosted", "lab", "gpu"]);
  assert.deepEqual(lines(requests), [`GET ${GH}/actions/runs/9002/jobs`]);
  assert.deepEqual([requests[0].query.get("per_page"), requests[0].query.get("page")], ["100", "1"]);
  assert.equal(requests[0].headers.authorization, `Bearer ${GH_TOKEN}`);
  assert.equal(requests[0].href.includes(GH_TOKEN), false);
});

// TST-1081002 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitLab pipeline 62 whose jobs carry the tags [lab, gpu], [lab] and none
// input: ciRunLabels("62")
// expect: ["lab", "gpu"]; one request, GET …/pipelines/62/jobs (per_page 100, page 1), with the token as PRIVATE-TOKEN and in no address
test("ciRunLabels on GitLab — the tags of the jobs of the pipeline, in the order listed, each once", async () => {
  const { result, requests } = await serving(glJobs([["build", ["lab", "gpu"]], ["test", ["lab"]], ["lint", []]]), () => connect(GITLAB, { token: GL_TOKEN }).ciRunLabels("62"));
  assert.deepEqual(result, ["lab", "gpu"]);
  assert.deepEqual(lines(requests), [`GET ${GL}/pipelines/62/jobs`]);
  assert.deepEqual([requests[0].query.get("per_page"), requests[0].query.get("page")], ["100", "1"]);
  assert.equal(requests[0].headers["private-token"], GL_TOKEN);
  assert.equal(requests[0].href.includes(GL_TOKEN), false);
});

// TST-1081003 · level: unit · module: MOD-repository-hosts
// guards: UC-027
// given: on each server a run whose jobs ask for no label (GitHub labels [], GitLab tag_list []), and a run with no job at all
// input: ciRunLabels on each
// expect: an empty array each time — "empty for a run whose jobs ask for none" — not null, not a failure
test("ciRunLabels — a run whose jobs ask for no label gives an empty list", async () => {
  assert.deepEqual((await serving(ghJobs([["build", []]]), () => connect(GITHUB, { token: GH_TOKEN }).ciRunLabels("9002"))).result, []);
  assert.deepEqual((await serving(glJobs([["build", []]]), () => connect(GITLAB, { token: GL_TOKEN }).ciRunLabels("62"))).result, []);
  assert.deepEqual((await serving(ghJobs([]), () => connect(GITHUB, { token: GH_TOKEN }).ciRunLabels("9002"))).result, []);
  assert.deepEqual((await serving(glJobs([]), () => connect(GITLAB, { token: GL_TOKEN }).ciRunLabels("62"))).result, []);
});

// TST-1081004 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the server knows run 9002 (pipeline 62) and does not know run 9999 (pipeline 99): it answers 404 to the list of its jobs
// input: ciRunLabels("9002") / ("62") — the known positive —, then ("9999") / ("99"); then 401, 403 and a failing network for the known run
// expect: the known run gives its labels; the unknown run fails NotFound on each server; 401 is TokenRefused, 403 PermissionMissing, the network failure Unreachable; never a list
test("ciRunLabels — a run the server does not know is NotFound, and the other failures are named", async () => {
  const github = (id, answer = ghJobs([["build", ["lab"]]])) => serving(answer, () => connect(GITHUB, { token: GH_TOKEN }).ciRunLabels(id));
  const gitlab = (id, answer = glJobs([["build", ["lab"]]])) => serving(answer, () => connect(GITLAB, { token: GL_TOKEN }).ciRunLabels(id));
  assert.deepEqual((await github("9002")).result, ["lab"]);
  assert.deepEqual((await gitlab("62")).result, ["lab"]);
  assert.equal((await failure(github("9999")))?.name, "NotFound");
  assert.equal((await failure(gitlab("99")))?.name, "NotFound");
  assert.equal((await failure(github("9002", () => json(401, { message: "Bad credentials" }))))?.name, "TokenRefused");
  assert.equal((await failure(gitlab("62", () => json(401, { message: "401 Unauthorized" }))))?.name, "TokenRefused");
  assert.equal((await failure(github("9002", () => json(403, { message: "Resource not accessible" }))))?.name, "PermissionMissing");
  assert.equal((await failure(gitlab("62", () => { throw new TypeError("fetch failed"); })))?.name, "Unreachable");
});

// TST-1081005 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host of each server
// input: ciRunLabels with no identifier, an empty one and a number; and a host through a local clone with no token
// expect: the first three throw TypeError ("a CI run is named by its identifier") with no request; the clone throws NotSupported with no request
test("ciRunLabels — a run is named by its identifier, and a clone without a token is NotSupported", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  for (const bad of [undefined, "", "  ", 9002]) assert.equal((await failure(serving(() => json(200, {}), () => host.ciRunLabels(bad)))) instanceof TypeError, true, String(bad));
  const { result, requests } = await serving(() => json(200, {}), () => failure(connect(GITHUB, { clone: "/tmp/a-clone" }).ciRunLabels("9002")));
  assert.equal(result?.name, "NotSupported");
  assert.equal(requests.length, 0);
});
