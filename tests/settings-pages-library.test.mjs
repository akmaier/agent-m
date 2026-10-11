// The library and registering a source (ITM-350) — MOD-settings-pages' routes `library` and `library/<source>`, as docs/architecture/MOD-settings-pages.md and
// UC-004 state them: the register's sources with their versions; + Register source by route — an EU legal text with its identifier recognised, a standard with its
// designation and its licence preset to restricted, documents hashed in the browser or only hashed, a repository pinned to its current commit —; the common fields in a
// form from the entry's schema, a licence `unknown` counting as restricted; what becomes public stated before Save, which commits the plan's files, each in its repository,
// under the person's account; a named repository the token cannot reach named, with how to extend the token; a source already in the library named, with its entry
// linked; the explanations folded. The fetch of an EU legal text after saving, and a new version of a source (UC-016), are not part of this item.
// Run: node --test tests/settings-pages-library.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-004
// Guards: THE INSTANCE KEEPS THE SOURCE REGISTER; THE SOURCE MODEL IS GENERIC; THE SOURCE KIND IS ONE OF A CLOSED SET; A SOURCE DECLARES ITS AUTHORITY; A SOURCE DECLARES ITS LICENCE
// Guards: A STANDARD IS REGISTERED BY ITS DESIGNATION; A LIVING SOURCE IS PINNED; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// Guards: ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The document is the small DOM of tests/site-frame.test.mjs, imported unchanged. The instance is a host of this file: its snapshot holds the register's entries, and it records
// every commit. A named repository is GitHub's REST API answered by a fake of fetch, with MOD-repository-hosts' connect the real, accepted one, as
// tests/settings-pages-add-product.test.mjs does. The files of a source are constructed. Where the texts leave a reading open, the test states the reading it takes, and the pull
// request names it with its source:
//   - The routes preset the kind: an EU legal text `regulation`, a standard `standard`, documents `document`, a repository `system`; the closed set of kinds names no `repository`, and the
//     person may change the kind in the form.
//   - The first version's identifier is the day of registration for documents and a repository, and the designation for a standard; the person may edit the Versions section.
//   - An EU legal text is registered as its entry alone, with no version row: the fetch (UC-004 7) records the version, and registrationCommits needs a first row.
//   - The content goes to its repository before the entry goes to the instance, so that an entry never names content that was not stored; a refusal of the named repository
//     commits nothing in the instance.
//   - A source is already in the library when its identifier, its title or, for a standard, its designation equals an entry's, as a requirement's source item names an entry.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");
const { readDocument } = await import("../src/documents/index.mjs");
const { sourceSchemas } = await import("../src/source-register/index.mjs");

const route = () => view.routes.find((candidate) => candidate.name === "library");
const INSTANCE = "alice/agent-m";
const NAMED = "https://github.com/alice/restricted-content";
const TODAY = new Date().toISOString().slice(0, 10);

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const one = (root, name) => { const found = byClass(root, name); assert.equal(found.length, 1, `exactly one .${name}`); return found[0]; };
const settle = () => new Promise((resolve) => setTimeout(resolve, 15));
const fire = async (node, type) => { node.dispatchEvent(new Event(type)); await settle(); };
const click = (node) => fire(node, "click");
const put = async (node, value, type = "change") => { node.value = value; await fire(node, type); };
const folded = (root) => byClass(root, "explain");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytesOf = (text) => new TextEncoder().encode(text);
// The form from the entry's schema: its field of a key, its Save.
const fieldOf = (form, key) => descendants(form, (node) => node.getAttribute?.("data-key") === key)[0];
const inputOf = (form, key) => descendants(fieldOf(form, key), (node) => node.localName === "input")[0];
const typeInto = (form, key, value) => put(inputOf(form, key), value, "input");
const saveOf = (form) => descendants(form, (node) => node.localName === "button" && node.textContent === "Save")[0];
const fileOf = (name, text) => ({ name, size: bytesOf(text).length, arrayBuffer: async () => bytesOf(text).buffer.slice(0) });

