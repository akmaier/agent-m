// file-drafts.mjs — drafted files in editors, saved together (MOD-review-pages, Parts): each drafted file in the editor of MOD-markdown-render as its difference against the current text, a
// use case with a changed identifier restored first, and one Save that saves all the files with one saveFile, in one commit, each only on the text it was opened on. Used by the page
// of a draft of the conversation (conversation-draft.mjs).
//
// Module: MOD-review-pages
//
// A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; AN EDITED FILE KEEPS ITS IDENTIFIER; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; WITHOUT A TOKEN,
// GITHUB'S WEB INTERFACE IS THE FALLBACK; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Nothing is written before Save; Discard removes the editors, which the page itself holds. A draft that was
// saved in a commit, or discarded, is dropped from the conversation: `drop` (MOD-prompt-bar's dropDraft for the page's subject) is called then.

import { fallbackEditLinks, keptIdentifier, saveFile } from "../artifact-edits/index.mjs";
import { statuses } from "../approvals/index.mjs";
import { el, button, link, openEditor } from "./common.mjs";
import { fallbackPages } from "./file-edit.mjs";

/**
 * fileDrafts({ files, snapshot, host, trailers, versionOf, check, extras }) -> Promise<{ drafts, discard, saved, leave }> — `files` are the drafted { path, text }; `trailers` the provenance
 * lines of the commit; `versionOf(path)` the blob a file was read at by the job, where the page knows it (else the blob the page read); `check(path, text)` an error that keeps a file
 * from being saved, or null; `extras(path, text)` elements shown under a draft; `drop()` is called once the files are saved in a commit, and on Discard. `leave` is what the route's `leave` and `unsaved` ask: `unsaved()`
 * says whether an editor holds unsaved changes, and `close()` closes the editors through theirs, asking first, and returns false at the first editor whose person declines. `drafts` holds a <div class="draft" data-path> for each file, `discard` removes them, and `saved` says
 * what a Save came to.
 */
export async function fileDrafts({ files, snapshot, host, trailers, versionOf = () => undefined, check = () => null, extras = () => [], drop = () => {} }) {
  const known = statuses(snapshot);
  const entries = [];
  const drafts = el("section", "drafts"), saved = el("div", "saved");

  // Every editor's Save saves all the files together, each only on the text the job read.
  async function saveAll() {
    const edits = entries.map((entry) => ({ path: entry.path, text: entry.editor.text(), openedBlob: entry.openedBlob, openedId: entry.openedId, trailers }));
    const wrong = edits.map((edit) => check(edit.path, edit.text)).find((reason) => reason);
    if (wrong) return { kind: "failed", reason: wrong };
    try {
      const info = await host.repositoryInfo();
      if (!info.canWrite) {
        const pages = fallbackEditLinks(edits.map((edit) => ({ path: edit.path, text: edit.text, existing: edit.openedBlob !== null })), snapshot);
        if (!fallbackPages(saved, pages)) return { kind: "failed", reason: "a GitLab product is written with the project's own token." };
        return { kind: "failed", reason: "there is no token, so nothing was committed from here." };
      }
      const out = await saveFile(host, edits);
      if (out.refused === "changed meanwhile") return { kind: "refused", newer: out.current ?? "" };
      if (out.refused) return { kind: "failed", reason: `the identifier of a file changed from ${out.openedId} to ${out.nowId ?? "none"}; keep ${out.openedId}.` };
      const commit = `${snapshot.repository.web}/commit/${out.commit}`;
      saved.replaceChildren(el("p", "saved", `Saved ${edits.length} file${edits.length === 1 ? "" : "s"} as open in `, link(commit, null, "this commit"), "."));
      for (const entry of entries) entry.drafted = entry.editor.text();
      drop();
      return { kind: "saved", link: commit };
    } catch (failure) {
      return { kind: "failed", reason: `${failure.name}: ${failure.message}` };
    }
  }

  for (const drafted of files) {
    const current = (await snapshot.read(drafted.path)) ?? "";
    const openedId = known.get(drafted.path)?.id ?? null;
    const box = el("div", "draft", el("h3", null, drafted.path));
    box.setAttribute("data-path", drafted.path);
    const editorBox = el("div", "editor-box");
    box.append(editorBox, ...extras(drafted.path, drafted.text));
    drafts.append(box);
    const editor = openEditor(editorBox, current, { marks: () => [], save: () => saveAll(), disabledReason: (text) => check(drafted.path, text) });
    editor.showDraft(openedId ? keptIdentifier(drafted.text, openedId) : drafted.text, current);
    // `drafted` is the text the editor shows when the page is drawn, and after a save: an edit is a change of it, for the draft itself stays in the conversation.
    entries.push({ path: drafted.path, editor, drafted: editor.text(), openedBlob: versionOf(drafted.path) ?? snapshot.blob(drafted.path), openedId });
  }
  const discard = button("btn discard", "Discard");
  discard.addEventListener("click", () => {
    drop();
    drafts.replaceChildren();
    entries.length = 0;
    discard.remove?.();
    saved.replaceChildren(el("p", null, "The draft was discarded. Nothing was written."));
  });
  // Leaving the page: an editor whose text was edited asks through its own `close`, so that a refusal keeps the page as it is; the others are left without a question.
  const edited = () => entries.filter((entry) => entry.editor.text() !== entry.drafted);
  const leave = {
    unsaved: () => edited().length > 0,
    close() {
      for (const entry of edited()) if (!entry.editor.close()) return false;
      entries.length = 0;
      return true;
    },
  };
  return { drafts, discard, saved, leave };
}
