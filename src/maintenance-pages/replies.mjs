// The routes `replies` and `replies/<issue>` — replies to answer (UC-039 steps 1 to 4, and 2b, 3a, 4a), as docs/architecture/MOD-maintenance-pages.md states them and ITM-966 builds them: closed issues with mails to answer, answers received, open
// issues; an issue with what solved it and each listed mail found in the mailbox with its draft; *Draft replies* with its run panel, or a reply written without a participant; each draft complete — recipient, subject, body, attachments — and
// editable. Sending, *No reply*, asking a reporter and reopening are other items'.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them):
//   - Reading changes nothing without a click: the page draws *Read replies*, and the person's click calls repliesDue, which may note a reply found in Sent in its issue. The last reading is kept in memory for the route of one issue, and for nothing else.
//   - A mail has a draft to show when repliesDue found one in Drafts; it is shown as the mailbox's showDraft gives it, its body in an editable field, and *Save draft* saves the edit with updateDraft to the same recipient and subject.
//   - A mail whose reply address is missing or no address is *not sendable* (as storeReplies marks it); a mail with a note is *noted*; a mail the mailbox no longer holds is *not found in the mailbox*; none of these is offered a draft.
//   - The participants offered are those the register lists that can draft text and whose processing place the mailbox's connection allows (`places`); an allowed place the connection records as outside the EU is marked not compliant.
//   - The run panel is that of the kind `draft-replies` over the issue and the mails that have no draft and can be answered. Run is the person's click; the job runs in this tab (the route tab: its drafts are stored through the mailbox this tab holds),
//     its start record naming the issue and the product and no mail; the texts it returns are stored as drafts through the writer `mail-drafts`, and nothing is sent.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as mail.mjs does).

import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { repliesDue, storeReplies } from "../mail-handling/index.mjs";
import { participantSchema, participantsOf, eligible } from "../participant-list/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { queueJob, runOnTab } from "../runtimes/index.mjs";
import { runPanel } from "../site-frame/index.mjs";
import { mailboxOf, productsOf } from "./mail.mjs";

const REGISTER = "docs/participants.md";
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const ADDRESS = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const GROUPS = [["to-answer", "toAnswer", "To answer"], ["answer-received", "answerReceived", "Answer received"], ["open", "open", "Open"]];

const STEP_TEXT = {
  read: "Read replies reads every issue of the products that lists mails, the mailbox's Drafts and Sent folders, and finds each listed mail by its identifier. A reply found in Sent that no issue notes yet is noted in its issue now. Nothing in the mailbox is changed. Book: ch. 14, Evolution Processes and Change Identification.",
  groups: "Three groups: closed issues with a listed mail that has no reply note (to answer), issues labelled waiting-for-reporter with a new mail (answer received), and the open ones. Open an issue to see what solved it and its mails.",
  issue: "The issue with what solved it, and per listed mail the mail itself, found in the mailbox through its identifier, with its draft in Drafts if there is one. A draft is shown complete and can be edited here; each edit is saved to the draft. Nothing is sent from this page.",
  drafting: "Draft replies asks a participant for one text per mail: what the problem was, what was done, from which version the fix is live. Only participants whose processing place the mailbox allows are offered; the panel states where the participant processes data and exactly what it receives. The texts are stored as drafts in the mailbox's Drafts folder and nowhere else. Or write a reply yourself: an empty draft opens with the original quoted.",
};

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
const fold = (text) => el("details", "explain", el("summary", null, "What is this?"), el("p", null, text));
const link = (href, className, text) => { const anchor = el("a", className, text); anchor.setAttribute("href", href); return anchor; };
// A listener that answers only a click the browser marks as a person's (THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK).
function button(className, text, listener) {
  const node = el("button", className, text);
  node.setAttribute("type", "button");
  node.addEventListener("click", (event) => { if (event?.isTrusted === true && !node.disabled) listener(event); });
  return node;
}
const who = (address) => (address.name ? `${address.name} <${address.address}>` : address.address);
const failed = (failure) => `${failure?.name ?? "Error"}${failure?.reason ? ` (${failure.reason})` : ""}: ${failure?.message ?? failure}`;
// The address a reply to this mail goes to, as storeReplies reads it: its Reply-To, else its sender; none where it is missing or no address.
const replyAddress = (mail) => { const address = mail.replyTo?.[0] ?? mail.from; return address && ADDRESS.test(address.address) ? address : null; };

