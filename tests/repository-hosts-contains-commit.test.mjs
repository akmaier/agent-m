// MOD-repository-hosts' containsCommit (ITM-522), as the accepted text of docs/architecture/MOD-repository-hosts.md states it:
// "containsCommit(branch: string, commit: string) -> Promise<boolean> — whether the branch's history holds the commit: on GitHub
// and GitLab through the server's comparison of the two, in a clone with `git merge-base --is-ancestor`. A commit the server does
// not know is not contained. Crosses the network; fails as `readSnapshot`." (UC-032: the fact a caller hands heldItems as onDefault).
// Deterministic, no network: the servers are fakes of `fetch`; the clone is a real repository in a temporary folder. The requests
// the item builds where the module file leaves them open, each read from the server's own page:
//   GitHub — docs.github.com/en/rest/commits/commits "Compare two commits": GET /repos/{owner}/{repo}/compare/{basehead}, basehead
//     BASE...HEAD; status diverged | ahead | behind | identical; behind_by "commits in base not in head"; 404, 422, 500, 503.
//     Taken: BASE is the commit, HEAD the branch; contained when behind_by is 0 (status ahead or identical).
//   GitLab — docs.gitlab.com/api/repositories/ "Get a merge base": GET /projects/:id/repository/merge_base, refs[] "Refs to find the
//     common ancestor of", answers the commit (id). Taken: contained when that commit's id is the commit asked about; 404 and 400
//     for a ref the server does not know are not contained (the page names no status for an unknown ref).
//   A clone — `git merge-base --is-ancestor <commit> <branch>`: exit 0 contained, exit 1 not, any other exit (an unknown commit) not.
// Run: node --test tests/repository-hosts-contains-commit.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-032; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect). A name the module does not provide
// yet fails each test by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GH = "/repos/carol/sprint-tool";
const GL = "/api/v4/projects/space%2Fsprint-tool";
const ON = "1".repeat(40), OFF = "2".repeat(40), UNKNOWN = "0".repeat(40);

function seen(input, init = {}) {
  const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
  const raw = init.headers ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries()) : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? "GET").toUpperCase(), href: url.href, host: url.host, path: url.pathname, query: url.searchParams, headers };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init) => { const r = seen(input, init); requests.push(r); return answer(r); };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

// A GitHub whose comparison of a commit with a branch is answered by `compare(commit, branch)`; any other request is a fault of the caller.
const github = (compare) => (r) => {
  const m = r.path.match(new RegExp(`^${GH}/compare/([^.]+)\\.\\.\\.(.+)$`));
  if (!m) throw new Error(`unrouted request: ${r.method} ${r.href}`);
  return compare(m[1], decodeURIComponent(m[2]));
};
// A GitLab whose merge base of two refs is answered by `base(commit, branch)`.
const gitlab = (base) => (r) => {
  if (r.path !== `${GL}/repository/merge_base`) throw new Error(`unrouted request: ${r.method} ${r.href}`);
  const [a, b] = r.query.getAll("refs[]");
  return base(a, b);
};

