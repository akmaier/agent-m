// The git host adapter (docs/assets/git-host.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-git-host
// Guards: NO TEXT TRAVELS IN A URL; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A PRODUCT IS NAMED BY ITS ADDRESS; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; ONE GITHUB TOKEN SERVES EVERY FEATURE; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; UC-001
// Level: component
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import { gitBlobSha } from "../../docs/assets/review-core.mjs";
import {
  newFileUrl, editUrl, fetchText, ALLOWED_ORIGINS, MAX_URL_VALUE, commitFiles, parseProductAddress, tokenRefusal,
  gitlabAuth, gitlabApiBase, gitlabSnapshot, gitlabReadFile, commitFilesGitLab, writeFiles, writeRoute, authHeaders,
} from "../../docs/assets/git-host.mjs";
import * as gitHost from "../../docs/assets/git-host.mjs";
import { expiryWarning, tokenBannerHtml } from "../../docs/assets/dashboard/settings-view.mjs";
import {
  click, fakeGitHub, withFetch, B_SPEC, B_UC1, GL, GL_ADDR, GL_TOKEN, H0, NEWC, fakeGitLab,
} from "./helpers.mjs";

// ---------------------------------------------------------------- the one list of the token's permissions (ITM-006)

// ONE GITHUB TOKEN SERVES EVERY FEATURE. The expected parameter names and access levels are GitHub's own, read on 2026-10-01 in
// the table "Repository permissions" of
// https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#pre-filling-fine-grained-personal-access-token-details-using-url-parameters
// — contents (read, write), issues (read, write), pull_requests (read, write), actions (read, write), workflows (write only),
// metadata (read only); "write always includes read".
const GITHUB_PERMISSIONS = { contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read" };

test("ONE GITHUB TOKEN SERVES EVERY FEATURE — requiredPermissions on GitHub: Contents, Issues, Pull requests, Actions, Workflows write, Metadata read, each with why", () => {
  for (const host of ["github.com", parseProductAddress("https://github.com/alice/thesis")]) {
    const r = gitHost.requiredPermissions(host);
    assert.deepEqual(Object.keys(r), ["github"]);
    assert.deepEqual(r.github.map((p) => p.permission), ["Contents", "Issues", "Pull requests", "Actions", "Workflows", "Metadata"]);
    assert.deepEqual(Object.fromEntries(r.github.map((p) => [p.param, p.access])), GITHUB_PERMISSIONS,
      "exactly these parameters and levels, no more, no less");
    for (const p of r.github) assert.ok(typeof p.why === "string" && p.why.length > 20, `${p.permission} says why it is needed`);
  }
  // counter-proof: a list missing Workflows, or carrying Administration, is not the one asked for
  assert.notDeepEqual({ contents: "write", issues: "write", pull_requests: "write", actions: "write", metadata: "read" }, GITHUB_PERMISSIONS);
  assert.notDeepEqual({ ...GITHUB_PERMISSIONS, administration: "write" }, GITHUB_PERMISSIONS);
});

test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — requiredPermissions on a GitLab server: role Maintainer, scope api", () => {
  for (const host of ["gitlab.com", "gitlab.rrze.fau.de", parseProductAddress(GL_ADDR)]) {
    const r = gitHost.requiredPermissions(host);
    assert.deepEqual(Object.keys(r), ["gitlab"]);
    assert.equal(r.gitlab.role, "Maintainer");
    assert.equal(r.gitlab.scope, "api");
    assert.ok(typeof r.gitlab.why === "string" && r.gitlab.why.length > 20);
  }
});

test("NO TEXT TRAVELS IN A URL: long values are refused", () => {
  const u = newFileUrl("akmaier/agent-m", "main", "docs/approvals/x.md", "kind: use-case\n");
  assert.match(u, /^https:\/\/github\.com\/akmaier\/agent-m\/new\/main\?filename=docs%2Fapprovals%2Fx\.md&value=kind%3A/);
  assert.throws(() => newFileUrl("a/b", "main", "p.md", "x".repeat(MAX_URL_VALUE + 1)), /URL/);
  assert.equal(editUrl("a/b", "main", "docs/use-cases/UC-001 x.md"),
    "https://github.com/a/b/edit/main/docs/use-cases/UC-001%20x.md");
});

