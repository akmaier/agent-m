// requirements-draft.mjs — a draft of requirements from the conversation (MOD-review-pages, Parts; Interfaces: `draft`, UC-019 8, 9, 9a): each text the draft changes — a SPEC section, an
// open entry's proposal — in the editor as its difference against the text it replaces, with the draft's `why` in the Why field, and beside a section each requirement it adds with the
// place the draft's `places` gives it, which this page does not change; and Save, which saves each section with `proposeSection` as an entry of its queue, with the places of the
// requirements its text names, and each proposal with `saveEntry` in its entry, only on the text the job read. No group file is written (UC-019 step 9).
//
// Module: MOD-review-pages
//
// A SPEC EDIT IS SAVED AS A PROPOSAL; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; THE DASHBOARD WRITES
// ONLY ON A PERSON'S CLICK. Nothing is written before Save. A draft that was saved, or discarded, is dropped from the conversation: `drop` is called then. Readings this file takes: each editor's
// Save saves every text of the draft; before anything is written every text is compared with the default branch, and one changed meanwhile writes nothing and stands beside the draft
// (<div class="newer">); a section whose heading the SPEC does not hold, and a path that is no open entry's proposal, are named and not saved; a text that stands as it is is not saved.
// A section's text names a requirement when parseSpec reads that name among its requirements; its places are read from the text as it stands when Save is pressed.

import { showDifference } from "../markdown-render/index.mjs";
import { proposeSection, queues, saveEntry } from "../spec-changes/index.mjs";
import { parseSpec, requirementFindings, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, button, link, openEditor, refusalText } from "./common.mjs";
import { fallbackPages } from "./file-edit.mjs";
import { placeText } from "./sections.mjs";

const SPEC = "SPEC.md";

// The draft's places, each `{ requirement, place }` with a MOD-group-document Place; and those whose requirement the section text `text` names.
const draftPlaces = (draft) => (Array.isArray(draft.places) ? draft.places.filter((each) => typeof each?.requirement === "string" && Array.isArray(each?.place?.group))
  .map(({ requirement, place }) => ({ requirement: requirement.replace(/\s+/g, " ").trim(), place: { group: place.group, new: typeof place.new === "string" && place.new.trim() ? place.new : null } })) : []);
const placesIn = (places, text) => { const names = parseSpec(text).requirements; return places.filter((each) => names.has(each.requirement)); };

// The texts of the draft, each with what it replaces: { kind, title, text, current, openedBlob, entry? } — a section's current text the SPEC's section under its heading line, opened on
// the blob `version` names for the section the job's parameters name; a proposal's the file at its path, with the open entry it belongs to. A text the page cannot save has `problem`.
async function textsOf(snapshot, draft, params) {
  const spec = (await snapshot.read(SPEC)) ?? "";
  const named = params.section ?? parseSpec(spec).requirements.get((params.requirements ?? [])[0])?.section;
  const texts = [];
  for (const text of Array.isArray(draft.sections) ? draft.sections.filter((each) => typeof each === "string") : []) {
    const heading = parseSpec(text).sections[0]?.heading ?? text.split("\n")[0];
    const current = sectionText(spec, heading) ?? null;
    texts.push({ kind: "section", title: heading, text, current: current ?? "", problem: current === null ? `The SPEC holds no section ${heading}: it is not saved.` : null,
      openedBlob: heading === named && params.version ? params.version : current === null ? null : await blobSha(current) });
  }
  const proposals = Array.isArray(draft.proposals) ? draft.proposals.filter((each) => typeof each?.path === "string" && typeof each?.text === "string") : [];
  const entries = proposals.length ? (await queues(snapshot)).flatMap((queue) => queue.entries.map((entry) => ({ queue: queue.folder, entry }))) : [];
  for (const { path, text } of proposals) {
    const entry = entries.find((each) => each.entry.proposal.path === path && each.entry.state === "open") ?? null;
    texts.push({ kind: "proposal", title: path, text, current: (await snapshot.read(path)) ?? "", openedBlob: snapshot.blob(path), entry,
      problem: entry ? null : `${path} is no open entry's proposal: it is not saved.` });
  }
  return texts;
}

// The blob a text stands at on the default branch now, and that text.
async function standing(latest, item) {
  if (item.kind === "section") {
    const now = sectionText((await latest.read(SPEC)) ?? "", item.title) ?? null;
    return { blob: now === null ? null : await blobSha(now), text: now ?? "" };
  }
  return { blob: latest.blob(item.title), text: (await latest.read(item.title)) ?? "" };
}

