// Release tests of the sprint 01 increment — the git host's boundary (ITM-141). Written by tester-opus (claude-opus-5-5), the
// Release tester of docs/process.md, who implemented nothing of the increment, from the SPEC rules alone; started on sprint/02 at
// ef4f619 (main at 385f5cf plus records only), 2026-10-01.
//
// Module: MOD-git-host
// Guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: release
//
// Why at the adapter's boundary: no CI job and no bridge exists yet that would carry a CI secret or an agent's own login end
// to end (ITM-141, *Outcome*). What the SPEC asks of the git host is that it writes only on an authority, takes each of the
// three kinds, writes with the person's token it is given, refuses a write whose file changed, and tells a used-up limit and a
// refused token apart. Each expectation below is stated before the case runs, from the rule it names; the server is a fake
// GitHub in this file — no request leaves the process.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { commitFiles, fetchText, usedUpLimit, tokenRefusal } from "../docs/assets/git-host.mjs";

const REPO = "alice/thesis-tool";
const PERSON_TOKEN = "github_pat_PERSON0123456789abcdefghij";
const HEAD = "1".repeat(40);
const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");
const header = (h, name) => Object.entries(h || {}).find(([k]) => k.toLowerCase() === name)?.[1] ?? null;

// A fake GitHub API for one repository: every request recorded with its method, address and Authorization header.
function fakeGitHub({ files = { "docs/use-cases/UC-001-a.md": "one\n" }, refuse = null } = {}) {
  const requests = [];
  let commits = 0;
  globalThis.fetch = async (u, init = {}) => {
    const url = new URL(String(u)), method = (init.method || "GET").toUpperCase();
    requests.push({ method, url: url.href, origin: url.origin, auth: header(init.headers, "authorization") });
    const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", ...headers } });
    if (refuse) { const r = refuse(url, method); if (r) return r; }
    const api = `/repos/${REPO}`;
    if (method === "GET" && url.pathname === `${api}/git/ref/heads/main`) return json({ object: { sha: HEAD } });
    if (method === "GET" && url.pathname === `${api}/git/commits/${HEAD}`) return json({ sha: HEAD, tree: { sha: "2".repeat(40) } });
    if (method === "GET" && url.pathname.startsWith(`${api}/contents/`)) {
      const path = decodeURIComponent(url.pathname.slice(`${api}/contents/`.length));
      return path in files ? json({ path, sha: blobSha(files[path]) }) : json({ message: "Not Found" }, 404);
    }
    if (method === "POST" && url.pathname === `${api}/git/trees`) return json({ sha: "3".repeat(40) });
    if (method === "POST" && url.pathname === `${api}/git/commits`) { commits += 1; return json({ sha: "4".repeat(40), html_url: `https://github.com/${REPO}/commit/${"4".repeat(40)}` }); }
    if (method === "PATCH" && url.pathname === `${api}/git/refs/heads/main`) return json({ object: { sha: "4".repeat(40) } });
    return json({ message: "Not Found" }, 404);
  };
  return { requests, writes: () => requests.filter((r) => r.method !== "GET"), commits: () => commits };
}

const oneFile = [{ path: "docs/use-cases/UC-002-b.md", content: "two\n" }];

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — at the write path: a write without an authority is refused before anything is
// sent. Expected: commitFiles rejects, and the server saw no request at all.
test("release · git host: a write without an authority is refused before any request is sent", async () => {
  for (const authority of [undefined, null, {}, { kind: "timer" }, { kind: "click", extra: 1 }, "click"]) {
    const gh = fakeGitHub();
    await assert.rejects(commitFiles({ repo: REPO, branch: "main", files: oneFile, message: "m", token: PERSON_TOKEN, authority }),
      `authority ${JSON.stringify(authority)} must be refused`);
    assert.deepEqual(gh.requests, [], `authority ${JSON.stringify(authority)}: nothing may be sent`);
  }
});

// THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK · A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT
// USES THE PERSON'S OWN LOGIN — the three authorities the SPEC knows: a person's click, the person's token from a CI secret, an
// agent's own login. Expected for each: one commit is written, and every request carries the person's token as GitHub's
// Authorization — no other credential, and only to GitHub's API.
test("release · git host: each of the three authorities writes one commit with the person's own token", async () => {
  for (const kind of ["click", "ci-secret", "agent-login"]) {
    const gh = fakeGitHub();
    const c = await commitFiles({ repo: REPO, branch: "main", files: oneFile, message: "m", token: PERSON_TOKEN, authority: { kind } });
    assert.equal(gh.commits(), 1, `${kind}: one commit`);
    assert.match(c.sha, /^[0-9a-f]{40}$/, `${kind}: the commit is named`);
    assert.ok(gh.writes().some((r) => r.method === "PATCH"), `${kind}: the branch moved to the commit`);
    for (const r of gh.requests) {
      assert.equal(r.origin, "https://api.github.com", `${kind}: ${r.url}`);
      assert.equal(r.auth, `Bearer ${PERSON_TOKEN}`, `${kind}: ${r.method} ${r.url} carries the person's token`);
    }
  }
});