const entryText = (fields, rows = "") => ["---", ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`), "---", `# ${fields.id} ${fields.title}`, "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", rows, ""].join("\n");
const SOURCES = {
  "docs/sources/SRC-eu-ai-act.md": entryText({ id: "SRC-eu-ai-act", title: "EU AI Act", kind: "regulation", authority: "normative", licence: "may be republished — EU law", identifier: "32024R1689" },
    `| \`2026-10-01\` | 2026-10-01 | Regulation (EU) 2024/1689 | the publication repository, retrieved 2026-10-01 | 1 file, listed below; version hash \`${"1".repeat(64)}\` |\n\n### Files of 2026-10-01\n\n| File | SHA-256 |\n|---|---|\n| \`act.html\` | \`${"a".repeat(64)}\` |`),
  "docs/sources/SRC-iec-62304.md": entryText({ id: "SRC-iec-62304", title: "IEC 62304", kind: "standard", authority: "normative", licence: "restricted — the publisher's terms", designation: "IEC 62304:2006+AMD1:2015" },
    `| \`IEC 62304:2006+AMD1:2015\` | 2026-10-02 | — | my printed copy | 1 file, listed below; version hash \`${"2".repeat(64)}\`; not stored: iec-62304.pdf |\n\n### Files of IEC 62304:2006+AMD1:2015\n\n| File | SHA-256 |\n|---|---|\n| \`iec-62304.pdf\` | \`${"b".repeat(64)}\` |`),
};

// The named repository, GitHub's REST API answered by a fake of fetch keyed by method and path; `mode` is "ok", or "missing" (404) or "forbidden" (403) for every request.
function githubFake(mode, order) {
  const prefix = "/repos/alice/restricted-content";
  const posts = [];
  const handler = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const answer = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    if (url.origin !== "https://api.github.com") throw new Error(`unscripted request: ${method} ${url}`);
    if (mode === "missing") return answer(404, { message: "Not Found" });
    if (mode === "forbidden") return answer(403, { message: "Resource not accessible by personal access token" });
    const path = url.pathname;
    if (method === "GET" && path === prefix) return answer(200, { default_branch: "main", visibility: "private", private: true, archived: false, description: "", permissions: { push: true } });
    if (method === "GET" && path === `${prefix}/commits/main`) return answer(200, { sha: "a".repeat(40), commit: { tree: { sha: "b".repeat(40) } } });
    if (method === "GET" && path === `${prefix}/git/trees/${"a".repeat(40)}`) return answer(200, { sha: "a".repeat(40), truncated: false, tree: [] });
    if (method === "GET" && path === `${prefix}/git/ref/heads/main`) return answer(200, { object: { sha: "a".repeat(40) } });
    if (method === "GET" && path === `${prefix}/git/commits/${"a".repeat(40)}`) return answer(200, { tree: { sha: "b".repeat(40) } });
    if (method === "POST" && path === `${prefix}/git/blobs`) { posts.push({ kind: "blob", body: JSON.parse(init.body) }); return answer(201, { sha: `${posts.length}`.padStart(40, "e") }); }
    if (method === "POST" && path === `${prefix}/git/trees`) { posts.push({ kind: "tree", body: JSON.parse(init.body) }); return answer(201, { sha: "c".repeat(40) }); }
    if (method === "POST" && path === `${prefix}/git/commits`) { order.push("named"); posts.push({ kind: "commit", body: JSON.parse(init.body) }); return answer(201, { sha: "d".repeat(40), html_url: `${NAMED}/commit/${"d".repeat(40)}` }); }
    if (method === "PATCH" && path === `${prefix}/git/refs/heads/main`) return answer(200, { object: { sha: "d".repeat(40) } });
    throw new Error(`unscripted request: ${method} ${path}`);
  };
  return { handler, posts };
}

