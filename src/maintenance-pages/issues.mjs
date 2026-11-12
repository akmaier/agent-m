// The routes `issues` and `issue/<number>` — a product's issues, and *Implement*, which puts the request to handle an issue as UC-012 does into the prompt bar (UC-012 step 2), as docs/architecture/MOD-maintenance-pages.md
// states them: the classification, the fix and the change are the work of the conversation's agent (UC-012 steps 3 to 6), not of this page. The move into the backlog (ITM-1250) is a section of the issue's page; what the
// fix's pull request changes in the expectations of existing tests (ITM-654) and closing the issue with links once it is merged are another.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them):
//   - The product is the one the frame has chosen (`context.product`); without one the page says so and reads nothing. The routes are `issues` (in the menu entry maintenance) and `issue` (out of the menu), whose parameter `number` is the issue's: `#issue/number=<n>`.
//   - Both routes draw the tab strip of tabs.mjs at their head, under the tab Issues (UC-046 step 2).
//   - `issues` lists the open and closed issues, each with its state (<span class="issue-state">: open or closed) and the class their label says (defect, change or not-reproducible, else "not classified");
//     an issue's link goes, on a person's click, to the route `issue` with its number. The list reads them without their comments (`listIssues` with `state: "all"` and `comments: false`); `issue` reads
//     its one issue with `readIssue` (ITM-1270): a number that is no issue of the product is not in it.
//   - `issue` names, open or closed, each mail the issue lists (`listedMailIds`, over its text and its comments) by its identifier, in <ul class="issue-mails"> of <a class="mail-link">, whose href is the
//     route `mail/<id>` — #mail/id=<id> with the product — and whose click goes there through the context's `go` (UC-012 step 2, UC-038 7c); opening a mail writes nothing, so it answers any click.
//   - `issue` shows the issue's text and class; an open issue offers *Implement* (<button class="implement-issue">); a closed one is resolved and offers nothing more. Implement, the person's click,
//     dispatches the window's event `agent-m:prompt` with the request: in the product, handle the issue as Agent M's UC-012 does — the class proposed with its reasoning and confirmed by the author, a bug fixed
//     test-first on a branch with a pull request, a change drafted as entries of the SPEC's change queues naming the issue —, followed by the issue's number, title and text. It writes nothing; the person sends
//     or changes the prompt in the bar (UC-049).
//   - The move into the backlog (ITM-1250): a section "Move to backlog" is shown for an open issue whose class is bug or change — by its label —, with the button "Move to backlog" (the person's click). The click reads the product's default branch and draws the
//     item `backlogItemFrom` prefills as a form of the frame's `schemaForm` over the item schema, which hands over its list-valued keys as lists. The form holds a provisional identifier,
//     the next that the paths of the backlog and the plan leave free, which is never written: `saveItems` gives the item the next one that no history holds. The form's one button, "Save", is shown as "Add"; the form offers it only while no error remains, and the findings of `backlogFindings`
//     over the architecture's module files are shown beside the form, found with the backlog's items beside the drafted one and kept for the drafted one alone (ITM-1293). `changed` are the requirements that `entryView`'s impact names as added or changed, in the order of the entries, of the queues whose `**Issue:**` line names this issue and this product. The page holds no
//     analysis: `violated` is null and `modules` none, and the person names in the form the requirement a bug realises and the modules the item changes. Add writes with `moveToBacklog` (no `existing`), and the page then shows the identifier added, and, where the comment was refused for want of the permission or of a token, the comment's text with the issue's address and a button to copy it.
//   - An existing item (ITM-1254, UC-033 4a): the click on Move to backlog also lists, beside the form, the items of the backlog at the default branch (docs/backlog/ITM-<n>-<slug>.md), each with its identifier, its title and the button "Add to <identifier>" (the person's click), which
//     writes with `moveToBacklog` given that identifier as `existing` and shows what Add shows.
//   - The module files, the items of the backlog and the steps of the plan, and their identifiers, are read through MOD-documents (ITM-1298): a path is one of them where `readDocument` gives it an identifier under the module or the item schema,
//     whose path patterns those are. The one folder name kept is the backlog's, `docs/backlog/`, the SPEC's own (THE BACKLOG LIVES IN THE PRODUCT REPOSITORY), which tells the backlog's items from the plan's steps of the same schema.
//   - The item's pull request (ITM-1375, UC-033 step 6): below the move, the newest job of a kind that implements an item — `implement` or `refactor` — whose `works_on` names an item of the backlog that names this issue's address among its origins
//     is named with its pull request (`jobTrail`), as the fix's job is; once that is merged, "Close with links" — the person's click — closes the issue with `closeWithLinks`, naming the pull request and the item. Nothing is shown where no such item or job is.
//   - An issue not classified yet (ITM-1254, UC-033 1a): where the move would stand, the page says that it is not offered because the issue is not classified, and leads to UC-012, step 2 with the button "UC-012, step 2", which goes to that use case through the context's
//     `go`. The use case is Agent M's own, so the lead's `go` names the empty product, which names the instance itself (MOD-site-frame's ViewContext). An issue classified as not reproducible is
//     classified, and the page says nothing of the move for it.
//   - The fix (ITM-583): below Implement, on an open issue whose class is bug by its label, the newest job of the kind `fix-bug` that works on the issue is named with its pull request (`jobTrail`); once that is merged, "Close with links" — the person's
//     click — closes the issue with `closeWithLinks`. Nothing is shown where no such job is.
//   - The fix's changed expectations (ITM-654, UC-012 5a): while that pull request is open, the page reads it with `pullRequestFacts` and, of its files that `isTestFile` names, the text on both sides — two reads per changed test file, through the
//     facts' `read`, the one way the module's Uses name for these texts. An existing test is a declaration (`testDeclarations`) that stands under the same identifier on both sides; its requirement is what it guards on the head side. Each one whose
//     `expect` differs is a row of <table class="fix-expectations">: the test, the requirement, the old expectation, the new one. Without such a test the page says so (<p class="fix-no-expectation">); a merged or closed pull request shows no comparison.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as mail.mjs does).

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { IssueClass, backlogItemFrom, closeWithLinks, moveToBacklog } from "../issue-handling/index.mjs";
import { recordsNewestFirst } from "../job-ledger/index.mjs";
import { issueLabels, listedMailIds } from "../mail-records/index.mjs";
import { jobTrail } from "../runtimes/index.mjs";
import { schemaForm } from "../site-frame/index.mjs";
import { entryView, queues } from "../spec-changes/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { backlogFindings } from "../work-plans/index.mjs";
import { button, el, failed, fold } from "./mail.mjs";
import { heads } from "./routes.mjs";
import { tabsOf } from "./tabs.mjs";

