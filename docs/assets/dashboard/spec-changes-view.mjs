// SPEC changes — the change queues of the product's SPEC, each entry beside the section it replaces (SPEC §9, §10; UC-006,
// UC-018).
//
// Module: MOD-dashboard-app
//
// Routes #spec, #spec/<queue>, #spec/<queue>/<nn>. Every function gets `app`, the page's context (dashboard-app.mjs).

import {
  gitBlobSha, specRecord, approvalPath, parseQueueIndex, parseDecisions, sectionForEntry, specStatusByNames, needsMessage,
} from "../review-core.mjs";
import {
  h, badge, counts, tickCell, tickBox, batchBar, acceptPanel, editPanel, wireAccept, wireCommon, productSpecTokenNeeded,
} from "./review-views.mjs";
import { linkGraph, requirementImpact } from "../traceability.mjs";
import { ARCHITECTURE_FILE, isCodePath, isTestPath } from "../artifacts.mjs";

// The SPEC change queues: each with its index and its decisions — what the list needs to name every queue and entry.
const queueHeads = (app) => app.once("queues", async () => {
  const heads = await Promise.all(app.paths(/^docs\/spec-freigaben\/[^/]+\/index\.md$/).map(async (e) => {
    const dir = e.path.replace(/\/index\.md$/, "");
    const [idxText, decText] = await Promise.all([app.fileText(e.path), app.fileText(`${dir}/entscheidungen.md`)]);
    const idx = parseQueueIndex(idxText), decisions = parseDecisions(decText);
    // Every entry accepted: its entries are read when the queue is opened.
    const accepted = idx.entries.length > 0 && idx.entries.every((en) => decisions.get(en.nr)?.decision === "uebernommen");
    return { dir, name: dir.split("/").pop(), intro: idxText.split("\n| Nr")[0], idx, decisions, accepted };
  }));
  return heads.sort((a, b) => b.name.localeCompare(a.name));
});

// The entries of one queue: each proposal beside the SPEC section it replaces, with its status.
const queueEntries = (app, q) => app.once(`queue:${q.dir}`, async () => {
  const { dir, idx, decisions } = q;
  const loaded = await Promise.all(idx.entries.map(async (en) => {
    const nn = String(en.nr).padStart(2, "0");
    const files = app.paths(new RegExp(`^${esc(dir)}/${nn}-[^/]+\\.md$`));
    const prop = files.find((f) => !f.path.endsWith(".begruendung.md"));
    const why = files.find((f) => f.path.endsWith(".begruendung.md"));
    const targetPath = specTarget(idx.target || en.file);
    const [proposalText, specText] = await Promise.all([prop ? app.fileText(prop.path) : "", app.fileText(targetPath)]);
    return { ...en, nn, dir, proposalPath: prop?.path, rationalePath: why?.path, proposalText, targetPath, specText };
  }));
  // A QUEUE IS ACCEPTED IN ITS ORDER: an entry whose heading another entry of the queue creates is
  // shown beside the section that entry creates, and names it (`needs`). An accepted entry is shown beside the
  // text it wrote, found where it wrote it — its proposal may have rewritten its anchor.
  return Promise.all(loaded.map(async (en) => {
    const sec = sectionForEntry({ specText: en.specText, nr: en.nr, accepted: decisions.get(en.nr)?.decision === "uebernommen",
      entries: loaded.filter((x) => x.targetPath === en.targetPath) });
    const current = sec.error ? "" : sec.current;
    const proposalBlob = await gitBlobSha(en.proposalText);
    const sectionBlob = sec.error ? "" : await gitBlobSha(current);
    const status = await specStatusByNames({ index: app.recIndex(), read: app.readRecords, entry: { queue: dir, nr: en.nr, anchor: en.anchor,
      bis: en.bis, proposalPath: en.proposalPath, proposalText: en.proposalText, proposalBlob, sectionBlob, specText: en.specText, decisions } });
    const { specText, ...rest } = en;
    return { ...rest, current, error: sec.error, needs: sec.needs, proposalBlob, sectionBlob, status, decision: decisions.get(en.nr) };
  }));
});