test("fetchText reads with GET only; the GitHub token goes only to GitHub's API (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT)", async () => {
  await assert.rejects(fetchText("https://example.org/x"), /origin/);
  await assert.rejects(fetchText("https://api.github.com/x", { method: "PUT" }), /GET/);
  await assert.rejects(fetchText("https://api.github.com/x", { method: "POST" }, "t"), /GET/);
  await assert.rejects(fetchText("https://raw.githubusercontent.com/a/b/c", {}, "github_pat_11ABCDEF"), /token may only go/);
  await assert.rejects(fetchText("https://api.github.com/x", { headers: { Authorization: "Bearer x" } }), /header/);
  await assert.rejects(fetchText("https://api.github.com/x", { credentials: "include" }), /credential/);
  assert.deepEqual([...ALLOWED_ORIGINS].sort(), ["https://api.github.com", "https://raw.githubusercontent.com"]);
  // The one allowed way: GET to the API with the stored token, header built by fetchText itself.
  const seen = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (u, init) => { seen.push([String(u), init.method, init.headers.Authorization]); return new Response("ok"); };
  try {
    assert.equal(await fetchText("https://api.github.com/repos/a/b", {}, "github_pat_t"), "ok");
    assert.equal(await fetchText("https://raw.githubusercontent.com/a/b/c/d"), "ok");
  } finally { globalThis.fetch = realFetch; }
  assert.deepEqual(seen, [["https://api.github.com/repos/a/b", "GET", "Bearer github_pat_t"],
    ["https://raw.githubusercontent.com/a/b/c/d", "GET", undefined]]);
});

// ---------------------------------------------------------------- one click per decision (queue 2026-09-24)

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — no trusted click, no request", async () => {
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, async () => {
    const base = { repo: "a/b", branch: "main", files: [{ path: "x.md", content: "x\n" }], message: "m", token: "github_pat_t" };
    await assert.rejects(commitFiles({ ...base }), /click/);
    await assert.rejects(commitFiles({ ...base, click: { isTrusted: false } }), /click/);
    await assert.rejects(commitFiles({ ...base, click, token: null }), /token/);
  });
  assert.equal(calls.length, 0);
});

test("one commit, fast-forward only, token only to the API", async () => {
  const { calls, fetchMock } = fakeGitHub();
  const r = await withFetch(fetchMock, () => commitFiles({ repo: "a/b", branch: "main", message: "accept UC-001",
    token: "github_pat_t", click, files: [{ path: "docs/approvals/UC-001-abc.md", content: "kind: use-case\n" }] }));
  assert.equal(r.sha, "c1");
  assert.deepEqual(calls.map(([m, p]) => `${m} ${p}`), [
    "GET /repos/a/b/git/ref/heads/main", "GET /repos/a/b/git/commits/c0", "POST /repos/a/b/git/trees",
    "POST /repos/a/b/git/commits", "PATCH /repos/a/b/git/refs/heads/main"]);
  assert.ok(calls.every(([, , auth]) => auth === "Bearer github_pat_t"));
  const tree = calls[2][3], commit = calls[3][3], ref = calls[4][3];
  assert.deepEqual(tree, { base_tree: "t0", tree: [{ path: "docs/approvals/UC-001-abc.md", mode: "100644", type: "blob", content: "kind: use-case\n" }] });
  assert.deepEqual(commit, { message: "accept UC-001", tree: "t1", parents: ["c0"] });
  assert.deepEqual(ref, { sha: "c1", force: false });
});

