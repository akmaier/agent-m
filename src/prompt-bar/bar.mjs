// MOD-prompt-bar, bar.mjs — the bar (docs/architecture/MOD-prompt-bar.md: Parts, Interfaces: startPromptBar, latestDraft, currentJob): the
// selector, the input, *Send* and *Stop*, the conversation, and the answer. Of it, ITM-504 builds the offer of the participants and a
// message sent as a job in this tab; the hand-over a participant proposes is shown without *Hand over*, which the item that follows builds.
//
// Module: MOD-prompt-bar
//
// THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION. Nothing is read from a participant's
// route, written or sent while the bar is drawn: *Send* is the one click that sends a message, and the one that, with recording on, writes
// the conversation record first. The conversation lives in the tab's values (MOD-browser-store): `prompt-bar:conversation`, a list of
// Messages; `prompt-bar:draft`, the latest ConversationDraft; and `prompt-bar:records`, the record each repository's part of the
// conversation is appended to.

import { readTabValue, writeTabValue } from "../browser-store/index.mjs";
import { renderArtifact } from "../markdown-render/index.mjs";
import { formatFinding } from "../text-tools/index.mjs";
import { offeredAmong, placeOf, readParticipants } from "./offer.mjs";
import { appendToConversation, conversationPath, recordingOf } from "./record.mjs";
import { defaultSnapshot, prepareMessage, runMessage, whyNot } from "./send.mjs";

const CONVERSATION = "prompt-bar:conversation";
const DRAFT = "prompt-bar:draft";
const RECORDS = "prompt-bar:records";

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

// What a failure says: its name and message.
const said = (failure) => `${failure.name ?? "Error"}: ${failure.message}`;

/**
 * startPromptBar(target, setup) -> { stop } — draws the bar into `target` once the instance's participants are read, and keeps it for the life
 * of the page. With no participant offered it draws nothing and says nothing (UC-049 1a).
 */
