// The routes `issues` and `issue/<number>` — a product's issues, their analysis and the class confirmed, corrected or the issue rejected (UC-012 steps 2 to 4, 3a and 4a), as docs/architecture/MOD-maintenance-pages.md states them and ITM-582 builds
// them: *Analyse* with its run panel and the class proposed with its reasoning; one click confirms the class, corrects it or rejects the issue with a reason, with `confirmClass`. The change of the SPEC (ITM-584) is drafted and saved in a section of the issue's page; the move into the backlog (ITM-1250)
// is another section of it; the fix of a bug (ITM-583) is a third.
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
//     wrong, none without a proposal. Add writes with `moveToBacklog` (no `existing`), and the page then shows the identifier added, and, where the comment was refused for want of the permission or of a token, the comment's text with the issue's address and a button to copy it.
//   - An existing item (ITM-1254, UC-033 4a): the click on Move to backlog also lists, beside the form, the items of the backlog at the default branch (docs/backlog/ITM-<n>-<slug>.md), each with its identifier, its title and the button "Add to <identifier>" (the person's click), which
//     writes with `moveToBacklog` given that identifier as `existing` and shows what Add shows.
//   - An issue not classified yet (ITM-1254, UC-033 1a): where the move would stand, the page says that it is not offered because the issue is not classified, and leads to UC-012, step 2 with the button "UC-012, step 2", which goes to that use case through the context's
//     `go`, as the fix leads to UC-017. An issue classified as not reproducible is classified, and the page says nothing of the move for it.
//   - The fix (ITM-583): a section "Fix" is shown for an open issue whose class is bug — by its label, or by the person's click on Bug —, built as the analysis is (`runSection`) over the kind `fix-bug`, whose participants are those of the register that declare what the kind needs
//     (write to the repository, run code and tests). Without one the section says so and a button UC-017 leads to that use case (UC-012 5b). The job's parameters are `issue`; `violated`, the requirement the person names in <input class="fix-requirement"> (left out when blank); `wrong`, the
//     files the analysis proposed as wrong; `modules`, those of <input class="fix-modules">, which holds the modules whose folder holds a file the analysis names as wrong when the section is drawn, and which the person corrects; and `route`, the participant's route as the record writes
//     it, which the recipe `resource-pins` reads. Run is the person's click and queues the job on the first route `routesFor` offers the participant, over the routes that reach the product's resources: it commits the job's start record and runs nothing in the tab; a route that is not
//     available is named with its reason and nothing is written. After the section, the newest job of the kind `fix-bug` that works on the issue is named with its pull request (`jobTrail`); once that is merged, "Close with links" — the person's click — closes the issue with `closeWithLinks`.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as mail.mjs does).

import { artifactSchemas, documentFindings, loadSchema, readDocument, readRegister } from "../documents/index.mjs";
import { IssueClass, backlogItemFrom, closeWithLinks, confirmClass, moveToBacklog } from "../issue-handling/index.mjs";
import { newJobId, recordsNewestFirst } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob, writeResult } from "../job-runner/index.mjs";
import { issueLabels } from "../mail-records/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { personAccount, personSource, sourceSchemas } from "../source-register/index.mjs";
import { jobTrail, queueJob, routesFor, runOnTab } from "../runtimes/index.mjs";
import { reachableBy, resourceSchema } from "../resource-list/index.mjs";
import { recordRoute } from "../prompt-bar/hand-over.mjs";
import { runPanel, schemaForm } from "../site-frame/index.mjs";
import { entryView, queues } from "../spec-changes/index.mjs";
import { backlogFindings } from "../work-plans/index.mjs";
import { button, connectionsOf, el, failed, fold } from "./mail.mjs";

const REGISTER = "docs/participants.md";
const RESOURCES = "docs/resources.md";
const WORKFLOWS = [".github/workflows/agent-m-jobs.yml", ".gitlab/agent-m-jobs.yml"];
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const NOT_CLASSIFIED = "not classified";