test("an edit is refused when the file changed since it was loaded", async () => {
  const { calls, fetchMock } = fakeGitHub({ "docs/use-cases/UC-001-x.md": "newer" });
  await withFetch(fetchMock, () => assert.rejects(commitFiles({ repo: "a/b", branch: "main", message: "edit", token: "github_pat_t",
    click, files: [{ path: "docs/use-cases/UC-001-x.md", content: "mine\n", expectBlob: "older" }] }), /changed since/));
  assert.ok(!calls.some(([m]) => m === "PATCH"), "nothing written");
});

// ---------------------------------------------------------------- products in the browser (UC-001)
// A PRODUCT IS NAMED BY ITS ADDRESS

test("A PRODUCT IS NAMED BY ITS ADDRESS — the address as copied from the browser", () => {
  const p = parseProductAddress("https://github.com/alice/thesis-tool");
  assert.deepEqual(p, { address: "https://github.com/alice/thesis-tool", host: "github.com", repo: "alice/thesis-tool" });
  for (const v of [" https://github.com/alice/thesis-tool/ ", "https://github.com/alice/thesis-tool.git", "https://github.com/alice/thesis-tool/tree/main"]) {
    assert.equal(parseProductAddress(v).address, "https://github.com/alice/thesis-tool", v);
  }
  // Counter-proof: a bare owner/name is not an address; nor is anything outside https.
  for (const v of ["alice/thesis-tool", "http://github.com/alice/thesis-tool", "https://github.com/alice", "https://github.com/../evil", "javascript:alert(1)", ""]) {
    assert.ok(parseProductAddress(v).error, `refused: ${JSON.stringify(v)}`);
  }
  // A GitLab address is a GitLab product (GITLAB PRODUCTS ARE SUPPORTED) — see the GitLab section below.
  assert.equal(parseProductAddress("https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool").kind, "gitlab");
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a refused request yields the token's name and the renewal link", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"message":"Bad credentials"}', { status: 401, statusText: "Unauthorized" });
  let err;
  try { await fetchText("https://api.github.com/repos/a/b", {}, "github_pat_old"); } catch (e) { err = e; } finally { globalThis.fetch = realFetch; }
  const r = tokenRefusal(err);
  assert.equal(r.token, "GitHub token");
  assert.match(r.text, /GitHub token/);
  assert.equal(r.renewUrl, "https://github.com/settings/personal-access-tokens");
  assert.match(r.renew, /Regenerate token/);
  assert.match(r.renew, /permissions and repositories/);
  // Also for a refused write (commitFiles sets .status).
  assert.ok(tokenRefusal(Object.assign(new Error("GET /git/ref/heads/main: 401 Bad credentials"), { status: 401 })));
  // Counter-proof: a missing repository or a missing permission is not an expired token.
  assert.equal(tokenRefusal(Object.assign(new Error("404 Not Found — https://api.github.com/repos/a/b"), { status: 404 })), null);
  assert.equal(tokenRefusal(Object.assign(new Error("403 Forbidden"), { status: 403 })), null);
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// GITLAB PRODUCTS ARE SUPPORTED · A GITLAB PRODUCT IS WRITTEN WITH A TOKEN · A PRODUCT IS NAMED BY ITS ADDRESS · A TOKEN
// GOES ONLY TO THE SERVER THAT ISSUED IT (UC-001 3c/3d). The GitLab server is a mock of the REST API v4 as GitLab
// documents it (doc/api/repositories.md, repository_files.md, commits.md, branches.md); no request leaves this process.

test("A PRODUCT IS NAMED BY ITS ADDRESS — GitLab addresses, nested groups, the server recognised from the address", () => {
  const p = parseProductAddress("https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool");
  assert.deepEqual(p, { address: "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool", host: "gitlab.rrze.fau.de",
    repo: "fau-ai-taskforce/tools/thesis-tool", server: "https://gitlab.rrze.fau.de", kind: "gitlab" });
  for (const v of ["https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/", "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool.git",
    "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/tree/main", " https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/blob/main/SPEC.md "]) {
    assert.equal(parseProductAddress(v).address, "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool", v);
  }
  assert.equal(parseProductAddress("https://gitlab.com/alice/thesis").server, "https://gitlab.com");
  assert.equal(parseProductAddress("https://git.example.org:8443/a/b").server, "https://git.example.org:8443");
  // GitHub stays what it was.
  assert.deepEqual(parseProductAddress("https://github.com/alice/thesis"), { address: "https://github.com/alice/thesis", host: "github.com", repo: "alice/thesis" });
  // Counter-proof: no project path, a path that climbs, a credential in the address, plain http.
  for (const v of ["https://gitlab.com/alice", "https://gitlab.com/alice/../bob", "https://gitlab.com/-/alice", "https://oauth2:glpat-x@gitlab.com/a/b",
    "http://gitlab.com/a/b", "https://gitlab.com/a/b%2Fc"]) {
    assert.ok(parseProductAddress(v).error, `refused: ${v}`);
  }
});

test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — a GitLab token reaches its own project's API and nothing else", async () => {
  const p = parseProductAddress(GL_ADDR);
  const auth = gitlabAuth(p, GL_TOKEN);
  const api = gitlabApiBase(p);
  assert.equal(api, `${GL}/api/v4/projects/grp%2Fsub%2Fproj`);
  const seen = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (u, init) => { seen.push([String(u), init.method, { ...init.headers }]); return new Response("{}"); };
  try {
    // Known positive: the issuing server's API for this project gets the token, as PRIVATE-TOKEN, and nothing else does.
    await fetchText(`${api}/repository/tree?ref=main`, {}, auth);
    assert.deepEqual(seen.at(-1), [`${api}/repository/tree?ref=main`, "GET", { "PRIVATE-TOKEN": GL_TOKEN }]);
    // Reading a public GitLab project without a token: the origin is reachable for this product, no header is sent.
    await fetchText(`${api}/repository/tree?ref=main`, {}, gitlabAuth(p, null));
    assert.deepEqual(seen.at(-1)[2], {});
    const n = seen.length;
    // Known negatives: every other destination is refused before a request is made.
    for (const [url, a, why] of [
      ["https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj", auth, /may only go|not allowed/],      // another GitLab
      [`${GL}/api/v4/projects/grp%2Fother`, auth, /may only go|not allowed/],                               // another project, same server
      [`${GL}/api/v4/user`, auth, /may only go|not allowed/],                                                // same server, outside the project
      [`${GL}/grp/sub/proj/-/raw/main/SPEC.md`, auth, /may only go|not allowed/],                            // same server, not the API
      ["https://api.github.com/repos/a/b", auth, /may only go|not allowed/],                                 // GitHub
      ["https://models.example.org/v1/chat/completions", auth, /not allowed|may only go/],                   // a model endpoint
      [`${api}/repository/tree?private_token=${GL_TOKEN}`, auth, /never placed in a URL/],                   // the token in the URL
      [`${api}/repository/tree`, "github_pat_11GITHUBTOKEN", /not allowed|may only go/],                    // the GitHub token to GitLab
      [`${api}/repository/tree`, null, /not allowed/],                                                       // GitLab without naming the product
    ]) {
      await assert.rejects(fetchText(url, {}, a), why, url);
    }
    // Without a token as well: naming a GitLab product opens that project's API, and no other origin or path.
    for (const url of ["https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj", "https://models.example.org/v1/chat/completions",
      `${GL}/api/v4/projects/grp%2Fother`, `${GL}/api/v4/user`]) {
      await assert.rejects(fetchText(url, {}, gitlabAuth(p, null)), /not allowed/, url);
    }
    await assert.rejects(fetchText(`${api}/repository/commits`, { method: "POST" }, auth), /GET/);
    await assert.rejects(fetchText(`${api}/x`, { headers: { "PRIVATE-TOKEN": "x" } }, auth), /header/);
    assert.equal(seen.length, n, "no refused request reached the network");
  } finally { globalThis.fetch = real; }
  // authHeaders: the same rule for writes.
  assert.deepEqual(authHeaders(`${api}/repository/commits`, auth), { "PRIVATE-TOKEN": GL_TOKEN });
  assert.deepEqual(authHeaders("https://api.github.com/repos/a/b", auth), {});
  assert.deepEqual(authHeaders(`https://gitlab.other.org/api/v4/projects/grp%2Fsub%2Fproj`, auth), {});
  assert.deepEqual(authHeaders(`${GL}/api/v4/projects/grp%2Fother/repository/commits`, auth), {}, "another project on the same server");
  assert.deepEqual(authHeaders(`${GL}/api/v4/user`, auth), {}, "the same server outside the project");
  assert.deepEqual(authHeaders(`${api}/x`, "github_pat_t"), {});
  assert.deepEqual(authHeaders("https://api.github.com/repos/a/b", "github_pat_t"), { Authorization: "Bearer github_pat_t" });
});

