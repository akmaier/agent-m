// strategies.mjs — the recipes and the precondition of approvalStrategies (MOD-approvals, Parts: strategies.mjs; Interfaces:
// approvalStrategies). Of it, ITM-332 builds the recipes `use-cases` and `use-case-with-neighbours` and the precondition
// `rests-on-accepted` for requirements and use cases. ITM-437 builds the recipe `accepted-use-cases` and the precondition
// `architecture-ready`; the recipe `whole-architecture` and the architecture's part of `rests-on-accepted` are not built yet.
//
// Module: MOD-approvals
//
// Strategies, JobContext and Part are MOD-job-runner's types, Finding MOD-text-tools'. A strategy reads the product of the
// job's context through its snapshot: the use cases and the SPEC, and the status of every use case from the records beside
// them (statuses). The job's parameters are read by name: `useCase`, the identifier of the use case a change is asked of;
// `requirements`, the names, and `useCases`, the identifiers, of the selection a job rests on.

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { statuses } from "./status.mjs";

const SPEC_PATH = "SPEC.md";
const ACCEPTED_FIRST = "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED";
const ONLY_ACCEPTED = "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES";
const AS_A_WHOLE = "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE";

// A failure of the module's own, by name, with the fields its message names.
const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

// Every use case of the product, in the order its files stand in the snapshot: its identifier, path, status and text, and the
// document that the use-case schema reads from the text.
async function useCasesOf(snapshot) {
  const found = [];
  for (const [path, { id, kind, status }] of statuses(snapshot)) {
    if (kind !== "use-case") continue;
    const text = await snapshot.read(path);
    found.push({ id, path, status, text, document: readDocument(artifactSchemas().useCase, path, text) });
  }
  return found;
}

// The part of a use case: its file's path and its status in its name, the whole file as its text. The job runner sets its size
// and the recipe it fills.
const partOf = ({ path, status, text }) => ({ name: `${path} — ${status}`, text, size: 0, sources: [], required: true });

// The part of a requirement, named by it: the requirement as the SPEC states it — its name and source, its rule, its check.
const requirementPart = ({ name, source, rule, check }) => ({ name, size: 0, sources: [], required: true,
  text: [`**${name}**${source === null ? "" : ` *(${source})*`}`, rule, check === null ? null : `*Check:* ${check}`]
    .filter((line) => line !== null).join("\n") });

// The SPEC changes that are open, by their proposals' paths, in the order the files stand: the entries of the change queues
// (docs/spec-freigaben/<queue>/NN-<slug>.md, where the queue has its index.md) that no row of the queue's entscheidungen.md
// decides. A row is `| <when> | <entry number> | uebernommen | <reference> |`.
const DECIDED_ROW = /^\|[^|]*\|\s*(\d+)\s*\|\s*uebernommen\s*\|/gm;
async function openSpecChanges(snapshot) {
  const open = [];
  for (const index of snapshot.paths.filter((path) => /^docs\/spec-freigaben\/[^/]+\/index\.md$/.test(path))) {
    const queue = index.slice(0, index.lastIndexOf("/"));
    const rows = (await snapshot.read(`${queue}/entscheidungen.md`)) ?? "";
    const decided = new Set([...rows.matchAll(DECIDED_ROW)].map((row) => Number(row[1])));
    for (const path of snapshot.paths) {
      const entry = path.startsWith(`${queue}/`) ? /^(\d{2,})-[^/]*\.md$/.exec(path.slice(queue.length + 1)) : null;
      if (entry && !path.endsWith(".begruendung.md") && !decided.has(Number(entry[1]))) open.push(path);
    }
  }
  return open;
}

// The values of a parameter that is a list of texts; none for any other.
const listOf = (value) => (Array.isArray(value) ? value.filter((each) => typeof each === "string") : []);

// How a use case that is not accepted stands, by its status.
const NOT_ACCEPTED = { open: "is open", changed: "has changed since it was accepted" };

