// prompt.mjs — changing a use case by prompt (MOD-review-pages, Parts; Interfaces: `<k>/<id>/prompt`, UC-019 for a use case): the instruction, the participants that can draft text,
// the run panel of the kind the descriptor names (`prompt`), the draft in the editor of MOD-markdown-render as its difference against the current text, and Save, which saves the
// files the job changed with one saveFile and the job's provenance lines. The flow reaches it through the descriptor's `prompt`; the job is started as the drafting page starts its job
// (jobs.mjs).
//
// Module: MOD-review-pages
//
// A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; AN EDITED FILE KEEPS ITS IDENTIFIER; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT; THE
// DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Nothing is sent before Run, and nothing is written before Save. The editor is used only through openEditor: one editor for each file, each
// saving all the files together; Discard removes the editors, which the page itself holds.
//
// Not built: Refine. It runs the kind once more with `refine` (MOD-job-runner's runJob), which MOD-runtimes' runOnTab does not pass on: its hooks are the host, the record, onOutput
// and signal. The page has no other way to run a job in the tab that records it, so it offers no Refine.

import { fallbackEditLinks, keptIdentifier, saveFile } from "../artifact-edits/index.mjs";
import { statuses } from "../approvals/index.mjs";
import { openEditor } from "../markdown-render/index.mjs";
import { provenanceLines } from "../job-runner/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, button, link, problem, TOKEN_STEP } from "./common.mjs";
import { byClassChecked, loadStage, panelOf, participantList } from "./jobs.mjs";

/**
 * showPrompt(where, kind, id) — the prompt page of the file `id` of a kind whose descriptor names a job to change it.
 */
export async function showPrompt(where, kind, id) {
  const { target, snapshot, token } = where;
  const file = [...statuses(snapshot)].find(([, each]) => each.kind === kind.kind && each.id === id);
  target.append(el("h2", null, `Change ${id} by prompt`), explain(kind.explain.instruction), link(`#${kind.route}/id=${encodeURIComponent(id)}`, null, `Back to ${id}`));
  if (!file) {
    target.append(el("p", "problem", `No ${kind.noun} ${id} on the default branch.`));
    return;
  }
  let loaded;
  try {
    loaded = await loadStage(where, kind.prompt);
  } catch (failure) {
    target.append(problem(failure, token));
    return;
  }
  const { definition, participants, instanceSnapshot, product, needs, drafters } = loaded;
  if (drafters.length === 0) {
    target.append(el("p", "none", "No participant of this instance can draft text, so nothing can be sent. Add one, declaring the capability draft text: "),
      link("#participants", "participants-link", "The participants of this instance"));
    return;
  }
  const instruction = el("textarea", "instruction");
  instruction.setAttribute("aria-label", "What should change");
  const offered = participantList(drafters, participants, product, needs);
  const stage = el("section", "stage");
  target.append(el("h3", null, "What should change"), instruction, el("section", "drafters", el("h3", null, "Drafting participant"), explain(kind.explain.draft.participant), offered));
  if (!token) {
    target.append(el("p", "problem", "A job is recorded and its result saved with your token. ", link(TOKEN_STEP, "token-step", "Store the token")), stage);
    return;
  }
  const prepare = button("btn prepare", "Show the run panel");
  prepare.addEventListener("click", async () => {
    stage.replaceChildren();
    const said = String(instruction.value ?? "").trim();
    const chosen = drafters.find((participant) => byClassChecked(offered, participant.name));
    if (!said) { stage.append(el("p", "problem", "Write what should change.")); return; }
    if (!chosen) { stage.append(el("p", "problem", "Choose the participant that drafts.")); return; }
    await panelOf({ ...where, definition, kind, jobKind: kind.prompt, params: { useCase: id, instruction: said }, worksOn: [id], present: presentPrompt, chosen, participants,
      instanceSnapshot, product, needs, stage });
  });
  target.append(prepare, stage);
}

