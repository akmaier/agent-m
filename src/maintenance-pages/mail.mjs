// The route `mail` — mail read into issues (UC-038 steps 1 to 3, 7 to 9, 10, and 2a, 4b, 6a, 7a, 7b, 8a), as docs/architecture/MOD-maintenance-pages.md states it (ITM-963, and the inbox the PO asked for): the mailbox read when
// the page is drawn and again every five minutes while it stays drawn, never while a reading runs; an inbox list in this browser only, the newest first, one line per mail with sender, subject and date, the proposable
// mails in bold, the attached and decided ones not, each of these with its issue or its mark *not an issue*; the mail clicked shows its details beside the list on a wide screen and in place of it, with a way back,
// on a narrow one: the mail in full and, for a proposable mail, its proposal (empty until Propose: UC-038 4b), its text editable, every hit of the mail's people marked; *Create issue* — only without a hit —,
// *Add to #n*, *Not an issue*. The participant, the run panel and *Propose* (UC-038 steps 4 to 6, 4a, 4c, 5a, 5b, 6b, 6c) are ITM-964's, below, above the list.
//
// Module: MOD-maintenance-pages
//
// Readings the texts leave open, which this file takes (the pull request names them):
//   - The mailbox is read when the page is drawn and then five minutes after each reading has ended (EVERY), so that no reading starts while one runs and two readings never write the same note twice; the readings stop once
//     the frame has drawn another route into the element (the page is no longer one of its children), as MOD-main-page's reread.mjs stops. A reading that fails after one that listed mails keeps the list as it was and
//     names the problem above it; nothing is read. Each decision is made on a click the browser marks as a person's (`isTrusted`); opening a mail writes nothing and answers any click, the keyboard's included.
//   - The page reads, top to bottom: the problem of a failed reading, the inbox, and the status line of the readings with its folded explanation, as a mail program's status bar; in the
//     inbox, the list on the left and everything the author edits on the right — Propose above the mail opened (the PO's layout).
//   - The list holds the proposable and the decided mails and the mails attached to an issue of their thread, each with its Mail (MOD-mail-handling, NewMail), sorted by their date, the newest first; a mail
//     whose date cannot be read comes after the dated ones.
//   - The date of a line is written as a mail program writes it, in the browser's time zone: the time for a mail of today, day and month for one of this year, day, month and year for an older one; the details
//     give day, month, year and time. The raw date is the `datetime` of the <time>.
//   - After Create issue or Add to #n the mail keeps its review (7b: Create issue once per concern) and its line leaves bold with the issue; after Not an issue its line leaves bold with the mark, and its details
//     show the mark and no decision. A later reading names every mail an issue lists or the store marks as decided; a proposable mail keeps its review, its proposal and the edits made to it, the open mail stays
//     open, the chosen participant stays chosen, and the run panel is drawn anew for the proposable mails only when they changed and no proposal runs. The Propose section is shown while there is a proposable mail.
//   - Where this browser keeps no product (`products` empty), the place of Propose says so — nothing can be proposed — and links Add product, at every reading, whatever the mailbox gives. A missing instance host offers no Propose either; it is not this case.
//   - Create issue is disabled while a hit of the mail's people stands in the title or the text, and while either is empty. A created issue of the kind change is followed by a link to its route `issue/<n>` (step 10: Propose SPEC change).
//   - The products are those this browser keeps (`products`), each connected with its own token (else, for GitHub, the instance's). The mailbox is the stored connection; on the Bridge route the Bridge it names, by its stored name.
//   - The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of this page and it is the frame's file (as the schedule page of MOD-test-pages does).
//   - The subject a route that shows mail gives the prompt bar (mailSubject, ITM-510; MOD-maintenance-pages.md, Interfaces): its page holds the `MAIL-` identifiers of the proposable mails (those that are offered a decision), and, per mail, its sender, subject, date, text and attachments only for a
//     participant whose `place` is among the places the mailbox's connection allows and that does not declare "write to the repository"; it refuses `propose-edit` and `hand-over`; its `withhold` gives a reason for a message that holds a name, address, phone
//     number or account of a listed mail's people (personHits) or a passage of a listed mail's own text — a run of at least twenty characters of it, whatever the case and the spacing —, and null otherwise.

import { bridgeAt, settingsOf } from "../bridge-client/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { readDocument, readRegister } from "../documents/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob } from "../job-runner/index.mjs";
import { mailbox, signIn } from "../mail-routes/index.mjs";
import { decideMail, readNewMail } from "../mail-handling/index.mjs";
import { eligible, participantSchema, participantsOf } from "../participant-list/index.mjs";
import { endpointsOffered, sessionsOffered, throughActions } from "../prompt-bar/index.mjs";
import { personHits, pseudonymisationOf, settingsSchemas } from "../personal-data/index.mjs";
import { connect, parseAddress } from "../repository-hosts/index.mjs";
import { queueJob, runOnTab } from "../runtimes/index.mjs";
import { runPanel } from "../site-frame/index.mjs";
import { heads } from "./routes.mjs";

const REGISTER = "docs/participants.md";
const SETTINGS = "docs/settings.md";
const JOB_FILE = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

