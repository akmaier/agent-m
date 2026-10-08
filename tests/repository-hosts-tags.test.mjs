// MOD-repository-hosts' listTags and createTag (ITM-247) — through GitHub's and GitLab's REST APIs: the tags of a repository
// with their commits, every one of them across however many pages the server answers in, optionally only those matching a
// pattern such as "v*" among all of them; and a tag set on a commit, never moved, an existing tag refused with TagExists
// naming its commit. Deterministic, no network: the servers are fakes of `fetch` that answer only the tag-related requests
// this item needs, as the real APIs document and answer, at most 100 tags a page, naming the next page —
// GitHub: "List repository tags" (GET /repos/{owner}/{repo}/tags, per_page up to 100, the next page in the Link response
// header, rel="next"), "Get a reference" (GET .../git/ref/{ref}), "Create a reference" (POST .../git/refs) — an existing
// reference answered with 422 "Reference already exists", never 409 (github.com/orgs/community/discussions/72695, read
// 2026-10-07; docs.github.com/en/rest/git/refs, read 2026-10-07).
// GitLab: "List project repository tags" (GET .../repository/tags, per_page up to 100, the next page named in the
// X-Next-Page response header, as the module's own snapshot already reads a project's tree), "Get a single repository tag"
// (GET .../repository/tags/:tag_name), "Create a new tag" (POST .../repository/tags) — an existing tag answered with 400
// "Tag <name> already exists" (docs.gitlab.com/ee/api/tags.html, read 2026-10-07; and
// docs/gates/20261007-1404-development-release-testing-a0e7.md).
// The second page: docs/gates/20261007-1615-development-release-testing-8078.md — a repository with more than 100 tags.
//
// Module: MOD-repository-hosts
// Guards: A RELEASE IS TAGGED AND LOGGED; A VERSION IS NOT REWRITTEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; UC-013
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect, HostError } from "../src/repository-hosts/index.mjs";

// ---------------------------------------------------------------- the fake servers

// One request as a server sees it: method, address, headers with their names in lower case, the query, and the JSON body.
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
const sortByName = (tags) => [...tags].sort((a, b) => (a.name < b.name ? -1 : 1));

const GH_WEB = "https://github.com/carol/release-tool";
const GH_API = "https://api.github.com";
const GH_PREFIX = "/repos/carol/release-tool";
const GH_TOKEN = "github_pat_CAROLreleaseTOOL0123456789abcdef";
const GH_TOKENS = "https://github.com/settings/personal-access-tokens";

const GL_ORIGIN = "https://gitlab.example.org";
const GL_WEB = `${GL_ORIGIN}/space/release-tool`;
const GL_PREFIX = "/api/v4/projects/space%2Frelease-tool";
const GL_API = `${GL_ORIGIN}${GL_PREFIX}`;
const GL_TOKEN = "glpat-SPACEreleaseTOOLvalue0123456789";
const GL_TOKENS = `${GL_WEB}/-/settings/access_tokens`;

const GITHUB = parseAddress(GH_WEB);
const GITLAB = parseAddress(GL_WEB);

