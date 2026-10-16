// MOD-review-pages' routes give the prompt bar their subject (ITM-507), as the accepted text of docs/architecture/MOD-review-pages.md and MOD-site-frame.md state it:
// "`<k>/<id>` … Its subject for the prompt bar names the descriptor's change kind and the file as its target — the use case, or the architecture file —, with `draft` as its
// draft route", "`<k>/<id>/edit`, and `requirement/<name>/edit` and `requirements/new` for a requirement — whose subject for the prompt bar is the file, or the requirement
// with `change-requirements`, as on the file's route", "For a change of requirements, the subject's parameters carry the person's own source, which `personSource` names among
// the product's linked sources; without one, the prompt bar sends nothing and names the step that is missing (UC-004, UC-015, UC-019 4b)", and MOD-site-frame's Route.subject.
// Run: node --test tests/review-pages-subjects.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-049; UC-019; THE PERSON WHO PROMPTS IS A SOURCE; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
// Level: unit
//
// The fixtures are tests/review-pages-draft-world.mjs'. The route is drawn first, as the frame draws it, and then asked for its subject with the same `params` and the same
// `context`, as the frame asks it at each Send. Where the module files leave a reading open, the test states the one it takes, and the pull request names it:
//   - The key of a subject is the fragment of its file or requirement — the route's name and `id=<id>` (use cases, decisions, modules, SPEC entries), `name=<requirement>` or
//     `section=<heading>` —, with `product=<address>` after them on a product's page, every part percent-encoded, as MOD-site-frame writes the key of its default subject. The
//     page of a file and its editor are one subject. Its `draftRoute` is `draft/subject=<the key, percent-encoded>`: the route `draft` reads the subject from its address.
//   - The job's parameters are, for a use case, `useCase` (the identifier the recipe `use-case-with-neighbours` reads); for an architecture decision or module file, `target`
//     (its identifier); for requirements, `requirements` (the names the SPEC holds), `source` and, for a new requirement, `section`; for a SPEC change entry `target` (its
//     identifier), the `requirements` of its proposal that the SPEC holds, and `source`. All carry `version`: the blob of the file, or of the SPEC section the named requirements stand in, as the
//     page read it, which is the text the job reads.
//   - A page that names no file — a list, Review all, a drafting page, an identifier the product does not hold — has a subject of the kind `converse`
//     that is the frame's default: its key the route's fragment, its title the route's title, no draft route, the page it has drawn.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { ARC1, ENTRY_ID, GITHUB, HEADING, LENDING, LOAN, MOD_READER, NO_LINKS, PRODUCT, PRODUCT_FILES, SHELF, SOURCE, UC7, blobOf,
  byClass, contextOf, draw, fakeProduct, fetched, find, routeNamed } from "./review-pages-draft-world.mjs";

test.afterEach(() => { assert.deepEqual(fetched.splice(0), [], "no request left the fixtures"); });
const participant = { name: "drafter-a", model: "example-model" };
const draftRouteOf = (key) => `draft/subject=${encodeURIComponent(key)}`;

// TST-507001 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 3); UC-019 (steps 1, 3); A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
// given: the page of the open use case UC-007 of a product; its editor
// input: the subject of the route `use-case` with the id UC-007, and with the id UC-007 and the part edit
// expect: for both the same subject — kind change-use-case, entry use-cases, title "UC-007 Derive use cases", key "use-case/id=UC-007/product=<the product's address, encoded>",
//   draftRoute "draft/subject=<that key, encoded>", no withhold, refuses []; its parameters for a participant {useCase: "UC-007", version: the blob of the file as it stands}
test("use-case/<id> and its editor — the subject is the use case, with the change kind and the draft route", async () => {
  const fake = fakeProduct();
  const key = `use-case/id=UC-007/product=${PRODUCT}`;
  for (const params of [{ id: "UC-007" }, { id: "UC-007", edit: "1" }]) {
    const page = await draw(fake, "use-case", params);
    const subject = page.subject();
    assert.equal(subject.kind, "change-use-case");
    assert.equal(subject.entry, "use-cases");
    assert.equal(subject.title, "UC-007 Derive use cases");
    assert.equal(subject.key, key);
    assert.equal(subject.draftRoute, draftRouteOf(key));
    assert.equal(subject.withhold, null);
    assert.deepEqual(subject.refuses, []);
    assert.deepEqual(subject.paramsFor(participant), { useCase: "UC-007", version: blobOf(UC7) });
  }
});

