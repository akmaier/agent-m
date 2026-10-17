// MOD-repository-hosts' setPipelineSchedule (ITM-749), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "setPipelineSchedule(schedule: PipelineSchedule) ->
// Promise<{ id: string, url: string }> — on a GitLab server, creates the project's pipeline schedule with this description, or updates the one that has it, so that saving again never
// adds a second schedule (UC-027). Its variables hold no credential: a secret stays a CI variable of the project, which the person sets on the server's page. On GitHub it throws
// `NotSupported`: a workflow's schedule is part of the workflow's file, which the test configuration generates. Crosses the network; fails with `PermissionMissing` — a project access
// token without the role *Maintainer* —, `TokenRefused`, `RateLimited`, `Unreachable`." For UC-027 3a. Deterministic, no network: the GitLab server is a fake of `fetch` that keeps
// the project's schedules and answers as GitLab's "Pipeline schedules" API documents (docs.gitlab.com/api/pipeline_schedules/): GET /projects/:id/pipeline_schedules (a list, paged),
// POST the same (description, ref, cron, cron_timezone, active; 201 with the schedule and its id), GET /pipeline_schedules/:id (with its variables), PUT /pipeline_schedules/:id,
// POST /pipeline_schedules/:id/variables (key, value), PUT and DELETE /pipeline_schedules/:id/variables/:key.
// Run: node --test tests/repository-hosts-pipeline-schedule.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; NO SECRET IN THE REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// Where the file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The returned `url` is the project's pipeline schedules page, <project web address>/-/pipeline_schedules, whichever schedule was set.
//   - The schedule is found among the project's schedules by its description, read page by page; when several have it, the first is updated.
//   - An update makes the schedule what was given: ref, cron, timezone and active are sent, and its variables become those given — a variable given is set (updated where it stands, else
//     created), a variable the schedule has and the call does not give is deleted. A schedule given without `variables` has none.
//   - Every request of the call is a write of a function that needs the role Maintainer: a 404 on any of them is PermissionMissing, as for every write.
//   - Without a token, GitLab is NotSupported before any request, as for createBranch; so is a clone without a token. A clone with a token reaches the server's API.
//   - A variable that holds the token or a configured secret is SecretRefused naming `variables.<key>`, before any request; arguments that are no schedule are a TypeError.
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
const PAGES = "https://gitlab.example.org/space/sprint-tool/-/pipeline_schedules";
const NIGHTLY = { description: "Agent M nightly", cron: "0 2 * * *", timezone: "Europe/Berlin", ref: "main", active: true };

function seen(input, init = {}) {
  const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
  const raw = init.headers ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries())
    : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? "GET").toUpperCase(), href: url.href, path: url.href.replace(GL_API, "").replace(/\?.*$/, ""), page: url.searchParams.get("page"),
    headers, body: typeof init.body === "string" ? JSON.parse(init.body) : null };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init) => { const r = seen(input, init); requests.push(r); return answer(r); };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);
const route = (r) => `${r.method} ${r.path}`;

// A GitLab project's pipeline schedules, kept as the server keeps them: `schedules` (each with its id, description, ref, cron, cron_timezone, active and variables) and a counter.
function gitlab(schedules = []) {
  const state = { schedules, next: 100 };
  const answer = (r) => {
    const own = r.path.match(/^\/pipeline_schedules\/(\d+)(?:\/variables(?:\/(.+))?)?$/);
    if (r.path === "/pipeline_schedules" && r.method === "GET") {
      const per = 100, at = (Number(r.page) - 1) * per;
      return json(200, state.schedules.slice(at, at + per).map(({ variables, ...s }) => s));
    }
    if (r.path === "/pipeline_schedules" && r.method === "POST") {
      const made = { id: state.next++, description: r.body.description, ref: r.body.ref, cron: r.body.cron, cron_timezone: r.body.cron_timezone, active: r.body.active, variables: [] };
      state.schedules.push(made);
      return json(201, made);
    }
    const found = own && state.schedules.find((s) => s.id === Number(own[1]));
    if (!found) return json(404, { message: "404 Not found" });
    if (!r.path.includes("/variables")) {
      if (r.method === "GET") return json(200, found);
      Object.assign(found, { ref: r.body.ref, cron: r.body.cron, cron_timezone: r.body.cron_timezone, active: r.body.active });
      return json(200, found);
    }
    if (r.method === "POST") { found.variables.push({ key: r.body.key, value: r.body.value, variable_type: "env_var" }); return json(201, r.body); }
    const at = found.variables.findIndex((v) => v.key === decodeURIComponent(own[2] ?? ""));
    if (at < 0) return json(404, { message: "404 Variable Not Found" });
    if (r.method === "PUT") { found.variables[at].value = r.body.value; return json(200, found.variables[at]); }
    return json(202, found.variables.splice(at, 1)[0]);
  };
  return { state, answer };
}
const host = (secrets) => connect(GITLAB, { token: GL_TOKEN, secrets });

