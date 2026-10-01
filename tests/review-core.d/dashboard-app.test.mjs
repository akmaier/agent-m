// The dashboard's texts, steps and views (docs/assets/dashboard-app.mjs, docs/assets/dashboard/) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: THE TOKEN LINK IS PREFILLED; ONE GITHUB TOKEN SERVES EVERY FEATURE; THE REPOSITORY CHOICE IS SPELLED OUT; EVERY STEP EXPLAINS ITSELF; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-001; UC-014
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
import { tokenListUrl, gitlabTokenPageUrl, parseProductAddress } from "../../docs/assets/git-host.mjs";
import { tokenLinkUrl, repositoryChoiceSteps } from "../../docs/assets/dashboard/settings-view.mjs";
import { extendTokenSteps, gitlabTokenSteps, gitlabNoProjectTokens } from "../../docs/assets/dashboard/add-product-view.mjs";
import { stepHtml, gitlabWriteRefusal } from "../../docs/assets/dashboard-app.mjs";
import { ASSETS, viewFiles, dashboardText, GL_ADDR } from "./helpers.mjs";

// Every module file of the site (vendored libraries excepted), with the modules its Module line names.
const moduleFiles = () => readdirSync(ASSETS, { recursive: true }).filter((f) => f.endsWith(".mjs") && !f.split("/").includes("vendor"))
  .sort().map((f) => ({ file: f, text: readFileSync(new URL(f, ASSETS), "utf8") }));
// The adapters (ARC-003 decision 1): the modules of the group Adapters in docs/groups/modules.md.
function adapterModules() {
  const out = new Set();
  let inGroup = false;
  for (const l of readFileSync(new URL("../../docs/groups/modules.md", import.meta.url), "utf8").split("\n")) {
    const top = /^- (.+)$/.exec(l);
    if (top) { inGroup = top[1].trim() === "Adapters"; continue; }
    const m = /^\s+- (MOD-[a-z0-9-]+)\s*$/.exec(l);
    if (inGroup && m) out.add(m[1]);
  }
  return out;
}