// What a run of the prompt job came to: the rounds, what the loop left, and the draft of each file in an editor of its own — or the answer that could not be read.
async function presentPrompt(outcome, result, run) {
  const { kind, snapshot, host, id: jobId } = run;
  result.append(el("p", "rounds", `Correction rounds: ${outcome.rounds.length}`), explain(kind.explain.draft.loop));
  const left = el("ul", "left");
  for (const finding of outcome.remaining) left.append(el("li", "left", `${finding.rule}: ${finding.what} — ${finding.fix}`));
  result.append(left);
  if (outcome.stoppedBecause === "unusable") {
    result.append(el("p", "unusable", "The participant's answer could not be read as a use case. Nothing was written."),
      el("details", "raw", el("summary", null, "The raw answer"), el("pre", "answer", String(outcome.raw ?? ""))));
    return;
  }
  const known = statuses(snapshot);
  const entries = [];
  const drafts = el("section", "drafts"), saved = el("div", "saved");
  const trailers = provenanceLines({ agentM: run.agentM, jobId, kind: run.jobKind, participant: run.chosen, rounds: outcome.rounds.length, instruction: run.params.instruction });

  // Every editor's Save saves all the files together, each only on the text the job read.
  async function saveAll() {
    const edits = entries.map((entry) => ({ path: entry.path, text: entry.editor.text(), openedBlob: entry.openedBlob, openedId: entry.openedId, trailers }));
    try {
      const info = await host.repositoryInfo();
      if (!info.canWrite) {
        const pages = fallbackEditLinks(edits.map((edit) => ({ path: edit.path, text: edit.text, existing: edit.openedBlob !== null })), snapshot);
        if (pages.refused) return { kind: "failed", reason: "a GitLab product is written with the project's own token." };
        const list = el("ul", "pages");
        for (const page of pages) list.append(el("li", null, link(page.url, "github-page", `Open GitHub's page for ${page.path}`)));
        saved.replaceChildren(el("p", null, "There is no token: GitHub's page opens for each file, and you commit them there."), list);
        return { kind: "failed", reason: "there is no token, so nothing was committed from here." };
      }
      const out = await saveFile(host, edits);
      if (out.refused === "changed meanwhile") return { kind: "refused", newer: out.current ?? "" };
      if (out.refused) return { kind: "failed", reason: `the identifier of a file changed from ${out.openedId} to ${out.nowId ?? "none"}; keep ${out.openedId}.` };
      const commit = `${snapshot.repository.web}/commit/${out.commit}`;
      saved.replaceChildren(el("p", "saved", `Saved ${edits.length} file${edits.length === 1 ? "" : "s"} as open in `, link(commit, null, "this commit"), "."));
      return { kind: "saved", link: commit };
    } catch (failure) {
      return { kind: "failed", reason: `${failure.name}: ${failure.message}` };
    }
  }

  for (const drafted of outcome.draft?.files ?? []) {
    const current = (await snapshot.read(drafted.path)) ?? "";
    const openedId = known.get(drafted.path)?.id ?? null;
    const box = el("div", "draft", el("h3", null, drafted.path));
    box.setAttribute("data-path", drafted.path);
    const editorBox = el("div", "editor-box");
    box.append(editorBox);
    drafts.append(box);
    const editor = openEditor(editorBox, current, { marks: () => [], save: () => saveAll() });
    editor.showDraft(openedId ? keptIdentifier(drafted.text, openedId) : drafted.text, current);
    entries.push({ path: drafted.path, editor, openedBlob: snapshot.blob(drafted.path), openedId });
  }
  const discard = button("btn discard", "Discard");
  discard.addEventListener("click", () => {
    drafts.replaceChildren();
    discard.remove?.();
    saved.replaceChildren(el("p", null, "The draft was discarded. Nothing was written."));
  });
  result.append(explain(kind.explain.draft.written), drafts, discard, saved);
}