const STEP_TEXT = {
  read: "Opening this page reads the mails of the last 30 days in the folders named in the mailbox connection, as the mail server selects them, and reads them again every five minutes while the page is open. Reading is read-only: nothing is marked as read, moved or flagged, and an older mail nobody decided stays in the mailbox without being listed. Each mail gets the identifier MAIL- plus sixteen hex digits of the hash of its Message-ID. A mail whose thread an issue lists is attached to that issue at once, with a note, and shown under it. Book: ch. 14, Evolution Processes and Change Identification.",
  list: "The mails are listed as a mail program lists its inbox, with sender, subject and date, the newest first, in this browser only. A mail still to decide is bold. A mail an issue already lists, or that you marked not an issue in this browser, is decided: it is not bold, shows its issue or its mark, and gets no proposal. Click a mail to read it in full and see what to do with it. Nothing here is stored anywhere but in the mailbox.",
  propose: "Propose asks the participant you choose, once for all the mails still to decide, for a proposal per mail: the product, the kind, a neutral title and text, and the open issues it may duplicate. Only participants at a place this mailbox allows are offered; a place outside the EU is named as not compliant with the GDPR and the EU AI Act. The run panel states where the participant processes data and exactly what it receives, and the three checking participants where each processes data and that each receives only the rewritten texts. Nothing is sent until you press Run. You can still decide every mail by hand without Propose.",
  review: "Each mail is shown in full beside its proposal, which is empty until you press Propose: then write the neutral title and text yourself. The text is searched, without a model, for the mail's people; a hit is marked and Create issue stays disabled until you have edited it out. An attachment goes to the participant only if you tick it; it goes into the issue only if you add it, rewritten without any person and checked by three other participants, or unchanged when the product switched pseudonymisation off.",
  decide: "One click decides a mail. Create issue writes one issue to the product's tracker, labelled defect or change, listing the mail's identifier and naming no reporter. Add to #n lists the mail on an existing issue. Not an issue marks the mail in this browser by its identifier. Nothing else of the mail is written to a repository.",
};

export function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}
export const fold = (text) => el("details", "explain", el("summary", null, "What is this?"), el("p", null, text));
export const link = (href, className, text) => { const anchor = el("a", className, text); anchor.setAttribute("href", href); return anchor; };
// The address of the route `issue` for an issue of a product, as the frame's routeOf reads it: `#issue/number=<n>/product=<address>`, every part percent-encoded (MOD-site-frame, Parts).
export const issueRoute = (number, product) => `#issue/number=${encodeURIComponent(number)}${product ? `/product=${encodeURIComponent(product)}` : ""}`;
// A listener that answers only a click the browser marks as a person's (THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK).
export function button(className, text, listener) {
  const node = el("button", `${className} btn`, text);
  node.setAttribute("type", "button");
  node.addEventListener("click", (event) => { if (event?.isTrusted === true && !node.disabled) listener(event); });
  return node;
}

// The mails now listed with their people: what the subject of this route gives the prompt bar (in memory only, while shown).
let listed = [];

// The hosts of the products this browser keeps, by their address as the store lists it: each with its own token, else, for GitHub, the instance's.
export function productsOf(store) {
  const hosts = new Map();
  for (const url of readSetting(store, "products") ?? []) {
    try {
      const address = parseAddress(url);
      const key = address.server === "gitlab" ? `gitlab-token:${new URL(address.origin).host}/${address.path}` : `github-token:${address.path}`;
      const stored = readSetting(store, key) ?? (address.server === "github" ? readSetting(store, "github-token") : null);
      hosts.set(url, { address: url, name: address.path, host: connect(address, stored?.value ? { token: stored.value } : {}) });
    } catch { /* an address that cannot be read is no product */ }
  }
  return hosts;
}

export function mailboxOf(store) {
  const connection = readSetting(store, "mailbox");
  if (!connection) return null;
  if (connection.route === "graph") return { connection, box: mailbox(connection, null) };
  const entry = readSetting(store, `bridge:${connection.imap?.bridge}`);
  const bridge = entry ? bridgeAt(settingsOf({ name: connection.imap.bridge, ...entry }, readSetting(store, "jump-host"))) : null;
  return { connection, box: mailbox(connection, bridge) };
}

// The endpoints and Bridges the participants are reached by, as the tab's route drives them (the page replies has the same need).
export function connectionsOf(participants, store) {
  const endpoints = {}, bridges = {};
  const connectBridge = (name) => {
    if (!name || bridges[name]) return;
    const stored = readSetting(store, `bridge:${name}`);
    if (stored) bridges[name] = bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")));
  };
  for (const participant of [participants].flat()) {
    const name = /^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1];
    const stored = name === undefined ? null : readSetting(store, `endpoint:${name}`);
    if (stored) {
      endpoints[name] = { config: { name, kind: stored.kind, baseUrl: stored.url, model: stored.model, key: stored.key ?? null }, bridge: stored.bridge ?? null };
      connectBridge(stored.bridge);
    }
    connectBridge(/^bridge\s+(\S+)\s+agent\s+\S+/.exec(participant.route ?? "")?.[1]);
  }
  return { endpoints, bridges };
}

export const failed = (failure) => `${failure?.name ?? "Error"}${failure?.reason ? ` (${failure.reason})` : ""}: ${failure?.message ?? failure}`;

