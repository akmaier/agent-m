// An issue whose class is bug or change is moved to the backlog in one decision (ITM-1250) — MOD-maintenance-pages' route `issue/<number>` over MOD-issue-handling's `backlogItemFrom` and `moveToBacklog`, as the accepted text of
// docs/architecture/MOD-maintenance-pages.md (:117-126) states it: "*Move to backlog* with the item prefilled — its fields checked in a form while the person edits them —; *Add*, which writes the item and the issue's comment and label with `moveToBacklog`,
// or names the comment to copy when the token may not comment"; and (:119-120, :190-193) "MOD-spec-changes.queues — the change's queues, those whose `issue` names the number of the issue shown and the address of the product the frame has chosen;
// MOD-spec-changes.entryView — the requirements each of their entries changes or adds, its `impact`, given to `backlogItemFrom` as `changed`". UC-033 steps 1 to 4, 1a and 4b.
// Run: node --test tests/maintenance-pages-move-1250.test.mjs
//
// Module: MOD-maintenance-pages; MOD-issue-handling; MOD-work-plans; MOD-spec-changes
// Guards: A BACKLOG ITEM NAMES WHAT IT REALISES; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; EVERY ARTIFACT NAMES ITS ORIGIN; EVOLUTION ENTERS THROUGH THE SPECIFICATION; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-033
// Level: component
//
// The world is tests/maintenance-pages-world.mjs: its model endpoint ep1 is the participant local-llm, its fake GitHub holds the issues of alice/product with their comments and labels and takes git commits to the product. The page, MOD-issue-handling,
// MOD-work-plans, MOD-spec-changes, MOD-documents, MOD-site-frame and MOD-repository-hosts are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - The move is a section of the issue's page, <section class="issue-move">, shown for an open issue whose class is bug or change — by its label, or by the person's click on a class — and for no other class; it offers <button> "Move to backlog" (the person's click).
//   - The click draws the item as a form of MOD-site-frame's schemaForm (<div class="schema-form">, one <div class="field" data-key="<key>"> with an <input> for each key of the item), whose list-valued keys (realises, modules, tests, origin) are typed as one text,
//     the names separated by commas; its one button is "Add"; it is offered only while no error remains (disabled otherwise), and the findings of MOD-work-plans' backlogFindings are shown beside the form as <li class="error">. The identifier the form holds is
//     provisional: `saveItems` gives the item the next one that no history holds.
//   - `changed` is every requirement the entries of the queues name as added or changed in `entryView`'s impact, in the order of the queues' entries, once each, for the queues whose `**Issue:**` line names this issue and this product. The analysis is the page's proposal, if
//     the person ran one: its `violated` the requirement of the SPEC that its reasoning names, its `modules` the modules of the architecture whose folder holds a file it names as wrong; without a proposal both are empty.
//   - Add is the person's click on the form's button. It writes through `moveToBacklog`; the page then shows <p class="move-added"> with the item's identifier, or, when the comment was refused for want of the permission, <div class="move-comment"> with <pre class="comment-text">,
//     the issue's address as <a class="comment-issue"> and <button> "Copy comment".

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { buttonsOf, byClass, flush, one, restoreWorld, textOf, trusted, waitFor, walk, world, routeNamed, pages } from "./maintenance-pages-world.mjs";

// The strategies the page's own view hands the frame, which the harness does not register.
for (const [at, strategies] of (pages.view?.strategies ?? []).entries()) {
  try { registerStrategies(`tests/maintenance-pages-move-1250.test.mjs#${at}`, strategies); } catch { /* registered by the page's own view */ }
}

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_HOME827PRODUCT0123456789abcdefg";
const ISSUE_BODY = "The export is cut off after the second page.";
const issueRecord = (number, labels) => ({ number, title: `Export loses pages ${number}`, body: ISSUE_BODY, state: "open", labels, comments: [] });
const ISSUES = [issueRecord(5, []), issueRecord(6, ["defect"]), issueRecord(7, ["change"]), issueRecord(8, ["not-reproducible"])];
const ADDRESS = (number) => `${PRODUCT_URL}/issues/${number}`;