// ---------------------------------------------------------------- create, and update so that none is added

// TST-749001 · level: unit · module: MOD-repository-hosts
// guards: UC-027 (3a); GITLAB PRODUCTS ARE SUPPORTED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitLab project with no pipeline schedule, and its access token
// input: setPipelineSchedule(the nightly schedule: description "Agent M nightly", cron "0 2 * * *", timezone "Europe/Berlin", ref "main", active)
// expect: two requests — the project's schedules read, then one POST creating the schedule with description, ref, cron, cron_timezone and active, the token in PRIVATE-TOKEN and in no address —; the answer holds the new schedule's id as text and the project's pipeline schedules page as url
test("setPipelineSchedule on GitLab — a project without the schedule gets it created once, with its fields", async () => {
  const server = gitlab();
  const { result, requests } = await serving(server.answer, () => host().setPipelineSchedule(NIGHTLY));
  assert.deepEqual(requests.map(route), ["GET /pipeline_schedules", "POST /pipeline_schedules"]);
  assert.deepEqual(requests[1].body, { description: "Agent M nightly", ref: "main", cron: "0 2 * * *", cron_timezone: "Europe/Berlin", active: true });
  for (const r of requests) {
    assert.equal(r.headers["private-token"], GL_TOKEN);
    assert.equal(r.href.includes(GL_TOKEN), false);
  }
  assert.deepEqual(result, { id: "100", url: PAGES });
  assert.equal(server.state.schedules.length, 1);
});

// TST-749002 · level: unit · module: MOD-repository-hosts
// guards: UC-027 (3a); GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab project whose server keeps what is created; the nightly schedule set once; then set again with the same description, another cron, timezone, ref and inactive
// input: setPipelineSchedule(the nightly schedule) twice; the second time with cron "30 3 * * 1", timezone "UTC", ref "release", active false
// expect: the second call sends one PUT to the first call's schedule and no POST; the server holds exactly one schedule, with the second call's fields; both calls answer the same id and the pipeline schedules page
test("setPipelineSchedule on GitLab — saving again updates the schedule and adds no second one", async () => {
  const server = gitlab();
  const first = await serving(server.answer, () => host().setPipelineSchedule(NIGHTLY));
  const again = await serving(server.answer, () => host().setPipelineSchedule({ ...NIGHTLY, cron: "30 3 * * 1", timezone: "UTC", ref: "release", active: false }));
  assert.equal(again.requests.some((r) => r.method === "POST"), false, "no schedule is created the second time");
  assert.deepEqual(again.requests.filter((r) => r.method === "PUT").map((r) => [r.path, r.body]),
    [["/pipeline_schedules/100", { ref: "release", cron: "30 3 * * 1", cron_timezone: "UTC", active: false }]]);
  assert.equal(server.state.schedules.length, 1);
  assert.deepEqual(server.state.schedules[0], { id: 100, description: "Agent M nightly", ref: "release", cron: "30 3 * * 1", cron_timezone: "UTC", active: false, variables: [] });
  assert.deepEqual(again.result, first.result);
  assert.deepEqual(again.result, { id: "100", url: PAGES });
});

// TST-749003 · level: unit · module: MOD-repository-hosts
// guards: UC-027 (3a)
// given: a GitLab project with 100 other schedules on the first page of its list, and the nightly one, with another description beside it, on the second
// input: setPipelineSchedule(the nightly schedule) with a changed cron
// expect: the nightly schedule on the second page is updated — one PUT to its id — and none is created; the other schedules are not touched
test("setPipelineSchedule on GitLab — the schedule is found by its description on any page of the list", async () => {
  const others = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, description: `Other ${i}`, ref: "main", cron: "0 1 * * *", cron_timezone: "UTC", active: true, variables: [] }));
  const server = gitlab([...others, { id: 500, description: "Agent M nightly", ref: "main", cron: "0 2 * * *", cron_timezone: "Europe/Berlin", active: true, variables: [] }]);
  const { result, requests } = await serving(server.answer, () => host().setPipelineSchedule({ ...NIGHTLY, cron: "15 4 * * *" }));
  assert.deepEqual(requests.filter((r) => r.method !== "GET").map(route), ["PUT /pipeline_schedules/500"]);
  assert.deepEqual(requests.filter((r) => r.path === "/pipeline_schedules").map((r) => r.page), ["1", "2"]);
  assert.equal(server.state.schedules.length, 101);
  assert.equal(server.state.schedules[100].cron, "15 4 * * *");
  assert.equal(result.id, "500");
});