// A browser: the store with the instance's token, the instance host with the register, the commits it records, and a named repository fake.
function browser(t, { sources = SOURCES, named = "ok" } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", { value: "github_pat_constructed", name: "Agent M", expires: "2027-01-01" });
  const commits = [], order = [];
  const host = {
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
    readSnapshot: async () => ({ commit: "h".repeat(40), paths: [...Object.keys(sources), "docs/sources/SRC-eu-ai-act/2026-10-01/act.html", "docs/sources.md"],
      blob: () => "b".repeat(40), read: async (path) => sources[path] ?? null }),
    commitFiles: async (change) => { order.push("instance"); commits.push(change); return { commit: "i".repeat(40), url: `https://github.com/${INSTANCE}/commit/${"i".repeat(40)}` }; },
    webLinks: () => ({}),
  };
  const fake = githubFake(named, order);
  const priorFetch = globalThis.fetch;
  globalThis.fetch = fake.handler;
  t.after(() => { globalThis.fetch = priorFetch; });
  const went = [];
  const context = { instance: { repository: INSTANCE, host }, product: null, store, go(name, params) { went.push([name, params]); } };
  return { store, commits, order, posts: fake.posts, requests: () => fake.posts.length, context, went,
    async page(params = {}) { const target = document.createElement("div"); document.body.append(target); await route().render(target, context, params); await settle(); return target; } };
}
const instanceFiles = (b) => b.commits.flatMap((commit) => commit.files);
const entryOfCommit = (b, id) => readDocument(sourceSchemas().entry, `docs/sources/${id}.md`, instanceFiles(b).find((file) => file.path === `docs/sources/${id}.md`).text);

// Opens + Register source, chooses a route.
async function register(page, routeName) {
  await click(one(page, "library-register"));
  await put(one(page, "library-route"), routeName);
  return one(page, "library-form-box");
}

// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004 1
// given: an instance whose register holds two sources, one with a version of one file, one whose copy was only hashed
// input: the route `library`
// expect: each source listed by its name with its kind and its versions, the names in the order of the register; the register's files under a source's own folder are not sources; nothing is
//         requested of the instance but its register and nothing is committed
test("library — the register's sources are listed with their versions, and nothing is written", async (t) => {
  const b = browser(t);
  const page = await b.page();
  const names = byClass(page, "library-source-name").map((node) => node.textContent);
  assert.deepEqual(names, ["EU AI Act", "IEC 62304"]);
  const lines = byClass(page, "library-source");
  assert.equal(lines.length, 2);
  assert.match(lines[0].textContent, /regulation/);
  assert.match(lines[0].textContent, /2026-10-01/);
  assert.match(lines[1].textContent, /standard/);
  assert.deepEqual(b.commits, []);
});

// guards: ONE CLICK PER DECISION; A SOURCE DECLARES ITS AUTHORITY; THE SOURCE KIND IS ONE OF A CLOSED SET; UC-004 2, 3
// given: + Register source, and each route chosen in turn
// input: the route field
// expect: for each route its own part and the others hidden; the form from the entry's schema with the kind preset — regulation, standard, document, system —, the standard's licence
//         preset to restricted and the others' empty, and Save disabled while the form holds an error; a sentence and an example for each route, and the folded explanation of the kinds
test("library — + Register source offers the four routes, each with its form from the entry's schema", async (t) => {
  const b = browser(t);
  const page = await b.page();
  assert.equal(one(page, "library-register-panel").hidden, true, "known positive: the panel opens on the person's click");
  await click(one(page, "library-register"));
  assert.equal(one(page, "library-register-panel").hidden, false);
  assert.match(one(page, "library-route-help").textContent, /EUR-Lex|ELI/);
  assert.ok(folded(one(page, "library-register-panel")).some((node) => /EU legal text/.test(node.textContent)), "the kinds are explained, folded");
  for (const [name, part, kind, licence] of [["legal-text", "library-route-legal-text", "regulation", undefined], ["standard", "library-route-standard", "standard", "restricted"],
    ["documents", "library-route-documents", "document", undefined], ["repository", "library-route-repository", "system", undefined]]) {
    const form = await register(page, name);
    for (const other of ["library-route-legal-text", "library-route-standard", "library-route-documents", "library-route-repository"]) {
      assert.equal(one(page, other).hidden, other !== part, `${other} for ${name}`);
    }
    assert.equal(inputOf(form, "kind").value, kind, `${name}: kind`);
    assert.equal(inputOf(form, "licence").value, licence ?? "", `${name}: licence`);
    for (const key of ["id", "title", "authority", "licence"]) assert.ok(fieldOf(form, key), `${name}: ${key}`);
    assert.equal(saveOf(form).disabled, true, `${name}: Save while the form holds an error`);
  }
});

