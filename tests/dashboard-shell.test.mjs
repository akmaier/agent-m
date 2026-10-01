// The dashboard shell — the tab bar written from the table of views, each view loaded by its name, a view or settings section
// whose file is not there not shown, and the request handlers a view's tests bring to the harness. Run: node --test tests/
//
// Module: MOD-dashboard-app
// Guards: EVERY SETTING IS REACHED FROM ONE PAGE; UC-001; UC-006; UC-008; UC-014; UC-022; UC-023; UC-042
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub API mock. The counter-proofs
// are recorded in docs/measurements/2026-10-01_dashboard-shell.md.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { repoServer, openDashboard } from "./app-harness.mjs";
import { DASHBOARD } from "../docs/assets/dashboard-app.mjs";

const UC = "docs/use-cases/UC-001-add-a-product.md";
const FILES = {
  "SPEC.md": "# SPEC\n",
  [UC]: "---\nid: UC-001\ntitle: Add a product\narea: setup\nrealises:\n  - NO SERVER\n---\n# UC-001 Add a product\n",
};

// The tab bar docs/index.html carried before the views had files of their own, link for link.
const TABS_BEFORE = [
  '<a href="#uc" role="tab" id="tab-uc">Use cases</a>',
  '<a href="#arc" role="tab" id="tab-arc">Architecture</a>',
  '<a href="#spec" role="tab" id="tab-spec">SPEC changes</a>',
  '<a href="#how" role="tab" id="tab-how">How acceptance works</a>',
  '<a href="#settings" role="tab" id="tab-settings" title="Every setting Agent M uses"><span aria-hidden="true">⚙</span> Settings</a>',
];

test("with every view file of today, the tab bar shows the tabs it showed before, in their order", async () => {
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  assert.deepEqual(page.el("tabs").split("\n"), TABS_BEFORE);
});

test("every view of today is shown — use cases, architecture, SPEC changes, how acceptance works, settings, add product, setup, review pages", async () => {
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  const heading = async (hash) => { await page.go(hash); return (/<h2>([^<]*)/.exec(page.main()) || [])[1]?.trim(); };
  assert.equal(await heading("#uc"), "Use cases");
  assert.equal(await heading("#uc/UC-001"), "UC-001 Add a product");
  assert.equal(await heading("#arc"), "Architecture");
  assert.equal(await heading("#spec"), "SPEC changes");
  assert.equal(await heading("#how"), "How acceptance works");
  assert.equal(await heading("#settings"), "Settings");
  assert.equal(await heading("#add"), "Add a product");
  assert.equal(await heading("#setup"), "Finish setting up your instance");
  assert.equal(await heading("#review/uc"), "Review all — use cases");
  assert.equal(await heading("#review/arc"), "Review all — architecture");
});

test("a view or settings section whose file is not there yet is not shown, and its address shows the use cases", async () => {
  const views = new URL("../docs/assets/dashboard/", import.meta.url);
  const missing = DASHBOARD.filter((x) => x.file && !existsSync(new URL(x.file, views)));
  const view = missing.find((x) => x.view && x.tab), section = missing.find((x) => x.section);
  assert.ok(view && section, "the table names a view with a tab and a settings section that have no file yet");
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  assert.doesNotMatch(page.el("tabs"), new RegExp(`id="tab-${view.view}"`));
  await page.go(`#${view.view}`);
  assert.match(page.main(), /<h2>Use cases<\/h2>/);
  await page.go("#settings");
  assert.doesNotMatch(page.main(), new RegExp(`data-settings-section="${section.section}"`));
  // Counter-proof: a view whose file is there has its tab, and a built-in section is on the page.
  assert.match(page.el("tabs"), /id="tab-how"/);
  assert.match(page.main(), /id="product-settings"/);
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