// TST-522001 · level: unit · module: MOD-repository-hosts
// guards: UC-032; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: a GitHub repository whose comparison of a commit with the branch "sprint/team1/33" answers 200 ahead (ahead_by 3, behind_by 0) for the commit 1…1, 200 identical (behind_by 0) for the commit 3…3, 200 diverged (ahead_by 2, behind_by 4) for the commit 2…2, and 404 or 422 for the commit 0…0
// input: containsCommit("sprint/team1/33", commit) for each of the four commits
// expect: true for 1…1 and for 3…3, false for 2…2, and false — not an error — for 0…0 on 404 and on 422; one request each, GET /repos/carol/sprint-tool/compare/<commit>...sprint%2Fteam1%2F33 on api.github.com
test("containsCommit on GitHub — contained when behind_by is 0, not when the branch lacks the commit or the server does not know it", async () => {
  const THREE = "3".repeat(40);
  const answers = {
    [ON]: () => json(200, { status: "ahead", ahead_by: 3, behind_by: 0 }),
    [THREE]: () => json(200, { status: "identical", ahead_by: 0, behind_by: 0 }),
    [OFF]: () => json(200, { status: "diverged", ahead_by: 2, behind_by: 4 }),
  };
  const host = connect(GITHUB, { token: GH_TOKEN });
  for (const [commit, expected] of [[ON, true], [THREE, true], [OFF, false]]) {
    const { result, requests } = await serving(github((c) => answers[c]()), () => host.containsCommit("sprint/team1/33", commit));
    assert.equal(result, expected, `commit ${commit[0]}…`);
    assert.deepEqual(requests.map((r) => [r.method, r.host, r.path]), [["GET", "api.github.com", `${GH}/compare/${commit}...sprint%2Fteam1%2F33`]]);
  }
  for (const status of [404, 422]) {
    const { result, requests } = await serving(github(() => json(status, { message: status === 404 ? "Not Found" : "Validation Failed" })), () => host.containsCommit("main", UNKNOWN));
    assert.equal(result, false, `status ${status}`);
    assert.equal(requests.length, 1);
  }
});

// TST-522002 · level: unit · module: MOD-repository-hosts
// guards: UC-032; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: a GitLab project whose merge base of a commit and the branch "main" is answered 200 with the commit itself (id 1…1) for the commit 1…1, 200 with another commit (id 4…4) for the commit 2…2, and 404 or 400 for the commit 0…0
// input: containsCommit("main", commit) for each of the three commits
// expect: true for 1…1; false for 2…2; false — not an error — for 0…0 on 404 and on 400; one request each, GET /api/v4/projects/space%2Fsprint-tool/repository/merge_base on gitlab.example.org with refs[] the commit first and the branch second
test("containsCommit on GitLab — contained when the merge base is the commit, not otherwise or when the server does not know it", async () => {
  const FOUR = "4".repeat(40);
  const host = connect(GITLAB, { token: GL_TOKEN });
  const base = (a) => (a === ON ? json(200, { id: ON, title: "the commit" }) : json(200, { id: FOUR, title: "an older commit" }));
  for (const [commit, expected] of [[ON, true], [OFF, false]]) {
    const { result, requests } = await serving(gitlab(base), () => host.containsCommit("main", commit));
    assert.equal(result, expected, `commit ${commit[0]}…`);
    assert.deepEqual(requests.map((r) => [r.method, r.host, r.path, r.query.getAll("refs[]")]), [["GET", "gitlab.example.org", `${GL}/repository/merge_base`, [commit, "main"]]]);
  }
  for (const status of [404, 400]) {
    const { result, requests } = await serving(gitlab(() => json(status, { message: "Could not find ref" })), () => host.containsCommit("main", UNKNOWN));
    assert.equal(result, false, `status ${status}`);
    assert.equal(requests.length, 1);
  }
});

