// MOD-trace-pages' specification view leads to the review pages' editing (ITM-360), as the accepted text of docs/architecture/MOD-trace-pages.md states it: for the
// specification, "to the review pages, on the default branch only: *Edit* and *Change by prompt* on a requirement, ..., *+ Requirement* in each section, which opens
// `requirements/new` for that section (UC-018 3d)"; and "Editing, changing by prompt and arranging are the review pages' routes, which its links lead to". This file also
// covers *Change by prompt* (ITM-399); *Arrange* (UC-021) is not part of either item. For UC-018 (step 1, 3d) and UC-019 (step 1).
// Run: node --test tests/trace-pages-edit-links.test.mjs
//
// This imports the shared small DOM of tests/site-frame.test.mjs unchanged, as the other tests of the views do, and calls the public trace/specification route with a Host of the
// test's own that keeps to MOD-repository-hosts' interface (repositoryInfo, readSnapshot) and has no write. The fixture is the SPEC of the review pages' tests of UC-018:
// the requirements A LOAN HAS A DUE DATE and A BOOK IS SHELVED in the section "## 1. Lending", A MEMBER HAS A CARD in "## 2. Membership", and one before every section
// (UC-018 itself gives no requirement text). Where the file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The default branch is on view when the route's `ref` is the branch the Host's repositoryInfo names as the default; a tag, or any other ref, is not; a Host that cannot say
//     (no repositoryInfo, or it fails) is read as not on the default branch, and no link is offered.
//   - The links are anchors in the address form the frame reads and the review pages' routes take: `#requirement/name=<NAME>` for Edit and
//     `#requirements/section=<the section's heading line>` for + Requirement, each part encoded as the frame's fragmentOf encodes it. Edit stands in the requirement's own row
//     beside its name; + Requirement stands in its section, none for the requirements before the first section.
//   - Prompt routes use the frame's structured key=value fragment convention: one requirement is
//     `#requirement/name=<NAME>/prompt=1`; a requirement group is `#requirements/requirements=<JSON names>/prompt=1`, with the JSON array in the group's order.
// Each test case carries its declaration (given / input / expect); where a test expects a link to be absent, the same page is first shown to hold it. The counter-proofs are
// recorded in the pull request.

import "./site-frame.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const OUTSIDE = "A LIBRARY LENDS BOOKS", LOAN = "A LOAN HAS A DUE DATE", SHELF = "A BOOK IS SHELVED", CARD = "A MEMBER HAS A CARD";
const SPEC = `# Library — Specification

**${OUTSIDE}** *(Product Owner)*
The library lends books to its members.
*Check:* at review.

## 1. Lending

**${LOAN}** *(Product Owner)*
Every loan states the date by which the book is returned.
*Check:* \`tests/loan.test.mjs\`

**${SHELF}** *(Product Owner)*
Every book stands on one shelf.
*Check:* \`tests/shelf.test.mjs\`

## 2. Membership

**${CARD}** *(Product Owner)*
Every member holds a card.
*Check:* \`tests/card.test.mjs\`
`;

// A Host of the test's own: the default branch main, a SPEC at every ref, and no write.
function host({ defaultBranch = "main", info = true } = {}) {
  const fake = { async readSnapshot(ref) { return { ref, commit: ref, paths: ["SPEC.md"], read: async (path) => (path === "SPEC.md" ? SPEC : null), blob: () => null }; } };
  if (info === true) fake.repositoryInfo = async () => ({ defaultBranch, visibility: "public", canWrite: false, archived: false, description: "" });
  else if (info === "fails") fake.repositoryInfo = async () => { throw Object.assign(new Error("unreachable"), { name: "Unreachable" }); };
  return fake;
}
const find = (root, match) => {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
};
async function render(productHost, ref) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { product: { address: "https://github.com/acme/library", kind: "github", host: productHost } }, { key: "specification", ref });
  return target;
}
const links = (target, className) => find(target, (node) => node.localName === "a" && node.className.split(/\s+/).includes(className));