const moduleText = (id, folder) => ["---", `id: ${id}`, `title: ${id}`, `folder: ${folder}`, "realises: []", "follows:", "  - ARC-001", "uses: []", "provides: []", "---", `# ${id} ${id}`, "",
  "## Responsibility", "", "It stores.", "", "## Parts", "", "- index.mjs", "", "## Data", "", "Nothing.", "", "## Interfaces", "", "None.", "", "## Files", "", "None.", "", "## Uses", "", "None.", ""].join("\n");

// A queue drafted from an issue (MOD-spec-changes, Data): one entry that replaces the section "## 1. Section" of SPEC.md.
const rule = (name, text, check) => [`**${name}** *(Product Owner)*`, text, `*Check:* ${check}`, ""];
const SECTION = (rules) => ["## 1. Section", "", ...rules.flat()].join("\n");
const FIRST_CHANGED = rule("FIRST RULE", "The first rule holds on every page.", "`tests/unit.test.mjs`");
const SECOND = rule("SECOND RULE", "The second rule holds.", "no automatic check; at review.");
const SECOND_CHANGED = rule("SECOND RULE", "The second rule holds for every export.", "no automatic check; at review.");
const THIRD = rule("THIRD RULE", "The third rule holds.", "no automatic check; at review.");
function queue(folder, issue, rules) {
  const base = `docs/spec-freigaben/${folder}`;
  return {
    [`${base}/index.md`]: [`# SPEC approvals — queue ${folder.slice(0, 11)} · ${folder.slice(12)}`, "", `**Issue:** #${issue.number} of ${issue.product}`, "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 01 | `SPEC.md` | ## 1. Section | — | |", ""].join("\n"),
    [`${base}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n",
    [`${base}/01-section.md`]: `${SECTION(rules)}`,
    [`${base}/01-section.begruendung.md`]: "# Reason\n\nWhy.\n",
  };
}
// Issue 7's queue changes FIRST RULE and adds THIRD RULE; another product's issue 7 and this product's issue 6 each have a queue changing SECOND RULE, which no issue-7 item may name.
const QUEUES = {
  ...queue("2026-10-20a_export", { number: 7, product: PRODUCT_URL }, [FIRST_CHANGED, SECOND, THIRD]),
  ...queue("2026-10-20b_other-product", { number: 7, product: "https://github.com/alice/other" }, [rule("FIRST RULE", "The first rule holds.", "`tests/unit.test.mjs`"), SECOND_CHANGED]),
  ...queue("2026-10-20c_other-issue", { number: 6, product: PRODUCT_URL }, [rule("FIRST RULE", "The first rule holds.", "`tests/unit.test.mjs`"), SECOND_CHANGED]),
};
const PRODUCT_FILES = { ...QUEUES, "docs/architecture/MOD-store.md": moduleText("MOD-store", "src/store/"), "docs/architecture/MOD-pages.md": moduleText("MOD-pages", "src/pages/") };

const PROPOSAL = { class: "bug", reasoning: "FIRST RULE holds, and the code breaks it: the export drops pages.", wrong: ["src/store/read.mjs", "tests/store.test.mjs"] };

/** The world with the product chosen. */
function start(over = {}) {
  const w = world({ mails: [], issues: ISSUES, answer: () => ({ draft: PROPOSAL, answers: [] }), product: PRODUCT_FILES, ...over });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  return w;
}
const open = (w, number) => {
  assert.ok(routeNamed("issue"), `the route issue: ${pages.error?.message}`);
  return draw(routeNamed("issue"), w.context, { number: String(number) });
};
const moveOf = (detail) => byClass(detail, "issue-move")[0];
const fieldOf = (root, key) => walk(walk(root, (node) => node.getAttribute?.("data-key") === key)[0], (node) => node.localName === "input")[0];
const namesIn = (value) => String(value).split(",").map((name) => name.trim()).filter(Boolean);
const addedFiles = (w) => w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/git/trees")).flatMap((request) => JSON.parse(request.body).tree ?? [])
  .filter((entry) => typeof entry.content === "string" && entry.path.startsWith("docs/backlog/ITM-"));
const issueOf = (w, number) => w.kept.issues.find((each) => each.number === number);

/** The issue opened and its move section drawn. */
async function opened(w, number) {
  const detail = await open(w, number);
  await waitFor(() => byClass(detail, "issue-analysis").length > 0 && moveOf(detail) !== undefined);
  assert.ok(moveOf(detail), `issue ${number} shows the section to move it to the backlog`);
  return detail;
}
/** The person's click on Move to backlog, and the form waited for. */
async function moved(detail) {
  await trusted(buttonsOf(moveOf(detail), "Move to backlog")[0]);
  await waitFor(() => byClass(moveOf(detail), "schema-form").length > 0 || byClass(moveOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(moveOf(detail), "issue-problem").length, 0, textOf(moveOf(detail)));
  return byClass(moveOf(detail), "schema-form")[0];
}

// TST-1250201 · level: component · module: MOD-maintenance-pages, MOD-issue-handling, MOD-work-plans, MOD-spec-changes
// guards: A BACKLOG ITEM NAMES WHAT IT REALISES; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; EVERY ARTIFACT NAMES ITS ORIGIN; EVOLUTION ENTERS THROUGH THE SPECIFICATION; ONE CLICK PER DECISION; UC-033
// given: known positive first — the issue 7 labelled change; the product holds three queues: issue 7 of this product (FIRST RULE changed, THIRD RULE added), issue 7 of another product and issue 6 of this one (each changing SECOND RULE), and the module MOD-store
// input: the route issue 7; a click on Move to backlog by a script and then by a person; the module MOD-store typed; Add by a person
// expect: before the person's click no form; after it the item prefilled — the issue's title, the origin https://github.com/alice/product/issues/7, realises FIRST RULE and THIRD RULE and not SECOND RULE, no module —, and Add disabled with an error that names the module;
//   once MOD-store is typed Add is enabled; the person's click commits one file docs/backlog/ITM-<nnn>-export-loses-pages-7.md whose origin, realises and modules are those, with the issue's text as its outcome; the issue 7 receives one comment, the note item-added
//   naming that identifier and the file, and the label backlog; the page shows the identifier as added
test("issue — Move to backlog prefills the item with the requirements the issue's queues change, and Add writes it, the comment and the label", async () => {
  const w = start();
  const detail = await opened(w, 7);
  assert.equal(byClass(moveOf(detail), "schema-form").length, 0, "no form before the click");
  buttonsOf(moveOf(detail), "Move to backlog")[0].dispatchEvent(new Event("click"));
  await flush();
  assert.equal(byClass(moveOf(detail), "schema-form").length, 0, "a click by a script draws nothing");
  const form = await moved(detail);
  assert.equal(fieldOf(form, "title").value, "Export loses pages 7");
  assert.deepEqual(namesIn(fieldOf(form, "realises").value), ["FIRST RULE", "THIRD RULE"]);
  assert.deepEqual(namesIn(fieldOf(form, "origin").value), [ADDRESS(7)]);
  assert.deepEqual(namesIn(fieldOf(form, "modules").value), []);
  const add = buttonsOf(form, "Add")[0];
  assert.ok(add, "Add is offered");
  assert.equal(add.disabled, true, "Add waits for a module");
  assert.match(textOf(byClass(form, "error").find((node) => /module/i.test(textOf(node)))), /module/i);
  fieldOf(form, "modules").value = "MOD-store";
  fieldOf(form, "modules").dispatchEvent(new Event("input"));
  await waitFor(() => buttonsOf(form, "Add")[0].disabled === false);
  assert.equal(buttonsOf(form, "Add")[0].disabled, false);
  assert.deepEqual(addedFiles(w), [], "nothing is written before Add");

  await trusted(buttonsOf(form, "Add")[0]);
  await waitFor(() => byClass(moveOf(detail), "move-added").length > 0 || byClass(moveOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(moveOf(detail), "issue-problem").length, 0, textOf(moveOf(detail)));
  const files = addedFiles(w);
  assert.equal(files.length, 1);
  const [, id] = /^docs\/backlog\/(ITM-\d{3,})-export-loses-pages-7\.md$/.exec(files[0].path) ?? [];
  assert.ok(id, `the item is a new file of the backlog: ${files[0].path}`);
  assert.ok(files[0].content.includes(`id: ${id}`) && files[0].content.includes(ADDRESS(7)), files[0].content);
  assert.match(files[0].content, /realises:\n {2}- FIRST RULE\n {2}- THIRD RULE\n/);
  assert.match(files[0].content, /modules:\n {2}- MOD-store\n/);
  assert.ok(files[0].content.includes(ISSUE_BODY), "the outcome is the issue's text");
  assert.ok(!files[0].content.includes("SECOND RULE"), "no requirement of another queue");
  assert.equal(issueOf(w, 7).comments.length, 1);
  assert.match(issueOf(w, 7).comments[0], new RegExp(`^Backlog item \`${id}\` added: .*docs/backlog/${id}-export-loses-pages-7\\.md`));
  assert.deepEqual(issueOf(w, 7).labels.sort(), ["backlog", "change"]);
  assert.ok(textOf(one(moveOf(detail), "move-added")).includes(id));
});

