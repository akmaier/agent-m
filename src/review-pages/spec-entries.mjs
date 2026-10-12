// spec-entries.mjs — the review pages of the SPEC change entries (MOD-review-pages, Parts; Data: the descriptor `spec-entry`): the queues with
// their entries' states, one entry beside the section it replaces, and accepting entries through MOD-spec-changes' acceptEntries (UC-006).
//
// Module: MOD-review-pages
//
// NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; A QUEUE IS ACCEPTED IN ITS ORDER; A STALE APPROVAL IS NOT APPLIED; THE DASHBOARD WRITES ONLY ON A
// PERSON'S CLICK. Every state comes from MOD-spec-changes' queues and entryView; nothing is written while a page is drawn. An entry is addressed as
// spec-<queue folder>-<NN>, the form of its approval record.

import { queues, entryView, acceptEntries } from "../spec-changes/index.mjs";
import { sourceSchemas } from "../source-register/index.mjs";
import { approvalSchema, fallbackAcceptLink } from "../approvals/index.mjs";
import { readDocument, writeDocument } from "../documents/index.mjs";
import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, link, button, storedToken, problem, parseServer, TOKEN_STEP } from "./common.mjs";

const pad2 = (number) => String(number).padStart(2, "0");
const shortOf = (folder) => folder.slice(folder.lastIndexOf("/") + 1);
const idOf = (queue, number) => `spec-${shortOf(queue.folder)}-${pad2(number)}`;
// An entry a person may accept: one that no record or decision decides.
const acceptable = (item) => item.state === "open" || item.state === "stale";
// An entry a person may tick: also one that waits for its anchor, which goes with the entry that creates it.
const tickable = (item) => acceptable(item) || item.state === "waiting for its anchor";

/**
 * specEntryRoute(kind) -> Route — the route of the SPEC entries: the queues with their entries, and, for an id, one entry.
 */