// A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — the blob SHA taken when the editor opened is the comparison. Expected:
// with a file on the branch whose text differs from the expected blob, the write is refused and nothing is written; with the
// expected blob equal to the branch's text, it is written.
test("release · git host: a save whose file changed on the branch writes nothing", async () => {
  const path = "docs/use-cases/UC-001-a.md";
  const gh = fakeGitHub({ files: { [path]: "one, changed by someone else\n" } });
  await assert.rejects(commitFiles({ repo: REPO, branch: "main", message: "edit", token: PERSON_TOKEN, authority: { kind: "click" },
    files: [{ path, content: "my edit\n", expectBlob: blobSha("one\n") }] }), /changed/);
  assert.deepEqual(gh.writes(), [], "nothing is written");
  const gh2 = fakeGitHub({ files: { [path]: "one\n" } });
  await commitFiles({ repo: REPO, branch: "main", message: "edit", token: PERSON_TOKEN, authority: { kind: "click" },
    files: [{ path, content: "my edit\n", expectBlob: blobSha("one\n") }] });
  assert.equal(gh2.commits(), 1, "unchanged since opened: written");
});

// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN — at the adapter: GitHub's 403 with X-RateLimit-Remaining 0 and a
// limit of 5000 is the account's limit with its reset time; with a limit of 60 it is the network's. Expected: the read's error
// is named as that limit, and is no refused token; a 403 without those headers is no used-up limit.
test("release · git host: a 403 with a used-up limit is the account's or the network's limit, not a refused token", async () => {
  const reset = Math.floor(Date.now() / 1000) + 1800;
  const limited = (limit) => () => new Response('{"message":"API rate limit exceeded"}', { status: 403, headers: {
    "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(reset) } });
  fakeGitHub({ refuse: limited(5000) });
  const e = await fetchText(`https://api.github.com/repos/${REPO}`, {}, PERSON_TOKEN).then(() => null, (x) => x);
  assert.ok(e, "the read fails");
  const l = usedUpLimit(e);
  assert.equal(l?.limit, "account");
  assert.equal(l.resetsAt?.getTime(), reset * 1000, "the reset time the server sent");
  assert.equal(tokenRefusal(e), null, "not a refused token");
  fakeGitHub({ refuse: limited(60) });
  const n = await fetchText(`https://api.github.com/repos/${REPO}`).then(() => null, (x) => x);
  assert.equal(usedUpLimit(n)?.limit, "network");
  fakeGitHub({ refuse: () => new Response('{"message":"Resource not accessible by personal access token"}', { status: 403 }) });
  const p = await fetchText(`https://api.github.com/repos/${REPO}`, {}, PERSON_TOKEN).then(() => null, (x) => x);
  assert.equal(usedUpLimit(p), null, "a 403 without the limit's headers is no used-up limit");
});

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — at the adapter: a server's 401 names the token it refused and the page on
// which it is renewed. Expected: GitHub's 401 names the GitHub token and links GitHub's token pages; a GitLab product's 401
// names that project's token and its Access tokens page; a 403 is no refused token.
test("release · git host: a 401 names the refused token and where it is renewed", async () => {
  fakeGitHub({ refuse: () => new Response('{"message":"Bad credentials"}', { status: 401 }) });
  const e = await fetchText(`https://api.github.com/repos/${REPO}`, {}, PERSON_TOKEN).then(() => null, (x) => x);
  const r = tokenRefusal(e);
  assert.match(r?.token ?? "", /GitHub token/);
  assert.match(r.renewUrl, /^https:\/\/github\.com\/settings\/personal-access-tokens/);
  assert.match(r.text, /GitHub token/);
  const gl = { address: "https://gitlab.example.org/team/proj", host: "gitlab.example.org", repo: "team/proj",
    server: "https://gitlab.example.org", kind: "gitlab" };
  const g = tokenRefusal({ status: 401 }, gl);
  assert.match(g?.token ?? "", /GitLab project token for https:\/\/gitlab\.example\.org\/team\/proj/);
  assert.equal(g.renewUrl, "https://gitlab.example.org/team/proj/-/settings/access_tokens");
  assert.equal(tokenRefusal({ status: 403 }), null, "403 is a missing permission, not a refused token");
});

// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — at the adapter: the GitHub token never leaves for another origin. Expected:
// a read of a GitLab server's address with the GitHub token sends nothing, or sends it without the token; a read of GitHub's
// API sends it as Authorization.
test("release · git host: the GitHub token is sent to GitHub's API only", async () => {
  const gh = fakeGitHub();
  await fetchText("https://gitlab.example.org/api/v4/projects/team%2Fproj", {}, PERSON_TOKEN).catch(() => null);
  assert.ok(gh.requests.every((r) => r.auth === null), "no request to another server carries the GitHub token");
  assert.ok(gh.requests.every((r) => !r.url.includes(PERSON_TOKEN)), "and none carries it in its address");
  await fetchText(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, {}, PERSON_TOKEN);
  assert.equal(gh.requests.at(-1).auth, `Bearer ${PERSON_TOKEN}`);
});
