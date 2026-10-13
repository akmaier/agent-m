// flow.mjs — the one review flow every reviewed kind goes through (MOD-review-pages, Parts): the files of a kind with their status
// and a tick, one file with its text and its difference to the last accepted text, accepting what was shown, and Review all: every file not yet accepted on one page, with the acceptance of what it shows.
//
// Module: MOD-review-pages
//
// STATUS IS DERIVED FROM THE RECORDS (it is read from MOD-approvals only); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; WITHOUT A
// TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN. Nothing is written while a page is drawn.

import { statuses, lastAcceptedText, acceptShown, acceptanceBlockers, fallbackAcceptLink, approvalSchema } from "../approvals/index.mjs";
import { writeDocument, readDocument, artifactSchemas } from "../documents/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { renderArtifact, showDifference } from "../markdown-render/index.mjs";
import { readSetting } from "../browser-store/index.mjs";
import { parseAddress } from "../repository-hosts/index.mjs";
import { explain } from "../site-frame/index.mjs";
import { el, link, button, storedToken, problem, parseServer, TOKEN_STEP } from "./common.mjs";
import { showEdit } from "./edit.mjs";
import { showEntryEdit } from "./entry-edit.mjs";
import { showDraft, jobNotes } from "./jobs.mjs";
import { showPrompt } from "./prompt.mjs";
import { queueService } from "./spec-entries.mjs";
import { splitDueDiligence, dueDiligenceSection, roundsSection, stoppedBecause } from "./sections.mjs";

const LABEL = { open: "open", accepted: "accepted", changed: "changed since acceptance" };
// The id of the page that shows every file not yet accepted: #<route>/id=all.
const REVIEW_ALL = "all";
// The id of the page that drafts files of a kind that has a job to draft them: #<route>/id=draft.
const DRAFT = "draft";
// The kind of job whose record holds the rounds of the architecture shown.
const ARCHITECTURE_JOB = "derive-architecture";

const recordOf = (id, kind, path, blob) => ({ path: `docs/approvals/${id}-${blob.slice(0, 12)}.md`,
  text: writeDocument(approvalSchema, { fields: { kind, file: path, blob } }) });

const shortBody = (body) => body.replace(/^---\n[^]*?\n---\n/, "");

// What an acceptance of several files came to: the commit, and each file left out with its reason and the names it rests on.
const reasonOf = (out) => `${out.reason}${out.names.length ? ` (${out.names.join(", ")})` : ""}`;
function acceptedMessage(result, idOf) {
  const message = el("p", "result", `Accepted in commit ${result.commit.slice(0, 7)}.`);
  for (const out of result.leftOut) message.append(el("br"), `${idOf(out.path)} was left out: ${reasonOf(out)}.`);
  return message;
}
// What a decision came to: a refusal as the service gives it, else the commit and each file left out.
const settled = (result, idOf) => (result.refusal ? el("p", "result problem", result.refusal) : acceptedMessage(result, idOf));
// What a refused acceptance of several files says: the failure, and each file it left out with its reason.
const refusedText = (failure, idOf) => [failure.message, ...(failure.leftOut ?? []).map((out) => `${idOf(out.path)}: ${reasonOf(out)}`)].join(" ");

// The files of the whole architecture in the order of its review page: the decision that states the system — the one that refines no
// other —, the subsystems' decisions — those that refine it and design modules —, the module files, the further decisions — those
// that refine it and design none —; each group by identifier.
function architectureOrder(entries, texts) {
  const group = (file) => {
    if (file.kind === "module") return 2;
    let fields;
    try { fields = readDocument(artifactSchemas().decision, file.path, texts.get(file.path)).fields; } catch { return 3; }
    if (!fields.refines) return 0;
    return [fields.designs ?? []].flat().length ? 1 : 3;
  };
  return entries.map((file) => ({ file, group: group(file) })).sort((a, b) => a.group - b.group || a.file.id.localeCompare(b.file.id)).map(({ file }) => file);
}

// The rounds of the newest job that drafted an architecture and has ended, as its record holds them, with why its loop stopped, which
// the record's `Left:` line states; null where there is no such job.
async function draftingRounds(where) {
  try {
    const address = where.context.product?.address ?? where.context.instance.repository;
    const rows = await listJobs([{ address, snapshot: where.snapshot }], new Map());
    const row = rows.find((each) => each.record.kind === ARCHITECTURE_JOB && each.record.end);
    if (!row || !row.record.end.rounds.length) return null;
    return { rounds: row.record.end.rounds, stopped: stoppedBecause(await where.snapshot.read(row.record.path)) };
  } catch { return null; }
}

