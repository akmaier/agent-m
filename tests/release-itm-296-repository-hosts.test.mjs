// Independent release coverage for ITM-296 through MOD-repository-hosts' public connect interface.

import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect, HostError, parseAddress } from "../src/repository-hosts/index.mjs";

const HEAD = "a".repeat(40), BASE = "b".repeat(40), OLDER = "c".repeat(40);
const GH = "https://github.com/alice/release-fixture", GL = "https://gitlab.example.test/team/release-fixture";
const tokens = { github: "github_pat_RELEASEfixture0123456789abcdef", gitlab: "glpat-RELEASEfixture0123456789" };
const json = (body, headers = {}) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json", ...headers } });
const text = (body) => new Response(body);
const seen = (input, init = {}) => {
  const isRequest = typeof input === "object" && !(input instanceof URL);
  const url = new URL(isRequest ? input.url : String(input));
  const headers = Object.fromEntries(new Headers(init.headers ?? (isRequest ? input.headers : {}) ?? {}).entries());
  return { url, path: url.pathname, method: String(init.method ?? input.method ?? "GET").toUpperCase(), headers };
};
const request = (number, state, branch = "feature/release") => ({ number, iid: number, title: `request ${number}`,
  state: state === "open" ? "open" : state, draft: false, html_url: `https://example.test/pulls/${number}`,
  web_url: `https://example.test/merge_requests/${number}`, created_at: "2026-10-10T08:00:00Z", merged_at: state === "merged" ? "2026-10-10T09:00:00Z" : null,
  closed_at: state === "closed" ? "2026-10-10T09:00:00Z" : null, head: { ref: branch, sha: HEAD }, base: { ref: "main", sha: BASE },
  source_branch: branch, target_branch: "main", sha: HEAD, diff_refs: { base_sha: BASE } });

