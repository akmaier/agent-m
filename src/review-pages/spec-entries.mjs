// spec-entries.mjs — the service the descriptor of the SPEC change entries names (MOD-review-pages, Parts): what the one review flow in flow.mjs
// asks of a kind whose files are the entries of a change queue — their groups and states, one entry with its sections, and the acceptance through
// MOD-spec-changes' acceptEntries. It draws no page of its own; flow.mjs does.
//
// Module: MOD-review-pages
//
// A QUEUE IS ACCEPTED IN ITS ORDER; A STALE APPROVAL IS NOT APPLIED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK. Every state comes from
// MOD-spec-changes' queues and entryView; nothing is written here but by acceptEntries. An entry is addressed as spec-<queue folder>-<NN>, the form of
// its approval record.

import { queues, entryView, acceptEntries } from "../spec-changes/index.mjs";
import { sourceSchemas } from "../source-register/index.mjs";
import { approvalSchema } from "../approvals/index.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { entrySections } from "./sections.mjs";
import { el } from "./common.mjs";

const pad2 = (number) => String(number).padStart(2, "0");
const shortOf = (folder) => folder.slice(folder.lastIndexOf("/") + 1);
// The identifier of an entry by the folder of its queue and its number, the form of its approval record.
export const entryId = (folder, number) => `spec-${shortOf(folder)}-${pad2(number)}`;
const idOf = (queue, number) => entryId(queue.folder, number);
// An entry a person may accept: one that no record or decision decides.
const acceptable = (item) => item.state === "open" || item.state === "stale";
// An entry a person may tick: also one that waits for its anchor, which goes with the entry that creates it.
const tickable = (item) => acceptable(item) || item.state === "waiting for its anchor";
const shownOf = (queue, item, view) => ({ queue: queue.folder, entry: item.number, proposalBlob: view.proposal.blob, sectionBlob: view.current?.blob ?? "" });

// The product's links and the instance's register, which acceptEntries checks every requirement's source against.
export async function sourcesOf({ snapshot, context }) {
  const { entry: entrySchema, links: linksSchema } = sourceSchemas();
  let holder = snapshot;
  if (context.product) {
    const { defaultBranch } = await context.instance.host.repositoryInfo();
    holder = await context.instance.host.readSnapshot(defaultBranch);
  }
  const links = readDocument(linksSchema, "docs/sources.md", (await snapshot.read("docs/sources.md")) ?? "");
  const register = await Promise.all(holder.paths.filter((path) => /^docs\/sources\/[^/]+\.md$/.test(path))
    .map(async (path) => readDocument(entrySchema, path, (await holder.read(path)) ?? "")));
  return { links, register };
}

export const queueService = {
  // A product's SPEC is written with the product's own token, whichever server it is on.
  tokenRequired: (context) => Boolean(context.product),
  tokenNote: "A product's SPEC is written with the product's own token. ",
  reviewAll: false,

  // The queues, newest first, each as a group of its entries.
  async groups({ snapshot, token }) {
    const groups = [];
    for (const queue of await queues(snapshot)) {
      const entries = [];
      for (const item of queue.entries) {
        let tick = null;
        if (token && tickable(item)) tick = shownOf(queue, item, await entryView(queue.folder, item.number, snapshot));
        entries.push({ id: idOf(queue, item.number), name: pad2(item.number), title: item.anchor, status: item.state.replaceAll(" ", "-"), label: item.state, tick });
      }
      groups.push({ key: shortOf(queue.folder), title: queue.title || shortOf(queue.folder), entries });
    }
    return groups;
  },

  // One entry: null where no queue holds it; else its state, its sections, what holds it back, what a click accepts, and the record without a token.
  async view({ snapshot, context }, id, hrefOf) {
    const all = await queues(snapshot);
    const queue = all.find((candidate) => candidate.entries.some((item) => idOf(candidate, item.number) === id));
    const item = queue?.entries.find((each) => idOf(queue, each.number) === id);
    if (!item) return null;
    const view = await entryView(queue.folder, item.number, snapshot);
    const others = all.flatMap((other) => other.entries.filter((each) => idOf(other, each.number) !== id && each.anchor === item.anchor && each.state !== "in SPEC")
      .map((each) => ({ id: idOf(other, each.number), state: each.state })));
    const order = queue.entries.map((each) => ({ number: each.number, anchor: each.anchor, state: each.state }));
    const result = { title: `${shortOf(queue.folder)} · entry ${pad2(item.number)}`, status: view.state.replaceAll(" ", "-"), label: view.state,
      nodes: entrySections(view, others, order, hrefOf), hold: null, shown: null, record: null, edit: view.state === "open" };
    if (view.state === "waiting for its anchor") {
      result.hold = el("p", "waits", view.createdBy === null ? "Its heading is in no entry of the queue: it cannot be accepted."
        : `It goes only with or after entry ${pad2(view.createdBy)}, which creates its heading: accept them together.`);
      return result;
    }
    if (!acceptable(item)) return result;
    result.shown = [shownOf(queue, item, view)];
    // Without a token the instance's own SPEC is written by its workflow from the record alone; a product has no such workflow.
    if (!context.product && view.current !== null) {
      result.record = { path: `docs/approvals/${id}-${view.proposal.blob.slice(0, 12)}.md`,
        text: writeDocument(approvalSchema, { fields: { kind: "spec", queue: queue.folder, entry: pad2(item.number), proposal: item.proposal.path,
          blob: view.proposal.blob, target: item.file, anchor: item.anchor, section: view.current.blob } }) };
    }
    return result;
  },

  // The entries shown, accepted in one commit by acceptEntries; its refusal comes back as a text, the commit with nothing left out otherwise.
  async accept(where, shown, person) {
    const result = await acceptEntries(where.host, shown, person, new Date(), await sourcesOf(where));
    if (result.refused) {
      return { refusal: result.refused.map(({ queue, entry, reason }) => `entry ${pad2(entry)} of ${shortOf(queue)}: ${reason}`).join(" ") };
    }
    return { commit: result.commit, leftOut: [] };
  },
};