// TST-507002 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 3); UC-023
// given: the pages of the architecture decision ARC-001 and of the module file MOD-reader
// input: the subject of the route `decision` with the id ARC-001, and of the route `module` with the id MOD-reader and the part edit
// expect: kind change-architecture and entry architecture for both; keys "decision/id=ARC-001/product=<address>" and "module/id=MOD-reader/product=<address>"; titles "ARC-001 Lending is a
//   desk" and "MOD-reader Reading a book"; their draft routes "draft/subject=<key, encoded>"; the parameters {target: "ARC-001", version: the file's blob} and {target: "MOD-reader",
//   version: the file's blob}
test("decision/<id> and module/<id> — the subject is the architecture file, with change-architecture", async () => {
  const fake = fakeProduct();
  const cases = [["decision", { id: "ARC-001" }, "ARC-001", "ARC-001 Lending is a desk", ARC1], ["module", { id: "MOD-reader", edit: "1" }, "MOD-reader", "MOD-reader Reading a book", MOD_READER]];
  for (const [name, params, id, title, body] of cases) {
    const subject = (await draw(fake, name, params)).subject();
    const key = `${name}/id=${id}/product=${PRODUCT}`;
    assert.equal(subject.kind, "change-architecture");
    assert.equal(subject.entry, "architecture");
    assert.equal(subject.title, title);
    assert.equal(subject.key, key);
    assert.equal(subject.draftRoute, draftRouteOf(key));
    assert.deepEqual(subject.paramsFor(participant), { target: id, version: blobOf(body) });
  }
});

// TST-507003 · level: unit · module: MOD-review-pages
// guards: UC-019 (steps 3, 6); THE PERSON WHO PROMPTS IS A SOURCE
// given: a product whose SPEC holds the requirement A LOAN HAS A DUE DATE in the section "## 1. Lending"; the instance's author github.com/alice, whose person source SRC-alice the product links
// input: the subject of the route `requirement` with the name A LOAN HAS A DUE DATE
// expect: kind change-requirements, entry requirements, title "A LOAN HAS A DUE DATE", key "requirement/name=<the name, encoded>/product=<address>", draftRoute "draft/subject=<key, encoded>";
//   the parameters {requirements: ["A LOAN HAS A DUE DATE"], source: "SRC-alice", version: the blob of the section "## 1. Lending"}
test("requirement/<name> — the subject is the requirement, with change-requirements and the person's own source", async () => {
  const fake = fakeProduct();
  const subject = (await draw(fake, "requirement", { name: LOAN })).subject();
  const key = `requirement/name=${encodeURIComponent(LOAN)}/product=${PRODUCT}`;
  assert.equal(subject.kind, "change-requirements");
  assert.equal(subject.entry, "requirements");
  assert.equal(subject.title, LOAN);
  assert.equal(subject.key, key);
  assert.equal(subject.draftRoute, draftRouteOf(key));
  assert.deepEqual(subject.paramsFor(participant), { requirements: [LOAN], source: SOURCE, version: blobOf(LENDING) });
});

// TST-507004 · level: unit · module: MOD-review-pages
// guards: UC-019 (step 3, UC-018 3d); THE PERSON WHO PROMPTS IS A SOURCE
// given: the page of a new requirement in the section "## 1. Lending"
// input: the subject of the route `requirements` with the section "## 1. Lending"
// expect: kind change-requirements; title "New requirement in ## 1. Lending"; key "requirements/section=<the heading, encoded>/product=<address>"; draftRoute "draft/subject=<key, encoded>"; the parameters
//   {requirements: [], section: "## 1. Lending", source: "SRC-alice", version: the blob of the section}
test("requirements/new — the subject is the new requirement in its section, with the person's own source", async () => {
  const fake = fakeProduct();
  const subject = (await draw(fake, "requirements", { section: HEADING })).subject();
  const key = `requirements/section=${encodeURIComponent(HEADING)}/product=${PRODUCT}`;
  assert.equal(subject.kind, "change-requirements");
  assert.equal(subject.title, `New requirement in ${HEADING}`);
  assert.equal(subject.key, key);
  assert.equal(subject.draftRoute, draftRouteOf(key));
  assert.deepEqual(subject.paramsFor(participant), { requirements: [], section: HEADING, source: SOURCE, version: blobOf(LENDING) });
});