// The participants a page of mail offers: the instance's register, then the endpoints and CLI sessions the prompt bar offers from this browser, read with the
// bar's own endpointsOffered and sessionsOffered (THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE). One whose name the register holds
// already is left out, and so is an endpoint that runs through GitHub Actions, since the pages of mail run their jobs in this tab. The page replies has the same need.
export async function offeredWith(participants, store) {
  const named = new Set(participants.map((each) => each.name));
  const browser = [...endpointsOffered(store), ...await sessionsOffered(store)].filter((each) => !named.has(each.name) && !throughActions(each, store));
  return [...participants, ...browser];
}

// What the page reads once per reading to offer participants: the instance's register with this browser's endpoints and CLI sessions, and the places the mailbox allows.
async function sessionOf(context, have, products) {
  const instanceHost = context.instance?.host;
  if (!instanceHost || products.size === 0) return null;
  const info = await instanceHost.repositoryInfo();
  const instanceSnapshot = await instanceHost.readSnapshot(info.defaultBranch);
  const register = await instanceSnapshot.read(REGISTER);
  const participants = await offeredWith(register == null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, register).document), context.store);
  return { instanceHost, instanceSnapshot, participants, places: have.connection.places ?? [], allowed: (have.connection.places ?? []).map((each) => each.place), products, store: context.store, box: have.box };
}

// A job of a kind of this page, prepared: the job's record is committed to the repository of the first managed product (a mail concerns no product before it is proposed), as the page replies commits its jobs to the issue's product.
async function jobOf(session, kindName, params, choice, person) {
  const first = [...session.products.values()][0];
  const head = await first.host.readSnapshot((await first.host.repositoryInfo()).defaultBranch);
  const now = new Date();
  const id = newJobId(now, new Set(head.paths.map((path) => JOB_FILE.exec(path)?.[1]).filter(Boolean)));
  const agentM = { version: session.instanceSnapshot.commit ?? "unknown", commit: session.instanceSnapshot.commit ?? "unknown" };
  const jobContext = { kind: await kindOf(kindName), params, product: { address: first.address, snapshot: head, host: first.host }, instance: { snapshot: session.instanceSnapshot, host: session.instanceHost, checkout: null },
    connect: async () => first.host, participants: session.participants, places: { sources: {}, mailbox: session.allowed }, gates: [], person, now, agentM, jobId: id };
  const prepared = await prepareJob(kindName, jobContext, choice);
  return { prepared, jobContext, head, id, now, agentM, host: first.host, kind: kindName, person, choice };
}

// The job run in this tab on the person's click: its start record committed, the participants reached by their routes.
async function runJobOf(session, job) {
  const { prepared, choice } = job;
  const record = { id: job.id, kind: job.kind, worksOn: [...session.products.values()].map((each) => each.address), participant: choice.drafter.name, model: choice.drafter.model, route: "tab", run: null, retries: null, startedBy: job.person,
    start: job.now, agentM: job.agentM, inputs: prepared.parts.map((part) => part.name), limit: prepared.limit, destinations: prepared.destinations.map((each) => ({ participant: each.participant.name, place: each.place, parts: each.parts })), params: {} };
  const { path } = await queueJob(job.host, record, { kind: "tab" }, job.head.commit);
  return runOnTab(prepared, job.jobContext, connectionsOf([choice.drafter, ...choice.reviewers], session.store), { host: job.host, record: { ...record, path } });
}

// Whether a product rewrites report data: docs/settings.md of its default branch, which keeps it on where it is missing.
async function pseudonymisationFor(product) {
  const snapshot = await product.host.readSnapshot((await product.host.repositoryInfo()).defaultBranch);
  const text = await snapshot.read(SETTINGS);
  return text == null ? "on" : pseudonymisationOf(readDocument((await settingsSchemas()).settings, SETTINGS, text));
}

