// requirements-draft.mjs — a draft of requirements from the conversation (MOD-review-pages, Parts; Interfaces: `draft`, UC-019 8, 9, 9a): each text the draft changes — a SPEC section, an
// open entry's proposal, `docs/groups/requirements.md` — in the editor as its difference against the text it replaces, with the draft's `why` in the Why field, and Save, which saves each
// section with `proposeSection` as an entry of its queue, each proposal with `saveEntry` in its entry and the group file with `saveFile`, only on the text the job read.
//
// Module: MOD-review-pages
//
// A SPEC EDIT IS SAVED AS A PROPOSAL; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; THE DASHBOARD WRITES
// ONLY ON A PERSON'S CLICK. Nothing is written before Save. A draft that was saved, or discarded, is dropped from the conversation: `drop` is called then. Readings this file takes: each editor's
// Save saves every text of the draft; before anything is written every text is compared with the default branch, and one changed meanwhile writes nothing and stands beside the draft
// (<div class="newer">); a section whose heading the SPEC does not hold, and a path that is no open entry's proposal, are named and not saved; a text that stands as it is is not saved.

import { fallbackEditLinks, saveFile } from "../artifact-edits/index.mjs";
import { showDifference } from "../markdown-render/index.mjs";
import { proposeSection, queues, saveEntry } from "../spec-changes/index.mjs";
import { parseSpec, requirementFindings, sectionText } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, button, link, openEditor, refusalText } from "./common.mjs";
import { fallbackPages } from "./file-edit.mjs";

const SPEC = "SPEC.md";
const GROUPS = "docs/groups/requirements.md";

// The texts of the draft, each with what it replaces: { kind, title, text, current, openedBlob, entry? } — a section's current text the SPEC's section under its heading line, opened on
// the blob `version` names for the section the job's parameters name; a proposal's the file at its path, with the open entry it belongs to; the group file's the file. A text the page
// cannot save has `problem`.
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
  if (typeof draft.groups === "string") texts.push({ kind: "groups", title: GROUPS, text: draft.groups, current: (await snapshot.read(GROUPS)) ?? "", openedBlob: snapshot.blob(GROUPS), problem: null });
  return texts;
}

// The blob a text stands at on the default branch now, and that text.
async function standing(latest, item) {
  if (item.kind === "section") {
    const now = sectionText((await latest.read(SPEC)) ?? "", item.title) ?? null;
    return { blob: now === null ? null : await blobSha(now), text: now ?? "" };
  }
  const path = item.kind === "proposal" ? item.title : GROUPS;
  return { blob: latest.blob(path), text: (await latest.read(path)) ?? "" };
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
        if (item.kind === "section") out = await proposeSection(host, { ...common, target: SPEC, anchor: item.title, until: null, text: item.text, origin: "the prompt bar", openedBlob: item.openedBlob });
        else if (item.kind === "proposal") out = await saveEntry(host, { ...common, queue: item.entry.queue, entry: item.entry.entry.number, text: item.text, openedBlob: item.openedBlob });
        else if (!info.canWrite) out = { fallback: fallbackEditLinks([{ path: GROUPS, text: item.text, existing: item.openedBlob !== null }], snapshot) };
        else out = await saveFile(host, { path: GROUPS, text: item.text, openedBlob: item.openedBlob, trailers });
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
    boxes.append(box);
    const marks = item.kind === "groups" ? () => [] : (text) => requirementFindings(parseSpec(text));
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