// The issue's address, which the job's record names it by (MOD-job-ledger: works_on holds an issue's address): GitHub's /issues/<n>, GitLab's /-/issues/<n>.
const issueAddress = (due) => `${due.product.replace(/\/$/, "")}${/github\.com/.test(due.product) ? "" : "/-"}/issues/${due.issue}`;

// The last reading, kept in memory for the route of one issue: { due, products, box, connection }.
let last = null;

// The endpoints and Bridges the chosen participant is reached by, as the tab's route drives them.
function connectionsOf(participant, store) {
  const endpoints = {}, bridges = {};
  const connectBridge = (name) => {
    if (!name || bridges[name]) return;
    const stored = readSetting(store, `bridge:${name}`);
    if (stored) bridges[name] = bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")));
  };
  const name = /^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1];
  const stored = name === undefined ? null : readSetting(store, `endpoint:${name}`);
  if (stored) {
    endpoints[name] = { config: { name, kind: stored.kind, baseUrl: stored.url, model: stored.model, key: stored.key ?? null }, bridge: stored.bridge ?? null };
    connectBridge(stored.bridge);
  }
  connectBridge(/^bridge\s+(\S+)\s+agent\s+\S+/.exec(participant.route ?? "")?.[1]);
  return { endpoints, bridges };
}

// A draft as the mailbox shows it, complete and editable; *Save draft* saves the edit to the draft.
function draftBlock(box, mail, initial) {
  const block = el("div", "reply-draft");
  let ref = initial;
  async function show(shownRef) {
    const shown = await box.showDraft(shownRef);
    ref = shown.ref ?? shownRef;
    const body = el("textarea", "draft-body");
    body.value = shown.body;
    body.textContent = shown.body;
    const edited = el("p", "draft-saved");
    const save = button("save-draft", "Save draft", async () => {
      try {
        const saved = await box.updateDraft(ref, { replyTo: mail, to: shown.to[0], subject: shown.subject, body: body.value });
        await show(saved);
        block.append(el("p", "draft-saved", "Saved to the draft."));
      } catch (failure) {
        edited.textContent = `The draft could not be saved: ${failed(failure)}`;
      }
    });
    block.replaceChildren(el("p", null, "To: ", el("span", "draft-to", shown.to.map(who).join(", ")), shown.cc?.length ? ` · Cc: ${shown.cc.map(who).join(", ")}` : ""),
      el("p", null, "Subject: ", el("span", "draft-subject", shown.subject)), el("p", null, body),
      el("ul", "draft-attachments", ...(shown.attachments ?? []).map((each) => el("li", null, `${each.name} (${each.size} bytes)`))), el("p", null, save), edited);
  }
  show(initial).catch((failure) => block.replaceChildren(el("p", "draft-problem", `The draft could not be read: ${failed(failure)}`)));
  return block;
}

function mailItem(entry, due, box) {
  const { id, mail, draft, noted } = entry;
  const item = el("li", "reply-mail");
  item.setAttribute("data-mail", id);
  if (mail === null) {
    item.append(el("p", "reply-missing", `${id}: not found in the mailbox. Name the folder in the mailbox connection, or decide not to reply.`));
    return item;
  }
  item.append(el("p", null, el("span", "reply-reporter", who(mail.from)), " · ", el("span", "reply-date", mail.date), " · ", el("span", "reply-subject", mail.subject)));
  if (noted) item.append(el("p", "reply-noted", "A reply, or the decision not to answer, is noted in the issue."));
  else if (replyAddress(mail) === null) item.append(el("p", "reply-not-sendable", "not sendable: the mail has no usable reply address."));
  else if (draft) item.append(draftBlock(box, mail, draft));
  else {
    const write = button("write-reply", "Write the reply myself", async () => {
      write.disabled = true;
      try {
        const [{ draft: stored, problem }] = await storeReplies(box, [{ mail, body: "" }]);
        if (problem) item.append(el("p", "reply-not-sendable", `${problem}.`));
        else { write.remove(); item.append(draftBlock(box, mail, stored)); }
      } catch (failure) {
        write.disabled = false;
        item.append(el("p", "reply-problem", `The draft could not be stored: ${failed(failure)}`));
      }
    });
    item.append(el("p", null, write));
  }
  return item;
}