const who = (address) => (address.name ? `${address.name} <${address.address}>` : address.address);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const twoDigits = (number) => String(number).padStart(2, "0");
// A mail's date as a mail program writes it, in the browser's time zone: `long` gives day, month, year and time; otherwise the time for a mail of today, day and month for one of this year, and day, month and year for an older one.
function dateText(iso, { long = false } = {}) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso ?? "");
  const now = new Date();
  const time = `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
  const day = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  if (long) return `${day} ${date.getFullYear()}, ${time}`;
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) return time;
  return date.getFullYear() === now.getFullYear() ? day : `${day} ${date.getFullYear()}`;
}
function dateOf(iso, options) {
  const node = el("time", "mail-date", dateText(iso, options));
  node.setAttribute("datetime", String(iso ?? ""));
  return node;
}
// The head of a mail's details: its sender, subject and date in full.
const headOf = (mail) => el("p", "mail-head", el("span", "mail-sender", who(mail.from)), " · ", el("span", "mail-subject", mail.subject), " · ", dateOf(mail.date, { long: true }));

// The review of one mail: the mail in full beside an empty proposal, its hits, and the three decisions. `onDecided(id, { product, issue })` is told of an issue created or added to, `onMarked(id)` of the mark Not an issue.
function reviewOf({ mail, people }, { products, store, context, onMarked, onDecided, session, choice, hooks }) {
  const product = el("select", "mail-product", ...[...products.values()].map((each) => { const option = el("option", null, each.name); option.setAttribute("value", each.address); return option; }));
  const kind = el("select", "mail-kind", ...["defect", "change"].map((name) => { const option = el("option", null, name); option.setAttribute("value", name); return option; }));
  kind.value = "defect";
  const title = el("input", "mail-title");
  const body = el("textarea", "mail-body");
  const hitsList = el("ul", "mail-hits");
  const number = el("input", "mail-issue-number");
  const result = el("p", "mail-result");
  // A proposal without a managed product leaves the choice to the person (UC-038 5b): until they pick, no product is chosen.
  let needsProduct = false;
  const chosen = () => (needsProduct ? null : products.get(product.value) ?? [...products.values()][0] ?? null);
  const issueNumber = () => (/^\d+$/.test(String(number.value ?? "").trim()) ? Number(number.value) : null);

  const create = button("create-issue", "Create issue", () => decide({ kind: "create", product: chosen()?.address, title: title.value, text: body.value, label: kind.value }));
  const add = button("add-to-issue", "Add to #n", () => decide({ kind: "add", product: chosen()?.address, issue: issueNumber() }));
  const none = button("not-an-issue", "Not an issue", () => decide({ kind: "not-an-issue" }));
  create.disabled = true;
  add.disabled = true;

  function refresh() {
    const hits = [...personHits(String(title.value ?? ""), people), ...personHits(String(body.value ?? ""), people)];
    hitsList.replaceChildren(...hits.map((hit) => el("li", "mail-hit", `${hit.kind}: ${hit.value}`)));
    create.disabled = hits.length > 0 || !String(title.value ?? "").trim() || !String(body.value ?? "").trim() || chosen() === null;
    const n = issueNumber();
    add.textContent = n === null ? "Add to #n" : `Add to #${n}`;
    add.disabled = n === null || chosen() === null;
  }
  product.addEventListener("change", () => { needsProduct = false; });
  for (const [node, type] of [[title, "input"], [body, "input"], [number, "input"], [product, "change"], [kind, "change"]]) node.addEventListener(type, refresh);

  // The proposal of the participant for this mail: the person's fields are filled from it and stay the person's to change (UC-038 7a).
  const proposalBox = el("div", "mail-proposal");
  function fill(proposal) {
    proposalBox.replaceChildren();
    if (proposal.kind === "no issue") { proposalBox.append(el("p", "mail-no-issue", "The participant found no issue in this mail (a thank-you, an out-of-office reply, spam). Mark it Not an issue, or write the issue by hand.")); return; }
    const found = [...products.values()].find((each) => each.address === proposal.product || each.name === proposal.product);
    if (found) { product.value = found.address; needsProduct = false; }
    else { needsProduct = true; proposalBox.append(el("p", "mail-no-product", "The participant found no matching product among the managed ones: choose the product, or mark the mail Not an issue.")); }
    if (proposal.kind === "defect" || proposal.kind === "change") kind.value = proposal.kind;
    title.value = proposal.title;
    body.value = proposal.text;
    if ((proposal.duplicates ?? []).length) proposalBox.append(el("ul", "mail-duplicates", ...proposal.duplicates.map((each) => el("li", "mail-duplicate", `#${each.issue}: ${each.reason}`))));
    refresh();
  }

  // Attachments: the text of one goes to the participant only when ticked (5a), and into the issue only when added, rewritten without persons by the chosen participant and checked by three others, or unchanged where the product switched that off (6, 6b, 6c).
  const ticks = new Map();
  const reportStage = el("div", "mail-report-stage");
  async function addReport(attachment, index) {
    reportStage.replaceChildren();
    const problem = (text) => reportStage.append(el("p", "mail-report-problem", text));
    const target = chosen();
    if (!target) { problem("Choose the product first."); return; }
    try {
      if (await pseudonymisationFor(target) === "off") {
        const added = el("div", "mail-report", el("p", "pseudonymisation-off", `Pseudonymisation is off for ${target.name}: this report data goes into the issue unchanged, with whatever persons it names.`), el("pre", "mail-report-data", attachment.text));
        reportStage.append(added);
        body.value = [body.value, attachment.text].filter((text) => String(text ?? "") !== "").join("\n\n");
        refresh();
        return;
      }
      const { participant, person } = choice;
      if (!participant || !person) { problem("Choose a participant under Propose first."); return; }
      const job = await jobOf(session, "rewrite-without-persons", { participant, pieces: [{ name: `attachment ${index + 1} of ${mail.id}`, text: attachment.text }], people }, { drafter: participant, reviewers: [] }, person);
      const result = el("div", "mail-report-result");
      reportStage.append(runPanel(job.prepared, { onRun: async () => {
        try {
          const outcome = await runJobOf(session, job);
          if (!outcome.draft?.text) { result.replaceChildren(el("p", "mail-report-problem", "The participant returned no rewritten text. Nothing was added.")); return; }
          body.value = [body.value, outcome.draft.text].filter((text) => String(text ?? "") !== "").join("\n\n");
          result.replaceChildren(el("p", "mail-report-added", outcome.remaining?.length ? `The rewritten text was added; ${outcome.remaining.length} finding${outcome.remaining.length === 1 ? " is" : "s are"} left after the last round: read it before you create the issue.` : "The rewritten text was added."));
          refresh();
        } catch (failure) {
          result.replaceChildren(el("p", "mail-report-problem", `The report data could not be rewritten: ${failed(failure)}`));
        }
      } }), result);
    } catch (failure) {
      problem(`The report data could not be added: ${failed(failure)}`);
    }
  }
  const attachments = session ? mail.attachments.filter((each) => each.text !== null && each.text !== undefined).map((attachment) => {
    const tick = el("input", "attachment-tick");
    tick.setAttribute("type", "checkbox");
    tick.setAttribute("data-attachment", attachment.name);
    tick.addEventListener("change", () => hooks.changed());
    ticks.set(attachment.name, tick);
    const add = button("add-report-data", "Add to the issue", () => addReport(attachment, mail.attachments.indexOf(attachment)));
    add.setAttribute("data-attachment", attachment.name);
    return el("li", "mail-attachment", el("label", null, tick, ` send the text of ${attachment.name} to the participant `), add);
  }) : [];

  async function decide(decision) {
    const found = chosen();
    const which = found?.name ?? "the product";
    try {
      const { issue } = await decideMail({ id: mail.id, people }, decision, found?.host ?? null, store);
      if (decision.kind === "not-an-issue") { onMarked(mail.id); return; }
      onDecided(mail.id, { product: found?.address ?? null, issue: decision.kind === "create" ? issue : decision.issue });
      result.replaceChildren(decision.kind === "create" ? `Created issue #${issue} in ${which}.` : `Added to #${decision.issue} of ${which}.`);
      if (decision.kind === "create" && decision.label === "change") result.append(" ", link(issueRoute(issue, found?.address), "issue-link", "Propose SPEC change"));
    } catch (failure) {
      if (failure?.name === "PersonFound") { result.textContent = `The text names the mail's people: ${(failure.hits ?? []).map((hit) => hit.value).join(", ")}. Nothing was written.`; return; }
      if (failure?.name === "TokenRefused" || failure?.name === "PermissionMissing") {
        const token = link("#add-product", "token-step", "Store the token for this product");
        token.addEventListener("click", (event) => { event?.preventDefault?.(); context.go("add-product", found ? { address: found.address } : {}); });
        result.replaceChildren(failure.name === "PermissionMissing" ? `The token for ${which} lacks the permission to create issues or comments. Nothing was written. ` : `The token for ${which} was refused. Nothing was written. `, token);
        return;
      }
      result.textContent = `${failure?.name ?? "Error"}: ${failure?.message ?? failure}. Nothing was written.`;
    }
  }

  const shown = el("section", "mail-step-review", el("h3", null, "The mail and its proposal"),
    headOf(mail),
    el("pre", "mail-text", mail.text),
    el("label", null, "Product ", product), " ", el("label", null, "Kind ", kind),
    el("p", null, el("label", null, "Title ", title)), el("p", null, el("label", null, "Text ", body)), hitsList, proposalBox,
    ...(attachments.length ? [el("ul", "mail-attachments", ...attachments), reportStage] : []), fold(STEP_TEXT.review));
  const decisions = el("section", "mail-step-decide", create, " ", el("label", null, "Issue number ", number), " ", add, " ", none, result, fold(STEP_TEXT.decide));
  const item = el("div", "mail", shown, decisions);
  item.setAttribute("data-mail", mail.id);
  return { item, fill, product: () => chosen(), ticked: () => [...ticks].filter(([, tick]) => tick.checked === true).map(([name]) => name) };
}