// The service a descriptor names for its decisions (`accept`): the approvals of reviewed files, or the entries of a change queue through
// MOD-spec-changes. Each gives the flow the groups of files to list, whether a kind has a Review all, whether a product without a token
// is sent to the token's step, and accepts what was shown, once: a result { commit, leftOut } or { refusal } — a failure is thrown.
const approvalsService = {
  tokenRequired: (context) => parseServer(context) === "gitlab",
  tokenNote: "A GitLab product is written with the project's own token. ",
  reviewAll: true,
  async groups({ snapshot, token }, kind) {
    const entries = [];
    for (const file of [...statuses(snapshot)].filter(([, each]) => each.kind === kind.kind).map(([path, each]) => ({ path, ...each })).sort((a, b) => a.id.localeCompare(b.id))) {
      const body = (await snapshot.read(file.path)) ?? "";
      entries.push({ id: file.id, name: file.id, title: kind.heading(body).replace(/^\S+\s*/, ""), status: file.status, label: LABEL[file.status],
        tick: file.status === "accepted" ? null : { path: file.path, blob: snapshot.blob(file.path) } });
    }
    return [{ key: kind.kind, title: null, entries }];
  },
  accept: (where, shown, person) => acceptShown(where.host, shown, person),
};
const SERVICES = { approvals: approvalsService, queue: queueService };