function server(kind, { refused = false, status = null, limited = false } = {}) {
  const github = kind === "github", origin = github ? "https://api.github.com" : "https://gitlab.example.test";
  const prefix = github ? "/repos/alice/release-fixture" : "/api/v4/projects/team%2Frelease-fixture";
  const calls = [];
  const fetch = async (input, init = {}) => {
    const r = seen(input, init); calls.push(r);
    const credential = github ? r.headers.authorization : r.headers["private-token"];
    if (r.url.origin !== origin || !r.path.startsWith(prefix) || refused || credential !== (github ? `Bearer ${tokens[kind]}` : tokens[kind])) {
      return new Response(JSON.stringify({ message: "refused" }), { status: 401 });
    }
    if (status) return new Response(JSON.stringify({ message: "controlled failure" }), { status,
      headers: limited && github ? { "x-ratelimit-limit": "5000", "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1790000000" } : {} });
    const path = r.path.slice(prefix.length), page = r.url.searchParams.get("page") ?? "1";
    const one = request(17, "open"), two = request(16, "merged", "other"), three = request(15, "closed", "closed-branch");
    if (path === "/pulls" || path === "/merge_requests") {
      const rows = page === "1" ? [one] : page === "2" ? [two] : [three];
      return json(github ? rows.map(({ iid, web_url, source_branch, target_branch, sha, diff_refs, ...p }) => p)
        : rows.map(({ number, html_url, head, base, ...m }) => ({ ...m, state: m.state === "open" ? "opened" : m.state })),
      page !== "3" ? (github ? { link: `<${origin}${prefix}${path}?page=${Number(page) + 1}>; rel="next"` } : { "x-next-page": String(Number(page) + 1) }) : {});
    }
    if (path === "/pulls/17" || path === "/merge_requests/17") return json(github
      ? (({ iid, web_url, source_branch, target_branch, sha, diff_refs, ...p }) => p)(one)
      : (({ number, html_url, head, base, ...m }) => ({ ...m, state: "opened" }))(one));
    if (path === "/pulls/17/commits") return json([{ sha: OLDER, commit: { message: "older" } }, { sha: HEAD, commit: { message: "head" } }]);
    if (path === "/merge_requests/17/commits") return json([{ id: OLDER, message: "older" }, { id: HEAD, message: "head" }]);
    if (github && path === `/commits/${OLDER}`) return json({ files: [{ filename: "old.md" }] });
    if (github && path === `/commits/${HEAD}`) return json({ sha: HEAD, commit: { tree: { sha: HEAD } }, files: [{ filename: "new.md" }] });
    if (github && path === `/commits/${BASE}`) return json({ sha: BASE, commit: { tree: { sha: BASE } } });
    if (!github && path === `/repository/commits/${OLDER}/diff`) return json([{ old_path: "old.md", new_path: "old.md" }]);
    if (!github && path === `/repository/commits/${HEAD}/diff`) return json([{ old_path: "new.md", new_path: "new.md", new_file: true }]);
    if (!github && /^\/repository\/commits\/[ab]+$/.test(path)) return json({ id: path.endsWith(HEAD) ? HEAD : BASE });
    if (path === "/actions/runs") return json({ workflow_runs: [{ status: "completed", conclusion: "success" }] });
    if (!github && /^\/repository\/commits\/[ac]+\/statuses$/.test(path)) return json([{ status: "success" }]);
    if (path === "/pulls/17/files") return json([{ filename: "old.md", status: "modified" }, { filename: "new.md", status: "added" }]);
    if (path === "/merge_requests/17/changes") return json({ changes: [{ old_path: "old.md", new_path: "old.md" }, { old_path: "new.md", new_path: "new.md", new_file: true }] });
    if (path === "/pulls/17/reviews") return json([{ user: { login: "reviewer" }, state: "APPROVED", commit_id: HEAD, submitted_at: "2026-10-10T09:00:00Z" }]);
    if (path === `/commits/${HEAD}/check-runs`) return json({ check_runs: [{ name: "build", status: "completed", conclusion: "success", details_url: "https://ci.test/build" }, { name: "queued", status: "queued", details_url: "https://ci.test/queued" }] });
    if (path === `/commits/${HEAD}/status`) return json({ statuses: [{ context: "lint", state: "success", target_url: "https://ci.test/lint" }] });
    if (path === "/merge_requests/17/pipelines") return json([{ id: 7, sha: HEAD }]);
    if (path === "/pipelines/7/jobs") return json([{ name: "build", status: "success", web_url: "https://ci.test/build" }, { name: "lint", status: "pending", web_url: "https://ci.test/lint" }]);
    if (github && path.startsWith("/git/trees/")) return json({ tree: [{ path: "changed.md", type: "blob", sha: path.endsWith(BASE) ? "base-blob" : "head-blob" }] });
    if (!github && path === "/repository/tree") return json([{ path: "changed.md", type: "blob", id: r.url.searchParams.get("ref") === BASE ? "base-blob" : "head-blob" }]);
    if (github && path.startsWith("/contents/")) return path.includes("absent") ? new Response("missing", { status: 404 }) : text(r.url.searchParams.get("ref") === BASE ? "base\n" : "head\n");
    if (!github && /^\/repository\/files\/.*\/raw$/.test(path)) return path.includes("absent") ? new Response("missing", { status: 404 }) : text(r.url.searchParams.get("ref") === BASE ? "base\n" : "head\n");
    return new Response(JSON.stringify({ message: "missing" }), { status: 404 });
  };
  return { calls, fetch };
}