const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const NOT_CLASSIFIED = "not classified";

const STEP_TEXT = {
  list: "The open and closed issues of the chosen product, each with its state and the class its label says. Open one to implement it, or, for an issue from mail, to open its mails.",
  implement: "Implement puts the request to handle this issue into the prompt bar, with its number, title and text; nothing is sent until you send it, and you may change it first. The agent of the conversation proposes the class — a bug, a change or not reproducible — with its reasoning, and you confirm or correct it in the conversation. A bug it fixes on a branch, a regression test first, with invented data, never the reporter's, where its connection can run code and tests; a change it drafts as entries of the SPEC's change queues, each naming this issue, which you accept on their pages. Book: ch. 14, Evolution Processes and Change Identification.",
  move: "Move to backlog prefills a backlog item from this issue: its title and outcome from the issue, its origin the issue's address, what it realises (for a change the requirements the change queues of this issue change or add; for a bug the requirement it violates, which you name) and the modules it changes, which you name. The form names what fails. Add commits the item under docs/backlog/ of the product, adds a comment naming the item to the issue and gives the issue the label backlog. Where no token is stored that may comment, the item is committed all the same and the comment is shown for you to copy. Where the issue describes the work of an item already in the backlog, add it to that item instead: the item then names both issues as its origins, and both get the comment. A change item waits for the acceptance of the requirements it names.",
};

