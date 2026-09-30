// Review dashboard — UI over review-core.mjs. SPEC §10.
//
// Reads one pinned commit of the repository (two GitHub API calls, then immutable raw files) and
// renders use cases and SPEC change proposals. With a stored token, a person's click commits an edit
// or an acceptance (commitFiles in review-core.mjs); an accepted SPEC change is written in the same
// commit as its approval record. Without a token, GitHub's own pages are opened, prefilled. Every read
// goes through fetchText, which allows GET only, to GitHub only.

import { marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";
import { browserStore } from "./settings-store.mjs";
import {
  fetchText, gitBlobSha, deriveTarget, parseProductAddress, sharedOriginNotice, canStore, TOKEN_GUIDANCE,
  tokenLinkUrl, repositoryChoiceSteps, stepHtml, commitFiles, addProduct,
  tokenListUrl, extendTokenSteps, parseFrontMatter, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, newFileUrl, editUrl, blobUrl, parseQueueIndex,
  parseDecisions, deriveUseCaseStatus, deriveSpecStatus, acceptItems, createReviewSession, sectionForEntry,
  missingNeeds, itemLabel, needsMessage,
  browserSettingsHtml, tokenBannerHtml, tokenRefusal, defaultExpiry, TOKEN_DAYS, EXPIRY_WARN_DAYS, exportNotice,
  PASSPHRASE_NOTICE, exportSettings, readSettingsFile, mergeSettings, PRODUCT_SETTINGS_PATH, COLLABORATORS_PATH,
  pseudonymisationOn, pseudonymisationOffNotice, PSEUDONYMISATION_ON_NOTE, savePseudonymisation, parseCollaborators,
  addCollaborator, removeCollaborator, saveCollaborators,
} from "./review-core.mjs";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

// ---------------------------------------------------------------- instance, product, token

// The instance is the fork this page is served from; the product is chosen with ?repo= (SPEC §10).
const T = deriveTarget(location);
const store = browserStore();
const token = () => store.getToken();
const state = { commit: null, tree: [], useCases: [], records: [], queues: [], spec: "", overview: "", products: [] };
// What this page has shown the reviewer and what they ticked (SEVERAL FILES ARE ACCEPTED IN ONE CLICK).
// Kept in memory only: a reload starts without ticks.
const session = createReviewSession();
let flash = null; // the outcome of the last acceptance, shown once above the next view

// ---------------------------------------------------------------- loading

async function loadSnapshot() {
  const [owner, name] = T.repo.split("/");
  const commitJson = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/commits/${encodeURIComponent(T.ref)}`,
    { headers: { Accept: "application/vnd.github+json" } }, token()));
  state.commit = commitJson.sha;
  const tree = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/git/trees/${state.commit}?recursive=1`, {}, token()));
  state.tree = tree.tree.filter((e) => e.type === "blob");
}

// Without a token, files come from GitHub's raw host (public repositories). With a token, they come
// through the API, the only place the token may go (SPEC §7 THE TOKEN IS SENT ONLY TO GITHUB) —
// which is also what makes private repositories readable.
const encP = (path) => path.split("/").map(encodeURIComponent).join("/");
const raw = (path) => (token()
  ? fetchText(`${API}/repos/${T.repo}/contents/${encP(path)}?ref=${state.commit}`,
    { headers: { Accept: "application/vnd.github.raw+json" } }, token())
  : fetchText(`${RAW}/${T.repo}/${state.commit}/${encP(path)}`));

// A file on the commit an acceptance is written on (review-core.mjs acceptItems); null if it is absent.
async function readAt(head, path) {
  try {
    return await fetchText(`${API}/repos/${T.repo}/contents/${encP(path)}?ref=${encodeURIComponent(head)}`,
      { headers: { Accept: "application/vnd.github.raw+json" } }, token());
  } catch (e) {
    if (/^404\b/.test(e.message)) return null;
    throw e;
  }
}

// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER: the list is this browser's, by address; the instance
// repository names no product. Another browser starts with an empty list.
function loadProducts() {
  state.products = store.getProducts().map(parseProductAddress).filter((p) => !p.error);
}
const paths = (re) => state.tree.filter((e) => re.test(e.path));

async function loadAll() {
  await loadSnapshot();
  const ucFiles = paths(/^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/);
  const recFiles = paths(/^docs\/approvals\/[^/]+\.md$/).filter((e) => !e.path.endsWith("README.md"));
  const queueIdx = paths(/^docs\/spec-freigaben\/[^/]+\/index\.md$/);
  const overview = paths(/^docs\/use-cases\/README\.md$/)[0];

  const [ucTexts, recTexts, spec, ov] = await Promise.all([
    Promise.all(ucFiles.map((e) => raw(e.path))),
    Promise.all(recFiles.map((e) => raw(e.path))),
    paths(/^SPEC\.md$/).length ? raw("SPEC.md") : Promise.resolve(""),
    overview ? raw(overview.path) : Promise.resolve(""),
  ]);
  state.spec = spec;
  state.overview = ov;
  state.records = recTexts.map((t, i) => ({ ...parseRecord(t), _path: recFiles[i].path }));

  state.useCases = await Promise.all(ucFiles.map(async (e, i) => {
    const text = ucTexts[i];
    const blob = await gitBlobSha(text);
    const { fields, body } = parseFrontMatter(text);
    return { path: e.path, text, blob, treeBlob: e.sha, fields, body,
      status: deriveUseCaseStatus(e.path, blob, state.records) };
  }));

  state.queues = await Promise.all(queueIdx.map(async (e) => {
    const dir = e.path.replace(/\/index\.md$/, "");
    const [idxText, decText] = await Promise.all([raw(e.path),
      paths(new RegExp(`^${esc(dir)}/entscheidungen\\.md$`)).length ? raw(`${dir}/entscheidungen.md`) : ""]);
    const idx = parseQueueIndex(idxText);
    const decisions = parseDecisions(decText);
    const loaded = await Promise.all(idx.entries.map(async (en) => {
      const nn = String(en.nr).padStart(2, "0");
      const files = paths(new RegExp(`^${esc(dir)}/${nn}-[^/]+\\.md$`));
      const prop = files.find((f) => !f.path.endsWith(".begruendung.md"));
      const why = files.find((f) => f.path.endsWith(".begruendung.md"));
      const [proposalText, rationale] = await Promise.all([prop ? raw(prop.path) : "", why ? raw(why.path) : ""]);
      const targetPath = specTarget(idx.target || en.file);
      const specText = targetPath === "SPEC.md" ? state.spec : (paths(new RegExp(`^${esc(targetPath)}$`)).length ? await raw(targetPath) : "");
      return { ...en, nn, dir, proposalPath: prop?.path, proposalText, rationale, targetPath, specText };
    }));
    // A QUEUE IS ACCEPTED IN ITS ORDER: an entry whose heading another entry of the queue creates is
    // shown beside the section that entry creates, and names it (`needs`).
    const entries = await Promise.all(loaded.map(async (en) => {
      const sec = sectionForEntry({ specText: en.specText, nr: en.nr,
        entries: loaded.filter((x) => x.targetPath === en.targetPath) });
      const current = sec.error ? "" : sec.current;
      const proposalBlob = await gitBlobSha(en.proposalText);
      const sectionBlob = sec.error ? "" : await gitBlobSha(current);
      const status = deriveSpecStatus({ queue: dir, nr: en.nr, anchor: en.anchor, bis: en.bis, proposalPath: en.proposalPath,
        proposalText: en.proposalText, proposalBlob, sectionBlob, specText: en.specText, decisions, records: state.records });
      const { specText, ...rest } = en;
      return { ...rest, current, error: sec.error, needs: sec.needs, proposalBlob, sectionBlob, status, decision: decisions.get(en.nr) };
    }));
    return { dir, name: dir.split("/").pop(), intro: idxText.split("\n| Nr")[0], entries };
  }));
  state.queues.sort((a, b) => b.name.localeCompare(a.name));
}

