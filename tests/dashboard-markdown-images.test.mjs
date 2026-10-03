// A product's artifact shows no image from a host the page does not name (ITM-157): the dashboard's Markdown (`md` of
// docs/assets/dashboard-app.mjs) lets an image through only from the product's repository server — GitHub's raw host, or the
// product's GitLab server — or as a `data:` address; any other image is not rendered, and its address is shown as text in its
// place. A Mermaid block of the same file is rendered as before.
// Run: node --test tests/
//
// Module: MOD-dashboard-app
// Guards: NO SERVER; ARTIFACTS ARE MARKDOWN; UC-008
// Level: component
//
// Two routes reach an image in a Markdown text: Markdown's own `![alt](address)`, and HTML written into the text (`<img>`, and
// the other elements and attributes a browser loads an address for on its own — srcset, poster, an SVG image, a style's url()).
// The first is checked end to end: the real dashboard in tests/app-harness.mjs renders a product's use case — a GitHub product
// and a GitLab one — and the HTML of <main> is read. The harness has no DOM, so DOMPurify does not run there (the harness passes
// the text through); the second route is DOMPurify's hook, which `md` adds for its call. It is checked twice: the hook itself on
// elements of the DOM's shape, and that `md` hands DOMPurify the hook for the product shown and takes it off again. No request
// leaves this process. The counter-proofs are recorded in docs/measurements/2026-10-03_markdown-images.md.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";
// Imported before any page is opened: outside a page (no `document`) the module starts nothing.
import * as dashboard from "../docs/assets/dashboard-app.mjs";

const ASSETS = new URL("../docs/assets/", import.meta.url);
const RAW = "https://raw.githubusercontent.com";
const FOREIGN = "https://images.other-host.example/tracker.png";
const DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const GL_ORIGIN = "https://gitlab.example.org", GL_PROJECT = "team/proj", GL_ADDRESS = `${GL_ORIGIN}/${GL_PROJECT}`;

// A use case with three images — on the product's repository server, as data, on a foreign host — and a Mermaid block.
const UC_PATH = "docs/use-cases/UC-001-show-the-pictures.md";
const useCase = (own) => `---
id: UC-001
title: Show the pictures
area: 1
actors:
  - Reader
realises:
  - RULE ONE
---
# UC-001 Show the pictures

## Main flow

1. The reader opens the page.

![the product's own picture](${own})

![an inline picture](${DATA})

![a picture elsewhere](${FOREIGN})

\`\`\`mermaid
flowchart LR
  R[Reader] --> P[Page]
\`\`\`
`;
const files = (own) => ({ "SPEC.md": "# SPEC\n\n**RULE ONE**\nA rule.\n", [UC_PATH]: useCase(own) });

const imgs = (html) => [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const srcOf = (tag) => /\ssrc="([^"]*)"/.exec(tag)?.[1] ?? null;
// The text of the HTML outside its tags: what a person reads.
const textOf = (html) => html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// ---------------------------------------------------------------- a GitLab project, read without a token