test("GITLAB PRODUCTS ARE SUPPORTED — reading: the pinned commit, every page of the tree, raw files at that commit", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = { "SPEC.md": "# S\n", "docs/use-cases/UC-001-a.md": B_UC1 };
  for (let i = 0; i < 130; i++) files[`docs/approvals/r${String(i).padStart(3, "0")}.md`] = `kind: use-case\nn: ${i}\n`;
  const g = await fakeGitLab({ files });
  const snap = await withFetch(g.fetchMock, () => gitlabSnapshot({ product: p, ref: "main", token: GL_TOKEN }));
  assert.equal(snap.commit, H0);
  assert.equal(snap.tree.length, 132, "all blobs of every page, no directories");
  assert.equal(snap.tree.find((e) => e.path === "docs/use-cases/UC-001-a.md").sha, await gitBlobSha(B_UC1), "tree entries carry the blob SHA");
  const treeCalls = g.calls.filter((c) => c.path.endsWith("/repository/tree"));
  assert.ok(treeCalls.length >= 2, "paged");
  assert.ok(treeCalls.every((c) => c.query.ref === H0 && c.query.recursive === "true"), "the tree of the pinned commit, not of the branch");
  const text = await withFetch(g.fetchMock, () => gitlabReadFile({ product: p, commit: H0, path: "docs/use-cases/UC-001-a.md", token: GL_TOKEN }));
  assert.equal(text, B_UC1);
  assert.equal(g.calls.at(-1).query.ref, H0);
  assert.equal(await withFetch(g.fetchMock, () => gitlabReadFile({ product: p, commit: H0, path: "nope.md", token: GL_TOKEN })), null);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN && c.authorization === undefined), "only to its server, only its token");
});