// The queue index names its target relative to the process repository ("products/<name>/SPEC.md").
// In the product repository the same file is at the root.
const specTarget = (p) => p.replace(/^`|`$/g, "").replace(/^products\/[^/]+\//, "");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------- rendering helpers

const main = () => document.getElementById("main");
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function md(text) {
  return DOMPurify.sanitize(marked.parse(text, { gfm: true }));
}

let mermaidReady = false;
async function renderMermaid(root) {
  const blocks = [...root.querySelectorAll("pre > code.language-mermaid")];
  if (!blocks.length || !globalThis.mermaid) return;
  if (!mermaidReady) {
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    globalThis.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: dark ? "dark" : "default" });
    mermaidReady = true;
  }
  const nodes = blocks.map((code) => {
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent;
    code.parentElement.replaceWith(div);
    return div;
  });
  try {
    await globalThis.mermaid.run({ nodes });
  } catch (e) {
    for (const n of nodes) if (!n.querySelector("svg")) n.insertAdjacentHTML("beforeend", `<p class="warn">Diagram error: ${h(e.message)}</p>`);
  }
}

const LABEL = {
  open: ["open", "Not accepted yet"],
  accepted: ["accepted", "An approval record names exactly this text"],
  changed: ["changed", "Accepted earlier, edited since — the current text is not accepted"],
  approved: ["approved", "Approval committed — the workflow writes it into the SPEC"],
  stale: ["stale", "Approved on a text that has changed since — decide again"],
  applied: ["in SPEC", "Accepted and present in the SPEC word for word"],
  superseded: ["superseded", "Accepted once, since replaced by a later change"],
};
const badge = (s) => `<span class="badge b-${s}" title="${h(LABEL[s]?.[1])}">${h(LABEL[s]?.[0] ?? s)}</span>`;

function lineDiff(a, b) {
  const x = a.replace(/\n$/, "").split("\n"), y = b.replace(/\n$/, "").split("\n");
  const n = x.length, m = y.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) { out.push([" ", x[i]]); i++; j++; }
    else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { out.push(["+", y[j]]); j++; }
    else { out.push(["-", x[i]]); i++; }
  }
  return out;
}

function diffHtml(a, b) {
  const d = lineDiff(a, b);
  if (!d.some(([k]) => k !== " ")) return `<p class="muted">No difference.</p>`;
  return `<pre class="diff">${d.map(([k, l]) => `<span class="d${k === "+" ? "add" : k === "-" ? "del" : "ctx"}">${h(k)} ${h(l)}</span>`).join("\n")}</pre>`;
}

// ---------------------------------------------------------------- actions

// `item` is what this page showed the reviewer (see session); with a token, Accept commits exactly that.
function acceptPanel(record, path, what, item) {
  const text = recordText(record);
  if (token()) {
    const key = session.show(item);
    return `
  <section class="panel accept">
    <h3>Accept ${h(what)}</h3>
    <p>One click commits an approval record under your GitHub account. It names exactly the text shown
    here by its blob SHA <code>${h(record.blob.slice(0, 12))}</code>.</p>
    <p><button class="btn primary" data-accept-key="${h(key)}">Accept</button></p>
    ${tickBox(key)}
    <p class="result muted"></p>
    <details class="explain"><summary>What happens when I click?</summary><div>
      A three-line file is committed to <code>${h(path)}</code> in <code>${h(T.repo)}</code> with the token stored in
      this browser. Git records you as the author and the time; the file records which text you accepted.
      ${record.kind === "spec" ? `The same commit replaces the section in <code>${h(record.target)}</code> with the proposal,
      byte for byte, and adds the decision to the queue's <code>entscheidungen.md</code>. If the proposal or the SPEC
      section changed since this page loaded, nothing is written and the page shows the new state.`
        : "Nothing else is changed. If the text changed since this page loaded, nothing is written."}
      Edit the text later, and it shows as changed again.</div></details>
  </section>`;
  }
  const url = newFileUrl(T.repo, T.ref, path, text);
  return `
  <section class="panel accept">
    <h3>Accept ${h(what)}</h3>
    <p>Your commit of this record <strong>is</strong> the acceptance. Git records who and when; the
    record names exactly the text shown here by its blob SHA <code>${h(record.blob.slice(0, 12))}</code>.</p>
    <ol>
      <li><a class="btn primary" href="${h(url)}" target="_blank" rel="noopener">Open in GitHub to commit ↗</a></li>
      <li>On GitHub, press <em>Commit changes…</em>. Without write access GitHub makes it a pull request,
      and the acceptance counts once a maintainer merges it.</li>
      <li>Reload this page after the commit.</li>
    </ol>
    <details><summary>Record and file path — if the prefill does not arrive</summary>
      <p>File: <code>${h(path)}</code> <button class="btn small" data-copy="${h(path)}">Copy path</button></p>
      <pre class="record">${h(text)}</pre>
      <button class="btn small" data-copy="${h(text)}">Copy record</button>
    </details>
  </section>`;
}

function editPanel(path, text, blob) {
  return `
  <section class="panel edit" hidden>
    <h3>Edit</h3>
    <p class="muted">${token()
      ? `Change the text with a live preview; <strong>Save</strong> commits it to <code>${h(path)}</code> under your account.`
      : `Change the text with a live preview. Without a stored token, <strong>Copy &amp; open GitHub editor</strong> copies your
        text and opens GitHub's editor for <code>${h(path)}</code>: select all, paste, commit. A token in <a href="#settings">Settings</a>
        makes this one click.`} After saving, the file has a new SHA and is reviewed again.</p>
    <div class="editor">
      <textarea spellcheck="false" aria-label="Edited text">${h(text)}</textarea>
      <div class="preview md"></div>
    </div>
    <p>
      ${token() ? `<button class="btn primary" data-edit-save="${h(path)}">Save</button>`
        : `<button class="btn primary" data-edit-commit="${h(path)}">Copy &amp; open GitHub editor ↗</button>`}
      <button class="btn" data-edit-diff>Show difference</button>
      <button class="btn" data-edit-reset>Reset</button>
    </p>
    <p class="result muted"></p>
    <div class="edit-diff"></div>
  </section>`.replace('data-edit-save="', `data-edit-blob="${h(blob || "")}" data-edit-save="`);
}

async function reloadAndRoute() {
  await loadAll();
  await route();
}

// ---------------------------------------------------------------- ticks and acceptance (UC-006 4d, UC-008 3d)

function tickBox(key) {
  return `<p><label><input type="checkbox" data-tick="${h(key)}" ${session.isTicked(key) ? "checked" : ""}>
    Tick for <em>Accept ticked</em></label></p>`;
}

// SEVERAL FILES ARE ACCEPTED IN ONE CLICK: the ticked files, and the one button that accepts them.
function batchBar() {
  if (!token()) return "";
  const items = session.items(), gaps = missingNeeds(items);
  return `<section class="panel batch">
    <h3>Accept ticked</h3>
    <p>${items.length ? `Ticked: ${items.map((i) => h(itemLabel(i))).join(", ")}.`
      : "Nothing ticked. Open a use case or SPEC entry and tick it to accept several in one commit."}</p>
    ${gaps.map((g) => `<p class="warn">${h(g.message)}</p>`).join("")}
    <p><button class="btn primary" data-accept-ticked ${items.length && !gaps.length ? "" : "disabled"}>Accept ticked (${items.length})</button></p>
    <p class="result muted"></p>
    <details class="explain"><summary>What happens when I click?</summary><div>
      One commit under your account holds one approval record per ticked file, each naming the text this page
      showed you. Ticked SPEC entries are written into the SPEC in the order of their queue's index, with their
      decisions. A file that changed after it was shown is left out and named; the others are still accepted.</div></details>
  </section>`;
}