// The queue index names its target relative to the process repository ("products/<name>/SPEC.md").
// In the product repository the same file is at the root.
const specTarget = (p) => p.replace(/^`|`$/g, "").replace(/^products\/[^/]+\//, "");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// impact: what the entry page derived ({ list } or { error }), or none where only the item's key is needed. An entry that changes
// or withdraws a requirement — or whose list could not be derived, so that this is not known — `touches`; `impactShown` when its
// list was shown, as the architecture views set it (A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; planAcceptance).
const specItem = (q, e, impact = null) => ({ kind: "spec", queue: e.dir, qname: q.name, nr: e.nr, nn: e.nn, proposalPath: e.proposalPath,
  proposalBlob: e.proposalBlob, sectionBlob: e.sectionBlob, targetPath: e.targetPath, anchor: e.anchor, bis: e.bis, needs: e.needs,
  ...(impact && (impact.error || impact.list.length) ? { touches: true } : {}),
  ...(impact && !impact.error && impact.list.length ? { impactShown: true } : {}) });
// A ticked entry whose impact list was not shown: Accept ticked leaves it out, and the list says so beside it.
const unshownImpact = (app, key) => {
  const it = app.session.isTicked(key) ? app.session.get(key) : null;
  return it?.touches && it.impactShown !== true
    ? ` <span class="warn small">— its impact list was not shown: open it before accepting</span>` : "";
};
const specAcceptable = (e) => Boolean(!e.error && e.proposalPath && ["open", "stale"].includes(e.status));

// Every queue with its index and decisions; the entries of a queue with an entry still undecided, and of each queue opened on this
// page. A queue whose entries are all accepted is named with their number and opened on request: only then are its proposals
// read, to show whether each still stands in the SPEC.
async function viewSpec(app, open = null) {
  const { T, GITLAB, session, openQueues, main } = app;
  const seq = app.seq();
  if (open) openQueues.add(open);
  const queues = await Promise.all((await queueHeads(app)).map(async (q) =>
    ({ ...q, entries: q.accepted && !openQueues.has(q.name) ? null : await queueEntries(app, q) })));
  if (seq !== app.seq()) return;
  const all = queues.flatMap((q) => q.entries || []);
  // UC-006 4c: without a token, a product's SPEC change is not accepted through GitHub's page — no product carries the workflow.
  const productSpec = !app.token() && !GITLAB && T.repo !== T.instance;
  const folded = queues.filter((q) => !q.entries), foldedEntries = folded.reduce((n, q) => n + q.idx.entries.length, 0);
  main().innerHTML = `
    <section class="head"><h2>SPEC changes</h2><p>${counts(all)}${folded.length ? ` · ${foldedEntries} accepted
      ${foldedEntries === 1 ? "entry" : "entries"} in ${folded.length} closed ${folded.length === 1 ? "queue" : "queues"}` : ""}</p>
    <p class="muted">Each entry proposes the text of one SPEC section. ${app.token()
      ? "Accepting it commits the approval and writes the proposal into the SPEC byte for byte, in one commit."
      : GITLAB ? `Accepting on GitLab needs this project's token — <a href="${h(app.tokenStepLink())}">store it</a>.`
      : productSpec ? ""
      : "Accept it here; the workflow writes it into <code>SPEC.md</code> byte for byte once your approval commit arrives."}</p>
    ${productSpec ? productSpecTokenNeeded(app, "Accepting") : ""}</section>
    ${batchBar(app)}
    ${queues.map((q) => !q.entries ? `
      <section class="queue closed" id="queue-${h(q.name)}">
        <h3>${h(q.name)}</h3>
        <p class="muted">All ${q.idx.entries.length} ${q.idx.entries.length === 1 ? "entry is" : "entries are"} accepted, by the decisions
          of this queue. Their proposals are read when you open the queue, which shows whether each still stands in the SPEC.
          <a class="btn small" href="#spec/${h(q.name)}">Open the queue</a></p>
      </section>` : `
      <section class="queue" id="queue-${h(q.name)}">
        <h3>${h(q.name)}</h3>
        <table class="list"><thead><tr>${app.token() ? "<th>Tick</th>" : ""}<th>Nr</th><th>Section</th><th>Status</th></tr></thead><tbody>
        ${q.entries.map((e) => `<tr>${tickCell(app, session.key(specItem(q, e)), specAcceptable(e))}
          <td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.nn)}</a></td>
          <td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.anchor.replace(/^#+\s*/, ""))}</a>${entryNote(e)}${unshownImpact(app, session.key(specItem(q, e)))}</td>
          <td>${badge(e.status)}</td></tr>`).join("")}
        </tbody></table>
      </section>`).join("")}`;
  wireAccept(app, main());
}

// An entry whose heading another entry of its queue creates names that entry, not "anchor found 0 times".
function entryNote(e) {
  if (e.needs.length && ["open", "stale"].includes(e.status)) {
    return ` <span class="muted small">— after entry ${e.needs.map((n) => h(String(n).padStart(2, "0"))).join(", ")}</span>`;
  }
  return e.error ? ` <span class="warn">${h(e.error)}</span>` : "";
}

// ---------------------------------------------------------------- the impact list of an entry (UC-006 3b)
//
// A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST: for every requirement of the SPEC that the entry changes or withdraws, the
// use cases, decisions, modules and tests that name it (MOD-traceability requirementImpact), derived from the files of the commit
// shown. Which requirements the entry touches is read from the SPEC, the proposal and the queue's index.md alone — the index names
// the section the entry replaces, so a requirement of that section the entry no longer states (renamed in place, or left out) is
// touched as withdrawn (linkGraph); an entry whose heading another entry of the queue creates comes with that entry, whose text
// holds its section. Only for an entry that touches one are the use cases, the architecture files and the tests read — each by
// its blob SHA, so a file read once is not read again. An entry decided already (in SPEC, superseded) proposes nothing
// (linkGraph), and a SPEC other than the product's SPEC.md has no graph.

const USE_CASE = /^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/;
const TOUCHES = new Set(["change", "withdraw"]);
const touchedBy = (graph, entry) => graph.edges.filter((x) => x.from === entry && x.kind === "proposes" && TOUCHES.has(x.change));

// entries: the entries of the entry's queue (queueEntries). -> [{ name, change, artifacts: [{ id, kind, path, via }] }]: the
// requirements the entry leaves out of its section first, then those it states, in the order it states them.
async function entryImpact(app, e, entries) {
  if (!e.proposalPath || e.targetPath !== "SPEC.md") return [];
  // The index is the text the queue view read (queueHeads), kept by `once`: no request of its own.
  const index = `${e.dir}/index.md`;
  const creators = entries.filter((x) => e.needs.includes(x.nr) && x.proposalPath);
  const [specText, indexText] = await Promise.all([app.fileText("SPEC.md"), app.fileText(index)]);
  const own = { "SPEC.md": specText, [index]: indexText,
    ...Object.fromEntries(creators.map((x) => [x.proposalPath, x.proposalText])), [e.proposalPath]: e.proposalText };
  const status = Object.fromEntries([...creators, e].map((x) => [x.proposalPath, x.status]));
  if (!touchedBy(linkGraph({ files: own, status }), e.proposalPath).length) return [];
  const paths = app.state.tree.map((x) => x.path)
    .filter((p) => USE_CASE.test(p) || ARCHITECTURE_FILE.test(p) || (isCodePath(p) && isTestPath(p)));
  const texts = await Promise.all(paths.map((p) => app.fileText(p)));
  const graph = linkGraph({ files: { ...Object.fromEntries(paths.map((p, i) => [p, texts[i]])), ...own }, status });
  return touchedBy(graph, e.proposalPath).map((x) => ({ name: x.to, change: x.change, artifacts: requirementImpact(graph, x.to) }));
}

const KIND = { "use-case": "Use case", "architecture-decision": "Decision", module: "Module", test: "Test" };
const VIA = { realises: "realises it", forced_by: "is forced by it", guards: "guards it" };

function specImpactHtml(impact) {
  const artifact = (a) => `<li data-impact="${h(a.id)}">${KIND[a.kind] ?? h(a.kind)}
    ${a.kind === "use-case" ? `<a href="#uc/${h(a.id)}">${h(a.id)}</a>` : a.kind === "test" ? "" : `<a href="#arc/${h(a.id)}">${h(a.id)}</a>`}
    — ${VIA[a.via] ?? h(a.via)} · <code>${h(a.path)}</code></li>`;
  const req = (r) => `<div class="impact-req" data-requirement="${h(r.name)}" data-change="${h(r.change)}">
    <p class="small"><strong>${h(r.name)}</strong> — ${r.change === "withdraw" ? "withdrawn" : "changed"} by this entry;
      ${r.artifacts.length ? `named by ${r.artifacts.length} ${r.artifacts.length === 1 ? "artifact" : "artifacts"}:`
        : "nothing in the repository names it."}</p>
    ${r.artifacts.length ? `<ul class="names">${r.artifacts.map(artifact).join("")}</ul>` : ""}</div>`;
  return `<section class="panel impact" id="spec-impact"><h3>Impact of this change</h3>
    ${impact.error ? `<p class="warn">The impact list could not be derived: ${h(impact.error)} — without it, this entry cannot be
      accepted. Reload to try again.</p>` : impact.list.map(req).join("")}
    <details class="explain"><summary>What is this?</summary><div>Before an existing requirement is changed or withdrawn, the
      dashboard lists what hangs on it (A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST): the use cases that realise it, the
      architecture decisions it forces, the modules that realise it and the tests whose <code>Guards:</code> line names it —
      derived from the repository at the commit shown. Accepting changes none of them: each still names the requirement as it
      was until it is changed in its own review.</div></details></section>`;
}

// One entry: its queue's entries (an entry may need another of its queue), and its rationale.
async function viewSpecEntry(app, qname, nn) {
  const { session, openQueues, main, md, renderMermaid, diffHtml } = app;
  const seq = app.seq();
  const q = (await queueHeads(app)).find((x) => x.name === qname);
  const entries = q ? await queueEntries(app, q) : [];
  const e = entries.find((x) => x.nn === nn);
  if (seq !== app.seq()) return;
  if (!e) { main().innerHTML = `<p class="warn">No entry ${h(qname)}/${h(nn)}.</p>`; return; }
  openQueues.add(q.name);
  const [rationale, impact] = await Promise.all([e.rationalePath ? app.fileText(e.rationalePath) : "",
    entryImpact(app, e, entries).then((list) => ({ list }), (err) => { app.noteRefusal(err); return { list: [], error: app.errorText(err) }; })]);
  if (seq !== app.seq()) return;
  const waits = e.needs.length > 0 && ["open", "stale"].includes(e.status) && Boolean(e.proposalPath);
  // The impact list is part of the proposal: an entry whose list could not be derived is not offered for acceptance.
  const canAccept = specAcceptable(e) && !waits && !impact.error;
  const rec = canAccept ? specRecord({ queue: e.dir, entry: e.nr, proposal: e.proposalPath, blob: e.proposalBlob,
    target: e.targetPath, anchor: e.anchor, section: e.sectionBlob }) : null;
  const item = specItem(q, e, impact);
  // A QUEUE IS ACCEPTED IN ITS ORDER: not offered alone while another entry must create its heading.
  const waitPanel = waits ? `<section class="panel accept"><h3>Accept entry ${h(e.nn)}</h3>
      <p class="notice">${h(needsMessage(item, e.needs))}</p>
      ${app.token() ? `${tickBox(app, session.show(item))}<p class="muted small">Tick this entry and entry ${e.needs.map((n) =>
        h(String(n).padStart(2, "0"))).join(", ")}, then use <em>Accept ticked</em>: both are written in one commit, in the
        queue's order.</p>` : `<p class="muted small">Accept entry ${e.needs.map((n) => h(String(n).padStart(2, "0"))).join(", ")} first;
        this entry can be accepted once its heading is in the SPEC.</p>`}</section>` : "";
  main().innerHTML = `
    <p class="crumbs"><a href="#spec">← all SPEC changes</a></p>
    <section class="head">
      <h2>${h(q.name)} · ${h(e.nn)} ${badge(e.status)}</h2>
      <p class="meta">Section <code>${h(e.anchor)}</code> in <code>${h(e.targetPath)}</code> ·
        proposal blob <code>${h(e.proposalBlob.slice(0, 12))}</code>
        ${e.decision ? ` · decision: ${h(e.decision.decision)} ${h(e.decision.when)}` : ""}</p>
      ${e.error && !waits ? `<p class="warn">${h(e.error)} — this entry cannot be accepted until the anchor is fixed.</p>` : ""}
      ${e.status === "stale" ? `<p class="warn">An approval exists for an earlier text of this proposal or of the SPEC section. It was not applied. Decide again on what you see now.</p>` : ""}
    </section>
    <div class="side">
      <section><h3>${waits ? `In the SPEC after entry ${e.needs.map((n) => h(String(n).padStart(2, "0"))).join(", ")}`
        : "In the SPEC now"}</h3><div class="md doc">${e.current ? md(e.current) : `<p class="muted">—</p>`}</div></section>
      <section><h3>Proposed</h3><div class="md doc">${md(e.proposalText)}</div></section>
    </div>
    <section class="panel"><h3>Difference</h3>${diffHtml(e.current, e.proposalText)}</section>
    ${impact.list.length || impact.error ? specImpactHtml(impact) : ""}
    ${rationale ? `<section class="panel md rationale"><h3>Rationale</h3>${md(rationale.replace(/^# .*\n/, ""))}</section>` : ""}
    <section class="panel"><button class="btn" data-toggle-edit>Edit proposal…</button></section>
    ${rec ? acceptPanel(app, rec, approvalPath(`spec-${q.name}-${e.nn}`, e.proposalBlob), `entry ${e.nn}`, item) : waitPanel}
    ${batchBar(app)}
    ${e.proposalPath ? editPanel(app, e.proposalPath, e.proposalText, e.proposalBlob) : ""}`;
  wireCommon(app, main(), e.proposalText, null);
  await renderMermaid(main());
}

export const routes = {
  spec: (app, a, b) => (a && b ? viewSpecEntry(app, decodeURIComponent(a), b) : viewSpec(app, a ? decodeURIComponent(a) : null)),
};