// The classes an issue's labels say (MOD-mail-records).
const LABEL_OF = { [IssueClass.bug]: issueLabels.defect, [IssueClass.change]: issueLabels.change, [IssueClass.notReproducible]: issueLabels.notReproducible };
const classOfLabels = (labels) => Object.values(LABEL_OF).find((label) => labels.includes(label)) ?? NOT_CLASSIFIED;

// The issue's address, which the job's record names it by (MOD-job-ledger: works_on holds an issue's address): GitHub's /issues/<n>, GitLab's /-/issues/<n>.
const issueAddress = (product, number) => `${product.address.replace(/\/$/, "")}${product.kind === "gitlab" ? "/-" : ""}/issues/${number}`;

const noProduct = (className) => el("p", className, "Choose a product to see its issues.");

async function renderList(target, context) {
  const out = el("div", "issues-out");
  target.replaceChildren(tabsOf("issues", context), el("h2", null, "Issues"), out);
  const { product } = context;
  if (!product) { out.append(noProduct("issues-problem")); return; }
  try {
    const all = await product.host.listIssues({ state: "all", comments: false });
    if (all.length === 0) { out.append(el("p", "issues-empty", "This product has no issue."), fold(STEP_TEXT.list)); return; }
    out.append(el("ul", "issue-list", ...all.map((issue) => {
      const anchor = el("a", "issue-link", `#${issue.number} ${issue.title}`);
      anchor.setAttribute("href", `#issue/number=${issue.number}/product=${encodeURIComponent(product.address)}`);
      anchor.addEventListener("click", (event) => { if (event?.isTrusted === true) { event.preventDefault?.(); context.go("issue", { number: String(issue.number) }); } });
      const item = el("li", "issue", anchor, " ", el("span", "issue-state", issue.state === "closed" ? "closed" : "open"), " ", el("span", "issue-class", classOfLabels(issue.labels)));
      item.setAttribute("data-issue", String(issue.number));
      return item;
    })), fold(STEP_TEXT.list));
  } catch (failure) {
    out.append(el("p", "issues-problem", `The issues could not be read: ${failed(failure)}`));
  }
}

// *Implement* (UC-012 step 2): one click puts the request to handle the issue as UC-012 does, with its number, title and text, into the prompt bar (MOD-prompt-bar's event `agent-m:prompt`), where the person sends or
// changes it (UC-049). It writes nothing.
function implementSection(product, issue) {
  const name = product.address.replace(/\/+$/, "").split("/").slice(-2).join("/");
  const request = [`In ${name}: handle issue #${issue.number} as Agent M's UC-012 does. Propose its class — bug, change or not reproducible — with your reasoning, and wait for my confirmation.`,
    "For a bug, write a regression test that fails on the reported behaviour first, with invented data, then fix the code or the test until it passes, on a branch, with a pull request that links the issue and the requirement it restores.",
    "For a change, draft the changed requirements as their new text with an impact list, as entries under docs/spec-freigaben/, each naming the issue.",
    "", `Issue #${issue.number}: ${issue.title}`, String(issue.body ?? "")].join("\n");
  const implement = button("implement-issue", "Implement", () => globalThis.dispatchEvent?.(new CustomEvent("agent-m:prompt", { detail: request })));
  return el("section", "issue-implement", el("p", "actions", implement), fold(STEP_TEXT.implement));
}

// ---------------------------------------------------------------- the move into the backlog (UC-033)