// Propose: the participants the mailbox allows, the run panel and its *Propose*, one click for all proposable mails (UC-038 4, 4a, 4c); the author checks every text before it is written. `entries()` gives the proposable mails
// as they stand; `hooks.running` is true while a proposal runs, and `hooks.changed` draws the run panel anew.
async function proposeSection(session, entries, reviews, choice, hooks) {
  const section = el("section", "mail-step-propose", el("h3", null, "Propose"), fold(STEP_TEXT.propose));
  const definition = await kindOf("propose-issues");
  const admitted = eligible(session.participants, { capabilities: definition.needs, places: [{ from: "the mailbox", allowed: session.allowed }] }).eligible;
  if (admitted.length === 0) {
    section.append(el("p", "mail-no-participant", `No participant that can draft text works at a place this mailbox allows (${session.allowed.join(", ") || "none"}). Nothing is sent; you can still decide each mail by hand. `, link("#mailbox", "places-link", "The mailbox's processing places")));
    return section;
  }
  const outsideEu = (place) => (session.places ?? []).find((each) => each.place === place)?.outsideEu === true;
  // The participants as one select, the first chosen; each option names its place, and a place outside the EU as not compliant.
  const select = el("select", "participant");
  for (const participant of admitted) {
    const option = el("option", null, `${participant.name} — ${participant.place ?? "no processing place declared"}${outsideEu(participant.place) ? " — outside the EU: not compliant with the GDPR and the EU AI Act" : ""}`);
    option.value = participant.name;
    option.setAttribute("data-participant", participant.name);
    if (outsideEu(participant.place)) option.className = "not-compliant";
    select.append(option);
  }
  // The person who proposes is the account of the instance's token, as the prompt bar names it; no name is typed.
  const name = readSetting(session.store, "github-token")?.name ?? "a reviewer";
  const stage = el("div", "mail-stage");
  let turn = 0;

  async function refresh() {
    const mine = turn += 1;
    stage.replaceChildren();
    const chosen = admitted.find((participant) => participant.name === select.value) ?? admitted[0];
    Object.assign(choice, { participant: chosen, person: name });
    try {
      // The mail opened, and the product chosen for it, whose SPEC the participant reads (UC-038 step 4).
      const products = entries().map(({ mail }) => reviews.get(mail.id)?.product()).filter(Boolean);
      const params = { mails: entries().map(({ mail, people }) => ({ mail, people, ticked: reviews.get(mail.id)?.ticked() ?? [] })),
        products: (products.length ? products : [...session.products.values()]).slice(0, 1).map(({ address, host }) => ({ address, host })) };
      const job = await jobOf(session, "propose-issues", params, { drafter: chosen, reviewers: [] }, name);
      if (mine !== turn) return;
      const result = el("div", "mail-propose-result");
      stage.append(runPanel(job.prepared, { label: "Propose", onRun: async () => {
        hooks.running = true;
        try {
          const outcome = await runJobOf(session, job);
          const given = outcome.draft?.proposals ?? [];
          let shown = 0;
          const sent = new Set(params.mails.map(({ mail }) => mail.id));
          for (const proposal of given) if (sent.has(proposal.mail) && reviews.has(proposal.mail)) { reviews.get(proposal.mail).fill(proposal); shown += 1; }
          result.replaceChildren(el("p", "mail-proposed", `${shown ? "The proposal is shown with the mail" : "No proposal came back"}. Nothing was created: decide the mail with one click.`));
        } catch (failure) {
          result.replaceChildren(el("p", "mail-propose-problem", `Nothing was proposed: ${failed(failure)}`));
        } finally {
          hooks.running = false;
        }
      } }), result);
    } catch (failure) {
      if (mine === turn) stage.append(el("p", "mail-propose-problem", failed(failure)));
    }
  }
  hooks.changed = refresh;
  select.addEventListener("change", refresh);
  section.append(el("p", null, el("label", null, "Participant ", select)), stage);
  refresh();
  return section;
}