test("GitLab writes: one commit with several actions — create where absent, update with last_commit_id where present", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const r = await withFetch(g.fetchMock, () => commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "new\n" }, { path: "docs/approvals/x.md", content: "kind: spec\n" }] }));
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "exactly one commit");
  assert.equal(posts[0].path, `/api/v4/projects/${encodeURIComponent("grp/sub/proj")}/repository/commits`);
  assert.deepEqual(posts[0].body, { branch: "main", commit_message: "m", actions: [
    { action: "update", file_path: "SPEC.md", content: "new\n", encoding: "text", last_commit_id: H0 },
    { action: "create", file_path: "docs/approvals/x.md", content: "kind: spec\n", encoding: "text" }] });
  assert.equal(posts[0].body.force, undefined, "never force");
  assert.equal(posts[0].body.start_sha, undefined);
  assert.equal(r.sha, NEWC);
  assert.equal(r.url, `${GL}/grp/sub/proj/-/commit/${NEWC}`);
  assert.deepEqual(r.changedMeanwhile, []);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN), "every request to its server with its token");
});

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN — no token or no click: nothing is sent; the route is the token step", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "SPEC.md": B_SPEC } });
  const base = { product: p, branch: "main", message: "m", files: [{ path: "x.md", content: "x\n" }] };
  await withFetch(g.fetchMock, async () => {
    await assert.rejects(writeFiles({ ...base, token: null, click }), /token/);
    await assert.rejects(writeFiles({ ...base, token: GL_TOKEN }), /click/);
    await assert.rejects(writeFiles({ ...base, token: GL_TOKEN, click: { isTrusted: false } }), /click/);
    await assert.rejects(writeFiles({ ...base, token: "github_pat_11GITHUBTOKEN", click }), /GitLab project token/);
    await assert.rejects(commitFilesGitLab({ ...base, token: GL_TOKEN }), /click/, "the GitLab writer itself needs the click");
    await assert.rejects(commitFilesGitLab({ ...base, token: null, click }), /token/, "and the token");
  });
  assert.equal(g.calls.length, 0);
  assert.equal(writeRoute(p, null), "token-step");
  assert.equal(writeRoute(p, GL_TOKEN), "commit");
  const gh = parseProductAddress("https://github.com/alice/thesis");
  assert.equal(writeRoute(gh, null), "github-web", "GitHub keeps its web-interface fallback");
  assert.equal(writeRoute(gh, "github_pat_t"), "commit");
});

