// A refused save keeps the edit, shown beside the newer version — the dashboard's editor of a use case (UC-008 3a) and of a
// SPEC change proposal (UC-006 3a), when the file changed on the default branch after the editor opened.
// Run through tests/review-core.test.mjs, which SPEC.md names for this check: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: A REFUSED SAVE KEEPS THE EDIT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; UC-008; UC-006
// Level: component
//
// The real dashboard runs in tests/app-harness.mjs (with its richDocument, which reaches the edit panel) against the harness's
// GitHub fake. These tests run inside the process of tests/review-core.test.mjs, so each puts back the globals the harness
// sets (location, document, localStorage, caches, fetch, …) when it ends. Counter-proofs:
// docs/measurements/2026-10-01_refused-save-shows-the-newer-version.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, REPO } from "../app-harness.mjs";
import { B_SPEC, B_P05, B_INDEX, QD } from "./helpers.mjs";

const API = "https://api.github.com";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// The page's globals, put back after each test: the harness defines them for the dashboard, and the checks that run after
// these in the same process must not find a page there.
const GLOBALS = ["location", "document", "localStorage", "caches", "window", "fetch", "addEventListener", "scrollTo", "matchMedia"];
async function isolated(f) {
  const before = new Map(GLOBALS.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  try { return await f(); } finally {
    for (const [k, d] of before) { if (d) Object.defineProperty(globalThis, k, d); else delete globalThis[k]; }
  }
}

// GitHub's contents API in its JSON form — what the write path asks for a file's current blob before it writes over it; the
// harness serves the raw form only.
const contentsJson = (srv) => (url, init) => {
  if (init.method !== "GET" || url.origin !== API || init.headers?.Accept !== "application/vnd.github+json") return undefined;
  const m = new RegExp(`^/repos/${REPO}/contents/(.+)$`).exec(url.pathname);
  if (!m) return undefined;
  const sha = srv().shas[m[1].split("/").map(decodeURIComponent).join("/")];
  return sha ? json({ sha }) : json({ message: "Not Found" }, 404);
};

const UC2 = "docs/use-cases/UC-002-show-the-status.md";
const UC2_TEXT = "---\nid: UC-002\ntitle: Show the status\narea: review\nactors:\n  - Reviewer\nrealises:\n  - RULE ONE\n---\n" +
  "# UC-002 Show the status\n\n## Main flow\n\n1. The dashboard shows the status.\n";
const P05 = `${QD}/05-a.md`, QNAME = QD.split("/").pop();
const FILES = {
  "SPEC.md": B_SPEC, [`${QD}/index.md`]: B_INDEX, [P05]: B_P05, [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  "docs/use-cases/README.md": "# Use cases\n", "docs/approvals/README.md": "# Approval records\n", [UC2]: UC2_TEXT,
};

async function instance(handlers = []) {
  let srv = null;
  srv = await repoServer({ files: FILES, handlers: [...handlers, contentsJson(() => srv)] });
  return srv;
}
const inMain = (sel) => globalThis.document.getElementById("main").querySelector(sel);

// The editor of `hash` opened, `edit` typed into it, `newer` committed to `path` by someone else, then Save clicked by a person.
// -> { srv, page, dom, ta, made: the requests the click made }
async function refusedSave({ list, hash, path, edit, newer, caches = fakeCaches(), handlers = [] }) {
  const srv = await instance(handlers);
  const page = await openDashboard({ server: srv, hash: list, caches });
  const dom = richDocument();
  await page.go(hash);
  await page.click("[data-toggle-edit]");
  const ta = dom.edit().querySelector("textarea");
  ta.value = edit;
  if (newer !== null) await srv.change(path, newer);
  const made = await press(srv, inMain("[data-edit-save]"));
  return { srv, page, dom, ta, made, caches };
}

test("A REFUSED SAVE KEEPS THE EDIT — UC-008 3a: the use case changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it", () => isolated(async () => {
  const edit = UC2_TEXT.replace("shows the status.", "shows the status and the date.");
  const newer = UC2_TEXT + "\nA line someone else added.\n";
  const { srv, dom, ta, made, caches } = await refusedSave({ list: "#uc", hash: "#uc/UC-002", path: UC2, edit, newer });
  assert.deepEqual(srv.writes, [], "nothing is written");
  assert.equal(ta.value, edit, "the edited text stays in the editor");
  assert.match(dom.edit().querySelector(".result").textContent, /changed since you opened it/);
  const beside = dom.edit().querySelector(".edit-newer")?.innerHTML ?? "";
  assert.match(beside, /Newer version on main/, "the newer version, named");
  assert.ok(beside.includes(esc(newer)), "the newer text, in full");
  assert.ok(beside.includes(esc(edit)), "beside the edit");
  assert.match(beside, /<span class="ddel">- A line someone else added\.<\/span>/, "what the newer version has that the edit lacks");
  assert.match(beside, /<span class="dadd">\+ 1\. The dashboard shows the status and the date\.<\/span>/, "what the edit changed");
  // At most one read beyond the save's own: the file itself, once, at the branch — no snapshot, no tree.
  assert.deepEqual(made.filter((r) => !/^handler /.test(r)), ["ref", `file ${UC2}`]);
  // The newer text is kept in this browser by its blob SHA: the next page that shows it reads it from there, not again.
  const again = await openDashboard({ server: srv, hash: "#uc/UC-002", caches });
  assert.ok(again.main().includes("A line someone else added."), "the next page shows the newer text");
  assert.ok(!again.requests.includes(`file ${UC2}`), "and does not read it again");
}));

test("A REFUSED SAVE KEEPS THE EDIT — UC-006 3a: the proposal changed after the editor opened; Save writes nothing, the edit stays in the editor, and the newer version is shown beside it", () => isolated(async () => {
  const edit = B_P05.replace("new ten", "new ten, reworded");
  const newer = B_P05.replace("new ten", "new ten as someone else wrote it");
  const { srv, dom, ta, made } = await refusedSave({ list: "#spec", hash: `#spec/${QNAME}/05`, path: P05, edit, newer });
  assert.deepEqual(srv.writes, [], "nothing is written");
  assert.equal(srv.files["SPEC.md"], B_SPEC);
  assert.equal(ta.value, edit, "the edited text stays in the editor");
  assert.match(dom.edit().querySelector(".result").textContent, /changed since you opened it/);
  const beside = dom.edit().querySelector(".edit-newer")?.innerHTML ?? "";
  assert.match(beside, /Newer version on main/);
  assert.ok(beside.includes(esc(newer)), "the newer text, in full");
  assert.match(beside, /<span class="ddel">- new ten as someone else wrote it<\/span>/);
  assert.match(beside, /<span class="dadd">\+ new ten, reworded<\/span>/);
  assert.deepEqual(made.filter((r) => !/^handler /.test(r)), ["ref", `file ${P05}`]);
}));

test("A REFUSED SAVE KEEPS THE EDIT counter-proof: a save the server refuses for another reason (no write access) reads no newer version and shows none", () => isolated(async () => {
  const refuse = (url, init) => (init.method === "POST" && url.pathname.endsWith("/git/trees")
    ? json({ message: "Resource not accessible by personal access token" }, 403) : undefined);
  const edit = UC2_TEXT.replace("shows the status.", "shows the status and the date.");
  const { srv, dom, ta, made } = await refusedSave({ list: "#uc", hash: "#uc/UC-002", path: UC2, edit, newer: null, handlers: [refuse] });
  assert.deepEqual(srv.writes, []);
  assert.equal(ta.value, edit, "the edit stays");
  assert.match(dom.edit().querySelector(".result").textContent, /Your token cannot write to/);
  assert.equal(dom.edit().querySelector(".edit-newer")?.innerHTML ?? "", "", "no newer version: the file did not change");
  assert.ok(!made.includes(`file ${UC2}`), "and none is read");
}));
