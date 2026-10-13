// MOD-repository-hosts' createBranch — a branch at a commit, through GitHub's and GitLab's REST APIs, as the accepted text of
// docs/architecture/MOD-repository-hosts.md states it: "createBranch(name: string, from: string) -> Promise<void> — a branch
// at a commit. Crosses the network; fails with TokenRefused, PermissionMissing, RateLimited, Unreachable, or NotSupported
// without a token." A branch that stands already is left where it stands: its creation fails with none of these, and the
// branch is never moved. Deterministic, no network: the servers are fakes of `fetch` answering as the real APIs document —
// GitHub: "Create a reference" (POST /repos/{owner}/{repo}/git/refs, { ref: "refs/heads/<name>", sha }), 201, and 422
// "Reference already exists" for a reference that stands (docs.github.com/en/rest/git/refs); GitLab: "Create repository
// branch" (POST /projects/:id/repository/branches, branch and ref), 201, and 400 "Branch already exists"
// (docs.gitlab.com/ee/api/branches.html).
// Run: node --test tests/repository-hosts-branches.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GL_API = "https://gitlab.example.org/api/v4/projects/space%2Fsprint-tool";
const HEAD = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

// One request as the server sees it: method, address, headers in lower case, JSON body.
function seen(input, init = {}) {
  const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
  const raw = init.headers ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries())
    : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? "GET").toUpperCase(), href: url.href, headers,
    body: typeof init.body === "string" ? JSON.parse(init.body) : null };
}
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Runs `run` with a fake fetch that records each request and answers it with `answer(request)`.
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init) => { const r = seen(input, init); requests.push(r); return answer(r); };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

// TST-472519 · level: unit · module: MOD-repository-hosts
// guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub repository and the person's token; the server creates the reference
// input: createBranch("sprint/team1/01", HEAD)
// expect: one request — POST to the repository's git/refs, with refs/heads/sprint/team1/01 and HEAD, the token as a Bearer header —, and nothing returned
test("createBranch on GitHub — one request creates refs/heads/<name> at the commit, with the token", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { result, requests } = await serving(() => json(201, { ref: "refs/heads/sprint/team1/01", object: { sha: HEAD } }),
    () => host.createBranch("sprint/team1/01", HEAD));
  assert.equal(result, undefined);
  assert.deepEqual(requests.map((r) => [r.method, r.href, r.body]),
    [["POST", "https://api.github.com/repos/carol/sprint-tool/git/refs", { ref: "refs/heads/sprint/team1/01", sha: HEAD }]]);
  assert.equal(requests[0].headers.authorization, `Bearer ${GH_TOKEN}`);
});

// TST-472520 · level: unit · module: MOD-repository-hosts
// guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project and its access token; the server creates the branch
// input: createBranch("sprint/team1/01", HEAD)
// expect: one request — POST to the project's repository/branches, with the branch and HEAD as its ref, the token in PRIVATE-TOKEN —, and nothing returned
test("createBranch on GitLab — one request creates the branch at the commit, with the project's token", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests } = await serving(() => json(201, { name: "sprint/team1/01", commit: { id: HEAD } }),
    () => host.createBranch("sprint/team1/01", HEAD));
  assert.equal(result, undefined);
  assert.deepEqual(requests.map((r) => [r.method, r.href, r.body]),
    [["POST", `${GL_API}/repository/branches`, { branch: "sprint/team1/01", ref: HEAD }]]);
  assert.equal(requests[0].headers["private-token"], GL_TOKEN);
});

// TST-472521 · level: unit · module: MOD-repository-hosts
// guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
// given: the branch stands already — GitHub answers 422 "Reference already exists", GitLab 400 "Branch already exists"
// input: createBranch("sprint/team1/01", HEAD) on each
// expect: no failure, and no further request: the branch is left where it stands, never moved
test("createBranch — a branch that stands already is left where it stands", async () => {
  const gh = await serving(() => json(422, { message: "Reference already exists" }),
    () => connect(GITHUB, { token: GH_TOKEN }).createBranch("sprint/team1/01", HEAD));
  assert.equal(gh.result, undefined);
  assert.equal(gh.requests.length, 1);
  const gl = await serving(() => json(400, { message: "Branch already exists" }),
    () => connect(GITLAB, { token: GL_TOKEN }).createBranch("sprint/team1/01", HEAD));
  assert.equal(gl.result, undefined);
  assert.equal(gl.requests.length, 1);
});

// TST-472522 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host connected without a token; and hosts whose server answers 401, 403, and 422 for another reason
// input: createBranch("sprint/team1/01", HEAD)
// expect: NotSupported without a token, with no request made; TokenRefused for 401; PermissionMissing for 403; for any other refusal the host's own failure — never success
test("createBranch — without a token it is not supported; a refused token or a missing permission is named", async () => {
  const none = await serving(() => json(500, {}), () => failure(connect(GITHUB, {}).createBranch("sprint/team1/01", HEAD)));
  assert.equal(none.result?.name, "NotSupported");
  assert.equal(none.requests.length, 0);
  for (const [status, name] of [[401, "TokenRefused"], [403, "PermissionMissing"]]) {
    const gh = await serving(() => json(status, { message: "no" }),
      () => failure(connect(GITHUB, { token: GH_TOKEN }).createBranch("sprint/team1/01", HEAD)));
    assert.equal(gh.result?.name, name, `GitHub ${status}`);
    const gl = await serving(() => json(status, { message: "no" }),
      () => failure(connect(GITLAB, { token: GL_TOKEN }).createBranch("sprint/team1/01", HEAD)));
    assert.equal(gl.result?.name, name, `GitLab ${status}`);
  }
  const invalid = await serving(() => json(422, { message: "Invalid request: sha is not a commit" }),
    () => failure(connect(GITHUB, { token: GH_TOKEN }).createBranch("sprint/team1/01", HEAD)));
  assert.ok(invalid.result instanceof Error && invalid.result.name !== "NotSupported", String(invalid.result));
});

// TST-472523 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a connected host
// input: createBranch with an empty name, and with a commit that is no commit
// expect: a TypeError each, before any request
test("createBranch — a branch is named and stands at a commit", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { requests } = await serving(() => json(201, {}), async () => {
    await assert.rejects(() => host.createBranch("", HEAD), TypeError);
    await assert.rejects(() => host.createBranch("sprint/team1/01", "main"), TypeError);
  });
  assert.equal(requests.length, 0);
});
