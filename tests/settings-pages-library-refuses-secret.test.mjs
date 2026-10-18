// The library connects the hosts it commits through with the stored secrets (ITM-899): a commit to the repository a restricted source names, and the Move of a
// product to a source's newer version, are refused as SecretRefused when the text they write holds a secret this browser stores, and nothing is written. The route
// `library/<source>` is rendered into the fixture DOM of tests/settings-pages-harness.mjs over MOD-repository-hosts' real GitHub host (connect) for the instance, the named
// repository and each product, answered by a fake of fetch over repositories that hold files (tests/settings-pages-sources.d/github.mjs); nothing reaches the network.
// The instance's host is connected as the frame connects it (src/site-frame/routing.mjs, with `secrets: secretValues(store)`); the library connects the named repository's host
// and each product's host itself (src/settings-pages/library.mjs, commitPlan and readProducts).
// Run: node --test tests/settings-pages-library-refuses-secret.test.mjs
//
// Module: MOD-settings-pages
// Guards: NO SECRET IN THE REPOSITORY
// Level: unit
//
// The expected results are written here from NO SECRET IN THE REPOSITORY ("No API key, access token or endpoint credential is written into a repository managed by Agent M")
// and from the sentence of MOD-repository-hosts' `commitFiles` that a file whose text holds a configured secret refuses the whole commit with `SecretRefused` and writes
// nothing; none is read from a document when a test runs. A key stored as the key of a model endpoint is such a credential. Its value is a part of the text that the click
// writes, as TST-868006 (the recording switch) and TST-883001 (the layout's CHANGELOG.md) do for texts the page fixes. Reading, named in the pull request: the page shows a refused
// commit as `✗ <the error's message> — nothing was recorded.` for + New version and as `✗ <the error's message> — nothing was written.` for Move (library.mjs, the catches of
// Save new version and of Move), and the message of SecretRefused is `<file> holds a configured secret — nothing was written.`, so the two lines carry that sentence once and
// their own ending. The known positives (AGENTS.md 6a.2): with a stored key that is no part of the text, the same click writes. The callers read first (AGENTS.md 6a.1):
// tests/settings-pages-library-versions.test.mjs (TST-591304 and TST-591307: the same clicks and the world they run in; its helpers are written again here: a test file imports no
// other test file). The hosts that the library connects and through which no caller commits (library.mjs holderOf and the register's repository pin, participants.mjs
// productHostOf) pass the option untested. The counter-proofs are recorded in the pull request.

import test from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { installDocument, byClass, click, type, until } from "./settings-pages-harness.mjs";
import { attachedTarget, freshStore } from "./settings-pages-setup.d/dom.mjs";
import { githubWorld, installWorld, isWrite, registerEntry } from "./settings-pages-sources.d/github.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { writeSetting, secretValues } = await import("../src/browser-store/index.mjs");
const { connect, parseAddress } = await import("../src/repository-hosts/index.mjs");
const library = view.routes.find((candidate) => candidate.name === "library");

const INSTANCE = "akmaier/agent-m";
const THESIS = "https://github.com/alice/thesis-tool", NAMED = "https://github.com/alice/handbook-content";
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij", PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk", NAMED_TOKEN = "github_pat_NAMED012345678901234567890abc";
const NOT_IN_ANY_TEXT = "sk-not-part-of-any-written-text-0123456789";
const repoOf = (web) => parseAddress(web).path;

// A restricted source SRC-handbook whose content lies in the named repository, with versions 1 and 2; an open source SRC-ai-act with versions v1 and v2. Hashes are real: readContent checks them.
const sha = (value) => createHash("sha256").update(value).digest("hex");
const versionHash = (name, value) => sha(`${sha(value)}  ${name}\n`);
const H1 = "Chapter 1\n", H2 = "Chapter 1\nChapter 2\n", V1 = "Article 1\n", V2 = "Article 1\nArticle 2\n";
const version = (id, date, name, value) => ({ version: id, date, hash: versionHash(name, value), files: [{ name, sha256: sha(value) }] });
const HANDBOOK = registerEntry({ id: "SRC-handbook", title: "Faculty handbook", kind: "document", authority: "normative", licence: "restricted — internal", content_repository: NAMED,
  versions: [version("1", "2026-09-01", "handbook.md", H1), version("2", "2026-10-01", "handbook.md", H2)] });
const AI = registerEntry({ id: "SRC-ai-act", title: "EU AI Act", kind: "document", authority: "normative", licence: "may be republished — EU law",
  versions: [version("v1", "2025-08-02", "act.md", V1), version("v2", "2026-02-02", "act.md", V2)] });