// Draft replies: the participants the mailbox allows, the run panel and Run.
async function draftingSection(due, ctx, redraw) {
  const section = el("section", "reply-drafting", el("h3", null, "Draft replies"), fold(STEP_TEXT.drafting));
  const { context, connection, box, products } = ctx;
  try {
    const definition = await kindOf("draft-replies");
    const instanceHost = context.instance.host;
    const info = await instanceHost.repositoryInfo();
    const instanceSnapshot = await instanceHost.readSnapshot(info.defaultBranch);
    const register = await instanceSnapshot.read(REGISTER);
    const participants = register == null ? [] : participantsOf(readDocument(participantSchema(), REGISTER, register));
    const allowed = (connection.places ?? []).map((each) => each.place);
    const admitted = eligible(participants, { capabilities: definition.needs, places: [{ from: "the mailbox", allowed }] }).eligible;
    const host = products.get(due.product)?.host;
    const draftable = due.mails.filter((each) => each.mail && !each.noted && !each.draft && replyAddress(each.mail) !== null);
    if (draftable.length === 0 || !host) { section.append(el("p", "muted", "No mail of this issue is left to draft.")); return section; }
    if (admitted.length === 0) { section.append(el("p", "reply-no-participant", `No participant that can draft text works at a place this mailbox allows (${allowed.join(", ") || "none"}).`)); return section; }
    const radios = admitted.map((participant) => {
      const radio = el("input", "participant");
      radio.setAttribute("type", "radio");
      radio.setAttribute("name", "participant");
      radio.value = participant.name;
      const outside = (connection.places ?? []).find((each) => each.place === participant.place)?.outsideEu === true;
      const item = el("li", "reply-participant", el("label", null, radio, ` ${participant.name} `), el("span", "place", participant.place ?? "no processing place declared"),
        ...(outside ? [" ", el("span", "not-compliant", "outside the EU: not compliant with the GDPR and the EU AI Act")] : []));
      item.setAttribute("data-participant", participant.name);
      return { radio, item, participant };
    });
    const person = el("input", "person");
    person.setAttribute("placeholder", "Your name");
    const stage = el("div", "reply-stage");

    async function refresh() {
      stage.replaceChildren();
      const chosen = radios.find((each) => each.radio.checked === true)?.participant;
      const name = String(person.value ?? "").trim();
      if (!chosen || !name) { stage.append(el("p", "muted", "Choose a participant and enter your name to see the run panel.")); return; }
      try {
        const head = await host.readSnapshot((await host.repositoryInfo()).defaultBranch);
        const now = new Date();
        const id = newJobId(now, new Set(head.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean)));
        const agentM = { version: instanceSnapshot.commit ?? "unknown", commit: instanceSnapshot.commit ?? "unknown" };
        const params = { due: { ...due, mails: draftable }, host, mailbox: box };
        const jobContext = { kind: definition, params, product: { address: due.product, snapshot: head, host }, instance: { snapshot: instanceSnapshot, host: instanceHost, checkout: null },
          connect: async () => host, participants, places: { sources: {}, mailbox: allowed }, gates: [], person: name, now, agentM, jobId: id };
        const prepared = await prepareJob("draft-replies", jobContext, { drafter: chosen, reviewers: [] });
        const result = el("div", "reply-run-result");
        const panel = runPanel(prepared, { onRun: async () => {
          try {
            const record = { id, kind: "draft-replies", worksOn: [issueAddress(due)], participant: chosen.name, model: chosen.model, route: "tab", run: null, retries: null, startedBy: name, start: now, agentM,
              inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })),
              params: { issue: due.issue, product: due.product } };
            const { path } = await queueJob(host, record, { kind: "tab" }, head.commit);
            const outcome = await runOnTab(prepared, jobContext, connectionsOf(chosen, context.store), { host, record: { ...record, path } });
            const notes = outcome.written?.notes ?? [];
            await redraw([el("p", "reply-drafted", "The replies are stored as drafts in the mailbox's Drafts folder. Nothing was sent."), ...notes.map((note) => el("p", "reply-note", note))]);
          } catch (failure) {
            result.replaceChildren(el("p", "reply-problem", `The replies could not be drafted: ${failed(failure)}`));
          }
        } });
        stage.append(panel, result);
      } catch (failure) {
        stage.append(el("p", "reply-problem", failed(failure)));
      }
    }
    for (const input of [...radios.map((each) => each.radio), person]) input.addEventListener("change", refresh);
    section.append(el("ul", "reply-participants", ...radios.map((each) => each.item)), el("label", null, "Your name ", person), stage);
  } catch (failure) {
    section.append(el("p", "reply-problem", failed(failure)));
  }
  return section;
}

