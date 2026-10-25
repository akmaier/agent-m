// The fixture of the UC-006 system and release tests of batched reads (ITM-479), no test of its own: a product of 1,332 files that the
// trace graph reads, on a fake GitHub that answers as GitHub's REST API and GraphQL API answer, and the SPEC-entry page of
// MOD-review-pages opened over MOD-repository-hosts' real GitHub host. The page is reached the way tests/system-uc-006-approve-spec-change.test.mjs
// reaches it: the `spec-entry` route's render, in the DOM of tests/review-pages-harness.mjs. Nothing reaches the network:
// `fetch` is replaced for the length of one page and every request is recorded. The instance throws when it is read, unless a test gives
// `openPage` a second fake for it. No expected result is computed here; each test states its own.
//
// Module: MOD-review-pages
// Level: system

import "./review-pages-harness.mjs";
import { createHash } from "node:crypto";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { storedGraphBytes } from "./stored-graph-fake.mjs";

const pages = await import("../src/review-pages/index.mjs");
const route = pages.view.routes.find((candidate) => candidate.name === "spec-entry");

export const TOKEN = "github_pat_ALICEbatchedREADS0123456789abcdef";
export const PRODUCT_ADDRESS = "https://github.com/alice/spec-product";
// Each fake's commit is its own: MOD-trace-graph's storedGraph keeps a commit's graph for the page (the module, for the length of a test file), so two
// fakes never share a commit.
let fakes = 0;
const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const blobSha = (t) => sha1(`blob ${Buffer.byteLength(t)}\0${t}`);
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const text = (...lines) => `${lines.join("\n")}\n`;

export const WRITE_RULE = "A WRITE RULE";
const SAMPLE = "A SAMPLE RULE";
const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
export const ENTRY_ID = "spec-2026-03-01_sample-07";

const WRITING = text("## 2. Writing", "", `**${WRITE_RULE}** *(Fixture PO)*`, "A writer writes a file whole.", "*Check:* no automatic check; at review");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const READING = text("## 1. Reading", "", `**${SAMPLE}** *(Fixture PO)*`, "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`", "");
const SPEC = text("# Fixture product - Specification", "") + READING + WRITING;

const useCase = (n, name, requirement) => text("---", `id: UC-00${n}`, `title: ${name}`, "area: files", "actors:", "  - Reader", "realises:",
  `  - ${requirement}`, "---", `# UC-00${n} ${name}`, "", `**Goal.** A reader meets ${requirement}.`);

// The product: SPEC.md, the use cases UC-001 (realising A SAMPLE RULE) and UC-002 (realising A WRITE RULE), a queue whose entry 07
// replaces "## 2. Writing", and backlog items up to `total` files that the trace graph reads (SPEC.md, two use cases, the rest items).
// The files the page reads itself outside the trace graph are the queue's three: its index, the proposal and the rationale of entry 07.
export function productFiles(total = 1332) {
  const held = {
    "SPEC.md": SPEC,
    "docs/use-cases/UC-001-read-a-file.md": useCase(1, "Read a file", SAMPLE),
    "docs/use-cases/UC-002-write-a-file.md": useCase(2, "Write a file", WRITE_RULE),
    [`${QUEUE}/index.md`]: text("# SPEC approvals - queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 07 | `SPEC.md` | ## 2. Writing | — | — |"),
    [`${QUEUE}/entscheidungen.md`]: text("# Decisions - queue 2026-03-01 sample", "", "Append-only."),
    [`${QUEUE}/07-entry-7.md`]: WRITING_NEW,
    [`${QUEUE}/07-entry-7.begruendung.md`]: text("# ## 2. Writing: fixture change", "", "**The change.** Changes a fixture requirement section.", "",
      "**Why.** The fixture reviewer needs a proposed wording beside the current section.", "", "**Impact list.**", "- fixture impact", "", "**Origin.** fixture source passage."),
  };
  for (let i = 0; i < total - 3; i++) {
    const id = `ITM-${String(i + 1).padStart(4, "0")}`;
    held[`docs/backlog/${id}-item.md`] = text("---", `id: ${id}`, `title: Item ${i}`, "level: system", "---", `# ${id} Item ${i}`);
  }
  return held;
}

