// Review dashboard — UI over review-core.mjs. SPEC §10.
//
// Reads one pinned commit of the repository (two GitHub API calls, then immutable raw files),
// renders use cases and SPEC change proposals, and prepares — never performs — the two writes a
// reviewer can make: an edit (committed in GitHub's web editor) and an acceptance (an approval
// record committed on GitHub's new-file page). Every request goes through fetchText, which allows
// GET only, to GitHub only, without credentials.

import { marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";
import {
  fetchText, gitBlobSha, parseFrontMatter, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, newFileUrl, editUrl, blobUrl, extractSection, sectionText, parseQueueIndex,
  parseDecisions, deriveUseCaseStatus, deriveSpecStatus,
} from "./review-core.mjs";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

// ---------------------------------------------------------------- which repository

function target() {
  const q = new URLSearchParams(location.search);
  let repo = q.get("repo");
  if (!repo) {
    const owner = location.hostname.endsWith(".github.io") ? location.hostname.split(".")[0] : null;
    const name = location.pathname.split("/").filter(Boolean)[0];
    repo = owner && name ? `${owner}/${name}` : "akmaier/agent-m";
  }
  return { repo, ref: q.get("ref") || "main" };
}

const T = target();
const state = { commit: null, tree: [], useCases: [], records: [], queues: [], spec: "", overview: "" };

// ---------------------------------------------------------------- loading

async function loadSnapshot() {
  const [owner, name] = T.repo.split("/");
  const commitJson = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/commits/${encodeURIComponent(T.ref)}`,
    { headers: { Accept: "application/vnd.github+json" } }));
  state.commit = commitJson.sha;
  const tree = JSON.parse(await fetchText(`${API}/repos/${owner}/${name}/git/trees/${state.commit}?recursive=1`));
  state.tree = tree.tree.filter((e) => e.type === "blob");
}

const raw = (path) => fetchText(`${RAW}/${T.repo}/${state.commit}/${path.split("/").map(encodeURIComponent).join("/")}`);
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
    const entries = await Promise.all(idx.entries.map(async (en) => {
      const nn = String(en.nr).padStart(2, "0");
      const files = paths(new RegExp(`^${esc(dir)}/${nn}-[^/]+\\.md$`));
      const prop = files.find((f) => !f.path.endsWith(".begruendung.md"));
      const why = files.find((f) => f.path.endsWith(".begruendung.md"));
      const [proposalText, rationale] = await Promise.all([prop ? raw(prop.path) : "", why ? raw(why.path) : ""]);
      const targetPath = specTarget(idx.target || en.file);
      const specText = targetPath === "SPEC.md" ? state.spec : (paths(new RegExp(`^${esc(targetPath)}$`)).length ? await raw(targetPath) : "");
      const sec = extractSection(specText, en.anchor, en.bis);
      const current = sec.error ? "" : sectionText(sec);
      const proposalBlob = await gitBlobSha(proposalText);
      const sectionBlob = sec.error ? "" : await gitBlobSha(current);
      const status = deriveSpecStatus({ queue: dir, nr: en.nr, proposalPath: prop?.path, proposalText,
        proposalBlob, sectionBlob, specText, decisions, records: state.records });
      return { ...en, nn, dir, proposalPath: prop?.path, proposalText, rationale, current, error: sec.error,
        proposalBlob, sectionBlob, targetPath, status, decision: decisions.get(en.nr) };
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

// ---------------------------------------------------------------- actions (prepare, never perform)

function acceptPanel(record, path, what) {
  const text = recordText(record);
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

function editPanel(path, text) {
  return `
  <section class="panel edit" hidden>
    <h3>Edit</h3>
    <p class="muted">Prepare the change here with a live preview. <strong>Copy &amp; open GitHub editor</strong>
    copies your text and opens GitHub's editor for <code>${h(path)}</code>: select all, paste, commit.
    After that the file has a new SHA and is reviewed again.</p>
    <div class="editor">
      <textarea spellcheck="false" aria-label="Edited text">${h(text)}</textarea>
      <div class="preview md"></div>
    </div>
    <p>
      <button class="btn primary" data-edit-commit="${h(path)}">Copy &amp; open GitHub editor ↗</button>
      <button class="btn" data-edit-diff>Show difference</button>
      <button class="btn" data-edit-reset>Reset</button>
    </p>
    <div class="edit-diff"></div>
  </section>`;
}

function wireCommon(root, original) {
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
  ed.querySelector("[data-edit-commit]").addEventListener("click", async (ev) => {
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

async function viewUseCases() {
  const rows = state.useCases.map((u) => `
    <tr>
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.id)}</a></td>
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.title)}</a></td>
      <td>${h(u.fields.stage)}</td>
      <td>${Array.isArray(u.fields.realises) ? u.fields.realises.length : 0}</td>
      <td>${badge(u.status)}</td>
    </tr>`).join("");
  main().innerHTML = `
    <section class="head"><h2>Use cases</h2><p>${counts(state.useCases)}</p></section>
    <table class="list"><thead><tr><th>ID</th><th>Title</th><th>Stage</th><th>Realises</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    ${state.overview ? `<section class="md overview">${md(state.overview)}</section>` : ""}`;
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
        ${u.status === "accepted" ? "" : acceptPanel(useCaseRecord(u.path, u.blob), approvalPath(u.fields.id, u.blob), u.fields.id)}
      </aside>
    </div>
    ${editPanel(u.path, u.text)}`;
  wireCommon(main(), u.text);
  await renderMermaid(main());
}

