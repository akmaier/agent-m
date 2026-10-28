// The routes `issues` and `issue/<number>` — a product's issues, their analysis and the class confirmed, corrected or the issue rejected (UC-012 steps 2 to 4, 3a and 4a), as docs/architecture/MOD-maintenance-pages.md states them and ITM-582 builds
// them: *Analyse* with its run panel and the class proposed with its reasoning; one click confirms the class, corrects it or rejects the issue with a reason, with `confirmClass`. The change of the SPEC (ITM-584) is drafted and saved in a section of the issue's page; the move into the backlog (ITM-1250)
// is another section of it; the fix of a bug is another item's.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them):
//   - The product is the one the frame has chosen (`context.product`); without one the page says so and reads nothing. The routes are `issues` (in the menu entry maintenance) and `issue` (out of the menu), whose parameter `number` is the issue's: `#issue/number=<n>`.
//   - `issues` lists the open issues with the class their label says (defect, change or not-reproducible, else "not classified"); an issue's link goes, on a person's click, to the route `issue` with its number.
//   - `issue` shows the issue's text and class; for an open issue, the analysis and the decision. The participants offered are those of the instance's register that declare draft text, each with its place; the issue holds no mail, so no place is barred.
//     The run panel is that of the kind `analyse-issue` over the issue; Run is the person's click and the job runs in this tab, its start record committed to the product and naming the issue and no text of it. The analysis writes nothing to the issue.
//   - The decision's buttons are "Bug", "Change" and "Not reproducible" before a proposal and "Confirm <class>" for the class proposed and "Correct to <class>" for another after it; a click is the person's or does nothing. A class needs no analysis first.
//     "Reject issue" is disabled while the reason is blank. After a rejection the issue is closed, and the page offers neither analysis nor decision. A failure names itself, nothing is half done, and the controls stay.
//   - The change (ITM-584): a section "Change" is shown for an issue whose class is change — by its label, or by the person's click on Change —, built as the analysis is (`runSection`) over the kind `change-requirements`, whose parameters are `issue` and `source`, the
//     latter the identifier `personSource` gives over the product's links and the instance's register; without one the precondition `person-source` blocks the run panel, which lists its steps. The candidates are listed with their class; Save, the person's click, writes
//     them with the kind's writer through `writeResult`, as the person left them (the classes the loop gave; a conflict is not composed).
//   - The move into the backlog (ITM-1250): a section "Move to backlog" is shown for an open issue whose class is bug or change — by its label, or by the person's click on a class —, with the button "Move to backlog" (the person's click). The click reads the product's default branch and draws the
//     item `backlogItemFrom` prefills as a form of the frame's `schemaForm` over the item schema, whose list-valued keys the form cannot hand over as lists, so that the form's schema types them as one text, the names separated by commas, and the page reads them back as lists. The form holds a provisional identifier,
//     the next that the paths of the backlog and the plan leave free, which is never written: `saveItems` gives the item the next one that no history holds. The form's one button, "Save", is shown as "Add"; the form offers it only while no error remains, and the findings of `backlogFindings`
//     over the architecture's module files are shown beside the form. `changed` are the requirements that `entryView`'s impact names as added or changed, in the order of the entries, of the queues whose `**Issue:**` line names this issue and this product; the analysis is the page's proposal, if the person ran one:
//     the answer of the kind `analyse-issue` holds a class, its reasoning and the files it names as wrong, and no violated requirement, so that `violated` is null and the person names the requirement a bug realises; its `modules` are the modules of the architecture whose folder holds a file it names as
//     wrong, none without a proposal. Add writes with `moveToBacklog` (no `existing`: an item that takes a second issue is another item's), and the page then shows the identifier added, and, where the comment was refused for want of the permission, the comment's text with the issue's address and a button to copy it.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as mail.mjs does).

