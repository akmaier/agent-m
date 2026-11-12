// MOD-prompt-bar, bar.mjs — the bar (docs/architecture/MOD-prompt-bar.md: Parts, Interfaces: startPromptBar, latestDraft, dropDraft, currentJob): the
// selector, the input, *Send* and *Stop*, the conversation, the answer, and the plan a participant proposes: a numbered list of its pieces, each with its kind,
// what it works on, its task and where it stands — run in this tab one after another, or each queued as a job of the participant's own (hand-over.mjs) and followed
// until it has ended (follow.mjs), or waiting for the acceptance of the piece it rests on —, with *Stop* cancelling every job still queued or running.
//
// Module: MOD-prompt-bar
//
// THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION. Nothing is written or sent to a participant
// while the bar is drawn — drawing it asks each Bridge this browser keeps only testBridge's two requests, for the CLI sessions it offers (offer.mjs
// sessionsOffered) —: *Send* is the one click that sends a message, and the one that, with recording on, writes
// the conversation record first, and the request of whatever its answer hands on; only a click the browser marks as a person's (`isTrusted`)
// does. The conversation lives in the tab's values (MOD-browser-store): `prompt-bar:conversation`, a list of Messages; `prompt-bar:draft`, the
// latest ConversationDraft; `prompt-bar:records`, the record each repository's part of the conversation is appended to; `prompt-bar:job`,
// the jobs handed over and followed while they run ([{ id, address }]); and `prompt-bar:plan`, the pieces of a plan that run in this tab after the draft before them
// ({ participant, about, pieces }).

import { readTabValue, writeTabValue } from "../browser-store/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";
import { eligible } from "../participant-list/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { BAR_KIND, endpointsOffered, placeOf, sessionsOffered, throughActions } from "./offer.mjs";
import { SWITCH, appendToConversation, conversationPath, recordingOf } from "./record.mjs";

// The bar's parts for acting — preparing and sending (send.mjs), handing over (hand-over.mjs) — imported when the person first acts, so that
// drawing the bar loads none of their modules. Every action prepares through send.mjs first, so that `sending` is held where it is read.
let sending = null, handing = null;
const sendPart = async () => (sending ??= await import("./send.mjs"));
const handPart = async () => (handing ??= await import("./hand-over.mjs"));

/**
 * followJob(options) -> { stop: () => void, cancel: () => Promise<void> } — follow.mjs' followJob, imported when the bar first follows a job: the
 * follower at once, whose stop and cancel are passed on once it is imported.
 */
export function followJob(options) {
  let follower = null, stopped = false;
  const ready = import("./follow.mjs").then(({ followJob: follow }) => { if (!stopped) follower = follow(options); });
  return { stop: () => { stopped = true; follower?.stop(); }, cancel: async () => { await ready; await follower?.cancel(); } };
}

const CONVERSATION = "prompt-bar:conversation";
const DRAFT = "prompt-bar:draft";
const RECORDS = "prompt-bar:records";
const JOB = "prompt-bar:job";
const PLAN = "prompt-bar:plan";
const CHOSEN = "prompt-bar:participant";
const HEIGHT = "prompt-bar:height";
// The bar's height a person sets with its grip, in pixels: at least LOWEST, at most nine tenths of the window; a key press moves it by STEP.
const LOWEST = 120, STEP = 40;
const FIXED = "position: fixed; bottom: 0; left: 0; right: 0;";

// The label of the button that sends: *Spawn job* where the message runs through GitHub Actions (offer.mjs throughActions), *Send* otherwise.
export const SEND = "Send", SPAWN = "Spawn job";

// The key under which the store keeps the instance's own token (MOD-browser-store, Data), handed to actionsSetup for a page of the instance (UC-049 4c).
const INSTANCE_TOKEN_KEY = "github-token";

const el = (name, className, ...children) => {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
};
const button = (className, text) => {
  const node = el("button", className, text);
  node.type = "button";
  return node;
};
// A run's address as a link, when it is a web address: a record may name anything as its log.
const linkTo = (address) => {
  const node = el("a", "run", address);
  if (/^https?:\/\//.test(address)) node.setAttribute("href", address);
  return node;
};

// The server's page of the repository's secrets (MOD-repository-hosts' webLinks), as a link.
const secretsLink = (host) => {
  const node = el("a", "secrets-link", "Secrets of this repository");
  node.setAttribute("href", host.webLinks().secrets);
  return node;
};

// The conversation the tab keeps, its moments read back as dates; empty where the tab keeps none or cannot.
function conversationOf(store) {
  try {
    return (readTabValue(store, CONVERSATION) ?? []).map((message) => ({ ...message, at: new Date(message.at) }));
  } catch {
    return [];
  }
}

// The message of this page's conversation that is running in this tab; one conversation runs one message at a time.
let running = null;

/**
 * currentJob() -> { kind, participant, started, state: "running" } | null — the message running in this tab now, for the list of every job.
 */
export function currentJob() {
  return running === null ? null : { ...running, state: "running" };
}

/**
 * latestDraft(store: Store, subject: string) -> ConversationDraft | null — the conversation's latest draft, if it was drafted on that subject.
 */
export function latestDraft(store, subject) {
  const draft = readTabValue(store, DRAFT);
  return draft !== null && draft.subject === subject ? draft : null;
}

/**
 * dropDraft(store: Store, subject: string) -> void — drops the conversation's latest draft, if it was drafted on that subject; the draft of another subject is left.
 */
export function dropDraft(store, subject) {
  if (latestDraft(store, subject) !== null) writeTabValue(store, DRAFT, null);
}

// What a failure says: its name and message.
const said = (failure) => `${failure.name ?? "Error"}: ${failure.message}`;

// A letter, a digit or `_`: what stands on either side of a word boundary's inside (UC-049 3d).
const WORD_CHARACTER = "[\\p{L}\\p{N}_]";
const escaped = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The words of a repository name — the last part of the address's path —, split at each change from a lower-case letter or a digit to an upper-case
// letter and at `-`, `_` and `.`, and lowered: AlienInvasion and alien-invasion both give ["alien", "invasion"].
function repositoryWords(address) {
  const name = String(address ?? "").replace(/\/+$/, "").split("/").pop() ?? "";
  return name.replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, "$1-$2").split(/[-_.]+/).filter(Boolean).map((word) => word.toLowerCase());
}