// TST-296101
// level: release
// module: MOD-repository-hosts
// guards: UC-002; UC-032; STATUS IS DERIVED FROM THE RECORDS; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: recorded, three-page GitHub and GitLab pull-request responses through public connect
// input: listPullRequests state/branch filters and pullRequestFacts for request 17
// expect: both hosts preserve full records, ordered immutable facts, every named head check, and cached exact-side reads
test("TST-296101: public Host pull-request lists and facts remain complete on GitHub and GitLab", async () => {
  for (const kind of ["github", "gitlab"]) {
    const fixture = server(kind), address = parseAddress(kind === "github" ? GH : GL), host = connect(address, { token: tokens[kind] });
    const previous = globalThis.fetch; globalThis.fetch = fixture.fetch;
    try {
      assert.deepEqual((await host.listPullRequests({ state: "all" })).map((p) => [p.number, p.state, p.branch, p.base, p.head, p.draft, p.url, p.opened, p.merged, p.closed]), [
        [17, "open", "feature/release", "main", HEAD, false, kind === "github" ? "https://example.test/pulls/17" : "https://example.test/merge_requests/17", "2026-10-10T08:00:00Z", null, null],
        [16, "merged", "other", "main", HEAD, false, kind === "github" ? "https://example.test/pulls/16" : "https://example.test/merge_requests/16", "2026-10-10T08:00:00Z", "2026-10-10T09:00:00Z", null],
        [15, "closed", "closed-branch", "main", HEAD, false, kind === "github" ? "https://example.test/pulls/15" : "https://example.test/merge_requests/15", "2026-10-10T08:00:00Z", null, "2026-10-10T09:00:00Z"],
      ], kind);
      assert.deepEqual((await host.listPullRequests({ state: "open", branch: "feature/release" })).map((p) => p.number), [17], `${kind}: state/branch`);
      const facts = await host.pullRequestFacts(17);
      assert.deepEqual(facts.pullRequest, {
        number: 17, title: "request 17", branch: "feature/release", base: "main", head: HEAD, state: "open", draft: false,
        url: kind === "github" ? "https://example.test/pulls/17" : "https://example.test/merge_requests/17", opened: "2026-10-10T08:00:00Z", merged: null, closed: null,
      }, kind);
      assert.deepEqual(facts.commits, [{ sha: OLDER, message: "older", files: ["old.md"], ci: "success" }, { sha: HEAD, message: "head", files: ["new.md"], ci: "success" }], kind);
      assert.deepEqual(facts.files, [{ path: "old.md", change: "modified" }, { path: "new.md", change: "added" }], kind);
      assert.deepEqual(facts.reviews, kind === "github" ? [{ reviewer: "reviewer", verdict: "approved", commit: HEAD, date: "2026-10-10T09:00:00Z" }] : [], kind);
      assert.deepEqual(facts.checks, kind === "github" ? [
        { name: "build", state: "success", url: "https://ci.test/build" }, { name: "queued", state: "queued", url: "https://ci.test/queued" }, { name: "lint", state: "success", url: "https://ci.test/lint" },
      ] : [
        { name: "build", state: "success", url: "https://ci.test/build" }, { name: "lint", state: "queued", url: "https://ci.test/lint" },
      ], `${kind}: every named head check`);
      assert.equal(await facts.read("changed.md", "base"), "base\n", `${kind}: immutable base`);
      assert.equal(await facts.read("changed.md", "base"), "base\n", `${kind}: cached immutable base`);
      assert.equal(await facts.read("changed.md", "head"), "head\n", `${kind}: immutable head`);
      assert.equal(await facts.read("absent.md", "base"), null, `${kind}: missing side path`);
      const sidePath = kind === "github"
        ? "/repos/alice/release-fixture/contents/changed.md"
        : "/api/v4/projects/team%2Frelease-fixture/repository/files/changed.md/raw";
      assert.equal(fixture.calls.filter((call) => call.path === sidePath && call.url.searchParams.get("ref") === BASE).length, 1, `${kind}: one base blob fetch`);
      assert.equal(fixture.calls.filter((call) => call.path === sidePath && call.url.searchParams.get("ref") === HEAD).length, 1, `${kind}: one head blob fetch`);
    } finally { globalThis.fetch = previous; }
    assert.ok(fixture.calls.some((call) => call.url.searchParams.get("page") === "2"), `${kind}: second list page`);
  }
});