// TST-1250202 · level: component · module: MOD-maintenance-pages, MOD-issue-handling
// guards: A BACKLOG ITEM NAMES WHAT IT REALISES; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; UC-033 2
// given: the issue 6 labelled defect; the participant's analysis proposes the class bug, its reasoning names FIRST RULE and it names the files src/store/read.mjs and tests/store.test.mjs as wrong; the product holds the modules MOD-store (src/store/) and MOD-pages (src/pages/);
//   the queues of the product name the issue 6 with a change of SECOND RULE
// input: the analysis run by a person; Move to backlog by a person; Add by a person
// expect: the item realises FIRST RULE alone — a bug takes the violated requirement, not the queue's — and changes MOD-store alone, so that Add is enabled at once; Add commits the item with the origin https://github.com/alice/product/issues/6 and comments on and labels issue 6
test("issue — for a bug the item realises the requirement the analysis names as violated and changes the modules of the files it names as wrong", async () => {
  const w = start();
  const detail = await open(w, 6);
  await waitFor(() => byClass(detail, "participant").length > 0 && moveOf(detail) !== undefined);
  const radio = byClass(detail, "participant").find((each) => each.value === "local-llm");
  radio.checked = true;
  one(detail, "person").value = "Reviewer Rae";
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(detail, "run-panel").length > 0);
  await trusted(buttonsOf(one(detail, "run-panel"), "Run")[0]);
  await waitFor(() => byClass(detail, "issue-proposal").length > 0 || byClass(detail, "issue-problem").length > 0);
  assert.equal(byClass(detail, "issue-problem").length, 0, textOf(detail));
  const form = await moved(detail);
  assert.deepEqual(namesIn(fieldOf(form, "realises").value), ["FIRST RULE"]);
  assert.deepEqual(namesIn(fieldOf(form, "modules").value), ["MOD-store"]);
  assert.deepEqual(namesIn(fieldOf(form, "origin").value), [ADDRESS(6)]);
  assert.equal(buttonsOf(form, "Add")[0].disabled, false);

  await trusted(buttonsOf(form, "Add")[0]);
  await waitFor(() => byClass(moveOf(detail), "move-added").length > 0 || byClass(moveOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(moveOf(detail), "issue-problem").length, 0, textOf(moveOf(detail)));
  const files = addedFiles(w);
  assert.equal(files.length, 1);
  assert.match(files[0].path, /^docs\/backlog\/ITM-\d{3,}-export-loses-pages-6\.md$/);
  assert.ok(files[0].content.includes(ADDRESS(6)));
  assert.equal(issueOf(w, 6).comments.length, 1);
  assert.deepEqual(issueOf(w, 6).labels.sort(), ["backlog", "defect"]);
});