// The place of Propose where this browser manages no product (MOD-maintenance-pages, `mail`; UC-038's precondition): nothing can be proposed, and Add product (UC-001) is linked as the token step links it.
function noProductSection(context) {
  const add = link("#add-product", "add-product-link", "Add product");
  add.addEventListener("click", (event) => { event?.preventDefault?.(); context.go("add-product", {}); });
  return el("section", "mail-step-propose", el("h3", null, "Propose"),
    el("p", "mail-no-products", "This browser manages no product, so nothing can be proposed. ", add), fold(STEP_TEXT.propose));
}

/** EVERY — the time from the end of one reading of the mailbox to the start of the next, in milliseconds: five minutes (UC-038 step 1). */
export const EVERY = 5 * 60 * 1000;

const NEWEST_FIRST = (a, b) => {
  const at = (row) => Date.parse(row.mail.date);
  const [x, y] = [at(a), at(b)];
  if (Number.isNaN(x) || Number.isNaN(y)) return Number.isNaN(x) - Number.isNaN(y);
  return y - x;
};
const classes = (node, wanted) => { node.className = Object.entries(wanted).filter(([, on]) => on).map(([name]) => name).join(" "); };

// What a decided line or details names: the issue that lists the mail, linked, or its mark.
const decisionOf = (decisions) => (decisions.length === 0
  ? ["not an issue"]
  : decisions.flatMap((each, at) => [...(at ? [", "] : []), link(issueRoute(each.issue, each.product), "issue-link", `#${each.issue}`)]));

