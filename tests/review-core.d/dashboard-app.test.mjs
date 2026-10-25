// The dashboard's texts, steps and views (src/site-frame/dashboard-app.mjs, docs/assets/dashboard/) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; UC-001
// Level: component
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { parseFrontMatter, headerModules } from "../../docs/assets/artifacts.mjs";
import { tokenListUrl, parseProductAddress, fetchText, gitlabAuth, gitlabApiBase } from "../../docs/assets/git-host.mjs";
import * as gitHost from "../../docs/assets/git-host.mjs";
import { stepHtml, gitlabWriteRefusal } from "../../src/site-frame/dashboard-app.mjs";
import * as shell from "../../src/site-frame/dashboard-app.mjs";
import { ASSETS, APP, viewFiles, dashboardText, GL_ADDR, GL_TOKEN, withFetch } from "./helpers.mjs";

// Every module file of the site (vendored libraries excepted), with the modules its Module line names.
const moduleFiles = () => [...readdirSync(ASSETS, { recursive: true }).filter((f) => f.endsWith(".mjs") && !f.split("/").includes("vendor"))
  .map((f) => ({ file: f, text: readFileSync(new URL(f, ASSETS), "utf8") })), { file: "dashboard-app.mjs", text: readFileSync(APP, "utf8") }]
  .sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
// The adapters (ARC-003 decision 1): the modules that reach the outside, as the code is built.
function adapterModules() {
  return new Set(["MOD-git-host", "MOD-settings-store", "MOD-participants", "MOD-mailbox", "MOD-bridge-server", "MOD-bridge-tunnel"]);
}