async function runAccept(ev, items, b, out) {
  b.disabled = true;
  out.textContent = "Checking the current texts and committing…";
  try {
    const r = await acceptItems({ repo: T.repo, branch: T.ref, token: token(), click: ev, items, readAt });
    session.untick([...r.accepted, ...r.leftOut.map((l) => l.label)]);
    flash = (r.commit
      ? `Accepted ${h(r.accepted.join(", "))} — <a href="${h(r.commit.url)}" target="_blank" rel="noopener">commit ${h(r.commit.sha.slice(0, 7))}</a>.`
      : "Nothing was written.")
      + r.leftOut.map((l) => `<br>Left out <strong>${h(l.label)}</strong>: ${h(l.reason)}`).join("")
      + (r.leftOut.length ? "<br>Shown below is the current state; decide again on what you see now." : "");
    out.textContent = "Reloading…";
    await reloadAndRoute();
  } catch (e) {
    noteRefusal(e);
    out.textContent = /403|404/.test(e.message)
      ? `Your token cannot write to ${T.repo} (${e.message}). Extend it in Settings, or remove it to use GitHub's page instead.`
      : errorText(e);
    b.disabled = false;
  }
}

function wireAccept(root) {
  root.querySelectorAll("[data-accept-key]").forEach((b) => b.addEventListener("click", (ev) => {
    runAccept(ev, [session.get(b.dataset.acceptKey)], b, b.closest(".panel").querySelector(".result"));
  }));
  root.querySelectorAll("[data-tick]").forEach((c) => c.addEventListener("change", () => {
    session.tick(c.dataset.tick, c.checked);
    const bar = root.querySelector(".panel.batch");
    if (bar) { bar.outerHTML = batchBar(); wireBatch(root); }
  }));
  wireBatch(root);
}

function wireBatch(root) {
  root.querySelector("[data-accept-ticked]")?.addEventListener("click", (ev) => {
    const b = ev.currentTarget;
    runAccept(ev, session.items(), b, b.closest(".panel").querySelector(".result"));
  });
}

function wireCommon(root, original) {
  wireAccept(root);
  root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    await navigator.clipboard.writeText(b.dataset.copy);
    b.textContent = "Copied ✓";
  }));
  const ed = root.querySelector(".panel.edit");
  root.querySelector("[data-toggle-edit]")?.addEventListener("click", () => {
    ed.hidden = !ed.hidden;
    if (!ed.hidden) update();
  });
  if (!ed) return;
  const ta = ed.querySelector("textarea"), pv = ed.querySelector(".preview");
  let timer = null;
  async function update() {
    const { body } = parseFrontMatter(ta.value);
    pv.innerHTML = md(body);
    await renderMermaid(pv);
  }
  ta.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(update, 300); });
  ed.querySelector("[data-edit-reset]").addEventListener("click", () => { ta.value = original; update(); ed.querySelector(".edit-diff").innerHTML = ""; });
  ed.querySelector("[data-edit-diff]").addEventListener("click", () => { ed.querySelector(".edit-diff").innerHTML = diffHtml(original, ta.value); });
  ed.querySelector("[data-edit-save]")?.addEventListener("click", async (ev) => {
    const b = ev.currentTarget, out = ed.querySelector(".result");
    const text = ta.value.endsWith("\n") ? ta.value : ta.value + "\n";
    b.disabled = true;
    out.textContent = "Saving…";
    try {
      const c = await commitFiles({ repo: T.repo, branch: T.ref, token: token(), click: ev,
        message: `edit ${b.dataset.editSave.split("/").pop()} (Agent M dashboard)`,
        files: [{ path: b.dataset.editSave, content: text, expectBlob: b.dataset.editBlob || null }] });
      out.innerHTML = `Saved — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>. Reloading…`;
      await reloadAndRoute();
    } catch (e) { noteRefusal(e); out.textContent = errorText(e); b.disabled = false; }
  });
  ed.querySelector("[data-edit-commit]")?.addEventListener("click", async (ev) => {
    const text = ta.value.endsWith("\n") ? ta.value : ta.value + "\n";
    await navigator.clipboard.writeText(text);
    window.open(editUrl(T.repo, T.ref, ev.currentTarget.dataset.editCommit), "_blank", "noopener");
    ev.currentTarget.textContent = "Copied — paste in GitHub's editor, then commit ✓";
  });
}

// ---------------------------------------------------------------- views

function counts(list) {
  const c = {};
  for (const x of list) c[x.status] = (c[x.status] || 0) + 1;
  return Object.entries(c).map(([k, v]) => `${badge(k)} ${v}`).join(" ");
}

// A tick in a list: only for a file this page has shown (UC-008 3d — each one read gets a tick).
function tickCell(key, acceptable) {
  if (!token()) return "";
  if (!acceptable) return "<td></td>";
  return session.wasShown(key)
    ? `<td><input type="checkbox" data-tick="${h(key)}" ${session.isTicked(key) ? "checked" : ""} aria-label="Tick for Accept ticked"></td>`
    : `<td class="muted small" title="Open it first — only what you have read can be ticked">—</td>`;
}
const ucItem = (u) => ({ kind: "use-case", id: u.fields.id, path: u.path, blob: u.blob });
const specItem = (q, e) => ({ kind: "spec", queue: e.dir, qname: q.name, nr: e.nr, nn: e.nn, proposalPath: e.proposalPath,
  proposalBlob: e.proposalBlob, sectionBlob: e.sectionBlob, targetPath: e.targetPath, anchor: e.anchor, bis: e.bis, needs: e.needs });
const specAcceptable = (e) => Boolean(!e.error && e.proposalPath && ["open", "stale"].includes(e.status));

async function viewUseCases() {
  const rows = state.useCases.map((u) => `
    <tr>
      ${tickCell(session.key(ucItem(u)), u.status !== "accepted")}
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.id)}</a></td>
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.title)}</a></td>
      <td>${h(u.fields.stage)}</td>
      <td>${Array.isArray(u.fields.realises) ? u.fields.realises.length : 0}</td>
      <td>${badge(u.status)}</td>
    </tr>`).join("");
  main().innerHTML = `
    ${token() ? "" : `<section class="panel setup-banner"><h3>Finish setting up your instance</h3>
      <p>This browser has no key for <strong>${h(T.instance)}</strong> yet. Without one you can read and review;
      accepting and editing then go through GitHub's own pages, and products cannot be added.</p>
      <p><a class="btn primary" href="#setup">Set up now</a> <a class="btn" href="#settings">Import settings</a>
        <span class="muted small">— from a file exported in another browser (Settings → Export settings).</span></p></section>`}
    <section class="head"><h2>Use cases</h2><p>${counts(state.useCases)}</p></section>
    ${batchBar()}
    <table class="list"><thead><tr>${token() ? "<th>Tick</th>" : ""}<th>ID</th><th>Title</th><th>Stage</th><th>Realises</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    ${state.overview ? `<section class="md overview">${md(state.overview)}</section>` : ""}`;
  wireAccept(main());
  await renderMermaid(main());
}