const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0`).update(t).digest("hex");
function gitlabServer(given) {
  const s = { files: { ...given }, head: "a".repeat(40), requests: [] };
  const base = `/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`;
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
  s.fetch = async (u, init = {}) => {
    const method = (init.method || "GET").toUpperCase();
    s.requests.push(`${method} ${u.href}`);
    if (method !== "GET" || !u.pathname.startsWith(base)) return json({ message: "404 Not Found" }, 404);
    const rest = u.pathname.slice(base.length);
    if (rest === "") return json({ path_with_namespace: GL_PROJECT, default_branch: "main", visibility: "public",
      permissions: { project_access: null, group_access: null } });
    if (rest.startsWith("/repository/commits/")) return json({ id: s.head });
    if (rest === "/repository/commits") return json([]);
    if (rest === "/repository/tree") {
      return json(u.searchParams.get("page") === "1" ? Object.keys(s.files).sort().map((p) => ({ type: "blob", path: p, id: blobSha(s.files[p]) })) : []);
    }
    const blob = /^\/repository\/blobs\/([0-9a-f]{40})\/raw$/.exec(rest);
    if (blob) {
      const p = Object.keys(s.files).find((x) => blobSha(s.files[x]) === blob[1]);
      return p ? new Response(s.files[p]) : json({ message: "404 Blob Not Found" }, 404);
    }
    const raw = /^\/repository\/files\/([^/]+)\/raw$/.exec(rest);
    if (raw) { const p = decodeURIComponent(raw[1]); return p in s.files ? new Response(s.files[p]) : json({ message: "404 File Not Found" }, 404); }
    return json({ message: "404 Not Found" }, 404);
  };
  return s;
}

// The use case, opened on the dashboard of `product` ("github": this instance; "gitlab": a GitLab project). -> <main>'s HTML
// and every request the page made, on any server.
async function openUseCase(product) {
  const own = product === "github" ? `${RAW}/${REPO}/main/docs/use-cases/picture.png` : `${GL_ADDRESS}/-/raw/main/docs/use-cases/picture.png`;
  const gitlab = product === "gitlab" ? gitlabServer(files(own)) : null;
  const server = await repoServer({ files: product === "github" ? files(own) : { "SPEC.md": "# SPEC\n" },
    handlers: [(u, init) => (gitlab && u.origin === GL_ORIGIN ? gitlab.fetch(u, init) : undefined)] });
  const search = gitlab ? `?product=${encodeURIComponent(GL_ADDRESS)}` : "";
  const page = await openDashboard({ server, search, hash: "#uc/UC-001" });
  const html = page.main();
  assert.match(html, /UC-001 Show the pictures/, "known positive: the use case is shown");
  return { own, html, requests: [...server.requests, ...(gitlab?.requests ?? [])] };
}

for (const product of ["github", "gitlab"]) {
  // UC-008 step 2 · NO SERVER — Expected: the image on the product's repository server and the data: image are rendered as img;
  // the image on a foreign host is not, and its address is shown as text in its place; the Mermaid block is handed to Mermaid
  // as before; no request goes to the foreign host.
  test(`a ${product} product's use case: its own and a data: image are shown, a foreign one only as its address`, async () => {
    const { own, html, requests } = await openUseCase(product);
    const sources = imgs(html).map(srcOf);
    assert.ok(sources.includes(own), `the image on the product's repository server is an img — got ${JSON.stringify(sources)}`);
    assert.ok(sources.includes(DATA), "the data: image is an img");
    assert.deepEqual(sources.filter((s) => s.includes("other-host")), [], "no img for the foreign host");
    assert.equal(sources.length, 2, "two images, no third");
    assert.ok(textOf(html).includes(FOREIGN), "the foreign image's address is shown as text");
    assert.match(html, /<code class="language-mermaid">flowchart LR/, "the Mermaid block, handed to Mermaid as before");
    assert.ok(requests.some((r) => r.includes(product === "github" ? "UC-001-show-the-pictures.md" : GL_ORIGIN)),
      "known positive: the page's requests are seen");
    assert.deepEqual(requests.filter((r) => r.includes("other-host")), [], "no request to the foreign host");
  });
}

// ---------------------------------------------------------------- HTML in the text: DOMPurify's hook

// An element as DOMPurify's hook meets it: its name, its attributes, its text; what the hook does to it is kept.
function el(name, attrs = {}, text = "") {
  const a = new Map(Object.entries(attrs));
  const n = { nodeType: 1, nodeName: name.toUpperCase(), textContent: text, replacedBy: null, removed: false,
    getAttribute: (k) => (a.has(k) ? a.get(k) : null), hasAttribute: (k) => a.has(k), removeAttribute: (k) => { a.delete(k); },
    replaceWith(x) { n.replacedBy = x; }, remove() { n.removed = true; },
    ownerDocument: { createTextNode: (t) => ({ nodeType: 3, nodeName: "#text", textContent: t }) },
    attrs: a };
  return n;
}

// NO SERVER — Expected: the hosts the page calls for a product are its repository server's — GitHub's raw host for a GitHub
// product, the GitLab server for a GitLab one; nothing else.
test("the image hosts of a product are its repository server's", async () => {
  const { imageOrigins } = dashboard;
  assert.equal(typeof imageOrigins, "function", "imageOrigins is exported");
  assert.deepEqual(imageOrigins({ address: `https://github.com/${REPO}`, host: "github.com", repo: REPO }), [RAW]);
  assert.deepEqual(imageOrigins({ address: GL_ADDRESS, host: "gitlab.example.org", repo: GL_PROJECT, server: GL_ORIGIN, kind: "gitlab" }),
    [GL_ORIGIN]);
});

// NO SERVER — Expected: an <img> written as HTML on a foreign host is replaced by its address as text; one on the product's
// repository server, or a data: one, is kept untouched.
test("DOMPurify's hook: an <img> in HTML loads from the product's repository server or data: only", async () => {
  const { resourceGuard } = dashboard;
  assert.equal(typeof resourceGuard, "function", "resourceGuard is exported");
  const guard = resourceGuard([RAW]);
  const own = el("img", { src: `${RAW}/${REPO}/main/a.png`, alt: "own" });
  const data = el("img", { src: DATA });
  const foreign = el("img", { src: FOREIGN, alt: "a tracker" });
  const relative = el("img", { src: "//images.other-host.example/b.png" });
  for (const n of [own, data, foreign, relative]) guard(n, { tagName: "img" });
  assert.equal(own.replacedBy, null, "the product's own image is kept");
  assert.equal(own.getAttribute("src"), `${RAW}/${REPO}/main/a.png`);
  assert.equal(data.replacedBy, null, "the data: image is kept");
  assert.equal(foreign.replacedBy?.nodeType, 3, "the foreign image is replaced by text");
  assert.ok(foreign.replacedBy.textContent.includes(FOREIGN), "the text is its address");
  assert.equal(relative.replacedBy?.nodeType, 3, "an address without its own scheme names another host too");
  assert.ok(relative.replacedBy.textContent.includes("//images.other-host.example/b.png"));
  const text = el("#text");
  text.nodeType = 3;
  guard(text, { tagName: "#text" });
  assert.equal(text.replacedBy, null, "text is left alone");
});