test("the app never calls fetch directly — every request goes through fetchText", () => {
  // ARC-003 decision 6: no module file but an adapter's calls fetch or touches browser storage — the dashboard's files and every
  // kernel and feature file. A file's module is its Module line; a file naming no adapter is checked.
  const adapters = adapterModules(), files = moduleFiles();
  const checked = files.filter((f) => !headerModules(f.text).some((m) => adapters.has(m)));
  assert.ok(adapters.has("MOD-git-host") && adapters.has("MOD-settings-store"), "the adapters are listed");
  assert.ok(!checked.some((f) => f.file === "git-host.mjs") && checked.some((f) => f.file === "dashboard-app.mjs")
    && checked.some((f) => f.file === "artifacts.mjs"), "kernel and shell files are checked");
  const FORBIDDEN = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\b(globalThis|window|self)\s*\.\s*(localStorage|sessionStorage)\b|\b(localStorage|sessionStorage)\s*[.[]|document\.cookie/;
  for (const { file, text: app } of checked) assert.doesNotMatch(app.replace(/fetchText\(/g, ""), FORBIDDEN, file);
  // counter-proof: access is caught, the word in an explanation is not
  assert.match("localStorage.getItem('t')", FORBIDDEN);
  assert.match("fetch(url)", FORBIDDEN);
  assert.match("const s = globalThis.localStorage;", FORBIDDEN);
  assert.doesNotMatch("saved in this browser (its <code>localStorage</code>)", FORBIDDEN);
});

// The kernel (ARC-003 decision 1): the modules of pure functions and data, as the code is built.
function kernelModules() {
  return new Set(["MOD-artifacts", "MOD-review-core", "MOD-traceability", "MOD-job-harness", "MOD-run-engine", "MOD-process-model",
    "MOD-work-items"]);
}
// The three write functions of the git host (MOD-git-host): the one write path and the commit on each kind of server.
const GIT_HOST_WRITES = ["commitFiles", "commitFilesGitLab", "writeFiles"];
// What a module file imports from the git host: each name it imports (an alias counts by its original name), and "*" for a
// namespace or dynamic import, which reaches every function of it.
function gitHostImports(text) {
  const out = [];
  for (const m of text.matchAll(/\bimport\s+([^;]*?)\s+from\s+["']([^"']+)["']/g)) {
    if (!/(^|\/)git-host\.mjs$/.test(m[2])) continue;
    if (/\*\s*as\s+[\w$]+/.test(m[1])) out.push("*");
    for (const n of (m[1].match(/\{([^}]*)\}/)?.[1] ?? "").split(",")) {
      const name = n.trim().split(/\s+as\s+/)[0];
      if (name) out.push(name);
    }
  }
  if (/\bimport\s*\(\s*[^)]*git-host\.mjs/.test(text)) out.push("*");
  return out;
}

test("the kernel never writes — no kernel file imports a write function of the git host", () => {
  // ARC-003 decision 1: a kernel module imports only kernel modules; MOD-review-core returns the files, and a shell commits
  // them on its authority. The kernel's reads through the git host are not checked here (ITM-124). A file's module is its
  // Module line; the kernel is read from the group file.
  const kernel = kernelModules(), files = moduleFiles();
  const checked = files.filter((f) => headerModules(f.text).some((m) => kernel.has(m)));
  assert.ok(kernel.has("MOD-review-core") && kernel.has("MOD-artifacts") && !kernel.has("MOD-git-host"), "the kernel is read from the group file");
  assert.ok(checked.some((f) => f.file === "review-core.mjs") && !checked.some((f) => f.file.startsWith("dashboard")),
    "the kernel's files are checked, the dashboard's are not");
  for (const { file, text } of checked) {
    assert.deepEqual(gitHostImports(text).filter((n) => n === "*" || GIT_HOST_WRITES.includes(n)), [], file);
  }
  // counter-proof: each way of importing a write function is caught, a read is not, and another module's writeFiles is not
  assert.deepEqual(gitHostImports('import {\n  fetchText, writeFiles,\n} from "./git-host.mjs";'), ["fetchText", "writeFiles"]);
  assert.deepEqual(gitHostImports('import { commitFiles as commit } from "../git-host.mjs";'), ["commitFiles"]);
  assert.deepEqual(gitHostImports('import * as gitHost from "./git-host.mjs";'), ["*"]);
  assert.deepEqual(gitHostImports('const g = await import("./git-host.mjs");'), ["*"]);
  assert.deepEqual(gitHostImports('import { fetchText } from "./git-host.mjs";\nimport { writeFiles } from "./other.mjs";'), ["fetchText"]);
});

// Guards: UC-024
test("the kernel never reads through the git host — no kernel file imports anything of it", () => {
  // ARC-003 decisions 1 and 2: a kernel module imports only kernel modules; what it reads is handed to it as a port
  // (MOD-review-core lastAccepted's committedAt and read), and a shell wires the git host's reads to it (ITM-130). The kernel is
  // read from the group file, a file's module from its Module line, as in the check above.
  const kernel = kernelModules(), files = moduleFiles();
  const checked = files.filter((f) => headerModules(f.text).some((m) => kernel.has(m)));
  assert.ok(checked.some((f) => f.file === "review-core.mjs") && checked.some((f) => f.file === "artifacts.mjs"), "the kernel's files are checked");
  for (const { file, text } of checked) assert.deepEqual(gitHostImports(text), [], file);
  // counter-proof: a read imported into the kernel is caught — the check above lets it pass, it is no write
  assert.deepEqual(gitHostImports('import { readBlob, REPO_RE } from "./git-host.mjs";'), ["readBlob", "REPO_RE"]);
});

// Guards: UC-024
test("the shells read only through what the git host provides — no file of the dashboard imports fetchText", () => {
  // MOD-git-host calls its request helper internal: the dashboard reads through readSnapshot, readFile, readBlob,
  // commitsTouching and repositoryInfo (ITM-130). A namespace or dynamic import reaches the helper too. No exception: Add
  // product reads a GitHub product's branch through readSnapshot (ITM-130, back from Release testing, finding A1).
  const files = moduleFiles().filter((f) => headerModules(f.text).includes("MOD-dashboard-app"));
  assert.ok(files.some((f) => f.file === "dashboard-app.mjs"), "the shell's files are checked");
  const importing = files.filter((f) => gitHostImports(f.text).some((n) => n === "*" || n === "fetchText")).map((f) => f.file);
  assert.deepEqual(importing, [], "no file of the dashboard imports the request helper");
  // counter-proof: the helper imported by name, by a namespace or dynamically is caught; a provided read is not
  assert.deepEqual(gitHostImports('import { readFile, fetchText as get } from "../git-host.mjs";'), ["readFile", "fetchText"]);
  assert.deepEqual(gitHostImports('import * as host from "./git-host.mjs";'), ["*"]);
  assert.deepEqual(gitHostImports('import { readSnapshot, repositoryInfo } from "./git-host.mjs";'), ["readSnapshot", "repositoryInfo"]);
});

// The git host's reads that MOD-git-host keeps to itself: the request helper and the GitLab reads behind readSnapshot,
// readFile and repositoryInfo. Each sends a request; none is in MOD-git-host's `provides`.
const GIT_HOST_INTERNAL_READS = ["fetchText", "request", "gitlabProject", "gitlabSnapshot", "gitlabReadFile"];
// MOD-git-host's interfaces: the names it provides to the other modules, as the code is built.
const gitHostProvides = () => new Set(["assetAnswer", "assetRequest", "authHeaders", "branchHead", "branchProtection", "cancelRun",
  "candidateTags", "checks", "commentIssue", "commitFiles", "commitOf", "commitsTouching", "createBranch", "createIssue", "createTag",
  "dispatchWorkflow", "editUrl", "fileUrl", "issueClosedBy", "issueComments", "issueLabel", "issues", "latestRelease",
  "mergePullRequest", "newFileUrl", "openPullRequest", "parseProductAddress", "pathHistory", "pipelineSchedules",
  "pipelineSchedulesPageUrl", "pullRequestCommits", "pullRequests", "readBlob", "readBlobBytes", "readFile", "readSnapshot",
  "recentCommits", "releaseTags", "releaseText", "releaseWith", "repositoryInfo", "requiredPermissions", "runnersPageUrl",
  "savePipelineSchedule", "secretsPageUrl", "setIssueBody", "setIssueState", "tagCommits", "tokenAccount", "tokenPageUrl",
  "treeUrl", "workflowPageUrl", "workflowRuns", "writeFiles"]);

// Guards: UC-024; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
test("the shells read only through what the git host provides — no file of the dashboard imports a read MOD-git-host keeps to itself", () => {
  // ITM-130, back from Release testing (A2): checkGitLab reads a GitLab project through repositoryInfo, not gitlabProject.
  const provides = gitHostProvides();
  assert.ok(provides.has("repositoryInfo") && provides.has("readSnapshot") && provides.size >= 10, "the interfaces are read");
  for (const n of GIT_HOST_INTERNAL_READS) {
    assert.ok(!provides.has(n), `${n} is not provided`);
    assert.equal(typeof gitHost[n], "function", `${n} is a function of the git host`);
  }
  const files = moduleFiles().filter((f) => headerModules(f.text).includes("MOD-dashboard-app"));
  const reading = files.flatMap((f) => gitHostImports(f.text).filter((n) => n === "*" || GIT_HOST_INTERNAL_READS.includes(n))
    .map((n) => `${f.file}: ${n}`));
  assert.deepEqual(reading, []);
  // counter-proof: a GitLab read imported by name or under another name is caught; the provided read is not
  assert.deepEqual(gitHostImports('import { repositoryInfo, gitlabProject as project } from "../git-host.mjs";')
    .filter((n) => GIT_HOST_INTERNAL_READS.includes(n)), ["gitlabProject"]);
});

// ---------------------------------------------------------------- one click per decision (queue 2026-09-24)

test("EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered", () => {
  const h = stepHtml({ title: "Step A", body: "<p>x</p>", explain: "A token is a key." });
  assert.match(h, /class="step"/);
  assert.match(h, /<details class="explain"><summary>What is this\?<\/summary>/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x", explain: "" }), /explain/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x" }), /explain/);
});