async function viewUseCase(id) {
  const u = state.useCases.find((x) => x.fields.id === id);
  if (!u) { main().innerHTML = `<p class="warn">No use case ${h(id)} on ${h(T.ref)}.</p>`; return; }
  const approved = state.records.filter((r) => r.kind === "use-case" && r.file === u.path);
  const idx = state.useCases.indexOf(u);
  const prev = state.useCases[idx - 1], next = state.useCases[idx + 1];
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← all use cases</a>
      ${prev ? `· <a href="#uc/${h(prev.fields.id)}">← ${h(prev.fields.id)}</a>` : ""}
      ${next ? `· <a href="#uc/${h(next.fields.id)}">${h(next.fields.id)} →</a>` : ""}</p>
    <section class="head">
      <h2>${h(u.fields.id)} ${h(u.fields.title)} ${badge(u.status)}</h2>
      <p class="meta">Stage <strong>${h(u.fields.stage)}</strong> ·
        Actors: ${(u.fields.actors || []).map(h).join(", ")} ·
        blob <code>${h(u.blob.slice(0, 12))}</code> ·
        <a href="${h(blobUrl(T.repo, T.ref, u.path))}" target="_blank" rel="noopener">file on GitHub ↗</a></p>
      ${u.treeBlob !== u.blob ? `<p class="warn">The SHA computed from the shown text differs from GitHub's tree. Do not accept; reload.</p>` : ""}
    </section>
    <div class="cols">
      <article class="md doc">${md(u.body)}</article>
      <aside>
        <section class="panel"><h3>Realises</h3>
          <ul class="names">${(u.fields.realises || []).map((n) => `<li>${h(n)}</li>`).join("")}</ul>
          <p class="muted small">Requirement names from <a href="${h(blobUrl(T.repo, T.ref, "SPEC.md"))}" target="_blank" rel="noopener">SPEC.md ↗</a>.</p>
        </section>
        ${approved.length ? `<section class="panel"><h3>Approval records</h3><ul class="names">${approved.map((r) =>
          `<li><a href="${h(blobUrl(T.repo, T.ref, r._path))}" target="_blank" rel="noopener">${h(r._path.split("/").pop())}</a>
           ${r.blob === u.blob ? "— current text" : "— an earlier text"}</li>`).join("")}</ul></section>` : ""}
        <section class="panel"><button class="btn" data-toggle-edit>Edit…</button></section>
        ${u.status === "accepted" ? "" : acceptPanel(useCaseRecord(u.path, u.blob), approvalPath(u.fields.id, u.blob), u.fields.id, ucItem(u))}
        ${batchBar()}
      </aside>
    </div>
    ${editPanel(u.path, u.text, u.blob)}`;
  wireCommon(main(), u.text);
  await renderMermaid(main());
}

async function viewSpec() {
  const all = state.queues.flatMap((q) => q.entries);
  main().innerHTML = `
    <section class="head"><h2>SPEC changes</h2><p>${counts(all)}</p>
    <p class="muted">Each entry proposes the text of one SPEC section. ${token()
      ? "Accepting it commits the approval and writes the proposal into the SPEC byte for byte, in one commit."
      : "Accept it here; the workflow writes it into <code>SPEC.md</code> byte for byte once your approval commit arrives."}</p></section>
    ${batchBar()}
    ${state.queues.map((q) => `
      <section class="queue">
        <h3>${h(q.name)}</h3>
        <table class="list"><thead><tr>${token() ? "<th>Tick</th>" : ""}<th>Nr</th><th>Section</th><th>Status</th></tr></thead><tbody>
        ${q.entries.map((e) => `<tr>${tickCell(session.key(specItem(q, e)), specAcceptable(e))}
          <td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.nn)}</a></td>
          <td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.anchor.replace(/^#+\s*/, ""))}</a>${entryNote(e)}</td>
          <td>${badge(e.status)}</td></tr>`).join("")}
        </tbody></table>
      </section>`).join("")}`;
  wireAccept(main());
}

// An entry whose heading another entry of its queue creates names that entry, not "anchor found 0 times".
function entryNote(e) {
  if (e.needs.length && ["open", "stale"].includes(e.status)) {
    return ` <span class="muted small">— after entry ${e.needs.map((n) => h(String(n).padStart(2, "0"))).join(", ")}</span>`;
  }
  return e.error ? ` <span class="warn">${h(e.error)}</span>` : "";
}

async function viewSpecEntry(qname, nn) {
  const q = state.queues.find((x) => x.name === qname);
  const e = q?.entries.find((x) => x.nn === nn);
  if (!e) { main().innerHTML = `<p class="warn">No entry ${h(qname)}/${h(nn)}.</p>`; return; }
  const waits = e.needs.length > 0 && ["open", "stale"].includes(e.status) && Boolean(e.proposalPath);
  const canAccept = specAcceptable(e) && !waits;
  const rec = canAccept ? specRecord({ queue: e.dir, entry: e.nr, proposal: e.proposalPath, blob: e.proposalBlob,
    target: e.targetPath, anchor: e.anchor, section: e.sectionBlob }) : null;
  const item = specItem(q, e);
  // A QUEUE IS ACCEPTED IN ITS ORDER: not offered alone while another entry must create its heading.
  const waitPanel = waits ? `<section class="panel accept"><h3>Accept entry ${h(e.nn)}</h3>
      <p class="notice">${h(needsMessage(item, e.needs))}</p>
      ${token() ? `${tickBox(session.show(item))}<p class="muted small">Tick this entry and entry ${e.needs.map((n) =>
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
    ${e.rationale ? `<section class="panel md rationale"><h3>Rationale</h3>${md(e.rationale.replace(/^# .*\n/, ""))}</section>` : ""}
    <section class="panel"><button class="btn" data-toggle-edit>Edit proposal…</button></section>
    ${rec ? acceptPanel(rec, approvalPath(`spec-${q.name}-${e.nn}`, e.proposalBlob), `entry ${e.nn}`, item) : waitPanel}
    ${batchBar()}
    ${e.proposalPath ? editPanel(e.proposalPath, e.proposalText, e.proposalBlob) : ""}`;
  wireCommon(main(), e.proposalText);
  await renderMermaid(main());
}

function viewHow() {
  main().innerHTML = `<article class="md doc how">${md(`
## How acceptance works

**Acceptance is a commit.** With a token stored in this browser, *Accept* commits a short approval
record under your account. Without one, the page opens GitHub's *new file* page with the record
already filled in, and pressing *Commit changes* there is the act of accepting. Git records who and
when; the record says which text.

**Several at once.** With a token, tick the use cases and SPEC entries you have read and press
*Accept ticked*: one commit, one record per ticked file. A file that changed after it was shown is
left out and named.

**The record names the text by its SHA.** The page computes the git blob SHA of exactly the text it
shows you, the same number \`git hash-object\` would give. A use case counts as accepted only while
its current text has that SHA. Edit it later, and it shows as *changed* again, with no status to
reset.

**Editing** happens here with a live preview. *Copy & open GitHub editor* puts your text on the
clipboard and opens GitHub's editor for the file: select all, paste, commit. The new text is then
reviewed like any other.

**SPEC changes.** With a token, the accepting commit itself carries the record, the SPEC section
replaced by the proposal byte for byte, and the decision in the queue's \`entscheidungen.md\` — after
checking, on the commit it writes on, that the proposal and the SPEC section still have the SHAs you
saw. Entries of one queue accepted together are written in the queue's order; an entry whose heading
another entry creates waits for that entry. Without a token, for this instance's own SPEC, a GitHub
Actions workflow makes the same checks after your approval commit and writes the same bytes. If
either text changed in the meantime, nothing is written and the entry shows as *stale*.

**Without write access**, GitHub turns your commit into a pull request. The acceptance counts once
a maintainer merges it.

Reading: repository \`${T.repo}\`, branch \`${T.ref}\`, commit \`${(state.commit || "").slice(0, 12)}\`,
${token() ? "with the token stored in this browser" : "without a token"}. Instance: \`${T.instance}\`.
Products are chosen in the selector at the top. Their list is kept in this browser only, by their
addresses; the instance repository names no product.
`)}</article>`;
}

// ---------------------------------------------------------------- settings (SPEC §7, UC-042)
//
// EVERY SETTING IS REACHED FROM ONE PAGE: this browser's settings (browserSettingsHtml, one row per stored
// key), the selected product's settings in its repository (docs/settings.md, docs/collaborators.md), and
// export and import of everything this browser keeps. Browser settings change in localStorage through the
// store; product settings change only by a commit on a click (commitFiles).

const shownSecrets = new Set(); // keys revealed by Show on this page; any other view hides them again
const tokenState = { ok: null, refused: false }; // this page's last answer from GitHub about the token

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: a 401 anywhere marks the token refused, and the
// line at the top of every view says which token and where it is renewed.
function noteRefusal(e) {
  if (tokenRefusal(e)) {
    tokenState.refused = true;
    tokenState.ok = null;
    showBanner();
    if (document.getElementById("browser-settings")) renderBrowserSettings();
  }
  return e;
}
const errorText = (e) => tokenRefusal(e) ? `${tokenRefusal(e).text} Renew it with the link at the top of the page.` : e.message;
function showBanner() {
  const el = document.getElementById("token-banner");
  if (el) el.innerHTML = token() ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: tokenState.refused }) : "";
}
const today = () => new Date().toISOString().slice(0, 10);

function viewSettings() {
  const owner = T.instance.split("/")[0];
  const stored = token();
  main().innerHTML = `
    <section class="head"><h2>Settings</h2>
      <p class="muted">Every setting Agent M uses: what this browser keeps, what the product <strong>${h(T.repo)}</strong>
      keeps in its repository, and a file to move this browser's settings to another one.</p></section>
    <section class="panel notice">
      <h3>Before you store anything</h3>
      <p>${h(sharedOriginNotice(owner))}</p>
      <label><input type="checkbox" id="ack"> I have read this.</label>
    </section>
    <section class="panel">
      <h3>This browser</h3>
      <div id="browser-settings"></div>
      <div id="token-change" ${stored ? "hidden" : ""}>
        <h4>${stored ? "Change the GitHub token" : "Store a GitHub token"}</h4>
        <p><a class="btn" href="${h(tokenLinkUrl(T.instance))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
        <ol class="choices">${repositoryChoiceSteps(T.instance, null).map((x) => `<li>${h(x)}</li>`).join("")}</ol>
        <details class="explain"><summary>What is this?</summary><pre class="guidance">${h(TOKEN_GUIDANCE)}</pre></details>
        <p><input type="password" id="token-input" autocomplete="off" spellcheck="false" disabled
          placeholder="github_pat_…" aria-label="GitHub token"></p>
        <p><label>Expires on <input type="date" id="token-expires" value="${h(defaultExpiry())}" disabled></label>
          <span class="muted small">Preset to the ${TOKEN_DAYS} days of the prefilled link — correct it if you chose another date on GitHub.
          The dashboard warns ${EXPIRY_WARN_DAYS} days before.</span></p>
        <p><button class="btn primary" id="token-save" disabled>Store token</button></p>
      </div>
      <p id="token-msg" class="muted"></p>
      <details class="explain"><summary>What is this?</summary><div>These settings belong to you on this computer. They are kept
        in this browser's <code>localStorage</code> only — never in a cookie, an address or a repository — and every other
        GitHub Pages site of ${h(owner)} can read them. <em>Clear</em> removes an entry from the browser's storage itself.</div></details>
    </section>
    <section class="panel" id="product-settings"><h3>Product · ${h(T.repo)}</h3><p class="muted">Reading its settings…</p></section>
    <section class="panel">
      <h3>Export and import</h3>
      <p class="notice">${h(exportNotice(store.entries()))}</p>
      <p><label>Passphrase (optional) <input type="password" id="export-pass" autocomplete="new-password"></label>
        <label>Repeat it <input type="password" id="export-pass2" autocomplete="new-password"></label></p>
      <p class="muted small">${h(PASSPHRASE_NOTICE)}</p>
      <p><button class="btn primary" id="export-go">Export settings</button></p>
      <p><label>Settings file <input type="file" id="import-file" accept=".json,application/json"></label>
        <label>Passphrase, if the file is locked <input type="password" id="import-pass" autocomplete="off"></label></p>
      <p><button class="btn" id="import-go" disabled>Import settings</button>
        <span class="muted small">Tick “I have read this” at the top first — an import stores tokens in this browser.</span></p>
      <p id="io-msg" class="muted"></p>
      <details class="explain"><summary>What is this?</summary><div><em>Export</em> saves one file, on this computer only, with
        everything listed under “This browser” — the token itself included — so that another browser is set up by one
        <em>Import</em>. Agent M writes the file to no repository and puts it in no address. Locked with a passphrase, it is
        encrypted in this browser (PBKDF2 and AES-GCM of the Web Crypto API). An import keeps what this browser already has and
        adds only what is missing, and lists both.</div></details>
    </section>
    <section class="panel">
      <h3>Clear everything in this browser</h3>
      <p><button class="btn" id="token-clear">Clear everything Agent M stored</button></p>
      <details class="explain"><summary>What is this?</summary><div>Removes the token, its date and the product list from this
        browser's storage. Nothing in any repository changes.</div></details>
    </section>`;
  renderBrowserSettings();
  wireSettings();
  loadProductSettings();
}

function renderBrowserSettings() {
  const box = document.getElementById("browser-settings");
  box.innerHTML = browserSettingsHtml({ entries: store.entries(), shown: [...shownSecrets], tokenState });
  const say = (key, text) => { box.querySelector(`[data-result="${key}"]`).textContent = text; };
  box.querySelectorAll("[data-show]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.show;
    if (shownSecrets.has(k)) shownSecrets.delete(k); else shownSecrets.add(k);
    renderBrowserSettings();
  }));
  box.querySelectorAll("[data-change]").forEach((b) => b.addEventListener("click", () => {
    document.getElementById("token-change").hidden = false;
    document.getElementById("ack").focus();
  }));
  box.querySelector(`[data-test="agent-m.github-token"]`)?.addEventListener("click", async () => {
    say("agent-m.github-token", `Reading ${T.instance}…`);
    try {
      await fetchText(`${API}/repos/${T.instance}`, {}, token());
      Object.assign(tokenState, { ok: today(), refused: false });
      showBanner();
      renderBrowserSettings();
      say("agent-m.github-token", `GitHub accepted the token: it can read ${T.instance}.`);
    } catch (e) {
      noteRefusal(e);
      renderBrowserSettings();
      say("agent-m.github-token", `The token cannot read ${T.instance}: ${errorText(e)}`);
    }
  });
  box.querySelector(`[data-test="agent-m.products"]`)?.addEventListener("click", async () => {
    say("agent-m.products", "Checking each product…");
    const res = await Promise.all(state.products.map(async (p) => [p.repo, await checkReach(p.repo)]));
    box.querySelector(`[data-result="agent-m.products"]`).innerHTML = res.map(reachLine).join("<br>");
  });
  box.querySelector(`[data-clear="agent-m.github-token"]`)?.addEventListener("click", () => {
    if (!confirm("Clear the GitHub token from this browser? Without it, accepting and editing go through GitHub's own pages, " +
      "products cannot be added, and private repositories cannot be read.")) return;
    store.clearToken();
    Object.assign(tokenState, { ok: null, refused: false });
    shownSecrets.clear();
    showBanner();
    viewSettings();
    document.getElementById("token-msg").textContent = token() ? "Clearing failed — the token is still stored." : "The token is gone from this browser.";
  });
  box.querySelector(`[data-clear="agent-m.products"]`)?.addEventListener("click", () => {
    if (!confirm("Clear the product list of this browser? The products' repositories do not change; add them again to see them here.")) return;
    store.clearProducts();
    loadProducts();
    renderProductSelector();
    renderBrowserSettings();
  });
  box.querySelectorAll("[data-remove-product]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm(`Remove ${b.dataset.removeProduct} from this browser's list? Its repository does not change.`)) return;
    store.removeProduct(b.dataset.removeProduct);
    loadProducts();
    renderProductSelector();
    renderBrowserSettings();
  }));
}

