// A collaborator's Save that the repository host refuses is shown on the Settings page, not thrown (ITM-884). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs on a product's pages (?repo=alice/thesis), against two GitHub fakes:
// the instance's, and a second repoServer for the product that the instance's server hands the product's requests to. This browser
// stores a model endpoint whose key is SECRET, the instance's GitHub token and the product's own token. The person opens Settings, goes
// through "Change, notice, paste and Save" on the line of the GitHub token (the page connects its hosts again with the stored secrets,
// ITM-868), and then, in the product's section, presses Save collaborator or Remove collaborator consent so that the text of
// docs/collaborators.md would hold SECRET. The page has three places that call saveFile for that file: Save collaborator on a file in
// the older table form (`| Name | Account | Agreed on |`), Save collaborator on any other file, and Remove collaborator consent.
// Run: node --test tests/settings-pages-collaborator-refusal.test.mjs
//
// Module: MOD-settings-pages
// Guards: NO SECRET IN THE REPOSITORY
// Level: component
//
// The expected results are written here from the Acceptance of ITM-884 as the pull request quotes it ("shows the refusal in the handler's
// result, naming the file and never the secret, as the recording's `write` does") and from NO SECRET IN THE REPOSITORY and the sentence
// of MOD-repository-hosts' `commitFiles` that a file whose text holds a configured secret refuses the whole commit with `SecretRefused`
// and writes nothing; none is read from a document when a test runs. Reading, named in the pull request: "the handler's result" is the
// result line of the collaborators (class settings-collaborator-result), and the refusal is shown as the message of the refusal, which
// names the file and says that it holds a configured secret (`docs/collaborators.md holds a configured secret — nothing was written.`),
// as the recording's `write` shows `error.message` in its result line. After the refusal the press resolves (it does not reject), no
// write reaches the product, and the line does not hold SECRET. The known positive (AGENTS.md 6a.2) in each test: the next press with a
// text that holds no secret is written, once, and the line says it is saved (or removed).
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-reconnect-refuses-secret.test.mjs (TST-868001 to TST-868005) opens this
// page in this harness, goes through the same place and presses Save collaborator; this file copies its pattern (the helpers are written
// again here: a test file imports no other test file). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const NEW_TOKEN = "github_pat_NEWER0123456789abcdefghijk";
const SECRET = "sk-collab-fixture-0123456789";
const BASE = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const OLDER_FORM = "# Collaborators of alice/thesis\n\n| Name | Account | Agreed on |\n|---|---|---|\n| Alice Example | @alice | 2026-10-01 |\n";
const OLDER_FORM_WITH_SECRET = `${OLDER_FORM}| ${SECRET} | @bob | 2026-10-02 |\n`;
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const stored = (token, name) => JSON.stringify({ value: token, name, expires: null, stored: "2026-10-18" });
const lineOf = (root, title) => controls(root, "settings-repository").find((node) => node.children[0]?.textContent === title);

// The live page on the product's pages, then Settings drawn, with SECRET stored as the key of the endpoint ep1, the instance's token and
// the product's own token; `collaborators`: the text of the product's docs/collaborators.md, or null for none. The page then connects its
// hosts again (Save on the line of the GitHub token). -> the product's server and the Settings page's nodes.
async function settingsOpen({ collaborators }) {
  let product = null;
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? product.fetch(`${API}/repos/${PRODUCT}/git/trees/${product.head}?recursive=1`, init) : undefined);
  const info = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}`
    ? new Response(JSON.stringify({ default_branch: "main", private: true, visibility: "private", archived: false, description: "", permissions: { push: true } }), { status: 200, headers: { "Content-Type": "application/json" } })
    : undefined);
  product = await repoServer({ repo: PRODUCT, files: { ...BASE, ...(collaborators === null ? {} : { "docs/collaborators.md": collaborators }) }, handlers: [info, tree] });
  const forward = (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined);
  const srv = await repoServer({ files: BASE, handlers: [forward] });
  const entries = {
    [`${PREFIX}products`]: JSON.stringify([PRODUCT_ADDRESS]),
    [`${PREFIX}endpoint:ep1`]: JSON.stringify({ kind: "openai-compatible", url: "https://models.example/v1", model: "model-a", key: SECRET }),
    [`${PREFIX}github-token`]: stored(TOKEN, "GitHub token"),
    [`${PREFIX}github-token:${PRODUCT}`]: stored(PRODUCT_TOKEN, "Agent M"),
  };
  const page = await openDashboard({ server: srv, search: `?repo=${encodeURIComponent(PRODUCT)}`, hash: "#uc", token: TOKEN, entries, caches: fakeCaches() });
  const dom = richDocument(), createElement = globalThis.document.createElement.bind(globalThis.document), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  globalThis.document.createElement = (name) => {
    const node = createElement(name);
    if (!("childNodes" in node)) Object.defineProperty(node, "childNodes", { get: () => node.children ?? [] });
    return node;
  };
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  globalThis.confirm = () => true;
  await page.go("#settings");
  const nodes = () => ({ children: mounted });
  const line = () => lineOf(nodes(), "GitHub token");
  await press(srv, controls(line(), "settings-repository-change")[0]);
  controls(line(), "settings-repository-ack")[0].checked = true;
  controls(line(), "settings-repository-ack")[0].fire("change", {});
  controls(line(), "settings-repository-secret")[0].value = NEW_TOKEN;
  await press(srv, controls(line(), "settings-repository-save")[0]);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token`))?.value, NEW_TOKEN, "Save stored the new token");
  assert.equal(controls(nodes(), "settings-collaborator-save").length, 1, "the page offers Save collaborator: the product is writable");
  return { srv, product, nodes };
}

