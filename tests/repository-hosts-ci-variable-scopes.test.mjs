// MOD-repository-hosts' ciVariableScopes, as docs/architecture/MOD-repository-hosts.md states it: on a GitLab server, each CI/CD variable of the project by its name
// and environment scope, asked of the server's GraphQL API for those two fields alone, so that no value leaves the server; on GitHub and without a token
// NotSupported before any request. The GitLab server is a fake of `fetch` that answers POST /api/graphql as GitLab's GraphQL reference documents the query
// `project(fullPath:) { ciVariables(first:, after:) { nodes { … } pageInfo { hasNextPage endCursor } } }`: it answers the fields the query names, and nothing
// else, and `ciVariables: null` where the token may not read them (docs.gitlab.com/api/graphql, Authorization: "Query fields return `null` when you do not have
// permission to access a resource").
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
const GRAPHQL = "https://gitlab.example.org/api/graphql";
const VALUE_A = "sk-VALUE-OF-KEY-A-0123456789", VALUE_T = "glpat-VALUE-OF-THE-TOKEN-0123456789";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const request = { method: String(init.method ?? "GET").toUpperCase(), href: String(input),
      headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])),
      body: typeof init.body === "string" ? JSON.parse(init.body) : null };
    requests.push(request);
    return answer(request);
  };
  try { return { result: await run(), requests }; } catch (error) { return { error, requests }; } finally { globalThis.fetch = real; }
}
// The project's variables as the server keeps them, each with its value: AGENT_M_TOKEN scoped to agent-m-write, KEY_A to agent-m-key-KEY_A and to agent-m-write.
const KEPT = [{ key: "AGENT_M_TOKEN", value: VALUE_T, environmentScope: "agent-m-write" }, { key: "KEY_A", value: VALUE_A, environmentScope: "agent-m-key-KEY_A" },
  { key: "KEY_A", value: VALUE_A, environmentScope: "agent-m-write" }];
// The names a query asks for in the selection of a variable's node: the words between `nodes {` and its `}`.
const nodeFields = (query) => (/nodes\s*\{([^}]*)\}/.exec(query)?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
// A GraphQL server: pages of two nodes, the cursor the index of the next node; each node answers only the fields the query names. `refuse` answers ciVariables null.
const server = ({ refuse = false } = {}) => (r) => {
  if (r.method !== "POST" || r.href !== GRAPHQL) return json(404, { message: "404 Not found" });
  if (refuse) return json(200, { data: { project: { ciVariables: null } } });
  const fields = nodeFields(r.body.query), at = Number(r.body.variables.after ?? 0);
  const nodes = KEPT.slice(at, at + 2).map((variable) => Object.fromEntries(fields.map((field) => [field, variable[field]])));
  return json(200, { data: { project: { ciVariables: { nodes, pageInfo: { hasNextPage: at + 2 < KEPT.length, endCursor: String(at + 2) } } } } });
};

// TST-0125301 · level: unit · module: MOD-repository-hosts
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project whose variables are AGENT_M_TOKEN scoped to agent-m-write and KEY_A twice, scoped to agent-m-key-KEY_A and to agent-m-write, each kept with its value, its GraphQL API answering two of them to a page; the project's access token
// input: ciVariableScopes()
// expect: exactly [{ AGENT_M_TOKEN, agent-m-write }, { KEY_A, agent-m-key-KEY_A }, { KEY_A, agent-m-write }], read over two requests, the second after the cursor the first answered; each request a POST to the server's /api/graphql with the token in the header Authorization: Bearer and never in the address, its query asking for the project `space/sprint-tool` and for the node fields `key` and `environmentScope` alone — no `value` anywhere in the query —; no value in any answer nor in what it returns
test("ciVariableScopes on GitLab — each variable's name and scope, asked of GraphQL without its value, page after page", async () => {
  const { result, requests, error } = await serving(server(), () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes());
  assert.equal(error, undefined, error?.message);
  assert.deepEqual(result, [{ name: "AGENT_M_TOKEN", scope: "agent-m-write" }, { name: "KEY_A", scope: "agent-m-key-KEY_A" }, { name: "KEY_A", scope: "agent-m-write" }]);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests.map((r) => r.body.variables.after ?? null), [null, "2"]);
  for (const r of requests) {
    assert.equal(`${r.method} ${r.href}`, `POST ${GRAPHQL}`);
    assert.ok(!r.href.includes(GL_TOKEN));
    assert.equal(r.headers.authorization, `Bearer ${GL_TOKEN}`);
    assert.equal(r.body.variables.path, "space/sprint-tool");
    assert.deepEqual(nodeFields(r.body.query), ["key", "environmentScope"]);
    assert.ok(!/\bvalue\b/.test(r.body.query), r.body.query);
  }
  assert.ok(!JSON.stringify(result).includes(VALUE_A) && !JSON.stringify(result).includes(VALUE_T), "no value is returned");
  const asked = await server()({ method: "POST", href: GRAPHQL, body: { query: "query { project { ciVariables { nodes { key value } } } }", variables: {} } }).json();
  assert.ok(JSON.stringify(asked).includes(VALUE_T), "known positive: the fake answers a value where a query asks for it");
});

// TST-0125302 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the same project first answering, then a server that answers ciVariables null — the token may not read them —; a GitHub repository with a token; the GitLab project without a token
// input: ciVariableScopes() on each
// expect: the known positive lists the variables; then PermissionMissing naming the role Maintainer; on GitHub NotSupported, and without a token NotSupported, each before any request
test("ciVariableScopes — a token that may not read the variables is PermissionMissing; GitHub and a missing token are NotSupported before any request", async () => {
  assert.equal((await serving(server(), () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes())).result.length, 3, "known positive");
  const refused = await serving(server({ refuse: true }), () => connect(GITLAB, { token: GL_TOKEN }).ciVariableScopes());
  assert.equal(refused.error?.name, "PermissionMissing");
  assert.match(refused.error.message, /Maintainer/);
  for (const host of [connect(GITHUB, { token: "github_pat_CAROLsprintTOOL0123456789abcdef" }), connect(GITLAB, {})]) {
    const { error, requests } = await serving(server(), () => host.ciVariableScopes());
    assert.equal(error?.name, "NotSupported");
    assert.equal(requests.length, 0);
  }
});