function wireSettings() {
  const ack = document.getElementById("ack"), input = document.getElementById("token-input");
  const expires = document.getElementById("token-expires"), save = document.getElementById("token-save");
  const msg = document.getElementById("token-msg"), importGo = document.getElementById("import-go");
  ack.addEventListener("change", () => {
    input.disabled = expires.disabled = save.disabled = importGo.disabled = !canStore(ack.checked);
  });
  save.addEventListener("click", () => {
    const v = input.value.trim(), exp = expires.value;
    if (!canStore(ack.checked) || !v) return;
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)) { msg.textContent = "That is not a GitHub token — it starts with github_pat_ and is long."; return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) { msg.textContent = "Enter the date the token expires — GitHub showed it when you created the token."; return; }
    store.setToken(v, exp);
    input.value = "";
    Object.assign(tokenState, { ok: null, refused: false });
    showBanner();
    viewSettings();
    document.getElementById("token-msg").textContent = "Stored. Press Test to check it; reload to read with it.";
  });
  document.getElementById("token-clear").addEventListener("click", () => {
    if (!confirm("Clear everything Agent M stored in this browser — the token, its date and the product list?")) return;
    store.clear();
    Object.assign(tokenState, { ok: null, refused: false });
    shownSecrets.clear();
    loadProducts();
    renderProductSelector();
    showBanner();
    viewSettings();
    document.getElementById("token-msg").textContent = token() ? "Clearing failed — token still stored." : "Nothing stored any more.";
  });
  document.getElementById("export-go").addEventListener("click", saveExport);
  importGo.addEventListener("click", async () => {
    const out = document.getElementById("io-msg"), file = document.getElementById("import-file").files[0];
    if (!canStore(ack.checked)) return;
    if (!file) { out.textContent = "Choose the settings file first."; return; }
    try {
      const settings = await readSettingsFile(await file.text(), document.getElementById("import-pass").value);
      const m = mergeSettings(store.entries(), settings);
      store.putEntries(m.put);
      loadProducts();
      renderProductSelector();
      showBanner();
      viewSettings();
      document.getElementById("io-msg").innerHTML = `Imported.<br>Added: ${h(m.added.join(", ") || "nothing — this browser had everything")}.` +
        `${m.kept.length ? `<br>Kept as this browser had them: ${h(m.kept.join(", "))}.` : ""}` +
        `${m.ignored.length ? `<br>Not known to this dashboard, not stored: ${h(m.ignored.join(", "))}.` : ""}`;
    } catch (e) { out.textContent = e.message; }
  });
}

// SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS: the file is handed to the browser's download,
// on this computer only — never committed, never sent, never put into an address.
async function saveExport() {
  const out = document.getElementById("io-msg");
  const p1 = document.getElementById("export-pass").value, p2 = document.getElementById("export-pass2").value;
  if (p1 !== p2) { out.textContent = "The two passphrases differ — nothing was saved."; return; }
  out.textContent = p1 ? "Locking the file…" : "Saving…";
  const text = await exportSettings(store.entries(), { passphrase: p1 });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = `agent-m-settings-${today()}${p1 ? "-locked" : ""}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  out.textContent = p1 ? "Saved, locked with your passphrase." : "Saved. The file holds your token in clear — keep it like a password.";
}

// UC-042 4–5: the selected product's settings, read from its repository at the loaded commit and changed
// only by a commit on a click. Without a token the section is read-only (UC-042 3a).
async function loadProductSettings() {
  const box = document.getElementById("product-settings");
  if (!box) return;
  if (!state.commit) {
    // Opened directly on #settings, the page renders before the repository is read; start() calls again.
    if (state.loadError) box.innerHTML = `<h3>Product · ${h(T.repo)}</h3><p class="warn">${h(T.repo)} could not be read
      (${h(errorText(state.loadError))}), so its settings cannot be shown.</p>`;
    return;
  }
  const entry = (p) => state.tree.find((e) => e.path === p) || null;
  const sEntry = entry(PRODUCT_SETTINGS_PATH), cEntry = entry(COLLABORATORS_PATH);
  let settingsText = null, collText = null, reach;
  try {
    [settingsText, collText, reach] = await Promise.all([sEntry ? raw(sEntry.path) : null, cEntry ? raw(cEntry.path) : null, checkReach(T.repo)]);
  } catch (e) {
    noteRefusal(e);
    box.innerHTML = `<h3>Product · ${h(T.repo)}</h3><p class="warn">${h(errorText(e))}</p>`;
    return;
  }
  if (!document.body.contains(box)) return;
  const on = pseudonymisationOn(settingsText), people = parseCollaborators(collText);
  const isPublic = reach.ok ? !reach.priv : false, canWrite = Boolean(token());
  const address = `https://github.com/${T.repo}`;
  box.innerHTML = `
    <h3>Product · ${h(T.repo)}</h3>
    <p class="muted small">Kept in <code>${h(T.repo)}</code> itself, so they bind everyone who works on it. Saving is one commit under your account.
      ${canWrite ? "" : `Read-only: this browser has no token. <a href="#add/${h(encodeURIComponent(address))}">Give your token access to it</a> (UC-001).`}</p>
    <div class="setting">
      <h4>Pseudonymisation — <span class="state">${on ? "on (the default)" : "off"}</span></h4>
      <p class="muted small">Kept in <code>${h(PRODUCT_SETTINGS_PATH)}</code>${sEntry ? "" : " (not written yet — on is the default)"}.</p>
      ${!canWrite ? "" : on ? `
      <p><button class="btn" id="pseudo-off">Switch off…</button></p>
      <div id="pseudo-confirm" hidden>
        <p class="notice">${h(pseudonymisationOffNotice({ repo: T.repo, isPublic }))}</p>
        <p><label><input type="checkbox" id="pseudo-ack"> I have read this.</label></p>
        <p><button class="btn primary" id="pseudo-save" disabled>Save: pseudonymisation off</button></p>
      </div>` : `
      <p class="muted small">${h(PSEUDONYMISATION_ON_NOTE)}</p>
      <p><button class="btn primary" id="pseudo-on">Switch on and save</button></p>`}
      <p class="result muted" id="pseudo-msg"></p>
      <details class="explain"><summary>What is this?</summary><div>With pseudonymisation on, report data from mails reaches this
        product's issues and repository only with names, addresses and other details replaced by stand-ins. Switch it off only
        where the repository is a protected, non-public data space.</div></details>
    </div>
    <div class="setting">
      <h4>Collaborators — ${people.length ? `${people.length} named` : "none named"}</h4>
      <p class="muted small">Kept in <code>${h(COLLABORATORS_PATH)}</code>. A person is named in this repository only by their
        account, or by name if they are listed here as having agreed.</p>
      ${people.length ? `<table class="list"><thead><tr><th>Name</th><th>Account</th><th>Agreed on</th>${canWrite ? "<th></th>" : ""}</tr></thead><tbody>
        ${people.map((c) => `<tr><td>${h(c.name)}</td><td>@${h(c.account)}</td><td>${h(c.agreed)}</td>
          ${canWrite ? `<td><button class="btn small" data-remove-collaborator="${h(c.account)}">Remove</button></td>` : ""}</tr>`).join("")}
      </tbody></table>` : ""}
      ${canWrite ? `<p><label>Name <input id="coll-name" autocomplete="off"></label>
        <label>Account <input id="coll-account" placeholder="github-login" autocomplete="off" spellcheck="false"></label>
        <label>Agreed on <input type="date" id="coll-agreed" value="${h(today())}"></label></p>
      <p><label><input type="checkbox" id="coll-consent"> This person has agreed to be named.</label></p>
      <p><button class="btn primary" id="coll-add">+ Collaborator and save</button></p>` : ""}
      <p class="result muted" id="coll-msg"></p>
      <details class="explain"><summary>What is this?</summary><div>Commits already name people by their account. A name
        beyond that is its bearer's decision, like being a co-author: it is written down here, with the date they agreed,
        where everyone can check it. Removing someone takes them off this list with one commit; earlier commits keep the
        name in the repository's history, and files that still name them have to be changed by hand.</div></details>
    </div>`;
  if (!canWrite) return;
  const commitSetting = async (ev, off, out) => {
    ev.currentTarget.disabled = true;
    out.textContent = "Committing…";
    try {
      const c = await savePseudonymisation({ repo: T.repo, branch: T.ref, token: token(), click: ev, current: settingsText,
        currentBlob: sEntry?.sha, off, acknowledged: off ? document.getElementById("pseudo-ack").checked : false });
      flash = `Pseudonymisation ${off ? "off" : "on"} — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>.`;
      await reloadAndRoute();
    } catch (e) { noteRefusal(e); out.textContent = errorText(e); ev.target.disabled = false; }
  };
  const out = document.getElementById("pseudo-msg");
  document.getElementById("pseudo-off")?.addEventListener("click", () => { document.getElementById("pseudo-confirm").hidden = false; });
  document.getElementById("pseudo-ack")?.addEventListener("change", (ev) => { document.getElementById("pseudo-save").disabled = !ev.target.checked; });
  document.getElementById("pseudo-save")?.addEventListener("click", (ev) => commitSetting(ev, true, out));
  document.getElementById("pseudo-on")?.addEventListener("click", (ev) => commitSetting(ev, false, out));
  const cOut = document.getElementById("coll-msg");
  const commitPeople = async (ev, list, what) => {
    ev.currentTarget.disabled = true;
    cOut.textContent = "Committing…";
    try {
      const c = await saveCollaborators({ repo: T.repo, branch: T.ref, token: token(), click: ev, list, currentBlob: cEntry?.sha });
      flash = `${h(what)} — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>.`;
      await reloadAndRoute();
    } catch (e) { noteRefusal(e); cOut.textContent = errorText(e); ev.target.disabled = false; }
  };
  document.getElementById("coll-add").addEventListener("click", (ev) => {
    let list;
    try {
      list = addCollaborator(people, { name: document.getElementById("coll-name").value, account: document.getElementById("coll-account").value,
        agreed: document.getElementById("coll-agreed").value, consent: document.getElementById("coll-consent").checked });
    } catch (e) { cOut.textContent = e.message; return; }
    commitPeople(ev, list, `Added ${list.at(-1).name} (@${list.at(-1).account})`);
  });
  box.querySelectorAll("[data-remove-collaborator]").forEach((b) => b.addEventListener("click", (ev) => {
    commitPeople(ev, removeCollaborator(people, b.dataset.removeCollaborator),
      `Removed @${b.dataset.removeCollaborator}; earlier commits keep the name in the history`);
  }));
}

