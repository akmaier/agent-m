// MOD-repository-hosts' ciVariableScopes, as docs/architecture/MOD-repository-hosts.md states it: on a GitLab server, each CI/CD variable of the project by its name
// and environment scope, never its value; on GitHub and without a token NotSupported before any request. The GitLab server is a fake of `fetch` that answers as
// GitLab's "Project-level CI/CD variables API" documents "List project variables" (docs.gitlab.com/api/project_level_variables/: GET /projects/:id/variables,
// paged, each variable with its key, value and environment_scope, among other fields).
// Run: node --test tests/repository-hosts-ci-variable-scopes.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: unit
//
// Each test states its input and its expected result before it runs; where a test asserts a refusal, the same call is first shown to succeed.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GL_API = "https://gitlab.example.org/api/v4/projects/space%2Fsprint-tool";
const VALUE_A = "sk-VALUE-OF-KEY-A-0123456789", VALUE_T = "glpat-VALUE-OF-THE-TOKEN-0123456789";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const request = { method: String(init.method ?? "GET").toUpperCase(), path: url.href.replace(GL_API, "").replace(/\?.*$/, ""), href: url.href, page: url.searchParams.get("page"),
      headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])) };
    requests.push(request);
    return answer(request);
  };
  try { return { result: await run(), requests }; } catch (error) { return { error, requests }; } finally { globalThis.fetch = real; }
}
// The project's variables as the server lists them: the token scoped to agent-m-write, KEY_A to its environment and to agent-m-write, each with its value.
const LISTED = [
  { variable_type: "env_var", key: "AGENT_M_TOKEN", value: VALUE_T, protected: false, masked: true, hidden: false, raw: false, environment_scope: "agent-m-write", description: null },
  { variable_type: "env_var", key: "KEY_A", value: VALUE_A, protected: false, masked: true, hidden: false, raw: false, environment_scope: "agent-m-key-KEY_A", description: null },
  { variable_type: "env_var", key: "KEY_A", value: VALUE_A, protected: false, masked: true, hidden: false, raw: false, environment_scope: "agent-m-write", description: null },
];
const variables = (r) => (r.method === "GET" && r.path === "/variables" ? json(200, r.page === "1" ? LISTED : []) : json(404, { message: "404 Not found" }));

// TST-0125301 · level: unit · module: MOD-repository-hosts
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project whose variables are AGENT_M_TOKEN scoped to agent-m-write and KEY_A twice, scoped to agent-m-key-KEY_A and to agent-m-write, each listed with its value; the project's access token
// input: ciVariableScopes()
// expect: exactly [{ AGENT_M_TOKEN, agent-m-write }, { KEY_A, agent-m-key-KEY_A }, { KEY_A, agent-m-write }]; no value in what it returns; every request a GET of the project's /variables on its own server with the token in the header PRIVATE-TOKEN, never in the address
test("ciVariableScopes on GitLab — each variable's name and scope, never its value", async () => {
  const { result, requests } = await serving(variables, () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes());
  assert.deepEqual(result, [{ name: "AGENT_M_TOKEN", scope: "agent-m-write" }, { name: "KEY_A", scope: "agent-m-key-KEY_A" }, { name: "KEY_A", scope: "agent-m-write" }]);
  assert.ok(!JSON.stringify(result).includes(VALUE_A) && !JSON.stringify(result).includes(VALUE_T), "no value is returned");
  assert.ok(requests.length > 0);
  for (const r of requests) {
    assert.equal(`${r.method} ${r.path}`, "GET /variables");
    assert.ok(r.href.startsWith(`${GL_API}/variables`) && !r.href.includes(GL_TOKEN), r.href);
    assert.equal(r.headers["private-token"], GL_TOKEN);
  }
});

// TST-0125302 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the same project first answering, then a server that answers the list 403 — the token has no role Maintainer —; a GitHub repository with a token; the GitLab project without a token
// input: ciVariableScopes() on each
// expect: the known positive lists the variables; then PermissionMissing naming the role Maintainer; on GitHub NotSupported, and without a token NotSupported, each before any request
test("ciVariableScopes — a token without the role Maintainer is PermissionMissing; GitHub and a missing token are NotSupported before any request", async () => {
  assert.equal((await serving(variables, () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes())).result.length, 3, "known positive");
  const refused = await serving(() => json(403, { message: "403 Forbidden" }), () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes());
  assert.equal(refused.error?.name, "PermissionMissing");
  assert.match(refused.error.message, /Maintainer/);
  for (const host of [connect(GITHUB, { token: "github_pat_CAROLsprintTOOL0123456789abcdef" }), connect(GITLAB, {})]) {
    const { error, requests } = await serving(variables, () => host.ciVariableScopes());
    assert.equal(error?.name, "NotSupported");
    assert.equal(requests.length, 0);
  }
});
