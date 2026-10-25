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
import { parseAddress, connect } from "../../src/repository-hosts/index.mjs";
import { stepHtml, gitlabWriteRefusal } from "../../src/site-frame/dashboard-app.mjs";
import * as shell from "../../src/site-frame/dashboard-app.mjs";
import { ASSETS, APP, viewFiles, dashboardText, GL_ADDR, GL_TOKEN, withFetch } from "./helpers.mjs";

// Every module file of the site (vendored libraries excepted), with the modules its Module line names.
const moduleFiles = () => [...readdirSync(ASSETS, { recursive: true }).filter((f) => f.endsWith(".mjs") && !f.split("/").includes("vendor"))
  .map((f) => ({ file: f, text: readFileSync(new URL(f, ASSETS), "utf8") })), { file: "dashboard-app.mjs", text: readFileSync(APP, "utf8") }]
// The adapters (ARC-003 decision 1): the modules that reach the outside, as the code is built.
function adapterModules() {
  return new Set(["MOD-settings-store", "MOD-participants", "MOD-mailbox", "MOD-bridge-server", "MOD-bridge-tunnel"]);
}

test("the app never calls fetch directly — every request goes through an adapter", () => {
  // ARC-003 decision 6: no module file but an adapter's calls fetch or touches browser storage — the dashboard's files and every
  // kernel and feature file; the dashboard's requests leave through the hosts of MOD-repository-hosts. A file's module is its
  // Module line; a file naming no adapter is checked.
  const adapters = adapterModules(), files = moduleFiles();
  const checked = files.filter((f) => !headerModules(f.text).some((m) => adapters.has(m)));
  assert.ok(checked.some((f) => f.file === "dashboard-app.mjs") && checked.some((f) => f.file === "artifacts.mjs"), "kernel and shell files are checked");
  const FORBIDDEN = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\b(globalThis|window|self)\s*\.\s*(localStorage|sessionStorage)\b|\b(localStorage|sessionStorage)\s*[.[]|document\.cookie/;
  for (const { file, text: app } of checked) assert.doesNotMatch(app, FORBIDDEN, file);
  // counter-proof: access is caught, the word in an explanation is not
  assert.match("localStorage.getItem('t')", FORBIDDEN);
  assert.match("fetch(url)", FORBIDDEN);
  assert.match("const s = globalThis.localStorage;", FORBIDDEN);
  assert.doesNotMatch("saved in this browser (its <code>localStorage</code>)", FORBIDDEN);
});

// The kernel (ARC-003 decision 1): the modules of pure functions and data, as the code is built.
function kernelModules() {
  return new Set(["MOD-artifacts", "MOD-traceability", "MOD-job-harness", "MOD-run-engine", "MOD-process-model",
    "MOD-work-items"]);
}
// What a module file imports from MOD-repository-hosts (src/repository-hosts/): for each import, the file of the module it names
// and the names it takes, "*" for a namespace or dynamic import, which reaches every function of that file.
function hostImports(text) {
  const out = [];
  const fileOf = (specifier) => /(?:^|\/)repository-hosts\/([\w.-]+\.mjs)$/.exec(specifier)?.[1] ?? null;
  for (const m of text.matchAll(/\bimport\s+([^;]*?)\s+from\s+["']([^"']+)["']/g)) {
    const file = fileOf(m[2]);
    if (!file) continue;
    if (/\*\s*as\s+[\w$]+/.test(m[1])) out.push({ file, name: "*" });
    for (const n of (m[1].match(/\{([^}]*)\}/)?.[1] ?? "").split(",")) {
      const name = n.trim().split(/\s+as\s+/)[0];
      if (name) out.push({ file, name });
    }
  }
  for (const m of text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)) if (fileOf(m[1])) out.push({ file: fileOf(m[1]), name: "*" });
  return out;
}
const names = (imports) => imports.map(({ file, name }) => `${file}: ${name}`);