// guards: A STANDARD IS REGISTERED BY ITS DESIGNATION; UC-004 4
// given: the standard route; the EU legal text route with an EUR-Lex address and with an address that names no text; the repository route
// input: the designation entered; the address pasted; the repository address pasted, a stored token reading its current commit
// expect: the designation in the form's field, its explanation folded; the CELEX number recognised from the address — 32024R1689 for the AI Act — and shown, in the form's identifier;
//         an address naming no text says so; the repository pinned to the commit its default branch stands at, shown and its address in the form's identifier
test("library — the route-specific part: a designation, a recognised identifier, a pinned commit", async (t) => {
  const b = browser(t);
  const page = await b.page();
  let form = await register(page, "standard");
  await put(one(page, "library-standard-designation"), "IEC 62304:2006+AMD1:2015");
  form = one(page, "library-form-box");
  assert.equal(inputOf(form, "designation").value, "IEC 62304:2006+AMD1:2015");
  assert.ok(folded(one(page, "library-route-standard")).some((node) => /cover page/.test(node.textContent)));

  await register(page, "legal-text");
  await put(one(page, "library-legal-address"), "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689");
  assert.match(one(page, "library-legal-identifier").textContent, /32024R1689/);
  assert.equal(inputOf(one(page, "library-form-box"), "identifier").value, "32024R1689");
  await put(one(page, "library-legal-address"), "https://example.org/nothing");
  assert.match(one(page, "library-legal-identifier").textContent, /not recogni[sz]ed|no EU legal text/i);

  writeSetting(b.store, "github-token:alice/restricted-content", { value: "github_pat_named", name: "named", expires: "2027-01-01" });
  await register(page, "repository");
  await put(one(page, "library-repository-address"), NAMED);
  assert.match(one(page, "library-repository-commit").textContent, new RegExp("a".repeat(40)));
  assert.equal(inputOf(one(page, "library-form-box"), "identifier").value, NAMED);
});

