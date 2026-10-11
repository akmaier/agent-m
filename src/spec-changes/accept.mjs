// accept.mjs — what the reviewer sees of an entry before accepting it (MOD-spec-changes, Interfaces: entryView). ITM-339 builds
// entryView; acceptEntries and applyApproved, which accept.mjs will hold too, are not built yet (index.mjs).
//
// Module: MOD-spec-changes
//
// entryView reads one queue's entry through queues.mjs and the files it names. Where the module file leaves a reading open, this
// file states the one it takes:
//
//   - `queue` is the queue's folder as Queue.folder gives it, docs/spec-freigaben/<folder>; a queue or an entry the snapshot does
//     not hold is a RangeError.
//   - `current` is the section that holds now: MOD-spec-document's sectionText of the entry's target — the file its own row names —
//     for its anchor, with the blob of those exact bytes. Where the target does not hold the anchor — a new section, or an entry
//     that waits for its anchor — or the snapshot cannot read the target, there is none and `current` is null; `createdBy` names
//     the entry that creates the anchor.
//   - `impact` lists the names of the proposal against the names of the section that holds now, so a new section adds all of them:
//     first the names the proposal no longer holds (withdrawn), then the names it states, in its order, that the section did not
//     hold (added) or holds with another source, rule or check (changed). A name it states word for word is not listed. Each name
//     comes with the identifier of every artifact that names it, once, in the order MOD-trace-graph's requirementImpact lists them.
//   - A rationale the queue does not hold is the empty text.

import { parseSpec, renamedRequirements, sectionText } from "../spec-document/index.mjs";
import { blobSha, lineDiff } from "../text-tools/index.mjs";
import { requirementImpact, traceGraph } from "../trace-graph/index.mjs";
import { queueAt } from "./queues.mjs";

// Whether a requirement stated by the proposal is another than the one the section holds under its name: its source, rule or check.
const differs = (was, is) => was.source !== is.source || was.rule !== is.rule || was.check !== is.check;

// The impact list of a proposal against the section that holds now (both texts, "" for none): every name withdrawn, added or
// changed, with the identifiers of the artifacts that name it. The graph of the snapshot is built only when a name is touched.
async function impactOf(snapshot, before, after) {
  const was = parseSpec(before).requirements, is = parseSpec(after).requirements;
  const { withdrawn, added } = renamedRequirements(before, after);
  const named = [
    ...withdrawn.map((name) => ({ name, change: "withdrawn" })),
    ...[...is.keys()].flatMap((name) => {
      if (added.includes(name)) return [{ name, change: "added" }];
      return differs(was.get(name), is.get(name)) ? [{ name, change: "changed" }] : [];
    }),
  ];
  if (named.length === 0) return [];
  const graph = await traceGraph(snapshot);
  return named.map(({ name, change }) => ({
    name, change, referencedBy: [...new Set(requirementImpact(graph, name).map((place) => place.id))],
  }));
}

/**
 * entryView(queue: string, entry: number, snapshot: Snapshot) -> Promise<{ current: { text: string, blob: string } | null,
 *   proposal: { text: string, blob: string }, difference: DiffLine[], rationale: string, impact: Array<{ name: string,
 *   change: "changed" | "withdrawn" | "added", referencedBy: string[] }>, state: string, createdBy: number | null }> — what the
 * reviewer sees (MOD-spec-changes, Interfaces): the section that holds now beside the proposal, their difference, the rationale
 * and the impact list (NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT, A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST).
 */
export async function entryView(queue, entry, snapshot) {
  const found = await queueAt(snapshot, queue);
  const item = found?.entries.find((candidate) => candidate.number === entry);
  if (!item) throw new RangeError(`entryView: the snapshot holds no entry ${entry} of the queue ${queue}`);
  const targetText = await snapshot.read(item.file);
  const heldNow = typeof targetText === "string" ? sectionText(targetText, item.anchor) : null;
  const proposalText = item.proposal.path ? (await snapshot.read(item.proposal.path)) ?? "" : "";
  const rationale = item.rationale ? (await snapshot.read(item.rationale)) ?? "" : "";
  return {
    current: heldNow === null ? null : { text: heldNow, blob: await blobSha(heldNow) },
    proposal: { text: proposalText, blob: item.proposal.blob },
    difference: lineDiff(heldNow ?? "", proposalText),
    rationale,
    impact: await impactOf(snapshot, heldNow ?? "", proposalText),
    state: item.state,
    createdBy: item.createdBy,
  };
}
