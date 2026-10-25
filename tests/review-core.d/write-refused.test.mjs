// A write refused for missing write access offers the GitHub path as a link (UC-008 4a): the commit is refused, the
// dashboard says so, and offers GitHub's new-file page prefilled with the approval record — the same page as without a token —,
// where the commit becomes a pull request that counts once a maintainer merges it.
// Run through tests/review-core.test.mjs, which SPEC.md names for this check: node --test tests/*.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-008; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; NO TEXT TRAVELS IN A URL
// Level: component
//
// The real dashboard runs in tests/app-harness.mjs against the harness's GitHub fake, which refuses the write; the page is
// MOD-review-pages' route of the use case. These tests run inside the process of tests/review-core.test.mjs, so each puts back the
// globals the harness sets when it ends. The accept panel of a GitLab product and of a product's SPEC change is MOD-review-pages' own
// (tests/review-pages-use-cases.test.mjs, tests/review-pages-spec-entries.test.mjs). Counter-proofs:
// docs/measurements/2026-10-01_write-refused-offers-the-github-path.md.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, REPO } from "../app-harness.mjs";
import { recordText, useCaseRecord, approvalPath } from "../../docs/assets/review-core.mjs";
import { parseAddress, connect, HostError } from "../../src/repository-hosts/index.mjs";
import { blobSha } from "../../src/text-tools/index.mjs";
import * as shell from "../../src/site-frame/dashboard-app.mjs";
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
const UC2_TEXT = "---\nid: UC-002\ntitle: Show the status\narea: review\nactors:\n  - Reviewer\nrealises: []\n---\n" +
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
// -> { srv, result: the page's result line (its text and its HTML), accept: the button, page }
async function refusedAccept(refuse) {
  const srv = await instance([refuse]);
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  await page.click(".accept");
  const accept = inMain(".accept");
  const out = inMain(".result");
  return { srv, page, accept, result: { text: out?.textContent ?? "", html: page.main() } };
}

test("UC-008 4a: a commit refused for missing write access writes nothing; the page says so and links GitHub's new-file page prefilled with the approval record, as without a token", () => isolated(async () => {
  const { srv, accept, result } = await refusedAccept(refuseWrite(403));
  assert.deepEqual(srv.writes, [], "nothing is written");
  assert.equal(accept.disabled, false, "Accept can be pressed again");
  assert.match(result.html, /<p class="result">Your GitHub token may not write to https:\/\/github\.com\/akmaier\/agent-m/, "the page says so");
  const blob = await blobSha(UC2_TEXT);
  const record = recordText(useCaseRecord(UC2, blob));
  const want = connect(parseAddress(`https://github.com/${REPO}`)).webLinks().newFile(approvalPath("UC-002", blob), record);
  const links = hrefs(result.html).filter((x) => x.startsWith(NEW_PAGE));
  assert.deepEqual(links, [want], "one link: GitHub's new-file page with the approval record");
  // NO TEXT TRAVELS IN A URL: the link carries the record's path and the record, never the use case's text.
  const u = new URL(want);
  assert.equal(u.searchParams.get("filename"), approvalPath("UC-002", blob));
  assert.equal(u.searchParams.get("value"), record);
  assert.ok(!want.includes(encodeURIComponent("The dashboard shows the status")), "not the reviewed text");
  assert.match(result.html, /pull request/, "says that without write access the commit becomes a pull request");
  assert.match(result.html, /maintainer merges it/, "which counts once a maintainer merges it");
  // As without a token: the same page the use case links when no token is stored.
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
  const { srv, page, result } = await refusedAccept(refuseWrite(401, {}, "Bad credentials"));
  assert.deepEqual(srv.writes, []);
  // The refusal marks the token that was used, and the line at the top of every page says which token and where it is renewed.
  assert.match(page.el("token-banner"), /The server refused your token/);
  assert.match(page.el("token-banner"), /Renew/);
  const honest = await openDashboard({ server: await instance(), hash: "#uc/UC-002" });
  assert.doesNotMatch(honest.el("token-banner"), /refused your token/, "counter-proof: a token the server accepts is not marked");
  const said = `${result.text} ${result.html}`;
  assert.match(said, /GitHub rejected authentication with your GitHub token/);
  assert.doesNotMatch(said, /cannot write|pull request/);
  assert.ok(!hrefs(result.html).some((x) => x.startsWith(NEW_PAGE)), "no GitHub page offered");
}));

// A refusal as MOD-repository-hosts names it: a HostError by its name, with its fields.
const refusal = (name, fields = {}) => new HostError(name, fields, `${name} — refused`);

test("A GITLAB PRODUCT IS WRITTEN WITH A TOKEN: a GitLab product's refused write has no GitHub path — its refusal is GitLab's", () => {
  const p = shell.productOf(GL_ADDR);
  const e = refusal("PermissionMissing", { permission: "api", renewal: `${GL_ADDR}/-/settings/access_tokens` });
  assert.equal(shell.writeAccessRefused(e, p), false, "GitLab's 403 is not the GitHub path's refusal");
  assert.match(shell.writeRefusalText(e, p), /GitLab refused the write/);
  assert.doesNotMatch(shell.writeRefusalText(e, p), /GitHub/);
});

// Expected: a write GitHub refuses for missing write access — 403, or 404 where GitHub hides the repository, both of which
// MOD-repository-hosts names PermissionMissing — is missing write access; a used-up limit (RateLimited), a refused token
// (TokenRefused), a head that moved (Moved: GitHub's 422 "Update is not a fast forward"), an error that is no host's failure, and
// none at all are not.
test("writeAccessRefused: GitHub's 403 or 404 on a write is missing write access; counter-proof: a used-up limit, a 401 and another error are not", () => {
  const gh = shell.productOf(`https://github.com/${REPO}`);
  const renewal = "https://github.com/settings/personal-access-tokens";
  assert.equal(shell.writeAccessRefused(refusal("PermissionMissing", { permission: "Contents", renewal }), gh), true);
  assert.equal(shell.writeAccessRefused(refusal("RateLimited", { limit: "account", resetsAt: null }), gh), false);
  assert.equal(shell.writeAccessRefused(refusal("TokenRefused", { tokenName: "GitHub token", renewal }), gh), false);
  assert.equal(shell.writeAccessRefused(refusal("Moved", { head: "a".repeat(40) }), gh), false);
  assert.equal(shell.writeAccessRefused(Object.assign(new Error("403 Forbidden"), { name: "PermissionMissing" }), gh), false, "no host's failure");
  assert.equal(shell.writeAccessRefused(null, gh), false);
});