// Press a control as a person; -> the error its handler rejects with, or null.
async function pressed(srv, nodes, control) {
  try { await controls(nodes(), control)[0].fire("click", { isTrusted: true }); await settle(srv); return null; } catch (error) { return error; }
}
const fill = (nodes, field, value) => { controls(nodes(), field)[0].value = value; };
const resultLine = (nodes) => controls(nodes(), "settings-collaborator-result")[0].textContent;
const filesWritten = (product) => product.writes.flatMap((write) => Object.entries(write.files));

async function save({ srv, nodes }, name) {
  fill(nodes, "settings-collaborator-name", name);
  fill(nodes, "settings-collaborator-account", "carol");
  controls(nodes(), "settings-collaborator-agreed")[0].checked = true;
  return pressed(srv, nodes, "settings-collaborator-save");
}

function assertShown(thrown, line, product) {
  assert.equal(thrown, null, `the press does not reject (it rejected with ${thrown?.name})`);
  assert.equal(/docs\/collaborators\.md holds a configured secret/.test(line), true, `the result line names the file and the refusal (it says: ${line})`);
  assert.equal(line.includes(SECRET), false, "the result line does not hold the secret");
  assert.deepEqual(product.writes.map((write) => write.message), [], "nothing was written to the product");
}

// TST-884001
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a GitHub product's pages after Save on the line of the GitHub token, the product holding no docs/collaborators.md, SECRET stored as an endpoint key
// input: save a collaborator named SECRET, then one named "Carol Example"
// expect: the first press resolves, the result line says docs/collaborators.md holds a configured secret and nothing was written, without SECRET, and the product has no write; the second is written once, with that name, and the line says it is saved
test("TST-884001 · Save collaborator on a new file shows a refusal that names the file", async () => {
  const page = await settingsOpen({ collaborators: null });
  const thrown = await save(page, SECRET);
  assertShown(thrown, resultLine(page.nodes), page.product);
  assert.equal(await save(page, "Carol Example"), null, "a name that holds no secret is saved");
  assert.equal(resultLine(page.nodes), "Saved in the product repository.");
  assert.equal(filesWritten(page.product).some(([path, text]) => path === "docs/collaborators.md" && text.includes("Carol Example")), true, "the write holds the name");
  assert.equal(filesWritten(page.product).some(([, text]) => text.includes(SECRET)), false, "no write holds the secret");
});

// TST-884002
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, the product holding docs/collaborators.md in the older table form (`| Name | Account | Agreed on |`)
// input: save a collaborator named SECRET, then one named "Carol Example"
// expect: as TST-884001, and the written file also holds the row of "Alice Example"
test("TST-884002 · Save collaborator on a file in the older form shows a refusal that names the file", async () => {
  const page = await settingsOpen({ collaborators: OLDER_FORM });
  const thrown = await save(page, SECRET);
  assertShown(thrown, resultLine(page.nodes), page.product);
  assert.equal(await save(page, "Carol Example"), null, "a name that holds no secret is saved");
  assert.equal(resultLine(page.nodes), "Saved in the product repository.");
  assert.equal(filesWritten(page.product).some(([path, text]) => path === "docs/collaborators.md" && text.includes("Carol Example") && text.includes("Alice Example")), true, "the write holds both names");
  assert.equal(filesWritten(page.product).some(([, text]) => text.includes(SECRET)), false, "no write holds the secret");
});

// TST-884003
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, the product holding docs/collaborators.md in the older form with the rows of "Alice Example" and of SECRET
// input: remove the consent of "Alice Example" (the text left holds SECRET), then remove the consent of SECRET (the text left holds none)
// expect: the first press resolves, the result line says docs/collaborators.md holds a configured secret and nothing was written, without SECRET, and the product has no write; the second is written once, and the line says the consent record is removed
test("TST-884003 · Remove collaborator consent shows a refusal that names the file", async () => {
  const page = await settingsOpen({ collaborators: OLDER_FORM_WITH_SECRET });
  fill(page.nodes, "settings-collaborator-remove-name", "Alice Example");
  fill(page.nodes, "settings-collaborator-remove-account", "alice");
  const thrown = await pressed(page.srv, page.nodes, "settings-collaborator-remove");
  assertShown(thrown, resultLine(page.nodes), page.product);
  fill(page.nodes, "settings-collaborator-remove-name", SECRET);
  fill(page.nodes, "settings-collaborator-remove-account", "bob");
  assert.equal(await pressed(page.srv, page.nodes, "settings-collaborator-remove"), null, "a removal that leaves no secret is saved");
  assert.equal(/^Removed this collaborator's consent record/.test(resultLine(page.nodes)), true, `the line says the record is removed (it says: ${resultLine(page.nodes)})`);
  assert.equal(page.product.writes.length, 1, "one write reached the product");
  assert.equal(filesWritten(page.product).some(([path, text]) => path === "docs/collaborators.md" && text.includes("Alice Example") && !text.includes(SECRET)), true, "the file keeps Alice and has no secret");
});