// ---------------------------------------------------------------- variables

// TST-749004 · level: unit · module: MOD-repository-hosts
// guards: UC-027 (3a)
// given: a GitLab project with no pipeline schedule
// input: setPipelineSchedule(the nightly schedule with variables { SUITE: "nightly", RETRIES: "2" })
// expect: the schedule is created, then one POST of its variables for each — key and value —; the server holds the schedule with exactly those two variables
test("setPipelineSchedule on GitLab — the variables of a created schedule are created with it", async () => {
  const server = gitlab();
  const { requests } = await serving(server.answer, () => host().setPipelineSchedule({ ...NIGHTLY, variables: { SUITE: "nightly", RETRIES: "2" } }));
  assert.deepEqual(requests.filter((r) => r.path.endsWith("/variables")).map((r) => [route(r), r.body]),
    [["POST /pipeline_schedules/100/variables", { key: "SUITE", value: "nightly" }], ["POST /pipeline_schedules/100/variables", { key: "RETRIES", value: "2" }]]);
  assert.deepEqual(server.state.schedules[0].variables.map((v) => [v.key, v.value]), [["SUITE", "nightly"], ["RETRIES", "2"]]);
});

// TST-749005 · level: unit · module: MOD-repository-hosts
// guards: UC-027 (3a)
// given: a GitLab project whose nightly schedule has the variables SUITE "nightly", KEEP "1" and OLD "x"
// input: setPipelineSchedule(the nightly schedule with variables { SUITE: "full", KEEP: "1", NEW: "y" })
// expect: SUITE and KEEP, which the schedule has, are each set by a PUT (the key in the address), NEW is created by a POST, OLD is deleted by a DELETE; the server holds exactly SUITE "full", KEEP "1", NEW "y" and one schedule
test("setPipelineSchedule on GitLab — an update makes the variables those given", async () => {
  const server = gitlab([{ id: 7, description: "Agent M nightly", ref: "main", cron: "0 2 * * *", cron_timezone: "Europe/Berlin", active: true,
    variables: [{ key: "SUITE", value: "nightly", variable_type: "env_var" }, { key: "KEEP", value: "1", variable_type: "env_var" }, { key: "OLD", value: "x", variable_type: "env_var" }] }]);
  const { requests } = await serving(server.answer, () => host().setPipelineSchedule({ ...NIGHTLY, variables: { SUITE: "full", KEEP: "1", NEW: "y" } }));
  assert.deepEqual(requests.filter((r) => r.path.includes("/variables")).map(route).sort(),
    ["DELETE /pipeline_schedules/7/variables/OLD", "POST /pipeline_schedules/7/variables", "PUT /pipeline_schedules/7/variables/KEEP", "PUT /pipeline_schedules/7/variables/SUITE"]);
  assert.deepEqual(Object.fromEntries(server.state.schedules[0].variables.map((v) => [v.key, v.value])), { SUITE: "full", KEEP: "1", NEW: "y" });
  assert.equal(server.state.schedules.length, 1);
});

// ---------------------------------------------------------------- failures