// The product of `total` files with the links file docs/sources.md, which links the source SRC-alice (the register entry of the instance's author).
export const PERSON_SOURCE = "SRC-alice";
const registerEntry = (id, title, account) => text("---", `id: ${id}`, `title: ${title}`, "kind: person", `identifier: ${account}`, "authority: informational", "licence: may be republished - fixture",
  "---", `# ${id} ${title}`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
export function productWithLinks(total = 10) {
  return { ...productFiles(total), "docs/sources.md": text("# Requirement sources of the spec product", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
    `| ${PERSON_SOURCE} | 2026-10-13 | ${"0".repeat(64)} | |`) };
}
// The instance alice/agent-m: its register docs/sources/ holds the entry of its author github.com/alice (SRC-alice) and one of another person (SRC-bob), unless `withAuthor` is false.
export const REGISTER_PATHS = ["docs/sources/SRC-alice.md", "docs/sources/SRC-bob.md"];
export function instanceFiles({ withAuthor = true } = {}) {
  return { "README.md": text("# Agent M of the fixture"), ...(withAuthor ? { [REGISTER_PATHS[0]]: registerEntry(PERSON_SOURCE, "Alice", "github.com/alice") } : {}),
    [REGISTER_PATHS[1]]: registerEntry("SRC-bob", "Bob", "github.com/bob") };
}

// A fake GitHub holding `held` at a commit of its own (COMMIT), and on its branch trace-cache the graph the workflow "main changed" stores for COMMIT, `<COMMIT>.json.gz`
// (tests/stored-graph-fake.mjs), which a page reads and never builds (MOD-trace-graph); `storedGraph: false` holds none. special: { path: "truncated" | "binary" | "absent" } is how GraphQL answers that path;
// graphql(body, headers) may answer the /graphql request instead (a Response), or nothing to let the fake answer. Every request
// is recorded as { method, url, headers, body }.
export function fakeGitHub(held, { graphql = null, special = {}, repo = "alice/spec-product", storedGraph = true } = {}) {
  const requests = [];
  const COMMIT = sha1(`${repo} fake ${++fakes}`);
  let graphBytes = null;
  const stored = () => (graphBytes ??= storedGraphBytes({ commit: COMMIT, paths: Object.keys(held), read: async (path) => held[path] ?? null }));
  const graphFile = `${COMMIT}.json.gz`;
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const method = init.method ?? "GET";
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    requests.push({ method, url, headers, body });
    const prefix = `/repos/${repo}`;
    if (url.origin === "https://api.github.com" && url.pathname === "/graphql") {
      const own = graphql?.(body, headers);
      if (own) return own;
      const repository = {};
      for (const [, alias, expression] of body.query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
        const path = JSON.parse(expression).slice(41), held1 = held[path];
        if (held1 === undefined || special[path] === "absent") repository[alias] = null;
        else if (special[path] === "binary") repository[alias] = { text: null, isTruncated: false, isBinary: true, byteSize: 3 };
        else if (special[path] === "truncated") repository[alias] = { text: held1.slice(0, 5), isTruncated: true, isBinary: false, byteSize: 600000 };
        else repository[alias] = { text: held1, isTruncated: false, isBinary: false, byteSize: Buffer.byteLength(held1) };
      }
      return json({ data: { rateLimit: { cost: 1, remaining: 4999 }, repository } });
    }
    if (storedGraph && method === "GET" && ((url.origin === "https://api.github.com" && url.pathname === `/repos/${repo}/contents/${graphFile}` && url.searchParams.get("ref") === "trace-cache")
      || (url.origin === "https://raw.githubusercontent.com" && url.pathname === `/${repo}/trace-cache/${graphFile}`))) return new Response(await stored());
    if (url.origin === "https://raw.githubusercontent.com") {
      const body1 = held[decodeURIComponent(url.pathname.slice(`/${repo}/${COMMIT}/`.length))];
      return body1 === undefined ? json({ message: "Not Found" }, 404) : new Response(body1);
    }
    if (url.origin !== "https://api.github.com") return json({ message: "Not Found" }, 404);
    if (url.pathname === prefix) return json({ default_branch: "main", visibility: "public", private: false, permissions: { push: true }, archived: false, description: "" });
    if (url.pathname === `${prefix}/commits/main`) return json({ sha: COMMIT, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${COMMIT}`) return json({ tree: Object.entries(held).map(([path, body1]) => ({ path, type: "blob", sha: blobSha(body1) })) });
    if (url.pathname.startsWith(`${prefix}/contents/`)) {
      const body1 = held[decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length))];
      return body1 === undefined ? json({ message: "Not Found" }, 404) : new Response(body1);
    }
    return json({ message: "Not Found" }, 404);
  };
  const graphqlRequests = () => requests.filter((r) => r.url.pathname === "/graphql");
  // The files read one by one: through the API's contents with a token, from the raw host without one.
  const contentPaths = () => requests.filter((r) => r.url.pathname.includes("/contents/") || r.url.origin === "https://raw.githubusercontent.com")
    .map((r) => decodeURIComponent(r.url.pathname.includes("/contents/") ? r.url.pathname.split("/contents/")[1] : r.url.pathname.slice(`/${repo}/${COMMIT}/`.length)));
  return { fetch, requests, graphqlRequests, contentPaths,
    namedPerQuery: () => graphqlRequests().map((q) => [...q.body.query.matchAll(/:object\(expression:/g)].length) };
}

// Opens the SPEC-entry page of the product over the real GitHub host with `fake` as GitHub: the entries list with no params, one entry with { id }.
// `instance`: a second fake (fakeGitHub(..., { repo: INSTANCE_REPO })) that the instance's host reads, over the same real GitHub host; without it the instance
// throws when it is read. The requests of each repository go to its own fake, told apart by the repository in the path, the raw host's path or the GraphQL variables.
// -> the page's element after it rendered; lastContext() is the context it was drawn in.
let drawnIn = null;
export const lastContext = () => drawnIn;
export const INSTANCE_REPO = "alice/agent-m";
export const INSTANCE_ADDRESS = `https://github.com/${INSTANCE_REPO}`;
const routed = (product, instance) => async (input, init = {}) => {
  const url = new URL(String(input));
  const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
  const ofInstance = url.pathname.startsWith(`/repos/${INSTANCE_REPO}`) || url.pathname.startsWith(`/${INSTANCE_REPO}/`) || body?.variables?.name === INSTANCE_REPO.split("/")[1];
  return (ofInstance ? instance : product).fetch(input, init);
};
export async function openPage(fake, params = {}, { token = TOKEN, instance = null } = {}) {
  const real = globalThis.fetch;
  globalThis.fetch = instance ? routed(fake, instance) : fake.fetch;
  try {
    while (globalThis.localStorage.length) globalThis.localStorage.removeItem(globalThis.localStorage.key(0));
    const store = openStore("alice/agent-m");
    if (token) writeSetting(store, "github-token:alice/spec-product", { value: token, name: "Agent M - spec-product", expires: "2027-01-01" });
    const host = connect(parseAddress(PRODUCT_ADDRESS), token ? { token } : {});
    const refused = { async repositoryInfo() { throw new Error("the instance is not read to show an entry"); }, async readSnapshot() { throw new Error("the instance is not read to show an entry"); } };
    const instanceHost = instance ? connect(parseAddress(INSTANCE_ADDRESS), token ? { token } : {}) : refused;
    const target = document.createElement("div");
    document.body.append(target);
    drawnIn = { page: "review", instance: { repository: INSTANCE_REPO, host: instanceHost },
      product: { address: PRODUCT_ADDRESS, kind: "github", host }, store, go() {} };
    await route.render(target, drawnIn, params);
    return target;
  } finally {
    globalThis.fetch = real;
  }
}

export function find(root, match) {
  const found = [];
  (function walk(node) {
    for (const kid of node.childNodes) {
      if (kid.nodeType === 1) {
        if (match(kid)) found.push(kid);
        walk(kid);
      }
    }
  })(root);
  return found;
}
export const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