/**
 * namedProduct(text: string, products: { address: string }[]) -> string | null — the address of the one product among `products` whose repository name `text`
 * names, or null where none or more than one does (UC-049 3d). The text names it where, read without regard to case, it holds the name's words in their
 * order, separated by spaces, or joined into one word, beginning and ending at word boundaries. Pure.
 */
export function namedProduct(text, products) {
  const message = String(text ?? "");
  const named = (products ?? []).filter(({ address }) => {
    const words = repositoryWords(address).map(escaped);
    if (words.length === 0) return false;
    return new RegExp(`(?<!${WORD_CHARACTER})(?:${words.join(" +")}|${words.join("")})(?!${WORD_CHARACTER})`, "iu").test(message);
  });
  return named.length === 1 ? named[0].address : null;
}

// Two repository addresses that name the same repository, read without regard to case or a closing `/`.
const sameAddress = (a, b) => String(a ?? "").replace(/\/+$/, "").toLowerCase() === String(b ?? "").replace(/\/+$/, "").toLowerCase();
// The repository's path of an address: `owner/repo`.
const repositoryPath = (address) => { try { return new URL(address).pathname.replace(/^\/+|\/+$/g, ""); } catch { return String(address); } };

/**
 * startPromptBar(target: Element, setup: { page: "main" | "review", store: Store, instance: { repository: string, host: Host },
 * product: () -> { address: string, host: Host, tokenKey: string } | null, products: () -> { address: string, host: Host, tokenKey: string }[], subject: () -> Subject, explain: (topic: string) -> Element,
 * go: (route: string, params?: Record<string, string>) -> void, instanceSnapshot?: () -> Snapshot | null }) -> { stop: () -> void } — draws the bar into `target` once this
 * browser's endpoints and the CLI sessions its Bridges offer are read, and keeps it for the life of the page; no participant list is read for the
 * offer. With none offered it draws nothing and says nothing (UC-049 1a). It crosses the network through the hosts, the Bridges this browser keeps
 * and the participant's route; a failure of either is shown in the bar by name, and
 * nothing is thrown to the caller. `stop` removes the bar and aborts a message that is running.
 */
// The key of a connection the bar offers, by which the selector names and keeps it: its name and the model it offers — a CLI session offers one for each model it can
// run (UC-049 step 1: `hub · claude-opus-5-5 — Anthropic, USA`).
const keyOf = (connection) => `${connection.name} · ${connection.model}`;