const INSTANCE_FILES = { "docs/sources/SRC-handbook.md": HANDBOOK, "docs/sources/SRC-ai-act.md": AI, "docs/sources/SRC-ai-act/v1/act.md": V1, "docs/sources/SRC-ai-act/v2/act.md": V2 };
const NAMED_FILES = { "docs/sources/SRC-handbook/1/handbook.md": H1, "docs/sources/SRC-handbook/2/handbook.md": H2 };
const SPEC = ["# Thesis tool — Specification", "", "## 1. Export", "", "**EXPORT IS A PDF** *(SRC-ai-act, Art. 13; PO B. Example)*", "The export is one PDF file.", "*Check:* `tests/export.test.mjs`", ""].join("\n");
const ON_V1 = ["# Requirement sources of thesis-tool", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-ai-act | v1 | ${versionHash("act.md", V1)} | Art. 13 |`, ""].join("\n");

// The page: a world of the repositories, the real hosts over it, a store keeping the tokens, `products` and a model endpoint whose key is `secret`, and the route rendered for `source`.
async function open(t, { secret, source, products = [] }) {
  const world = githubWorld({ [INSTANCE]: { files: INSTANCE_FILES }, [repoOf(NAMED)]: { files: NAMED_FILES }, [repoOf(THESIS)]: { files: { "SPEC.md": SPEC, "docs/sources.md": ON_V1 } } });
  installWorld(t, world);
  const store = freshStore();
  writeSetting(store, "github-token", { value: TOKEN, name: "Agent M", expires: "2027-01-01" });
  writeSetting(store, `github-token:${repoOf(THESIS)}`, { value: PRODUCT_TOKEN, name: "thesis", expires: "2027-01-01" });
  writeSetting(store, `github-token:${repoOf(NAMED)}`, { value: NAMED_TOKEN, name: "named", expires: "2027-01-01" });
  writeSetting(store, "endpoint:ep1", { url: "https://models.example/v1", kind: "openai-compatible", model: "model-a", key: secret });
  writeSetting(store, "products", products);
  const context = { page: "review", instance: { repository: INSTANCE, host: connect(parseAddress(`https://github.com/${INSTANCE}`), { token: TOKEN, secrets: secretValues(store) }) },
    product: null, store, go() {} };
  const target = attachedTarget();
  await library.render(target, context, { source });
  return { world, target };
}
const one = (root, name) => { const found = byClass(root, name); assert.equal(found.length, 1, `exactly one .${name}`); return found[0]; };
const text = (root, name) => one(root, name).textContent;
const commitsOf = (page, repository) => page.world.commits(repository);
const writes = (page) => page.world.requests.filter(isWrite);
const bytesOf = (value) => new TextEncoder().encode(value);
const fileOf = (name, value) => ({ name, size: bytesOf(value).length, arrayBuffer: async () => bytesOf(value).buffer.slice(0) });

// + New version 3 of SRC-handbook with the file handbook.md holding "Chapter 3\n", and its Save.
async function recordHandbookThree(page) {
  await click(one(page.target, "library-new-version"));
  type(one(page.target, "library-version-id"), "3");
  type(one(page.target, "library-version-date"), "2026-11-01");
  const input = one(page.target, "library-version-files");
  input.files = [fileOf("handbook.md", "Chapter 3\n")];
  input.dispatchEvent(new Event("change"));
  await until(() => byClass(page.target, "library-file-hash").length === 1 && /[0-9a-f]{64}/.test(text(page.target, "library-file-hash")), "the file is hashed");
  await click(one(page.target, "library-version-save"));
  await until(() => text(page.target, "library-version-result") !== "", "the result is shown");
}

// Move of the product thesis-tool from v1 to v2 of SRC-ai-act, to the press of Move.
async function moveThesis(page) {
  await click(one(page.target, "library-move-open"));
  await until(() => byClass(page.target, "library-move-confirm").length === 1, "the move is prepared");
  await click(one(page.target, "library-move-confirm"));
  await until(() => byClass(page.target, "library-move-done").length === 1 || byClass(page.target, "library-move-result").some((node) => node.textContent !== ""), "the move has ended");
}

// TST-899001
// level: unit
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: SRC-handbook, restricted, whose entry names https://github.com/alice/handbook-content for its content; the tokens stored; a model endpoint whose key is "Chapter 3", a part of the file about to be written
// input: render library/SRC-handbook; + New version 3, the file handbook.md holding "Chapter 3\n", press Save new version
// expect: the result reads "✗ docs/sources/SRC-handbook/3/handbook.md holds a configured secret — nothing was written. — nothing was recorded."; no request writes to any repository; nothing is committed to the named repository or to the instance
test("new version — the commit to the repository a restricted source names refuses a text that holds a stored secret", async (t) => {
  const page = await open(t, { secret: "Chapter 3", source: "SRC-handbook" });
  await recordHandbookThree(page);
  assert.equal(text(page.target, "library-version-result"), "✗ docs/sources/SRC-handbook/3/handbook.md holds a configured secret — nothing was written. — nothing was recorded.");
  assert.deepEqual(writes(page).map((request) => `${request.method} ${request.url.pathname}`), [], "no request writes");
  assert.deepEqual([commitsOf(page, repoOf(NAMED)).length, commitsOf(page, INSTANCE).length], [0, 0], "nothing is committed");
});

