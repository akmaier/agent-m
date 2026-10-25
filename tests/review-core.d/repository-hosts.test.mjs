// The repository hosts (src/repository-hosts/), through the module's interface: parseAddress, connect and the host it returns
// — deterministic, no network: the servers are fakes of `fetch` that answer as GitHub's REST API and GitLab's REST API v4 do.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-repository-hosts
// Guards: NO TEXT TRAVELS IN A URL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A PRODUCT IS NAMED BY ITS ADDRESS; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; UC-001
// Level: component
//
// The host knows nothing of a page or a click: that a write follows a person's action is the pages' rule, checked with them
// (tests/artifact-edits-save.test.mjs, tests/approvals-accept.test.mjs). What the host holds of THE DASHBOARD WRITES ONLY ON A
// PERSON'S CLICK is the other half: the commit is made with the token the host was connected with, the person's own.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../../src/repository-hosts/index.mjs";
import { blobSha } from "../../src/text-tools/index.mjs";
import { withFetch, B_SPEC, B_UC1, GL, GL_ADDR, GL_TOKEN, H0, NEWC, fakeGitLab } from "./helpers.mjs";

const GH_ADDR = "https://github.com/alice/thesis-tool", GH_API = "https://api.github.com";
const GH_TOKEN = "github_pat_11ALICEthesisTOOL0123456789";
const C0 = "0".repeat(39) + "1", C1 = "0".repeat(39) + "2", C9 = "9".repeat(40);
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);
const headersOf = (init) => Object.fromEntries(Object.entries(init?.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));

// GitHub with one repository, alice/thesis-tool, whose branch main stands at C0 with `files`; a commit made on it moves main to
// C1. Every request is recorded with its method, address and headers. `answer(url, init)` may answer a request itself.
function fakeGitHub({ files = { "SPEC.md": B_SPEC }, answer = null } = {}) {
  const requests = [];
  let head = C0;
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(String(u)), method = (init.method ?? "GET").toUpperCase();
    requests.push({ method, href: url.href, origin: url.origin, path: url.pathname, headers: headersOf(init),
      body: typeof init.body === "string" ? JSON.parse(init.body) : null });
    const own = answer?.(url, init);
    if (own) return own;
    const repo = "/repos/alice/thesis-tool", rest = url.pathname.slice(repo.length);
    if (url.origin !== GH_API || !url.pathname.startsWith(repo)) return json(404, { message: "Not Found" });
    if (method === "GET" && rest === "") return json(200, { full_name: "alice/thesis-tool", default_branch: "main", visibility: "private", permissions: { push: true } });
    if (method === "GET" && rest === "/commits/main") return json(200, { sha: head });
    if (method === "GET" && rest === `/git/trees/${C0}`) {
      return json(200, { sha: "t0", tree: await Promise.all(Object.entries(files).map(async ([path, t]) => ({ path, type: "blob", sha: await blobSha(t) }))) });
    }
    if (method === "GET" && rest.startsWith("/contents/")) {
      const path = decodeURIComponent(rest.slice("/contents/".length));
      return path in files ? new Response(files[path], { status: 200 }) : json(404, { message: "Not Found" });
    }
    if (method === "GET" && rest === "/git/ref/heads/main") return json(200, { object: { sha: head } });
    if (method === "GET" && rest === `/git/commits/${C0}`) return json(200, { sha: C0, tree: { sha: "t0" } });
    if (method === "POST" && rest === "/git/trees") return json(201, { sha: "t1" });
    if (method === "POST" && rest === "/git/commits") return json(201, { sha: C1, html_url: `${GH_ADDR}/commit/${C1}` });
    if (method === "PATCH" && rest === "/git/refs/heads/main") { head = C1; return json(200, { object: { sha: C1 } }); }
    return json(404, { message: "Not Found" });
  };
  return { requests, fetchMock, writes: () => requests.filter((r) => r.method !== "GET"), moveTo: (sha) => { head = sha; } };
}

const github = (credentials = {}) => connect(parseAddress(GH_ADDR), credentials);
const gitlab = (credentials = {}) => connect(parseAddress(GL_ADDR), credentials);
const oneFile = (expectedHead = C0) => ({ branch: "main", expectedHead, message: "accept UC-001",
  files: [{ path: "docs/approvals/UC-001-abc.md", text: "kind: use-case\n" }] });

// ---------------------------------------------------------------- the token's permissions and the token pages (UC-001)