async function render(target, context) {
  listed = []; // a page drawn anew lists no mail until its reading has answered
  const page = el("div", "mail-page");
  let readings = 0;
  page.setAttribute("data-readings", "0");
  const status = el("p", "mail-status muted", "Reading the mailbox…");
  const problemSlot = el("div", "mail-problem-slot");
  const proposeSlot = el("div", "mail-propose-slot");
  const list = el("ul", "mail-list");
  const details = el("section", "mail-details");
  details.setAttribute("aria-label", "The mail opened");
  // Everything the author edits stands on the right: Propose above the mail opened; the list stands on the left.
  const inbox = el("div", "mail-inbox", el("section", "mail-step-list", list, fold(STEP_TEXT.list)), el("div", "mail-right", proposeSlot, details));
  // The reading's status line stands at the bottom, as a mail program's status bar; a failed reading is named above the list.
  const readStep = el("section", "mail-step-read", status, fold(STEP_TEXT.read));
  page.append(problemSlot, readStep);
  target.replaceChildren(page);

  // What a later reading keeps: the rows of the list, the open mail, the reviews of the proposable mails with their proposals and edits, the participants' session, the choice made under Propose.
  const state = { rows: [], open: null, reviews: new Map(), session: null, propose: null, proposedFor: "", noProduct: null };
  const choice = { participant: null, person: "" };
  const hooks = { changed: () => {}, running: false };
  const proposable = () => state.rows.filter((row) => row.kind === "proposable").map(({ mail, people }) => ({ mail, people }));
  // Propose works on the mail opened, where it is still to decide (UC-038 step 4).
  const opened = () => proposable().filter(({ mail }) => mail.id === state.open);

  function drawList() {
    const focused = globalThis.document?.activeElement?.getAttribute?.("data-open") ?? null;
    list.replaceChildren(...state.rows.map((row) => {
      const open = lineButton(row);
      const line = el("li", "mail-line", open);
      classes(line, { "mail-line": true, undecided: row.kind === "proposable" && row.decisions.length === 0 });
      line.setAttribute("data-line", row.id);
      if (state.open === row.id) line.setAttribute("aria-current", "true");
      if (row.kind === "attached") line.append(el("span", "mail-decision", "in the thread of ", ...decisionOf(row.decisions)));
      else if (row.kind === "decided" || row.decisions.length) line.append(el("span", "mail-decision", ...decisionOf(row.decisions)));
      if (focused === row.id) open.focus?.();
      return line;
    }));
    classes(inbox, { "mail-inbox": true, "mail-open-shown": state.open !== null });
  }
  // A line's button: opening a mail writes nothing, so it answers any click.
  function lineButton(row) {
    const node = el("button", "mail-open btn", el("span", "mail-sender", row.mail.from?.name || row.mail.from?.address || ""), el("span", "mail-subject", row.mail.subject ?? ""), dateOf(row.mail.date));
    node.setAttribute("type", "button");
    node.setAttribute("data-open", row.id);
    node.addEventListener("click", () => openMail(row.id));
    return node;
  }
  function drawDetails() {
    const row = state.rows.find((each) => each.id === state.open);
    if (!row) { details.replaceChildren(el("p", "muted mail-none", "Choose a mail in the list to read it here.")); return; }
    const back = el("button", "mail-back btn", "Back to the list");
    back.setAttribute("type", "button");
    back.addEventListener("click", () => { const id = state.open; state.open = null; drawList(); drawDetails(); list.querySelector?.(`[data-open="${id}"]`)?.focus?.(); });
    if (row.kind === "proposable") { details.replaceChildren(back, state.reviews.get(row.id).item); return; }
    const shown = el("div", "mail mail-decided-details");
    shown.setAttribute("data-mail", row.id);
    shown.append(headOf(row.mail), el("pre", "mail-text", row.mail.text));
    shown.append(row.kind === "attached"
      ? el("p", "mail-decided-as", "This mail answers a mail an issue lists, so it was attached to that issue: ", ...decisionOf(row.decisions), ".")
      : row.decisions.length
        ? el("p", "mail-decided-as", "An issue lists this mail: ", ...decisionOf(row.decisions), ". It is not proposed again.")
        : el("p", "mail-decided-as", "You marked this mail not an issue in this browser. It is not proposed again."));
    details.replaceChildren(back, shown);
  }
  function openMail(id) {
    state.open = id;
    drawList();
    drawDetails();
    redrawPropose();
    globalThis.document && details.querySelector?.(".mail-back")?.focus?.();
  }
  const onMarked = (id) => {
    const row = state.rows.find((each) => each.id === id);
    if (row) Object.assign(row, { kind: "decided", decisions: [] });
    state.reviews.delete(id);
    listed = proposable();
    drawList();
    if (state.open === id) drawDetails();
    redrawPropose();
  };
  const onDecided = (id, decision) => {
    const row = state.rows.find((each) => each.id === id);
    if (row) row.decisions.push(decision);
    drawList();
  };

  // The run panel follows the mail opened: drawn anew when another is opened and no proposal runs (it keeps the participant chosen); the section is shown while
  // the mail opened is still to decide. Where this browser manages no product, the place of Propose says so instead.
  function redrawPropose() {
    const now = opened().map(({ mail }) => mail.id).join(" ");
    if (state.propose && now !== state.proposedFor && !hooks.running) { state.proposedFor = now; hooks.changed(); }
    proposeSlot.replaceChildren(...(state.noProduct ? [state.noProduct] : state.propose && now !== "" ? [state.propose] : []));
  }

  const readOnce = async () => {
    status.textContent = "Reading the mailbox…";
    const store = context.store;
    const products = productsOf(store);
    state.noProduct = products.size === 0 ? (state.noProduct ?? noProductSection(context)) : null;
    redrawPropose();
    const have = mailboxOf(store);
    const problem = (...nodes) => { problemSlot.replaceChildren(...nodes); status.textContent = state.rows.length ? "The mailbox could not be read again; the list is as it was last read." : ""; };
    if (!have) { problem(el("p", "mailbox-problem", "No mailbox is connected in this browser. Connect one on the Settings page first.")); return; }
    let found;
    try {
      found = await readNewMail(have.box, [...products.values()].map((each) => ({ address: each.address, host: each.host })), readSetting(store, "not-an-issue") ?? []);
    } catch (failure) {
      const reason = el("p", "mailbox-problem", `The mailbox could not be read, so nothing was read: ${failure?.name ?? "Error"}${failure?.reason ? ` (${failure.reason})` : ""}: ${failure?.message ?? failure}`);
      if (failure?.name === "SignInExpired" && have.connection.graph) {
        const signInAgain = button("sign-in-again", "Sign in again", async () => {
          try { await signIn(have.connection.graph.clientId, have.connection.address); reason.textContent = "Signed in. The mailbox is read now."; await readMailbox(); } catch (error) { reason.textContent = `Signing in failed: ${error?.name ?? "Error"}: ${error?.message ?? error}`; }
        });
        problem(reason, signInAgain);
      } else problem(reason);
      return;
    }
    problemSlot.replaceChildren();
    if (!state.session) { try { state.session = await sessionOf(context, have, products); } catch (failure) { problemSlot.append(el("p", "mail-propose-problem", `No participant can be offered, since the instance's participants could not be read: ${failed(failure)}`)); } }
    const before = new Map(state.rows.map((row) => [row.id, row]));
    const rows = [
      ...found.proposable.map(({ mail, people }) => ({ id: mail.id, mail, people, kind: "proposable", decisions: before.get(mail.id)?.kind === "proposable" ? before.get(mail.id).decisions : [] })),
      ...found.decided.map(({ mail, product, issue }) => ({ id: mail.id, mail, kind: "decided", decisions: issue === null ? [] : [{ product, issue }] })),
      ...found.attached.map(({ id, mail, product, issue }) => ({ id, mail, kind: "attached", decisions: [{ product, issue }] })),
    ].sort(NEWEST_FIRST);
    for (const id of [...state.reviews.keys()]) if (!found.proposable.some((entry) => entry.mail.id === id)) state.reviews.delete(id);
    for (const entry of found.proposable) {
      if (!state.reviews.has(entry.mail.id)) state.reviews.set(entry.mail.id, reviewOf(entry, { products, store, context, onMarked, onDecided, session: state.session, choice, hooks }));
    }
    state.rows = rows;
    if (!rows.some((row) => row.id === state.open)) state.open = null;
    listed = proposable();
    if (!state.propose && state.session && found.proposable.length) {
      try {
        state.propose = await proposeSection(state.session, opened, state.reviews, choice, hooks);
        state.proposedFor = opened().map(({ mail }) => mail.id).join(" ");
      } catch (failure) { problemSlot.append(el("p", "mail-propose-problem", `No participant can be offered: ${failed(failure)}`)); }
    }
    redrawPropose();
    drawList();
    drawDetails();
    if (inbox.parentNode !== page) page.replaceChildren(problemSlot, inbox, readStep);
    const at = new Date();
    status.textContent = `Read at ${twoDigits(at.getHours())}:${twoDigits(at.getMinutes())}. The mailbox is read again every five minutes while this page is open.`;
  };

  // A reading at a time; the next one five minutes after it has ended, while the frame still shows this page.
  let busy = false;
  const readMailbox = async () => {
    if (busy) return;
    busy = true;
    try { await readOnce(); } finally {
      busy = false;
      readings += 1;
      page.setAttribute("data-readings", String(readings));
    }
  };
  const shown = () => [...(target.children ?? [])].includes(page);
  const schedule = () => {
    const timer = globalThis.setTimeout(async () => { if (!shown()) return; await readMailbox(); schedule(); }, EVERY);
    timer?.unref?.(); // in Node a waiting reading keeps no process alive; a browser's timer has no unref
  };
  await readMailbox(); // opening Mail reads the mailbox at once (UC-038 step 1)
  schedule();
}

