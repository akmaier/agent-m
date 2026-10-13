// MOD-repository-hosts' startWorkflow (ITM-400), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "startWorkflow(workflow: string, ref: string,
// inputs: Record<string, string>) -> Promise<CiRun | null> — starts a workflow or a pipeline with its inputs; the inputs must hold no credential. Returns the run where the
// server names it at once, otherwise `null`, and the caller finds it with `listCiRuns`. Crosses the network; fails with `PermissionMissing`, `TokenRefused`, `RateLimited`,
// `Unreachable`, `NotSupported`." For UC-004 7a. Deterministic, no network: the servers are fakes of `fetch` answering as the real APIs document —
// GitHub: "Create a workflow dispatch event" (POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches, body ref and inputs; 200 with workflow_run_id, run_url and
// html_url, read 2026-10-12 at docs.github.com/en/rest/actions/workflows; a server that gives no run answers 204 with no body); GitLab: "Create a new pipeline" (POST
// /projects/:id/pipeline, ref and inputs in the JSON body; the pipeline object with id, sha, ref, status, web_url, created_at, started_at, finished_at, read 2026-10-12 at
// docs.gitlab.com/api/pipelines/).
// Run: node --test tests/repository-hosts-workflows.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-004; A REMOTE INTERFACE NAMES HOW IT FAILS; A CREDENTIAL IS NEVER PLACED IN A URL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO SECRET IN THE REPOSITORY
// Level: unit
//
// Where the file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - GitHub's answer names the run by its identifier and addresses alone: the CiRun is { id, workflow, commit: "" (the answer does not name it), event: "workflow_dispatch",
//     state: "queued", url: html_url, started: null, ended: null }. GitLab's answer is the pipeline: its sha is the commit, its source (else "api") the event, its status
//     mapped to the run's state (created, waiting_for_resource, preparing, pending, scheduled: queued; running; manual: waiting; success; failed: failure; canceled, canceling:
//     cancelled; skipped), its web_url the address, `started_at` and `finished_at` the times.
//   - GitLab's inputs are sent as `inputs` of the pipeline's JSON body.
//   - An input that holds the token or a configured secret is refused with SecretRefused { path: "inputs.<key>" } before any request, as a file is by commitFiles.
//   - Every 422 is the host's own failure (Unreachable, with the status): GitHub's page documents no 422 for this call, so no message of one is matched.
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a refusal, the same call is first shown to succeed. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GL_API = "https://gitlab.example.org/api/v4/projects/space%2Fsprint-tool";
const GH_DISPATCH = "https://api.github.com/repos/carol/sprint-tool/actions/workflows/agent-m-jobs.yml/dispatches";
const SHA = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

function seen(input, init = {}) {
  const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
  const raw = init.headers ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries())
    : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? "GET").toUpperCase(), href: url.href, headers, body: typeof init.body === "string" ? JSON.parse(init.body) : null };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init) => { const r = seen(input, init); requests.push(r); return answer(r); };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);
const pipeline = (status, more = {}) => ({ id: 61, iid: 21, sha: SHA, ref: "main", status, web_url: "https://gitlab.example.org/space/sprint-tool/-/pipelines/61",
  created_at: "2026-10-12T09:36:13.747Z", started_at: null, finished_at: null, ...more });

// ---------------------------------------------------------------- GitHub

// TST-472566 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; UC-004 (7a)
// given: a GitHub repository and the person's token; the server answers 200 with the run it started
// input: startWorkflow("agent-m-jobs.yml", "main", { job: "JOB-1", note: "again" })
// expect: one request — POST to the workflow's dispatches, with the ref and the inputs, the token as a Bearer header and in no address —, and the run named at once
test("startWorkflow on GitHub — one dispatch with the ref and the inputs, and the run the server names", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { result, requests } = await serving(() => json(200, { workflow_run_id: 4711, run_url: "https://api.github.com/repos/carol/sprint-tool/actions/runs/4711",
    html_url: "https://github.com/carol/sprint-tool/actions/runs/4711" }), () => host.startWorkflow("agent-m-jobs.yml", "main", { job: "JOB-1", note: "again" }));
  assert.deepEqual(requests.map((r) => [r.method, r.href, r.body]), [["POST", GH_DISPATCH, { ref: "main", inputs: { job: "JOB-1", note: "again" } }]]);
  assert.equal(requests[0].headers.authorization, `Bearer ${GH_TOKEN}`);
  assert.equal(requests[0].href.includes(GH_TOKEN), false);
  assert.deepEqual(result, { id: "4711", workflow: "agent-m-jobs.yml", commit: "", event: "workflow_dispatch", state: "queued",
    url: "https://github.com/carol/sprint-tool/actions/runs/4711", started: null, ended: null });
});