import { artifactSchemas, documentFindings, loadSchema, readDocument, readRegister } from "../documents/index.mjs";
import { IssueClass, backlogItemFrom, confirmClass, moveToBacklog } from "../issue-handling/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob, writeResult } from "../job-runner/index.mjs";
import { issueLabels } from "../mail-records/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { personAccount, personSource, sourceSchemas } from "../source-register/index.mjs";
import { queueJob, runOnTab } from "../runtimes/index.mjs";
import { runPanel, schemaForm } from "../site-frame/index.mjs";
import { entryView, queues } from "../spec-changes/index.mjs";
import { backlogFindings } from "../work-plans/index.mjs";
import { button, connectionsOf, el, failed, fold } from "./mail.mjs";

const REGISTER = "docs/participants.md";
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const NOT_CLASSIFIED = "not classified";

const STEP_TEXT = {
  list: "The open issues of the chosen product, with the class their label says. Open one to analyse it and to decide its class.",
  analyse: "Analyse asks the participant you choose for the class of this issue — a bug, a change or not reproducible — with its reasoning. The panel states where the participant processes data and exactly what it receives: the issue and the requirements, use cases, tests and modules it names, or the whole SPEC where it names none. The analysis writes nothing to the issue. Book: ch. 14, Evolution Processes and Change Identification.",
  change: "Draft change asks the participant you choose for the changed requirements this issue asks for, against every requirement of the product. The panel states where the participant processes data and exactly what it receives: the issue with what it names, the requirements, the open queues and the chapters of the book. The change is drafted in your own name: the job needs your own source, the register entry of your account that the product links. Save writes the candidates as a change queue under docs/spec-freigaben/ that names this issue; nothing is written before it. A conflict is not written until a person has decided it.",
  move: "Move to backlog prefills a backlog item from this issue: its title and outcome from the issue, its origin the issue's address, what it realises (for a bug the requirement the analysis names as violated, for a change the requirements the change queues of this issue change or add) and the modules it changes, which you confirm or correct. The form names what fails. Add commits the item under docs/backlog/ of the product, adds a comment naming the item to the issue and gives the issue the label backlog. Where the token may not comment, the item is committed all the same and the comment is shown for you to copy. A change item waits for the acceptance of the requirements it names.",
  decide: "One click decides. A class sets the label defect, change or not-reproducible on the issue and removes the other two. Reject issue closes the issue with the reason you give and changes nothing else. A requirement that is missing is a change, not a bug.",
};

// The classes a person may set, with the name they are shown by and the button's plain text; the label that records each class (MOD-mail-records) and the class an issue's labels say.
const CLASSES = [[IssueClass.bug, "bug", "Bug"], [IssueClass.change, "change", "Change"], [IssueClass.notReproducible, "not reproducible", "Not reproducible"]];
const nameOf = (cls) => CLASSES.find(([value]) => value === cls)?.[1] ?? cls;
const LABEL_OF = { [IssueClass.bug]: issueLabels.defect, [IssueClass.change]: issueLabels.change, [IssueClass.notReproducible]: issueLabels.notReproducible };
const classOfLabels = (labels) => Object.values(LABEL_OF).find((label) => labels.includes(label)) ?? NOT_CLASSIFIED;

// The issue's address, which the job's record names it by (MOD-job-ledger: works_on holds an issue's address): GitHub's /issues/<n>, GitLab's /-/issues/<n>.
const issueAddress = (product, number) => `${product.address.replace(/\/$/, "")}${product.kind === "gitlab" ? "/-" : ""}/issues/${number}`;

const noProduct = (className) => el("p", className, "Choose a product to see its issues.");

async function renderList(target, context) {
  const out = el("div", "issues-out");
  target.replaceChildren(el("h2", null, "Issues"), out);
  const { product } = context;
  if (!product) { out.append(noProduct("issues-problem")); return; }
  try {
    const open = await product.host.listIssues({ state: "open" });
    if (open.length === 0) { out.append(el("p", "issues-empty", "This product has no open issue."), fold(STEP_TEXT.list)); return; }
    out.append(el("ul", "issue-list", ...open.map((issue) => {
      const anchor = el("a", "issue-link", `#${issue.number} ${issue.title}`);
      anchor.setAttribute("href", `#issue/number=${issue.number}/product=${encodeURIComponent(product.address)}`);
      anchor.addEventListener("click", (event) => { if (event?.isTrusted === true) { event.preventDefault?.(); context.go("issue", { number: String(issue.number) }); } });
      const item = el("li", "issue", anchor, " ", el("span", "issue-class", classOfLabels(issue.labels)));
      item.setAttribute("data-issue", String(issue.number));
      return item;
    })), fold(STEP_TEXT.list));
  } catch (failure) {
    out.append(el("p", "issues-problem", `The issues could not be read: ${failed(failure)}`));
  }
}