export function reviewRoute(kind) {
  const service = SERVICES[kind.accept ?? "approvals"];
  const files = (snapshot) => [...statuses(snapshot)].filter(([, file]) => file.kind === kind.kind)
    .map(([path, file]) => ({ path, ...file })).sort((a, b) => a.id.localeCompare(b.id));
  const idOf = (path, snapshot) => statuses(snapshot).get(path)?.id ?? path;

  async function render(target, context, params) {
    const host = (context.product ?? context.instance).host;
    const token = storedToken(context);
    target.replaceChildren();
    let snapshot;
    try {
      const { defaultBranch } = await host.repositoryInfo();
      snapshot = await host.readSnapshot(defaultBranch);
    } catch (failure) {
      target.append(problem(failure, token));
      return;
    }
    const where = { host, token, snapshot, context, target };
    if (kind.edit) await showEdit(where, kind, params);
    else if (params.edit && params.id && kind.save === "entry") await showEntryEdit(where, kind, params.id);
    else if (params.prompt && params.id && kind.prompt) await showPrompt(where, kind, params.id);
    else if (params.id === DRAFT && kind.draft) await showDraft(where, kind);
    else if (params.id === REVIEW_ALL && service.reviewAll) await showAll(where);
    else if (params.id && service.view) await showEntry(where, params.id);
    else if (params.id) await showOne(where, params.id);
    else await showList(where);
  }

  // After a decision: the page again from the repository, and what the decision came to under it.
  const redraw = async (where, params, message) => {
    await render(where.target, where.context, params);
    if (message) where.target.append(message);
  };

  async function showList(where) {
    const { target, token, context } = where;
    const groups = await service.groups(where, kind);
    const ticks = new Map();
    const bar = token ? button("btn accept-ticked", "Accept ticked (0)") : null;
    if (bar) bar.disabled = true;
    const tables = [];
    for (const group of groups) {
      const rows = el("tbody");
      for (const file of group.entries) {
        const first = el("td");
        if (token && file.tick) {
          const box = el("input", "tick");
          box.type = "checkbox";
          box.addEventListener("change", () => {
            if (box.checked) ticks.set(file.id, file.tick); else ticks.delete(file.id);
            bar.disabled = ticks.size === 0;
            bar.textContent = `Accept ticked (${ticks.size})`;
          });
          first.append(box);
        }
        const row = el("tr", null, first, el("td", null, link(`#${kind.route}/id=${encodeURIComponent(file.id)}`, null, file.name)),
          el("td", null, file.title), el("td", null, el("span", `badge ${file.status}`, file.label)));
        row.setAttribute("data-id", file.id);
        rows.append(row);
      }
      const table = el("table", "list", el("thead", null, el("tr", null, el("th"), el("th", null, "Id"), el("th", null, "Title"), el("th", null, "Status"))), rows);
      if (group.title === null) tables.push(table);
      else {
        const section = el("section", "queue", el("h3", null, group.title), table);
        section.setAttribute("data-folder", group.key);
        tables.push(section);
      }
    }
    target.append(el("h2", null, kind.title));
    if (service.reviewAll) target.append(link(`#${kind.route}/id=${REVIEW_ALL}`, "review-all", "Review all"));
    if (kind.draft) target.append(link(`#${kind.route}/id=${DRAFT}`, "draft-link", `Draft ${kind.plural}`));
    target.append(explain(kind.explain.list));
    if (bar) {
      bar.addEventListener("click", async () => {
        bar.disabled = true;
        try {
          const result = await service.accept(where, [...ticks.values()], token.name);
          await redraw(where, {}, settled(result, (path) => idOf(path, where.snapshot)));
        } catch (failure) {
          bar.disabled = ticks.size === 0;
          target.append(el("p", "result problem", refusedText(failure, (path) => idOf(path, where.snapshot))));
        }
      });
    } else if (context.product && service.tokenRequired(context)) {
      target.append(el("p", "problem", service.tokenNote, link(TOKEN_STEP, "token-step", "Store the token")));
    }
    target.append(...tables);
    if (bar) target.append(bar);
  }

  // Review all: every file not yet accepted in sequence — a changed one as its difference to the last accepted text, a new one in
  // full — and, below them, the acceptance of exactly what is shown. For the architecture it is the page of the whole architecture:
  // decisions and module files in their order, a further decision with its due diligence, and the rounds of the job that drafted them.
  async function showAll(where) {
    const { target, snapshot, token, host, context } = where;
    const reviewed = [...statuses(snapshot)].filter(([, file]) => (kind.whole ?? [kind.kind]).includes(file.kind))
      .map(([path, file]) => ({ path, ...file })).filter((file) => file.status !== "accepted");
    const texts = new Map();
    for (const file of reviewed) texts.set(file.path, (await snapshot.read(file.path)) ?? "");
    const shown = kind.whole ? architectureOrder(reviewed, texts) : reviewed.sort((a, b) => a.id.localeCompare(b.id));
    target.append(el("h2", null, kind.whole ? "Review all — the whole architecture" : `Review all — ${kind.title}`), explain(kind.explain.all));
    if (shown.length === 0) {
      target.append(el("p", "nothing", `Nothing to review: every ${kind.noun} is accepted.`));
      return;
    }
    const records = [];
    for (const file of shown) {
      const body = texts.get(file.path);
      const blob = snapshot.blob(file.path);
      records.push({ file, record: recordOf(file.id, file.kind, file.path, blob), blob });
      const section = el("section", "review-file", el("h3", null, kind.heading(body)), el("span", `badge ${file.status}`, LABEL[file.status]));
      section.setAttribute("data-id", file.id);
      if (file.status === "changed") {
        const diff = el("section", "accepted-diff", el("h4", null, "Changed since it was last accepted"));
        try {
          const last = await lastAcceptedText(file.id, host);
          if (last) diff.append(showDifference(last.text, body));
        } catch (failure) {
          diff.append(el("p", "problem", failure.message));
        }
        section.append(diff);
      } else {
        const { rest, section: diligence } = kind.whole && file.kind === "architecture-decision" ? splitDueDiligence(shortBody(body)) : { rest: shortBody(body), section: null };
        section.append(renderArtifact(rest));
        if (diligence !== null) section.append(dueDiligenceSection(diligence));
      }
      if (kind.restsOn) {
        const open = await acceptanceBlockers(file.path, snapshot);
        if (open.length) {
          const names = el("ul");
          for (const name of open) names.append(el("li", "open-name", name));
          section.append(el("section", "rests-on", el("h4", null, "Rests on what is not accepted"), names));
        }
      }
      target.append(section);
    }
    if (kind.whole) {
      const rounds = await draftingRounds(where);
      if (rounds) target.append(roundsSection(rounds.rounds, rounds.stopped));
    }
    const heading = `Accept all ${shown.length} shown`;
    if (token) {
      const accept = button("btn accept-all", heading);
      accept.addEventListener("click", async () => {
        accept.disabled = true;
        try {
          const result = await acceptShown(host, records.map(({ file, blob }) => ({ path: file.path, blob })), token.name);
          await redraw(where, { id: REVIEW_ALL }, acceptedMessage(result, (path) => idOf(path, snapshot)));
        } catch (failure) {
          accept.disabled = false;
          target.append(el("p", "result problem", refusedText(failure, (path) => idOf(path, snapshot))));
        }
      });
      target.append(accept);
    } else if (parseServer(context) === "gitlab") {
      target.append(el("p", "problem", "A GitLab product is written with the project's own token. ", link(TOKEN_STEP, "token-step", "Store the token")));
    } else {
      for (const { file, record } of records) {
        const offered = fallbackAcceptLink(record, snapshot);
        target.append(el("p", "github-fallback", `${file.id}: `, link(offered.url, "github-page", "Open GitHub's page to commit the record")));
      }
    }
  }

  // Without a token: the record alone on GitHub's page for the instance's own SPEC; a GitLab product, or a record there is none of, is sent to the token's step.
  function offerRecord(target, record, snapshot) {
    const offered = record ? fallbackAcceptLink(record, snapshot) : { refused: true };
    if (offered.refused) {
      target.append(el("p", "problem", service.tokenNote, link(TOKEN_STEP, "token-step", "Store the token")));
      return;
    }
    const copy = (text) => { const b = button("btn copy", "Copy"); b.addEventListener("click", () => globalThis.navigator?.clipboard?.writeText?.(text)); return b; };
    target.append(el("div", "github-fallback", explain(kind.explain.fallback),
      link(offered.url, "github-page", "Open GitHub's page to commit the record"),
      el("p", null, "Path ", el("code", "record-path", offered.path), " ", copy(offered.path)),
      el("pre", "record", offered.text), copy(offered.text)));
  }

  // One entry of a change queue: its sections as the service draws them, what holds it back or what a click accepts, and without a token the record.
  async function showEntry(where, id) {
    const { target, token, snapshot } = where;
    const entry = await service.view(where, id, (other) => `#${kind.route}/id=${encodeURIComponent(other)}`);
    if (!entry) {
      target.append(el("p", "problem", `No ${kind.noun} ${id} on the default branch.`), link(`#${kind.route}`, null, `All ${kind.plural}`));
      return;
    }
    target.append(el("h2", null, entry.title), el("span", `badge ${entry.status}`, entry.label), explain(kind.explain.one), ...entry.nodes);
    if (entry.edit) target.append(link(`#${kind.route}/id=${encodeURIComponent(id)}/edit=1`, "edit-link", "Edit"));
    if (entry.hold) { target.append(entry.hold); return; }
    if (!entry.shown) return;
    if (!token) { offerRecord(target, entry.record, snapshot); return; }
    const accept = button("btn accept", "Accept");
    accept.addEventListener("click", async () => {
      accept.disabled = true;
      try {
        await redraw(where, { id }, settled(await service.accept(where, entry.shown, token.name), (path) => idOf(path, snapshot)));
      } catch (failure) {
        accept.disabled = false;
        target.append(el("p", "result problem", refusedText(failure, (path) => idOf(path, snapshot))));
        if (failure.name === "PermissionMissing") offerRecord(target, entry.record, snapshot);
      }
    });
    target.append(accept);
  }

  async function showOne(where, id) {
    const { target, snapshot, token, host } = where;
    const file = files(snapshot).find((candidate) => candidate.id === id);
    if (!file) {
      target.append(el("p", "problem", `No ${kind.noun} ${id} on the default branch.`), link(`#${kind.route}`, null, `All ${kind.plural}`));
      return;
    }
    const body = await snapshot.read(file.path);
    const blob = snapshot.blob(file.path);
    target.append(el("h2", null, kind.heading(body)), el("span", `badge ${file.status}`, LABEL[file.status]),
      el("p", "shown", `Text shown: blob ${blob.slice(0, 12)}`), explain(kind.explain.one));
    if (file.status === "changed") {
      const diff = el("section", "accepted-diff", el("h3", null, "Changed since it was last accepted"), explain(kind.explain.changed));
      try {
        const last = await lastAcceptedText(file.id, host);
        if (last) diff.append(showDifference(last.text, body));
      } catch (failure) {
        diff.append(el("p", "problem", failure.message));
      }
      target.append(diff);
    }
    target.append(renderArtifact(shortBody(body)));
    if (kind.prompt) target.append(link(`#${kind.route}/id=${encodeURIComponent(file.id)}/prompt=1`, "prompt-link", "Change by prompt"));
    if (kind.draft && file.status !== "accepted") {
      const notes = await jobNotes(snapshot, file.id);
      if (notes.length) {
        const list = el("ul");
        for (const note of notes) list.append(el("li", null, note));
        target.append(el("section", "job-notes", el("h3", null, "Notes of the job that wrote it"), list));
      }
    }
    if (file.status === "accepted") return;
    if (kind.restsOn) {
      const open = await acceptanceBlockers(file.path, snapshot);
      if (open.length) {
        const rests = el("section", "rests-on", el("h3", null, "Rests on what is not accepted"));
        const names = el("ul");
        for (const name of open) names.append(el("li", "open-name", name));
        rests.append(el("p", null, `${file.id} can be accepted once everything it names is accepted.`), names);
        target.append(rests);
        return;
      }
    }
    const record = recordOf(file.id, kind.kind, file.path, blob);
    const result = el("p", "result");
    const offerGitHub = () => offerRecord(target, record, snapshot);
    if (token) {
      const accept = button("btn accept", "Accept");
      accept.addEventListener("click", async () => {
        accept.disabled = true;
        try {
          const done = await acceptShown(host, [{ path: file.path, blob }], token.name);
          await redraw(where, { id }, el("p", "result", `Accepted in commit ${done.commit.slice(0, 7)}.`));
        } catch (failure) {
          accept.disabled = false;
          result.textContent = refusedText(failure, (path) => idOf(path, snapshot));
          target.append(result);
          if (failure.name === "PermissionMissing") offerGitHub();
        }
      });
      target.append(accept);
    } else offerGitHub();
  }

  return { name: kind.route, entry: kind.entry, title: kind.title, render };
}