// TST-472567 · level: unit · module: MOD-repository-hosts
// guards: UC-004 (7a)
// given: a GitHub server that starts the workflow and names no run — 204, no body
// input: startWorkflow("agent-m-jobs.yml", "main", {})
// expect: null, after one request; the caller finds the run with listCiRuns
test("startWorkflow on GitHub — a server that names no run gives null", async () => {
  const { result, requests } = await serving(() => new Response(null, { status: 204 }), () => connect(GITHUB, { token: GH_TOKEN }).startWorkflow("agent-m-jobs.yml", "main", {}));
  assert.equal(result, null);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].body, { ref: "main", inputs: {} });
});

// ---------------------------------------------------------------- GitLab

// TST-472568 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; UC-004 (7a)
// given: a GitLab project and its access token; the server creates the pipeline
// input: startWorkflow("agent-m-jobs.yml", "main", { job: "JOB-1" })
// expect: one request — POST to the project's pipeline, with the ref and the inputs in the JSON body, the token in PRIVATE-TOKEN and in no address —, and the pipeline as the run
test("startWorkflow on GitLab — one pipeline with the ref and the inputs, returned as the run", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests } = await serving(() => json(201, pipeline("pending", { source: "api" })), () => host.startWorkflow("agent-m-jobs.yml", "main", { job: "JOB-1" }));
  assert.deepEqual(requests.map((r) => [r.method, r.href, r.body]), [["POST", `${GL_API}/pipeline`, { ref: "main", inputs: { job: "JOB-1" } }]]);
  assert.equal(requests[0].headers["private-token"], GL_TOKEN);
  assert.equal(requests[0].href.includes(GL_TOKEN), false);
  assert.deepEqual(result, { id: "61", workflow: "agent-m-jobs.yml", commit: SHA, event: "api", state: "queued",
    url: "https://gitlab.example.org/space/sprint-tool/-/pipelines/61", started: null, ended: null });
});

// TST-472569 · level: unit · module: MOD-repository-hosts
// guards: UC-004 (7a)
// given: GitLab pipelines in each status, one with times
// input: startWorkflow on each
// expect: queued for created, waiting_for_resource, preparing, pending, scheduled; running; waiting for manual; success; failure for failed; cancelled for canceled and canceling; skipped; and the times as the server gave them; a pipeline without a source has the event "api"
test("startWorkflow on GitLab — the pipeline's status is the run's state, and its times are the run's", async () => {
  const states = { created: "queued", waiting_for_resource: "queued", preparing: "queued", pending: "queued", scheduled: "queued", running: "running", manual: "waiting",
    success: "success", failed: "failure", canceled: "cancelled", canceling: "cancelled", skipped: "skipped" };
  for (const [status, state] of Object.entries(states)) {
    const { result } = await serving(() => json(201, pipeline(status)), () => connect(GITLAB, { token: GL_TOKEN }).startWorkflow("w.yml", "main", {}));
    assert.equal(result.state, state, status);
    assert.equal(result.event, "api");
  }
  const { result } = await serving(() => json(201, pipeline("running", { started_at: "2026-10-12T09:37:00.000Z", finished_at: "2026-10-12T09:40:00.000Z" })),
    () => connect(GITLAB, { token: GL_TOKEN }).startWorkflow("w.yml", "main", {}));
  assert.equal(result.started, "2026-10-12T09:37:00.000Z");
  assert.equal(result.ended, "2026-10-12T09:40:00.000Z");
});

// ---------------------------------------------------------------- failures

