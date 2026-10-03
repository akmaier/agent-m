// A write refused for missing write access offers the GitHub path as a link (UC-008 4a, ITM-133): the commit is refused, the
// dashboard says so, and offers GitHub's new-file page prefilled with the approval record — the same page as without a token —,
// where the commit becomes a pull request that counts once a maintainer merges it.
// Run through tests/review-core.test.mjs, which SPEC.md names for this check: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: UC-008; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; NO TEXT TRAVELS IN A URL
// Level: component
//
// The real dashboard runs in tests/app-harness.mjs against the harness's GitHub fake, which refuses the write; the accept panel
// of a GitLab product and of a product's SPEC change is rendered on its own (review-views.mjs acceptPanel). These tests run
// inside the process of tests/review-core.test.mjs, so each puts back the globals the harness sets when it ends. Counter-proofs:
// docs/measurements/2026-10-01_write-refused-offers-the-github-path.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, REPO } from "../app-harness.mjs";
import { gitBlobSha, recordText, useCaseRecord, specRecord, approvalPath, createReviewSession } from "../../docs/assets/review-core.mjs";
import { newFileUrl, parseProductAddress } from "../../docs/assets/git-host.mjs";
import { acceptPanel, githubPath } from "../../docs/assets/dashboard/review-views.mjs";
// The helpers ITM-151 adds are read off the module, so that a missing one fails its own test, not the file.
import * as views from "../../docs/assets/dashboard/review-views.mjs";
import * as shell from "../../docs/assets/dashboard-app.mjs";
import { B_SPEC, B_P05, B_INDEX, QD, GL_ADDR } from "./helpers.mjs";

const API = "https://api.github.com";
const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status,
  headers: { "Content-Type": "application/json", ...headers } });
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const hrefs = (html) => [...String(html).matchAll(/\shref="([^"]*)"/g)].map((m) => unesc(m[1]));
const NEW_PAGE = `https://github.com/${REPO}/new/`;

