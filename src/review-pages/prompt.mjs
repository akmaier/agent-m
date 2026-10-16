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

import { statuses } from "../approvals/index.mjs";
import { provenanceLines } from "../job-runner/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, button, link, problem, TOKEN_STEP } from "./common.mjs";
import { fileDrafts } from "./file-drafts.mjs";
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
  const trailers = provenanceLines({ agentM: run.agentM, jobId, kind: run.jobKind, participant: run.chosen, rounds: outcome.rounds.length, instruction: run.params.instruction });
  const { drafts, discard, saved } = await fileDrafts({ files: outcome.draft?.files ?? [], snapshot, host, trailers });
  result.append(explain(kind.explain.draft.written), drafts, discard, saved);
}