const EXPLAIN = {
  repo: `A <em>repository</em> is the folder on GitHub that holds a project's files and their history. Paste its
    address as your browser shows it, <code>https://github.com/owner/name</code>. The product's requirements and use
    cases will live in that repository; this dashboard only shows them.`,
  token: `A <em>token</em> is a key you create on GitHub and give to this page, so it can make commits for you — only in
    the repositories you select, only with the permissions Agent M's features need, and only until the date you
    choose. You can delete it on GitHub at any time; it then stops working immediately.<br><br>
    <strong>Why these permissions?</strong> <em>Contents</em> (read and write) to save and accept — each is a commit;
    <em>Issues</em> (read and write) for reports that become issues; <em>Actions</em> (read and write) to start a run;
    <em>Metadata</em> (read), which GitHub requires for every token. One key covers all of them, so you create only one.<br><br>
    <strong>Why “Only select repositories”?</strong> GitHub preselects “All repositories”. That would let this page write
    to every repository you own. Choosing the two repositories named above limits it to what Agent M actually needs.`,
  store: `The token is saved in this browser only (its <code>localStorage</code>), never in a cookie, never in an
    address, never in any repository. It is sent only to GitHub's API, as a header. Another computer or browser
    does not have it — <em>Export settings</em> in Settings moves it there. Settings shows it, tests it and clears it.`,
  extend: `Your key was created for this instance only, on purpose: it can write nowhere else. A new product has to
    be added to it once. GitHub lets you change which repositories an existing key reaches; the key's text stays
    the same, so there is nothing to copy into Agent M. You can remove the product from the key again the same way.`,
  check: `Agent M reads the product repository with your key. For a private repository, success proves the key
    reaches it. A public repository can be read by anyone, so there the proof comes with the first write in Step C —
    if the key does not reach it yet, Step C says so and nothing is written.`,
  add: `One click writes one commit under your account into the product repository: the folders Agent M uses
    (<code>docs/use-cases/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), an empty
    <code>SPEC.md</code> and a <code>CHANGELOG.md</code> — only those that do not exist yet. It is an ordinary commit you
    can see and revert on GitHub; if nothing is missing, nothing is committed.<br><br>
    <strong>Why the product list lives in this browser only:</strong> the product's address is kept in this browser's
    storage, beside your key — nothing is written into your instance. So your fork never shows which products you
    work on, and it can be synced with Agent M without conflict. Another browser starts with an empty list; add the
    product there again. “Clear everything” in Settings removes the list with the key.`,
};

async function checkReach(repo) {
  try {
    const r = JSON.parse(await fetchText(`${API}/repos/${repo}`, {}, token()));
    return { ok: true, priv: r.private, branch: r.default_branch };
  } catch (e) { noteRefusal(e); return { ok: false, error: errorText(e) }; }
}

const reachLine = ([r, x]) => x.ok
  ? `✓ ${h(r)} reachable${x.priv ? "" : " — public, so write access is confirmed only by the first write"}`
  : `✗ ${h(r)}: ${h(x.error)}`;

// Step A of UC-014: create the key (for the instance, or — without a key in this browser — for both).
function createKeyStep(repos, title = "Step A · Create your key on GitHub") {
  return stepHtml({ title,
    body: `<p><a class="btn primary" href="${h(tokenLinkUrl(T.instance))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
      <p>On that page:</p>
      <ol class="choices">${repositoryChoiceSteps(repos[0], repos[1] || null).map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
    explain: EXPLAIN.token });
}

// Step B of UC-014: notice, paste, store, check the given repositories.
function storeKeyStep() {
  return stepHtml({ title: "Step B · Give the key to Agent M",
    body: `<p class="notice">${h(sharedOriginNotice(T.instance.split("/")[0]))}</p>
      <p><label><input type="checkbox" id="key-ack"> I have read this.</label></p>
      <p><input type="password" id="key-token" placeholder="github_pat_…" autocomplete="off" spellcheck="false" disabled aria-label="GitHub token"></p>
      <p><label>Expires on <input type="date" id="key-expires" value="${h(defaultExpiry())}" disabled></label>
        <span class="muted small">Preset to the ${TOKEN_DAYS} days of the prefilled link — correct it if you changed it on GitHub.
        Agent M warns ${EXPIRY_WARN_DAYS} days before.</span></p>
      <p><button class="btn" id="key-store" disabled>Store and check</button></p>
      <p id="key-check" class="muted"></p>`,
    explain: EXPLAIN.store });
}

function wireStoreKey(reposToCheck, onStored) {
  const ack = document.getElementById("key-ack"), tok = document.getElementById("key-token");
  const btn = document.getElementById("key-store"), out = document.getElementById("key-check");
  const expires = document.getElementById("key-expires");
  ack.addEventListener("change", () => { tok.disabled = expires.disabled = btn.disabled = !canStore(ack.checked); });
  btn.addEventListener("click", async () => {
    const v = tok.value.trim(), exp = expires.value;
    if (!canStore(ack.checked)) return;
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)) { out.textContent = "That is not a GitHub token — it starts with github_pat_ and is long."; return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exp)) { out.textContent = "Enter the date the token expires — GitHub showed it when you created the token."; return; }
    store.setToken(v, exp);
    Object.assign(tokenState, { ok: null, refused: false });
    showBanner();
    tok.value = "";
    const res = await Promise.all(reposToCheck().map(async (r) => [r, await checkReach(r)]));
    out.innerHTML = res.map(reachLine).join("<br>");
    onStored?.(res);
  });
}

// UC-014 · Finish setting up your instance
function viewSetup() {
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Finish setting up your instance</h2>
      <p class="muted">Two steps, once per browser. They give this dashboard a key that can write to
      <strong>${h(T.instance)}</strong> — and nothing else. Products are added to the same key later.</p></section>
    ${createKeyStep([T.instance])}
    ${storeKeyStep()}
    <p id="setup-done"></p>`;
  wireStoreKey(() => [T.instance], (res) => {
    if (res.every(([, x]) => x.ok)) {
      document.getElementById("setup-done").innerHTML =
        `<a class="btn primary" href="#uc">Your instance is ready →</a> <a class="btn" href="#add">+ Add a product</a>`;
    }
  });
}

// UC-001 · Add a product
async function viewAddProduct(preset = "") {
  const owner = T.instance.split("/")[0];
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Add a product</h2>
      <p class="muted">${token() ? "Your key exists already; it only needs to reach the new product." : "No key is stored in this browser yet — it is created first."}</p></section>
    <section class="panel">
      <label>Product repository address <input id="add-repo" value="${h(preset)}" placeholder="https://github.com/${h(owner)}/my-project" spellcheck="false" autocomplete="off"></label>
      <details class="explain"><summary>What is this?</summary><div>${EXPLAIN.repo}</div></details>
    </section>
    <div id="add-steps"></div>`;
  const input = document.getElementById("add-repo");
  const steps = document.getElementById("add-steps");
  const render = () => {
    const parsed = parseProductAddress(input.value);
    const valid = !parsed.error, repo = parsed.repo;
    const product = valid ? repo : "<your product>";
    const c = stepHtml({ title: "Step C · Add the product",
      body: `<p><button class="btn primary" id="add-go" ${valid && token() ? "" : "disabled"}>Add product</button></p>
        <p id="add-result" class="muted">${!valid ? h(input.value.trim() ? parsed.error : "Paste the product repository's address above.") : !token() ? "Store your key in Step B first." : ""}</p>`,
      explain: EXPLAIN.add });
    if (token()) {
      const a = stepHtml({ title: "Step A · Let your key reach the product",
        body: `<p><a class="btn" href="${h(tokenListUrl())}" target="_blank" rel="noopener">Open your tokens on GitHub ↗</a></p>
          <p>On that page:</p>
          <ol class="choices">${extendTokenSteps(T.instance, product).map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
        explain: EXPLAIN.extend });
      const b = stepHtml({ title: "Step B · Check",
        body: `<p><button class="btn" id="add-check-btn" ${valid ? "" : "disabled"}>Check</button></p><p id="add-check" class="muted"></p>`,
        explain: EXPLAIN.check });
      steps.innerHTML = a + b + c;
      document.getElementById("add-check-btn").addEventListener("click", async () => {
        document.getElementById("add-check").innerHTML = reachLine([repo, await checkReach(repo)]);
      });
    } else {
      steps.innerHTML = createKeyStep([T.instance, product]) + storeKeyStep() + c;
      wireStoreKey(() => [T.instance, ...(valid ? [repo] : [])], () => {
        document.getElementById("add-go").disabled = !valid;
        document.getElementById("add-result").textContent = valid ? "" : "Paste the product repository's address above.";
      });
    }
    wireAddGo(parsed);
  };
  input.addEventListener("input", render);
  render();
}