// NO SERVER — Expected: the other addresses a browser loads on its own while showing the text are dropped when foreign — srcset,
// poster, a <source>'s src, an SVG image's href, a style attribute's url(), a <style> that loads — and kept when they are the
// product's; a link (<a href>) is not loaded by showing it and is kept.
test("DOMPurify's hook: srcset, poster, source, an SVG image and a style's url() load from the product's repository server only", async () => {
  const { resourceGuard } = dashboard;
  const guard = resourceGuard([GL_ORIGIN]);
  const own = `${GL_ADDRESS}/-/raw/main/a.png`;
  const cases = [
    [el("img", { src: own, srcset: `${own} 1x, ${FOREIGN} 2x` }), "srcset", null],
    [el("img", { src: own, srcset: `${own} 1x, ${own} 2x` }), "srcset", `${own} 1x, ${own} 2x`],
    [el("video", { poster: FOREIGN }), "poster", null],
    [el("source", { src: FOREIGN }), "src", null],
    [el("source", { srcset: FOREIGN }), "srcset", null],
    [el("audio", { src: own }), "src", own],
    [el("image", { href: FOREIGN }), "href", null],
    [el("image", { "xlink:href": FOREIGN }), "xlink:href", null],
    [el("p", { style: `background: url(${FOREIGN})` }), "style", null],
    [el("p", { style: "color: red" }), "style", "color: red"],
    [el("td", { background: FOREIGN }), "background", null],
    [el("a", { href: FOREIGN }), "href", FOREIGN],
  ];
  for (const [n] of cases) guard(n, { tagName: n.nodeName.toLowerCase() });
  for (const [n, attr, want] of cases) {
    assert.equal(n.getAttribute(attr), want, `${n.nodeName.toLowerCase()} ${attr}`);
    assert.equal(n.replacedBy, null, `${n.nodeName.toLowerCase()} stays`);
  }
  const loads = el("style", {}, `p { background: url(${FOREIGN}) }`), plain = el("style", {}, "p { color: red }");
  guard(loads, { tagName: "style" });
  guard(plain, { tagName: "style" });
  assert.equal(loads.removed, true, "a <style> that loads an address is removed");
  assert.equal(plain.removed, false, "a <style> that loads nothing stays");
});

// NO SERVER — Expected: `md` hands DOMPurify the hook for the product shown — for the call only — so that the HTML route is
// guarded in a browser: during the sanitising a hook is set on uponSanitizeElement that drops the foreign image and keeps the
// product's own; afterwards none is left.
test("md sanitises with the hook of the product shown, and takes it off afterwards", async () => {
  const purify = (await import(new URL("vendor/purify.es.mjs", ASSETS))).default;
  const saved = { ...purify };
  const hooks = [], seen = [];
  Object.assign(purify, {
    isSupported: true,
    addHook: (at, f) => hooks.push([at, f]),
    removeHook: (at, f) => { const i = hooks.findIndex(([a, g]) => a === at && (!f || g === f)); if (i >= 0) return hooks.splice(i, 1)[0][1]; },
    removeHooks: (at) => { for (let i = hooks.length - 1; i >= 0; i--) if (hooks[i][0] === at) hooks.splice(i, 1); },
    sanitize: (html) => { seen.push(hooks.filter(([at]) => at === "uponSanitizeElement").map(([, f]) => f)); return String(html); },
  });
  try {
    const server = await repoServer({ files: files(`${RAW}/${REPO}/main/docs/use-cases/picture.png`) });
    const page = await openDashboard({ server, hash: "#uc/UC-001" });
    assert.match(page.main(), /UC-001 Show the pictures/, "known positive: the use case is shown");
    assert.ok(seen.length > 0, "known positive: md sanitised");
    for (const set of seen) {
      assert.equal(set.length, 1, "one hook while md sanitises");
      const own = el("img", { src: `${RAW}/${REPO}/main/a.png` }), foreign = el("img", { src: FOREIGN });
      set[0](own, { tagName: "img" });
      set[0](foreign, { tagName: "img" });
      assert.equal(own.replacedBy, null, "the hook keeps the product's own image");
      assert.equal(foreign.replacedBy?.nodeType, 3, "the hook drops the foreign image");
    }
    assert.deepEqual(hooks, [], "no hook is left once md is done");
  } finally {
    for (const k of Object.keys(purify)) if (!(k in saved)) delete purify[k];
    Object.assign(purify, saved);
  }
});