// ---------------------------------------------------------------- a clone

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function commitFile(dir, name, message) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), `${message}\n`);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", message);
  return git(dir, "rev-parse", "HEAD");
}
// A clone whose `main` holds two commits (first, second) and whose branch `side` leaves main at `first` with a commit of its own (off). -> { root, clone, first, second, off }.
async function withClone(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-contains-"));
  try {
    const clone = join(root, "clone");
    git(root, "init", "-q", "-b", "main", clone);
    git(clone, "config", "user.name", "Clone Owner");
    git(clone, "config", "user.email", "clone@example.org");
    const first = commitFile(clone, "a.md", "first");
    git(clone, "checkout", "-q", "-b", "side");
    const off = commitFile(clone, "side.md", "only on side");
    git(clone, "checkout", "-q", "main");
    const second = commitFile(clone, "b.md", "second");
    return await run({ root, clone, first, second, off });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// TST-522003 · level: unit · module: MOD-repository-hosts
// guards: UC-032; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: a clone whose `main` holds the commits first and second (second after first) and whose branch `side` holds first and a commit "off" that `main` does not hold; a host connected with the clone and no token
// input: containsCommit("main", commit) for first, second, off, and the identifier 0…0 which the clone does not hold; and containsCommit("side", off)
// expect: true for first and for second; false for off; false for 0…0 — not an error; true for ("side", off); no request to any server is made
test("containsCommit in a clone — git's ancestry decides; a commit off the branch and an unknown commit are not contained", async () => {
  await withClone(async ({ clone, first, second, off }) => {
    const host = connect(GITHUB, { clone });
    const { result, requests } = await serving(() => { throw new Error("a clone asks no server"); }, async () => ({
      first: await host.containsCommit("main", first), second: await host.containsCommit("main", second),
      off: await host.containsCommit("main", off), unknown: await host.containsCommit("main", UNKNOWN),
      onSide: await host.containsCommit("side", off),
    }));
    assert.deepEqual(result, { first: true, second: true, off: false, unknown: false, onSide: true });
    assert.equal(requests.length, 0);
  });
});

// TST-522004 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; UC-032
// given: a host of each server that is answered first with a contained commit (known positive), then 401, then a used-up limit (GitHub 403 with x-ratelimit-remaining 0; GitLab 429), then 403, 500 and a failing network
// input: containsCommit("main", 1…1)
// expect: true for the first; then TokenRefused for 401, RateLimited for the limit, PermissionMissing for 403, Unreachable for 500 and for the network — never false in place of a failure
test("containsCommit names how it fails — a refused token is TokenRefused, a used-up limit RateLimited", async () => {
  const servers = [
    { host: () => connect(GITHUB, { token: GH_TOKEN }), ok: github(() => json(200, { status: "ahead", ahead_by: 1, behind_by: 0 })),
      limited: () => json(403, { message: "rate limit" }, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1790000000" }) },
    { host: () => connect(GITLAB, { token: GL_TOKEN }), ok: gitlab(() => json(200, { id: ON })), limited: () => json(429, { message: "Retry later" }) },
  ];
  for (const { host, ok, limited } of servers) {
    assert.equal((await serving(ok, () => host().containsCommit("main", ON))).result, true, "known positive");
    const named = async (answer) => (await failure(serving(answer, () => host().containsCommit("main", ON))))?.name;
    assert.equal(await named(() => json(401, { message: "Bad credentials" })), "TokenRefused");
    assert.equal(await named(limited), "RateLimited");
    assert.equal(await named(() => json(403, { message: "Forbidden" })), "PermissionMissing");
    assert.equal(await named(() => json(500, { message: "Server error" })), "Unreachable");
    assert.equal(await named(() => { throw new TypeError("fetch failed"); }), "Unreachable");
  }
});

// TST-522005 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub host with a token and a GitLab host with a token, and the same two hosts with no token
// input: containsCommit("main", 1…1) on each
// expect: with a token, one request, to api.github.com or to gitlab.example.org respectively, whose Authorization (GitHub: Bearer <token>) or PRIVATE-TOKEN (GitLab: <token>) header carries the token and whose address does not; the other server's header absent; with no token, the same request with neither header
test("containsCommit sends the token only to its own server, in the header and not in the address", async () => {
  const cases = [
    { address: GITHUB, token: GH_TOKEN, host: "api.github.com", header: "authorization", value: `Bearer ${GH_TOKEN}`, other: "private-token",
      answer: github(() => json(200, { status: "ahead", ahead_by: 1, behind_by: 0 })) },
    { address: GITLAB, token: GL_TOKEN, host: "gitlab.example.org", header: "private-token", value: GL_TOKEN, other: "authorization", answer: gitlab(() => json(200, { id: ON })) },
  ];
  for (const { address, token, host, header, value, other, answer } of cases) {
    const withToken = await serving(answer, () => connect(address, { token }).containsCommit("main", ON));
    assert.equal(withToken.result, true);
    assert.deepEqual(withToken.requests.map((r) => [r.host, r.headers[header], r.headers[other], r.href.includes(token)]), [[host, value, undefined, false]]);
    const without = await serving(answer, () => connect(address, {}).containsCommit("main", ON));
    assert.equal(without.result, true);
    assert.deepEqual(without.requests.map((r) => [r.host, r.headers[header], r.headers[other]]), [[host, undefined, undefined]]);
  }
});