// A GitHub repository with the tags given, { name: commit }, in the order listed — the order "List repository tags" answers
// them in, at most 100 a page, the next page named in the Link response header (rel="next"), as GitHub does; no Link header
// on the last page. answer(request): a canned answer in place of the usual one, for every request — used to inject a
// refused token, a missing permission or a used-up rate limit.
function fakeGitHub({ tags = {}, answer = null } = {}) {
  const requests = [];
  const store = new Map(Object.entries(tags));
  const notFound = () => json(404, { message: "Not Found", documentation_url: "https://docs.github.com/rest", status: "404" });
  const server = { requests, tag: (name) => store.get(name) ?? null };
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const own = answer?.(r);
    if (own) return own;
    const auth = r.headers.authorization ?? null;
    if (auth !== null && auth !== `Bearer ${GH_TOKEN}`) return json(401, { message: "Bad credentials", status: "401" });
    if (r.origin !== GH_API || !r.path.startsWith(GH_PREFIX)) return notFound();
    const rest = r.path.slice(GH_PREFIX.length);
    let m;
    // "List repository tags": name, and commit.sha — GitHub dereferences an annotated tag to its commit already. At most 100
    // a page; the Link header names the next page, absent on the last one (the pagination this item's second gate found
    // missing: docs/gates/20261007-1615-development-release-testing-8078.md).
    if (r.method === "GET" && rest === "/tags") {
      const all = [...store.entries()];
      const per = Math.min(100, Number(r.query.per_page ?? 30)), page = Number(r.query.page ?? 1);
      const slice = all.slice((page - 1) * per, page * per);
      const headers = page * per < all.length
        ? { Link: `<${GH_API}${GH_PREFIX}/tags?per_page=${per}&page=${page + 1}>; rel="next"` } : {};
      return json(200, slice.map(([name, commit]) => ({ name, commit: { sha: commit, url: `${GH_API}${GH_PREFIX}/commits/${commit}` } })), headers);
    }
    // "Get a reference" at tags/{name}.
    if (r.method === "GET" && (m = /^\/git\/ref\/tags\/(.+)$/.exec(rest))) {
      const name = decodeURIComponent(m[1]), commit = store.get(name);
      return commit ? json(200, { ref: `refs/tags/${name}`, object: { sha: commit, type: "commit" } }) : notFound();
    }
    // "Create a reference" — an existing one answered with 422 "Reference already exists", never 409 (the real behaviour the
    // first gate found missing: github.com/orgs/community/discussions/72695).
    if (r.method === "POST" && rest === "/git/refs") {
      const m2 = /^refs\/tags\/(.+)$/.exec(r.body?.ref ?? "");
      if (!m2) return json(422, { message: "Invalid request. \"ref\" wasn't supplied.", status: "422" });
      const name = m2[1];
      if (store.has(name)) {
        return json(422, { message: "Reference already exists", documentation_url: "https://docs.github.com/rest/git/refs#create-a-reference" });
      }
      store.set(name, r.body.sha);
      return json(201, { ref: `refs/tags/${name}`, object: { sha: r.body.sha, type: "commit" } });
    }
    return notFound();
  };
  return server;
}

// A GitLab project with the tags given, { name: commit }, in the order listed. "List project repository tags" pages them at
// most 100 a page, naming the next page in X-Next-Page (empty on the last page) — as the module's own snapshot already
// reads a project's tree page by page. answer as above.
function fakeGitLab({ tags = {}, answer = null } = {}) {
  const requests = [];
  const store = new Map(Object.entries(tags));
  const server = { requests, tag: (name) => store.get(name) ?? null };
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const own = answer?.(r);
    if (own) return own;
    const token = r.headers["private-token"] ?? null;
    if (token !== null && token !== GL_TOKEN) return json(401, { message: "401 Unauthorized" });
    if (r.origin !== GL_ORIGIN || !r.path.startsWith(GL_PREFIX)) return json(404, { message: "404 Not Found" });
    const rest = r.path.slice(GL_PREFIX.length);
    let m;
    // "List project repository tags": name, and the nested commit.id — the commit an annotated tag is dereferenced to.
    if (r.method === "GET" && rest === "/repository/tags") {
      const all = [...store.entries()];
      const per = Math.min(100, Number(r.query.per_page ?? 20)), page = Number(r.query.page ?? 1);
      const pages = Math.max(1, Math.ceil(all.length / per));
      const slice = all.slice((page - 1) * per, page * per);
      return json(200, slice.map(([name, commit]) => ({ name, target: commit, commit: { id: commit } })),
        { "X-Page": String(page), "X-Per-Page": String(per), "X-Total": String(all.length), "X-Total-Pages": String(pages),
          "X-Next-Page": page < pages ? String(page + 1) : "" });
    }
    // "Get a single repository tag".
    if (r.method === "GET" && (m = /^\/repository\/tags\/([^/]+)$/.exec(rest))) {
      const name = decodeURIComponent(m[1]), commit = store.get(name);
      return commit ? json(200, { name, target: commit, commit: { id: commit } }) : json(404, { message: "404 Tag Not Found" });
    }
    // "Create a new tag" — an existing tag name answered with 400 "Tag <name> already exists" (the first gate's finding, held here).
    if (r.method === "POST" && rest === "/repository/tags") {
      const { tag_name: name, ref } = r.body ?? {};
      if (store.has(name)) return json(400, { message: `Tag ${name} already exists` });
      store.set(name, ref);
      return json(201, { name, target: ref, commit: { id: ref } });
    }
    return json(404, { message: "404 Not Found" });
  };
  return server;
}

const AAAA = "a".repeat(40), BBBB = "b".repeat(40), CCCC = "c".repeat(40);

// ---------------------------------------------------------------- listTags, one page