// TST-360001 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-018
// given: the specification of a library on the default branch main, with one requirement before every section, two in "## 1. Lending" and one in "## 2. Membership"
// input: the public trace/specification route rendered at the ref main
// expect: Edit beside each of the four requirements, in its own row, each an anchor to #requirement/name=<its name, encoded>, in the order of the SPEC
test("TST-360001 Edit stands beside each requirement on the default branch and leads to the requirement's edit route", async () => {
  const target = await render(host(), "main");
  const edits = links(target, "requirement-edit");
  assert.deepEqual(edits.map((node) => node.textContent), ["Edit", "Edit", "Edit", "Edit"]);
  assert.deepEqual(edits.map((node) => node.getAttribute("href")), [OUTSIDE, LOAN, SHELF, CARD].map((name) => `#requirement/name=${encodeURIComponent(name)}`));
  for (const [edit, name] of edits.map((node, at) => [node, [OUTSIDE, LOAN, SHELF, CARD][at]])) {
    const row = edit.parentNode.parentNode;
    assert.equal(row.localName, "tr");
    assert.equal(find(row, (node) => node.localName === "button")[0].textContent, name, `${name}: its Edit is in its own row`);
  }
});

// TST-360002 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-018 (3d)
// given: the same specification on the default branch
// input: the route rendered at main
// expect: + Requirement in each of the two sections, an anchor to #requirements/section=<the section's heading line, encoded> — "## 1. Lending", "## 2. Membership" —, inside
//         its own section; none for the requirement before the first section
test("TST-360002 + Requirement stands in each section and opens requirements/new for that section", async () => {
  const target = await render(host(), "main");
  const sections = find(target, (node) => node.localName === "section" && node.className.includes("spec-section"));
  assert.equal(sections.length, 2);
  const added = links(target, "requirement-new");
  assert.deepEqual(added.map((node) => node.textContent), ["+ Requirement", "+ Requirement"]);
  assert.deepEqual(added.map((node) => node.getAttribute("href")), ["## 1. Lending", "## 2. Membership"].map((heading) => `#requirements/section=${encodeURIComponent(heading)}`));
  sections.forEach((section, at) => assert.deepEqual(links(section, "requirement-new"), [added[at]], `section ${at + 1} holds its own + Requirement alone`));
  assert.equal(find(target, (node) => node.localName === "a").length, 6, "four Edit and two + Requirement, nothing else");
});

// TST-360003 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-018
// given: the same specification, read at the tag v1.0 and at a commit — not the default branch main —; the page at main shown to hold the links first
// input: the route rendered at v1.0 and at a commit of forty digits
// expect: every requirement and every section is listed as at main, and neither Edit nor + Requirement is offered
test("TST-360003 neither Edit nor + Requirement is offered on a tag or any ref but the default branch", async () => {
  const onMain = await render(host(), "main");
  assert.equal(links(onMain, "requirement-edit").length + links(onMain, "requirement-new").length, 6, "known positive: main offers them");
  for (const ref of ["v1.0", "0123456789abcdef0123456789abcdef01234567"]) {
    const target = await render(host(), ref);
    assert.deepEqual(find(target, (node) => node.localName === "button" && node.className.includes("requirement-name")).map((node) => node.textContent), [OUTSIDE, LOAN, SHELF, CARD], ref);
    assert.deepEqual([links(target, "requirement-edit").length, links(target, "requirement-new").length], [0, 0], ref);
  }
});

// TST-360004 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD
// given: a Host whose default branch is trunk, the page rendered at trunk and at main; a Host that cannot name its default branch (no repositoryInfo) and one whose repositoryInfo fails
// input: the route rendered at trunk and at main on the first; at main on the others
// expect: links at trunk, none at main on the first — the default branch is the Host's, not a name assumed —; none on the others, whose requirements are still listed
test("TST-360004 the default branch is the Host's own, and a Host that cannot name it offers no link", async () => {
  const trunk = host({ defaultBranch: "trunk" });
  assert.equal(links(await render(trunk, "trunk"), "requirement-edit").length, 4, "known positive: trunk is the default branch");
  assert.equal(links(await render(trunk, "main"), "requirement-edit").length, 0);
  for (const info of [false, "fails"]) {
    const target = await render(host({ info }), "main");
    assert.equal(find(target, (node) => node.localName === "button" && node.className.includes("requirement-name")).length, 4, `${info}: the requirements are listed`);
    assert.deepEqual([links(target, "requirement-edit").length, links(target, "requirement-new").length], [0, 0], String(info));
  }
});

