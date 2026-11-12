// The live review page (docs/index.html, which loads src/site-frame/dashboard-app.mjs) draws MOD-maintenance-pages' routes `issues` and `issue/<number>` for the product the address names, as the
// module's accepted Interfaces name them ("`issues`, `issue/<number>` — the product's issues; *Analyse* with its run panel …") and as its Responsibility says it runs: "in a browser, loaded by
// `docs/index.html` through MOD-site-frame"; and a person's click on an issue of the list leads to that issue with the product kept, as MOD-site-frame's ViewContext states `go`: it "writes the chosen
// product into the address unless `params` names a `product`; the empty `product` names the instance itself, and the address then holds none". UC-012 step 2.
// Run: node --test tests/dashboard-issue-routes.test.mjs
//
// Module: MOD-site-frame
// Guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// Level: component
//
// The page is the real app over tests/app-harness.mjs: the instance akmaier/agent-m and the product alice/product, kept in this browser, each on a fake GitHub of its own; the product's fake answers
// "List repository issues" and "Get an issue". The instance's register lists the agent local-llm, whose model this browser's endpoint ep1 offers, so that Analyse offers a participant.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, setting } from "./app-harness.mjs";

const PRODUCT = "alice/product";
const PRODUCT_URL = `https://github.com/${PRODUCT}`;
const ENCODED = encodeURIComponent(PRODUCT_URL);
const REGISTER = "# Participants of this instance\n\n**REGISTER**\n\nThe participants of the test instance.\n\n| Name | Type | Model |\n|---|---|---|\n| local-llm | agent | model-a |\n";
const SPEC = "# Product\n\n## 1. Section\n\n**FIRST RULE** *(Product Owner)*\nThe first rule holds.\n*Check:* `tests/unit.test.mjs`\n";
const issueJson = (number, title, labels) => ({ number, title, body: `Text of issue ${number}.`, state: "open", labels: labels.map((name) => ({ name })), comments: 0,
  html_url: `${PRODUCT_URL}/issues/${number}` });
const ISSUES = [issueJson(5, "Export is cut off", []), issueJson(7, "Pages are missing", ["change"])];
const ENDPOINT = { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "model-a", key: "k1", place: "this machine", context: 200000 };

// The product's issues as GitHub answers them; every other request is the repository server's.
const issuesOf = (url, init) => {
  if (init.method !== "GET" || url.origin !== "https://api.github.com") return null;
  const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  if (url.pathname === `/repos/${PRODUCT}/issues`) return json(ISSUES);
  const one = new RegExp(`^/repos/${PRODUCT}/issues/(\\d+)$`).exec(url.pathname);
  if (one) {
    const issue = ISSUES.find((each) => each.number === Number(one[1]));
    return issue ? json(issue) : new Response('{"message":"Not Found"}', { status: 404 });
  }
  return null;
};

// The page opened at `hash`, the instance and the product each answered by its own server.
async function opened(hash) {
  const instance = await repoServer({ files: { "SPEC.md": "# SPEC\n", "docs/participants.md": REGISTER } });
  const product = await repoServer({ files: { "SPEC.md": SPEC }, repo: PRODUCT, head: "b0ffee".padEnd(40, "0"), handlers: [issuesOf] });
  const isProduct = (url, init) => (url.pathname === "/graphql"
    ? `${JSON.parse(init.body).variables?.owner}/${JSON.parse(init.body).variables?.name}` === PRODUCT
    : url.pathname.includes(`/${PRODUCT}/`) || url.pathname.endsWith(`/${PRODUCT}`));
  const both = {
    get requests() { return [...instance.requests, ...product.requests]; },
    get pending() { return instance.pending + product.pending; },
    fetch: (u, init = {}) => (isProduct(new URL(String(u)), init) ? product : instance).fetch(u, init),
  };
  const page = await openDashboard({ server: both, hash, entries: { ...setting("products", [PRODUCT_URL]), ...setting("endpoint:ep1", ENDPOINT) } });
  return { page, product };
}

// TST-20261111101 · level: component · module: MOD-site-frame
// guards: UC-012
// given: known positive first — the same page draws #use-case/product=<the product> as the use cases; the product alice/product kept in this browser, with the open issues 5 and 7 (7 labelled change)
// input: the page opened at #issues/product=<the product, percent-encoded>
// expect: <main> shows the heading Issues and the list of the product's open issues, #5 and #7 with their class, the product's issues asked for; not the use cases
test("TST-20261111101 #issues/product=… draws the product's issue list, not the use cases", async () => {
  const known = await opened(`#use-case/product=${ENCODED}`);
  assert.match(known.page.main(), /<h2>Use cases<\/h2>/, "known positive: #use-case draws the use cases");
  const { page, product } = await opened(`#issues/product=${ENCODED}`);
  const html = page.main();
  assert.match(html, /<h2>Issues<\/h2>/, "the heading of the issue list");
  assert.doesNotMatch(html, /<h2>Use cases<\/h2>/, "not the use cases");
  assert.match(html, /class="issue-list"/);
  assert.match(html, /#5 Export is cut off/);
  assert.match(html, /#7 Pages are missing/);
  assert.match(html, /<span class="issue-class">change<\/span>/);
  assert.ok(product.requests.some((request) => request.startsWith(`handler GET https://api.github.com/repos/${PRODUCT}/issues?`)), "the product's issues are asked for");
});

// TST-20261111102 · level: component · module: MOD-site-frame
// guards: UC-012
// given: the product alice/product kept in this browser, its issue 7 open and labelled change; the instance's participant local-llm on this browser's endpoint ep1
// input: the page opened at #issue/number=7/product=<the product, percent-encoded>
// expect: <main> shows issue #7 with its title and text, and its section Analyse offering local-llm; not the use cases
test("TST-20261111102 #issue/number=7/product=… draws issue #7 with its Analyse, not the use cases", async () => {
  const { page } = await opened(`#issue/number=7/product=${ENCODED}`);
  const html = page.main();
  assert.doesNotMatch(html, /<h2>Use cases<\/h2>/, "not the use cases");
  assert.match(html, /<h3>Issue #7: Pages are missing<\/h3>/);
  assert.match(html, /<pre class="issue-text">Text of issue 7\.<\/pre>/);
  assert.match(html, /<section class="issue-analysis"><h3>Analyse<\/h3>/, "the section Analyse");
  assert.match(html, /<input class="participant" type="radio" value="local-llm">/, "Analyse offers the participant local-llm");
});

// TST-20261111103 · level: component · module: MOD-site-frame
// guards: UC-012
// given: the page at #issues/product=<the product> showing the issues of alice/product
// input: a person clicks the link of issue 5, and the browser announces the address's change
// expect: the address becomes #issue/number=5/product=<the product, percent-encoded>, and <main> then shows issue #5
test("TST-20261111103 a person's click on an issue of the list leads to that issue with the product kept", async () => {
  const { page } = await opened(`#issues/product=${ENCODED}`);
  const links = [...page.main().matchAll(/<a class="issue-link" href="([^"]*)">/g)].map((match) => match[1]);
  assert.deepEqual(links, [`#issue/number=5/product=${ENCODED}`, `#issue/number=7/product=${ENCODED}`], "known positive: the list's links name the product");
  await page.click("a.issue-link");
  assert.equal(globalThis.location.hash, `#issue/number=5/product=${ENCODED}`);
  await page.go(globalThis.location.hash);
  assert.match(page.main(), /<h3>Issue #5: Export is cut off<\/h3>/);
});
