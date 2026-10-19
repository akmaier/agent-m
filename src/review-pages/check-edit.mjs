// check-edit.mjs — *Check this edit* on the edit page of a decision or a module file (MOD-review-pages, Parts; UC-023 step 3): the kind `review-architecture` run on the edited file as
// its draft, the reviewing participant chosen among those that can draft text, the run panel naming what is sent where, Run, and the findings handed back to the editor as warnings.
//
// Module: MOD-review-pages
//
// AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REVIEWER'S FINDING IS A WARNING; THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Nothing is
// sent while the section is drawn or the panel is shown: Run is the one click that starts the job. The job has no record, so nothing is committed: the check saves nothing.

import { runOnTab } from "../runtimes/index.mjs";
import { runPanel, explain, readProblem } from "../site-frame/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { button, el } from "./common.mjs";
import { byClassChecked, connectionsOf, loadStage, participantList, preparedRun } from "./jobs.mjs";

const KIND = "review-architecture";
const WARNING = "warning";

// The findings of the reviewer's draft as warnings, in MOD-text-tools' form.
const warningsOf = (draft) => (Array.isArray(draft?.findings) ? draft.findings : []).map((each) =>
  finding({ artifact: String(each.artifact), line: Number.isInteger(each.line) && each.line >= 1 ? each.line : 1, kind: WARNING, rule: String(each.rule), what: String(each.what), fix: String(each.fix) }));

/**
 * offerCheck(where, file, editor, onFindings) -> Promise<Element> — the section *Check this edit*, appended beside the editor: the participants that can draft text, the button that shows
 * the run panel for the editor's text as it stands, and Run. `onFindings(findings)` is called with the reviewer's findings, each a warning, when the job has run.
 */
export async function offerCheck(where, file, editor, onFindings) {
  const { target, token } = where;
  const section = el("section", "check-edit", el("h3", null, "Check this edit"));
  target.append(section);
  let stage;
  try {
    stage = await loadStage(where, KIND);
  } catch (failure) {
    section.append(readProblem(failure, Boolean(token)));
    return section;
  }
  const { definition, participants, instanceSnapshot, product, needs, drafters } = stage;
  const offered = participantList(drafters, participants, product, needs);
  const shown = el("section", "stage");
  const prepare = button("btn prepare", "Check this edit");
  section.append(el("section", "reviewers", el("h4", null, "Reviewing participant"), offered), prepare, shown);

  async function run(ready) {
    const result = el("section", "job");
    shown.append(result);
    try {
      if (!ready.offer || !ready.offer.available || ready.offer.route.kind !== "tab") {
        throw Object.assign(new Error(ready.offer?.reason ?? "this check runs in this tab: choose a participant whose route is the tab"), { name: "RouteUnavailable" });
      }
      const outcome = await runOnTab(ready.prepared, ready.jobContext, connectionsOf([ready.prepared.drafter].filter(Boolean), where.context.store), { host: where.host, record: null });
      const found = warningsOf(outcome.draft);
      onFindings(found);
      result.append(el("p", "ran", found.length ? `${found.length} finding${found.length === 1 ? "" : "s"}, shown beside the edit as warnings.` : "No finding."));
    } catch (failure) {
      result.append(el("p", "result problem", `${failure.name}: ${failure.message}`));
    }
  }

  prepare.addEventListener("click", async () => {
    shown.replaceChildren();
    const chosen = drafters.find((participant) => byClassChecked(offered, participant.name));
    if (!chosen) { shown.append(el("p", "problem", "Choose the participant that reviews.")); return; }
    const draft = { files: [{ path: file.path, class: "change", of: file.id, text: editor.text() }] };
    try {
      const ready = await preparedRun({ ...where, definition, jobKind: KIND, params: { draft }, chosen, participants, instanceSnapshot, product, needs });
      shown.append(runPanel(ready.prepared, { onRun: () => run(ready) }));
    } catch (failure) {
      shown.append(readProblem(failure, Boolean(token)));
    }
  });
  return section;
}