// TST-749006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-027 (3a)
// given: a GitLab project that first lets the call through; then a server whose answer to the schedules read, and then to the creation, is 403 — the token has no role Maintainer
// input: setPipelineSchedule(the nightly schedule)
// expect: PermissionMissing at either request, naming the role Maintainer and the project's access tokens page as the renewal; for the refused creation nothing is stored
test("setPipelineSchedule on GitLab — a token without the role Maintainer is PermissionMissing", async () => {
  assert.ok((await serving(gitlab().answer, () => host().setPipelineSchedule(NIGHTLY))).result, "known positive");
  for (const refusedRoute of ["GET /pipeline_schedules", "POST /pipeline_schedules"]) {
    const server = gitlab();
    const refused = await serving((r) => (route(r) === refusedRoute ? json(403, { message: "403 Forbidden" }) : server.answer(r)), () => failure(host().setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "PermissionMissing", refusedRoute);
    assert.match(refused.result.permission, /Maintainer/);
    assert.equal(refused.result.renewal, "https://gitlab.example.org/space/sprint-tool/-/settings/access_tokens");
    assert.equal(server.state.schedules.length, 0, refusedRoute);
  }
});

// TST-749007 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab project with the nightly schedule, whose server answers 403 to the update (PUT) of it
// input: setPipelineSchedule(the nightly schedule)
// expect: PermissionMissing from the update as from the creation; the stored schedule is unchanged
test("setPipelineSchedule on GitLab — a refused update is PermissionMissing", async () => {
  const server = gitlab([{ id: 7, description: "Agent M nightly", ref: "main", cron: "0 2 * * *", cron_timezone: "Europe/Berlin", active: true, variables: [] }]);
  const refused = await serving((r) => (r.method === "PUT" ? json(403, { message: "403 Forbidden" }) : server.answer(r)), () => failure(host().setPipelineSchedule({ ...NIGHTLY, cron: "1 1 * * *" })));
  assert.equal(refused.result?.name, "PermissionMissing");
  assert.equal(server.state.schedules[0].cron, "0 2 * * *");
});

// TST-749008 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab project that answers 404 — GitLab's answer to a token that may not write to a project it hides — to the schedules read and then to the creation
// input: setPipelineSchedule(the nightly schedule)
// expect: PermissionMissing at either request, never NotFound (every request of the call is a write)
test("setPipelineSchedule on GitLab — a 404 is PermissionMissing, as for every write", async () => {
  for (const refusedRoute of ["GET /pipeline_schedules", "POST /pipeline_schedules"]) {
    const server = gitlab();
    const refused = await serving((r) => (route(r) === refusedRoute ? json(404, { message: "404 Project Not Found" }) : server.answer(r)), () => failure(host().setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "PermissionMissing", refusedRoute);
  }
});

// TST-749009 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab project whose server answers 401 to the schedules read, and then to the creation
// input: setPipelineSchedule(the nightly schedule)
// expect: TokenRefused naming the token as stored and the project's access tokens page, at either request
test("setPipelineSchedule on GitLab — a refused token is TokenRefused", async () => {
  for (const refusedRoute of ["GET /pipeline_schedules", "POST /pipeline_schedules"]) {
    const server = gitlab();
    const refused = await serving((r) => (route(r) === refusedRoute ? json(401, { message: "401 Unauthorized" }) : server.answer(r)),
      () => failure(connect(GITLAB, { token: GL_TOKEN, tokenName: "Sprint tool project token" }).setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "TokenRefused", refusedRoute);
    assert.equal(refused.result.tokenName, "Sprint tool project token");
    assert.equal(refused.result.renewal, "https://gitlab.example.org/space/sprint-tool/-/settings/access_tokens");
  }
});

// TST-749010 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a GitLab project whose server answers 429 to the schedules read, and then to the creation
// input: setPipelineSchedule(the nightly schedule)
// expect: RateLimited with the limit "account" (the request carried a token), never TokenRefused or PermissionMissing
test("setPipelineSchedule on GitLab — a used-up limit is RateLimited", async () => {
  for (const refusedRoute of ["GET /pipeline_schedules", "POST /pipeline_schedules"]) {
    const server = gitlab();
    const refused = await serving((r) => (route(r) === refusedRoute ? json(429, { message: "Retry later" }) : server.answer(r)), () => failure(host().setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "RateLimited", refusedRoute);
    assert.equal(refused.result.limit, "account");
  }
});

// TST-749011 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab project whose server answers 500, and a network that fails, to the schedules read and then to the creation
// input: setPipelineSchedule(the nightly schedule)
// expect: Unreachable in each case, giving the status or the network's reason; nothing is stored
test("setPipelineSchedule on GitLab — a server that does not serve and a network that fails are Unreachable", async () => {
  for (const [refusedRoute, answer] of [["GET /pipeline_schedules", () => json(500, { message: "Server error" })], ["POST /pipeline_schedules", () => json(500, { message: "Server error" })],
    ["GET /pipeline_schedules", () => { throw new TypeError("fetch failed"); }], ["POST /pipeline_schedules", () => { throw new TypeError("fetch failed"); }]]) {
    const server = gitlab();
    const refused = await serving((r) => (route(r) === refusedRoute ? answer() : server.answer(r)), () => failure(host().setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "Unreachable", refusedRoute);
    assert.match(refused.result.reason, /500|fetch failed/);
    assert.equal(server.state.schedules.length, 0);
  }
});

// ---------------------------------------------------------------- not supported

// TST-749012 · level: unit · module: MOD-repository-hosts
// guards: GITLAB PRODUCTS ARE SUPPORTED; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host for a GitHub repository with a token; one for a GitHub repository through a clone; a GitLab host with no token; a GitLab host through a clone with no token
// input: setPipelineSchedule(the nightly schedule)
// expect: NotSupported for each, with no request
test("setPipelineSchedule is NotSupported on GitHub, and on GitLab without a token, with no request", async () => {
  for (const candidate of [connect(GITHUB, { token: GH_TOKEN }), connect(GITHUB, { token: GH_TOKEN, clone: "/tmp/a-clone" }), connect(GITLAB), connect(GITLAB, { clone: "/tmp/a-clone" })]) {
    const refused = await serving(() => json(200, {}), () => failure(candidate.setPipelineSchedule(NIGHTLY)));
    assert.equal(refused.result?.name, "NotSupported");
    assert.equal(refused.requests.length, 0);
  }
});

// TST-749013 · level: unit · module: MOD-repository-hosts
// guards: GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab project and a host through a clone, with the project's token
// input: setPipelineSchedule(the nightly schedule)
// expect: the server's API creates the schedule, as for a host without a clone
test("setPipelineSchedule through a clone with a token reaches the server's API", async () => {
  const server = gitlab();
  const { result } = await serving(server.answer, () => connect(GITLAB, { token: GL_TOKEN, clone: "/tmp/a-clone" }).setPipelineSchedule(NIGHTLY));
  assert.deepEqual(result, { id: "100", url: PAGES });
  assert.equal(server.state.schedules.length, 1);
});

// ---------------------------------------------------------------- credentials, and arguments

// TST-749014 · level: unit · module: MOD-repository-hosts
// guards: NO SECRET IN THE REPOSITORY; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitLab host with the person's token and a configured secret; variables that hold the token, the secret, and neither
// input: setPipelineSchedule with each
// expect: clean variables create the schedule; a variable that holds the token or the secret is SecretRefused naming `variables.<key>`, with no request, and the failure's text does not repeat the value
test("setPipelineSchedule refuses a variable that holds a credential before any request", async () => {
  const SECRET = "s3cret-value-9f8e7d6c";
  const clean = await serving(gitlab().answer, () => host([SECRET]).setPipelineSchedule({ ...NIGHTLY, variables: { SUITE: "nightly" } }));
  assert.ok(clean.requests.length > 0, "known positive");
  for (const [key, value] of [["NOTE", `use ${GL_TOKEN} here`], ["OTHER", `x${SECRET}y`]]) {
    const refused = await serving(() => json(200, {}), () => failure(host([SECRET]).setPipelineSchedule({ ...NIGHTLY, variables: { SUITE: "nightly", [key]: value } })));
    assert.equal(refused.result?.name, "SecretRefused");
    assert.equal(refused.result.path, `variables.${key}`);
    assert.equal(refused.result.message.includes(GL_TOKEN) || refused.result.message.includes(SECRET), false);
    assert.equal(refused.requests.length, 0);
  }
});

// TST-749015 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitLab host with a token; arguments that are no schedule: none, an empty description, no cron, no ref, a timezone or active of the wrong kind, variables that are not texts
// input: setPipelineSchedule with each
// expect: a TypeError for each, with no request, saying that a schedule is named by its description, cron, timezone and ref, and that variables are texts
test("setPipelineSchedule refuses arguments that are no schedule", async () => {
  for (const bad of [undefined, null, { ...NIGHTLY, description: "" }, { ...NIGHTLY, cron: "" }, { ...NIGHTLY, ref: " " }, { ...NIGHTLY, timezone: 3 }, { ...NIGHTLY, active: "yes" },
    { ...NIGHTLY, variables: { N: 1 } }, { ...NIGHTLY, variables: ["a"] }]) {
    const refused = await serving(() => json(200, {}), () => failure(host().setPipelineSchedule(bad)));
    assert.ok(refused.result instanceof TypeError, JSON.stringify(bad));
    assert.match(refused.result.message, /setPipelineSchedule names|variables of a schedule are texts/, JSON.stringify(bad));
    assert.equal(refused.requests.length, 0);
  }
});