// TST-296102
// level: release
// module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a successful public list followed by controlled refused responses from each host
// input: listPullRequests and pullRequestFacts through public connect
// expect: reads are GET-only at their issuing server and every existing named read failure remains distinct after a known positive
test("TST-296102: public pull-request reads preserve own-server tokens and named refusal", async () => {
  for (const kind of ["github", "gitlab"]) {
    const address = parseAddress(kind === "github" ? GH : GL), positive = server(kind), prior = globalThis.fetch;
    globalThis.fetch = positive.fetch;
    try { await connect(address, { token: tokens[kind] }).listPullRequests({ state: "open" }); } finally { globalThis.fetch = prior; }
    assert.ok(positive.calls.length, `${kind}: known positive read`);
    for (const call of positive.calls) {
      assert.equal(call.method, "GET", `${kind}: read only`);
      assert.equal(kind === "github" ? call.headers.authorization : call.headers["private-token"], kind === "github" ? `Bearer ${tokens[kind]}` : tokens[kind]);
    }
    const cases = [
      ["TokenRefused", server(kind, { refused: true }).fetch],
      ["PermissionMissing", server(kind, { status: 403 }).fetch],
      ["RateLimited", server(kind, { status: kind === "github" ? 403 : 429, limited: kind === "github" }).fetch],
      ["NotFound", server(kind, { status: 404 }).fetch],
      ["Unreachable", async () => { throw new TypeError("controlled network failure"); }],
    ];
    for (const [name, fetch] of cases) {
      globalThis.fetch = fetch;
      try {
        const host = connect(address, { token: tokens[kind], tokenName: `${kind} release token` });
        for (const read of [host.listPullRequests({ state: "open" }), host.pullRequestFacts(17)]) {
          await assert.rejects(read, (error) => error instanceof HostError && error.name === name, `${kind}: ${name}`);
        }
      } finally {
        globalThis.fetch = prior;
      }
    }
  }
});

// TST-296901
// level: release
// module: MOD-repository-hosts
// guards: UC-002; UC-032; STATUS IS DERIVED FROM THE RECORDS
// given: the isolated release cases and the exact public Host source
// input: GitHub Ubuntu CI removes Host.listPullRequests forwarding, runs the same release cases, restores exact bytes, then reruns them
// expect: both named release cases fail normally at the missing public method and pass after byte-exact restoration
test("TST-296901: CI counter-proof restores public Host pull-request forwarding for the same release cases", () => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_296_RELEASE_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-296-release-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const source = join(copied, "src", "repository-hosts", "index.mjs"), testPath = join(copied, "tests", "release-itm-296-repository-hosts.test.mjs");
    const original = readFileSync(source), line = "    listPullRequests: (filter = {}) => adapter.listPullRequests(filter),\n";
    assert.equal(original.toString().split(line).length - 1, 1, "the public forwarding fault target is unique");
    const argv = [process.execPath, "--test", "--test-name-pattern", "TST-29610[1-2]", testPath];
    const invoke = () => { const env = { ...process.env, AGENT_M_296_RELEASE_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 40_000, env }); };
    const originalHash = createHash("sha256").update(original).digest("hex"), testHash = createHash("sha256").update(readFileSync(testPath)).digest("hex");
    const faultStarted = new Date().toISOString(); writeFileSync(source, original.toString().replace(line, "")); const faultHash = createHash("sha256").update(readFileSync(source)).digest("hex"); const failed = invoke(); const faultEnded = new Date().toISOString();
    const restoreStarted = new Date().toISOString(); writeFileSync(source, original); const restoredHash = createHash("sha256").update(readFileSync(source)).digest("hex"); const passed = invoke(); const restoreEnded = new Date().toISOString();
    process.stdout.write(`TST-296901-counterproof ${JSON.stringify({ argv, cwd: copied, originalHash, faultHash, restoredHash, testHash, faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultStdout: failed.stdout, faultStderr: failed.stderr, restoreStarted, restoreEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr })}\n`);
    assert.equal(restoredHash, originalHash, "byte-exact source restoration precedes the same-case pass");
    assert.equal(failed.status, 1, "faulted child has normal Node failure status");
    for (const id of ["TST-296101", "TST-296102"]) assert.match(failed.stdout, new RegExp(`not ok \\d+ - ${id}:`), `${id} fails at public forwarding`);
    assert.match(failed.stdout, /listPullRequests is not a function/, "failure node is the absent public Host method");
    assert.equal(passed.status, 0, "restored same-case child passes");
    for (const id of ["TST-296101", "TST-296102"]) assert.match(passed.stdout, new RegExp(`ok \\d+ - ${id}:`), `${id} passes after restoration`);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