const BACKLOG = "docs/backlog/";
// The identifier a path gives under a schema, read from the path alone: null for a file that is none of the schema's.
const identifierOf = (schema, path) => readDocument(schema, path, "").id;
const slugOf = (title) => String(title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const namesOf = (value) => (Array.isArray(value) ? value.map(String) : String(value ?? "").split(",").map((part) => part.trim()).filter(Boolean));
const sameAddress = (a, b) => String(a).replace(/\/+$/, "") === String(b).replace(/\/+$/, "");

// The requirements that the entries naming this issue of this product add or change, in `entryView`'s impact, in the order of the queues and their entries, once each.
async function changedRequirements(snapshot, number, productAddress) {
  const names = [];
  for (const queue of await queues(snapshot)) {
    for (const entry of queue.entries) {
      if (entry.issue?.number !== number || !sameAddress(entry.issue.product, productAddress)) continue;
      for (const { name, change } of (await entryView(queue.folder, entry.number, snapshot)).impact) if (change !== "withdrawn") names.push(name);
    }
  }
  return [...new Set(names)];
}

// The module files of the architecture at a snapshot, read with the module schema.
const architectureOf = async (snapshot) => Promise.all(snapshot.paths.filter((path) => identifierOf(artifactSchemas().module, path) !== null).sort().map(async (path) => readDocument(artifactSchemas().module, path, (await snapshot.read(path)) ?? "")));


// The items of the backlog at a snapshot, by their number, each with its identifier, its title and its document: those a further issue may be added to (UC-033 4a), and those the drafted item's builds_on is checked against (ITM-1293).
async function backlogItems(snapshot) {
  const schema = artifactSchemas().item;
  const paths = snapshot.paths.filter((path) => path.startsWith(BACKLOG) && identifierOf(schema, path) !== null);
  await snapshot.readMany?.(paths);
  const items = await Promise.all(paths.map(async (path) => {
    const document = readDocument(schema, path, (await snapshot.read(path)) ?? "");
    return { id: identifierOf(schema, path), title: document.fields.title ?? "", document };
  }));
  return items.sort((a, b) => Number(a.id.slice(4)) - Number(b.id.slice(4)));
}

// The comment to copy where the token may not comment: its text, the issue's address, and a button that puts the text on the clipboard.
function commentToCopy(comment) {
  const text = el("pre", "comment-text");
  text.textContent = comment.text;
  const where = el("a", "comment-issue", comment.issue);
  where.setAttribute("href", comment.issue);
  const copy = button("copy-comment", "Copy comment", async () => { try { await globalThis.navigator?.clipboard?.writeText(comment.text); } catch { /* the text stays shown to be selected */ } });
  return el("div", "move-comment", el("p", null, "No stored token may comment on the issue. Copy this comment and add it to ", where, ":"), text, el("p", "actions", copy));
}

// The section that moves the issue into the backlog (UC-033): Move to backlog draws the prefilled item as a form, Add writes it. `current()` is the class the issue has now, read when the person clicks; the page holds no
// analysis, so the item names no violated requirement and no module until the person names them in the form.
// Below it, what the item that names the issue has become, with *Close with links* once its pull request is merged (itemTrail, UC-033 step 6).
async function moveSection({ product, issue, current }) {
  const stage = el("div", "issue-move-stage");
  const address = issueAddress(product, issue.number);

  async function drawForm() {
    stage.replaceChildren();
    try {
      const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
      const architecture = await architectureOf(head);
      const cls = current();
      const changed = cls === IssueClass.change ? await changedRequirements(head, issue.number, product.address) : [];
      const { item } = backlogItemFrom({ ...issue, address }, cls, { violated: null, modules: [] }, changed);
      const schema = artifactSchemas().item;
      const taken = head.paths.map((path) => Number(identifierOf(schema, path)?.slice(4) ?? 0));
      const provisional = `ITM-${String(Math.max(0, ...taken) + 1).padStart(3, "0")}`;
      const path = `${BACKLOG}${provisional}-${slugOf(item.fields.title)}.md`;
      // A list-valued key without a name is left out, so that its field stands empty and the form names it missing.
      const fields = Object.entries({ id: provisional, ...item.fields }).filter(([, value]) => (Array.isArray(value) ? value.length > 0 : value !== ""));
      // The file as the form shows it, each item of a list on a line of its own, read as MOD-documents reads a file: `writeDocument` would refuse it while a required key stands empty.
      const front = fields.map(([key, value]) => (Array.isArray(value) ? [`${key}:`, ...value.map((one) => `  - ${one}`)].join("\n") : `${key}: ${value}`));
      const opened = readDocument(schema, path, [`---\n${front.join("\n")}\n---\n`, `# ${provisional} ${item.fields.title}\n\n`, ...item.sections.map(({ heading, text }) => `${heading}${text}`)].join(""));

      const problems = el("div", "issue-move-problem");
      const added = (done, said) => stage.replaceChildren(el("p", "move-added", said), ...(done.comment ? [commentToCopy(done.comment)] : []));
      const backlog = await backlogItems(head);
      const form = schemaForm(schema, opened, {
        onSave: async (live) => {
          problems.replaceChildren();
          try {
            const { id: _, ...fieldsNow } = live.fields;
            const done = await moveToBacklog(product.host, { number: issue.number, address }, { fields: fieldsNow, sections: live.sections.map(({ heading, text }) => ({ heading, text })) }, null);
            added(done, `Added ${done.item} to the backlog.`);
          } catch (failure) {
            problems.append(el("p", "issue-problem", `The item could not be added: ${failed(failure)}`));
          }
        },
        // The drafted item is checked beside the backlog's items, so that a builds_on naming one of them is no item that does not exist; the marks are those on the drafted item alone (ITM-1293).
        extraChecks: (live) => backlogFindings([...backlog.map(({ document }) => document), live], architecture).filter((one) => one.artifact === (live.id || live.path)),
      });
      // The form's one button is its Save; here it is the person's Add.
      const add = form.children[form.children.length - 1].getElementsByTagName("button")[0];
      if (add) add.textContent = "Add";
      // The items this issue may be added to instead (UC-033 4a): `moveToBacklog` with `existing`, which leaves the prefilled item unused.
      const existing = backlog.map(({ id, title }) => {
        const addTo = button("add-to-existing", `Add to ${id}`, async () => {
          addTo.disabled = true;
          problems.replaceChildren();
          try {
            added(await moveToBacklog(product.host, { number: issue.number, address }, item, id), `Added this issue to ${id}.`);
          } catch (failure) {
            addTo.disabled = false;
            problems.append(el("p", "issue-problem", `The issue could not be added to ${id}: ${failed(failure)}`));
          }
        });
        const entry = el("li", "existing-item", `${id} ${title} `, addTo);
        entry.setAttribute("data-item", id);
        return entry;
      });
      stage.append(form, ...(existing.length ? [el("div", "move-existing", el("p", null, "Or add this issue to an item of the backlog that describes the same work:"), el("ul", "existing-items", ...existing))] : []), problems);
    } catch (problem) {
      stage.replaceChildren(el("p", "issue-problem", failed(problem)));
    }
  }

  return el("section", "issue-move", el("h3", null, "Move to backlog"), fold(STEP_TEXT.move), el("p", "actions", button("move-to-backlog", "Move to backlog", drawForm)), stage, await itemTrail({ product, issue }));
}

// ---------------------------------------------------------------- the fix of a bug (UC-012 step 5, 5b)

// The existing tests whose expected result an open pull request changes (UC-012 5a): of its changed test files, each declaration that stands under the same identifier on both sides with another `expect`, as
// { id, guards, before, after }, `guards` as the head side declares them.
async function changedExpectations(facts) {
  const changed = [];
  for (const { path } of facts.files.filter((file) => isTestFile(file.path))) {
    const [base, head] = await Promise.all([facts.read(path, "base"), facts.read(path, "head")]);
    if (base === null || head === null) continue;
    const before = new Map(testDeclarations(path, base).map((one) => [one.id, one]));
    for (const after of testDeclarations(path, head)) {
      const old = before.get(after.id);
      if (old && old.expect !== after.expect) changed.push({ id: after.id, guards: after.guards, before: old.expect ?? "", after: after.expect ?? "" });
    }
  }
  return changed;
}

// The comparison of an open pull request: one row per test whose expected result it changes — the test, the requirement it now checks, the old and the new expectation side by side.
async function expectationsOf(product, pullRequest) {
  const changed = await changedExpectations(await product.host.pullRequestFacts(pullRequest.number));
  if (changed.length === 0) return el("p", "fix-no-expectation", "The fix changes no expected result of an existing test.");
  const cell = (name, text) => el(name, null, String(text));
  const rows = changed.map(({ id, guards, before, after }) => {
    const row = el("tr", null, cell("td", id), cell("td", guards.join("; ")), cell("td", before), cell("td", after));
    row.setAttribute("data-test", id);
    return row;
  });
  return el("table", "fix-expectations list", el("thead", null, el("tr", null, ...["Test", "Requirement", "Old expectation", "New expectation"].map((head) => cell("th", head)))), el("tbody", null, ...rows));
}

// *Close with links*, the person's click on a merged pull request: the issue closed with `closeWithLinks`, naming the pull request and, for the job of an item, the item (null for a bug fix).
function closeControls({ product, issue, pullRequest, item }) {
  const closed = el("p", "fix-closed");
  const close = button("close-with-links", "Close with links", async () => {
    close.disabled = true;
    try {
      await closeWithLinks(product.host, issue.number, { pullRequest: pullRequest.url, commit: pullRequest.mergeCommit, item });
      closed.textContent = `The issue is closed with ${pullRequest.url}${item ? ` and the item ${item}` : ""}.`;
    } catch (problem) {
      close.disabled = false;
      closed.replaceChildren(el("span", "issue-problem", `The issue could not be closed: ${failed(problem)}`));
    }
  });
  return [el("p", "actions", close), closed];
}

// The kinds of a job that implements an item (AGILE IMPLEMENTATION STARTS FROM THE BACKLOG): its `works_on` names the item.
const IMPLEMENTS_ITEM = ["implement", "refactor"];

// What the item of the issue has become (UC-033 step 6): the newest job of a kind that implements an item, working on an item of the backlog that names the issue among its origins, its pull request
// (MOD-runtimes' jobTrail) and, once that is merged, *Close with links*, the person's click, naming the pull request and the item. Nothing is shown while no item names the issue, or no such job works on one.
async function itemTrail({ product, issue }) {
  const box = el("div", "issue-item-trail");
  try {
    const address = issueAddress(product, issue.number);
    const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
    const items = (await backlogItems(head)).filter(({ document }) => namesOf(document.fields.origin).some((origin) => sameAddress(origin, address))).map(({ id }) => id);
    if (items.length === 0) return box;
    await head.readMany?.(head.paths.filter((path) => JOB_FILE.test(path)));
    let record = null;
    for await (const each of recordsNewestFirst(head)) if (IMPLEMENTS_ITEM.includes(each.kind) && (each.worksOn ?? []).some((id) => items.includes(id))) { record = each; break; }
    if (!record) return box;
    const item = record.worksOn.find((id) => items.includes(id));
    const { pullRequest } = await jobTrail(record, product);
    box.append(el("p", "item-job", `The item ${item} is built by the job ${record.id}.`));
    if (!pullRequest) { box.append(el("p", "item-no-pull-request", "It has opened no pull request yet.")); return box; }
    const where = el("a", "item-pull-request", `pull request #${pullRequest.number}`);
    where.setAttribute("href", pullRequest.url);
    box.append(el("p", "item-pull", where, ` is ${pullRequest.state}.`));
    if (pullRequest.state === "merged") box.append(...closeControls({ product, issue, pullRequest, item }));
  } catch (problem) {
    box.append(el("p", "issue-problem", `The item's job could not be read: ${failed(problem)}`));
  }
  return box;
}

// What the fix has become: the newest job of the kind fix-bug that works on the issue, its pull request (MOD-runtimes' jobTrail: the one of the branch named after the job) and, once that is merged, *Close with links*, the person's click.
async function fixTrail({ product, issue }) {
  const box = el("div", "issue-fix-trail");
  try {
    const address = issueAddress(product, issue.number);
    const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
    let record = null;
    // The records are fetched ahead in as few requests as the server allows; a record is read only when its turn comes.
    await head.readMany?.(head.paths.filter((path) => JOB_FILE.test(path)));
    for await (const each of recordsNewestFirst(head)) if (each.kind === "fix-bug" && (each.worksOn ?? []).includes(address)) { record = each; break; }
    if (!record) return box;
    const { pullRequest } = await jobTrail(record, product);
    box.append(el("p", "fix-job", `The fix is the job ${record.id}.`));
    if (!pullRequest) { box.append(el("p", "fix-no-pull-request", "It has opened no pull request yet.")); return box; }
    const where = el("a", "fix-pull-request", `pull request #${pullRequest.number}`);
    where.setAttribute("href", pullRequest.url);
    box.append(el("p", "fix-pull", where, ` is ${pullRequest.state}.`));
    if (pullRequest.state === "open") box.append(await expectationsOf(product, pullRequest));
    if (pullRequest.state === "merged") box.append(...closeControls({ product, issue, pullRequest, item: null }));
  } catch (problem) {
    box.append(el("p", "issue-problem", `The fix could not be read: ${failed(problem)}`));
  }
  return box;
}

// The mails an issue lists, each named by its identifier as a link to the route `mail/<id>`, where it is opened and, once the issue is closed, answered (UC-012 step 2, UC-038 7c, UC-039).
function mailsOf(issue, product, context) {
  const ids = listedMailIds({ number: issue.number, body: issue.body ?? "", comments: (issue.comments ?? []).map((comment) => ({ body: comment.body, createdAt: comment.date })) });
  if (ids.length === 0) return [];
  return [el("ul", "issue-mails", ...ids.map((id) => {
    const anchor = el("a", "mail-link", id);
    anchor.setAttribute("href", `#mail/id=${encodeURIComponent(id)}/product=${encodeURIComponent(product.address)}`);
    anchor.addEventListener("click", (event) => { event?.preventDefault?.(); context.go("mail", { id }); });
    return el("li", "issue-mail", anchor);
  }))];
}

async function renderIssue(target, context, params = {}) {
  const out = el("div", "issue-out");
  target.replaceChildren(tabsOf("issue", context), el("h2", null, "Issue"), out);
  const { product } = context;
  if (!product) { out.append(noProduct("issue-problem")); return; }
  let issue = null;
  try {
    const number = Number(params.number);
    if (Number.isInteger(number) && number > 0) issue = await product.host.readIssue(number);
  } catch (failure) {
    if (failure?.name !== "NotFound") {
      out.append(el("p", "issue-problem", `The issue could not be read: ${failed(failure)}`));
      return;
    }
  }
  if (!issue) { out.append(el("p", "issue-problem", `Issue ${params.number} is not in this product.`)); return; }

  const text = el("pre", "issue-text");
  text.textContent = issue.body ?? "";
  const closed = issue.state === "closed";
  out.replaceChildren(el("h3", null, `Issue #${issue.number}: ${issue.title}`), el("p", "issue-meta", `${closed ? "Closed" : "Open"} · class: `, el("span", "issue-class", classOfLabels(issue.labels))), text,
    ...mailsOf(issue, product, context));
  if (closed) return;

  const currentClass = () => Object.entries(LABEL_OF).find(([, label]) => issue.labels.includes(label))?.[0];
  // Where an issue is not classified yet, the move is not offered and the page leads to UC-012, step 2 (UC-033 1a), only through the context's go, with the empty product, which names the instance itself.
  function notClassified() {
    const lead = el("button", "uc-012 btn", "UC-012, step 2");
    lead.setAttribute("type", "button");
    lead.addEventListener("click", () => context.go("use-case", { id: "UC-012", product: "" }));
    return el("p", "move-not-offered", "Move to backlog is not offered: this issue is not classified yet as a bug or a change. Implement it, and confirm its class in the conversation — ", lead, ".");
  }
  const cls = currentClass();
  const move = cls === undefined ? notClassified() : cls === IssueClass.bug || cls === IssueClass.change ? await moveSection({ product, issue, current: currentClass }) : null;
  // The fix of a bug is named, with its pull request, where the issue is classified as a bug.
  const fix = cls === IssueClass.bug ? [await fixTrail({ product, issue })] : [];
  out.append(implementSection(product, issue), ...fix, ...(move ? [el("div", "issue-move-box", move)] : []));
}

export const routes = [
  { ...heads.issues, render: renderList },
  { ...heads.issue, render: renderIssue },
];
