// System coverage of UC-001 through the dashboard's real #add route.
// Module: MOD-settings-pages
// Guards: UC-001
// Level: system

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, REPO, TOKEN } from "./app-harness.mjs";

const API = "https://api.github.com";
const PRODUCT = "alice/thesis-tool";
const WEB = `https://github.com/${PRODUCT}`;
const PREFIX = `agent-m:${REPO}:`;
const PRODUCT_TOKEN = "github_pat_PRODUCT0010123456789abcdef";
const GL_ORIGIN = "https://gitlab.rrze.fau.de";
const GL_PROJECT = "fau-ai-taskforce/tools/thesis-tool";
const GL_WEB = `${GL_ORIGIN}/${GL_PROJECT}`;
const GL_TOKEN = "glpat_product_001";
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function gitlabProject({ accessLevel = 40 } = {}) {
  const files = { "README.md": "# Thesis tool\n" }, writes = [], requests = [];
  const base = `/api/v4/projects/${encodeURIComponent(GL_PROJECT)}`;
  const project = { files, writes, requests, async fetch(url, init = {}) {
    const method = (init.method ?? "GET").toUpperCase(), path = url.pathname.slice(base.length);
    const token = new Headers(init.headers ?? {}).get("private-token");
    requests.push({ method, url: url.href, token });
    if (!url.pathname.startsWith(base)) return json({ message: "Not found" }, 404);
    if (method === "GET" && !path) return json({ id: 7, path_with_namespace: GL_PROJECT, default_branch: "main", visibility: "private",
      permissions: { project_access: { access_level: accessLevel }, group_access: null } });
    if (method === "GET" && path === "/repository/branches/main") return json({ name: "main", commit: { id: "a".repeat(40) } });
    if (method === "GET" && path.startsWith("/repository/commits/")) return json({ id: "a".repeat(40) });
    if (method === "GET" && path === "/repository/tree") return json(Object.keys(files).map((file_path) => ({ type: "blob", path: file_path, id: "b".repeat(40) })));
    if (method === "POST" && path === "/repository/commits") {
      if (accessLevel < 40) return json({ message: "Forbidden" }, 403);
      const body = JSON.parse(init.body);
      for (const action of body.actions) files[action.file_path] = action.content;
      writes.push(body); return json({ id: "c".repeat(40), web_url: `${GL_WEB}/-/commit/${"c".repeat(40)}` });
    }
    return json({ message: "Not found" }, 404);
  }};
  return project;
}

async function world({ files = { "README.md": "# Thesis tool\n" }, writable = true, readable = true, missing = false, visibility = "public", gitlab = null } = {}) {
  const log = [];
  const product = await repoServer({ repo: PRODUCT, files, handlers: [
    (url, init) => {
      if (missing) return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      if (!readable) return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
      if (url.pathname === `/repos/${PRODUCT}`) return new Response(JSON.stringify({ private: visibility === "private", visibility,
        default_branch: "main", permissions: { push: writable } }), { headers: { "Content-Type": "application/json" } });
      if (!writable && (init.method ?? "GET") !== "GET") return new Response(JSON.stringify({ message: "Resource not accessible" }), { status: 403 });
      return undefined;
    },
  ] });
  const instance = await repoServer({ files: {}, handlers: [
    (url, init) => {
      const headers = new Headers(init.headers ?? {});
      log.push({ url: url.href, method: init.method ?? "GET", authorization: headers.get("Authorization") });
      if (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`)) return product.fetch(url.href, init);
      if (gitlab && url.origin === GL_ORIGIN) return gitlab.fetch(url, init);
      return undefined;
    },
  ] });
  return { instance, product, log };
}

async function addPage(w, entries = {}, token = TOKEN) {
  await openDashboard({ server: w.instance, hash: "#add", entries, token });
  const main = richDocument().byId("main");
  const address = main.querySelector("input.address");
  address.value = WEB;
  address.fire("input", { isTrusted: true });
  return main;
}

// TST-281
// Module: MOD-settings-pages
// Guards: UC-001; ONE CLICK PER DECISION; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; A GITHUB PRODUCT USES A TOKEN OF ITS OWN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: system
// given: the instance token and an existing public GitHub product repository
// input: paste its address, acknowledge and store its product token, then make the one trusted Add product click
// expect: the product is checked and receives the missing review layout with its own token; only canonical browser settings change
test("TST-281 UC-001 main flow stores a product token and adds the missing layout", async () => {
  const w = await world();
  const main = await addPage(w);
  const ack = main.querySelector("input.ack");
  const token = main.querySelector("input.token");
  const store = main.querySelector("button.store");
  ack.checked = true; ack.fire("change", { isTrusted: true });
  token.value = PRODUCT_TOKEN;
  await press(w.instance, store);
  const add = main.querySelector("button.add");
  await press(w.instance, add);
  await settle(w.instance);

  assert.ok(w.product.writes.length === 1, "Step C writes one layout commit");
  for (const path of ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"])
    assert.ok(w.product.files[path], `main flow writes layout part ${path}`);
  assert.equal(w.product.files["README.md"], "# Thesis tool\n", "main flow preserves existing product content");
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}products`)), [WEB], "only this browser keeps the address");
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`)).value, PRODUCT_TOKEN);
  assert.equal(globalThis.localStorage.getItem("agent-m.products"), null, "no legacy product list is written");
  assert.deepEqual(w.instance.writes, [], "nothing is written to the instance repository");
  const productCalls = w.log.filter((r) => r.url.includes(`/repos/${PRODUCT}`));
  assert.ok(productCalls.length > 0 && productCalls.every((r) => r.authorization === `Bearer ${PRODUCT_TOKEN}`), "the product token reaches only product API calls");
  assert.equal(globalThis.localStorage.getItem("agent-m.github-token"), TOKEN, "the instance token is unchanged");
});

// TST-282
// Module: MOD-settings-pages
// Guards: UC-001 5b; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; CONFIGURATION LIVES IN THE BROWSER
// Level: system
// given: a product with the complete review layout and its own stored token
// input: a synthetic Add product click, then a trusted person click
// expect: the synthetic event writes neither repository nor browser; the trusted event remembers the address and skips a commit
test("TST-282 UC-001 alternatives 1a and 5b distinguish a synthetic click from a person's click", async () => {
  const complete = { "SPEC.md": "# Product — Specification\n", "CHANGELOG.md": "# Changelog\n",
    "docs/use-cases/README.md": "x", "docs/architecture/README.md": "x", "docs/approvals/README.md": "x", "docs/spec-freigaben/README.md": "x" };
  const w = await world({ files: complete });
  const main = await addPage(w, { [`${PREFIX}github-token:${PRODUCT}`]: JSON.stringify({ value: PRODUCT_TOKEN, name: PRODUCT }) });
  const add = main.querySelector("button.add");
  add.fire("click", { isTrusted: false });
  await settle(w.instance);
  assert.equal(w.product.writes.length, 0, "a script cannot commit");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "a script cannot remember the product");
  await press(w.instance, add);
  assert.equal(w.product.writes.length, 0, "the complete layout is skipped");
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}products`)), [WEB], "the trusted click remembers the address");
});