// The person's own source: the register entry of the instance's author that the product links (MOD-source-register's personSource over the product's links file and the instance's register), or null.
async function ownSource(product, instanceSnapshot) {
  try {
    const { entry, links } = sourceSchemas();
    const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
    const linked = readDocument(links, "docs/sources.md", (await head.read("docs/sources.md")) ?? "");
    const register = await Promise.all(instanceSnapshot.paths.filter((path) => /^docs\/sources\/SRC-[^/]+\.md$/.test(path))
      .map(async (path) => readDocument(entry, path, (await instanceSnapshot.read(path)) ?? "")));
    return personSource(linked, register, personAccount(instanceSnapshot));
  } catch {
    return null;
  }
}

// A job of `kindName` over the issue, started from a section of the page: the participants that can draft text with their places, the name of the person, the run panel and Run. `names` are the class names of the section's parts;
// `paramsOf(instanceSnapshot)` the job's parameters beyond the issue; `onResult(outcome, run)` is called with what the job returned and what it was run with. The job runs in this tab, attended where its kind says so.
async function runSection({ context, product, issue, kindName, title, text, names, paramsOf = async () => ({}), onResult, failure }) {
  const section = el("section", names.section, el("h3", null, title), fold(text));
  try {
    const definition = await kindOf(kindName);
    const instanceHost = context.instance.host;
    const instanceSnapshot = await instanceHost.readSnapshot((await instanceHost.repositoryInfo()).defaultBranch);
    const register = await instanceSnapshot.read(REGISTER);
    const participants = register == null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, register).document);
    const admitted = eligible(participants, { capabilities: definition.needs }).eligible;
    if (admitted.length === 0) { section.append(el("p", "issue-no-participant", "No participant that can draft text is listed in the instance's participants.")); return section; }

    const radios = admitted.map((participant) => {
      const radio = el("input", names.participant);
      radio.setAttribute("type", "radio");
      radio.setAttribute("name", names.participant);
      radio.value = participant.name;
      const item = el("li", "issue-participant", el("label", null, radio, ` ${participant.name} `), el("span", "place", participant.place ?? "no processing place declared"));
      item.setAttribute("data-participant", participant.name);
      return { radio, item, participant };
    });
    const person = el("input", names.person);
    person.setAttribute("placeholder", "Your name");
    const stage = el("div", "issue-stage");

    async function refresh() {
      stage.replaceChildren();
      const chosen = radios.find((each) => each.radio.checked === true)?.participant;
      const name = String(person.value ?? "").trim();
      if (!chosen || !name) { stage.append(el("p", "muted", "Choose a participant and enter your name to see the run panel.")); return; }
      try {
        const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
        const now = new Date();
        const id = newJobId(now, new Set(head.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean)));
        const agentM = { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" };
        const params = { issue: issue.number, ...(await paramsOf(instanceSnapshot)) };
        const jobContext = { kind: definition, params, product: { address: product.address, snapshot: head, host: product.host },
          instance: { snapshot: instanceSnapshot, host: instanceHost, checkout: null }, connect: async () => product.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: name, now, agentM, jobId: id };
        const prepared = await prepareJob(kindName, jobContext, { drafter: chosen, reviewers: [] });
        const result = el("div", "issue-run-result");
        stage.append(runPanel(prepared, { onRun: async () => {
          try {
            const record = { id, kind: kindName, worksOn: [issueAddress(product, issue.number)], participant: chosen.name, model: chosen.model, route: "tab", run: null, retries: null, startedBy: name, start: now, agentM,
              inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params };
            const { path } = await queueJob(product.host, record, { kind: "tab" }, head.commit);
            const outcome = await runOnTab(prepared, jobContext, connectionsOf(chosen, context.store), { host: product.host, record: { ...record, path } });
            await onResult(outcome, { stage, result, prepared, jobContext, chosen });
          } catch (problem) {
            result.replaceChildren(el("p", "issue-problem", `${failure}: ${failed(problem)}`));
          }
        } }), result);
      } catch (problem) {
        stage.append(el("p", "issue-problem", failed(problem)));
      }
    }
    for (const input of [...radios.map((each) => each.radio), person]) input.addEventListener("change", refresh);
    person.addEventListener("input", refresh);
    section.append(el("ul", "issue-participants", ...radios.map((each) => each.item)), el("label", null, "Your name ", person), stage);
  } catch (problem) {
    section.append(el("p", "issue-problem", failed(problem)));
  }
  return section;
}