export function startPromptBar(target, setup) {
  const { store, instance } = setup;
  const state = { stopped: false, controller: null };
  let offered = [], recording = false;

  const status = el("section", "status");
  const conversation = el("ul", "conversation");
  const recorded = el("p", "recording", "This conversation is recorded in the repository of the page it is held on.");
  const input = el("textarea", "instruction");
  const send = button("send", "Send");
  const stop = button("stop", "Stop");
  stop.disabled = true;
  let selector = null;

  const show = (...nodes) => status.replaceChildren(...nodes);
  const problem = (text) => el("p", "problem", text);
  const showRecording = (on) => {
    recording = on;
    recorded.hidden = !on;
  };
  const chosen = () => offered.find((each) => each.name === (selector.value ?? offered[0].name)) ?? offered[0];
  const line = (message) => {
    const text = el("div", "text");
    if (message.from === "participant") text.append(renderArtifact(message.text, { frontMatter: "hidden" }));
    else text.append(message.text);
    return el("li", `message ${message.from}`, el("span", "who", message.who), " ", text);
  };
  const keep = (messages) => {
    writeTabValue(store, CONVERSATION, messages);
    conversation.replaceChildren(...messages.map(line));
  };

  // Appends one entry to the conversation record of the repository the page is held on: the record the tab keeps for it, or a new one.
  async function record(ready, entry) {
    const records = readTabValue(store, RECORDS) ?? {};
    const held = records[ready.page.address] ?? { path: conversationPath(entry.at), startedBy: ready.person };
    const done = await appendToConversation(ready.page.host, held, entry);
    writeTabValue(store, RECORDS, { ...records, [ready.page.address]: held });
    return done;
  }

  function showAnswer(result, ready, subject, participant) {
    const draft = result.draft;
    if (result.stoppedBecause === "unusable" || draft === null || draft === undefined) {
      const raw = el("details", "raw", el("summary", null, "The answer as received"), el("pre", null, result.raw ?? ""));
      show(problem("The participant's answer could not be read. Nothing was changed."), raw);
      return null;
    }
    const text = typeof draft.answer === "string" ? draft.answer
      : subject.draftRoute !== null ? `A draft of ${subject.title} is ready to review.` : "";
    const left = [...result.remaining, ...result.forPerson];
    const shown = [el("div", "answer", renderArtifact(text, { frontMatter: "hidden" })),
      el("p", "rounds", `Rounds: ${result.rounds.length}`)];
    if (left.length) shown.push(el("ul", "left", ...left.map((each) => el("li", "finding", formatFinding(each)))));
    if (draft.handOver) {
      const { kind, works_on: worksOn, task } = draft.handOver;
      shown.push(el("section", "hand-over", el("h3", null, "The participant proposes handing this on"),
        el("p", "kind", `Kind: ${kind}`), el("p", "works-on", `Works on: ${[worksOn].flat().join(", ")}`), el("p", "task", `Task: ${task}`)));
    }
    if (subject.draftRoute !== null) {
      const review = button("review", "Review the draft");
      review.addEventListener("click", () => {
        writeTabValue(store, DRAFT, { subject: subject.key, kind: subject.kind, participant: participant.name, params: ready.prepared.params, result });
        setup.go(subject.draftRoute);
      });
      shown.push(review);
    }
    status.append(...shown);
    return text;
  }

  async function onSend() {
    if (state.controller || state.stopped) return;
    const instruction = input.value.trim();
    if (instruction === "") { show(problem("Write a message first.")); return; }
    const participant = chosen();
    const controller = new AbortController();
    state.controller = controller;
    send.disabled = true;
    show();
    try {
      const subject = setup.subject();
      const earlier = conversationOf(store);
      let ready;
      try {
        ready = await prepareMessage({ subject, participant, instruction, conversation: earlier, store, instance, product: setup.product() });
      } catch (failure) {
        show(problem(`Nothing was sent. ${said(failure)}`));
        return;
      }
      showRecording(ready.recording);
      const reasons = whyNot(ready.prepared, offered);
      if (reasons.length) {
        show(problem("Nothing was sent."), el("ul", "reasons", ...reasons.map((reason) => el("li", "reason", reason))));
        return;
      }
      const to = ready.prepared.destinations.map((each) => el("li", "destination", `${each.participant.name} — ${each.place || "no processing place declared"}`));
      show(el("p", "sends", "Sent to:"), el("ul", "destinations", ...to));
      const who = ready.person ?? "person";
      if (ready.recording) {
        if (ready.person === null) {
          show(problem("Nothing was sent. Conversations are recorded here, and no token for this repository is stored in this browser to record with."));
          return;
        }
        try {
          await record(ready, { at: new Date(), who, page: subject.title, text: instruction, withheld: subject.withhold?.(instruction) ?? undefined });
        } catch (failure) {
          show(problem(`Nothing was sent. The message could not be recorded: ${said(failure)}`));
          return;
        }
      }
      keep([...earlier, { at: new Date(), from: "person", who, text: instruction, subject: subject.key }]);
      input.value = "";
      running = { kind: subject.kind, participant: participant.name, started: new Date() };
      stop.disabled = false;
      const result = await runMessage(ready, { signal: controller.signal });
      const answered = showAnswer(result, ready, subject, participant);
      if (answered !== null) {
        keep([...conversationOf(store), { at: new Date(), from: "participant", who: participant.name, text: answered, subject: subject.key }]);
        if (ready.recording) {
          try {
            await record(ready, { at: new Date(), who: participant.name, page: subject.title, model: participant.model ?? undefined, text: answered,
              withheld: subject.withhold?.(answered) ?? undefined });
          } catch (failure) {
            status.append(problem(`The answer could not be recorded: ${said(failure)}`));
          }
        }
      }
    } catch (failure) {
      show(controller.signal.aborted || failure?.name === "Cancelled" ? problem("Stopped. Nothing was written.") : problem(said(failure)));
    } finally {
      state.controller = null;
      running = null;
      stop.disabled = true;
      send.disabled = false;
    }
  }

  async function draw() {
    const snapshot = await defaultSnapshot(instance.host);
    offered = offeredAmong(await readParticipants(snapshot), store);
    if (offered.length === 0 || state.stopped) return;
    const named = (each) => `${each.name} — ${placeOf(each)}`;
    if (offered.length === 1) {
      selector = el("span", "participant", named(offered[0]));
    } else {
      selector = el("select", "participant");
      for (const each of offered) {
        const option = el("option", null, named(each));
        option.value = each.name;
        selector.append(option);
      }
      selector.value = offered[0].name;
    }
    showRecording(await recordingOf(snapshot));
    send.addEventListener("click", onSend);
    stop.addEventListener("click", () => state.controller?.abort());
    conversation.replaceChildren(...conversationOf(store).map(line));
    const bar = el("section", "prompt-bar", setup.explain("prompt-bar"), recorded, selector, conversation, input, el("div", "buttons", send, stop), status);
    bar.setAttribute("data-page", setup.page);
    target.replaceChildren(bar);
  }

  draw().catch((failure) => {
    if (!state.stopped) target.replaceChildren(problem(`The prompt bar could not read the participants. ${said(failure)}`));
  });

  return {
    stop() {
      state.stopped = true;
      state.controller?.abort();
      target.replaceChildren();
    },
  };
}
