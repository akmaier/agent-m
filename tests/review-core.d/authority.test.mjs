// The authority a write is made on (ARC-003 decision 3): the dashboard turns a person's trusted click into a `click`
// authority, the five writes hand it to the git host's one write path, and no module but a runtime's shell makes one —
// deterministic, no network. Run through tests/review-core.test.mjs, which SPEC.md names for these checks:
// node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// Level: unit
//
// The write path's own refusal (MOD-git-host) is checked in git-host.test.mjs, the five writes in dashboard-writes.test.mjs.
// Counter-proofs: docs/measurements/2026-10-01_one-write-path-with-an-authority.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { headerModules } from "../../docs/assets/artifacts.mjs";
import * as writes from "../../docs/assets/dashboard/writes.mjs";
import { commitFiles } from "../../docs/assets/git-host.mjs";
import { click, fakeGitHub, withFetch, viewFiles } from "./helpers.mjs";

const { clickAuthority } = writes;

// ---------------------------------------------------------------- the click becomes the authority (MOD-dashboard-app)

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — a trusted click becomes a click authority; anything else becomes none", () => {
  const a = clickAuthority({ isTrusted: true });
  assert.deepEqual(a, { kind: "click" }, "one value of one shape: the kind, nothing else");
  assert.ok(Object.isFrozen(a), "the authority cannot be changed after it was made");
  // Counter-proof: a click a script makes (isTrusted false), something that only looks like one, or no event at all.
  for (const ev of [{ isTrusted: false }, {}, { isTrusted: "true" }, { isTrusted: 1 }, null, undefined]) {
    assert.throws(() => clickAuthority(ev), /click/, JSON.stringify(ev));
  }
});

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — the click authority is what the write path takes: one commit, fast-forward only", async () => {
  const { calls, fetchMock } = fakeGitHub();
  const r = await withFetch(fetchMock, () => commitFiles({ repo: "a/b", branch: "main", message: "m", token: "github_pat_t",
    authority: clickAuthority(click), files: [{ path: "x.md", content: "x\n" }] }));
  assert.equal(r.sha, "c1");
  assert.equal(calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1, "one commit");
  assert.deepEqual(calls.at(-1), ["PATCH", "/repos/a/b/git/refs/heads/main", "Bearer github_pat_t", { sha: "c1", force: false }]);
  // Counter-proof: the event itself, handed over as before, is no authority — nothing is sent.
  const g = fakeGitHub();
  await withFetch(g.fetchMock, () => assert.rejects(commitFiles({ repo: "a/b", branch: "main", message: "m", token: "github_pat_t",
    click, files: [{ path: "x.md", content: "x\n" }] }), /authority/));
  assert.equal(g.calls.length, 0);
});

// ---------------------------------------------------------------- the buttons that name a write (the views)

// The dashboard writes of dashboard/writes.mjs and every call of one in a view: the text of its argument list. UC-001 now
// reaches MOD-settings-pages through its public route and no longer calls the dashboard's removed addProduct write.
const WRITES = ["acceptItems", "saveReviewedFile", "savePseudonymisation", "saveCollaborators"];
function writeCalls(text) {
  const out = [];
  for (const m of text.matchAll(new RegExp(`(?<![.\\w$])(${WRITES.join("|")})\\(`, "g"))) {
    let depth = 0, i = m.index + m[0].length - 1;
    for (; i < text.length; i++) {
      if (text[i] === "(") depth += 1;
      else if (text[i] === ")" && --depth === 0) break;
    }
    out.push({ name: m[1], args: text.slice(m.index + m[0].length, i) });
  }
  return out;
}
// A call that hands over the authority the click of its own handler made — and not the event itself.
const handsClickAuthority = (args) => /\bauthority:\s*clickAuthority\(\s*[\w$]+\s*\)/.test(args) && !/\bclick\s*[:,}]/.test(args);

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — every write a view starts hands over the click authority made from its button's event", () => {
  const views = viewFiles().filter((u) => !u.pathname.endsWith("/writes.mjs"));
  const calls = views.flatMap((u) => writeCalls(readFileSync(u, "utf8")).map((c) => ({ ...c, file: u.pathname.split("/assets/")[1] })));
  // Known positive: each dashboard write is started by a view, so the check below has something to check.
  assert.deepEqual([...new Set(calls.map((c) => c.name))].sort(), [...WRITES].sort());
  for (const c of calls) assert.ok(handsClickAuthority(c.args), `${c.file}: ${c.name}(${c.args.replace(/\s+/g, " ").slice(0, 160)}…)`);
  // Counter-proof: the event handed over as before, no authority, or an authority not made from a click is caught.
  for (const bad of ["{ ...app.writeTarget(), branch: T.ref, token: app.token(), click: ev, items }",
    "{ address: parsed.address, token, store }", "{ repo, branch, token, authority: { kind: \"click\" }, list }",
    "{ repo, branch, token, authority: clickAuthority(ev), click: ev, list }"]) {
    assert.equal(handsClickAuthority(bad), false, bad);
  }
  assert.equal(handsClickAuthority("{ ...app.writeTarget(), branch: T.ref, token: token(), authority: clickAuthority(ev), list }"), true);
  assert.deepEqual(writeCalls("store.addProduct(x); await addProduct({ a: f(b) }); acceptItems({ c })").map((c) => c.name),
    ["acceptItems"], "a method of another object is not one of the dashboard writes");
  const dashboard = readFileSync(new URL("../../docs/assets/dashboard-app.mjs", import.meta.url), "utf8");
  assert.match(dashboard, /settingsPages\.routes\.find\(\(r\) => r\.name === "add-product"\)/,
    "UC-001 enters through the public MOD-settings-pages route, outside the dashboard write path");
});