// Fills the common fields of the form as a person does, after the route's own part.
async function describe(page, fields) {
  const form = one(page, "library-form-box");
  for (const [key, value] of Object.entries(fields)) await typeInto(form, key, value);
  return form;
}
const SELECTED = [fileOf("a.md", "# A\n"), fileOf("b.md", "# B\n")];
async function chooseFiles(page, files) { const input = one(page, "library-files"); input.files = files; await fire(input, "change"); }

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; UC-004 4, 5, 6
// given: the documents route, two files selected, a licence that may be republished
// input: the form filled in, Save once
// expect: before Save nothing committed, the files hashed in the browser and shown with their SHA-256, and a statement that the entry and the files become public; one click commits to the
//         instance the entry `docs/sources/SRC-handbook.md` with its first version, the day of registration, and each file under docs/sources/SRC-handbook/<version>/, bytes as selected; no
//         other repository is asked
test("library — documents that may be republished are committed to the instance with their entry, by one click", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "documents");
  await chooseFiles(page, SELECTED);
  const hashes = byClass(page, "library-file-hash").map((node) => node.textContent);
  assert.deepEqual(hashes.map((text) => text.match(/[0-9a-f]{64}/)?.[0]), [sha(bytesOf("# A\n")), sha(bytesOf("# B\n"))]);
  const form = await describe(page, { id: "SRC-handbook", title: "Handbook", authority: "advisory", licence: "may be republished — CC BY 4.0" });
  assert.match(one(page, "library-public").textContent, /register entry/i);
  assert.match(one(page, "library-public").textContent, /a\.md/);
  assert.match(one(page, "library-public").textContent, /public/i);
  assert.deepEqual(b.commits, []);
  assert.equal(saveOf(form).disabled, false);
  await click(saveOf(form));
  assert.equal(b.commits.length, 1, "one commit, one click");
  assert.deepEqual(instanceFiles(b).map((file) => file.path).sort(), ["docs/sources/SRC-handbook.md", `docs/sources/SRC-handbook/${TODAY}/a.md`, `docs/sources/SRC-handbook/${TODAY}/b.md`]);
  assert.equal(new TextDecoder().decode(instanceFiles(b).find((file) => file.path.endsWith("/a.md")).bytes), "# A\n");
  const entry = entryOfCommit(b, "SRC-handbook");
  assert.equal(entry.fields.kind, "document");
  const row = entry.sections.find((section) => section.heading === "## Versions").rows[0].cells;
  assert.match(row.Version, new RegExp(TODAY));
  assert.match(row.Files, /2 files/);
  assert.ok(instanceFiles(b).find((file) => file.path.endsWith("SRC-handbook.md")).text.includes(sha(bytesOf("# A\n"))));
  assert.deepEqual(b.posts, [], "no other repository is asked");
  assert.match(one(page, "library-result").textContent, /SRC-handbook/);
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; A SOURCE DECLARES ITS LICENCE; UC-004 3, 4b, 6
// given: the documents route, two files, a licence `restricted`; and the same with `unknown`; the named repository without and with its address
// input: the form filled in; Save
// expect: without a named repository an error beside the form and Save disabled, for `unknown` as for `restricted`; with it the statement names that repository; Save commits the files only to it,
//         at docs/sources/SRC-paid/<version>/, then the entry, which holds no file, to the instance, with `content_repository` the named address
test("library — restricted content goes only to the repository the person names, a licence unknown counting as restricted", async (t) => {
  for (const licence of ["restricted — the publisher's terms", "unknown"]) {
    const b = browser(t);
    const page = await b.page();
    await register(page, "documents");
    await chooseFiles(page, SELECTED);
    let form = await describe(page, { id: "SRC-paid", title: "Paid norm", authority: "normative", licence });
    assert.equal(saveOf(form).disabled, true, `${licence}: no repository named`);
    assert.match(form.textContent, /repository/i);
    await put(one(page, "library-content-repository"), NAMED);
    form = one(page, "library-form-box");
    assert.match(one(page, "library-public").textContent, /alice\/restricted-content/);
    assert.equal(inputOf(form, "content_repository").value, NAMED);
    assert.equal(saveOf(form).disabled, false);
    assert.deepEqual([b.commits.length, b.posts.length], [0, 0]);
    await click(saveOf(form));
    assert.deepEqual(b.order, ["named", "instance"], `${licence}: the content first, then the entry`);
    assert.deepEqual(instanceFiles(b).map((file) => file.path), ["docs/sources/SRC-paid.md"], "the public instance holds the entry only");
    assert.equal(entryOfCommit(b, "SRC-paid").fields.content_repository, NAMED);
    const tree = b.posts.find((post) => post.kind === "tree").body.tree.map((item) => item.path).sort();
    assert.deepEqual(tree, [`docs/sources/SRC-paid/${TODAY}/a.md`, `docs/sources/SRC-paid/${TODAY}/b.md`]);
  }
});

// guards: A STANDARD IS REGISTERED BY ITS DESIGNATION; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-004 4a
// given: the standard route, a printed copy's file selected and only hashed; a licence preset restricted; the file explained
// input: Save
// expect: the file's SHA-256 shown and the statement that nothing of it is stored; one commit holding the entry alone — no file anywhere — whose version records the file with its hash and
//         the note `not stored:`; no named repository is asked
test("library — a file that is only hashed is stored nowhere, and the note records it", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "standard");
  await put(one(page, "library-standard-designation"), "ISO 26262:2018");
  await chooseFiles(page, [fileOf("iso-26262.pdf", "the publisher's bytes")]);
  assert.ok(folded(one(page, "library-route-standard")).some((node) => /SHA-256/.test(node.textContent)), "the hash-only choice is explained, folded");
  await click(one(page, "library-file-only-hashed"));
  const form = await describe(page, { id: "SRC-iso-26262", title: "ISO 26262", authority: "normative" });
  assert.equal(inputOf(form, "licence").value, "restricted");
  assert.match(one(page, "library-public").textContent, /nothing of it is stored|stored nowhere/i);
  await click(saveOf(form));
  assert.deepEqual(instanceFiles(b).map((file) => file.path), ["docs/sources/SRC-iso-26262.md"]);
  const written = instanceFiles(b)[0].text;
  assert.match(written, /not stored: iso-26262\.pdf/);
  assert.ok(written.includes(sha(bytesOf("the publisher's bytes"))));
  assert.equal(entryOfCommit(b, "SRC-iso-26262").fields.designation, "ISO 26262:2018");
  assert.deepEqual(b.posts, []);
});