// Expected: listTags() reads every tag of the repository with the commit it points to; listTags("v*") reads only those whose
// name matches the pattern, * standing for any run of characters. Counter-proof: a repository with no tags answers none, not
// an error.
test("MOD-repository-hosts listTags — the tags of a repository with their commits, and only those matching a pattern (GitHub, GitLab)", async () => {
  const tags = { "v1.0.0": AAAA, "v1.1.0": BBBB, "snapshot-2026-10": CCCC };

  const gh = fakeGitHub({ tags });
  await using(gh.fetch, async () => {
    const host = connect(GITHUB, { token: GH_TOKEN });
    assert.deepEqual(sortByName(await host.listTags()), sortByName([
      { name: "v1.0.0", commit: AAAA }, { name: "v1.1.0", commit: BBBB }, { name: "snapshot-2026-10", commit: CCCC }]));
    assert.deepEqual(sortByName(await host.listTags("v*")), sortByName([{ name: "v1.0.0", commit: AAAA }, { name: "v1.1.0", commit: BBBB }]));
  });

  const gl = fakeGitLab({ tags });
  await using(gl.fetch, async () => {
    const host = connect(GITLAB, { token: GL_TOKEN });
    assert.deepEqual(sortByName(await host.listTags()), sortByName([
      { name: "v1.0.0", commit: AAAA }, { name: "v1.1.0", commit: BBBB }, { name: "snapshot-2026-10", commit: CCCC }]));
    assert.deepEqual(sortByName(await host.listTags("v*")), sortByName([{ name: "v1.0.0", commit: AAAA }, { name: "v1.1.0", commit: BBBB }]));
  });

  // Counter-proof: no tags at all.
  await using(fakeGitHub({ tags: {} }).fetch, async () => {
    assert.deepEqual(await connect(GITHUB, { token: GH_TOKEN }).listTags(), []);
  });
  await using(fakeGitLab({ tags: {} }).fetch, async () => {
    assert.deepEqual(await connect(GITLAB, { token: GL_TOKEN }).listTags(), []);
  });
});

// ---------------------------------------------------------------- listTags across more than one page

// Expected: a repository with more than 100 tags — GitHub's and GitLab's tag lists answer at most 100 a page, naming the next
// page — gives every tag of every page from listTags(), and listTags(pattern) matches the pattern against every one of them,
// whether a match falls on the first page or a later one. 155 tags: "v2026.<n>.0" for every n from 1 to 155, except every
// 31st, which is "snapshot-<n>" instead — so 150 match "v2026.*.0" and 5 do not, 3 of each kind on the first page of 100 and
// 2 on the second page of 55, and "v2026.150.0" itself stands only on the second page.
// Counter-proof (this item's second rejection, docs/gates/20261007-1615-development-release-testing-8078.md): a listTags
// that reads only the first page gives 100 tags, not 155, misses "v2026.150.0", and its pattern match misses it too.
test("MOD-repository-hosts listTags — every tag across more than one page, the pattern matched against all of them (GitHub, GitLab)", async () => {
  const names = [];
  for (let n = 1; n <= 155; n++) names.push(n % 31 === 0 ? `snapshot-${n}` : `v2026.${n}.0`);
  assert.equal(names.length, 155, "known positive: the fixture names 155 tags");
  const matching = names.filter((n) => n.startsWith("v2026."));
  assert.equal(matching.length, 150, "known positive: 150 match v2026.*.0, 5 do not, split across both pages");
  assert.ok(names.slice(0, 100).some((n) => !n.startsWith("v2026.")) && names.slice(100).some((n) => !n.startsWith("v2026.")),
    "known positive: a non-matching tag stands on each page");
  const tags = Object.fromEntries(names.map((name, i) => [name, String(i + 1).padStart(40, "0")]));
  const expectedAll = sortByName(names.map((name) => ({ name, commit: tags[name] })));
  const expectedMatching = sortByName(matching.map((name) => ({ name, commit: tags[name] })));

  const gh = fakeGitHub({ tags });
  const ghAll = await using(gh.fetch, () => connect(GITHUB, { token: GH_TOKEN }).listTags());
  assert.deepEqual(sortByName(ghAll), expectedAll, "GitHub: every tag, not only the first page's 100");
  assert.ok(ghAll.some((t) => t.name === "v2026.150.0"), "GitHub: the tag that stands only on the second page");
  const ghPages = gh.requests.filter((r) => r.method === "GET" && r.path === `${GH_PREFIX}/tags`).map((r) => r.query.page ?? "1");
  assert.ok(ghPages.includes("2"), "known positive: GitHub, a second page was requested");
  const ghMatch = await using(gh.fetch, () => connect(GITHUB, { token: GH_TOKEN }).listTags("v2026.*.0"));
  assert.deepEqual(sortByName(ghMatch), expectedMatching, "GitHub: the pattern matched against every tag, including the second page's");

  const gl = fakeGitLab({ tags });
  const glAll = await using(gl.fetch, () => connect(GITLAB, { token: GL_TOKEN }).listTags());
  assert.deepEqual(sortByName(glAll), expectedAll, "GitLab: every tag, not only the first page's 100");
  assert.ok(glAll.some((t) => t.name === "v2026.150.0"), "GitLab: the tag that stands only on the second page");
  const glPages = gl.requests.filter((r) => r.method === "GET" && r.path === `${GL_PREFIX}/repository/tags`).map((r) => r.query.page ?? "1");
  assert.ok(glPages.includes("2"), "known positive: GitLab, a second page was requested");
  const glMatch = await using(gl.fetch, () => connect(GITLAB, { token: GL_TOKEN }).listTags("v2026.*.0"));
  assert.deepEqual(sortByName(glMatch), expectedMatching, "GitLab: the pattern matched against every tag, including the second page's");
});