// TST-472570 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host of each server whose server answers 200/201 first, then 401, 403, 404, 429 with a used-up limit, 500, and a network that fails
// input: startWorkflow("agent-m-jobs.yml", "main", {})
// expect: the run for the first; TokenRefused for 401; PermissionMissing for 403 and for 404 (a write the token may not make); RateLimited for the used-up limit; Unreachable for 500 and for the network failure; never success
test("startWorkflow names how it fails, on each server", async () => {
  const servers = [
    { host: () => connect(GITHUB, { token: GH_TOKEN }), ok: () => json(200, { workflow_run_id: 1, run_url: "https://api.github.com/x", html_url: "https://github.com/x" }),
      limited: () => json(403, { message: "rate limit" }, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1790000000" }) },
    { host: () => connect(GITLAB, { token: GL_TOKEN }), ok: () => json(201, pipeline("pending")), limited: () => json(429, { message: "Retry later" }) },
  ];
  for (const { host, ok, limited } of servers) {
    assert.ok((await serving(ok, () => host().startWorkflow("agent-m-jobs.yml", "main", {}))).result, "known positive");
    const named = async (answer) => (await failure(serving(answer, () => host().startWorkflow("agent-m-jobs.yml", "main", {}))))?.name;
    assert.equal(await named(() => json(401, { message: "Bad credentials" })), "TokenRefused");
    assert.equal(await named(() => json(403, { message: "Forbidden" })), "PermissionMissing");
    assert.equal(await named(() => json(404, { message: "Not Found" })), "PermissionMissing");
    assert.equal(await named(limited), "RateLimited");
    assert.equal(await named(() => json(500, { message: "Server error" })), "Unreachable");
    assert.equal(await named(() => { throw new TypeError("fetch failed"); }), "Unreachable");
  }
});

// TST-472571 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitHub 422 whose message names the workflow_dispatch trigger; another 422; a host with no token; a host through a clone without a token
// input: startWorkflow("agent-m-jobs.yml", "main", {})
// expect: the host's own Unreachable for each 422, whatever the message says (no source gives a 422 of this call, so none is read as "cannot be started"); NotSupported without a token and through a clone without a token, each with no request
test("startWorkflow is NotSupported without a token, and a 422 is the host's own failure", async () => {
  const trigger = await failure(serving(() => json(422, { message: "Workflow does not have 'workflow_dispatch' trigger" }),
    () => connect(GITHUB, { token: GH_TOKEN }).startWorkflow("agent-m-jobs.yml", "main", {})));
  assert.equal(trigger.name, "Unreachable", "a 422 is the host's own failure, whatever its message says");
  const other = await failure(serving(() => json(422, { message: "Unexpected inputs provided: [\"x\"]" }),
    () => connect(GITHUB, { token: GH_TOKEN }).startWorkflow("agent-m-jobs.yml", "main", { x: "1" })));
  assert.equal(other.name, "Unreachable");
  for (const host of [connect(GITHUB), connect(GITLAB), connect(GITHUB, { clone: "/tmp/a-clone" })]) {
    const refused = await serving(() => json(200, {}), () => failure(host.startWorkflow("agent-m-jobs.yml", "main", {})));
    assert.equal(refused.result.name, "NotSupported");
    assert.equal(refused.requests.length, 0);
  }
});

// ---------------------------------------------------------------- credentials in the inputs

// TST-472572 · level: unit · module: MOD-repository-hosts
// guards: NO SECRET IN THE REPOSITORY; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a host of each server, with the person's token and a configured secret; inputs that hold the token, a configured secret, and neither
// input: startWorkflow with each
// expect: clean inputs start the workflow; an input that holds the token or the secret is SecretRefused naming `inputs.<key>`, with no request, and the failure's text does not repeat the value
test("startWorkflow refuses an input that holds a credential before any request", async () => {
  const SECRET = "s3cret-value-9f8e7d6c";
  for (const [address, token] of [[GITHUB, GH_TOKEN], [GITLAB, GL_TOKEN]]) {
    const host = () => connect(address, { token, secrets: [SECRET] });
    const clean = await serving(() => (address === GITHUB ? new Response(null, { status: 204 }) : json(201, pipeline("pending"))), () => host().startWorkflow("w.yml", "main", { job: "JOB-1" }));
    assert.equal(clean.requests.length, 1, "known positive");
    for (const [key, value] of [["note", `use ${token} here`], ["other", `x${SECRET}y`]]) {
      const refused = await serving(() => json(200, {}), () => failure(host().startWorkflow("w.yml", "main", { job: "JOB-1", [key]: value })));
      assert.equal(refused.result.name, "SecretRefused");
      assert.equal(refused.result.path, `inputs.${key}`);
      assert.equal(refused.result.message.includes(token) || refused.result.message.includes(SECRET), false);
      assert.equal(refused.requests.length, 0);
    }
  }
});

// TST-472573 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host with a token; arguments that are no workflow, no ref, and inputs that are not texts
// input: startWorkflow with each
// expect: a TypeError for each, with no request, saying that a workflow and a ref are named and that inputs are texts
test("startWorkflow refuses arguments that are no workflow, ref or inputs", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  for (const args of [["", "main", {}], ["w.yml", "", {}], [7, "main", {}], ["w.yml", "main", null], ["w.yml", "main", { n: 1 }], ["w.yml", "main", ["a"]]]) {
    const refused = await serving(() => json(200, {}), () => failure(host.startWorkflow(...args)));
    assert.ok(refused.result instanceof TypeError, JSON.stringify(args));
    assert.match(refused.result.message, /startWorkflow names|inputs of a workflow are texts/, JSON.stringify(args));
    assert.equal(refused.requests.length, 0);
  }
});