// guards: RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-004 4c
// given: restricted files and a named repository that the token cannot reach (forbidden), and one that is not found
// input: Save
// expect: the repository named in the message, that the token cannot reach it, and the server's page to extend the token as a link; nothing is committed to the instance, so the
//         entry never names content that was not stored; the form stays as it was
test("library — a named repository the token cannot reach is named, with how to extend the token, and nothing is committed", async (t) => {
  for (const named of ["forbidden", "missing"]) {
    const b = browser(t, { named });
    const page = await b.page();
    await register(page, "documents");
    await chooseFiles(page, SELECTED);
    await describe(page, { id: "SRC-paid", title: "Paid norm", authority: "normative", licence: "restricted — terms", content_repository: NAMED });
    await click(saveOf(one(page, "library-form-box")));
    const result = one(page, "library-result");
    assert.match(result.textContent, /alice\/restricted-content/, named);
    assert.match(result.textContent, /token/i);
    const link = descendants(result, (node) => node.localName === "a")[0];
    assert.ok(link && /^https:\/\/github\.com\//.test(link.getAttribute("href")), "the server's page to extend the token");
    assert.deepEqual(b.commits, [], "the entry is not committed");
    assert.ok(saveOf(one(page, "library-form-box")), "the form stays");
  }
});

// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004 1a
// given: a register that holds EU AI Act (SRC-eu-ai-act) and IEC 62304 with its designation; a registration of the same title, of the same identifier, and of the standard's designation
// input: the form filled in
// expect: each named as already in the library with its identifier, Save disabled, and a button that leads to its entry; a name that no entry has is not
test("library — a source already in the library is named, with its entry linked", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "documents");
  await chooseFiles(page, SELECTED);
  let form = await describe(page, { id: "SRC-new", title: "Some other source", authority: "advisory", licence: "may be republished — CC BY 4.0" });
  assert.equal(saveOf(form).disabled, false, "known positive: a new name");
  assert.equal(byClass(page, "library-already").length, 0);
  form = await describe(page, { title: "EU AI Act" });
  assert.match(form.textContent, /already in the library/i);
  assert.match(form.textContent, /SRC-eu-ai-act/);
  assert.equal(saveOf(form).disabled, true);
  await click(one(page, "library-already"));
  assert.deepEqual(b.went.at(-1), ["library", { source: "SRC-eu-ai-act" }]);
  form = await describe(page, { title: "Another", id: "SRC-iec-62304" });
  assert.match(form.textContent, /SRC-iec-62304/);
  await register(page, "standard");
  await put(one(page, "library-standard-designation"), "IEC 62304:2006+AMD1:2015");
  form = await describe(page, { id: "SRC-iec", title: "A norm", authority: "normative" });
  assert.match(form.textContent, /already in the library/i);
  assert.equal(saveOf(form).disabled, true);
  assert.deepEqual(b.commits, []);
});

// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH; UC-004 1
// given: a register with a source whose one file is stored and one whose copy was only hashed
// input: the source's name clicked in the list; the entry's route
// expect: the click goes to library with the source; the entry shows its fields, its versions with their files, the stored file as stored and the file only hashed as not stored
test("library — a registered source's name leads to its entry, which shows each file as stored or not", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await click(byClass(page, "library-source-name")[1]);
  assert.deepEqual(b.went.at(-1), ["library", { source: "SRC-iec-62304" }]);
  const stored = await b.page({ source: "SRC-eu-ai-act" });
  assert.match(one(stored, "library-entry").textContent, /EU AI Act/);
  assert.match(one(stored, "library-entry").textContent, /act\.html.*\bstored\b/s);
  assert.doesNotMatch(one(stored, "library-entry").textContent, /not stored/);
  const hashed = await b.page({ source: "SRC-iec-62304" });
  assert.match(one(hashed, "library-entry").textContent, /IEC 62304:2006\+AMD1:2015/);
  assert.match(one(hashed, "library-entry").textContent, /iec-62304\.pdf.*not stored/s);
  await click(one(hashed, "library-back"));
  assert.deepEqual(b.went.at(-1), ["library", {}]);
});

