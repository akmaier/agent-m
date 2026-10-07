// The tags of a repository (src/repository-hosts/) — MOD-repository-hosts' listTags and createTag: the tags of a
// repository with their commits, optionally only those matching a pattern such as "v*"; a tag set on a commit, never
// moved (ITM-247). Deterministic, no network: the servers are fakes of `fetch` that answer as GitHub's REST API and
// GitLab's REST API v4 answer for these two endpoints — the recorded responses below —; no request leaves the process.
//
// Module: MOD-repository-hosts
// Guards: A VERSION IS NOT REWRITTEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-013
// Level: unit
//
// The answers are the ones GitHub's REST API documents: "List repository tags" (per_page up to 100; each item
// { name, commit: { sha } }); "Create a reference" (POST git/refs — 201 on success, 409 "Reference already exists" when
// the ref stands already, per its HTTP response codes table: 201, 409, 422); "Get a reference" (docs.github.com/en/rest/
// git/refs, read 2026-10-07). And GitLab's REST API v4: "List project repository tags" and "Get a single repository tag"
// (docs.gitlab.com/api/tags, read 2026-10-07), and "Create a new tag" — a failed create always answers 400
// (gitlab-org/gitlab lib/api/tags.rb, POST ':id/repository/tags': `render_api_error!(result[:message], 400)`), with the
// message "Tag <name> already exists" when the tag stands already (app/services/tags/create_service.rb, read
// 2026-10-07) — the Tags API doc page's own generic "errors return 405" line does not describe this endpoint.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect, HostError } from "../src/repository-hosts/index.mjs";

// ---------------------------------------------------------------- the fake servers

// One request as a server sees it: method, address, headers with their names in lower case, and the JSON body.
function seen(input, init = {}) {
  const isRequest = typeof input === "object" && !(input instanceof URL);
  const url = new URL(isRequest ? input.url : String(input));
  const raw = init.headers ?? (isRequest ? input.headers : {}) ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries())
    : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  let body = null;
  if (typeof init.body === "string") { try { body = JSON.parse(init.body); } catch { body = init.body; } }
  return { method: String(init.method ?? (isRequest ? input.method : "GET")).toUpperCase(), url, href: url.href,
    origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), headers, body };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status,
  headers: { "Content-Type": "application/json", ...headers } });

// Runs `run` with `fetchFn` in place of the platform's fetch.
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
// The failure a promise ends in, or null when it does not fail.
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

const GH_WEB = "https://github.com/alice/thesis-tool";
const GH_API = "https://api.github.com";
const GH_TOKEN = "github_pat_ALICEthesisTOOL0123456789abcdef";
const GH_TOKENS = "https://github.com/settings/personal-access-tokens";

const GL_ORIGIN = "https://gitlab.example.org";
const GL_WEB = `${GL_ORIGIN}/grp/sub/thesis-tool`;
const GL_API = `${GL_ORIGIN}/api/v4/projects/grp%2Fsub%2Fthesis-tool`;
const GL_TOKEN = "glpat-TEAMthesisTOOLvalue0123456789";
const GL_TOKENS = `${GL_WEB}/-/settings/access_tokens`;

const GITHUB = parseAddress(GH_WEB);
const GITLAB = parseAddress(GL_WEB);