// ---------------------------------------------------------------- createTag, the positive case

// Expected: createTag(name, commit) sets the named tag on the named commit — GitHub's "Create a reference" with
// ref: "refs/tags/<name>", GitLab's "Create a new tag" with tag_name and ref — and resolves to undefined (Promise<void>); the
// tag then reads back at that commit.
test("MOD-repository-hosts createTag — a tag set on the commit named (GitHub, GitLab)", async () => {
  const gh = fakeGitHub({ tags: { "v1.0.0": AAAA } });
  await using(gh.fetch, async () => {
    const host = connect(GITHUB, { token: GH_TOKEN });
    assert.equal(await host.createTag("v1.1.0", BBBB), undefined);
  });
  assert.equal(gh.tag("v1.1.0"), BBBB, "the fake now holds the tag on the named commit");
  const made = gh.requests.find((r) => r.method === "POST" && r.path === "/repos/carol/release-tool/git/refs");
  assert.deepEqual([made.body.ref, made.body.sha], ["refs/tags/v1.1.0", BBBB]);

  const gl = fakeGitLab({ tags: { "v1.0.0": AAAA } });
  await using(gl.fetch, async () => {
    const host = connect(GITLAB, { token: GL_TOKEN });
    assert.equal(await host.createTag("v1.1.0", BBBB), undefined);
  });
  assert.equal(gl.tag("v1.1.0"), BBBB);
  const glMade = gl.requests.find((r) => r.method === "POST" && r.path === "/api/v4/projects/space%2Frelease-tool/repository/tags");
  assert.deepEqual([glMade.body.tag_name, glMade.body.ref], ["v1.1.0", BBBB]);
});

// ---------------------------------------------------------------- createTag, the existing tag

// A VERSION IS NOT REWRITTEN — Expected: createTag of a tag that exists already fails with TagExists, naming the commit it
// already stands on (not the one just named), and the tag is not moved. GitHub answers the existing reference with 422
// "Reference already exists" (never only 409, which this item's first gate at
// docs/gates/20261007-1404-development-release-testing-a0e7.md found read as Unreachable instead); a GitLab server answers
// 400 "Tag <name> already exists". Counter-proof: the commit named in the failed call is never written to the tag.
test("MOD-repository-hosts createTag — an existing tag is refused with TagExists naming its commit, and not moved (GitHub's 422, GitLab's 400)", async () => {
  const gh = fakeGitHub({ tags: { "v1.0.0": AAAA } });
  const e1 = await using(gh.fetch, () => failure(connect(GITHUB, { token: GH_TOKEN }).createTag("v1.0.0", BBBB)));
  assert.ok(e1 instanceof HostError, `a HostError, not ${e1}`);
  assert.equal(e1.name, "TagExists");
  assert.equal(e1.commit, AAAA, "the commit it already stands on");
  assert.equal(gh.tag("v1.0.0"), AAAA, "not moved to the commit just named");

  const gl = fakeGitLab({ tags: { "v1.0.0": AAAA } });
  const e2 = await using(gl.fetch, () => failure(connect(GITLAB, { token: GL_TOKEN }).createTag("v1.0.0", BBBB)));
  assert.ok(e2 instanceof HostError, `a HostError, not ${e2}`);
  assert.equal(e2.name, "TagExists");
  assert.equal(e2.commit, AAAA, "the commit it already stands on");
  assert.equal(gl.tag("v1.0.0"), AAAA, "not moved to the commit just named");
});