// Guards: UC-024
test("the kernel never reaches a repository — no kernel file imports anything of MOD-repository-hosts", () => {
  // ARC-003 decisions 1 and 2: a kernel module imports only kernel modules; what it reads is handed to it as a port,
  // and a shell commits the files it returns, through a host it connected.
  // The kernel is read from the group file, a file's module from its Module line.
  const kernel = kernelModules(), files = moduleFiles();
  const checked = files.filter((f) => headerModules(f.text).some((m) => kernel.has(m)));
  assert.ok(checked.some((f) => f.file === "process-model.mjs") && checked.some((f) => f.file === "artifacts.mjs"), "the kernel's files are checked");
  for (const { file, text } of checked) assert.deepEqual(names(hostImports(text)), [], file);
  // counter-proof: each way of importing the module is caught, another module's import is not
  assert.deepEqual(names(hostImports('import {\n  parseAddress, connect,\n} from "../../src/repository-hosts/index.mjs";')),
    ["index.mjs: parseAddress", "index.mjs: connect"]);
  assert.deepEqual(names(hostImports('import { connect as open } from "../repository-hosts/index.mjs";')), ["index.mjs: connect"]);
  assert.deepEqual(names(hostImports('import * as hosts from "../repository-hosts/index.mjs";')), ["index.mjs: *"]);
  assert.deepEqual(names(hostImports('const h = await import("../repository-hosts/github.mjs");')), ["github.mjs: *"]);
  assert.deepEqual(names(hostImports('import { connect } from "./other.mjs";')), []);
});

// Guards: UC-024
test("the dashboard reaches MOD-repository-hosts only through its interface — no file of the dashboard imports another of its files", () => {
  // MOD-repository-hosts' Parts: index.mjs is the interface, and every other file of its folder — the adapters, the request
  // helper and the failures behind them — is private to it. A namespace or dynamic import of a private file reaches it too.
  const files = moduleFiles().filter((f) => headerModules(f.text).includes("MOD-dashboard-app"));
  assert.ok(files.some((f) => f.file === "dashboard-app.mjs"), "the shell's files are checked");
  assert.ok(files.some((f) => hostImports(f.text).some((i) => i.file === "index.mjs" && i.name === "connect")), "known positive: the shell's connect is seen");
  const past = files.flatMap((f) => names(hostImports(f.text).filter((i) => i.file !== "index.mjs")).map((n) => `${f.file}: ${n}`));
  assert.deepEqual(past, [], "no file of the dashboard imports a private file of MOD-repository-hosts");
  // counter-proof: a private file imported by name, by a namespace or dynamically is caught; the interface is not
  assert.deepEqual(names(hostImports('import { send } from "../repository-hosts/failures.mjs";')), ["failures.mjs: send"]);
  assert.deepEqual(names(hostImports('import * as gh from "../repository-hosts/github.mjs";')), ["github.mjs: *"]);
  assert.deepEqual(names(hostImports('import { parseAddress, HostError } from "../repository-hosts/index.mjs";')),
    ["index.mjs: parseAddress", "index.mjs: HostError"]);
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
  for (const u of [APP, ...viewFiles()]) {
    const r = spawnSync(process.execPath, ["--check", u.pathname]);
    assert.equal(r.status, 0, `${u.pathname}: ${r.stderr}`);
  }
});

test("the list of the person's tokens is GitHub's page of fine-grained tokens, where a token is renewed", () => {
  assert.equal(connect(parseAddress("https://github.com/akmaier/agent-m")).webLinks().tokens, "https://github.com/settings/personal-access-tokens");
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
const GH = shell.productOf("https://github.com/akmaier/agent-m");
const limitHeaders = (limit, remaining = 0) => ({ "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining),
  "X-RateLimit-Reset": String(RESET) });
// The failure the dashboard's read of the repository gets from the host it connected (MOD-repository-hosts) when the server
// answers `status` with `headers`.
async function refused(status, headers = {}, { address = GH.address, token = "github_pat_STORED" } = {}) {
  let err = null;
  await withFetch(async () => new Response('{"message":"refused"}', { status, statusText: "Forbidden", headers }), async () => {
    try { await connect(parseAddress(address), { token }).readSnapshot("main"); } catch (e) { err = e; }
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
  const html = shell.loadErrorHtml({ error: await refused(403, limitHeaders(60), { token: null }), product: GH, ref: "main",
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
  const p = shell.productOf(GL_ADDR);
  const err = await refused(429, {}, { address: GL_ADDR, token: GL_TOKEN });
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