// UC-001 Step C: the layout goes into the product repository; the address into this browser's list only.
function wireAddGo(parsed) {
  document.getElementById("add-go").addEventListener("click", async (ev) => {
    const out = document.getElementById("add-result"), b = ev.currentTarget, repo = parsed.repo;
    b.disabled = true;
    try {
      out.textContent = `Reading ${repo} and writing what is missing…`;
      const r = await addProduct({ address: parsed.address, token: token(), click: ev, store });
      loadProducts();
      renderProductSelector();
      out.innerHTML = `Done — ${r.commit
        ? `<a href="${h(r.commit.url)}" target="_blank" rel="noopener">layout in ${h(repo)}</a>`
        : "nothing was missing in the product"}; ${h(parsed.address)} is now in this browser's product list.
        <a class="btn primary" href="?repo=${encodeURIComponent(repo)}">Open ${h(repo)} →</a>`;
    } catch (e) {
      noteRefusal(e);
      out.textContent = /403|404/.test(e.message)
        ? `Your key cannot write to ${repo} yet (${e.message}). Do Step A — add the product to your key on GitHub — and click again.`
        : errorText(e);
      b.disabled = false;
    }
  });
}

function renderProductSelector() {
  const sel = document.getElementById("product");
  // A PRODUCT IS NAMED BY ITS ADDRESS; the instance is always offered first and is not in the list.
  const options = [{ repo: T.instance, label: `${T.instance} — this instance` },
    ...state.products.filter((p) => p.repo !== T.instance).map((p) => ({ repo: p.repo, label: p.address }))];
  sel.innerHTML = options.map((p) => `<option value="${h(p.repo)}" ${p.repo === T.repo ? "selected" : ""}>${h(p.label)}</option>`).join("")
    + `<option value="__add">+ Add product…</option>`;
  sel.onchange = () => {
    if (sel.value === "__add") {
      sel.value = T.repo;
      location.hash = "#add";
      return;
    }
    const q = new URLSearchParams();
    if (sel.value !== T.instance) q.set("repo", sel.value);
    location.search = q.toString();
  };
}

// ---------------------------------------------------------------- routing

async function route() {
  const [kind, a, b] = location.hash.replace(/^#/, "").split("/");
  document.querySelectorAll(".tabs a").forEach((t) => t.classList.toggle("active",
    t.getAttribute("href") === `#${kind || "uc"}`));
  try {
    if (kind === "spec" && a) await viewSpecEntry(decodeURIComponent(a), b);
    else if (kind === "spec") await viewSpec();
    else if (kind === "how") viewHow();
    else if (kind === "settings") viewSettings();
    else if (kind === "add") await viewAddProduct(a ? decodeURIComponent(a) : "");
    else if (kind === "setup") viewSetup();
    else if (kind === "uc" && a) await viewUseCase(decodeURIComponent(a));
    else await viewUseCases();
    // A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE · AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — on every view.
    document.getElementById("token-banner").innerHTML = token()
      ? tokenBannerHtml({ expires: store.getTokenExpiry(), refused: tokenState.refused }) : "";
    if (flash) {
      main().insertAdjacentHTML("afterbegin", `<section class="panel notice flash"><p>${flash}</p></section>`);
      flash = null;
    }
  } catch (e) {
    main().innerHTML = `<p class="warn">${h(e.message)}</p>`;
  }
  window.scrollTo(0, 0);
}

async function start() {
  loadProducts();
  renderProductSelector();
  const early = /^#(settings|add|setup)/.test(location.hash);
  if (early) {
    addEventListener("hashchange", route);
    route();
  }
  try {
    await loadAll();
    document.getElementById("repo-line").innerHTML =
      `<a href="https://github.com/${h(T.repo)}" target="_blank" rel="noopener">${h(T.repo)}</a> · ${h(T.ref)} · <code>${h(state.commit.slice(0, 12))}</code>`;
  } catch (e) {
    noteRefusal(e);
    state.loadError = e;
    if (early) { loadProductSettings(); return; }
    const refused = tokenRefusal(e);
    const limited = /403|429/.test(e.message), missing = /404/.test(e.message);
    main().innerHTML = `<p class="warn">Could not read ${h(T.repo)} @ ${h(T.ref)}: ${h(e.message)}</p>
      ${limited ? `<p class="muted">Without a token GitHub allows 60 API calls per hour and network; this page uses two per load. A token in <a href="#settings">Settings</a> raises that.</p>` : ""}
      ${missing && !token() ? `<p class="muted">A private repository cannot be read without a token — add one in <a href="#settings">Settings</a>.</p>` : ""}
      ${missing && token() ? `<p class="muted">The stored token does not reach this repository. Extend it on github.com or check the name.</p>` : ""}
      ${refused ? `<p>${h(refused.text)} <a class="btn small" href="${h(refused.renewUrl)}" target="_blank" rel="noopener">Renew ↗</a></p>
        <p class="muted small">${h(refused.renew)} <a href="#settings">Settings</a></p>` : ""}`;
    addEventListener("hashchange", route);
    return;
  }
  if (!early) { addEventListener("hashchange", route); route(); } else loadProductSettings();
}

start();