// TST-399001 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-019 (step 1)
// given: the specification of the library on its default branch, with four requirements
// input: the route rendered at main, then each requirement opened through its requirement-name control
// expect: every opened requirement offers Change by prompt in its own detail, in SPEC order, with the frame route #requirement/name=<NAME>/prompt=1
test("TST-399001 Change by prompt on each requirement uses its structured review route on the default branch", async () => {
  const target = await render(host(), "main");
  const requirements = find(target, (node) => node.localName === "button" && node.className.includes("requirement-name"));
  requirements.forEach((button) => button.dispatchEvent(new Event("click")));

  const prompts = links(target, "requirement-prompt");
  assert.deepEqual(prompts.map((node) => node.textContent), ["Change by prompt", "Change by prompt", "Change by prompt", "Change by prompt"]);
  assert.deepEqual(prompts.map((node) => node.getAttribute("href")), [OUTSIDE, LOAN, SHELF, CARD].map((name) => `#requirement/name=${encodeURIComponent(name)}/prompt=1`));
  for (const [prompt, name] of prompts.map((node, at) => [node, [OUTSIDE, LOAN, SHELF, CARD][at]])) {
    assert.equal(prompt.parentNode.className, "requirement-detail", `${name}: its prompt control is in its opened detail`);
    assert.equal(prompt.parentNode.childNodes[0].textContent, name);
  }
});

// TST-399002 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-019 (step 1)
// given: the same specification on the default branch, whose Lending group holds LOAN then SHELF and whose Membership group holds CARD
// input: the route rendered at main, then each group opened through its spec-section-toggle control
// expect: each opened group offers Change by prompt inside itself, with #requirements/requirements=<encoded JSON names>/prompt=1 and the names in group order
test("TST-399002 Change by prompt on a requirement group hands its names to the structured route in group order", async () => {
  const target = await render(host(), "main");
  const sections = find(target, (node) => node.localName === "section" && node.className.includes("spec-section"));
  find(target, (node) => node.localName === "button" && node.className.includes("spec-section-toggle")).forEach((button) => button.dispatchEvent(new Event("click")));

  const prompts = links(target, "requirement-group-prompt");
  const groups = [[LOAN, SHELF], [CARD]];
  assert.deepEqual(prompts.map((node) => node.textContent), ["Change by prompt", "Change by prompt"]);
  assert.deepEqual(prompts.map((node) => node.getAttribute("href")), groups.map((names) => `#requirements/requirements=${encodeURIComponent(JSON.stringify(names))}/prompt=1`));
  sections.forEach((section, at) => assert.deepEqual(links(section, "requirement-group-prompt"), [prompts[at]], `group ${at + 1} holds its own prompt control alone`));
});

// TST-399003 · level: unit · module: MOD-trace-pages
// guards: EDITS ARE PREPARED ON THE DASHBOARD; UC-019 (step 1)
// given: the same specification on the default branch main and at the tag v1.0
// input: on each ref, every requirement and group is opened through its existing control
// expect: main has four requirement and two group prompt links as the known positive; the tag has neither control while all requirements remain readable
test("TST-399003 Change by prompt on requirements and groups is offered on the default branch only, never a tag", async () => {
  const openAll = async (ref) => {
    const target = await render(host(), ref);
    find(target, (node) => node.localName === "button" && (node.className.includes("requirement-name") || node.className.includes("spec-section-toggle"))).forEach((button) => button.dispatchEvent(new Event("click")));
    return target;
  };
  const onMain = await openAll("main");
  assert.deepEqual([links(onMain, "requirement-prompt").length, links(onMain, "requirement-group-prompt").length], [4, 2], "known positive: the default branch offers both controls");

  const onTag = await openAll("v1.0");
  assert.deepEqual(find(onTag, (node) => node.localName === "button" && node.className.includes("requirement-name")).map((node) => node.textContent), [OUTSIDE, LOAN, SHELF, CARD]);
  assert.deepEqual([links(onTag, "requirement-prompt").length, links(onTag, "requirement-group-prompt").length], [0, 0]);
});

// TST-515003 · level: unit · module: MOD-trace-pages
// guards: THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK; UC-020 (issue #519: + Requirement touched the table below it)
// given: the specification of a library on the default branch main, two sections
// input: the route rendered at main
// expect: in each section, + Requirement carries a style attribute with a bottom margin above zero (px, em or rem), so that it stands apart from the section's table, which follows it
test("TST-515003 + Requirement carries the space that separates it from the table below it", async () => {
  const target = await render(host(), "main");
  const added = links(target, "requirement-new");
  assert.equal(added.length, 2, "known positive: both sections offer + Requirement");
  for (const link of added) {
    const space = /(?:^|;)\s*margin(?:-bottom)?\s*:\s*(?:[^;]*\s)?(0*\.?\d*[1-9]\d*)(?:px|em|rem)\s*(?:;|$)/.exec(link.getAttribute("style") ?? "");
    assert.ok(space, `${link.getAttribute("href")}: a margin above zero, got ${JSON.stringify(link.getAttribute("style"))}`);
    assert.equal(link.nextSibling.localName, "table", "the table follows it");
  }
});
