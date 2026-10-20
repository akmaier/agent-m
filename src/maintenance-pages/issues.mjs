// The routes `issues` and `issue/<number>` — a product's issues, their analysis and the class confirmed, corrected or the issue rejected (UC-012 steps 2 to 4, 3a and 4a), as docs/architecture/MOD-maintenance-pages.md states them and ITM-582 builds
// them: *Analyse* with its run panel and the class proposed with its reasoning; one click confirms the class, corrects it or rejects the issue with a reason, with `confirmClass`. The fix of a bug, the change of the SPEC and the move into the backlog are
// other items'.
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
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as mail.mjs does).

import { readRegister } from "../documents/index.mjs";
import { IssueClass, confirmClass } from "../issue-handling/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { issueLabels } from "../mail-records/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { queueJob, runOnTab } from "../runtimes/index.mjs";
import { runPanel } from "../site-frame/index.mjs";
import { button, connectionsOf, el, failed, fold } from "./mail.mjs";

const REGISTER = "docs/participants.md";
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const NOT_CLASSIFIED = "not classified";

const STEP_TEXT = {
  list: "The open issues of the chosen product, with the class their label says. Open one to analyse it and to decide its class.",
  analyse: "Analyse asks the participant you choose for the class of this issue — a bug, a change or not reproducible — with its reasoning. The panel states where the participant processes data and exactly what it receives: the issue and the requirements, use cases, tests and modules it names, or the whole SPEC where it names none. The analysis writes nothing to the issue. Book: ch. 14, Evolution Processes and Change Identification.",
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

// The analysis: the participants that can draft text with their places, the run panel and Run. `onProposal` is called with the draft the participant returned.
async function analysisSection({ context, product, issue, onProposal }) {
  const section = el("section", "issue-analysis", el("h3", null, "Analyse"), fold(STEP_TEXT.analyse));
  try {
    const definition = await kindOf("analyse-issue");
    const instanceHost = context.instance.host;
    const instanceSnapshot = await instanceHost.readSnapshot((await instanceHost.repositoryInfo()).defaultBranch);
    const register = await instanceSnapshot.read(REGISTER);
    const participants = register == null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, register).document);
    const admitted = eligible(participants, { capabilities: definition.needs }).eligible;
    if (admitted.length === 0) { section.append(el("p", "issue-no-participant", "No participant that can draft text is listed in the instance's participants.")); return section; }

    const radios = admitted.map((participant) => {
      const radio = el("input", "participant");
      radio.setAttribute("type", "radio");
      radio.setAttribute("name", "participant");
      radio.value = participant.name;
      const item = el("li", "issue-participant", el("label", null, radio, ` ${participant.name} `), el("span", "place", participant.place ?? "no processing place declared"));
      item.setAttribute("data-participant", participant.name);
      return { radio, item, participant };
    });
    const person = el("input", "person");
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
        const jobContext = { kind: definition, params: { issue: issue.number }, product: { address: product.address, snapshot: head, host: product.host },
          instance: { snapshot: instanceSnapshot, host: instanceHost, checkout: null }, connect: async () => product.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: name, now, agentM, jobId: id };
        const prepared = await prepareJob("analyse-issue", jobContext, { drafter: chosen, reviewers: [] });
        const result = el("div", "issue-run-result");
        stage.append(runPanel(prepared, { onRun: async () => {
          try {
            const record = { id, kind: "analyse-issue", worksOn: [issueAddress(product, issue.number)], participant: chosen.name, model: chosen.model, route: "tab", run: null, retries: null, startedBy: name, start: now, agentM,
              inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params: { issue: issue.number } };
            const { path } = await queueJob(product.host, record, { kind: "tab" }, head.commit);
            const outcome = await runOnTab(prepared, jobContext, connectionsOf(chosen, context.store), { host: product.host, record: { ...record, path } });
            const draft = outcome.written?.shown ?? null;
            if (!draft) { result.replaceChildren(el("p", "issue-problem", "The participant's answer could not be used as a class. Nothing was written.")); return; }
            stage.replaceChildren(el("p", "issue-analysed", `Analysed by ${chosen.name}.`));
            onProposal(draft);
          } catch (failure) {
            result.replaceChildren(el("p", "issue-problem", `The issue could not be analysed: ${failed(failure)}`));
          }
        } }), result);
      } catch (failure) {
        stage.append(el("p", "issue-problem", failed(failure)));
      }
    }
    for (const input of [...radios.map((each) => each.radio), person]) input.addEventListener("change", refresh);
    person.addEventListener("input", refresh);
    section.append(el("ul", "issue-participants", ...radios.map((each) => each.item)), el("label", null, "Your name ", person), stage);
  } catch (failure) {
    section.append(el("p", "issue-problem", failed(failure)));
  }
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
      if (!state.outcome?.rejected) drawDecision();
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
  out.append(analysis, proposalBox, decision);
}

export const routes = [
  { name: "issues", entry: "maintenance", title: "Issues", render: renderList },
  { name: "issue", entry: null, title: "Issue", render: renderIssue },
];