function groupsOf(out, ctx) {
  const sections = GROUPS.map(([key, field, title]) => {
    const list = el("ul", "reply-issues", ...ctx.due[field].map((each) => {
      const item = el("li", "reply-issue", `#${each.issue} of ${ctx.products.get(each.product)?.name ?? each.product} · ${each.mails.length} mail${each.mails.length === 1 ? "" : "s"} · `,
        link(`#replies/issue=${each.issue}&product=${encodeURIComponent(each.product)}`, "issue-link", "Open"));
      item.setAttribute("data-issue", String(each.issue));
      item.querySelector?.("a")?.addEventListener("click", (event) => { event?.preventDefault?.(); ctx.context.go("replies", { issue: String(each.issue), product: each.product }); });
      return item;
    }));
    const section = el("section", "replies-group", el("h3", null, title), list);
    section.setAttribute("data-group", key);
    return section;
  });
  out.replaceChildren(el("section", "replies-step-groups", ...sections, fold(STEP_TEXT.groups)));
}

async function issueOf(out, ctx, params, redraw) {
  const due = GROUPS.flatMap(([, field]) => ctx.due[field]).find((each) => String(each.issue) === String(params.issue) && (!params.product || each.product === params.product));
  if (!due) { out.replaceChildren(el("p", "reply-problem", `Issue ${params.issue} is in none of the groups of the last reading.`)); return; }
  const list = el("ul", "reply-mails", ...due.mails.map((entry) => mailItem(entry, due, ctx.box)));
  out.replaceChildren(el("section", "replies-step-issue", el("h3", null, `Issue #${due.issue} of ${ctx.products.get(due.product)?.name ?? due.product}`),
    el("p", "reply-solved", `Solved by: ${due.closedBy ?? "not known"} · Release: ${due.release ?? "not known"}`), list, fold(STEP_TEXT.issue)));
  out.append(await draftingSection(due, ctx, redraw));
}

async function render(target, context, params = {}) {
  const out = el("div", "replies-out");
  async function draw() {
    if (!last) { out.replaceChildren(el("p", "muted", "Read the replies first.")); return; }
    if (params.issue) await issueOf(out, { ...last, context }, params, redrawAfterDraft);
    else groupsOf(out, { ...last, context });
  }
  // After drafts were stored: the issues are read again, so that the new drafts show, and what came of the run stays above them.
  async function redrawAfterDraft(said = []) {
    last = { ...last, due: await repliesDue(last.box, [...last.products.values()].map((each) => ({ address: each.address, host: each.host }))) };
    await draw();
    out.append(...said);
  }
  const read = button("read-replies", "Read replies", async () => {
    out.replaceChildren(el("p", "muted", "Reading the issues and the mailbox…"));
    const products = productsOf(context.store);
    const have = mailboxOf(context.store);
    if (!have) { out.replaceChildren(el("p", "replies-problem", "No mailbox is connected in this browser. Connect one on the Settings page first.")); return; }
    try {
      const due = await repliesDue(have.box, [...products.values()].map((each) => ({ address: each.address, host: each.host })));
      last = { due, products, box: have.box, connection: have.connection };
    } catch (failure) {
      last = null;
      out.replaceChildren(el("p", "replies-problem", `The mailbox could not be read, so nothing was read: ${failed(failure)}`));
      return;
    }
    await draw();
  });
  target.replaceChildren(el("h2", null, "Replies"), el("section", "replies-step-read", el("p", null, read), fold(STEP_TEXT.read)), out);
  await draw();
}

export const route = { name: "replies", entry: "maintenance", title: "Replies", render };