// TST-507005 · level: unit · module: MOD-review-pages
// guards: UC-019 (step 3); UC-006
// given: the SPEC change entry 01 of a queue, which proposes the section "## 1. Lending" with both of its requirements
// input: the subject of the route `spec-entry` with the id spec-2026-03-01_sample-01
// expect: kind change-requirements, entry requirements, title "spec-2026-03-01_sample-01", key "spec-entry/id=spec-2026-03-01_sample-01/product=<address>", draftRoute "draft/subject=<key, encoded>";
//   the parameters {target: "spec-2026-03-01_sample-01", requirements: ["A LOAN HAS A DUE DATE", "A BOOK IS SHELVED"], source: "SRC-alice", version: the blob of the SPEC section "## 1. Lending", which the job reads}
test("spec-entry/<id> — the subject is the entry, with the requirements of its proposal", async () => {
  const fake = fakeProduct();
  const subject = (await draw(fake, "spec-entry", { id: ENTRY_ID })).subject();
  const key = `spec-entry/id=${ENTRY_ID}/product=${PRODUCT}`;
  assert.equal(subject.kind, "change-requirements");
  assert.equal(subject.entry, "requirements");
  assert.equal(subject.title, ENTRY_ID);
  assert.equal(subject.key, key);
  assert.equal(subject.draftRoute, draftRouteOf(key));
  assert.deepEqual(subject.paramsFor(participant), { target: ENTRY_ID, requirements: [LOAN, SHELF], source: SOURCE, version: blobOf(LENDING) });
});

