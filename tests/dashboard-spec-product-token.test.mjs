// A product's SPEC change without a token is not offered GitHub's new-file page: no product carries the workflow that would write
// an approval committed there, so the record would show "approved" for ever (UC-006 4c, the product's half). The entry and the
// head of the SPEC list say that accepting needs a token and link the token step (UC-001 step A, as UC-042 3a does for a product's
// settings). What stays: the instance's own SPEC keeps GitHub's page (UC-006 4b, 4c), a product's use case keeps it (UC-008 3b),
// a product with a token keeps Accept, and a GitLab product keeps the panel that stores its project token (UC-008 3c). The real
// app (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against fake GitHub and GitLab servers; no request leaves the
// process. Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; EVERY STEP EXPLAINS ITSELF; UC-006
// Level: component
//
// Counter-proofs (a planted fault for each test): docs/measurements/2026-10-03_spec-product-token.md (ITM-149).

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, REPO, TOKEN } from "./app-harness.mjs";
import { B_SPEC, B_P05, B_INDEX, QD, GL, GL_ADDR, fakeGitLab } from "./review-core.d/helpers.mjs";

const API = "https://api.github.com";
const PRODUCT = "alice/thesis-tool", PRODUCT_ADDR = `https://github.com/${PRODUCT}`;
const QNAME = QD.split("/").pop(), ENTRY = `#spec/${QNAME}/05`;
const UC = "docs/use-cases/UC-001-read-a-file.md";
const UC_TEXT = "---\nid: UC-001\ntitle: Read a file\narea: review\nactors:\n  - Reviewer\nrealises:\n  - RULE ONE\n---\n"
  + "# UC-001 Read a file\n\n## Main flow\n\n1. The reviewer opens the file.\n";