// GitHub, one repository, its tags: name -> commit sha. "List repository tags" (per_page, page); "Create a reference"
// (POST git/refs { ref: "refs/tags/<name>", sha }) — 409 when the ref stands already; "Get a reference"
// (GET git/ref/tags/<name>) reads it back.
function fakeGitHubTags({ tags = {} } = {}) {
  const refs = new Map(Object.entries(tags));
  const requests = [];
  const prefix = "/repos/alice/thesis-tool";
  const server = { requests, refs };
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const auth = r.headers.authorization ?? null;
    if (auth !== null && auth !== `Bearer ${GH_TOKEN}`) return json(401, { message: "Bad credentials", status: "401" });
    if (r.origin !== GH_API || !r.path.startsWith(prefix)) return json(404, { message: "Not Found" });
    const rest = r.path.slice(prefix.length);
    let m;
    if (r.method === "GET" && rest === "/tags") {
      const per = Number(r.query.per_page ?? 30), page = Number(r.query.page ?? 1);
      const names = [...refs.keys()];
      return json(200, names.slice((page - 1) * per, page * per).map((name) => ({ name, commit: { sha: refs.get(name) } })));
    }
    if (r.method === "POST" && rest === "/git/refs") {
      const ref = r.body?.ref ?? "", name = ref.replace(/^refs\/tags\//, "");
      if (!ref.startsWith("refs/tags/") || !name) return json(422, { message: "Invalid request" });
      if (refs.has(name)) return json(409, { message: "Reference already exists" });
      refs.set(name, r.body.sha);
      return json(201, { ref, object: { type: "commit", sha: r.body.sha } });
    }
    if (r.method === "GET" && (m = /^\/git\/ref\/tags\/(.+)$/.exec(rest))) {
      const name = decodeURIComponent(m[1]);
      return refs.has(name) ? json(200, { ref: `refs/tags/${name}`, object: { type: "commit", sha: refs.get(name) } })
        : json(404, { message: "Not Found" });
    }
    return json(404, { message: "Not Found" });
  };
  return server;
}

// A GitLab server, one project, its tags: name -> commit sha (ref and the commit the tag resolves to are the same here, a
// lightweight tag). "List project repository tags" (per_page, page); "Create a new tag"
// (POST repository/tags { tag_name, ref }) — 400 "Tag <name> already exists" when it stands already; "Get a single
// repository tag" (GET repository/tags/<name>) reads it back.
function fakeGitLabTags({ tags = {} } = {}) {
  const store = new Map(Object.entries(tags));
  const requests = [];
  const prefix = "/api/v4/projects/grp%2Fsub%2Fthesis-tool";
  const server = { requests, tags: store };
  const entry = (name) => ({ name, target: store.get(name), message: null, commit: { id: store.get(name), short_id: store.get(name).slice(0, 8) } });
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const token = r.headers["private-token"] ?? null;
    if (token !== null && token !== GL_TOKEN) return json(401, { message: "401 Unauthorized" });
    if (r.origin !== GL_ORIGIN || !r.path.startsWith(prefix)) return json(404, { error: "404 Not Found" });
    const rest = r.path.slice(prefix.length);
    let m;
    if (r.method === "GET" && rest === "/repository/tags") {
      const per = Number(r.query.per_page ?? 20), page = Number(r.query.page ?? 1);
      const names = [...store.keys()];
      return json(200, names.slice((page - 1) * per, page * per).map(entry));
    }
    if (r.method === "POST" && rest === "/repository/tags") {
      const { tag_name: name, ref } = r.body ?? {};
      if (store.has(name)) return json(400, { message: `Tag ${name} already exists` });
      store.set(name, ref);
      return json(201, entry(name));
    }
    if (r.method === "GET" && (m = /^\/repository\/tags\/([^/]+)$/.exec(rest))) {
      const name = decodeURIComponent(m[1]);
      return store.has(name) ? json(200, entry(name)) : json(404, { message: "404 Tag Not Found" });
    }
    return json(404, { error: "404 Not Found" });
  };
  return server;
}

// ---------------------------------------------------------------- listTags

