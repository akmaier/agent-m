// The dashboard shell — the site's menu written from the stages of the process and the table of views, each view loaded by its
// name, a view or settings section whose file is not there not shown, and not asked for, a view's own stylesheet, and the
// request handlers a view's tests bring to the harness.
// Run: node --test tests/
//
// Module: MOD-dashboard-app
// Guards: EVERY SETTING IS REACHED FROM ONE PAGE; THE MENU FOLLOWS THE PROCESS; UC-001; UC-006; UC-008; UC-014; UC-022; UC-023; UC-024; UC-042
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub API mock. The counter-proofs
// are recorded in docs/measurements/2026-10-01_dashboard-shell.md and docs/measurements/2026-10-01_no-request-for-a-view-not-built.md.

import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync, mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { repoServer, openDashboard } from "./app-harness.mjs";
import { DASHBOARD } from "../docs/assets/dashboard-app.mjs";
import { MENU } from "../src/site/menu.mjs";

// What a page asks the server for below docs/assets/dashboard/: in a browser every import of a view or section file is a request
// to GitHub Pages, and one for a file that is not there is answered 404. Under node the harness's fetch does not see imports, so
// node's module resolution records them — every import, of a file that exists or not, by its path below docs/assets/dashboard/.
const VIEWS = new URL("../docs/assets/dashboard/", import.meta.url);
const imported = [];
registerHooks({
  resolve(specifier, context, next) {
    let url = null;
    try { url = new URL(specifier, context.parentURL); } catch { /* a bare specifier: no file of the site */ }
    if (url?.protocol === "file:" && url.href.startsWith(VIEWS.href)) imported.push(decodeURIComponent(url.pathname.slice(VIEWS.pathname.length)));
    return next(specifier, context);
  },
});

// Every string-rendered address of today: none, each view with a dashboard file — built or not —, the pages within the built
// views, and one that no view answers. UC-001's public settings-pages route has DOM integration coverage separately.
const ADDRESSES = ["", ...DASHBOARD.filter((x) => x.view && x.file).map((x) => `#${x.view}`), "#uc/UC-001", "#review/uc", "#review/arc",
  "#nothing"];
const isThere = (file) => existsSync(new URL(file, VIEWS));

const UC = "docs/use-cases/UC-001-add-a-product.md";
const FILES = {
  "SPEC.md": "# SPEC\n",
  [UC]: "---\nid: UC-001\ntitle: Add a product\narea: setup\nrealises:\n  - NO SERVER\n---\n# UC-001 Add a product\n",
};

// THE MENU FOLLOWS THE PROCESS: with the view files of today, the menu entry by entry — each stage of the process linking to the
// first of its views that is built, a stage none of whose views is built named without a link, then maintenance and settings.
const MENU_OF_TODAY = [
  '<a href="#spec" role="tab" id="tab-spec" data-entry="requirements">Requirements</a>',
  '<a href="#uc" role="tab" id="tab-uc" data-entry="use-cases">Use cases</a>',
  '<a href="#arc" role="tab" id="tab-arc" data-entry="architecture">Architecture</a>',
  '<a href="#backlog" role="tab" id="tab-backlog" data-entry="implementation">Implementation</a>',
  '<span class="soon" data-entry="tests" aria-disabled="true" title="Tests — not built yet">Tests</span>',
  '<span class="soon" data-entry="maintenance" aria-disabled="true" title="Maintenance — not built yet">Maintenance</span>',
  '<a href="#settings" role="tab" id="tab-settings" data-entry="settings" title="Every setting Agent M uses"><span aria-hidden="true">⚙</span> Settings</a>',
];

test("with every view file of today, the menu shows the stages of the process in their order, each linked to its page", async () => {
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  const remaining = page.el("tabs").split("\n").filter((entry) => entry !== '<a href="#release" role="tab" id="tab-release" data-entry="releases">Releases</a>');
  assert.deepEqual(remaining, MENU_OF_TODAY);
});

test("every dashboard view file of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, setup, review pages", async () => {
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  const heading = async (hash) => { await page.go(hash); return (/<h2>([^<]*)/.exec(page.main()) || [])[1]?.trim(); };
  assert.equal(await heading("#uc"), "Use cases");
  assert.equal(await heading("#uc/UC-001"), "UC-001 Add a product");
  assert.equal(await heading("#arc"), "Architecture");
  assert.equal(await heading("#spec"), "Current requirements");
  assert.ok(page.main().indexOf("Current requirements") < page.main().indexOf("SPEC changes"), "the overview precedes its history");
  assert.equal(await heading("#how"), "How acceptance works");
  assert.equal(await heading("#settings"), "Settings");
  assert.equal(await heading("#setup"), "Finish setting up your instance");
  assert.equal(await heading("#review/uc"), "Review all — use cases");
  assert.equal(await heading("#review/arc"), "Review all — architecture");
});