const GLOBALS = ["location", "document", "localStorage", "caches", "window", "fetch", "addEventListener", "scrollTo", "matchMedia"];
async function isolated(f) {
  const before = new Map(GLOBALS.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  try { return await f(); } finally {
    for (const [k, d] of before) { if (d) Object.defineProperty(globalThis, k, d); else delete globalThis[k]; }
  }
}

// GitHub's contents API in its JSON form — what the write path asks for a file's current blob; the harness serves the raw form.
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
// A second use case, for the batches of UC-008 3d and 3e (ITM-151).
const UC3 = "docs/use-cases/UC-003-name-the-reviewer.md";
const UC3_TEXT = "---\nid: UC-003\ntitle: Name the reviewer\narea: review\nactors:\n  - Reviewer\nrealises:\n  - RULE ONE\n---\n" +
  "# UC-003 Name the reviewer\n\n## Main flow\n\n1. The dashboard names who accepted.\n";
const FILES = {
  "SPEC.md": B_SPEC, [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  "docs/use-cases/README.md": "# Use cases\n", "docs/approvals/README.md": "# Approval records\n", [UC2]: UC2_TEXT, [UC3]: UC3_TEXT,
};

// The server refuses the commit's first write (the tree) with `status` and `headers`.
const refuseWrite = (status, headers = {}, message = "Resource not accessible by personal access token") => (url, init) =>
  (init.method === "POST" && url.origin === API && url.pathname.endsWith("/git/trees") ? json({ message }, status, headers) : undefined);

async function instance(handlers = []) {
  let srv = null;
  srv = await repoServer({ files: FILES, handlers: [...handlers, contentsJson(() => srv)] });
  return srv;
}
const inMain = (sel) => globalThis.document.getElementById("main").querySelector(sel);

// UC-002 opened with a token, Accept pressed by a person, the commit refused as `refuse` says.
// -> { srv, result: the panel's result line (its text and its HTML), accept: the button }
async function refusedAccept(refuse) {
  const srv = await instance([refuse]);
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  await page.click("[data-accept-key]");
  const accept = inMain("[data-accept-key]");
  const out = accept.closest(".panel").querySelector(".result");
  return { srv, page, accept, result: { text: out.textContent, html: out.innerHTML } };
}

test("UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token", () => isolated(async () => {
  const { srv, accept, result } = await refusedAccept(refuseWrite(403));
  assert.deepEqual(srv.writes, [], "nothing is written");
  assert.equal(accept.disabled, false, "Accept can be pressed again");
  assert.match(result.html, /Your token cannot write to akmaier\/agent-m/, "the page says so");
  assert.match(result.html, /403/, "with the server's answer");
  const blob = await gitBlobSha(UC2_TEXT);
  const record = recordText(useCaseRecord(UC2, blob));
  const want = newFileUrl(REPO, "main", approvalPath("UC-002", blob), record);
  const links = hrefs(result.html).filter((x) => x.startsWith(NEW_PAGE));
  assert.deepEqual(links, [want], "one link: GitHub's new-file page with the approval record");
  // NO TEXT TRAVELS IN A URL: the link carries the record's path and the record, never the use case's text.
  const u = new URL(want);
  assert.equal(u.searchParams.get("filename"), approvalPath("UC-002", blob));
  assert.equal(u.searchParams.get("value"), record);
  assert.ok(!want.includes(encodeURIComponent("The dashboard shows the status")), "not the reviewed text");
  assert.match(result.html, /pull request/, "says that without write access the commit becomes a pull request");
  assert.match(result.html, /maintainer merges it/, "which counts once a maintainer merges it");
  // As without a token: the same page the accept panel links when no token is stored.
  const without = await openDashboard({ server: await instance(), hash: "#uc/UC-002", token: null });
  assert.deepEqual(hrefs(without.main()).filter((x) => x.startsWith(NEW_PAGE)), [want], "the same prefilled page");
}));

test("UC-008 4a counter-proof: a refusal for a used-up rate limit names the limit and offers no GitHub page", () => isolated(async () => {
  const reset = String(Math.floor(Date.now() / 1000) + 1800);
  const { srv, result } = await refusedAccept(refuseWrite(403,
    { "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": reset }, "API rate limit exceeded"));
  assert.deepEqual(srv.writes, []);
  const said = `${result.text} ${result.html}`;
  assert.match(said, /used up/, "the limit is named");
  assert.doesNotMatch(said, /cannot write|pull request/, "not blamed on the token's access");
  assert.ok(!hrefs(result.html).some((x) => x.startsWith("https://github.com/")), "no GitHub page offered");
}));

test("UC-008 4a counter-proof: a token the server refuses (401) is named for renewal, and no GitHub page is offered", () => isolated(async () => {
  const { srv, result } = await refusedAccept(refuseWrite(401, {}, "Bad credentials"));
  assert.deepEqual(srv.writes, []);
  const said = `${result.text} ${result.html}`;
  assert.match(said, /GitHub refused your GitHub token/);
  assert.doesNotMatch(said, /cannot write|pull request/);
  assert.ok(!hrefs(result.html).some((x) => x.startsWith(NEW_PAGE)), "no GitHub page offered");
}));

// The context the accept panel reads from the page (dashboard-app.mjs context()), for a product shown with a stored token.
function panelApp(product, repo) {
  const T = { product, repo, instance: REPO, ref: "main" };
  return { T, GITLAB: product.kind === "gitlab", SERVER: product.kind === "gitlab" ? product.host : "GitHub",
    session: createReviewSession(), token: () => "a-stored-token" };
}

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's", async () => {
  const p = parseProductAddress(GL_ADDR);
  const blob = await gitBlobSha(UC2_TEXT);
  const app = panelApp(p, p.repo), rec = useCaseRecord(UC2, blob), path = approvalPath("UC-002", blob);
  const html = acceptPanel(app, rec, path, "UC-002", { kind: "use-case", id: "UC-002", path: UC2, blob });
  assert.match(html, /data-accept-key/, "Accept is offered, with the project's token");
  assert.equal(githubPath(app, rec, path), null, "no GitHub page to fall back to");
  assert.doesNotMatch(html, /github\.com/);
  const e = Object.assign(new Error("POST /api/v4/projects/x/repository/commits: 403 Forbidden"), { status: 403 });
  assert.equal(shell.writeAccessRefused(e, p), false, "GitLab's 403 is not the GitHub path's refusal");
  assert.match(shell.writeRefusalText(e, p), /GitLab refused the write/);
  assert.doesNotMatch(shell.writeRefusalText(e, p), /GitHub/);
});

