// A pseudonymisation Save that the repository host refuses is shown on the Settings page, not thrown (ITM-896). The real app
// (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs on a product's pages (?repo=alice/thesis), against two GitHub fakes:
// the instance's, and a second repoServer for the product that the instance's server hands the product's requests to. This browser
// stores a model endpoint whose key is SECRET, the instance's GitHub token and the product's own token. The person opens Settings, goes
// through "Change, notice, paste and Save" on the line of the GitHub token (the page connects its hosts again with the stored secrets,
// ITM-868), and then, in the product's section, switches pseudonymisation off, ticks I have read this and presses Save pseudonymisation,
// so that the text of docs/settings.md would hold SECRET.
// Run: node --test tests/settings-pages-pseudonymisation-refusal.test.mjs
//
// Module: MOD-settings-pages
// Guards: NO SECRET IN THE REPOSITORY
// Level: component
//
// The expected results are written here from the Acceptance of ITM-896 as the pull request quotes it ("shows the refusal in its result
// line, naming the file and never the secret, as ITM-884's handlers do") and from NO SECRET IN THE REPOSITORY and the sentence of
// MOD-repository-hosts' `commitFiles` that a file whose text holds a configured secret refuses the whole commit with `SecretRefused` and
// writes nothing; none is read from a document when a test runs. Reading, named in the pull request: "its result line" is the line of
// the pseudonymisation (class settings-pseudonymisation-result), and the refusal is shown as the host's message, which names the file
// and says that it holds a configured secret (`docs/settings.md holds a configured secret — nothing was written.`). The text the page
// writes for a product without settings is fixed (`---\npseudonymisation: off\n---\n# Settings of this product\n`), so SECRET is the value
// `# Settings of this product`, a part of that text; it is the key of the endpoint. After the refusal the press resolves (it does not
// reject), no write reaches the product, the line does not hold SECRET, and the state line still says that pseudonymisation is on. The
// known positive (AGENTS.md 6a.2): with a stored key that is no part of the text, the same press writes the file once and the line says
// it is saved.
// The callers read first (AGENTS.md 6a.1): tests/settings-pages-collaborator-refusal.test.mjs (TST-884001 to TST-884003) opens this page
// in this harness, goes through the same place and presses the collaborators' Save; this file copies its pattern (the helpers are
// written again here: a test file imports no other test file). The counter-proof is recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PREFIX = "agent-m:akmaier/agent-m:";
const PRODUCT = "alice/thesis", PRODUCT_ADDRESS = `https://github.com/${PRODUCT}`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij";
const NEW_TOKEN = "github_pat_NEWER0123456789abcdefghijk";
const SECRET = "# Settings of this product";
const OTHER = "sk-not-part-of-the-settings-text-0123456789";
const FILES = {
  "docs/use-cases/UC-001-read-a-file.md": "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };
const stored = (token, name) => JSON.stringify({ value: token, name, expires: null, stored: "2026-10-18" });
const lineOf = (root, title) => controls(root, "settings-repository").find((node) => node.children[0]?.textContent === title);

// The live page on the product's pages, then Settings drawn, with `key` stored as the key of the endpoint ep1, the instance's token and the
// product's own token; the product holds no docs/settings.md. The page then connects its hosts again (Save on the line of the GitHub token).
// -> the instance's server, the product's server and the Settings page's nodes.
async function settingsOpen({ key }) {
  let product = null;
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? product.fetch(`${API}/repos/${PRODUCT}/git/trees/${product.head}?recursive=1`, init) : undefined);
  const info = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}`
    ? new Response(JSON.stringify({ default_branch: "main", private: true, visibility: "private", archived: false, description: "", permissions: { push: true } }), { status: 200, headers: { "Content-Type": "application/json" } })
    : undefined);
  product = await repoServer({ repo: PRODUCT, files: FILES, handlers: [info, tree] });
  const forward = (url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? product.fetch(url.href, init) : undefined);
  const srv = await repoServer({ files: FILES, handlers: [forward] });
  const entries = {
    [`${PREFIX}products`]: JSON.stringify([PRODUCT_ADDRESS]),
    [`${PREFIX}endpoint:ep1`]: JSON.stringify({ kind: "openai-compatible", url: "https://models.example/v1", model: "model-a", key }),
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
  assert.equal(controls(nodes(), "settings-pseudonymisation-save").length, 1, "the page offers Save pseudonymisation: the product is writable");
  return { srv, product, nodes };
}

// Switch pseudonymisation off, tick I have read this, press Save pseudonymisation. -> the error the press rejects with, or null.
async function switchOff({ srv, nodes }) {
  controls(nodes(), "settings-pseudonymisation-off")[0].checked = true;
  controls(nodes(), "settings-pseudonymisation-ack")[0].checked = true;
  try { await controls(nodes(), "settings-pseudonymisation-save")[0].fire("click", { isTrusted: true }); await settle(srv); return null; } catch (error) { return error; }
}
const textOf = (nodes, name) => controls(nodes(), name)[0].textContent;

// TST-896001
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the live page on a GitHub product's pages after Save on the line of the GitHub token, the product holding no docs/settings.md, SECRET stored as an endpoint key
// input: switch pseudonymisation off, tick I have read this, press Save pseudonymisation
// expect: the press resolves; the result line says docs/settings.md holds a configured secret and nothing was written, without SECRET; the state line still says pseudonymisation is on; the product has no write
test("TST-896001 · Save pseudonymisation shows a refusal that names the file", async () => {
  const page = await settingsOpen({ key: SECRET });
  const thrown = await switchOff(page);
  const line = textOf(page.nodes, "settings-pseudonymisation-result");
  assert.equal(thrown, null, `the press does not reject (it rejected with ${thrown?.name})`);
  assert.equal(/docs\/settings\.md holds a configured secret/.test(line), true, `the result line names the file and the refusal (it says: ${line})`);
  assert.equal(line.includes(SECRET), false, "the result line does not hold the secret");
  assert.equal(textOf(page.nodes, "settings-pseudonymisation-state"), "Pseudonymisation is on.", "the state is unchanged");
  assert.deepEqual(page.product.writes.map((write) => write.message), [], "nothing was written to the product");
});

// TST-896002
// level: component
// module: MOD-settings-pages
// guards: NO SECRET IN THE REPOSITORY
// given: the same page, with a stored endpoint key that is no part of the text of docs/settings.md
// input: switch pseudonymisation off, tick I have read this, press Save pseudonymisation
// expect: the press resolves; the result line says "Saved in the product repository."; the state line says pseudonymisation is off; one write reaches the product, with docs/settings.md (the known positive of TST-896001)
test("TST-896002 · Save pseudonymisation writes docs/settings.md when no stored secret is part of it", async () => {
  const page = await settingsOpen({ key: OTHER });
  assert.equal(await switchOff(page), null, "the press does not reject");
  assert.equal(textOf(page.nodes, "settings-pseudonymisation-result"), "Saved in the product repository.");
  assert.equal(textOf(page.nodes, "settings-pseudonymisation-state"), "Pseudonymisation is off.");
  assert.equal(page.product.writes.length, 1, "one write reached the product");
  assert.equal(Object.keys(page.product.writes[0].files).includes("docs/settings.md"), true, "the write holds docs/settings.md");
});