// TST-284
// Module: MOD-settings-pages
// Guards: UC-001 2a, 3a, 3b, 4a and 5a; A PRODUCT IS NAMED BY ITS ADDRESS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: system
// given: product repositories that are missing, inaccessible, private with the instance key, keyless, or read-only
// input: use the actual Check or Add product control for each alternative
// expect: refusal and missing paths write no list or repository; a private existing product can use the proven instance key; a keyless page disables Add product
test("TST-284 UC-001 GitHub alternatives preserve the product and browser boundaries", async () => {
  const missing = await world({ missing: true });
  let main = await addPage(missing);
  await press(missing.instance, main.querySelector("button.check"));
  assert.match(main.innerHTML, /was not found.*Create it on the server's page for a new repository/i, "2a names the missing repository and gives its creation link");
  assert.match(main.innerHTML, /What is this\?/i, "2a retains the folded repository explanation");
  assert.equal(missing.product.writes.length, 0, "2a: a missing repository is not written");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "2a: a missing repository is not listed");

  const refusedRead = await world({ readable: false });
  main = await addPage(refusedRead);
  await press(refusedRead.instance, main.querySelector("button.check"));
  assert.equal(refusedRead.product.writes.length, 0, "4a: an unreadable repository is not written");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "4a: an unreadable repository is not listed");

  const privateProduct = await world({ visibility: "private" });
  main = await addPage(privateProduct);
  await press(privateProduct.instance, main.querySelector("button.check"));
  await press(privateProduct.instance, main.querySelector("button.add"));
  assert.equal(privateProduct.product.writes.length, 1, "3a: a proven instance key may add a private GitHub product");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}github-token:${PRODUCT}`), null, "3a: it does not invent a product token");

  const keyless = await world({ files: { ...{"SPEC.md": "x", "CHANGELOG.md": "x"}, "docs/use-cases/README.md": "x", "docs/architecture/README.md": "x", "docs/approvals/README.md": "x", "docs/spec-freigaben/README.md": "x" } });
  main = await addPage(keyless, {}, null);
  assert.equal(main.querySelector("button.add").disabled, true, "3b: a new browser must paste a product key before adding");

  const refusedWrite = await world({ writable: false });
  main = await addPage(refusedWrite);
  await press(refusedWrite.instance, main.querySelector("button.add"));
  assert.equal(refusedWrite.product.writes.length, 0, "5a: a refused write creates no commit");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}products`), null, "5a: a refused write creates no browser entry");
});

// TST-285
// Module: MOD-settings-pages
// Guards: UC-001 3c and 3d; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: system
// given: a GitLab product and its project token, or a project where the person is not Maintainer
// input: paste the project address and token on the actual dashboard route
// expect: the token reaches only that GitLab API and adds its layout; the page explains the Maintainer/project-token remedy
test("TST-285 UC-001 GitLab alternatives use the product project token", async () => {
  const project = gitlabProject();
  const w = await world({ gitlab: project });
  await openDashboard({ server: w.instance, hash: "#add" });
  let main = richDocument().byId("main");
  const address = main.querySelector("input.address");
  address.value = GL_WEB; address.fire("input", { isTrusted: true });
  const ack = main.querySelector("input.ack"), token = main.querySelector("input.token");
  ack.checked = true; ack.fire("change", { isTrusted: true }); token.value = GL_TOKEN;
  await press(w.instance, main.querySelector("button.store"));
  await press(w.instance, main.querySelector("button.add"));
  assert.equal(project.writes.length, 1, "3c: one project-token commit adds the missing layout");
  assert.ok(project.requests.every((request) => request.token === GL_TOKEN), "3c: the GitLab token stays with its product API");
  assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}products`)), [GL_WEB]);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}gitlab-token:gitlab.rrze.fau.de/${GL_PROJECT}`)).value, GL_TOKEN);

  const noMaintainer = await world({ gitlab: gitlabProject({ accessLevel: 30 }) });
  await openDashboard({ server: noMaintainer.instance, hash: "#add" });
  main = richDocument().byId("main");
  const laterAddress = main.querySelector("input.address");
  laterAddress.value = GL_WEB; laterAddress.fire("input", { isTrusted: true });
  assert.match(main.innerHTML, /not Maintainer.*personal access token would also work, but it is broader/i, "3d: the route names the project-token and Maintainer remedy");
});