test("UC-006 4c: a product's SPEC change refused for missing write access offers no GitHub page; counter-proof: the instance's does", async () => {
  const blob = await gitBlobSha(B_P05), section = await gitBlobSha("## 10. R\n\nold ten\n");
  const rec = specRecord({ queue: QD, entry: 5, proposal: `${QD}/05-a.md`, blob, target: "SPEC.md", anchor: "## 10. R", section });
  const path = approvalPath(`spec-${QD.split("/").pop()}-05`, blob);
  const item = { kind: "spec", queue: QD, nr: 5 };
  const product = parseProductAddress("https://github.com/alice/thesis-tool");
  const forProduct = panelApp(product, "alice/thesis-tool");
  assert.match(acceptPanel(forProduct, rec, path, "entry 05", item), /data-accept-key/, "Accept is offered, with the token");
  assert.equal(githubPath(forProduct, rec, path), null, "no product carries the workflow that would apply a record committed on GitHub's page");
  // A product's use case keeps its GitHub path (UC-008 3b): only the SPEC change is held back.
  const ucBlob = await gitBlobSha(UC2_TEXT);
  assert.ok(githubPath(forProduct, useCaseRecord(UC2, ucBlob), approvalPath("UC-002", ucBlob))?.startsWith("https://github.com/alice/thesis-tool/new/"));
  const own = parseProductAddress(`https://github.com/${REPO}`);
  assert.equal(githubPath(panelApp(own, REPO), rec, path), newFileUrl(REPO, "main", path, recordText(rec)), "the instance's workflow applies it");
});

test("writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not", () => {
  const gh = parseProductAddress(`https://github.com/${REPO}`);
  const err = (status, message, headers = {}) => Object.assign(new Error(`POST /repos/${REPO}/git/trees: ${status} ${message}`),
    { status, headers: new Headers(headers), authenticated: true });
  assert.equal(shell.writeAccessRefused(err(403, "Resource not accessible by personal access token"), gh), true);
  assert.equal(shell.writeAccessRefused(err(404, "Not Found"), gh), true);
  assert.equal(shell.writeAccessRefused(err(403, "API rate limit exceeded", { "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0" }), gh), false);
  assert.equal(shell.writeAccessRefused(err(401, "Bad credentials"), gh), false);
  assert.equal(shell.writeAccessRefused(err(422, "Update is not a fast forward"), gh), false);
  assert.equal(shell.writeAccessRefused(null, gh), false);
});

// ================================================================ ITM-151 — a refused batch and a refused save (UC-008 3d, 3e, 3a with 4a; UC-018 6b)
//
// The same route for every acceptance commit and for the edit: a batch refused for missing write access links GitHub's new-file
// page of each of its records — GitHub's page commits one file at a time, as the Accept all panel says without a token —, and a
// refused Save offers GitHub's editor of the file, the control Edit offers without a token (UC-008 3b: the text to the clipboard,
// the editor opened; NO TEXT TRAVELS IN A URL). Counter-proofs: a used-up rate limit, a refused token (401) and a GitLab product
// get none; a save refused because the file changed meanwhile keeps ITM-131's newer version and gets none.

const LIMIT = () => ({ "X-RateLimit-Limit": "5000", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 1800) });
const REFUSALS = {
  limit: () => refuseWrite(403, LIMIT(), "API rate limit exceeded"),
  token: () => refuseWrite(401, {}, "Bad credentials"),
};
const triedCommit = (srv) => srv.requests.some((r) => r.startsWith("handler POST") && r.endsWith("/git/trees"));
// The new-file page of a use case's record, as the accept panel links it without a token.
async function recordPage(path, id, text) {
  const blob = await gitBlobSha(text);
  return newFileUrl(REPO, "main", approvalPath(id, blob), recordText(useCaseRecord(path, blob)));
}
const resultOf = (sel) => { const out = inMain(sel).closest(".panel").querySelector(".result"); return { text: out.textContent, html: out.innerHTML }; };

// UC-002 and UC-003 opened and ticked with a token, Accept ticked pressed by a person, the commit refused as `refuse` says.
async function refusedTicked(refuse) {
  const srv = await instance([refuse]);
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  const tick = () => { const c = inMain("[data-tick]"); c.checked = true; c.fire("change", {}); };
  tick();
  await page.go("#uc/UC-003");
  tick();
  await page.click("[data-accept-ticked]");
  return { srv, page, result: resultOf("[data-accept-ticked]") };
}
// The review page of the use cases, Accept all pressed by a person, the commit refused as `refuse` says.
async function refusedAll(refuse) {
  const srv = await instance([refuse]);
  const page = await openDashboard({ server: srv, hash: "#review/uc" });
  assert.match(page.main(), /data-accept-all/, "known positive: the review page offers Accept all");
  await page.click("[data-accept-all]");
  return { srv, page, result: resultOf("[data-accept-all]") };
}