const PASSAGE = 20;
const squeeze = (text) => String(text).toLowerCase().replace(/\s+/g, " ");
// The runs of PASSAGE characters of a text, once each.
const runsOf = (text) => { const runs = new Set(); for (let at = 0; at + PASSAGE <= text.length; at += 1) runs.add(text.slice(at, at + PASSAGE)); return runs; };

/**
 * mailSubject({ key, title, entries, store }) -> Subject — what a route that shows mail gives the prompt bar (UC-049 3b). `entries()` gives the mails now shown, each `{ mail, people }`. The page holds the identifiers of the mails and, only for a
 * participant at a place the mailbox allows that does not write to the repository, their sender, subject, date, text and attachments; `refuses` names propose-edit and hand-over; `withhold(text)` names the mail's people found in the text, or a passage of a
 * mail's own text, and is null where there is none.
 */
export function mailSubject({ key, title, entries, store }) {
  const places = () => (readSetting(store, "mailbox")?.places ?? []).map((each) => each.place);
  const mayRead = (participant) => Boolean(participant?.place) && places().includes(participant.place) && !(participant.capabilities ?? []).includes("write to the repository");
  const pageFor = (participant) => {
    const lines = [title];
    for (const { mail } of entries()) {
      lines.push(mail.id);
      if (!mayRead(participant)) continue;
      lines.push(`From: ${who(mail.from)}`, `Subject: ${mail.subject}`, `Date: ${mail.date}`, mail.text,
        ...(mail.attachments ?? []).map((each) => `Attachment ${each.name} (${each.type}, ${each.size} bytes)${each.text ? `: ${each.text}` : ""}`));
    }
    return lines.join("\n");
  };
  const withhold = (text) => {
    const found = [];
    for (const { people } of entries()) found.push(...personHits(String(text), people).map((hit) => hit.value));
    if (found.length) return `the text names the mail's people: ${[...new Set(found)].join(", ")}`;
    const mine = runsOf(squeeze(text));
    if (entries().some(({ mail }) => [...runsOf(squeeze(mail.text))].some((run) => mine.has(run)))) return "the text quotes a passage of a mail";
    return null;
  };
  return { key, title, entry: null, paramsFor: (participant) => ({ page: pageFor(participant) }), draftRoute: null, withhold, refuses: ["propose-edit", "hand-over"] };
}

const subject = (params, context) => mailSubject({ key: "mail", title: "Mail", entries: () => listed, store: context.store });

export const route = { ...heads.mail, render, subject };