/**
 * approvalStrategies: Strategies — the strategies this module offers the job runner (ARC-046):
 * - recipe `use-cases`: every use case of the product as one part per file, whose name holds the file's path and the use case's
 *   status — open, accepted or changed — and whose text is the file; the part carries the use case as an artifact, its
 *   identifier and the key of the use-case format (artifactSchemas), against which `candidate-classes` classifies a draft;
 * - recipe `use-case-with-neighbours`: the use case the parameter `useCase` names, as a part like those of `use-cases`; then one
 *   part for each requirement it realises that the SPEC holds, named by the requirement, holding its text from the SPEC, in the
 *   order the use case names them; then every other use case as a part like the first. Throws UseCaseNotFound { useCase } when
 *   the product has no use case of that identifier;
 * - recipe `accepted-use-cases`: the use cases a record names the current text of, as parts like those of `use-cases` but
 *   without an artifact, one per file, in the order the files stand;
 * - precondition `architecture-ready`: one finding, the first that holds of: an error under THE FIRST ARCHITECTURE IS DESIGNED
 *   AS A WHOLE when the product has an architecture decision or module file already, pointing to UC-023; an error under
 *   ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES naming each use case that is open or changed; a warning under THE
 *   FIRST ARCHITECTURE IS DESIGNED AS A WHOLE naming, by its proposal's path, each SPEC change that is open — an entry of a
 *   change queue that no row of the queue's entscheidungen.md decides; none when the product is ready;
 * - precondition `rests-on-accepted`: one error finding, under NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED, that names every
 *   requirement of the parameter `requirements` that the SPEC does not hold and every use case of the parameter `useCases` that
 *   no record names the current text of, or that is no use case of the product; none when all are accepted, or when the job
 *   names no selection.
 */
export const approvalStrategies = {
  recipes: {
    "use-cases": async (context) => (await useCasesOf(context.product.snapshot)).map((each) => ({ ...partOf(each),
      artifacts: [{ id: each.id,
        keys: artifactSchemas().useCase.key.map((field) => String(each.document.fields[field] ?? "")) }] })),
    "accepted-use-cases": async (context) => (await useCasesOf(context.product.snapshot))
      .filter((each) => each.status === "accepted").map(partOf),
    "use-case-with-neighbours": async (context, params) => {
      const { snapshot } = context.product;
      const all = await useCasesOf(snapshot);
      const target = all.find((each) => each.id === params.useCase);
      if (!target) {
        throw failure("UseCaseNotFound", `the product has no use case ${params.useCase}`, { useCase: params.useCase });
      }
      const spec = parseSpec((await snapshot.read(SPEC_PATH)) ?? "");
      const realised = [...new Set([target.document.fields.realises ?? []].flat())]
        .map((name) => spec.requirements.get(name)).filter((requirement) => requirement !== undefined);
      return [partOf(target), ...realised.map(requirementPart), ...all.filter((each) => each !== target).map(partOf)];
    },
  },
  preconditions: {
    "architecture-ready": async (context) => {
      const { snapshot, address } = context.product;
      const reviewed = [...statuses(snapshot).values()];
      const notAccepted = reviewed.filter((each) => each.kind === "use-case" && each.status !== "accepted");
      const changes = await openSpecChanges(snapshot);
      const found = (kind, rule, what, fix) => finding({ artifact: address, line: 1, kind, rule, what, fix });
      if (reviewed.some((each) => each.kind !== "use-case")) {
        return found("error", AS_A_WHOLE, "the product has an architecture already: a first architecture is not drafted beside it",
          "change the architecture instead (UC-023)");
      }
      if (notAccepted.length > 0) {
        return found("error", ONLY_ACCEPTED, `use cases that are not accepted: ${notAccepted.map((each) =>
          `${each.id} (${NOT_ACCEPTED[each.status]})`).join("; ")}`, "accept them first (UC-008)");
      }
      return changes.length === 0 ? null : found("warning", AS_A_WHOLE,
        `SPEC changes that are open, which the architecture is not derived from: ${changes.join("; ")}`,
        "decide them first (UC-006), or go on: the architecture is derived from the SPEC as it stands");
    },
    "rests-on-accepted": async (context) => {
      const { snapshot, address } = context.product;
      const requirements = listOf(context.params.requirements), useCases = listOf(context.params.useCases);
      const spec = parseSpec((await snapshot.read(SPEC_PATH)) ?? "");
      const status = new Map([...statuses(snapshot).values()].filter((each) => each.kind === "use-case")
        .map((each) => [each.id, each.status]));
      const open = [
        ...requirements.filter((name) => !spec.requirements.has(name))
          .map((name) => `the requirement ${name} is not in the SPEC`),
        ...useCases.filter((id) => status.get(id) !== "accepted").map((id) =>
          `the use case ${id} ${NOT_ACCEPTED[status.get(id)] ?? "is no use case of the product"}`),
      ];
      return open.length === 0 ? null : finding({ artifact: address, line: 1, kind: "error", rule: ACCEPTED_FIRST,
        what: `the job rests on what is not accepted: ${open.join("; ")}`,
        fix: "accept them first, or take them out of the job's selection" });
    },
  },
};