// ONE GITHUB TOKEN SERVES EVERY FEATURE — Expected: the page for a new GitHub token asks for exactly *Contents*, *Issues* and
// *Pull requests* read and write, *Actions*, *Workflows* and *Secrets* read and write, *Metadata* read — in the parameter names and
// access levels of GitHub's prefilled token page, where write includes read (docs.github.com, "Pre-filling fine-grained personal
// access token details using URL parameters", read 2026-10-01) — and no other permission. Counter-proof: a list without Workflows,
// or with Administration, is not that list.
const GITHUB_PERMISSIONS = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", secrets: "write", metadata: "read" };
const NOT_PERMISSIONS = new Set(["name", "description", "target_name", "expires_in"]);
test("ONE GITHUB TOKEN SERVES EVERY FEATURE — the new token's page asks for Contents, Issues, Pull requests, Actions, Workflows, Secrets write and Metadata read", () => {
  const page = new URL(github().webLinks().newToken("Agent M", "Agent M for alice/thesis-tool", 90));
  assert.equal(`${page.origin}${page.pathname}`, "https://github.com/settings/personal-access-tokens/new");
  const asked = Object.fromEntries([...page.searchParams].filter(([k]) => !NOT_PERMISSIONS.has(k)));
  assert.deepEqual(asked, GITHUB_PERMISSIONS, "exactly these parameters and levels, no more, no less");
  assert.notDeepEqual({ contents: "write", issues: "write", pull_requests: "write", actions: "write", metadata: "read" }, GITHUB_PERMISSIONS);
  assert.notDeepEqual({ ...GITHUB_PERMISSIONS, administration: "write" }, GITHUB_PERMISSIONS);
});

// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — Expected: for a GitLab project the token page is that project's own Access
// tokens page, where its project access token is created and rotated; GitHub has no such page. The list of the person's GitHub
// tokens is GitHub's page of fine-grained tokens, where a token is renewed.
test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the project's own Access tokens page; GitHub's list of the person's tokens", () => {
  const gl = gitlab().webLinks();
  assert.equal(gl.projectTokens, `${GL_ADDR}/-/settings/access_tokens`);
  assert.equal(gl.newToken("Agent M", "d", 90), `${GL_ADDR}/-/settings/access_tokens`);
  assert.equal(github().webLinks().projectTokens, null, "counter-proof: GitHub has no project token page");
  assert.equal(github().webLinks().tokens, "https://github.com/settings/personal-access-tokens");
});

// NO TEXT TRAVELS IN A URL · A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — Expected: GitHub's new-file page carries the file's path
// and the approval record, nothing else, and the editor page the path alone; a GitLab project has no new-file page to fall back to
// (null). Neither page carries the token the host was connected with.
test("NO TEXT TRAVELS IN A URL — the new-file page carries a path and a record; GitLab has no web fallback", () => {
  const links = github({ token: GH_TOKEN }).webLinks();
  const page = new URL(links.newFile("docs/approvals/x.md", "kind: use-case\n"));
  assert.equal(`${page.origin}${page.pathname}`, `${GH_ADDR}/new/main`);
  assert.deepEqual([...page.searchParams], [["filename", "docs/approvals/x.md"], ["value", "kind: use-case\n"]]);
  assert.equal(links.editFile("docs/use-cases/UC-001 x.md"), `${GH_ADDR}/edit/main/docs/use-cases/UC-001%20x.md`);
  for (const u of [page.href, links.editFile("SPEC.md")]) assert.ok(!u.includes(GH_TOKEN), u);
  assert.equal(gitlab({ token: GL_TOKEN }).webLinks().newFile("docs/approvals/x.md", "kind: use-case\n"), null);
});

// ---------------------------------------------------------------- products by their address (UC-001)

// A PRODUCT IS NAMED BY ITS ADDRESS · GITLAB PRODUCTS ARE SUPPORTED — Expected: the address as copied from the browser names the
// repository — on github.com by owner and name, on any other server as a GitLab project in its nested groups, its server
// recognised from the address — whatever page of it is copied. Counter-proof: a bare owner/name, plain http, an owner alone, a
// path that climbs, a credential in the address and a script address are refused with a TypeError.
test("A PRODUCT IS NAMED BY ITS ADDRESS — on GitHub and on a GitLab server, as copied from the browser", () => {
  for (const v of [GH_ADDR, ` ${GH_ADDR}/ `, `${GH_ADDR}.git`, `${GH_ADDR}/tree/main`]) {
    assert.deepEqual(parseAddress(v), { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: GH_ADDR }, v);
  }
  const web = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool";
  for (const v of [web, `${web}.git`, `${web}/-/blob/main/SPEC.md`]) {
    assert.deepEqual(parseAddress(v), { server: "gitlab", origin: "https://gitlab.rrze.fau.de", path: "fau-ai-taskforce/tools/thesis-tool", web }, v);
  }
  assert.equal(parseAddress("https://git.example.org:8443/a/b").origin, "https://git.example.org:8443");
  for (const v of ["alice/thesis-tool", "http://github.com/alice/thesis-tool", "https://github.com/alice", "https://github.com/../evil",
    "https://gitlab.com/alice/../bob", `https://oauth2:${GL_TOKEN}@gitlab.com/a/b`, "javascript:alert(1)", ""]) {
    assert.throws(() => parseAddress(v), TypeError, `refused: ${JSON.stringify(v)}`);
  }
});