// The analysis: the class the participant proposes. `onProposal` is called with the draft the participant returned.
function analysisSection({ context, product, issue, onProposal }) {
  return runSection({ context, product, issue, kindName: "analyse-issue", title: "Analyse", text: STEP_TEXT.analyse, failure: "The issue could not be analysed",
    names: { section: "issue-analysis", participant: "participant", person: "person" },
    onResult: async (outcome, { stage, result, chosen }) => {
      const draft = outcome.written?.shown ?? null;
      if (!draft) { result.replaceChildren(el("p", "issue-problem", "The participant's answer could not be used as a class. Nothing was written.")); return; }
      stage.replaceChildren(el("p", "issue-analysed", `Analysed by ${chosen.name}.`));
      onProposal(draft);
    } });
}

// The change of requirements the issue asks for (UC-012 step 6): the job of `change-requirements` given the issue's number and the person's own source, run attended; its candidates by class, and Save, which writes them as a change queue naming the issue
// through the kind's writer on the draft as it stands. Without a source the precondition `person-source` keeps the job from starting, and the run panel lists its steps.
function changeSection({ context, product, issue }) {
  return runSection({ context, product, issue, kindName: "change-requirements", title: "Change", text: STEP_TEXT.change, failure: "The change could not be drafted",
    names: { section: "issue-change", participant: "change-participant", person: "change-person" },
    paramsOf: async (instanceSnapshot) => { const source = await ownSource(product, instanceSnapshot); return source === null ? {} : { source }; },
    onResult: async (outcome, { stage, result, prepared, jobContext }) => {
      const candidates = Array.isArray(outcome.draft?.candidates) ? outcome.draft.candidates : [];
      const classOf = (candidate) => outcome.classes?.find((each) => each.refs?.includes(candidate.name))?.class ?? candidate.class;
      const items = candidates.map((candidate) => {
        const item = el("li", "candidate", el("strong", null, candidate.name), ` (${classOf(candidate)}) `, candidate.rule);
        item.setAttribute("data-class", classOf(candidate));
        item.setAttribute("data-name", candidate.name);
        return item;
      });
      const saved = el("div", "change-result");
      const save = button("save-change", "Save", async () => {
        save.disabled = true;
        saved.replaceChildren();
        try {
          const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
          const written = await writeResult(prepared, outcome.draft, { result: outcome, context: { ...jobContext, product: { ...jobContext.product, snapshot: head } } });
          saved.append(el("p", "change-saved", written.files?.length ? `Saved: ${written.files.join(", ")}` : "Nothing changed."),
            ...(written.notes?.length ? [el("ul", "change-notes", ...written.notes.map((note) => el("li", "note", note)))] : []));
        } catch (problem) {
          save.disabled = false;
          saved.append(el("p", "issue-problem", `The change could not be saved: ${failed(problem)}`));
        }
      });
      stage.replaceChildren(el("p", "issue-drafted", `Drafted by ${prepared.drafter.name}; rounds: ${outcome.rounds?.length ?? 0}. Conflicts are not written until a person has decided them.`),
        el("ul", "candidates", ...items), el("p", "actions", save), saved);
      result.replaceChildren();
    } });
}

// ---------------------------------------------------------------- the move into the backlog (UC-033)

