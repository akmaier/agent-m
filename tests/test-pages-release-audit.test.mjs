// MOD-test-pages' route `release` draws the audit of its candidate (ITM-765), as docs/architecture/MOD-test-pages.md states it: "the audit of the candidate, drawn by the trace
// pages' route inside this panel", through the frame's `embedRoute`, "without using that module"; and as docs/architecture/MOD-site-frame.md states embedRoute: "Error:
// `RouteNotLoaded` — the route is not on this page; the frame then puts a link to it in `target`."
// Run: node --test tests/test-pages-release-audit.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-013; UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// Level: unit
//
// Readings the item's text leaves to this file: a route is named by the first part of its fragment and the rest are its params (MOD-site-frame.md), so the panel embeds the
// route `trace` with the params { key: "audit", ref: <the candidate's tag>, commit: <the candidate's commit> }; "once the run has ended" is the report being complete, the
// moment the panel offers Accept and release. The page is the small fixture of tests/site-frame-start.d/dom.mjs, started with a view whose one route is a fake `trace` that
// records the target and the params it is given; the host is a fake kept to MOD-repository-hosts' interface, one repository in memory, no request leaves the process.
// The test that no route is loaded comes first, because a page started stays the page embedRoute reads.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { all, installPage, offline, outside } from "./site-frame-start.d/dom.mjs";
import { until } from "./prompt-bar.d/until.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { route } = await import("../src/test-pages/release.mjs");
const { startPage } = await import("../src/site-frame/index.mjs");

test.afterEach(() => { assert.deepEqual(outside.reached, [], "no request left the fixture"); });

const blobSha = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(Buffer.from(text, "utf8")).digest("hex");
const missing = (what) => Object.assign(new Error(`NotFound ${what}`), { name: "NotFound", what });

// One repository: the default branch `main`, the branch test-results, and the tags the panel makes.
function fakeHost() {
  const commits = new Map();
  const branches = new Map();
  const tags = new Map();
  let made = 0;
  const commit = (files) => { const sha = createHash("sha1").update(`commit ${(made += 1)}`).digest("hex"); commits.set(sha, new Map(Object.entries(files))); return sha; };
  const main = commit({
    ".github/workflows/agent-m-jobs.yml": "name: Agent M jobs\n",
    "docs/tests/schedule.md": ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |",
      "|---|---|---|---|---|---|---|", ...["unit", "component", "system", "paid", "release", "user"].map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | ${level === "release" || level === "user" ? "developer-sonnet-e" : ""} |`), ""].join("\n"),
    "SPEC.md": ["# Fixture product — Specification", "", "## Section", "", "**A SAMPLE REQUIREMENT** *(Product Owner)*", "A sample rule.", "*Check:* `tests/sample.test.mjs`", ""].join("\n"),
    "CHANGELOG.md": "# Changelog\n",
    "tests/sample.test.mjs": ["// TST-001", "// level: unit", "// guards: A SAMPLE REQUIREMENT", ""].join("\n"),
  });
  branches.set("main", main);
  branches.set("test-results", commit({}));
  return {
    main,
    tagged: (name) => tags.get(name),
    finishRun() {
      const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", "| TST-001 | unit | passed | |"].join("\n");
      branches.set("test-results", commit({ [`runs/${main}/20261007-1000-release-candidate-aaaa.md`]: ["---", `commit: ${main}`, "levels:", "  - unit", "occasion: release-candidate", "participant: ci",
        "date: 2026-10-07 10:00 UTC", "---", "## Outcomes", "", table, ""].join("\n") }));
    },
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) {
      const sha = branches.get(ref) ?? tags.get(ref) ?? (commits.has(ref) ? ref : null);
      if (!sha) throw missing(ref);
      const tree = commits.get(sha);
      // The graph of every commit is stored on trace-cache, as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
      return withStoredGraph({ repository: { server: "github", origin: "https://github.com", path: "org/product", web: "https://github.com/org/product" }, ref, commit: sha, paths: [...tree.keys()],
        read: async (path) => (tree.has(path) ? tree.get(path) : null), blob: (path) => (tree.has(path) ? blobSha(tree.get(path)) : null) });
    },
    async listTags() { return [...tags].map(([name, sha]) => ({ name, commit: sha })); },
    async createTag(name, sha) { tags.set(name, sha); },
    async commitFiles(change) {
      const head = branches.get(change.branch);
      const files = Object.fromEntries(commits.get(head));
      for (const file of change.files) files[file.path] = file.text;
      const sha = commit(files);
      branches.set(change.branch, sha);
      return { commit: sha, url: `https://github.com/org/product/commit/${sha}` };
    },
  };
}