// ---------------------------------------------------------------- where a token goes

// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT · THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — Expected: reading the GitHub
// repository and committing one file to it, every request goes to GitHub's API and carries the person's token as its
// Authorization header, the commit included, and no address carries the token; the commit is one commit on the head that was
// read, fast-forward only. Reading and committing to the GitLab project, every request goes to that project's API on its own
// server with the project token as PRIVATE-TOKEN, and none carries an Authorization. Counter-proof: the other server's kind of
// token is refused by connect with a TypeError, and nothing is sent.
test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only to GitHub's API, the project token only to its project's API", async () => {
  const gh = fakeGitHub();
  const made = await withFetch(gh.fetchMock, async () => {
    const host = github({ token: GH_TOKEN });
    const snap = await host.readSnapshot("main");
    assert.equal(await snap.read("SPEC.md"), B_SPEC, "known positive: the file is read");
    return host.commitFiles(oneFile(snap.commit));
  });
  assert.equal(made.commit, C1);
  assert.deepEqual(gh.writes().map((r) => `${r.method} ${r.path}`), ["POST /repos/alice/thesis-tool/git/trees",
    "POST /repos/alice/thesis-tool/git/commits", "PATCH /repos/alice/thesis-tool/git/refs/heads/main"]);
  assert.deepEqual(gh.writes()[1].body.parents, [C0], "on the head that was read");
  assert.equal(gh.writes()[2].body.force, false, "fast-forward only");
  for (const r of gh.requests) {
    assert.equal(r.origin, GH_API, r.href);
    assert.equal(r.headers.authorization, `Bearer ${GH_TOKEN}`, `${r.method} ${r.href}`);
    assert.ok(!r.href.includes(GH_TOKEN) && !("private-token" in r.headers), r.href);
  }
  const gl = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  await withFetch(gl.fetchMock, async () => {
    const host = gitlab({ token: GL_TOKEN });
    const snap = await host.readSnapshot("main");
    assert.equal(await snap.read("SPEC.md"), B_SPEC, "known positive: the file is read");
    await host.commitFiles(oneFile(snap.commit));
  });
  assert.ok(gl.calls.some((c) => c.method === "POST"), "known positive: the commit was sent");
  for (const c of gl.calls) {
    assert.equal(c.origin, GL, c.path);
    assert.ok(c.path.startsWith(`/api/v4/projects/${encodeURIComponent("grp/sub/proj")}`), c.path);
    assert.equal(c.token, GL_TOKEN, c.path);
    assert.equal(c.authorization, undefined, c.path);
  }
  for (const [host, foreign] of [[gitlab, GH_TOKEN], [github, GL_TOKEN]]) {
    const sent = fakeGitHub();
    await withFetch(sent.fetchMock, async () => assert.throws(() => host({ token: foreign }), TypeError));
    assert.deepEqual(sent.requests, [], "nothing is sent");
  }
});

// ---------------------------------------------------------------- a save on a head that moved

// A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — Expected: a commit made on a head the branch no longer stands at fails with
// Moved, naming the head it stands at now, and nothing is written; on GitLab the same. Known positive: on the head that stands,
// the same commit is written.
test("A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a commit on a head that moved is Moved, and nothing is written", async () => {
  const gh = fakeGitHub();
  gh.moveTo(C9);
  const e = await withFetch(gh.fetchMock, () => failure(github({ token: GH_TOKEN }).commitFiles(oneFile(C0))));
  assert.deepEqual([e?.name, e?.head], ["Moved", C9]);
  assert.deepEqual(gh.writes(), [], "nothing is written");
  const ok = fakeGitHub();
  assert.equal((await withFetch(ok.fetchMock, () => github({ token: GH_TOKEN }).commitFiles(oneFile(C0)))).commit, C1, "known positive");
  const gl = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const g = await withFetch(gl.fetchMock, () => failure(gitlab({ token: GL_TOKEN }).commitFiles(oneFile(C9))));
  assert.deepEqual([g?.name, g?.head], ["Moved", H0]);
  assert.ok(!gl.calls.some((c) => c.method === "POST"), "nothing is written");
});