const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;
const ITEM_FILE = /(?:^|\/)(ITM-\d{3,})-[^/]*\.md$/;
const LIST_KEYS = new Set(["realises", "modules", "tests", "origin", "builds_on", "built_by"]);
const LIST_FINDING = new RegExp(`^the key (${[...LIST_KEYS].join("|")}) does not fit`);
const slugOf = (title) => String(title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const namesOf = (value) => (Array.isArray(value) ? value.map(String) : String(value ?? "").split(",").map((part) => part.trim()).filter(Boolean));
const sameAddress = (a, b) => String(a).replace(/\/+$/, "") === String(b).replace(/\/+$/, "");

// The item schema with its list-valued keys typed as text, which `schemaForm` can hand over (it hands over the text typed), built once.
let textual = null;
function formSchema() {
  if (textual === null) {
    const real = artifactSchemas().item;
    const frontMatter = Object.fromEntries(Object.entries(real.frontMatter).map(([key, spec]) => [key, spec.type === "list" ? { type: "text", required: spec.required === true } : spec]));
    textual = loadSchema(["```json", JSON.stringify({ ...real, frontMatter }), "```"].join("\n"), "MOD-maintenance-pages");
  }
  return textual;
}

// The requirements that the entries of the queues naming this issue of this product add or change, in `entryView`'s impact, in the order of the entries, once each.
async function changedRequirements(snapshot, number, productAddress) {
  const names = [];
  for (const queue of await queues(snapshot)) {
    if (queue.issue?.number !== number || !sameAddress(queue.issue.product, productAddress)) continue;
    for (const entry of queue.entries) for (const { name, change } of (await entryView(queue.folder, entry.number, snapshot)).impact) if (change !== "withdrawn") names.push(name);
  }
  return [...new Set(names)];
}

// What the participant's analysis names: the modules whose folder holds a file it names as wrong, none without a proposal. The answer of `analyse-issue` names no violated requirement, so there is none.
function analysisOf(architecture, proposal) {
  const wrong = Array.isArray(proposal?.wrong) ? proposal.wrong.map(String) : [];
  const modules = architecture.filter((one) => typeof one.fields.folder === "string" && wrong.some((file) => file.startsWith(one.fields.folder.replace(/\/?$/, "/")))).map((one) => one.id);
  return { violated: null, modules };
}

// The comment to copy where the token may not comment: its text, the issue's address, and a button that puts the text on the clipboard.
function commentToCopy(comment) {
  const text = el("pre", "comment-text");
  text.textContent = comment.text;
  const where = el("a", "comment-issue", comment.issue);
  where.setAttribute("href", comment.issue);
  const copy = button("copy-comment", "Copy comment", async () => { try { await globalThis.navigator?.clipboard?.writeText(comment.text); } catch { /* the text stays shown to be selected */ } });
  return el("div", "move-comment", el("p", null, "The token may not comment on the issue. Copy this comment and add it to ", where, ":"), text, el("p", "actions", copy));
}

// The section that moves the issue into the backlog (UC-033): Move to backlog draws the prefilled item as a form, Add writes it. `current()` is the class the issue has now and `proposal()` the participant's proposal, if any, both read when the person clicks.
function moveSection({ product, issue, current, proposal }) {
  const stage = el("div", "issue-move-stage");
  const address = issueAddress(product, issue.number);

  async function drawForm() {
    stage.replaceChildren();
    try {
      const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
      const schemas = artifactSchemas();
      const architecture = await Promise.all(head.paths.filter((path) => MODULE_FILE.test(path)).sort().map(async (path) => readDocument(schemas.module, path, (await head.read(path)) ?? "")));
      const cls = current();
      const changed = cls === IssueClass.change ? await changedRequirements(head, issue.number, product.address) : [];
      const { item } = backlogItemFrom({ ...issue, address }, cls, analysisOf(architecture, proposal()), changed);
      const taken = head.paths.map((path) => Number(ITEM_FILE.exec(path)?.[1].slice(4) ?? 0));
      const provisional = `ITM-${String(Math.max(0, ...taken) + 1).padStart(3, "0")}`;
      const schema = formSchema();
      const path = `docs/backlog/${provisional}-${slugOf(item.fields.title)}.md`;
      // A list-valued key without a name is left out, so that its field stands empty and the form names it missing.
      const fields = Object.fromEntries(Object.entries({ id: provisional, ...item.fields }).map(([key, value]) => [key, LIST_KEYS.has(key) ? namesOf(value).join(", ") : value]).filter(([, value]) => value !== ""));
      // The file as the form shows it, read as MOD-documents reads a file: `writeDocument` would refuse it while a required key stands empty.
      const front = Object.entries(fields).map(([key, value]) => `${key}: ${value}`);
      const opened = readDocument(schema, path, [`---\n${front.join("\n")}\n---\n`, `# ${provisional} ${item.fields.title}\n\n`, ...item.sections.map(({ heading, text }) => `${heading}${text}`)].join(""));

      // The document with its list-valued keys as lists again, for the checks of the item schema and of the backlog and for `moveToBacklog`.
      const listed = (live) => ({ ...live, fields: Object.fromEntries(Object.entries(live.fields).map(([key, value]) => [key, LIST_KEYS.has(key) ? namesOf(value) : value])) });
      const problems = el("div", "issue-move-problem");
      const form = schemaForm(schema, opened, {
        onSave: async (live) => {
          problems.replaceChildren();
          try {
            const { id: _, ...fieldsNow } = listed(live).fields;
            const done = await moveToBacklog(product.host, { number: issue.number, address }, { fields: fieldsNow, sections: live.sections.map(({ heading, text }) => ({ heading, text })) }, null);
            stage.replaceChildren(el("p", "move-added", `Added ${done.item} to the backlog.`), ...(done.comment ? [commentToCopy(done.comment)] : []));
          } catch (failure) {
            problems.append(el("p", "issue-problem", `The item could not be added: ${failed(failure)}`));
          }
        },
        extraChecks: (live) => {
          try {
            const now = listed(live);
            return [...documentFindings(schemas.item, now).filter((each) => LIST_FINDING.test(each.what)), ...backlogFindings([now], architecture)].map((each) => ({ ...each, line: 1 }));
          } catch {
            return [];
          }
        },
      });
      // The form's one button is its Save; here it is the person's Add.
      const add = form.children[form.children.length - 1].getElementsByTagName("button")[0];
      if (add) add.textContent = "Add";
      stage.append(form, problems);
    } catch (problem) {
      stage.replaceChildren(el("p", "issue-problem", failed(problem)));
    }
  }

  return el("section", "issue-move", el("h3", null, "Move to backlog"), fold(STEP_TEXT.move), el("p", "actions", button("move-to-backlog", "Move to backlog", drawForm)), stage);
}

// The class proposed, with its reasoning and the files it names as wrong.
function proposalSection(draft) {
  const wrong = Array.isArray(draft.wrong) ? draft.wrong : [];
  return el("section", "issue-proposal", el("h3", null, "Proposed class"), el("p", "proposed-class", `The participant proposes: ${nameOf(draft.class)}`), el("p", "proposed-reasoning", String(draft.reasoning ?? "")),
    ...(wrong.length ? [el("ul", "proposed-wrongs", ...wrong.map((file) => el("li", "proposed-wrong", String(file))))] : []));
}

async function renderIssue(target, context, params = {}) {
  const out = el("div", "issue-out");
  target.replaceChildren(el("h2", null, "Issue"), out);
  const { product } = context;
  if (!product) { out.append(noProduct("issue-problem")); return; }
  let issue;
  try {
    issue = (await product.host.listIssues({ state: "all" })).find((each) => String(each.number) === String(params.number));
  } catch (failure) {
    out.append(el("p", "issue-problem", `The issue could not be read: ${failed(failure)}`));
    return;
  }
  if (!issue) { out.append(el("p", "issue-problem", `Issue ${params.number} is not in this product.`)); return; }

  const classSpan = el("span", "issue-class", classOfLabels(issue.labels));
  const text = el("pre", "issue-text");
  text.textContent = issue.body ?? "";
  const shown = (closed) => [el("h3", null, `Issue #${issue.number}: ${issue.title}`), el("p", "issue-meta", `${closed ? "Closed" : "Open"} · class: `, classSpan), text];
  out.replaceChildren(...shown(issue.state === "closed"));
  if (issue.state === "closed") return;

  const state = { proposal: null, outcome: null, problem: null, reason: "" };
  const proposalBox = el("div", "issue-proposal-box");
  const decision = el("section", "issue-decision");
  // The change section is built once and shown while the issue's class is change: by its label, or by the person's click on a class.
  const changeBox = el("div", "issue-change-box");
  let change = null;
  const currentClass = () => state.outcome?.cls ?? Object.entries(LABEL_OF).find(([, label]) => issue.labels.includes(label))?.[0];
  async function drawChange() {
    if (currentClass() !== IssueClass.change) { changeBox.replaceChildren(); return; }
    change ??= changeSection({ context, product, issue });
    changeBox.replaceChildren(await change);
  }
  // The move section is built once, and shown while the issue's class is bug or change.
  const moveBox = el("div", "issue-move-box");
  let move = null;
  function drawMove() {
    const cls = currentClass();
    if (cls !== IssueClass.bug && cls !== IssueClass.change) { moveBox.replaceChildren(); return; }
    move ??= moveSection({ product, issue, current: currentClass, proposal: () => state.proposal });
    moveBox.replaceChildren(move);
  }

  // What a click on a class said: confirmed, corrected or, with no proposal, set.
  function classifiedLine({ cls, how }) {
    const said = how === "confirmed" ? `Confirmed as ${nameOf(cls)}.` : how === "corrected" ? `Corrected to ${nameOf(cls)}; the participant proposed ${nameOf(state.proposal.class)}.` : `Set as ${nameOf(cls)}.`;
    const line = el("p", "issue-classified", said);
    line.setAttribute("data-class", cls);
    line.setAttribute("data-how", how);
    return line;
  }

  function drawDecision() {
    const controls = [];
    // A click: its controls are off while it runs, its failure is shown and changes nothing more, and the decision is drawn again.
    async function settle(run) {
      for (const node of controls) node.disabled = true;
      state.problem = null;
      try { await run(); } catch (failure) { state.problem = failed(failure); }
      if (!state.outcome?.rejected) { drawDecision(); await drawChange(); drawMove(); }
    }
    const classButtons = CLASSES.map(([cls, name, plain]) => {
      const label = state.proposal === null ? plain : cls === state.proposal.class ? `Confirm ${name}` : `Correct to ${name}`;
      const node = button("set-class", label, () => settle(async () => {
        await confirmClass(product.host, issue.number, cls, null);
        state.outcome = { cls, how: state.proposal === null ? "set" : cls === state.proposal.class ? "confirmed" : "corrected" };
        classSpan.textContent = LABEL_OF[cls];
      }));
      node.setAttribute("data-class", cls);
      controls.push(node);
      return node;
    });
    const reason = el("input", "reject-reason");
    reason.setAttribute("placeholder", "Reason");
    reason.value = state.reason;
    const reject = button("reject", "Reject issue", () => {
      const given = state.reason.trim();
      return settle(async () => {
        await confirmClass(product.host, issue.number, IssueClass.rejected, given);
        state.outcome = { rejected: true };
        out.replaceChildren(...shown(true), el("p", "issue-rejected", `The issue is closed with the reason: ${given}`));
      });
    });
    reject.disabled = state.reason.trim() === "";
    reason.addEventListener("input", () => { state.reason = String(reason.value ?? ""); reject.disabled = state.reason.trim() === ""; });
    controls.push(reject);

    const message = state.problem !== null ? [el("p", "issue-problem", state.problem)] : state.outcome ? [classifiedLine(state.outcome)] : [];
    decision.replaceChildren(el("h3", null, "Decide"), ...message, el("p", "issue-classes", ...classButtons.flatMap((node) => [node, " "])),
      el("p", "issue-reject", el("label", null, "Reason to reject ", reason), " ", reject), fold(STEP_TEXT.decide));
  }

  const analysis = await analysisSection({ context, product, issue, onProposal: (draft) => { state.proposal = draft; proposalBox.replaceChildren(proposalSection(draft)); drawDecision(); } });
  drawDecision();
  out.append(analysis, proposalBox, decision, changeBox, moveBox);
  await drawChange();
  drawMove();
}

export const routes = [
  { name: "issues", entry: "maintenance", title: "Issues", render: renderList },
  { name: "issue", entry: null, title: "Issue", render: renderIssue },
];