// One queue whose entry 05 replaces section 10 of the SPEC, with its rationale; and one use case never accepted.
const FILES = {
  "SPEC.md": B_SPEC,
  [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/05-a.begruendung.md`]: "# Why 05\n\nSection ten is RATIONALE-OUT-OF-DATE.\n",
  [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
  [UC]: UC_TEXT,
};

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const hrefs = (html) => [...String(html).matchAll(/href="([^"]*)"/g)].map((m) => unesc(m[1]));
const text = (html) => unesc(String(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
// The accept panel of the page: the section that holds "Accept entry …" or "Accept UC-…".
const acceptPanelOf = (html) => /<section class="panel accept">[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
// The head of the SPEC list: its first section.
const headOf = (html) => /<section class="head">[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
const TOKEN_STEP = (address) => `#add/${encodeURIComponent(address)}`;
const NEEDS_TOKEN = /accepting (?:it |a product's SPEC change )?needs a token/i;

// The instance's repository, and — when `product` is given — the product's on GitHub, both served from files; a GitLab project
// when `gitlab` is given. Every request is answered in this process.
async function world({ product = false, gitlab = null } = {}) {
  let prod = null;
  if (product) {
    const handlers = [
      // The branch's tree by the branch's name, as GitHub answers it.
      (u, init) => (u.pathname === `/repos/${PRODUCT}/git/trees/main` ? prod.fetch(new URL(u.href.replace("/git/trees/main", `/git/trees/${prod.head}`)), init) : undefined),
    ];
    prod = await repoServer({ repo: PRODUCT, files: FILES, handlers });
  }
  const forward = (u, init) => (prod && ((u.origin === API && u.pathname.startsWith(`/repos/${PRODUCT}`))
    || (u.origin === "https://raw.githubusercontent.com" && u.pathname.startsWith(`/${PRODUCT}/`))) ? prod.fetch(u, init) : undefined);
  const toGitLab = (u, init) => (gitlab && u.origin === GL ? gitlab.fetchMock(u.href, init) : undefined);
  const server = await repoServer({ files: FILES, handlers: [forward, toGitLab] });
  return { server, prod };
}
const onProduct = { search: `?repo=${PRODUCT}` };

// UC-006 4c, the product's half. Input: ?repo=<GitHub product>, no token, the entry of a SPEC change. Expected: the entry is shown
// with its section, proposal, difference and rationale; its accept panel offers no link to GitHub's new-file page of the product
// and no Accept button, says that accepting needs a token and why, with an explanation to expand, and links the token step of
// UC-001 for this product. Editing the proposal keeps GitHub's editor (UC-006 3a, 4b: a proposal file, which no workflow applies).
test("UC-006 4c: a product's SPEC entry without a token offers no GitHub page; it says a token is needed and links the token step", async () => {
  const w = await world({ product: true });
  const page = await openDashboard({ server: w.server, token: null, ...onProduct, hash: ENTRY });
  const html = page.main();
  assert.match(html, /<code>## 10\. R<\/code> in <code>SPEC\.md<\/code>/, "the section");
  assert.match(text(html), /new ten/, "the proposal");
  assert.match(html, /<h3>Difference<\/h3>/, "the difference");
  assert.match(text(html), /RATIONALE-OUT-OF-DATE/, "the rationale");
  assert.ok(!hrefs(html).some((x) => x.startsWith(`https://github.com/${PRODUCT}/new/`)), "no GitHub new-file page for the record");
  const panel = acceptPanelOf(html);
  assert.match(panel, /<h3>Accept entry 05<\/h3>/);
  assert.doesNotMatch(panel, /data-accept-key/, "no Accept without a token");
  assert.match(text(panel), NEEDS_TOKEN, "accepting needs a token");
  assert.match(text(panel), /no product carries the workflow/i, "and why (UC-006 4c)");
  assert.ok(hrefs(panel).includes(TOKEN_STEP(PRODUCT_ADDR)), "the token step of UC-001 for this product");
  assert.match(panel, /<details class="explain"><summary>/, "an explanation to expand (EVERY STEP EXPLAINS ITSELF)");
  assert.match(html, /data-edit-commit=/, "editing the proposal keeps GitHub's editor");
  assert.deepEqual(w.server.writes.concat(w.prod.writes), [], "nothing is written");
});

// UC-006 4c, the head of the SPEC list. Input: ?repo=<GitHub product>, no token, #spec. Expected: the head says that accepting
// needs a token, links the token step, and does not promise that the workflow writes the change.
test("UC-006 4c: the head of a product's SPEC list without a token says accepting needs a token and links the token step", async () => {
  const w = await world({ product: true });
  const page = await openDashboard({ server: w.server, token: null, ...onProduct, hash: "#spec" });
  const head = headOf(page.main());
  assert.match(head, /<h2>SPEC changes<\/h2>/);
  assert.match(text(head), NEEDS_TOKEN);
  assert.ok(hrefs(head).includes(TOKEN_STEP(PRODUCT_ADDR)), "the token step");
  assert.doesNotMatch(text(head), /workflow writes it/i, "no promise of a workflow the product does not carry");
});

// Counter-proof, UC-006 4b and 4c for the instance. Input: the instance's own dashboard, no token. Expected: the entry keeps
// GitHub's new-file page with the record, and the list's head keeps the sentence that the workflow writes it.
test("UC-006 4b, 4c counter-proof: the instance's SPEC entry without a token keeps GitHub's page, and its list the workflow sentence", async () => {
  const w = await world();
  const page = await openDashboard({ server: w.server, token: null, hash: "#spec" });
  assert.match(text(headOf(page.main())), /the workflow writes it into SPEC\.md byte for byte/);
  assert.doesNotMatch(text(headOf(page.main())), NEEDS_TOKEN);
  await page.go(ENTRY);
  const panel = acceptPanelOf(page.main());
  assert.ok(hrefs(panel).some((x) => x.startsWith(`https://github.com/${REPO}/new/main?filename=docs%2Fapprovals%2F`)
    || x.startsWith(`https://github.com/${REPO}/new/main?filename=docs/approvals/`)), "GitHub's new-file page with the record");
  assert.doesNotMatch(text(panel), NEEDS_TOKEN);
});

// Counter-proof, UC-008 3b. Input: ?repo=<GitHub product>, no token, a use case never accepted. Expected: Accept is GitHub's
// new-file page of the product, prefilled with the record — a record alone decides a use case.
test("UC-008 3b counter-proof: a product's use case without a token keeps GitHub's new-file page", async () => {
  const w = await world({ product: true });
  const page = await openDashboard({ server: w.server, token: null, ...onProduct, hash: "#uc/UC-001" });
  const panel = acceptPanelOf(page.main());
  assert.match(panel, /<h3>Accept UC-001<\/h3>/);
  assert.ok(hrefs(panel).some((x) => x.startsWith(`https://github.com/${PRODUCT}/new/main?`)), "GitHub's new-file page of the product");
  assert.doesNotMatch(text(panel), NEEDS_TOKEN);
});

// Counter-proof, UC-006 main flow on a product. Input: ?repo=<GitHub product>, a stored token. Expected: the entry offers Accept
// and no token step; the list's head says that accepting writes the approval and the proposal in one commit.
test("UC-006 counter-proof: a product's SPEC entry with a token keeps Accept", async () => {
  const w = await world({ product: true });
  const page = await openDashboard({ server: w.server, token: TOKEN, ...onProduct, hash: "#spec" });
  assert.match(text(headOf(page.main())), /in one commit/);
  assert.doesNotMatch(text(headOf(page.main())), NEEDS_TOKEN);
  await page.go(ENTRY);
  const panel = acceptPanelOf(page.main());
  assert.match(panel, /<button class="btn primary" data-accept-key="[^"]+">Accept<\/button>/);
  assert.doesNotMatch(text(panel), NEEDS_TOKEN);
  assert.ok(!hrefs(panel).includes(TOKEN_STEP(PRODUCT_ADDR)));
});

// Counter-proof, UC-008 3c for a SPEC entry. Input: ?product=<GitLab project>, no token. Expected: the panel of today — accepting
// on GitLab needs the project's own token, linked to its token step — and not the GitHub product's sentence.
test("UC-006 counter-proof: a GitLab product's SPEC entry without its token keeps the GitLab token panel", async () => {
  const gl = await fakeGitLab({ files: FILES });
  const w = await world({ gitlab: gl });
  const page = await openDashboard({ server: w.server, token: null, search: `?product=${encodeURIComponent(GL_ADDR)}`, hash: ENTRY });
  const panel = acceptPanelOf(page.main());
  assert.match(panel, /Accepting on GitLab needs this project's own token/);
  assert.ok(hrefs(panel).includes(TOKEN_STEP(GL_ADDR)));
  assert.doesNotMatch(text(panel), /no product carries the workflow/i);
  assert.doesNotMatch(panel, /data-accept-key|github\.com\/[^"]*\/new\//);
});