export function startPromptBar(target, setup) {
  const { store, instance } = setup;
  // `jobs` holds each job followed — its follower, its part of the bar, its repository's address and host, and whether it has ended —, by its identifier.
  const state = { stopped: false, controller: null, jobs: new Map(), answered: new Set() };
  let reached = [], offered = [], recording = false, instanceWeb = null;

  const status = el("section", "status");
  const followed = el("section", "following");
  const conversation = el("ul", "conversation");
  const recorded = el("p", "recording", "This conversation is recorded in the repository of the page it is held on.");
  const input = el("textarea", "instruction");
  const send = button("send", SEND);
  const clear = button("clear", "Clear conversation");
  const stop = button("stop", "Stop");
  stop.disabled = true;
  let selector = null;
  let offeredNames = null;
  const chooser = el("div", "chooser");

  const show = (...nodes) => status.replaceChildren(...nodes);
  const problem = (text) => el("p", "problem", text);
  const showRecording = (on) => {
    recording = on;
    recorded.hidden = !on;
  };
  const chosen = () => offered.find((each) => keyOf(each) === (selector.value ?? keyOf(offered[0]))) ?? offered[0];
  // A participant's answer stands once, in the conversation: its text is the bar's `answer`.
  const line = (message) => {
    const text = el("div", message.from === "participant" ? "text answer" : "text");
    if (message.from === "participant") text.append(renderArtifact(message.text, { frontMatter: "hidden" }));
    else text.append(message.text);
    return el("li", `message ${message.from}`, el("span", "who", message.who), " ", text);
  };
  const keep = (messages) => {
    writeTabValue(store, CONVERSATION, messages);
    conversation.replaceChildren(...messages.map(line));
  };

  // The repository the conversation is held on: the product's, with the key of its token the frame gives, or the instance's, whose token the store keeps under github-token.
  function pageOf() {
    const product = setup.product();
    return product ? { address: product.address, host: product.host, tokenKey: product.tokenKey } : { address: instanceWeb, host: instance.host, tokenKey: INSTANCE_TOKEN_KEY };
  }

  // The product the person's words name (UC-049 3d), where it is another than the page's — `product()`, or the instance for a page of the instance —: { address, host, tokenKey }
  // from `products`, less an entry that is the instance's own repository; null where they name none, several, or the page's own.
  function namedBy(instruction) {
    const listed = (setup.products?.() ?? []).filter((each) => !sameAddress(each.address, instanceWeb));
    const address = namedProduct(instruction, listed);
    if (address === null || sameAddress(address, pageOf().address)) return null;
    const { host, tokenKey } = listed.find((each) => each.address === address);
    return { address, host, tokenKey };
  }

  // A repository on GitHub not set up for what the run reads (UC-049 4c, UC-010): `lack` from hand-over.mjs' actionsLack, put on the page with `place`. Nothing was handed over; what
  // is missing is named, and each file of the job workflow that stands outdated, with the commit the job workflow pins and this instance's, seven digits each, or, where the two are the
  // same or the file pins none, that it stands with another text; a secret this browser keeps no value for is named with the server's page of the repository's secrets; while setUp can
  // set anything up, the button Set up GitHub Actions, whose one person's click runs setUp, which writes the outdated files again, and then `proceed` — the hand-over or the spawn the
  // person's Send asked for —, with no further click; a secret the run reads that is still missing then holds it back as before.
  function showLack(page, lack, proceed, place) {
    const lines = [`Nothing was handed over: ${repositoryPath(page.address)} is not set up for GitHub Actions.`];
    if (lack.missing.length > 0) lines.push(`Missing: ${lack.missing.join(" · ")}`);
    const outdated = lack.outdated ?? [];
    if (outdated.length > 0) {
      const { instance: ours = null, product: theirs = null } = lack.pins ?? {};
      lines.push(`Outdated: ${outdated.join(", ")}: ${theirs !== null && ours !== null && theirs !== ours
        ? `the job workflow pins ${theirs.slice(0, 7)}, this instance is ${ours.slice(0, 7)}` : "it stands with another text than this instance gives"}`);
    }
    const parts = [problem(lines.join(" "))];
    if (lack.unknown.length > 0) {
      parts.push(el("p", "unknown-secrets", `This browser keeps no value for ${lack.unknown.join(", ")}: add ${lack.unknown.length > 1 ? "them" : "it"} on the server's page of this repository's secrets: `,
        secretsLink(page.host)));
    }
    if (lack.canSetUp) {
      const set = button("actions-setup", "Set up GitHub Actions");
      set.addEventListener("click", async (event) => {
        if (event?.isTrusted !== true || set.disabled || state.stopped) return; // THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
        set.disabled = true;
        let done;
        try {
          done = await lack.setUp();
        } catch (failure) {
          set.disabled = false;
          place(...parts, problem(`GitHub Actions could not be set up. ${said(failure)}`));
          return;
        }
        const told = el("p", "set-up", `Set up GitHub Actions: ${done.commit ? `committed ${done.commit}` : "every workflow file stands already"}${done.stored.length ? `; stored the secrets ${done.stored.join(", ")}` : ""}.`);
        if (done.missing.length > 0) {
          showLack(page, { missing: done.missing, outdated: done.outdated, unknown: done.unknown, canSetUp: false }, proceed, (...nodes) => place(told, ...nodes));
          return;
        }
        place(told);
        await proceed();
      });
      parts.push(set);
    }
    place(...parts);
  }

  // The subject of a message about a named product: that product as its page, naming that the message named it, and none of the shown page's artifact parameters;
  // the shown subject's entry, refuses and withhold stay.
  const aboutSubject = (shown, about) => ({ ...shown, key: `about/product=${encodeURIComponent(about.address)}`, title: `About ${repositoryPath(about.address)}`,
    paramsFor: () => ({ page: `The product ${about.address}, which the person's message names; the page shown is another.` }), draftRoute: null });
  const aboutLine = (about) => el("p", "about", `About ${repositoryPath(about.address)} — named in your message.`);
  // Nothing is sent about a product this browser keeps no token for: the bar names it and links adding it (UC-001).
  function noTokenFor(about, verb) {
    const add = button("add-product-link", "Add the product and its token");
    add.addEventListener("click", () => setup.go("add-product"));
    show(problem(`Nothing was ${verb}. Your message names the product ${about.address}, and this browser keeps no token for it.`), add);
  }

  // Appends one entry to the conversation record of the repository the page is held on: the record the tab keeps for it, or a new one.
  async function record(page, person, entry) {
    const records = readTabValue(store, RECORDS) ?? {};
    const held = records[page.address] ?? { path: conversationPath(entry.at), startedBy: person };
    const done = await appendToConversation(page.host, held, entry);
    writeTabValue(store, RECORDS, { ...records, [page.address]: held });
    return done;
  }

  // The jobs handed over and still running are kept in the tab so that the next page goes on following them; a tab that keeps nothing follows them on this page only.
  function keepJobs() {
    const running = [...state.jobs.entries()].filter(([, job]) => !job.ended).map(([id, job]) => ({ id, address: job.address }));
    try {
      writeTabValue(store, JOB, running.length ? running : null);
    } catch { /* the tab keeps no values */ }
  }

  // Stop is for the message that runs in this tab, or else for every job followed that has not ended.
  const following = () => [...state.jobs.values()].some((job) => !job.ended);
  const refreshStop = () => { stop.disabled = state.controller === null && !following(); };

  // A line of a job's end that names a job it handed over (MOD-workflow-entries): `handed over: <kind> — <JOB-id>`.
  const HANDED_OVER = /^handed over: \S+ — (JOB-\S+)$/;

  // A job followed, as the last poll saw it, in its own part of the bar.
  function showJob(view, job) {
    job.ended = view.end !== null;
    keepJobs();
    refreshStop();
    const route = view.route ?? "";
    const waiting = view.end !== null || route === "" ? [] : [el("p", "waiting", route.startsWith("bridge ") ? `waiting for the Bridge ${route.split(/\s+/)[1]}` : "waiting for GitHub Actions")];
    const secret = view.missingSecret === null ? [] : [el("p", "missing-secret", `Not run: the secret ${view.missingSecret} is missing. Add it on the server's page of this repository's secrets: `, secretsLink(job.host))];
    const run = view.address === null ? [] : [el("p", "run-address", "Run: ", linkTo(view.address))];
    const ended = view.end === null ? [] : [el("p", "ended", `Ended: ${view.end.state}`),
      ...(view.end.reason ? [el("p", "reason", `Reason: ${view.end.reason}`)] : []),
      ...(view.end.results.length ? [el("ul", "commits", ...view.end.results.map((each) => el("li", "commit", each)))] : [])];
    job.node.replaceChildren(el("h3", null, `Handed over: ${view.id}`), el("p", "state", `State: ${view.state ?? "reading…"}`), ...waiting, ...secret, ...run,
      ...(view.lines.length ? [el("pre", "log", view.lines.join("\n"))] : []), ...ended, ...(view.cancel ? [el("p", "cancel", view.cancel)] : []),
      ...(view.problem ? [problem(view.problem)] : []), ...(job.review ? [job.review] : []));
    // The run's answer joins the conversation once (UC-049 4a.5).
    if (view.answer && !state.answered.has(view.id)) {
      state.answered.add(view.id);
      keep([...conversationOf(store), { at: new Date(), from: "participant", who: state.spawnedBy ?? view.id, text: view.answer, subject: setup.subject().key }]);
      if (view.end?.state === "done") keepAnswerDraft(view, job).catch((failure) => job.node.append(problem(`The draft could not be kept. ${said(failure)}`)));
    }
    // A job that is the endpoint's own (UC-049 4f): each job its end lists as handed over is followed the same way; the pieces it did not hand over stand among its results.
    for (const line of view.end?.results ?? []) {
      const handed = HANDED_OVER.exec(line)?.[1];
      if (handed) follow({ id: handed, address: job.address }, job.host);
    }
  }

  // A job ended on CI whose kind leaves its result to a person and whose writer writes nothing — its review `person`, its writer `return-draft`, as propose-groups —: the draft its answer
  // holds, read by the kind's schema of its draft, is kept as the conversation's draft of that kind with the job's parameters, as the draft of a piece run in this tab is, and Review the
  // draft stands under the job (UC-049 4a.1, 4a.5). An answer that holds no such draft keeps none.
  async function keepAnswerDraft(view, job) {
    const kind = await kindOf(view.kind);
    if (kind.review !== "person" || kind.writer !== "return-draft") return;
    const draft = (await import("./follow.mjs")).draftIn(view.answer, kind);
    if (draft === null) return;
    const subject = setup.subject();
    const result = { draft, raw: null, drafter: null, rounds: Array.isArray(view.end.rounds) ? view.end.rounds : [], remaining: [], forPerson: [], stepFindings: [], classes: null,
      stoppedBecause: view.end.stoppedBecause ?? "passed", gate: null, usage: null, written: null };
    const params = view.params ?? {};
    const participant = { name: view.participant ?? view.id };
    writeTabValue(store, DRAFT, { subject: subject.key, kind: kind.name, participant: participant.name, params, result });
    // A job queued in another product's repository than the page's leads to the review pages' `draft` with that product named (UC-049 3d).
    const about = sameAddress(job.address, pageOf().address) ? null : { address: job.address };
    job.review = reviewButton(subject, kind.name, participant, params, result, about);
    job.node.append(job.review);
  }

  // A job is followed in the repository it was queued in: the page's, or the product the message named. A job followed already is not followed twice.
  function follow(job, host = pageOf().host) {
    if (state.jobs.has(job.id)) return;
    const node = el("div", "job");
    followed.append(node);
    const entry = { node, address: job.address, host, ended: false, follower: null };
    state.jobs.set(job.id, entry);
    entry.follower = followJob({ id: job.id, address: job.address, host, store, show: (view) => showJob(view, entry) });
    keepJobs();
    refreshStop();
  }

  // Stop on the jobs followed: each one that has not ended is cancelled at its runtime, one after the other, since each cancel commits on the head it read.
  async function cancelAll() {
    for (const job of [...state.jobs.values()].filter((each) => !each.ended)) await job.follower.cancel();
  }

  // A piece of the plan the participant proposed: the route it would take; it is queued as a job of the participant's own — no start rule of the product's process applies, its kind's own
  // preconditions refuse it where they find something —, and the bar follows it. `where` says where it stands; `queued` collects the job where the plan's own Send queues it, so that the
  // conversation record names every job of the plan in one section; a piece queued later, after Set up GitHub Actions, is recorded by itself.
  async function proposeHandOver(section, handOver, participant, subject, about = null, where = el("p", "where"), queued = null) {
    const outcome = el("div", "outcome", el("p", "checking", "Checking whether it can start…"));
    section.append(el("p", "proposed", `Participant: ${participant.name} — ${placeOf(participant)}`), outcome);
    // A repository on GitHub is set up with Set up GitHub Actions (showLack); one on GitLab keeps the link to the route settings, whose product section installs the job workflow.
    const onGitHub = (assessment) => assessment.snapshot.repository.server === "github";
    const render = (assessment) => {
      const parts = [el("p", "route", assessment.route ? `Route: ${assessment.routeText}` : `Route: not available — ${assessment.routeText}`)];
      if (assessment.needsWorkflow && !onGitHub(assessment)) {
        const set = button("settings-link", "Set up the job workflow");
        set.addEventListener("click", () => setup.go("settings"));
        parts.push(set);
      }
      outcome.replaceChildren(...parts);
    };
    // Queued at once where nothing keeps the work from starting: the person's Send, whose answer proposed it, is the request (UC-049 4a.2).
    async function queueNow(assessment) {
      try {
        const page = about ?? pageOf();
        // The job takes, beside what it works on, only the bar's `source`, the person's account (THE PERSON WHO PROMPTS IS A SOURCE) — no other parameter, so that
        // no message and no page text enters the job's record (A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON).
        const fresh = assessment;
        const source = (await sendPart()).sourceOf(fresh.instanceSnapshot) ?? undefined;
        const conversation = (await recordingOf(fresh.instanceSnapshot)) ? (readTabValue(store, RECORDS) ?? {})[page.address]?.path ?? null : null;
        const job = await (await handPart()).queue({ handOver, participant, assessment: fresh, store, instance, page, ofProduct: about !== null || setup.product() !== null, conversation, source });
        outcome.append(el("p", "queued", `Queued as ${job.id}.`));
        const route = assessment.route;
        where.replaceChildren(route.kind === "bridge" ? `on ${route.bridge} — ${job.id}` : `waiting for GitHub Actions — ${job.id}`);
        follow({ id: job.id, address: page.address }, page.host);
        if (conversation !== null) {
          if (queued?.open) queued.jobs.push({ id: job.id, page, person: job.person });
          else await recordHandedOver(page, job.person, [job.id], outcome);
        }
      } catch (failure) {
        const findings = failure?.name === "NotStartable" && Array.isArray(failure.findings) ? failure.findings : [];
        where.replaceChildren("not handed over");
        outcome.append(problem(findings.length > 0 ? "Nothing was queued." : `Nothing was queued. ${said(failure)}`),
          ...(findings.length > 0 ? [el("ul", "reasons", ...findings.map((each) => el("li", "reason", sending.shown(each))))] : []));
      }
    }
    // On GitHub, before it is queued on the CI route, or while only the job workflow holds it back, what the run reads is asked of actionsSetup (UC-049 4c): with something missing or outdated,
    // nothing is handed over, and Set up GitHub Actions sets up, assesses the hand-over again on the head the setup left and queues it; setUp itself says what it left missing.
    const page = about ?? pageOf();
    async function assessAndQueue(check = true) {
      const hand = await handPart();
      const assessment = await hand.assess({ handOver, participant, instance, page, connections: reached });
      render(assessment);
      if (check && onGitHub(assessment) && (assessment.route?.kind === "ci" || assessment.needsWorkflow)) {
        const lack = await hand.actionsLack({ participant, page, instance, store, snapshot: assessment.snapshot });
        if (lack !== null) {
          const lacking = el("div", "actions-setup-lack");
          outcome.append(lacking);
          showLack(page, lack, () => assessAndQueue(false).catch((failure) => outcome.append(problem(`It could not be checked whether this can start. ${said(failure)}`))),
            (...nodes) => lacking.replaceChildren(...nodes));
          return;
        }
      }
      if (assessment.route !== null) await queueNow(assessment);
      else where.replaceChildren("not handed over");
    }
    try {
      await assessAndQueue();
    } catch (failure) {
      where.replaceChildren("not handed over");
      outcome.replaceChildren(problem(`It could not be checked whether this can start. ${said(failure)}`));
    }
  }

  // The jobs a message's plan handed over, appended to the conversation record of their repository as one section, one line per job; a failure is said beside the plan.
  async function recordHandedOver(page, person, ids, place) {
    try {
      await record(page, person, { at: new Date(), job: ids });
    } catch (failure) {
      place.append(problem(`The hand-over could not be recorded in the conversation. ${said(failure)}`));
    }
  }

  function showAnswer(result, ready, subject, participant, about = null) {
    const draft = result.draft;
    if (result.stoppedBecause === "unusable" || draft === null || draft === undefined) {
      const raw = el("details", "raw", el("summary", null, "The answer as received"), el("pre", null, result.raw ?? ""));
      show(problem("The participant's answer could not be read. Nothing was changed."), raw);
      return null;
    }
    const text = typeof draft.answer === "string" ? draft.answer : "";
    const left = [...result.remaining, ...result.forPerson];
    const parts = [el("p", "rounds", `Rounds: ${result.rounds.length}`)];
    if (left.length) parts.push(el("ul", "left", ...left.map((each) => el("li", "finding", sending.shown(each)))));
    // The edits the participant proposed are a draft, which the review pages show against the current text.
    if (Array.isArray(draft.edits) && draft.edits.length > 0) parts.push(reviewButton(subject, ready.prepared.kind.name, participant, ready.prepared.params, result, about));
    status.append(...parts);
    return text;
  }

  // *Review the draft*: keeps the ConversationDraft in the tab and goes to the subject's draft route, or to the review pages' `draft` for the subject's key. The parameters kept are
  // those of the job less `page`, so that the draft route's own page stands as the context of a follow-up. For a message about a named product, the review pages'
  // `draft` is opened with that product named in `go`'s `product` (UC-049 3d).
  function reviewButton(subject, kind, participant, params, result, about = null) {
    const review = button("review", "Review the draft");
    review.addEventListener("click", () => {
      const { page: _page, ...kept } = params;
      writeTabValue(store, DRAFT, { subject: subject.key, kind, participant: participant.name, params: kept, result });
      if (about) setup.go("draft", { subject: subject.key, product: about.address });
      else setup.go(subject.draftRoute ?? `draft/subject=${encodeURIComponent(subject.key)}`);
    });
    return review;
  }

  // One line of the plan, an entry of its numbered list: the piece's section — its kind, what it works on, its task, and, beside it, where it stands.
  async function pieceLine(piece) {
    const { worksOnOf } = await handPart();
    const where = el("p", "where");
    const item = el("section", "hand-over", el("p", "kind", `Kind: ${piece.kind}`), el("p", "works-on", `Works on: ${worksOnOf(piece).join(", ")}`), el("p", "task", `Task: ${piece.task}`), where);
    return { line: el("li", "piece", item), item, where };
  }
  const planSection = (list) => el("section", "plan", el("h3", null, "The participant plans this"), list);
  // A piece that rests on an earlier one is not handed over: it waits for that piece's result to be accepted, and the person's message that says so plans it again.
  const waitsFor = (after) => `waits for ${after.join(" and ")} to be accepted: it can start only once ${after.length > 1 ? "those are" : "that is"} accepted — tell me here when it is`;
  // Whether a piece runs in this tab: its kind is not the bar's own, its result waits for the person, and the participant can do it (UC-049 4a.1).
  const runsHere = (kind, participant) => kind.name !== BAR_KIND && kind.review === "person" && eligible([participant], { capabilities: kind.needs }).eligible.length > 0;

  // The plan the participant proposed, carried out without a further click (UC-049 4a): a numbered list of its pieces; each piece whose `after` is empty a job of its own — in this tab
  // where its kind's result waits for the person and the participant can do the kind, the first at once and each next one once the draft before it is saved or discarded; else queued as a
  // job of the participant's own and followed —; a piece whose `after` names another shown as waiting for its acceptance.
  async function carryOutPlan(plan, participant, subject, conversation, signal, about = null) {
    const list = el("ol", "pieces");
    status.append(planSection(list));
    const here = [], queued = { open: true, jobs: [] };
    for (const [at, piece] of plan.entries()) {
      const { line, item, where } = await pieceLine(piece);
      list.append(line);
      const after = (Array.isArray(piece.after) ? piece.after : []).filter((number) => Number.isInteger(number));
      if (after.length > 0) { where.replaceChildren(waitsFor(after)); continue; }
      let kind;
      try {
        kind = await kindOf(piece.kind);
      } catch (failure) {
        where.replaceChildren("not handed over");
        item.append(problem(`Nothing was handed on. ${said(failure)}`));
        continue;
      }
      if (runsHere(kind, participant)) { here.push({ number: at + 1, piece, item, where }); continue; }
      // The conversation itself handed on (the bar's own kind) goes on as a job, as a kind the tab cannot run does: the endpoint's own (UC-049 4a.2).
      await proposeHandOver(item, piece, participant, subject, about, where, queued);
    }
    queued.open = false;
    if (queued.jobs.length > 0) await recordHandedOver(queued.jobs[0].page, queued.jobs[0].person, queued.jobs.map((job) => job.id), status);
    if (here.length === 0) return;
    for (const later of here.slice(1)) later.where.replaceChildren("after the draft before it");
    keepPlan(here.length > 1 ? { participant: participant.name, about: about?.address ?? null, pieces: here.slice(1).map(({ number, piece }) => ({ number, ...piece })) } : null);
    await runHere(here[0], participant, subject, conversation, signal, about);
  }

  // The pieces of a plan that run in this tab after the draft before them, kept in the tab, so that the next page goes on with them.
  function keepPlan(plan) {
    try { writeTabValue(store, PLAN, plan); } catch { /* the tab keeps no values */ }
  }

  // A piece of the plan run in this tab, attended, as a message runs (UC-049 4a.1): prepared for its kind with `hand-over` among its refuses, its record queued on the tab's route, run
  // with that record, and its result kept as the conversation's draft of that kind, which *Review the draft* leads to.
  async function runHere({ piece, item, where }, participant, subject, conversation, signal, about = null) {
    where.replaceChildren("runs here");
    let ready;
    try {
      ready = await (await sendPart()).prepareHandOver({ handOver: piece, subject, participant, conversation, store, instance, product: about ?? setup.product(), connections: reached });
    } catch (failure) {
      where.replaceChildren("not handed over");
      item.append(problem(`Nothing was run. ${said(failure)}`));
      return;
    }
    const reasons = sending.whyNot(ready.prepared, offered);
    if (reasons.length) {
      where.replaceChildren("not handed over");
      item.append(problem("Nothing was run."), el("ul", "reasons", ...reasons.map((reason) => el("li", "reason", reason))));
      return;
    }
    let held;
    try {
      const page = about ?? pageOf();
      const recorded = ready.recording ? (readTabValue(store, RECORDS) ?? {})[page.address]?.path ?? null : null;
      held = await sending.queueHere(ready, piece, { conversation: recorded, source: ready.prepared.params.source });
    } catch (failure) {
      where.replaceChildren("not handed over");
      item.append(problem(`Nothing was run. ${said(failure)}`));
      return;
    }
    where.replaceChildren(`runs here — ${held.id}`);
    item.append(el("p", "running", `Running ${piece.kind} in this tab…`));
    running = { kind: piece.kind, participant: participant.name, started: new Date() };
    const result = await sending.runHere(ready, held, { signal });
    if (result.stoppedBecause === "unusable" || !result.draft) {
      item.append(problem("The answer could not be read. Nothing was changed."), el("details", "raw", el("summary", null, "The answer as received"), el("pre", null, result.raw ?? "")));
      return;
    }
    const left = [...result.remaining, ...result.forPerson];
    // The conversation keeps one draft: this piece's, until the person saves or discards it; the next piece run here waits for that.
    const { page: _page, ...kept } = ready.prepared.params;
    writeTabValue(store, DRAFT, { subject: subject.key, kind: piece.kind, participant: participant.name, params: kept, result });
    item.append(el("p", "rounds", `Rounds: ${result.rounds.length}`), ...(left.length ? [el("ul", "left", ...left.map((each) => el("li", "finding", sending.shown(each))))] : []),
      reviewButton(subject, piece.kind, participant, ready.prepared.params, result, about));
  }

  // The next piece of a plan kept in the tab runs once the draft before it is saved or discarded — the conversation's draft is then dropped — and nothing runs in this tab: asked when the bar
  // is drawn and whenever its input takes focus.
  async function continuePlan() {
    if (state.controller || state.stopped) return;
    let plan = null, draft = null;
    try { plan = readTabValue(store, PLAN); draft = readTabValue(store, DRAFT); } catch { return; }
    if (!plan?.pieces?.length || draft !== null) return;
    const participant = offered.find((each) => each.name === plan.participant) ?? null;
    const [next, ...rest] = plan.pieces;
    keepPlan(rest.length ? { ...plan, pieces: rest } : null);
    const list = el("ol", "pieces");
    show(planSection(list));
    const lines = [];
    for (const piece of plan.pieces) {
      const line = await pieceLine(piece);
      list.append(line.line);
      lines.push(line);
    }
    for (const later of lines.slice(1)) later.where.replaceChildren("after the draft before it");
    if (participant === null) {
      lines[0].where.replaceChildren("not handed over");
      lines[0].item.append(problem(`Nothing was run: ${plan.participant}, who planned it, is not offered here.`));
      return;
    }
    const about = plan.about ? (setup.products?.() ?? []).find((each) => sameAddress(each.address, plan.about)) ?? null : null;
    const controller = new AbortController();
    state.controller = controller;
    send.disabled = true;
    refreshStop();
    try {
      await runHere({ piece: next, item: lines[0].item, where: lines[0].where }, participant, setup.subject(), conversationOf(store), controller.signal, about);
    } catch (failure) {
      lines[0].item.append(controller.signal.aborted || failure?.name === "Cancelled" ? problem("Stopped. Nothing was written.") : problem(said(failure)));
    } finally {
      state.controller = null;
      running = null;
      refreshStop();
      send.disabled = false;
    }
  }

  async function onSend(event) {
    if (event?.isTrusted !== true) return; // THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK: a script's click sends nothing and records nothing
    if (state.controller || state.stopped) return;
    const instruction = input.value.trim();
    if (instruction === "") { show(problem("Write a message first.")); return; }
    const participant = await rejudged();
    if (participant === null) { show(problem("Nothing was sent. No participant can do this kind of message.")); return; }
    if (throughActions(participant, store)) { await onSpawn(participant, instruction); return; }
    const controller = new AbortController();
    state.controller = controller;
    send.disabled = true;
    show();
    try {
      // A message that names another product is about that product (UC-049 3d): it is the message's page, and nothing is sent without its token.
      const about = namedBy(instruction);
      if (about !== null && !(await sendPart()).keepsTokenFor(store, about.address)) { noTokenFor(about, "sent"); return; }
      const subject = about ? aboutSubject(setup.subject(), about) : setup.subject();
      const earlier = conversationOf(store);
      let ready;
      try {
        ready = await (await sendPart()).prepareMessage({ subject, participant, instruction, conversation: earlier, store, instance, product: about ?? setup.product(), connections: reached });
      } catch (failure) {
        show(problem(`Nothing was sent. ${said(failure)}`));
        return;
      }
      showRecording(ready.recording);
      const reasons = sending.whyNot(ready.prepared, offered);
      if (reasons.length) {
        show(problem("Nothing was sent."), el("ul", "reasons", ...reasons.map((reason) => el("li", "reason", reason))));
        return;
      }
      // A CLI session is not run in this tab: its Bridge starts it in its checkout, where it does the work itself, with no loop, tool or plan of the bar (UC-049 step 4).
      const session = sending.isSession(participant);
      const to = ready.prepared.destinations.map((each) => el("li", "destination", `${each.participant.name} — ${each.place || "no processing place declared"}`));
      show(...(about ? [aboutLine(about)] : []), el("p", "sends", "Sent to:"), el("ul", "destinations", ...to),
        ...(session ? [] : [el("p", "limit", `The correction loop runs at most ${ready.prepared.limit} rounds.`)]));
      const who = ready.person ?? "person";
      if (ready.recording) {
        if (ready.person === null) {
          show(problem("Nothing was sent. Conversations are recorded here, and no token for this repository is stored in this browser to record with."));
          return;
        }
        try {
          await record(ready.page, ready.person, { at: new Date(), who, page: subject.title, text: instruction, withheld: subject.withhold?.(instruction) ?? undefined });
        } catch (failure) {
          show(problem(`Nothing was sent. The message could not be recorded: ${said(failure)}`));
          return;
        }
      }
      keep([...earlier, { at: new Date(), from: "person", who, text: instruction, subject: subject.key }]);
      input.value = "";
      running = { kind: BAR_KIND, participant: participant.name, started: new Date() };
      stop.disabled = false;
      const result = session ? null : await sending.runMessage(ready, { signal: controller.signal });
      // A CLI session's answer is shown as it gave it.
      const answered = session ? (await sending.runSession(ready)).text : showAnswer(result, ready, subject, participant, about);
      if (answered !== null) {
        keep([...conversationOf(store), { at: new Date(), from: "participant", who: participant.name, text: answered, subject: subject.key }]);
        if (ready.recording) {
          try {
            await record(ready.page, ready.person, { at: new Date(), who: participant.name, page: subject.title, model: participant.model ?? undefined, text: answered,
              withheld: subject.withhold?.(answered) ?? undefined });
          } catch (failure) {
            status.append(problem(`The answer could not be recorded: ${said(failure)}`));
          }
        }
        // The plan the answer proposes goes on now, within the same Send: Stop ends it as it ends the message.
        if (Array.isArray(result?.draft?.handOver) && result.draft.handOver.length > 0) {
          keepPlan(null);
          await carryOutPlan(result.draft.handOver, participant, subject, conversationOf(store), controller.signal, about);
        }
      }
    } catch (failure) {
      show(controller.signal.aborted || failure?.name === "Cancelled" ? problem("Stopped. Nothing was written.") : problem(said(failure)));
    } finally {
      state.controller = null;
      running = null;
      refreshStop();
      send.disabled = false;
    }
  }

  // *Spawn job*: the message is the task of a job that is the endpoint's own, spawned on GitHub Actions (UC-049 4a) — one click, the person's. The task travels in the
  // workflow's inputs and is written to no file; with recording on, the message is recorded first, as a sent message is. The bar then follows the job until it has
  // ended and shows the answer its run left (follow.mjs).
  // One spawn at a time: `work` runs while Spawn job is disabled, and a failure is shown by name.
  async function spawning(work) {
    if (state.spawning || state.stopped) return;
    state.spawning = true;
    send.disabled = true;
    try {
      await work();
    } catch (failure) {
      const findings = failure?.name === "NotStartable" && Array.isArray(failure.findings) ? failure.findings : [];
      show(problem(findings.length > 0 ? "Nothing was spawned." : `Nothing was spawned. ${said(failure)}`),
        ...(findings.length > 0 ? [el("ul", "reasons", ...findings.map((each) => el("li", "reason", sending.shown(each))))] : []));
    } finally {
      state.spawning = false;
      send.disabled = false;
    }
  }

  async function onSpawn(participant, instruction) {
    await spawning(async () => {
      show(el("p", "spawning", `Spawning a job for ${participant.name} — ${placeOf(participant)} on GitHub Actions…`));
      // A message that names another product spawns its job in that product's repository (UC-049 3d), and nothing without its token.
      const about = namedBy(instruction);
      if (about !== null && !(await sendPart()).keepsTokenFor(store, about.address)) { noTokenFor(about, "spawned"); return; }
      const subject = about ? aboutSubject(setup.subject(), about) : setup.subject();
      const page = about ?? pageOf();
      const instanceSnapshot = await (await sendPart()).defaultSnapshot(instance.host);
      // On GitHub, before anything is written, what the run reads is asked of actionsSetup (UC-049 4c): with something missing or outdated, nothing is handed over, and Set up GitHub Actions
      // sets up and then spawns, as the person's Spawn job asked. The instance's default branch read above is the page's for a page of the instance.
      const lack = await (await handPart()).actionsLack({ participant, page, instance, store, snapshot: sameAddress(page.address, instanceWeb) ? instanceSnapshot : null });
      if (lack !== null) {
        showLack(page, lack, () => spawning(() => spawnNow(participant, instruction, about, subject, page)), show);
        return;
      }
      await spawnNow(participant, instruction, about, subject, page, instanceSnapshot);
    });
  }

  // The spawn itself, once nothing the run reads is missing: the message recorded where recording is on, the job spawned and followed. `instanceSnapshot` is read again where none is given.
  async function spawnNow(participant, instruction, about, subject, page, given = null) {
    const instanceSnapshot = given ?? await (await sendPart()).defaultSnapshot(instance.host);
    const recordingOn = await recordingOf(instanceSnapshot);
    showRecording(recordingOn);
    // The bar's source, the person's account (THE PERSON WHO PROMPTS IS A SOURCE).
    const source = sending.sourceOf(instanceSnapshot) ?? undefined;
    const who = sending.personOf(store, instanceSnapshot, false) ?? "person";
    if (recordingOn) await record(page, who, { at: new Date(), who, page: subject.title, text: instruction, withheld: subject.withhold?.(instruction) ?? undefined });
    const conversationPath = recordingOn ? (readTabValue(store, RECORDS) ?? {})[page.address]?.path ?? null : null;
    const spawned = await (await handPart()).spawnEndpointJob({ kind: BAR_KIND, task: instruction, participant, store, instance, page, ofProduct: about !== null || setup.product() !== null,
      conversation: conversationPath, source, entry: subject.entry, instanceSnapshot, connections: reached });
    if (spawned.refused) {
      const parts = [problem(`Nothing was spawned: ${spawned.refused}.`)];
      if (spawned.needsWorkflow) {
        const set = button("settings-link", "Set up the job workflow");
        set.addEventListener("click", () => setup.go("settings"));
        parts.push(set);
      }
      show(...parts);
      return;
    }
    keep([...conversationOf(store), { at: new Date(), from: "person", who, text: instruction, subject: subject.key }]);
    input.value = "";
    state.spawnedBy = participant.name;
    show(...(about ? [aboutLine(about)] : []), el("p", "queued", `Spawned as ${spawned.id} on GitHub Actions.`));
    follow({ id: spawned.id, address: page.address }, page.host);
  }

  // The label of the button for the one chosen now: *Spawn job* where it runs through GitHub Actions.
  function prefill(event) {
    if (state.stopped || typeof event?.detail !== "string") return;
    input.value = event.detail;
    input.focus?.();
  }

  const relabel = () => {
    const label = offered.length > 0 && throughActions(chosen(), store) ? SPAWN : SEND;
    if (send.textContent !== label) send.replaceChildren(label);
  };

  // The participants reached that can do the kind of the subject now (UC-019 2): `eligible` judges them against the `needs` of the kind's
  // definition. The subject is a getter, so the offer is drawn from it whenever the bar is used: when the bar is drawn, when its input or its
  // selector takes focus, and on *Send*. Where some are reached and none can, the bar says so, names what the kind needs and links the route
  // `endpoints` (UC-019 3a).
  async function judge() {
    const kind = await kindOf(BAR_KIND);
    if (state.stopped) return;
    offered = eligible(reached, { capabilities: kind.needs }).eligible;
    // The participant talked to is kept in the tab (Data: the conversation), so that a reload or the next page offers it first again.
    let kept = selector?.value;
    if (kept === undefined) {
      try { kept = readTabValue(store, CHOSEN) ?? undefined; } catch { /* the tab keeps no values */ }
    }
    if (offered.length === 0) {
      selector = null;
      offeredNames = null;
      const link = button("endpoints-link", "Set up endpoints");
      link.addEventListener("click", () => setup.go("endpoints"));
      chooser.replaceChildren(el("p", "none-able", `No endpoint or CLI session of this browser can do ${kind.name}: it needs ${kind.needs.join(", ")}.`), link);
      return;
    }
    const named = (each) => `${keyOf(each)} — ${placeOf(each)}`;
    // The same offer keeps its selector: replacing it while it takes focus would close its list before a choice is made.
    const names = offered.map(keyOf).join("\n");
    if (selector && names === offeredNames) return relabel();
    offeredNames = names;
    if (offered.length === 1) {
      selector = el("span", "participant", named(offered[0]));
    } else {
      selector = el("select", "participant");
      for (const each of offered) {
        const option = el("option", null, named(each));
        option.value = keyOf(each);
        selector.append(option);
      }
      selector.value = offered.some((each) => keyOf(each) === kept) ? kept : keyOf(offered[0]);
      selector.addEventListener("focus", () => judge().catch(() => {}));
      selector.addEventListener("change", (event) => {
        try { writeTabValue(store, CHOSEN, event.target.value); } catch { /* the tab keeps no values */ }
        relabel();
      });
    }
    chooser.replaceChildren(selector);
    relabel();
  }

  // The participant a message goes to: the offer is judged again for the subject now, then the chosen one is taken; null where none can.
  async function rejudged() {
    await judge();
    return offered.length === 0 ? null : chosen();
  }

  async function draw() {
    // The instance's default branch as the page's own load read it, where the page hands it (setup.instanceSnapshot), else read here, narrowed to the one
    // file the bar reads as it is drawn: whether conversations are recorded.
    const snapshot = (await setup.instanceSnapshot?.()) ?? await instance.host.readSnapshot((await instance.host.repositoryInfo()).defaultBranch, { folders: [SWITCH] });
    instanceWeb = snapshot.repository.web;
    // This browser's configuration (UC-049 1): its endpoints, then the CLI sessions its Bridges offer; no participant list is read for the offer.
    reached = [...endpointsOffered(store), ...await sessionsOffered(store)];
    if (reached.length === 0 || state.stopped) return;
    await judge();
    if (state.stopped) return;
    input.addEventListener("focus", () => judge().then(continuePlan).catch(() => {}));
    // A page puts a prompt into the bar with the event `agent-m:prompt` (detail: the text): it stands in the input, focused, and nothing is sent until the person sends it.
    globalThis.addEventListener?.("agent-m:prompt", prefill);
    showRecording(await recordingOf(snapshot));
    send.addEventListener("click", onSend);
    // Clear conversation empties the tab's conversation and what the bar shows of the last message; while a message runs it does nothing — Stop ends that first.
    clear.addEventListener("click", () => {
      if (send.disabled) return;
      keep([]);
      status.replaceChildren();
    });
    stop.addEventListener("click", () => (state.controller ? state.controller.abort() : cancelAll()));
    conversation.replaceChildren(...conversationOf(store).map(line));
    // Below the message field: on the left the folded explanation, on the right the buttons.
    const notes = el("div", "bar-notes", clear, " ", setup.explain("prompt-bar"));
    // The grip on the bar's top edge: dragged, or moved with the arrow keys, it sets how much of the window the bar takes; the tab keeps it (Data: the conversation).
    const grip = el("div", "bar-grip");
    grip.setAttribute("role", "separator");
    grip.setAttribute("aria-orientation", "horizontal");
    grip.setAttribute("aria-label", "Drag up or down, or use the arrow keys, to set the height of the prompt bar");
    grip.setAttribute("tabindex", "0");
    const bar = el("section", "prompt-bar", grip, recorded, chooser, conversation, input, el("div", "bar-foot", notes, el("div", "buttons", send, stop)), status, followed);
    bar.setAttribute("data-page", setup.page);
    // "fixed to the bottom of the window" (Interfaces: startPromptBar): the bar's own root element carries the style, as Parts name no style sheet.
    bar.setAttribute("style", FIXED);
    const sized = (height) => {
      const highest = Math.round((globalThis.innerHeight ?? 800) * 0.9);
      const kept = Math.max(LOWEST, Math.min(highest, Math.round(height)));
      bar.setAttribute("style", `${FIXED} height: ${kept}px; max-height: ${kept}px;`);
      grip.setAttribute("aria-valuenow", String(kept));
      try { writeTabValue(store, HEIGHT, kept); } catch { /* the tab keeps no values */ }
      return kept;
    };
    let held = null;
    try { held = readTabValue(store, HEIGHT); } catch { /* the tab keeps no values */ }
    if (typeof held === "number") sized(held);
    const current = () => bar.offsetHeight || held || LOWEST;
    grip.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault?.();
      held = sized(current() + (event.key === "ArrowUp" ? STEP : -STEP));
    });
    grip.addEventListener("pointerdown", (event) => {
      event.preventDefault?.();
      grip.setPointerCapture?.(event.pointerId);
      const move = (moved) => { held = sized((globalThis.innerHeight ?? 800) - moved.clientY); };
      const end = () => { grip.removeEventListener("pointermove", move); grip.removeEventListener("pointerup", end); grip.removeEventListener("pointercancel", end); };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", end);
      grip.addEventListener("pointercancel", end);
    });
    target.replaceChildren(bar);
    // The jobs handed over on an earlier page of this tab go on being followed, and a plan's next piece run here goes on once the draft before it is dropped.
    let handedOver = null;
    try {
      handedOver = readTabValue(store, JOB);
    } catch { /* the tab keeps no values */ }
    for (const job of [handedOver ?? []].flat()) if (job?.address === pageOf().address) follow(job);
    await continuePlan();
  }

  draw().catch((failure) => {
    if (!state.stopped) target.replaceChildren(problem(`The prompt bar could not be drawn. ${said(failure)}`));
  });

  return {
    stop() {
      globalThis.removeEventListener?.("agent-m:prompt", prefill);
      state.stopped = true;
      state.controller?.abort();
      for (const job of state.jobs.values()) job.follower?.stop();
      target.replaceChildren();
    },
  };
}