for (const [what, run] of [["UC-008 3d·4a: Accept ticked", refusedTicked], ["UC-008 3e·4a: Accept all", refusedAll]]) {
  test(`${what} refused for missing write access writes nothing; the page says so and links GitHub's new-file page of each record, prefilled with it`, () => isolated(async () => {
    const { srv, result } = await run(refuseWrite(403));
    assert.ok(triedCommit(srv), "known positive: the commit was tried and refused");
    assert.deepEqual(srv.writes, [], "nothing is written");
    assert.match(`${result.text} ${result.html}`, /Your token cannot write to akmaier\/agent-m/, "the page says so");
    assert.match(`${result.text} ${result.html}`, /403/, "with the server's answer");
    const want = [await recordPage(UC2, "UC-002", UC2_TEXT), await recordPage(UC3, "UC-003", UC3_TEXT)];
    assert.deepEqual(hrefs(result.html).filter((x) => x.startsWith(NEW_PAGE)).sort(), [...want].sort(),
      "one link per record: GitHub's new-file page prefilled with it");
    for (const x of want) {
      assert.ok(!x.includes(encodeURIComponent("The dashboard shows the status")) && !x.includes(encodeURIComponent("names who accepted")),
        "NO TEXT TRAVELS IN A URL: the record, never the use case's text");
    }
    assert.match(result.html, /UC-002/);
    assert.match(result.html, /UC-003/, "each link names its record");
    assert.match(result.html, /pull request/, "says that without write access each commit becomes a pull request");
    assert.match(result.html, /maintainer merges/, "which counts once a maintainer merges it");
  }));

  test(`${what} counter-proof: refused for a used-up rate limit or a refused token (401), it offers no GitHub page`, () => isolated(async () => {
    for (const [why, refuse] of Object.entries(REFUSALS)) {
      const { srv, result } = await run(refuse());
      assert.ok(triedCommit(srv), `${why}: known positive: the commit was tried`);
      assert.deepEqual(srv.writes, [], why);
      const said = `${result.text} ${result.html}`;
      assert.match(said, why === "limit" ? /used up/ : /GitHub refused your GitHub token/, `${why}: named as what it is — ${said}`);
      assert.doesNotMatch(said, /cannot write|pull request/, `${why}: not blamed on the token's access`);
      assert.ok(!hrefs(result.html).some((x) => x.startsWith("https://github.com/")), `${why}: no GitHub page offered`);
    }
  }));
}

// The context the refusal helpers read, for a product shown with a stored token: the shell's own refusal rules for that product.
function refusalApp(product, repo) {
  return { ...panelApp(product, repo), writeAccessRefused: (e) => shell.writeAccessRefused(e, product),
    writeErrorText: (e, o) => shell.writeRefusalText(e, product, new Date(), typeof o === "string" ? { githubPage: o } : o || {}) || e.message };
}
const denied = (status, message) => Object.assign(new Error(`POST /x/git/trees: ${status} ${message}`), { status, headers: new Headers() });

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused batch gets no GitHub page; counter-proof: a GitHub product's does", async () => {
  const blob = await gitBlobSha(UC2_TEXT), item = { kind: "use-case", id: "UC-002", path: UC2, blob };
  const gl = parseProductAddress(GL_ADDR), gh = parseProductAddress(`https://github.com/${REPO}`);
  const glApp = refusalApp(gl, gl.repo), ghApp = refusalApp(gh, REPO);
  assert.equal(views.reviewItemPage(glApp, item), null, "Accept all: no page for a GitLab record");
  assert.equal(views.reviewItemPage(ghApp, item), await recordPage(UC2, "UC-002", UC2_TEXT), "known positive: GitHub's page for a GitHub record");
  const e = denied(403, "Forbidden");
  const pages = [{ label: "UC-002", url: "https://github.com/x/y/new/main?filename=a" }];
  assert.equal(views.refusedAcceptHtml(glApp, e, pages, true), null, "a GitLab 403 shows GitLab's refusal only");
  assert.match(views.refusedAcceptHtml(ghApp, e, pages, true) ?? "", /href="https:\/\/github\.com\/x\/y\/new\/main/, "known positive");
});