test("GitLab: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — a changed blob or a moved branch writes nothing", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = await fakeGitLab({ files: { "docs/use-cases/UC-001-a.md": "newer\n" } });
  await withFetch(g.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "edit", token: GL_TOKEN, click,
    files: [{ path: "docs/use-cases/UC-001-a.md", content: "mine\n", expectBlob: "older" }] }), /changed since/));
  assert.ok(!g.calls.some((c) => c.method === "POST"), "nothing written");
  // The branch moved between the read the files were computed from and the commit: nothing is written.
  const m = await fakeGitLab({ files: { "SPEC.md": B_SPEC }, moveAt: 1 });
  await withFetch(m.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "x\n" }] }), /moved on|reload/));
  assert.ok(!m.calls.some((c) => c.method === "POST"), "nothing written");
  // GitLab's own refusal (last_commit_id, or a file created meanwhile) is passed on, with its status.
  const r = await fakeGitLab({ files: { "SPEC.md": B_SPEC }, postStatus: 400, postBody: { message: "The file has changed since you started editing it: SPEC.md" } });
  await withFetch(r.fetchMock, () => assert.rejects(commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, click,
    files: [{ path: "SPEC.md", content: "x\n" }] }), (e) => e.status === 400 && /changed since you started editing/.test(e.message)));
});

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a GitLab project token by its product, renewed on its project's page", async () => {
  const p = parseProductAddress(GL_ADDR);
  const g = { fetchMock: async () => new Response('{"message":"401 Unauthorized"}', { status: 401, statusText: "Unauthorized" }) };
  let err;
  await withFetch(g.fetchMock, async () => { try { await fetchText(`${gitlabApiBase(p)}`, {}, gitlabAuth(p, GL_TOKEN)); } catch (e) { err = e; } });
  const r = tokenRefusal(err, p);
  assert.equal(r.token, `GitLab project token for ${GL_ADDR}`);
  assert.equal(r.renewUrl, `${GL_ADDR}/-/settings/access_tokens`);
  assert.match(r.renew, /Rotate/);
  assert.equal(tokenRefusal(err).token, "GitHub token", "without a product it is the GitHub token, as before");
  const w = expiryWarning("2026-10-05", new Date("2026-09-30T12:00:00Z"), p);
  assert.match(w.text, /GitLab project token for .*proj/);
  assert.equal(w.renewUrl, `${GL_ADDR}/-/settings/access_tokens`);
  const b = tokenBannerHtml({ expires: null, refused: true, product: p });
  assert.match(b, /GitLab project token/);
  assert.ok(b.includes(`${GL_ADDR}/-/settings/access_tokens`));
});