// TST-507006 · level: unit · module: MOD-review-pages
// guards: UC-019 (4b); THE PERSON WHO PROMPTS IS A SOURCE
// given: a product whose links file names no source, so that the instance's author has no personal source the product links
// input: the subject of the route `requirement` with the name A LOAN HAS A DUE DATE, then its parameters for a participant
// expect: the parameters are refused with an error named NoPersonSource whose message names the two steps — registering the person as a source (#library) and linking that source to the
//   product (#sources); the subject of a use case of the same product still gives its parameters
test("requirement/<name> — without a linked source of the person, the subject's parameters name the missing step", async () => {
  const fake = fakeProduct({ ...PRODUCT_FILES, "docs/sources.md": NO_LINKS });
  const subject = (await draw(fake, "requirement", { name: LOAN })).subject();
  assert.throws(() => subject.paramsFor(participant), (error) => {
    assert.equal(error.name, "NoPersonSource");
    assert.match(error.message, /no personal source linked to this product/);
    assert.match(error.message, /Register the person as a source \(#library\) and link that source to the product \(#sources\)/);
    return true;
  });
  const useCase = (await draw(fake, "use-case", { id: "UC-007" })).subject();
  assert.deepEqual(useCase.paramsFor(participant), { useCase: "UC-007", version: blobOf(UC7) });
});

// TST-507007 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 3); THE PAGE NAMES WHERE IT SENDS
// given: the instance's own page, with no product chosen, and the same use case on a product's page
// input: the subject of the route `use-case` with the id UC-007 on each
// expect: the keys differ — "use-case/id=UC-007" on the instance's page, "use-case/id=UC-007/product=<address>" on the product's — so that a draft is shown only on the page it was drafted on; the
//   instance's draft route is "draft/subject=use-case%2Fid%3DUC-007"
test("use-case/<id> — the same route on the instance and on a product are two subjects", async () => {
  const fake = fakeProduct();
  const own = (await draw(fake, "use-case", { id: "UC-007" }, { context: { ...contextOf(fake, { product: false }), instance: { repository: "alice/thesis-tool", host: fake.host } } })).subject();
  const onProduct = (await draw(fake, "use-case", { id: "UC-007" })).subject();
  assert.equal(own.key, "use-case/id=UC-007");
  assert.equal(own.draftRoute, "draft/subject=use-case%2Fid%3DUC-007");
  assert.equal(onProduct.key, `use-case/id=UC-007/product=${PRODUCT}`);
});

// TST-507008 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 3)
// given: a product page of the route `use-case`
// input: the subject of the list (no part), of Review all (id=all), of the drafting page (id=draft) and of an identifier the product does not hold (UC-999)
// expect: each is the frame's default — kind converse, title "Use cases", no draft route, no withhold, refuses [], entry use-cases — with the key the route's fragment ("use-case", "use-case/id=all", …, each with
//   "/product=<address>" after it), and as its page the title, the product's address and what the route has drawn — for the list the row "UC-007"
test("the other routes of a kind keep the frame's default subject", async () => {
  const fake = fakeProduct();
  const cases = [[{}, "use-case"], [{ id: "all" }, "use-case/id=all"], [{ id: "draft" }, "use-case/id=draft"], [{ id: "UC-999" }, "use-case/id=UC-999"]];
  for (const [params, fragment] of cases) {
    const page = await draw(fake, "use-case", params);
    const subject = page.subject();
    assert.equal(subject.kind, "converse", fragment);
    assert.equal(subject.key, `${fragment}/product=${PRODUCT}`);
    assert.equal(subject.title, "Use cases");
    assert.equal(subject.entry, "use-cases");
    assert.equal(subject.draftRoute, null);
    assert.equal(subject.withhold, null);
    assert.deepEqual(subject.refuses, []);
    const given = subject.paramsFor(participant).page;
    assert.match(given, /^Use cases\n/, fragment);
    assert.ok(given.includes(GITHUB.web), `${fragment}: the product's address`);
  }
  const list = (await draw(fake, "use-case", {})).subject().paramsFor(participant).page;
  assert.match(list, /UC-007/);
  assert.match(list, /UC-008/);
});

// TST-507009 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 3); UC-019 (step 1)
// given: the view the module offers, a product with the use case UC-007 and the requirement A LOAN HAS A DUE DATE
// input: the former routes of changing by prompt, drawn: `use-case/id=UC-007/prompt=1`, `requirement/name=A LOAN HAS A DUE DATE/prompt=1` and `requirements/requirements=["A LOAN HAS A DUE DATE"]/prompt=1`;
//   known positives: the same routes without `prompt`
// expect: none draws a prompt page — no heading "Change UC-007 by prompt" or "Change requirements by prompt", nor any heading containing "by prompt", no field "What should change" (textarea.instruction), no participant list —;
//   the use case's route draws the page of UC-007 (heading "UC-007 Derive use cases"), the requirement's route the editor of the requirement (heading "Edit A LOAN HAS A DUE DATE", a field
//   Why), as the same routes draw them without the part prompt
test("the old prompt routes are gone", async () => {
  const fake = fakeProduct();
  const headings = (page) => find(page.target, (node) => node.localName === "h2" || node.localName === "h3").map((node) => node.textContent);
  const first = (page) => headings(page)[0];
  const prompted = (page) => find(page.target, (node) => node.localName === "textarea" && node.className.split(" ").includes("instruction")).length + byClass(page.target, "ul", "participants").length;
  const names = JSON.stringify([LOAN]);
  const useCase = await draw(fake, "use-case", { id: "UC-007" });
  const requirement = await draw(fake, "requirement", { name: LOAN });
  assert.equal(first(useCase), "UC-007 Derive use cases", "known positive: the page of the use case");
  assert.equal(first(requirement), `Edit ${LOAN}`, "known positive: the editor of the requirement");

  const useCasePrompt = await draw(fake, "use-case", { id: "UC-007", prompt: "1" });
  assert.equal(first(useCasePrompt), "UC-007 Derive use cases");
  assert.equal(headings(useCasePrompt).some((heading) => /by prompt/.test(heading)), false);
  assert.equal(prompted(useCasePrompt), 0);
  const requirementPrompt = await draw(fake, "requirement", { name: LOAN, prompt: "1" });
  assert.equal(first(requirementPrompt), `Edit ${LOAN}`);
  assert.equal(headings(requirementPrompt).some((heading) => /by prompt/.test(heading)), false);
  assert.equal(prompted(requirementPrompt), 0);
  const groupPrompt = await draw(fake, "requirements", { requirements: names, prompt: "1" });
  assert.equal(headings(groupPrompt).some((heading) => /by prompt/.test(heading)), false);
  assert.equal(prompted(groupPrompt), 0);
});

// TST-507010 · level: unit · module: MOD-review-pages
// guards: UC-049 (step 5); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the view the module offers
// input: its route named draft, and the drawing of a file's page
// expect: the route draft is there, outside the menu (entry null), titled "The draft of the conversation"; drawing a page changes no file of the product
test("MOD-review-pages view — the route draft is outside the menu", async () => {
  const fake = fakeProduct();
  const route = routeNamed("draft");
  assert.ok(route, "the route draft");
  assert.equal(route.entry, null);
  assert.equal(route.title, "The draft of the conversation");
  assert.equal(typeof route.render, "function");
  await draw(fake, "decision", { id: "ARC-001" });
  assert.deepEqual(fake.files(), PRODUCT_FILES);
});