export function specEntryRoute(kind) {
  async function render(target, context, params) {
    const host = (context.product ?? context.instance).host;
    const token = storedToken(context);
    target.replaceChildren();
    let snapshot, all;
    try {
      const { defaultBranch } = await host.repositoryInfo();
      snapshot = await host.readSnapshot(defaultBranch);
      all = await queues(snapshot);
    } catch (failure) {
      target.append(problem(failure, token));
      return;
    }
    const where = { host, token, snapshot, queues: all, context, target };
    if (params.id) await showOne(where, params.id);
    else await showList(where);
  }

  const redraw = async (where, params, message) => {
    await render(where.target, where.context, params);
    if (message) where.target.append(message);
  };

  // The product's links and the instance's register, which acceptEntries checks every requirement's source against.
  async function sourcesOf({ snapshot, context }) {
    const { entry: entrySchema, links: linksSchema } = sourceSchemas();
    const holder = context.product ? await (async () => {
      const { defaultBranch } = await context.instance.host.repositoryInfo();
      return context.instance.host.readSnapshot(defaultBranch);
    })() : snapshot;
    const links = readDocument(linksSchema, "docs/sources.md", (await snapshot.read("docs/sources.md")) ?? "");
    const register = await Promise.all(holder.paths.filter((path) => /^docs\/sources\/[^/]+\.md$/.test(path))
      .map(async (path) => readDocument(entrySchema, path, (await holder.read(path)) ?? "")));
    return { links, register };
  }

  // Accepts the entries shown, in one click; a refusal names every entry with its reason, and the page is drawn again from the repository.
  async function accept(where, shown, params) {
    const { host, token } = where;
    try {
      const result = await acceptEntries(host, shown, token.name, new Date(), await sourcesOf(where));
      if (result.refused) {
        const message = el("p", "result problem", result.refused.map(({ queue, entry: number, reason }) => `entry ${pad2(number)} of ${shortOf(queue)}: ${reason}`).join(" "));
        await redraw(where, params, message);
      } else await redraw(where, params, el("p", "result", `Accepted in commit ${result.commit.slice(0, 7)}.`));
    } catch (failure) {
      where.target.append(el("p", "result problem", failure.message));
    }
  }

  async function showList(where) {
    const { target, snapshot, token, context } = where;
    target.append(el("h2", null, kind.title), explain(kind.explain.list));
    const ticks = new Map();
    const bar = token ? button("btn accept-ticked", "Accept ticked (0)") : null;
    if (bar) bar.disabled = true;
    // What a tick holds is read before the page is drawn, so a click needs no wait: the blobs of the proposal and of the section as they stand now.
    const shownOf = new Map();
    if (token) {
      for (const queue of where.queues) {
        for (const item of queue.entries.filter(tickable)) {
          const view = await entryView(queue.folder, item.number, snapshot);
          shownOf.set(idOf(queue, item.number), { queue: queue.folder, entry: item.number, proposalBlob: view.proposal.blob, sectionBlob: view.current?.blob ?? "" });
        }
      }
    }
    for (const queue of where.queues) {
      const rows = el("tbody");
      for (const item of queue.entries) {
        const first = el("td");
        if (token && tickable(item)) {
          const box = el("input", "tick");
          box.type = "checkbox";
          box.addEventListener("change", () => {
            if (box.checked) ticks.set(idOf(queue, item.number), shownOf.get(idOf(queue, item.number)));
            else ticks.delete(idOf(queue, item.number));
            bar.disabled = ticks.size === 0;
            bar.textContent = `Accept ticked (${ticks.size})`;
          });
          first.append(box);
        }
        const row = el("tr", null, first, el("td", null, link(`#${kind.route}/id=${encodeURIComponent(idOf(queue, item.number))}`, null, pad2(item.number))),
          el("td", null, item.anchor), el("td", null, el("span", `badge ${item.state.replaceAll(" ", "-")}`, item.state)));
        row.setAttribute("data-id", idOf(queue, item.number));
        rows.append(row);
      }
      const section = el("section", "queue", el("h3", null, queue.title || shortOf(queue.folder)),
        el("table", "list", el("thead", null, el("tr", null, el("th"), el("th", null, "Entry"), el("th", null, "Anchor"), el("th", null, "State"))), rows));
      section.setAttribute("data-folder", shortOf(queue.folder));
      target.append(section);
    }
    if (bar) {
      bar.addEventListener("click", () => { bar.disabled = true; accept(where, [...ticks.values()], {}); });
      target.append(bar);
    } else if (context.product) {
      target.append(el("p", "problem", "A product's SPEC is written with the product's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    }
  }

  async function showOne(where, id) {
    const { target, snapshot, token, context } = where;
    const queue = where.queues.find((candidate) => where.queues && candidate.entries.some((item) => idOf(candidate, item.number) === id));
    const item = queue?.entries.find((each) => idOf(queue, each.number) === id);
    if (!item) {
      target.append(el("p", "problem", `No SPEC change entry ${id} on the default branch.`), link(`#${kind.route}`, null, "All SPEC changes"));
      return;
    }
    const view = await entryView(queue.folder, item.number, snapshot);
    target.append(el("h2", null, `${shortOf(queue.folder)} · entry ${pad2(item.number)}`), el("span", `badge ${view.state.replaceAll(" ", "-")}`, view.state), explain(kind.explain.one));
    target.append(el("section", "current", el("h3", null, "Now in the SPEC"), view.current ? renderArtifact(view.current.text) : el("p", null, "There is no such section yet.")),
      el("section", "proposal", el("h3", null, "The proposal"), renderArtifact(view.proposal.text)),
      el("section", "difference", el("h3", null, "Difference"), showDifference(view.current?.text ?? "", view.proposal.text)),
      el("section", "rationale", el("h3", null, "Why"), renderArtifact(view.rationale)));
    const impact = el("ul", "impact");
    for (const each of view.impact) impact.append(el("li", null, `${each.name} — ${each.change}${each.referencedBy.length ? `, named by ${each.referencedBy.join(", ")}` : ""}`));
    target.append(el("section", "impact-list", el("h3", null, "Impact list"), impact));
    // The other proposals still open on the same section.
    const others = el("ul", "others");
    for (const other of where.queues) {
      for (const each of other.entries) {
        if (idOf(other, each.number) !== id && each.anchor === item.anchor && each.state !== "in SPEC") {
          others.append(el("li", null, link(`#${kind.route}/id=${encodeURIComponent(idOf(other, each.number))}`, null, idOf(other, each.number)), ` — ${each.state}`));
        }
      }
    }
    target.append(el("section", "others-list", el("h3", null, "Other open proposals on this section"), others));
    const order = el("ol", "order");
    for (const each of queue.entries) order.append(el("li", null, `${pad2(each.number)} — ${each.anchor} (${each.state})`));
    target.append(el("section", "queue-order", el("h3", null, "The queue's order"), order));

    if (view.state === "waiting for its anchor") {
      target.append(el("p", "waits", view.createdBy === null ? "Its heading is in no entry of the queue: it cannot be accepted."
        : `It goes only with or after entry ${pad2(view.createdBy)}, which creates its heading: accept them together.`));
      return;
    }
    if (!acceptable(item)) return;
    const shown = [{ queue: queue.folder, entry: item.number, proposalBlob: view.proposal.blob, sectionBlob: view.current?.blob ?? "" }];
    if (token) {
      const accept_ = button("btn accept", "Accept");
      accept_.addEventListener("click", () => { accept_.disabled = true; accept(where, shown, { id }); });
      target.append(accept_);
    } else if (!context.product) {
      // Without a token: the record alone, on GitHub's page; the instance's workflow writes the section.
      if (view.current === null) return;
      const record = { path: `docs/approvals/${id}-${view.proposal.blob.slice(0, 12)}.md`,
        text: writeDocument(approvalSchema, { fields: { kind: "spec", queue: queue.folder, entry: pad2(item.number), proposal: item.proposal.path,
          blob: view.proposal.blob, target: item.file, anchor: item.anchor, section: view.current.blob } }) };
      const offered = fallbackAcceptLink(record, snapshot);
      if (offered.refused) target.append(el("p", "problem", "A GitLab instance is written with a token. ", link(TOKEN_STEP, "token-step", "Store the token")));
      else target.append(el("div", "github-fallback", explain(kind.explain.fallback), link(offered.url, "github-page", "Open GitHub's page to commit the record"),
        el("p", null, "Path ", el("code", "record-path", offered.path)), el("pre", "record", offered.text)));
    } else {
      target.append(el("p", "problem", "A product's SPEC is written with the product's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    }
  }

  return { name: kind.route, entry: kind.entry, title: kind.title, render };
}