async function viewSpec() {
  const all = state.queues.flatMap((q) => q.entries);
  main().innerHTML = `
    <section class="head"><h2>SPEC changes</h2><p>${counts(all)}</p>
    <p class="muted">Each entry proposes the text of one SPEC section. Accept it here; the workflow writes it into
    <code>SPEC.md</code> byte for byte once your approval commit arrives.</p></section>
    ${state.queues.map((q) => `
      <section class="queue">
        <h3>${h(q.name)}</h3>
        <table class="list"><thead><tr><th>Nr</th><th>Section</th><th>Status</th></tr></thead><tbody>
        ${q.entries.map((e) => `<tr><td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.nn)}</a></td>
          <td><a href="#spec/${h(q.name)}/${h(e.nn)}">${h(e.anchor.replace(/^#+\s*/, ""))}</a>${e.error ? ` <span class="warn">${h(e.error)}</span>` : ""}</td>
          <td>${badge(e.status)}</td></tr>`).join("")}
        </tbody></table>
      </section>`).join("")}`;
}

async function viewSpecEntry(qname, nn) {
  const q = state.queues.find((x) => x.name === qname);
  const e = q?.entries.find((x) => x.nn === nn);
  if (!e) { main().innerHTML = `<p class="warn">No entry ${h(qname)}/${h(nn)}.</p>`; return; }
  const canAccept = !e.error && e.proposalPath && ["open", "stale"].includes(e.status);
  const rec = canAccept ? specRecord({ queue: e.dir, entry: e.nr, proposal: e.proposalPath, blob: e.proposalBlob,
    target: e.targetPath, anchor: e.anchor, section: e.sectionBlob }) : null;
  main().innerHTML = `
    <p class="crumbs"><a href="#spec">← all SPEC changes</a></p>
    <section class="head">
      <h2>${h(q.name)} · ${h(e.nn)} ${badge(e.status)}</h2>
      <p class="meta">Section <code>${h(e.anchor)}</code> in <code>${h(e.targetPath)}</code> ·
        proposal blob <code>${h(e.proposalBlob.slice(0, 12))}</code>
        ${e.decision ? ` · decision: ${h(e.decision.decision)} ${h(e.decision.when)}` : ""}</p>
      ${e.error ? `<p class="warn">${h(e.error)} — this entry cannot be accepted until the anchor is fixed.</p>` : ""}
      ${e.status === "stale" ? `<p class="warn">An approval exists for an earlier text of this proposal or of the SPEC section. It was not applied. Decide again on what you see now.</p>` : ""}
    </section>
    <div class="side">
      <section><h3>In the SPEC now</h3><div class="md doc">${e.current ? md(e.current) : `<p class="muted">—</p>`}</div></section>
      <section><h3>Proposed</h3><div class="md doc">${md(e.proposalText)}</div></section>
    </div>
    <section class="panel"><h3>Difference</h3>${diffHtml(e.current, e.proposalText)}</section>
    ${e.rationale ? `<section class="panel md rationale"><h3>Rationale</h3>${md(e.rationale.replace(/^# .*\n/, ""))}</section>` : ""}
    <section class="panel"><button class="btn" data-toggle-edit>Edit proposal…</button></section>
    ${rec ? acceptPanel(rec, approvalPath(`spec-${q.name}-${e.nn}`, e.proposalBlob), `entry ${e.nn}`) : ""}
    ${e.proposalPath ? editPanel(e.proposalPath, e.proposalText) : ""}`;
  wireCommon(main(), e.proposalText);
  await renderMermaid(main());
}

function viewHow() {
  main().innerHTML = `<article class="md doc how">${md(`
## How acceptance works

**Acceptance is a commit.** Nothing on this page writes to GitHub. When you accept, the page opens
GitHub's *new file* page with a short approval record already filled in. Pressing *Commit changes*
there is the act of accepting. Git records who and when; the record says which text.

**The record names the text by its SHA.** The page computes the git blob SHA of exactly the text it
shows you, the same number \`git hash-object\` would give. A use case counts as accepted only while
its current text has that SHA. Edit it later, and it shows as *changed* again, with no status to
reset.

**Editing** happens here with a live preview. *Copy & open GitHub editor* puts your text on the
clipboard and opens GitHub's editor for the file: select all, paste, commit. The new text is then
reviewed like any other.

**SPEC changes** follow the same path. After your approval commit, a GitHub Actions workflow checks
that the proposal and the current SPEC section still have the SHAs you saw. It then writes the
proposal into \`SPEC.md\` byte for byte and logs the decision. If either changed in the meantime, it
writes nothing and the entry shows as *stale*.

**Without write access**, GitHub turns your commit into a pull request. The acceptance counts once
a maintainer merges it.

Reading: repository \`${T.repo}\`, branch \`${T.ref}\`, commit \`${(state.commit || "").slice(0, 12)}\`.
Another repository or branch: \`?repo=owner/name&ref=branch\`.
`)}</article>`;
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
    else if (kind === "uc" && a) await viewUseCase(decodeURIComponent(a));
    else await viewUseCases();
  } catch (e) {
    main().innerHTML = `<p class="warn">${h(e.message)}</p>`;
  }
  window.scrollTo(0, 0);
}

async function start() {
  try {
    await loadAll();
    document.getElementById("repo-line").innerHTML =
      `<a href="https://github.com/${h(T.repo)}" target="_blank" rel="noopener">${h(T.repo)}</a> · ${h(T.ref)} · <code>${h(state.commit.slice(0, 12))}</code>`;
  } catch (e) {
    const limited = /403|429/.test(e.message);
    main().innerHTML = `<p class="warn">Could not read ${h(T.repo)} @ ${h(T.ref)}: ${h(e.message)}</p>
      ${limited ? `<p class="muted">GitHub allows 60 unauthenticated API calls per hour and network; this page uses two per load. Try again later.</p>` : ""}`;
    return;
  }
  addEventListener("hashchange", route);
  route();
}

start();