// TST-899002
// level: unit
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, but the model endpoint's key is no part of any text the click writes
// input: the same clicks
// expect: the result begins "✓ 3 is recorded for SRC-handbook"; one commit in the named repository holding exactly docs/sources/SRC-handbook/3/handbook.md with "Chapter 3\n", then one in the instance; no file of either holds the key (the known positive of TST-899001)
test("new version — with a stored secret that is no part of the text, the same click commits to the named repository and the instance", async (t) => {
  const page = await open(t, { secret: NOT_IN_ANY_TEXT, source: "SRC-handbook" });
  await recordHandbookThree(page);
  assert.equal(text(page.target, "library-version-result").startsWith("✓ 3 is recorded for SRC-handbook"), true, `the result says it recorded (it says: ${text(page.target, "library-version-result")})`);
  assert.deepEqual(commitsOf(page, repoOf(NAMED)).map((commit) => commit.files), [{ "docs/sources/SRC-handbook/3/handbook.md": "Chapter 3\n" }]);
  assert.equal(commitsOf(page, INSTANCE).length, 1, "one commit in the instance");
  const written = [...commitsOf(page, repoOf(NAMED)), ...commitsOf(page, INSTANCE)].flatMap((commit) => Object.values(commit.files));
  assert.equal(written.some((file) => file.includes(NOT_IN_ANY_TEXT)), false, "no file holds the key");
});

// TST-899003
// level: unit
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: SRC-ai-act with v1 and v2; the browser keeps the product thesis-tool, whose docs/sources.md links v1; a model endpoint whose key is "SRC-ai-act | v2 |", a part of the link row Move writes
// input: render library/SRC-ai-act; press Move to the new version of thesis-tool; press Move
// expect: the result reads "✗ docs/sources.md holds a configured secret — nothing was written. — nothing was written."; no request writes to any repository; nothing is committed to thesis-tool; the link stays at v1 in the product's repository; the page does not say the product moved
test("move — the commit to a product refuses a link row that holds a stored secret", async (t) => {
  const page = await open(t, { secret: "SRC-ai-act | v2 |", source: "SRC-ai-act", products: [THESIS] });
  await moveThesis(page);
  const shown = byClass(page.target, "library-move-result").map((node) => node.textContent).join("");
  assert.equal(shown, "✗ docs/sources.md holds a configured secret — nothing was written. — nothing was written.");
  assert.deepEqual(writes(page).map((request) => `${request.method} ${request.url.pathname}`), [], "no request writes");
  assert.equal(commitsOf(page, repoOf(THESIS)).length, 0, "nothing is committed to the product");
  assert.equal(page.world.files(repoOf(THESIS))["docs/sources.md"], ON_V1, "the link stays at v1");
  assert.equal(byClass(page.target, "library-move-done").length, 0, "the page does not say the product moved");
});

// TST-899004
// level: unit
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, but the model endpoint's key is no part of any text the click writes
// input: the same clicks
// expect: one commit in thesis-tool holding exactly docs/sources.md with the row of SRC-ai-act at v2 and the part "Art. 13" kept; the page says the product links SRC-ai-act at v2; no file holds the key (the known positive of TST-899003)
test("move — with a stored secret that is no part of the link row, the same click commits docs/sources.md to the product", async (t) => {
  const page = await open(t, { secret: NOT_IN_ANY_TEXT, source: "SRC-ai-act", products: [THESIS] });
  await moveThesis(page);
  assert.equal(commitsOf(page, repoOf(THESIS)).length, 1, "one commit in the product");
  const files = commitsOf(page, repoOf(THESIS))[0].files;
  assert.deepEqual(Object.keys(files), ["docs/sources.md"]);
  assert.equal(files["docs/sources.md"].includes(`| SRC-ai-act | v2 | ${versionHash("act.md", V2)} | Art. 13 |`), true, "the link is at v2 with its part kept");
  assert.equal(files["docs/sources.md"].includes(NOT_IN_ANY_TEXT), false, "no file holds the key");
  assert.equal(text(page.target, "library-move-done").startsWith(`✓ ${THESIS} links SRC-ai-act at v2`), true);
});
