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
import { repoServer, openDashboard, REPO } from "../app-harness.mjs";
import { gitBlobSha, recordText, useCaseRecord, specRecord, approvalPath, createReviewSession } from "../../docs/assets/review-core.mjs";
import { newFileUrl, parseProductAddress } from "../../docs/assets/git-host.mjs";
import { acceptPanel } from "../../docs/assets/dashboard/review-views.mjs";
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
const FILES = {
  "SPEC.md": B_SPEC, [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  "docs/use-cases/README.md": "# Use cases\n", "docs/approvals/README.md": "# Approval records\n", [UC2]: UC2_TEXT,
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
const githubPageOf = (html) => {
  const m = /\sdata-github-page="([^"]*)"/.exec(html);
  return m ? unesc(m[1]) : null;
};

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write offers no GitHub page — its refusal is GitLab's", async () => {
  const p = parseProductAddress(GL_ADDR);
  const blob = await gitBlobSha(UC2_TEXT);
  const html = acceptPanel(panelApp(p, p.repo), useCaseRecord(UC2, blob), approvalPath("UC-002", blob), "UC-002",
    { kind: "use-case", id: "UC-002", path: UC2, blob });
  assert.match(html, /data-accept-key/, "Accept is offered, with the project's token");
  assert.equal(githubPageOf(html), null, "no GitHub page to fall back to");
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
  const forProduct = acceptPanel(panelApp(product, "alice/thesis-tool"), rec, path, "entry 05", item);
  assert.match(forProduct, /data-accept-key/, "Accept is offered, with the token");
  assert.equal(githubPageOf(forProduct), null, "no product carries the workflow that would apply a record committed on GitHub's page");
  const own = parseProductAddress(`https://github.com/${REPO}`);
  const forInstance = acceptPanel(panelApp(own, REPO), rec, path, "entry 05", item);
  assert.equal(githubPageOf(forInstance), newFileUrl(REPO, "main", path, recordText(rec)), "the instance's workflow applies it");
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