// UC-002's editor opened with a token, `edit` typed, `newer` committed by someone else (or none), Save pressed by a person.
async function refusedSave({ edit, refuse = null, newer = null }) {
  const srv = await instance(refuse ? [refuse] : []);
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  await page.go("#uc/UC-002");
  await page.click("[data-toggle-edit]");
  const ta = dom.edit().querySelector("textarea");
  ta.value = edit;
  if (newer !== null) await srv.change(UC2, newer);
  await press(srv, inMain("[data-edit-save]"));
  const out = dom.edit().querySelector(".result");
  return { srv, dom, ta, result: { text: out.textContent, html: out.innerHTML } };
}
const EDIT = UC2_TEXT.replace("shows the status.", "shows the status, NO-WRITE-ACCESS.");
const editControls = (html) => [...String(html).matchAll(/<button[^>]*\sdata-edit-commit="([^"]*)"[^>]*>/g)].map((m) => unesc(m[1]));

test("UC-008 3a·4a, UC-018 6b: a Save refused for missing write access writes nothing, keeps the edit, says so and offers GitHub's editor of the file — the text to the clipboard, never in a URL", () => isolated(async () => {
  const { srv, ta, result } = await refusedSave({ edit: EDIT, refuse: refuseWrite(403) });
  assert.ok(triedCommit(srv), "known positive: the commit was tried and refused");
  assert.deepEqual(srv.writes, [], "nothing is written");
  assert.equal(ta.value, EDIT, "the edit stays in the editor");
  assert.match(`${result.text} ${result.html}`, /Your token cannot write to akmaier\/agent-m/, "the page says so");
  assert.match(`${result.text} ${result.html}`, /403/, "with the server's answer");
  assert.deepEqual(editControls(result.html), [UC2], "the control that copies the text and opens GitHub's editor of the file");
  assert.match(result.html, /GitHub's editor/, "named as GitHub's editor");
  assert.match(result.html, /pull request/, "says that without write access the commit becomes a pull request");
  assert.ok(!hrefs(result.html).some((x) => x.includes("NO-WRITE-ACCESS") || x.includes(encodeURIComponent("NO-WRITE-ACCESS"))),
    "NO TEXT TRAVELS IN A URL");
  assert.ok(!hrefs(result.html).some((x) => x.startsWith(NEW_PAGE)), "no new-file page: the edit is not an approval record");
}));

test("UC-018 6b counter-proof: a Save refused for a used-up limit, a refused token (401) or a text changed meanwhile offers no GitHub editor", () => isolated(async () => {
  for (const [why, refuse] of Object.entries(REFUSALS)) {
    const { srv, ta, result } = await refusedSave({ edit: EDIT, refuse: refuse() });
    assert.ok(triedCommit(srv), `${why}: known positive: the commit was tried`);
    assert.deepEqual(srv.writes, [], why);
    assert.equal(ta.value, EDIT, `${why}: the edit stays`);
    assert.deepEqual(editControls(result.html), [], `${why}: no GitHub editor offered — ${result.text} ${result.html}`);
    assert.doesNotMatch(`${result.text} ${result.html}`, /cannot write|pull request/, `${why}: not blamed on the token's access`);
  }
  // ITM-131: the file changed after the editor opened — the newer version beside the edit, and no GitHub route.
  const { srv, dom, result } = await refusedSave({ edit: EDIT, newer: UC2_TEXT + "\nA line someone else added.\n" });
  assert.deepEqual(srv.writes, []);
  assert.match(result.text, /changed since you opened it/, "known positive: ITM-131's refusal");
  assert.match(dom.edit().querySelector(".edit-newer")?.innerHTML ?? "", /Newer version on main/, "the newer version shown");
  assert.deepEqual(editControls(result.html), [], "no GitHub editor offered");
}));

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused Save gets no GitHub editor; counter-proof: a GitHub product's does", () => {
  const gl = parseProductAddress(GL_ADDR), gh = parseProductAddress(`https://github.com/${REPO}`);
  const e = denied(403, "Forbidden");
  assert.equal(views.refusedSaveHtml(refusalApp(gl, gl.repo), e, UC2), null, "GitLab's refusal only");
  assert.deepEqual(editControls(views.refusedSaveHtml(refusalApp(gh, REPO), e, UC2) ?? ""), [UC2], "known positive");
});