// ---------------------------------------------------------------- the module's other named failures

// Expected: a refused token (401) fails listTags/createTag with TokenRefused, naming the token and its renewal page; a missing
// permission (403, no rate-limit headers) fails with PermissionMissing; a used-up rate limit (403 with GitHub's
// X-RateLimit-Remaining: 0, or GitLab's 429) fails with RateLimited, naming the account's limit — never TokenRefused or
// PermissionMissing (A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN) — on both GitHub and a GitLab server. Every
// request either function sends carries only the token of the server it was issued for (A TOKEN GOES ONLY TO THE SERVER THAT
// ISSUED IT), never the other, and never in the address.
test("MOD-repository-hosts listTags, createTag — a refused token, a missing permission and a used-up rate limit are the module's named failures", async () => {
  const RESET = 1790000000;

  const ghRefused = await using(fakeGitHub({ answer: () => json(401, { message: "Bad credentials" }) }).fetch,
    () => failure(connect(GITHUB, { token: GH_TOKEN, tokenName: "GitHub token" }).listTags()));
  assert.deepEqual([ghRefused?.name, ghRefused?.tokenName, ghRefused?.renewal], ["TokenRefused", "GitHub token", GH_TOKENS]);

  const ghMissing = await using(fakeGitHub({ answer: () => json(403, { message: "Resource not accessible by personal access token" }) }).fetch,
    () => failure(connect(GITHUB, { token: GH_TOKEN }).createTag("v1.0.0", AAAA)));
  assert.equal(ghMissing?.name, "PermissionMissing");

  const ghLimited = await using(fakeGitHub({ answer: () => json(403, { message: "API rate limit exceeded for user ID 1." },
    { "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(RESET) }) }).fetch,
    () => failure(connect(GITHUB, { token: GH_TOKEN }).listTags()));
  assert.deepEqual([ghLimited?.name, ghLimited?.limit, ghLimited?.resetsAt?.getTime()], ["RateLimited", "account", RESET * 1000]);

  const glRefused = await using(fakeGitLab({ answer: () => json(401, { message: "401 Unauthorized" }) }).fetch,
    () => failure(connect(GITLAB, { token: GL_TOKEN, tokenName: "GitLab project token" }).createTag("v1.0.0", AAAA)));
  assert.deepEqual([glRefused?.name, glRefused?.tokenName, glRefused?.renewal], ["TokenRefused", "GitLab project token", GL_TOKENS]);

  const glMissing = await using(fakeGitLab({ answer: () => json(403, { message: "403 Forbidden" }) }).fetch,
    () => failure(connect(GITLAB, { token: GL_TOKEN }).listTags()));
  assert.equal(glMissing?.name, "PermissionMissing");

  const glLimited = await using(fakeGitLab({ answer: () => json(429, { message: "Retry later" }, { "Retry-After": "60" }) }).fetch,
    () => failure(connect(GITLAB, { token: GL_TOKEN }).createTag("v1.0.0", AAAA)));
  assert.equal(glLimited?.name, "RateLimited");

  // A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT.
  const gh2 = fakeGitHub({ tags: { "v1.0.0": AAAA } });
  await using(gh2.fetch, () => connect(GITHUB, { token: GH_TOKEN }).listTags());
  assert.ok(gh2.requests.length > 0, "known positive: requests were sent");
  for (const r of gh2.requests) {
    assert.equal(r.headers.authorization, `Bearer ${GH_TOKEN}`);
    assert.ok(!("private-token" in r.headers) && !r.href.includes(GH_TOKEN), `no GitLab token, no token in the address: ${r.href}`);
  }
  const gl2 = fakeGitLab({ tags: { "v1.0.0": AAAA } });
  await using(gl2.fetch, () => connect(GITLAB, { token: GL_TOKEN }).listTags());
  assert.ok(gl2.requests.length > 0, "known positive: requests were sent");
  for (const r of gl2.requests) {
    assert.equal(r.headers["private-token"], GL_TOKEN);
    assert.ok(!("authorization" in r.headers) && !r.href.includes(GL_TOKEN), `no GitHub token, no token in the address: ${r.href}`);
  }
});