// ---------------------------------------------------------------- a refused token

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — Expected: a token the server refuses (401) fails the read with TokenRefused,
// naming the token by the name it was stored under — or, without a name, as the GitHub token or the GitLab project token of its
// project — and the page where it is renewed: GitHub's list of the person's tokens, the project's Access tokens page. Counter-proof:
// a missing repository (404) is NotFound and a missing permission (403) PermissionMissing, neither a refused token.
test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link", async () => {
  const refuse = (status) => async () => new Response(JSON.stringify({ message: "refused" }), { status });
  const named = await withFetch(refuse(401), () => failure(github({ token: GH_TOKEN, tokenName: "My instance token" }).repositoryInfo()));
  assert.deepEqual([named?.name, named?.tokenName, named?.renewal], ["TokenRefused", "My instance token", "https://github.com/settings/personal-access-tokens"]);
  assert.match(named.message, /My instance token/);
  const plain = await withFetch(refuse(401), () => failure(github({ token: GH_TOKEN }).repositoryInfo()));
  assert.equal(plain?.tokenName, "GitHub token");
  const gl = await withFetch(refuse(401), () => failure(gitlab({ token: GL_TOKEN }).repositoryInfo()));
  assert.deepEqual([gl?.name, gl?.tokenName, gl?.renewal], ["TokenRefused", `GitLab project token for ${GL_ADDR}`, `${GL_ADDR}/-/settings/access_tokens`]);
  assert.equal((await withFetch(refuse(404), () => failure(github({ token: GH_TOKEN }).repositoryInfo())))?.name, "NotFound");
  assert.equal((await withFetch(refuse(403), () => failure(github({ token: GH_TOKEN }).repositoryInfo())))?.name, "PermissionMissing");
});

// ---------------------------------------------------------------- GitLab products

// GITLAB PRODUCTS ARE SUPPORTED — Expected: a GitLab project is read at one commit — the branch resolved to its commit once, every
// page of its tree read at that commit, each file's blob SHA from the tree —, and its files' texts at that commit; a path the
// commit does not hold is null. Its change is one commit of several actions: `create` where the file is absent, `update` with the
// file's last commit where it is present; never forced.
test("GITLAB PRODUCTS ARE SUPPORTED — reading at the pinned commit, every page of the tree, and one commit of several actions", async () => {
  const files = { "SPEC.md": "# S\n", "docs/use-cases/UC-001-a.md": B_UC1 };
  for (let i = 0; i < 130; i++) files[`docs/approvals/r${String(i).padStart(3, "0")}.md`] = `kind: use-case\nn: ${i}\n`;
  const g = await fakeGitLab({ files });
  const host = gitlab({ token: GL_TOKEN });
  const snap = await withFetch(g.fetchMock, () => host.readSnapshot("main"));
  assert.equal(snap.commit, H0);
  assert.equal(snap.paths.length, 132, "every blob of every page, no folder");
  assert.equal(snap.blob("docs/use-cases/UC-001-a.md"), await blobSha(B_UC1));
  const trees = g.calls.filter((c) => c.path.endsWith("/repository/tree"));
  assert.ok(trees.length >= 2 && trees.every((c) => c.query.ref === H0), "paged, at the pinned commit");
  assert.equal(await withFetch(g.fetchMock, () => snap.read("docs/use-cases/UC-001-a.md")), B_UC1);
  assert.equal(g.calls.at(-1).query.ref, H0);
  assert.equal(await withFetch(g.fetchMock, () => snap.read("nope.md")), null);
  const w = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const made = await withFetch(w.fetchMock, () => host.commitFiles({ branch: "main", expectedHead: H0, message: "m",
    files: [{ path: "SPEC.md", text: "new\n" }, { path: "docs/approvals/x.md", text: "kind: spec\n" }] }));
  const posts = w.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "exactly one commit");
  assert.deepEqual(posts[0].body, { branch: "main", commit_message: "m", actions: [
    { action: "update", file_path: "SPEC.md", content: "new\n", encoding: "text", last_commit_id: "d".repeat(40) },
    { action: "create", file_path: "docs/approvals/x.md", content: "kind: spec\n", encoding: "text" }] });
  assert.deepEqual(made, { commit: NEWC, url: `${GL_ADDR}/-/commit/${NEWC}` });
});