const STEP_TEXT = {
  list: "The open issues of the chosen product, with the class their label says. Open one to analyse it and to decide its class.",
  analyse: "Analyse asks the participant you choose for the class of this issue — a bug, a change or not reproducible — with its reasoning. The panel states where the participant processes data and exactly what it receives: the issue and the requirements, use cases, tests and modules it names, or the whole SPEC where it names none. The analysis writes nothing to the issue. Book: ch. 14, Evolution Processes and Change Identification.",
  change: "Draft change asks the participant you choose for the changed requirements this issue asks for, against every requirement of the product. The panel states where the participant processes data and exactly what it receives: the issue with what it names, the requirements, the open queues and the chapters of the book. The change is drafted in your own name: the job needs your own source, the register entry of your account that the product links. Save writes the candidates as a change queue under docs/spec-freigaben/ that names this issue; nothing is written before it. A conflict is not written until a person has decided it.",
  move: "Move to backlog prefills a backlog item from this issue: its title and outcome from the issue, its origin the issue's address, what it realises (for a bug the requirement the analysis names as violated, for a change the requirements the change queues of this issue change or add) and the modules it changes, which you confirm or correct. The form names what fails. Add commits the item under docs/backlog/ of the product, adds a comment naming the item to the issue and gives the issue the label backlog. Where no token is stored that may comment, the item is committed all the same and the comment is shown for you to copy. Where the issue describes the work of an item already in the backlog, add it to that item instead: the item then names both issues as its origins, and both get the comment. A change item waits for the acceptance of the requirements it names.",
  fix: "Fix hands a confirmed bug to a participant that can run code and tests: a coding agent in CI, on a Bridge or in a sandbox. A model endpoint can analyse an issue but cannot fix it. Run queues the job on the participant's route; the panel states where the participant processes data and exactly what it receives: the issue and what it names, the analysis you confirmed, the code and tests of the modules you name, and the instruction to write a regression test first, with invented data, never the reporter's. The job works on a branch of its own and opens a pull request that links the issue and the requirement it restores; the pull request is merged once the Definition of Done holds, and the issue is then closed with a link to it. Book: ch. 13, Software Testing in the Age of Coding Agents.",
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
// `paramsOf(instanceSnapshot, { chosen, participants, head, offer })` the job's parameters beyond the issue; `onResult(outcome, run)` is called with what the job returned and what it was run with. The job runs in this tab, attended where its kind says so.
// With `route(chosen, participants, head)`, which gives the chosen participant's offer of a route (MOD-runtimes' routesFor) or null, the job is instead queued on that route — Run commits its start record, as the kind of a participant that works in a checkout is started —
// and `onResult` is not called. `none` draws what stands where no participant is eligible; `extras` are inputs of the section beside the name, each { input, label }, whose change draws the run panel again.
async function runSection({ context, product, issue, kindName, title, text, names, paramsOf = async () => ({}), onResult, failure, route = null, extras = [],
  none = () => el("p", "issue-no-participant", "No participant that can draft text is listed in the instance's participants.") }) {
  const section = el("section", names.section, el("h3", null, title), fold(text));
  try {
    const definition = await kindOf(kindName);
    const instanceHost = context.instance.host;
    const instanceSnapshot = await instanceHost.readSnapshot((await instanceHost.repositoryInfo()).defaultBranch);
    const register = await instanceSnapshot.read(REGISTER);
    const participants = register == null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, register).document);
    const admitted = eligible(participants, { capabilities: definition.needs }).eligible;
    if (admitted.length === 0) { section.append(none()); return section; }

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
        const offer = route ? await route(chosen, participants, head) : null;
        const params = { issue: issue.number, ...(await paramsOf(instanceSnapshot, { chosen, participants, head, offer })) };
        const jobContext = { kind: definition, params, product: { address: product.address, snapshot: head, host: product.host },
          instance: { snapshot: instanceSnapshot, host: instanceHost, checkout: null }, connect: async () => product.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: name, now, agentM, jobId: id };
        const prepared = await prepareJob(kindName, jobContext, { drafter: chosen, reviewers: [] });
        const result = el("div", "issue-run-result");
        stage.append(runPanel(prepared, { onRun: async () => {
          try {
            if (route && (!offer || !offer.available)) throw Object.assign(new Error(offer ? offer.reason : "the participant has no route a job can take"), { name: "RouteUnavailable" });
            const record = { id, kind: kindName, worksOn: [issueAddress(product, issue.number)], participant: chosen.name, model: chosen.model, route: route ? recordRoute(offer.route) : "tab", run: null, retries: null, startedBy: name, start: now, agentM,
              inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params };
            if (route) {
              const queued = await queueJob(product.host, record, offer.route, head.commit, connectionsOf(chosen, context.store).bridges[offer.route.bridge]);
              result.replaceChildren(el("p", "job-queued", `Job ${id} (${queued.path}) is queued on the route ${recordRoute(offer.route)}.`));
              return;
            }
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
    for (const input of [...radios.map((each) => each.radio), person, ...extras.map((each) => each.input)]) input.addEventListener("change", refresh);
    for (const input of [person, ...extras.map((each) => each.input)]) input.addEventListener("input", refresh);
    section.append(el("ul", "issue-participants", ...radios.map((each) => each.item)), el("label", null, "Your name ", person), ...extras.map((each) => each.label), stage);
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
const BACKLOG_ITEM = /^docs\/backlog\/(ITM-\d{3,})-[^/]*\.md$/;
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

// The module files of the architecture at a snapshot, read with the module schema.
const architectureOf = async (snapshot) => Promise.all(snapshot.paths.filter((path) => MODULE_FILE.test(path)).sort().map(async (path) => readDocument(artifactSchemas().module, path, (await snapshot.read(path)) ?? "")));

// What the participant's analysis names: the modules whose folder holds a file it names as wrong, none without a proposal. The answer of `analyse-issue` names no violated requirement, so there is none.
function analysisOf(architecture, proposal) {
  const wrong = Array.isArray(proposal?.wrong) ? proposal.wrong.map(String) : [];
  const modules = architecture.filter((one) => typeof one.fields.folder === "string" && wrong.some((file) => file.startsWith(one.fields.folder.replace(/\/?$/, "/")))).map((one) => one.id);
  return { violated: null, modules };
}

// The items of the backlog at a snapshot, by their number, each with its identifier and title: those a further issue may be added to (UC-033 4a).
async function backlogItems(snapshot) {
  const paths = snapshot.paths.filter((path) => BACKLOG_ITEM.test(path));
  await snapshot.readMany?.(paths);
  const items = await Promise.all(paths.map(async (path) => ({ id: BACKLOG_ITEM.exec(path)[1], title: readDocument(artifactSchemas().item, path, (await snapshot.read(path)) ?? "").fields.title ?? "" })));
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

// The section that moves the issue into the backlog (UC-033): Move to backlog draws the prefilled item as a form, Add writes it. `current()` is the class the issue has now and `proposal()` the participant's proposal, if any, both read when the person clicks.
function moveSection({ product, issue, current, proposal }) {
  const stage = el("div", "issue-move-stage");
  const address = issueAddress(product, issue.number);

  async function drawForm() {
    stage.replaceChildren();
    try {
      const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
      const schemas = artifactSchemas();
      const architecture = await architectureOf(head);
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
      const added = (done, said) => stage.replaceChildren(el("p", "move-added", said), ...(done.comment ? [commentToCopy(done.comment)] : []));
      const form = schemaForm(schema, opened, {
        onSave: async (live) => {
          problems.replaceChildren();
          try {
            const { id: _, ...fieldsNow } = listed(live).fields;
            const done = await moveToBacklog(product.host, { number: issue.number, address }, { fields: fieldsNow, sections: live.sections.map(({ heading, text }) => ({ heading, text })) }, null);
            added(done, `Added ${done.item} to the backlog.`);
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
      // The items this issue may be added to instead (UC-033 4a): `moveToBacklog` with `existing`, which leaves the prefilled item unused.
      const existing = (await backlogItems(head)).map(({ id, title }) => {
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

  return el("section", "issue-move", el("h3", null, "Move to backlog"), fold(STEP_TEXT.move), el("p", "actions", button("move-to-backlog", "Move to backlog", drawForm)), stage);
}

// ---------------------------------------------------------------- the fix of a bug (UC-012 step 5, 5b)

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
    if (pullRequest.state === "merged") {
      const closed = el("p", "fix-closed");
      const close = button("close-with-links", "Close with links", async () => {
        close.disabled = true;
        try {
          await closeWithLinks(product.host, issue.number, { pullRequest: pullRequest.url, commit: pullRequest.mergeCommit, item: null });
          closed.textContent = `The issue is closed with ${pullRequest.url}.`;
        } catch (problem) {
          close.disabled = false;
          closed.replaceChildren(el("span", "issue-problem", `The issue could not be closed: ${failed(problem)}`));
        }
      });
      box.append(el("p", "actions", close), closed);
    }
  } catch (problem) {
    box.append(el("p", "issue-problem", `The fix could not be read: ${failed(problem)}`));
  }
  return box;
}

// The fix of a bug (UC-012 step 5): the participants that can write to the repository and run code and tests, each with where it processes data; the requirement the fix restores and the modules it changes, which the person confirms or corrects; the run panel of the
// kind `fix-bug`, whose Run queues the job on the participant's route (MOD-runtimes' routesFor, over the routes that reach the product's resources). Without such a participant the page says so and leads to UC-017 (5b).
async function fixSection({ context, product, issue, proposal }) {
  const requirement = el("input", "fix-requirement");
  requirement.setAttribute("placeholder", "Requirement it restores");
  const modules = el("input", "fix-modules");
  modules.setAttribute("placeholder", "Modules it changes, separated by commas");
  try {
    const head = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
    modules.value = analysisOf(await architectureOf(head), proposal()).modules.join(", ");
  } catch { /* the field stays empty for the person to fill */ }
  const none = () => {
    // It leads to UC-017 only through the context's go, as the frame's button (MOD-test-pages does the same).
    const lead = el("button", "uc-017 btn", "UC-017");
    lead.setAttribute("type", "button");
    lead.addEventListener("click", () => context.go("use-case", { id: "UC-017" }));
    return el("p", "issue-no-fixer", "No participant that can run code and tests is configured, so this bug cannot be fixed here: a model endpoint may analyse an issue but cannot fix it. Declare such a participant — ", lead, ".");
  };
  const route = async (chosen, participants, head) => {
    const info = await product.host.repositoryInfo();
    const listed = await head.read(RESOURCES);
    const needs = typeof listed === "string" ? reachableBy(readRegister(resourceSchema(), RESOURCES, listed).rows.map((row) => ({ name: row.cells.Name, route: row.cells.Route }))) : [];
    return routesFor(chosen, participants, { visibility: info.visibility, jobWorkflow: WORKFLOWS.some((path) => head.paths.includes(path)) }, needs)[0] ?? null;
  };
  const paramsOf = async (_, { offer }) => {
    const violated = String(requirement.value ?? "").trim();
    const changed = namesOf(modules.value);
    const wrong = Array.isArray(proposal()?.wrong) ? proposal().wrong.map(String) : [];
    return { ...(violated ? { violated } : {}), ...(wrong.length ? { wrong } : {}), ...(changed.length ? { modules: changed } : {}), route: offer ? recordRoute(offer.route) : null };
  };
  const section = await runSection({ context, product, issue, kindName: "fix-bug", title: "Fix", text: STEP_TEXT.fix, failure: "The fix could not be started",
    names: { section: "issue-fix", participant: "fix-participant", person: "fix-person" }, paramsOf, route, none,
    extras: [{ input: requirement, label: el("label", null, "Requirement it restores ", requirement) }, { input: modules, label: el("label", null, "Modules it changes ", modules) }] });
  section.append(await fixTrail({ product, issue }));
  return section;
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
  // The fix section is built once, and shown while the issue's class is bug.
  const fixBox = el("div", "issue-fix-box");
  let fix = null;
  async function drawFix() {
    if (currentClass() !== IssueClass.bug) { fixBox.replaceChildren(); return; }
    fix ??= fixSection({ context, product, issue, proposal: () => state.proposal });
    fixBox.replaceChildren(await fix);
  }
  // Where an issue is not classified yet, the move is not offered and the page leads to UC-012, step 2 (UC-033 1a), only through the context's go, as the fix leads to UC-017.
  function notClassified() {
    const lead = el("button", "uc-012 btn", "UC-012, step 2");
    lead.setAttribute("type", "button");
    lead.addEventListener("click", () => context.go("use-case", { id: "UC-012" }));
    return el("p", "move-not-offered", "Move to backlog is not offered: this issue is not classified yet as a bug or a change. Analyse it and decide its class — ", lead, ".");
  }
  // The move section is built once, and shown while the issue's class is bug or change.
  const moveBox = el("div", "issue-move-box");
  let move = null;
  function drawMove() {
    const cls = currentClass();
    if (cls === undefined) { moveBox.replaceChildren(notClassified()); return; }
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
      if (!state.outcome?.rejected) { drawDecision(); await drawChange(); await drawFix(); drawMove(); }
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
  out.append(analysis, proposalBox, decision, changeBox, fixBox, moveBox);
  await drawChange();
  await drawFix();
  drawMove();
}

export const routes = [
  { name: "issues", entry: "maintenance", title: "Issues", render: renderList },
  { name: "issue", entry: null, title: "Issue", render: renderIssue },
];