// ---------------------------------------------------------------- products in the browser (UC-001)

test("every site module parses — the app itself is only run in a browser, so check its syntax here", () => {
  for (const u of [APP, ...viewFiles(), new URL("review-core.mjs", ASSETS), new URL("settings-store.mjs", ASSETS)]) {
    const r = spawnSync(process.execPath, ["--check", u.pathname]);
    assert.equal(r.status, 0, `${u.pathname}: ${r.stderr}`);
  }
});

test("the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed", () => {
  assert.equal(tokenListUrl(), "https://github.com/settings/personal-access-tokens");
});

// ---------------------------------------------------------------- the use-case key is `area` (was `stage`)

test("the use-case key is `area` — `stage` is used nowhere in the dashboard's own files", () => {
  const app = dashboardText();
  const STAGE = /\bstages?\b/i;
  assert.doesNotMatch(app, STAGE);
  assert.equal(parseFrontMatter("---\nid: UC-001\narea: setup\n---\n").fields.area, "setup");
  // Counter-proof: the old column is caught.
  assert.match("<td>${h(u.fields.stage)}</td>", STAGE);
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN (UC-001 3c/3d)


// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT (UC-008 2a)

// ---------------------------------------------------------------- a used-up rate limit (queue 2026-10-01b, ITM-005)
// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// Each check below was first red on the commit that held only the tests of ITM-005; the faults planted afterwards in the
// finished code, and the checks they turned red, are listed in the pull request of ITM-005.

const RESET = 1790000000; // X-RateLimit-Reset, seconds
const AT = new Date((RESET - 17 * 60) * 1000); // seventeen minutes before the reset
const resetTime = new Date(RESET * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const GH = parseProductAddress("https://github.com/akmaier/agent-m");
const limitHeaders = (limit, remaining = 0) => ({ "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining),
  "X-RateLimit-Reset": String(RESET) });
// The error the dashboard's read gets from fetchText when the server answers `status` with `headers`.
async function refused(status, headers = {}, { url = "https://api.github.com/repos/akmaier/agent-m/commits/main", auth = "github_pat_STORED" } = {}) {
  let err = null;
  await withFetch(async () => new Response('{"message":"refused"}', { status, statusText: "Forbidden", headers }), async () => {
    try { await fetchText(url, {}, auth); } catch (e) { err = e; }
  });
  return err;
}

test("A USED-UP RATE LIMIT IS NAMED — the load error names the account's limit and when it resets, and nothing about the token", async () => {
  const html = shell.loadErrorHtml({ error: await refused(403, limitHeaders(5000)), product: GH, ref: "main", hasToken: true, now: AT });
  assert.match(html, /Could not read akmaier\/agent-m @ main/);
  assert.match(html, /your account/);
  assert.match(html, /used up/);
  assert.ok(html.includes(resetTime), `names the reset time ${resetTime}`);
  assert.match(html, /in 17 minutes/);
  assert.doesNotMatch(html, /token/i, "says nothing about the token");
  assert.doesNotMatch(html, /60 API calls/, "not the hint for reading without a token");
});

test("A USED-UP RATE LIMIT IS NAMED — without a token, the network's limit and when it resets", async () => {
  const html = shell.loadErrorHtml({ error: await refused(403, limitHeaders(60), { auth: null }), product: GH, ref: "main",
    hasToken: false, now: AT });
  assert.match(html, /this network/);
  assert.match(html, /used up/);
  assert.ok(html.includes(resetTime));
  assert.match(html, /in 17 minutes/);
  assert.doesNotMatch(html, /refused your|cannot (read|write)|lacks/, "nothing is reported as refused");
});

test("A USED-UP RATE LIMIT IS NAMED — a refused write names the limit; counter-proof: a 403 without the headers is a missing permission", async () => {
  const limited = shell.writeRefusalText(await refused(403, limitHeaders(5000)), GH, AT);
  assert.match(limited, /used up/);
  assert.match(limited, /in 17 minutes/);
  assert.doesNotMatch(limited, /token/i);
  // Counter-proof: without the headers, the write is still reported as the token's missing permission.
  const plain = await refused(403);
  assert.match(shell.writeRefusalText(plain, GH, AT), /Your token cannot write to akmaier\/agent-m/);
  // ... and the load error says the stored token lacks a permission, not that the limit without a token was reached.
  const load = shell.loadErrorHtml({ error: plain, product: GH, ref: "main", hasToken: true, now: AT });
  assert.match(load, /permission/);
  assert.doesNotMatch(load, /60 API calls|used up/);
  assert.equal(shell.rateLimitText(plain, GH, AT), null);
});

test("A USED-UP RATE LIMIT IS NAMED — a GitLab product's limit is named by its server, without a time", async () => {
  const p = parseProductAddress(GL_ADDR);
  const err = await refused(429, {}, { url: gitlabApiBase(p), auth: gitlabAuth(p, GL_TOKEN) });
  const text = shell.rateLimitText(err, p, AT);
  assert.ok(text && text.includes(p.host), "names the server");
  assert.match(text, /used up/);
  assert.match(text, /does not tell this page when/);
  assert.doesNotMatch(text, /in \d+ minutes/);
  assert.doesNotMatch(text, /token/i);
  // The same text where a GitLab write is refused.
  assert.equal(shell.writeRefusalText(err, p, AT), text);
});

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — the load error still names a refused token and links its renewal", async () => {
  const html = shell.loadErrorHtml({ error: await refused(401, limitHeaders(5000, 4999)), product: GH, ref: "main", hasToken: true, now: AT });
  assert.match(html, /GitHub rejected authentication with your GitHub token/);
  assert.ok(html.includes("https://github.com/settings/personal-access-tokens"), "the renewal link");
  assert.doesNotMatch(html, /used up/);
});