// TST-1250203 · level: component · module: MOD-maintenance-pages
// guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-033 1a
// given: the issues 5 (no class), 6 (defect), 7 (change) and 8 (not-reproducible)
// input: the route issue for 6, 7, 8 and 5; on 5 the person's clicks on Bug, on Not reproducible and on Change
// expect: 6 and 7 offer Move to backlog; 8 does not; 5 does not until the click on Bug, offers it after it, not after the click on Not reproducible, and offers it after the click on Change
test("issue — Move to backlog is offered for an issue classified as a bug or a change, and for no other", async () => {
  const w = start();
  for (const number of [6, 7]) {
    const detail = await opened(w, number);
    assert.equal(buttonsOf(moveOf(detail), "Move to backlog").length, 1, `issue ${number}`);
  }
  const eight = await open(w, 8);
  await waitFor(() => byClass(eight, "issue-analysis").length > 0);
  await flush();
  assert.equal(buttonsOf(eight, "Move to backlog").length, 0);
  const five = await open(w, 5);
  await waitFor(() => byClass(five, "set-class").length > 0);
  assert.equal(buttonsOf(five, "Move to backlog").length, 0);
  const setClass = async (cls, offered) => {
    await trusted(byClass(five, "set-class").find((node) => node.getAttribute("data-class") === cls));
    await waitFor(() => buttonsOf(five, "Move to backlog").length === (offered ? 1 : 0));
    assert.equal(buttonsOf(five, "Move to backlog").length, offered ? 1 : 0, cls);
  };
  await setClass("bug", true);
  await setClass("not-reproducible", false);
  await setClass("change", true);
});