// ---------------------------------------------------------------- who may make an authority (ARC-003 decisions 1 and 3)

// Which shell makes each kind: the dashboard a person's click, the CI entry the CI secret, the bridge app the agent's login.
const SHELL_OF = { click: "MOD-dashboard-app", "ci-secret": "MOD-ci-entry", "agent-login": "MOD-bridge-app" };
// The one module that may name the two other kinds without making one: the git host, whose write path checks the kind.
const CHECKER = "MOD-git-host";

// The authorities a code file makes — an object whose kind is one of the three — and the two kinds that are not a word of
// their own (`ci-secret`, `agent-login`) wherever the file writes them as a string. A kind written in a comment between
// backticks is prose, not code.
function authorityTexts(text) {
  const made = [...text.matchAll(/\bkind\s*:\s*(["'`])(click|ci-secret|agent-login)\1/g)].map((m) => m[2]);
  const named = [...text.matchAll(/(["'])(ci-secret|agent-login)\1/g)].map((m) => m[2]);
  return { made, named };
}
// -> the findings of one file: an authority made outside the shell of its kind, or a kind named outside its shell and the git host.
function authorityFindings(file, text) {
  const modules = headerModules(text), out = [];
  const { made, named } = authorityTexts(text);
  for (const k of made) if (!modules.includes(SHELL_OF[k])) out.push(`${file} makes a ${k} authority, which only ${SHELL_OF[k]} makes`);
  for (const k of named) if (!modules.includes(SHELL_OF[k]) && !modules.includes(CHECKER)) out.push(`${file} names the ${k} authority`);
  return out;
}

// Every code file of the repository: the site's modules and whatever a shell of another runtime adds — not the tests, not the
// vendored libraries.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SKIP = new Set([".git", ".github", ".claude", "node_modules", "tests", "vendor", "products"]);
function codeFiles(dir = ROOT, out = []) {
  for (const n of readdirSync(dir)) {
    if (SKIP.has(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) codeFiles(p, out);
    else if (/\.(mjs|js|cjs|ts)$/.test(n)) out.push({ file: relative(ROOT, p).split("\\").join("/"), text: readFileSync(p, "utf8") });
  }
  return out;
}

test("A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET · A LOCAL AGENT USES THE PERSON'S OWN LOGIN — only the CI entry makes a ci-secret authority, only the bridge app an agent-login one, only the dashboard a click", () => {
  const files = codeFiles();
  assert.ok(files.some((f) => f.file === "docs/assets/git-host.mjs") && files.some((f) => f.file === "docs/assets/dashboard/writes.mjs"),
    "the site's modules are read");
  assert.ok(!files.some((f) => f.file.startsWith("tests/") || f.file.includes("/vendor/")), "tests and vendored libraries are not");
  assert.deepEqual(files.flatMap((f) => authorityFindings(f.file, f.text)), []);
  // Known positive: the dashboard makes the click authority, in the file of the five writes.
  assert.ok(authorityTexts(readFileSync(new URL("../../docs/assets/dashboard/writes.mjs", import.meta.url), "utf8")).made.includes("click"));
  // Counter-proof: each kind made outside its shell is caught — in the kernel, in the git host, in the dashboard; a kind named
  // as a string outside its shell and the git host is caught; prose between backticks and the event name "click" are not.
  const kernel = "// Module: MOD-review-core\n", host = "// Module: MOD-git-host\n", dash = "// Module: MOD-dashboard-app\n";
  const ci = "// Module: MOD-ci-entry\n", bridge = "// Module: MOD-bridge-app\n";
  for (const [label, text] of [
    ["a ci-secret authority in the kernel", `${kernel}const a = { kind: "ci-secret" };`],
    ["an agent-login authority in the dashboard", `${dash}const a = Object.freeze({ kind: 'agent-login' });`],
    ["a click authority in the git host", `${host}return { kind: \`click\` };`],
    ["a click authority in the CI entry", `${ci}const a = { kind: "click" };`],
    ["a ci-secret authority in the bridge app", `${bridge}const a = { kind:"ci-secret" };`],
    ["the ci-secret kind named in the kernel", `${kernel}const k = "ci-secret"; const a = { kind: k };`],
  ]) assert.notDeepEqual(authorityFindings("x.mjs", text), [], label);
  for (const [label, text] of [
    ["the CI entry makes its own", `${ci}const a = Object.freeze({ kind: "ci-secret" });`],
    ["the bridge app makes its own", `${bridge}const a = Object.freeze({ kind: "agent-login" });`],
    ["the dashboard makes its own", `${dash}return Object.freeze({ kind: "click" });`],
    ["the git host names the kinds it checks", `${host}const KINDS = ["click", "ci-secret", "agent-login"];`],
    ["prose and the event name", `${kernel}// a \`ci-secret\` authority\nb.addEventListener("click", f); const x = { kind: "spec" };`],
  ]) assert.deepEqual(authorityFindings("x.mjs", text), [], label);
});