// MOD-repository-hosts listTags — Expected: every tag of the repository with its commit, read across as many pages as the
// server answers in (more than one here), in one list; given a pattern such as "v*", only the tags whose name matches it.
// On GitHub and on a GitLab server alike, read with the token of that server only (A TOKEN GOES ONLY TO THE SERVER THAT
// ISSUED IT).
test("listTags — every tag with its commit, across more than one page, and only those of a pattern", async () => {
  const tags = {};
  for (let i = 0; i < 130; i++) tags[i % 2 === 0 ? `v2026.${i}.0` : `draft-${i}`] = String(i + 1).padStart(40, "0");
  const names = Object.keys(tags);

  const gh = fakeGitHubTags({ tags });
  const allGh = await using(gh.fetch, () => connect(GITHUB, { token: GH_TOKEN }).listTags());
  assert.deepEqual(allGh.map((t) => t.name).sort(), names.sort(), "every tag, across pages");
  for (const t of allGh) assert.equal(t.commit, tags[t.name], `${t.name}: its commit`);
  assert.ok(gh.requests.filter((r) => r.path.endsWith("/tags")).length >= 2, "known positive: more than one page was requested");
  const vOnlyGh = await using(gh.fetch, () => connect(GITHUB, { token: GH_TOKEN }).listTags("v*"));
  assert.deepEqual(vOnlyGh.map((t) => t.name).sort(), names.filter((n) => n.startsWith("v")).sort(), "GitHub: only the pattern");
  for (const r of gh.requests) {
    assert.equal(r.origin, GH_API, r.href);
    assert.equal(r.headers.authorization, `Bearer ${GH_TOKEN}`, r.href);
    assert.ok(!("private-token" in r.headers), "no GitLab token header");
  }

  const gl = fakeGitLabTags({ tags });
  const allGl = await using(gl.fetch, () => connect(GITLAB, { token: GL_TOKEN }).listTags());
  assert.deepEqual(allGl.map((t) => t.name).sort(), names.sort(), "every tag, across pages");
  for (const t of allGl) assert.equal(t.commit, tags[t.name], `${t.name}: its commit`);
  assert.ok(gl.requests.filter((r) => r.path.endsWith("/repository/tags")).length >= 2, "known positive: more than one page");
  const vOnlyGl = await using(gl.fetch, () => connect(GITLAB, { token: GL_TOKEN }).listTags("v*"));
  assert.deepEqual(vOnlyGl.map((t) => t.name).sort(), names.filter((n) => n.startsWith("v")).sort(), "GitLab: only the pattern");
  for (const r of gl.requests) {
    assert.equal(r.headers["private-token"], GL_TOKEN, r.href);
    assert.ok(!("authorization" in r.headers), "no GitHub token header");
  }
});

// ---------------------------------------------------------------- createTag

// MOD-repository-hosts createTag — Expected: a tag is set on exactly the commit named, through the server's own API only
// (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT) — on GitHub a ref refs/tags/<name>, on a GitLab server a project tag.
test("createTag — a tag set on the commit named, through the server's own API only", async () => {
  const COMMIT = "a".repeat(40);

  const gh = fakeGitHubTags({});
  await using(gh.fetch, () => connect(GITHUB, { token: GH_TOKEN }).createTag("v2026.1.0", COMMIT));
  assert.equal(gh.refs.get("v2026.1.0"), COMMIT, "set on the commit named");
  assert.ok(gh.requests.length > 0, "known positive: a request was made");
  for (const r of gh.requests) {
    assert.equal(r.origin, GH_API, r.href);
    assert.equal(r.headers.authorization, `Bearer ${GH_TOKEN}`, r.href);
    assert.ok(!("private-token" in r.headers), "no GitLab token header");
  }

  const gl = fakeGitLabTags({});
  await using(gl.fetch, () => connect(GITLAB, { token: GL_TOKEN }).createTag("v2026.1.0", COMMIT));
  assert.equal(gl.tags.get("v2026.1.0"), COMMIT, "set on the commit named");
  assert.ok(gl.requests.length > 0, "known positive: a request was made");
  for (const r of gl.requests) {
    assert.equal(r.headers["private-token"], GL_TOKEN, r.href);
    assert.ok(!("authorization" in r.headers), "no GitHub token header");
  }
});

// ---------------------------------------------------------------- A VERSION IS NOT REWRITTEN

