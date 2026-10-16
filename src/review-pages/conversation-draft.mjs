// conversation-draft.mjs — the route `draft` (MOD-review-pages, Interfaces: `draft`; UC-049 steps 5 and 6, UC-019 steps 7 to 9): the draft of the conversation that MOD-prompt-bar keeps for the
// subject the address names, shown against the current text before anything can be saved. Files each in the editor as their difference (file-drafts.mjs); requirements as the sections
// `entrySections` composes (requirements-draft.mjs); an architecture file with the rounds of its job and its due diligence. Save and Discard are the person's decisions.
//
// Module: MOD-review-pages
//
// A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; THE DASHBOARD WRITES ONLY ON A
// PERSON'S CLICK. The commit's provenance lines name the Agent M version, the kind, the participant and its model and the rounds, and no message of the conversation.
//
// Not built: the impact list of a change of the architecture. MOD-trace-graph's architectureImpact, which the module file names for it, is not built yet.

import { artifactSchemas, documentFindings, readDocument } from "../documents/index.mjs";
import { statuses } from "../approvals/index.mjs";
import { provenanceLines } from "../job-runner/index.mjs";
import { latestDraft } from "../prompt-bar/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, link, problem, readPlace } from "./common.mjs";
import { fileDrafts } from "./file-drafts.mjs";
import { loadStage } from "./jobs.mjs";
import { requirementsDraft } from "./requirements-draft.mjs";
import { dueDiligenceSection, roundsSection, splitDueDiligence } from "./sections.mjs";

// The schema of the kind of reviewed file that owns a path, among those of MOD-documents.
const OWNERS = [[/^docs\/use-cases\/UC-[^/]+\.md$/, "useCase"], [/^docs\/architecture\/ARC-[^/]+\.md$/, "decision"], [/^docs\/architecture\/MOD-[^/]+\.md$/, "module"]];

// The first error its owner's schema finds in the text of a file, written with the path; null for a file no schema owns and for one without an error.
function ownerError(path, text) {
  const owner = OWNERS.find(([pattern]) => pattern.test(path));
  if (!owner) return null;
  const schema = artifactSchemas()[owner[1]];
  const error = documentFindings(schema, readDocument(schema, path, text)).find((each) => each.kind === "error");
  return error ? `${path}: ${error.what}` : null;
}

// The rounds, and the findings the loop left, as the old prompt pages show them.
function roundsAndLeft(result) {
  const left = el("ul", "left");
  for (const found of result.remaining) left.append(el("li", "left", `${found.rule}: ${found.what} — ${found.fix}`));
  return [el("p", "rounds", `Correction rounds: ${result.rounds.length}`), explain("correction-loop"), left];
}

// The files of a draft: a change of a use case or of the architecture drafts `files`, a conversation `edits`.
const filesOf = (draft) => (draft.kind === "converse" ? draft.result.draft.edits : draft.result.draft.files) ?? [];

async function showFiles(where, draft, trailers, target) {
  const { snapshot, host } = where;
  const params = draft.params;
  // The text the job read: for the file the subject names, the blob in `version`; for any other, the one the page read.
  const named = params.useCase ?? params.target;
  const namedPath = named === undefined ? null : [...statuses(snapshot)].find(([, each]) => each.id === named)?.[0] ?? null;
  const versionOf = (path) => (path === namedPath && params.version ? params.version : undefined);
  const architecture = draft.kind === "change-architecture";
  const extras = (path, text) => {
    const diligence = architecture ? splitDueDiligence(text).section : null;
    return diligence === null ? [] : [dueDiligenceSection(diligence)];
  };
  const check = draft.kind === "converse" ? ownerError : () => null;
  if (typeof draft.result.draft.answer === "string") target.append(el("div", "answer", draft.result.draft.answer));
  target.append(...roundsAndLeft(draft.result));
  if (architecture) target.append(roundsSection(draft.result.rounds, draft.result.stoppedBecause));
  const { drafts, discard, saved } = await fileDrafts({ files: filesOf(draft), snapshot, host, trailers, versionOf, check, extras });
  target.append(explain("draft-difference"), drafts, discard, saved);
}

async function show(where, params) {
  const { target, context } = where;
  target.append(el("h2", null, "The draft of the conversation"));
  const key = params.subject ?? null;
  const draft = key === null ? null : latestDraft(context.store, key);
  if (draft === null) {
    target.append(el("p", "none", "There is no draft of the conversation for this page."), ...(key === null ? [] : [link(`#${key}`, "back", "Back to the page")]));
    return;
  }
  if (draft.result.stoppedBecause === "unusable" || !draft.result.draft) {
    target.append(el("p", "unusable", "The participant's answer could not be read. Nothing was written."),
      el("details", "raw", el("summary", null, "The raw answer"), el("pre", "answer", String(draft.result.raw ?? ""))));
    return;
  }
  const { participants, instanceSnapshot } = await loadStage(where, draft.kind);
  const participant = participants.find((each) => each.name === draft.participant) ?? { name: draft.participant, model: null };
  const commit = instanceSnapshot.commit ?? "unknown";
  const trailers = provenanceLines({ agentM: { version: commit, commit }, jobId: null, kind: draft.kind, participant, rounds: draft.result.rounds.length });
  if (draft.kind === "change-requirements") {
    target.append(...roundsAndLeft(draft.result), await requirementsDraft({ ...where, draft, trailers }));
  } else {
    await showFiles(where, draft, trailers, target);
  }
}

async function render(target, context, params) {
  const where = await readPlace(target, context);
  if (where === null) return;
  try {
    await show(where, params);
  } catch (failure) {
    target.append(problem(failure, where.token));
  }
}

export const draftRoute = { name: "draft", entry: null, title: "The draft of the conversation", render };