// TST-1250204 · level: component · module: MOD-maintenance-pages, MOD-issue-handling
// guards: UC-033 4b; ONE CLICK PER DECISION
// given: known positive first (TST-1250201: the comment is written); the token may not comment (GitHub answers 403 to a comment); the issue 7 and its queue
// input: Move to backlog, the module typed, Add by a person
// expect: the item is committed all the same; the page shows no problem and, instead of the added line's comment, the comment's text — the note item-added naming the new identifier — in a pre with the issue's address and a Copy comment button; the issue is not labelled
test("issue — when the token may not comment the item is written and the page shows the comment to copy with the issue's address", async () => {
  const w = start({ commentStatus: 403 });
  const detail = await opened(w, 7);
  const form = await moved(detail);
  fieldOf(form, "modules").value = "MOD-store";
  fieldOf(form, "modules").dispatchEvent(new Event("input"));
  await waitFor(() => buttonsOf(form, "Add")[0].disabled === false);
  await trusted(buttonsOf(form, "Add")[0]);
  await waitFor(() => byClass(moveOf(detail), "move-comment").length > 0 || byClass(moveOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(moveOf(detail), "issue-problem").length, 0, textOf(moveOf(detail)));
  const files = addedFiles(w);
  assert.equal(files.length, 1, "the item is committed");
  const [, id] = /^docs\/backlog\/(ITM-\d{3,})-/.exec(files[0].path);
  const comment = textOf(one(moveOf(detail), "comment-text"));
  assert.match(comment, new RegExp(`^Backlog item \`${id}\` added: `));
  assert.equal(one(moveOf(detail), "comment-issue").getAttribute("href"), ADDRESS(7));
  assert.equal(buttonsOf(moveOf(detail), "Copy comment").length, 1);
  assert.deepEqual(issueOf(w, 7).comments, []);
  assert.deepEqual(issueOf(w, 7).labels, ["change"]);
});