// guards: A LIVING SOURCE IS PINNED; THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004 4, 6; 7
// given: the EU legal text route with the AI Act's address; the repository route with a repository pinned to its commit
// input: Save for each
// expect: the legal text as its entry alone, its identifier the CELEX number and no version row — the fetch is not part of this —; the repository's entry with a version naming the address and the
//         commit it was pinned to, no file stored
test("library — an EU legal text is registered as its entry alone, a repository as its pinned commit", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "legal-text");
  await put(one(page, "library-legal-address"), "https://eur-lex.europa.eu/eli/reg/2024/1689/oj");
  await describe(page, { id: "SRC-ai-act-2", title: "AI Act, again", authority: "normative", licence: "may be republished — EU law" });
  assert.equal(inputOf(one(page, "library-form-box"), "identifier").value.length > 0, true);
  await click(saveOf(one(page, "library-form-box")));
  assert.deepEqual(instanceFiles(b).map((file) => file.path), ["docs/sources/SRC-ai-act-2.md"]);
  const entry = entryOfCommit(b, "SRC-ai-act-2");
  assert.equal(entry.sections.find((section) => section.heading === "## Versions").rows?.length ?? 0, 0);

  const c = browser(t);
  writeSetting(c.store, "github-token:alice/restricted-content", { value: "github_pat_named", name: "named", expires: "2027-01-01" });
  const second = await c.page();
  await register(second, "repository");
  await put(one(second, "library-repository-address"), NAMED);
  await describe(second, { id: "SRC-guidelines", title: "Guidelines", authority: "advisory", licence: "may be republished — MIT" });
  await click(saveOf(one(second, "library-form-box")));
  assert.deepEqual(instanceFiles(c).map((file) => file.path), ["docs/sources/SRC-guidelines.md"]);
  const written = instanceFiles(c)[0].text;
  assert.ok(written.includes(NAMED) && written.includes("a".repeat(40)), "the address and the commit are the version's");
  assert.equal(entryOfCommit(c, "SRC-guidelines").fields.kind, "system");
});

// guards: ONE CLICK PER DECISION; RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE; UC-004 5
// given: the documents route, a licence that may be republished, then restricted with a named repository, then only hashed
// input: the licence and the choices changed
// expect: the statement before Save follows: the entry always public; the files public in the instance; the files only in the named repository; nothing stored for a file only hashed
test("library — what becomes public is stated before Save and follows the licence and the choices", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "documents");
  await chooseFiles(page, [fileOf("a.md", "# A\n")]);
  const form = await describe(page, { id: "SRC-x", title: "X", authority: "advisory", licence: "may be republished — CC BY 4.0" });
  const statement = () => one(page, "library-public").textContent;
  assert.match(statement(), /register entry.*public/i);
  assert.match(statement(), /a\.md.*public.*instance|instance.*a\.md/is);
  await typeInto(form, "licence", "restricted — terms");
  assert.doesNotMatch(statement(), /a\.md.*public.*instance/is);
  await put(one(page, "library-content-repository"), NAMED);
  assert.match(statement(), /alice\/restricted-content/);
  await click(one(page, "library-file-only-hashed"));
  assert.match(statement(), /nothing of (it|a\.md) is stored|stored nowhere/i);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-004 3
// given: the routes' parts and the form
// input: the page
// expect: the folded explanations of the kinds, the name, the authority, the licence, the standard's designation, the file only hashed and what becomes public, each a closed details
test("library — each step's explanation is folded", async (t) => {
  const b = browser(t);
  const page = await b.page();
  await register(page, "standard");
  await chooseFiles(page, [fileOf("n.pdf", "x")]);
  const all = folded(page);
  for (const [name, snippet] of [["the kinds", /EU legal text/], ["the name", /recognise in a list/], ["the authority", /Normative/], ["the licence", /treated as\s+restricted/], ["the designation", /cover page/],
    ["a file only hashed", /SHA-256/], ["what becomes public", /becomes public/]]) {
    const found = all.find((node) => snippet.test(node.textContent));
    assert.ok(found, `the explanation of ${name}`);
    assert.equal(found.hasAttribute("open"), false, `${name}: folded`);
  }
});