test("a view or settings section whose file is not there yet is not shown, and its address shows the use cases", async () => {
  const views = new URL("../docs/assets/dashboard/", import.meta.url);
  const missing = DASHBOARD.filter((x) => x.file && !existsSync(new URL(x.file, views)));
  const view = missing.find((x) => x.view && MENU.some((e) => e.views.includes(x.view))), section = missing.find((x) => x.section);
  assert.ok(view && section, "the table names a view of a menu stage and a settings section that have no file yet");
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  assert.doesNotMatch(page.el("tabs"), new RegExp(`href="#${view.view}"|id="tab-${view.view}"`));
  await page.go(`#${view.view}`);
  assert.match(page.main(), /<h2>Use cases<\/h2>/);
  await page.go("#settings");
  assert.doesNotMatch(page.main(), new RegExp(`data-settings-section="${section.section}"`));
  // Counter-proof: a view whose file is there is linked from its stage, and a built-in section is on the page.
  assert.match(page.el("tabs"), /<a href="#uc" role="tab" id="tab-uc"/);
  assert.match(page.main(), /id="product-settings"/);
});

// Guards: UC-024
test("a load of every address of today asks for no view or settings file that is not built — no 404 per planned view", async () => {
  const asked = new Map(); // address -> the files below docs/assets/dashboard/ its page load and its navigation asked for
  const server = await repoServer({ files: FILES });
  for (const hash of ADDRESSES) {
    const from = imported.length;
    const page = await openDashboard({ server, hash });
    await page.go("#settings"); // the settings page names every section of the table
    await page.go(hash);
    asked.set(hash || "(none)", imported.slice(from));
  }
  const missing = [...asked].flatMap(([hash, files]) => files.filter((f) => !isThere(f)).map((f) => `${hash}: ${f}`));
  assert.deepEqual(missing, [], "a page asked for files that are not there");
  // The recording sees what a page asks for: the files of the views shown are among it.
  const all = new Set([...asked.values()].flat());
  for (const f of ["review-views.mjs", "settings-view.mjs", "how-view.mjs", "setup-view.mjs"]) {
    assert.ok(all.has(f), `the recording saw ${f}: ${[...all].join(", ")}`);
  }
});

// Guards: UC-024
test("the list of built files beside the views names exactly the files of the table that are there", () => {
  const built = JSON.parse(readFileSync(new URL("built.json", VIEWS), "utf8"));
  assert.ok(Array.isArray(built) && built.every((f) => typeof f === "string"), "a JSON list of file names below docs/assets/dashboard/");
  assert.equal(new Set(built).size, built.length, "each file once");
  const named = new Set(DASHBOARD.filter((x) => x.file).map((x) => x.file));
  assert.deepEqual(built.filter((f) => !named.has(f)), [], "the list names only files the table names");
  assert.deepEqual(built.filter((f) => !isThere(f)), [], "the list names only files that are there");
  assert.deepEqual([...named].filter((f) => isThere(f) && !built.includes(f)), [], "every file of the table that is there is listed");
});

test("a request handler a test brings answers before the harness's own GitHub", async () => {
  const privateRepo = async (url, init) => (init.method === "GET" && url.pathname === "/repos/akmaier/agent-m"
    ? new Response(JSON.stringify({ private: true, default_branch: "main" }), { status: 200 }) : null);
  const own = await openDashboard({ server: await repoServer({ files: FILES, handlers: [privateRepo] }), hash: "#settings" });
  assert.ok(own.requests.includes("handler GET https://api.github.com/repos/akmaier/agent-m"), own.requests.join(", "));
  assert.doesNotMatch(own.el("product-settings"), /will be published/, "the handler's private repository is not warned of publication");
  // Counter-proof: without the handler the harness answers — a public repository, warned of publication.
  const plain = await openDashboard({ server: await repoServer({ files: FILES }), hash: "#settings" });
  assert.match(plain.el("product-settings"), /will be published/);
  assert.ok(!plain.requests.some((r) => r.startsWith("handler ")));
});

test("a view may link a stylesheet of its own beside style.css — once, when it is first shown", async () => {
  // A copy of the site whose how-view.mjs names a stylesheet; the view is otherwise the real one. The copy keeps the site's
  // layout — docs/assets/ beside src/, which the dashboard's modules import from.
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-assets-"))), dir = join(root, "docs", "assets");
  try {
    cpSync(new URL("../docs/assets/", import.meta.url), dir, { recursive: true });
    cpSync(new URL("../src/", import.meta.url), join(root, "src"), { recursive: true });
    const view = join(dir, "dashboard", "how-view.mjs");
    writeFileSync(view, readFileSync(view, "utf8") + '\nexport const stylesheet = "how-view.css";\n');
    const assets = pathToFileURL(dir + "/");
    const page = await openDashboard({ server: await repoServer({ files: FILES }), assets });
    assert.deepEqual(page.stylesheets(), [], "the use cases bring none");
    await page.go("#how");
    await page.go("#uc");
    await page.go("#how");
    assert.deepEqual(page.stylesheets(), [new URL("dashboard/how-view.css", assets).href]);
    // Counter-proof: the real how-view.mjs names none, and nothing is linked.
    const real = await openDashboard({ server: await repoServer({ files: FILES }), hash: "#how" });
    assert.deepEqual(real.stylesheets(), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