// A VERSION IS NOT REWRITTEN — Expected: createTag on a name that already stands, naming a different commit, is refused
// with TagExists, naming the commit the tag already stands on; the tag is never moved — on GitHub and on a GitLab server.
test("A VERSION IS NOT REWRITTEN — an existing tag is refused with TagExists naming its commit, and never moved", async () => {
  const FIRST = "a".repeat(40), SECOND = "b".repeat(40);

  const gh = fakeGitHubTags({ tags: { "v2026.1.0": FIRST } });
  const e = await using(gh.fetch, () => failure(connect(GITHUB, { token: GH_TOKEN }).createTag("v2026.1.0", SECOND)));
  assert.ok(e instanceof HostError, `a HostError, not ${e}`);
  assert.deepEqual([e.name, e.commit], ["TagExists", FIRST], "named, on its commit");
  assert.equal(gh.refs.get("v2026.1.0"), FIRST, "not moved");

  const gl = fakeGitLabTags({ tags: { "v2026.1.0": FIRST } });
  const f = await using(gl.fetch, () => failure(connect(GITLAB, { token: GL_TOKEN }).createTag("v2026.1.0", SECOND)));
  assert.ok(f instanceof HostError, `a HostError, not ${f}`);
  assert.deepEqual([f.name, f.commit], ["TagExists", FIRST], "named, on its commit");
  assert.equal(gl.tags.get("v2026.1.0"), FIRST, "not moved");
});

// ---------------------------------------------------------------- how listTags and createTag fail

// A REMOTE INTERFACE NAMES HOW IT FAILS — Expected: listTags and createTag fail like every other call of the host: a 401
// is TokenRefused, naming the token stored under its name and the page where it is renewed; a 403 without a used-up
// limit's headers is PermissionMissing; a 403 (GitHub) or 429 (GitLab) with them is RateLimited, never the token — on
// GitHub and on a GitLab server, for both functions, the token sent only to the server that issued it.
test("listTags and createTag fail as every call of the host does: TokenRefused, PermissionMissing, RateLimited", async () => {
  const calls = [(h) => h.listTags(), (h) => h.createTag("v2026.1.0", "a".repeat(40))];
  for (const call of calls) {
    const sentGh = [];
    const refusedGh = await using(async (u, i) => { sentGh.push(seen(u, i)); return json(401, { message: "Bad credentials" }); },
      () => failure(call(connect(GITHUB, { token: GH_TOKEN, tokenName: "Agent M · alice/thesis-tool" }))));
    assert.deepEqual([refusedGh?.name, refusedGh?.tokenName, refusedGh?.renewal], ["TokenRefused", "Agent M · alice/thesis-tool", GH_TOKENS]);
    assert.ok(sentGh.every((r) => r.headers.authorization === `Bearer ${GH_TOKEN}` && !("private-token" in r.headers)), "the GitHub token only");

    const deniedGh = await using(async () => json(403, { message: "Resource not accessible by personal access token" }),
      () => failure(call(connect(GITHUB, { token: GH_TOKEN }))));
    assert.equal(deniedGh?.name, "PermissionMissing");

    const limitedGh = await using(async () => json(403, { message: "API rate limit exceeded for user ID 1." },
      { "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1790000000" }),
      () => failure(call(connect(GITHUB, { token: GH_TOKEN }))));
    assert.deepEqual([limitedGh?.name, limitedGh?.limit], ["RateLimited", "account"]);

    const sentGl = [];
    const refusedGl = await using(async (u, i) => { sentGl.push(seen(u, i)); return json(401, { message: "401 Unauthorized" }); },
      () => failure(call(connect(GITLAB, { token: GL_TOKEN, tokenName: "GitLab project token" }))));
    assert.deepEqual([refusedGl?.name, refusedGl?.tokenName, refusedGl?.renewal], ["TokenRefused", "GitLab project token", GL_TOKENS]);
    assert.ok(sentGl.every((r) => r.headers["private-token"] === GL_TOKEN && !("authorization" in r.headers)), "the GitLab token only");

    const deniedGl = await using(async () => json(403, { message: "403 Forbidden" }), () => failure(call(connect(GITLAB, { token: GL_TOKEN }))));
    assert.equal(deniedGl?.name, "PermissionMissing");

    const limitedGl = await using(async () => json(429, { message: "Retry later" }), () => failure(call(connect(GITLAB, { token: GL_TOKEN }))));
    assert.equal(limitedGl?.name, "RateLimited");
  }
});