/**
 * requirementsDraft({ snapshot, host, token, draft, trailers, drop }) -> Promise<Element> — the page of the draft of requirements `draft` (a ConversationDraft): `snapshot` the default branch as
 * the page read it, `trailers` the provenance lines of what is saved, `drop()` called once the texts are saved, and on Discard.
 */
export async function requirementsDraft({ snapshot, host, token, draft, trailers, drop = () => {} }) {
  const { result, params } = draft;
  const drafted = result.draft ?? {};
  const panel = el("section", "requirements-result", el("h3", null, "The drafted texts"), explain("draft-difference"));
  const texts = await textsOf(snapshot, drafted, params);
  const places = draftPlaces(drafted);
  const why = el("textarea", "why");
  why.setAttribute("aria-label", "Why");
  why.value = typeof drafted.why === "string" ? drafted.why : "";
  const newer = el("div", "newer"), status = el("div", "saved"), boxes = el("section", "drafts");
  const editors = [];

  async function saveAll() {
    const reason = String(why.value ?? "").trim();
    if (!reason) return { kind: "failed", reason: "say why in the Why field." };
    newer.replaceChildren();
    status.replaceChildren();
    try {
      const shown = editors.map(({ item, editor }) => ({ ...item, text: editor.text() })).filter((item) => !item.problem && item.text !== item.current);
      const info = await host.repositoryInfo();
      const latest = await host.readSnapshot(info.defaultBranch);
      for (const item of shown) {
        const now = await standing(latest, item);
        if (now.blob !== item.openedBlob) {
          newer.replaceChildren(el("p", null, `Nothing was saved: ${item.title} changed meanwhile. The draft stays beside the newer text.`), el("pre", null, now.text), showDifference(now.text, item.text));
          return { kind: "failed", reason: `${item.title} changed meanwhile; nothing was saved.` };
        }
      }
      const common = { why: reason, person: token?.name ?? "anonymous", openedHead: snapshot.commit, trailers };
      const fallback = [], commits = [];
      for (const item of shown) {
        let out;
        if (item.kind === "section") out = await proposeSection(host, { ...common, target: SPEC, anchor: item.title, until: null, text: item.text, origin: "the prompt bar", openedBlob: item.openedBlob, places: placesIn(places, item.text) });
        else out = await saveEntry(host, { ...common, queue: item.entry.queue, entry: item.entry.entry.number, text: item.text, openedBlob: item.openedBlob });
        if (out.fallback) fallback.push(...out.fallback);
        else if (out.refused) return { kind: "failed", reason: `${item.title}: ${out.refused}${out.state ? ` (${out.state})` : ""}; nothing more was saved.` };
        else commits.push(out.commit);
      }
      if (fallback.length) {
        fallbackPages(status, fallback);
        return { kind: "failed", reason: "there is no token, so nothing was committed from here." };
      }
      if (commits.length === 0) return { kind: "failed", reason: "the draft changes nothing." };
      drop();
      const commit = `${snapshot.repository.web}/commit/${commits.at(-1)}`;
      status.replaceChildren(el("p", "entry", `Saved ${commits.length} text${commits.length === 1 ? "" : "s"}, the last in `, link(commit, null, "this commit"), "."));
      return { kind: "saved", link: commit };
    } catch (failure) {
      const text = refusalText(failure);
      status.replaceChildren(el("p", "result problem", text));
      return { kind: "failed", reason: text };
    }
  }

  for (const item of texts) {
    const box = el("div", "draft", el("h4", null, item.title), ...(item.problem ? [el("p", "problem", item.problem)] : []));
    box.setAttribute("data-path", item.title);
    const editorBox = el("div", "editor-box");
    box.append(editorBox);
    const shownPlaces = item.kind === "section" ? placesIn(places, item.text) : [];
    if (shownPlaces.length) box.append(el("ul", "places", ...shownPlaces.map(({ requirement, place }) => el("li", "place", `${requirement}: ${placeText(place)}.`))));
    boxes.append(box);
    const marks = (text) => requirementFindings(parseSpec(text));
    const editor = openEditor(editorBox, item.current, { marks, save: () => saveAll() });
    editor.showDraft(item.text, item.current);
    editors.push({ item, editor });
  }
  const discard = button("btn discard", "Discard");
  discard.addEventListener("click", () => {
    drop();
    panel.replaceChildren(el("p", null, "The draft was discarded. Nothing was written."));
  });
  panel.append(boxes, el("h4", null, "Why"), why, el("div", "actions", discard), status, newer);
  return panel;
}
