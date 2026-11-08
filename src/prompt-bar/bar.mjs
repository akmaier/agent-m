// MOD-prompt-bar, bar.mjs — the bar (docs/architecture/MOD-prompt-bar.md: Parts, Interfaces: startPromptBar, latestDraft, dropDraft, currentJob): the
// selector, the input, *Send* and *Stop*, the conversation, the answer, and the hand-over a participant proposes: shown with its kind, what it
// works on, its task, the participant and its route (hand-over.mjs), queued as the participant's own job and followed
// until it has ended (follow.mjs), with *Stop* cancelling it.
//
// Module: MOD-prompt-bar
//
// THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION. Nothing is written or sent to a participant
// while the bar is drawn — drawing it asks each Bridge this browser keeps only testBridge's two requests, for the CLI sessions it offers (offer.mjs
// sessionsOffered) —: *Send* is the one click that sends a message, and the one that, with recording on, writes
// the conversation record first, and the request of whatever its answer hands on; only a click the browser marks as a person's (`isTrusted`)
// does. The conversation lives in the tab's values (MOD-browser-store): `prompt-bar:conversation`, a list of Messages; `prompt-bar:draft`, the
// latest ConversationDraft; `prompt-bar:records`, the record each repository's part of the conversation is appended to; and `prompt-bar:job`,
// the job handed over and followed while it runs ({ id, address }).

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
export function startPromptBar(target, setup) {
  const { store, instance } = setup;
  const state = { stopped: false, controller: null, follower: null, following: false };
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
  const chosen = () => offered.find((each) => each.name === (selector.value ?? offered[0].name)) ?? offered[0];
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

  // A repository on GitHub not set up for what the run reads (UC-049 4c, UC-010): `lack` from hand-over.mjs' actionsLack, put on the page with `place`. Nothing was handed over; a
  // secret this browser keeps no value for is named with the server's page of the repository's secrets; while setUp can set anything up, the button Set up GitHub Actions, whose one
  // person's click runs setUp and then `proceed` — the hand-over or the spawn the person's Send asked for —, with no further click; a secret the run reads that is still missing then
  // holds it back as before.
  function showLack(page, lack, proceed, place) {
    const parts = [problem(`Nothing was handed over: ${repositoryPath(page.address)} is not set up for GitHub Actions. Missing: ${lack.missing.join(" · ")}`)];
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
          showLack(page, { missing: done.missing, unknown: done.unknown, canSetUp: false }, proceed, (...nodes) => place(told, ...nodes));
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

  // The job handed over is kept in the tab so that the next page goes on following it; a tab that keeps nothing follows it on this page only.
  function keepJob(job) {
    try {
      writeTabValue(store, JOB, job);
    } catch { /* the tab keeps no values */ }
  }

  // Stop is for the message that runs in this tab, or else for the job that is followed.
  const refreshStop = () => { stop.disabled = state.controller === null && !state.following; };

  // The job followed, as the last poll saw it.
  function showJob(view) {
    state.following = view.end === null;
    if (view.end !== null) keepJob(null);
    refreshStop();
    const route = view.route ?? "";
    const waiting = view.end !== null || route === "" ? [] : [el("p", "waiting", route.startsWith("bridge ") ? `waiting for the Bridge ${route.slice("bridge ".length)}` : "waiting for GitHub Actions")];
    const secret = view.missingSecret === null ? [] : [el("p", "missing-secret", `Not run: the secret ${view.missingSecret} is missing. Add it on the server's page of this repository's secrets: `, secretsLink(state.followedHost ?? pageOf().host))];
    const run = view.address === null ? [] : [el("p", "run-address", "Run: ", linkTo(view.address))];
    const ended = view.end === null ? [] : [el("p", "ended", `Ended: ${view.end.state}`),
      ...(view.end.reason ? [el("p", "reason", `Reason: ${view.end.reason}`)] : []),
      ...(view.end.results.length ? [el("ul", "commits", ...view.end.results.map((each) => el("li", "commit", each)))] : [])];
    // The answer of the job handed on in the run, folded below the results as the run received it; it does not join the conversation.
    const handedOn = view.handedOn ? [el("details", "handed-on", el("summary", null, "The answer handed on in the run"), el("pre", null, view.handedOn))] : [];
    followed.replaceChildren(el("h3", null, `Handed over: ${view.id}`), el("p", "state", `State: ${view.state ?? "reading…"}`), ...waiting, ...secret, ...run,
      ...(view.lines.length ? [el("pre", "log", view.lines.join("\n"))] : []), ...ended, ...handedOn, ...(view.cancel ? [el("p", "cancel", view.cancel)] : []),
      ...(view.problem ? [problem(view.problem)] : []));
    // The run's answer joins the conversation once (UC-049 4a.4).
    if (view.answer && state.answered !== view.id) {
      state.answered = view.id;
      keep([...conversationOf(store), { at: new Date(), from: "participant", who: state.spawnedBy ?? view.id, text: view.answer, subject: setup.subject().key }]);
    }
  }

  // The job is followed in the repository it was queued in: the page's, or the product the message named.
  function follow(job, host = pageOf().host) {
    state.follower?.stop();
    state.following = true;
    state.followedHost = host;
    state.follower = followJob({ id: job.id, address: job.address, host, store, show: showJob });
    refreshStop();
  }

  // The hand-over the participant proposed: the route it would take; it is queued as the participant's own job — no start rule of the product's process applies, its kind's own
  // preconditions refuse it where they find something —, and the bar follows it.
  async function proposeHandOver(section, handOver, participant, subject, about = null) {
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
        const queued = await (await handPart()).queue({ handOver, participant, assessment: fresh, store, instance, page, ofProduct: about !== null || setup.product() !== null, conversation, source });
        outcome.append(el("p", "queued", `Queued as ${queued.id}.`));
        keepJob({ id: queued.id, address: page.address });
        follow({ id: queued.id, address: page.address }, page.host);
        if (conversation !== null) {
          try {
            await record(page, queued.person, { at: new Date(), job: queued.id });
          } catch (failure) {
            outcome.append(problem(`The hand-over could not be recorded in the conversation. ${said(failure)}`));
          }
        }
      } catch (failure) {
        const findings = failure?.name === "NotStartable" && Array.isArray(failure.findings) ? failure.findings : [];
        outcome.append(problem(findings.length > 0 ? "Nothing was queued." : `Nothing was queued. ${said(failure)}`),
          ...(findings.length > 0 ? [el("ul", "reasons", ...findings.map((each) => el("li", "reason", sending.shown(each))))] : []));
      }
    }
    // On GitHub, before it is queued on the CI route, or while only the job workflow holds it back, what the run reads is asked of actionsSetup (UC-049 4c): with something missing,
    // nothing is handed over, and Set up GitHub Actions sets up, assesses the hand-over again on the head the setup left and queues it; setUp itself says what it left missing.
    const page = about ?? pageOf();
    async function assessAndQueue(check = true) {
      const hand = await handPart();
      const assessment = await hand.assess({ handOver, participant, instance, page });
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
    }
    try {
      await assessAndQueue();
    } catch (failure) {
      outcome.replaceChildren(problem(`It could not be checked whether this can start. ${said(failure)}`));
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

  // A hand-over the participant proposed, carried out without a further click (UC-049 4a): in this tab where its kind's result waits for the person and the participant can do the
  // kind — prepared as a message is, its draft kept for *Review the draft* —, else queued as the participant's own job (proposeHandOver).
  async function handOn(handOver, participant, subject, conversation, signal, about = null) {
    const { worksOnOf } = await handPart();
    const section = el("section", "hand-over", el("h3", null, "The participant hands this on"),
      el("p", "kind", `Kind: ${handOver.kind}`), el("p", "works-on", `Works on: ${worksOnOf(handOver).join(", ")}`), el("p", "task", `Task: ${handOver.task}`));
    status.append(section);
    let kind;
    try {
      kind = await kindOf(handOver.kind);
    } catch (failure) {
      section.append(problem(`Nothing was handed on. ${said(failure)}`));
      return;
    }
    // The conversation itself handed on (the bar's own kind) goes on as a job, as a kind the tab cannot run does: the endpoint's own (UC-049 4a.2).
    if (kind.name === BAR_KIND || kind.review !== "person" || eligible([participant], { capabilities: kind.needs }).eligible.length === 0) {
      await proposeHandOver(section, handOver, participant, subject, about);
      return;
    }
    let ready;
    try {
      ready = await (await sendPart()).prepareHandOver({ handOver, subject, participant, conversation, store, instance, product: about ?? setup.product() });
    } catch (failure) {
      section.append(problem(`Nothing was run. ${said(failure)}`));
      return;
    }
    const reasons = sending.whyNot(ready.prepared, offered);
    if (reasons.length) {
      section.append(problem("Nothing was run."), el("ul", "reasons", ...reasons.map((reason) => el("li", "reason", reason))));
      return;
    }
    section.append(el("p", "running", `Running ${handOver.kind} in this tab…`));
    running = { kind: handOver.kind, participant: participant.name, started: new Date() };
    const result = await sending.runMessage(ready, { signal });
    if (result.stoppedBecause === "unusable" || !result.draft) {
      section.append(problem("The answer could not be read. Nothing was changed."), el("details", "raw", el("summary", null, "The answer as received"), el("pre", null, result.raw ?? "")));
      return;
    }
    const left = [...result.remaining, ...result.forPerson];
    section.append(el("p", "rounds", `Rounds: ${result.rounds.length}`), ...(left.length ? [el("ul", "left", ...left.map((each) => el("li", "finding", sending.shown(each))))] : []),
      reviewButton(subject, handOver.kind, participant, ready.prepared.params, result, about));
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
        ready = await (await sendPart()).prepareMessage({ subject, participant, instruction, conversation: earlier, store, instance, product: about ?? setup.product() });
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
      const to = ready.prepared.destinations.map((each) => el("li", "destination", `${each.participant.name} — ${each.place || "no processing place declared"}`));
      show(...(about ? [aboutLine(about)] : []), el("p", "sends", "Sent to:"), el("ul", "destinations", ...to),
        el("p", "limit", `The correction loop runs at most ${ready.prepared.limit} rounds.`));
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
      const result = await sending.runMessage(ready, { signal: controller.signal });
      const answered = showAnswer(result, ready, subject, participant, about);
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
        // The hand-over the answer proposes goes on now, within the same Send: Stop ends it as it ends the message.
        if (result.draft?.handOver) await handOn(result.draft.handOver, participant, subject, conversationOf(store), controller.signal, about);
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
      // On GitHub, before anything is written, what the run reads is asked of actionsSetup (UC-049 4c): with something missing, nothing is handed over, and Set up GitHub Actions
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
      conversation: conversationPath, source, instanceSnapshot });
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
    keepJob({ id: spawned.id, address: page.address });
    follow({ id: spawned.id, address: page.address }, page.host);
  }

  // The label of the button for the one chosen now: *Spawn job* where it runs through GitHub Actions.
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
    const named = (each) => `${each.name} — ${placeOf(each)}`;
    // The same offer keeps its selector: replacing it while it takes focus would close its list before a choice is made.
    const names = offered.map((each) => each.name).join("\n");
    if (selector && names === offeredNames) return relabel();
    offeredNames = names;
    if (offered.length === 1) {
      selector = el("span", "participant", named(offered[0]));
    } else {
      selector = el("select", "participant");
      for (const each of offered) {
        const option = el("option", null, named(each));
        option.value = each.name;
        selector.append(option);
      }
      selector.value = offered.some((each) => each.name === kept) ? kept : offered[0].name;
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
    input.addEventListener("focus", () => judge().catch(() => {}));
    showRecording(await recordingOf(snapshot));
    send.addEventListener("click", onSend);
    // Clear conversation empties the tab's conversation and what the bar shows of the last message; while a message runs it does nothing — Stop ends that first.
    clear.addEventListener("click", () => {
      if (send.disabled) return;
      keep([]);
      status.replaceChildren();
    });
    stop.addEventListener("click", () => (state.controller ? state.controller.abort() : state.follower?.cancel()));
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
    // A job handed over on an earlier page of this tab goes on being followed.
    let handedOver = null;
    try {
      handedOver = readTabValue(store, JOB);
    } catch { /* the tab keeps no values */ }
    if (handedOver !== null && handedOver.address === pageOf().address) follow(handedOver);
  }

  draw().catch((failure) => {
    if (!state.stopped) target.replaceChildren(problem(`The prompt bar could not be drawn. ${said(failure)}`));
  });

  return {
    stop() {
      state.stopped = true;
      state.controller?.abort();
      state.follower?.stop();
      target.replaceChildren();
    },
  };
}