const contextOf = (host) => ({ page: "releases", instance: { repository: "org/product" }, product: { address: "https://github.com/org/product", kind: "github", host }, store: null, go() {} });
const byClass = (root, name) => all(root, "button").concat(all(root, "input"), all(root, "div"), all(root, "section"), all(root, "a")).filter((node) => node.className.split(" ").includes(name));
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };

// Draws the panel, starts a candidate, and returns what the panel shows before the run has ended.
async function candidateStarted(host) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, contextOf(host), {});
  type(byClass(target, "person")[0], "akmaier");
  byClass(target, "start")[0].dispatchEvent(new Event("click"));
  await until(() => /Queued run: JOB-/.test(target.textContent) && /has not finished/.test(target.textContent), "the candidate and its queued run");
  return target;
}
const finish = async (host, target) => {
  host.finishRun();
  byClass(target, "refresh")[0].dispatchEvent(new Event("click"));
  await until(() => byClass(target, "accept").length > 0, "Accept and release once the run has ended");
};

// TST-765001 · level: unit · module: MOD-test-pages
// guards: UC-013; UC-030
// given: a fixture document on which no page has been started, and a candidate whose run has ended
// input: the route release, render; Check results after the run's end
// expect: the panel holds one <a> "Open trace", whose href starts "#trace/" and holds key=audit, ref=<the candidate's tag> and commit=<its commit>; it still offers Accept and release
test("TST-765001 where the route trace is not loaded, the frame's link stands in the panel and Accept and release stays", async () => {
  installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html" });
  offline();
  const host = fakeHost();
  const target = await candidateStarted(host);
  await finish(host, target);
  const links = all(target, "a").filter((link) => link.textContent === "Open trace");
  assert.equal(links.length, 1);
  const href = links[0].getAttribute("href");
  const tag = target.textContent.match(/Release candidate (v[0-9.]+-rc\.1)/)[1];
  assert.match(href, /^#trace\//);
  for (const part of ["key=audit", `ref=${tag}`, `commit=${host.main}`]) assert.ok(href.includes(part), `${href} holds ${part}`);
  assert.ok(byClass(target, "accept").length > 0, "Accept and release stays");
});

// TST-765002 · level: unit · module: MOD-test-pages
// guards: UC-013; UC-030
// given: a page started with a view whose one route trace records the element and the params it is rendered with; a candidate started from the panel
// input: render the release panel and Start release candidate; then the run ends and Check results
// expect: before the run has ended the route trace was not rendered; once it has ended it was rendered once, with the params { key: "audit", ref: <the candidate's tag>, commit: <the candidate's commit> }, into an element inside the panel
test("TST-765002 the panel embeds the route trace with the candidate's tag and commit once the run has ended, and not before", async () => {
  const drawn = [];
  installPage({ hostname: "acme.github.io", pathname: "/instance/docs/index.html", hash: "#nothing" });
  offline();
  globalThis.setInterval = () => 1;
  await startPage({ page: "review", views: [{ strategies: [], routes: [{ name: "trace", entry: "tests", title: "trace", async render(target, context, params) {
    drawn.push({ target, params });
    target.textContent = `audit ${params.ref}`;
  } }] }] });
  drawn.length = 0;
  const host = fakeHost();
  const target = await candidateStarted(host);
  assert.deepEqual(drawn, [], "not before the run has ended");
  await finish(host, target);
  const tag = target.textContent.match(/Release candidate (v[0-9.]+-rc\.1)/)[1];
  assert.equal(drawn.length, 1);
  assert.deepEqual(drawn[0].params, { key: "audit", ref: tag, commit: host.main });
  assert.match(target.textContent, new RegExp(`audit ${tag.replace(/\./g, "\\.")}`));
  assert.ok(byClass(target, "accept").length > 0, "the panel goes on to Accept and release");
});