test("the app never calls fetch directly — every request goes through fetchText", () => {
  // ARC-003 decision 6: no module file but an adapter's calls fetch or touches browser storage — the dashboard's files and every
  // kernel and feature file. A file's module is its Module line; a file naming no adapter is checked.
  const adapters = adapterModules(), files = moduleFiles();
  const checked = files.filter((f) => !headerModules(f.text).some((m) => adapters.has(m)));
  assert.ok(adapters.has("MOD-git-host") && adapters.has("MOD-settings-store"), "the adapters are read from the group file");
  assert.ok(!checked.some((f) => f.file === "git-host.mjs") && checked.some((f) => f.file === "dashboard-app.mjs")
    && checked.some((f) => f.file === "artifacts.mjs") && checked.some((f) => f.file.startsWith("dashboard/")), "kernel and shell files are checked");
  const FORBIDDEN = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\b(globalThis|window|self)\s*\.\s*(localStorage|sessionStorage)\b|\b(localStorage|sessionStorage)\s*[.[]|document\.cookie/;
  for (const { file, text: app } of checked) assert.doesNotMatch(app.replace(/fetchText\(/g, ""), FORBIDDEN, file);
  // counter-proof: access is caught, the word in an explanation is not
  assert.match("localStorage.getItem('t')", FORBIDDEN);
  assert.match("fetch(url)", FORBIDDEN);
  assert.match("const s = globalThis.localStorage;", FORBIDDEN);
  assert.doesNotMatch("saved in this browser (its <code>localStorage</code>)", FORBIDDEN);
});

// ---------------------------------------------------------------- one click per decision (queue 2026-09-24)

// ONE GITHUB TOKEN SERVES EVERY FEATURE: parameter names as documented by GitHub,
// https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#pre-filling-fine-grained-personal-access-token-details-using-url-parameters
const TOKEN_FIELDS = ["name", "description", "expires_in", "target_name"];
const ONE_TOKEN = { contents: "write", issues: "write", actions: "write", metadata: "read" };

test("THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE — exactly Contents, Issues, Actions write, Metadata read", () => {
  const u = new URL(tokenLinkUrl("reader/agent-m"));
  assert.equal(u.origin + u.pathname, "https://github.com/settings/personal-access-tokens/new");
  assert.equal(u.searchParams.get("name"), "Agent M · reader/agent-m");
  assert.equal(u.searchParams.get("expires_in"), "90");
  assert.ok(u.searchParams.get("description"));
  const perms = Object.fromEntries([...u.searchParams].filter(([k]) => !TOKEN_FIELDS.includes(k)));
  assert.deepEqual(perms, ONE_TOKEN, "the link asks for exactly these permissions, no more, no less");
});

test("THE REPOSITORY CHOICE IS SPELLED OUT — both repositories named, 'Only select repositories' first", () => {
  const s = repositoryChoiceSteps("reader/agent-m", "reader/thesis");
  assert.match(s[0], /Only select repositories/);
  assert.match(s[0], /All repositories/);
  assert.ok(s.some((x) => x.includes("reader/agent-m")) && s.some((x) => x.includes("reader/thesis")));
  assert.ok(s.some((x) => /github_pat_/.test(x)));
  assert.equal(repositoryChoiceSteps("r/agent-m", "r/agent-m").filter((x) => x.includes("r/agent-m")).length, 1,
    "the instance as its own product is named once");
  const all = s.join("\n");
  for (const p of ["Contents: read and write", "Issues: read and write", "Actions: read and write", "Metadata: read"]) {
    assert.ok(all.includes(p), `the steps name ${p}`);
  }
});

test("EVERY STEP EXPLAINS ITSELF — a step without an explanation cannot be rendered", () => {
  const h = stepHtml({ title: "Step A", body: "<p>x</p>", explain: "A token is a key." });
  assert.match(h, /class="step"/);
  assert.match(h, /<details class="explain"><summary>What is this\?<\/summary>/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x", explain: "" }), /explain/);
  assert.throws(() => stepHtml({ title: "Step A", body: "x" }), /explain/);
});

// ---------------------------------------------------------------- products in the browser (UC-001)

test("every site module parses — the app itself is only run in a browser, so check its syntax here", () => {
  for (const u of [new URL("dashboard-app.mjs", ASSETS), ...viewFiles(), new URL("review-core.mjs", ASSETS), new URL("settings-store.mjs", ASSETS)]) {
    const r = spawnSync(process.execPath, ["--check", u.pathname]);
    assert.equal(r.status, 0, `${u.pathname}: ${r.stderr}`);
  }
});

// ---------------------------------------------------------------- token at instance setup (UC-014), extended in UC-001

test("UC-014: setup names only the instance", () => {
  const s = repositoryChoiceSteps("reader/agent-m", null);
  assert.ok(s.some((x) => x.includes("reader/agent-m")));
  assert.ok(!s.some((x) => /null|undefined/.test(x)));
});

test("UC-001: extending the token names the token, adds the product, keeps the instance, copies nothing", () => {
  assert.equal(tokenListUrl(), "https://github.com/settings/personal-access-tokens");
  const s = extendTokenSteps("reader/agent-m", "reader/thesis").join("\n");
  assert.match(s, /Agent M · reader\/agent-m/);      // the name tokenLinkUrl gave it
  assert.match(s, /add “reader\/thesis”/);
  assert.match(s, /keep “reader\/agent-m”/);
  assert.match(s, /Update/);
  assert.match(s, /nothing to copy/i);
  const name = new URL(tokenLinkUrl("reader/agent-m")).searchParams.get("name");
  assert.ok(s.includes(name), "the steps must name the token exactly as the setup link created it");
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS — the export goes nowhere but into a file

test("the settings export is saved as a file only — never committed, fetched or put into an address", () => {
  const app = dashboardText();
  const body = (src) => (src.match(/async function saveExport\([\s\S]*?\n}\n/) || [""])[0];
  const LEAK = /commitFiles|fetchText|location|data:|encodeURIComponent|URLSearchParams/;
  const b = body(app);
  assert.ok(b.includes("exportSettings(") && b.includes("new Blob("), "saveExport writes the export into a Blob");
  assert.doesNotMatch(b, LEAK);
  assert.equal(app.split("exportSettings(").length - 1, 1, "exportSettings is called only in saveExport");
  // Counter-proof: an export that is committed is caught.
  assert.match(body("async function saveExport(ev) {\n  const t = await exportSettings(x);\n  await commitFiles({ files: [t] });\n}\n"), LEAK);
});

// ---------------------------------------------------------------- the use-case key is `area` (was `stage`)

test("the dashboard reads the use-case key `area` and says Area — `stage` is used nowhere", () => {
  const app = dashboardText();
  const STAGE = /\bstages?\b/i;
  assert.doesNotMatch(app, STAGE);
  assert.match(app, /fields\.area\b/);
  assert.match(app, /<th>Area<\/th>/);
  assert.equal(parseFrontMatter("---\nid: UC-001\narea: setup\n---\n").fields.area, "setup");
  // Counter-proof: the old column is caught.
  assert.match("<td>${h(u.fields.stage)}</td>", STAGE);
});

test("status 'approved' is described truly for both routes — the dashboard's own commit and the workflow", () => {
  const app = dashboardText();
  const line = app.match(/^\s*approved: \["approved", "([^"]+)"\],$/m)?.[1];
  assert.ok(line, "the label of status approved");
  assert.doesNotMatch(line, /^Approval committed — the workflow writes it into the SPEC$/);
  assert.match(line, /workflow/, "names the route without a token");
  assert.match(line, /not (yet )?(written|in)/i, "says what the status means: approved, not yet in the SPEC");
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN (UC-001 3c/3d)

test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the steps: the project's token page, name, role Maintainer, scope api, expiry", () => {
  const p = parseProductAddress(GL_ADDR);
  assert.equal(gitlabTokenPageUrl(p), `${GL_ADDR}/-/settings/access_tokens`);
  const s = gitlabTokenSteps(p).join("\n");
  for (const must of [/Agent M/, /role: Maintainer/, /\bapi\b/, /[Ee]xpir/, /Create project access token/, /glpat-/]) assert.match(s, must);
  assert.doesNotMatch(s, /Developer/, "the role the SPEC no longer prescribes is not asked for");
  assert.doesNotMatch(s, /Owner/, "no broader role is asked for");
  // UC-001 3d: which of the two it is, and why a personal token is broader.
  const self = gitlabNoProjectTokens(p);
  assert.match(self, /Maintainer/);
  assert.match(self, /personal access token/);
  assert.match(self, /every project/);
  const dotcom = gitlabNoProjectTokens(parseProductAddress("https://gitlab.com/alice/thesis"));
  assert.match(dotcom, /Premium or Ultimate/, "on gitlab.com the subscription decides");
  assert.doesNotMatch(self, /Premium/, "a self-managed server offers them with any licence");
  // A refused write (403) with a Maintainer token: the branch is protected even against Maintainers, or the token lacks scope api
  // or has a lower role — what GitLab answers 403 for; an expired token is a 401 and named elsewhere (tokenRefusal).
  const refusal = gitlabWriteRefusal(Object.assign(new Error("403 Forbidden"), { status: 403 }), p);
  for (const must of [/protected/, /Maintainers/, /\bapi\b/, /Maintainer/]) assert.match(refusal, must);
  assert.doesNotMatch(refusal, /Developer/);
  assert.doesNotMatch(refusal, /expired/, "an expired token is answered with 401, not 403");
  assert.equal(gitlabWriteRefusal(Object.assign(new Error("400"), { status: 400 }), p), null);
});

// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT (UC-008 2a)

test("the dashboard shows the last accepted text above a changed use case, with the core's diff", () => {
  const app = dashboardText({ shell: false });
  const view = app.match(/async function viewUseCase\([\s\S]*?\n}\n/)[0];
  assert.ok(view.includes("accepted-diff"), "the panel is part of the use-case view");
  assert.ok(view.indexOf("accepted-diff") < view.indexOf('<article class="md doc">'), "above the text");
  assert.match(app, /lastAccepted\(/);
  assert.doesNotMatch(app, /function (lineDiff|diffHtml)\(/, "one diff, in the core — not a second copy in the app");
});
