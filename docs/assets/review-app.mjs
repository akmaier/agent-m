// Review dashboard — UI over review-core.mjs. SPEC §10.
//
// Reads one pinned commit of the repository (two GitHub API calls, then immutable raw files),
// renders use cases and SPEC change proposals, and prepares — never performs — the two writes a
// reviewer can make: an edit (committed in GitHub's web editor) and an acceptance (an approval
// record committed on GitHub's new-file page). Every request goes through fetchText, which allows
// GET only, to GitHub only, without credentials.

import { marked } from "./vendor/marked.esm.js";
import DOMPurify from "./vendor/purify.es.mjs";
import { browserStore } from "./settings-store.mjs";
import {
  fetchText, gitBlobSha, deriveTarget, parseProducts, sharedOriginNotice, canStore, TOKEN_GUIDANCE,
  tokenLinkUrl, repositoryChoiceSteps, stepHtml, commitFiles, missingLayout, addProductText, parseFrontMatter, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, newFileUrl, editUrl, blobUrl, extractSection, sectionText, parseQueueIndex,
  parseDecisions, deriveUseCaseStatus, deriveSpecStatus,
} from "./review-core.mjs";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

// ---------------------------------------------------------------- instance, product, token

// The instance is the fork this page is served from; the product is chosen with ?repo= (SPEC §10).
const T = deriveTarget(location);
const store = browserStore();
const token = () => store.getToken();
const state = { commit: null, tree: [], useCases: [], records: [], queues: [], spec: "", overview: "", products: [] };

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

async function loadProducts() {
  try {
    const text = token()
      ? await fetchText(`${API}/repos/${T.instance}/contents/docs/products.md?ref=main`,
        { headers: { Accept: "application/vnd.github.raw+json" } }, token())
      : await fetchText(new URL("products.md", document.baseURI).href);
    state.products = parseProducts(text);
    state.productsText = text;
  } catch {
    state.products = [];
    state.productsText = null;
  }
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
  if (token()) {
    return `
  <section class="panel accept">
    <h3>Accept ${h(what)}</h3>
    <p>One click commits an approval record under your GitHub account. It names exactly the text shown
    here by its blob SHA <code>${h(record.blob.slice(0, 12))}</code>.</p>
    <p><button class="btn primary" data-accept-path="${h(path)}" data-accept-record="${h(text)}">Accept</button></p>
    <p class="result muted"></p>
    <details class="explain"><summary>What happens when I click?</summary><div>
      A three-line file is committed to <code>${h(path)}</code> in <code>${h(T.repo)}</code> with the token stored in
      this browser. Git records you as the author and the time; the file records which text you accepted.
      ${record.kind === "spec" ? "A workflow then writes the proposal into SPEC.md, byte for byte." : ""}
      Nothing else is changed. Edit the text later, and it shows as changed again.</div></details>
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

function wireCommon(root, original) {
  root.querySelectorAll("[data-accept-path]").forEach((b) => b.addEventListener("click", async (ev) => {
    const out = b.closest(".panel").querySelector(".result");
    b.disabled = true;
    out.textContent = "Committing…";
    try {
      const c = await commitFiles({ repo: T.repo, branch: T.ref, token: token(), click: ev,
        message: `accept ${b.dataset.acceptPath.split("/").pop().replace(/\.md$/, "")} (Agent M dashboard)`,
        files: [{ path: b.dataset.acceptPath, content: b.dataset.acceptRecord }] });
      out.innerHTML = `Accepted — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>. Reloading…`;
      await reloadAndRoute();
    } catch (e) {
      out.textContent = /403|404/.test(e.message)
        ? `Your token cannot write to ${T.repo} (${e.message}). Extend it in Settings, or remove it to use GitHub's page instead.`
        : e.message;
      b.disabled = false;
    }
  }));
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
    } catch (e) { out.textContent = e.message; b.disabled = false; }
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
    ${editPanel(u.path, u.text, u.blob)}`;
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
    ${e.proposalPath ? editPanel(e.proposalPath, e.proposalText, e.proposalBlob) : ""}`;
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

Reading: repository \`${T.repo}\`, branch \`${T.ref}\`, commit \`${(state.commit || "").slice(0, 12)}\`,
${token() ? "with the token stored in this browser" : "without a token"}. Instance: \`${T.instance}\`.
Products are chosen in the selector at the top and listed in the instance's \`docs/products.md\`.
`)}</article>`;
}

// ---------------------------------------------------------------- settings (SPEC §7)

function viewSettings() {
  const owner = T.instance.split("/")[0];
  const stored = token();
  main().innerHTML = `
    <section class="head"><h2>Settings</h2>
      <p class="muted">Stored only in this browser. Nothing here is sent anywhere until a page reads from GitHub.</p></section>
    <section class="panel notice">
      <h3>Before you store anything</h3>
      <p>${h(sharedOriginNotice(owner))}</p>
      <label><input type="checkbox" id="ack"> I have read this.</label>
    </section>
    <section class="panel">
      <h3>GitHub token</h3>
      <p>Status: <strong id="token-status">${stored ? `stored (…${h(stored.slice(-4))})` : "none stored"}</strong></p>
      <p><a class="btn" href="${h(tokenLinkUrl(T.instance))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
      <ol class="choices">${repositoryChoiceSteps(T.instance, null).map((s) => `<li>${h(s)}</li>`).join("")}</ol>
      <details class="explain"><summary>What is this?</summary><pre class="guidance">${h(TOKEN_GUIDANCE)}</pre></details>
      <p><input type="password" id="token-input" autocomplete="off" spellcheck="false" disabled
        placeholder="github_pat_…" aria-label="GitHub token"></p>
      <p>
        <button class="btn primary" id="token-save" disabled>Store token</button>
        <button class="btn" id="token-test" ${stored ? "" : "disabled"}>Test: read ${h(T.instance)}</button>
        <button class="btn" id="token-clear">Clear everything Agent M stored</button>
      </p>
      <p id="token-msg" class="muted"></p>
    </section>`;
  const ack = document.getElementById("ack"), input = document.getElementById("token-input");
  const save = document.getElementById("token-save"), msg = document.getElementById("token-msg");
  ack.addEventListener("change", () => { input.disabled = !canStore(ack.checked); save.disabled = !canStore(ack.checked); });
  save.addEventListener("click", () => {
    if (!canStore(ack.checked) || !input.value.trim()) return;
    store.setToken(input.value);
    input.value = "";
    viewSettings();
    document.getElementById("token-msg").textContent = "Stored. Reload to read with it.";
  });
  document.getElementById("token-test").addEventListener("click", async () => {
    try {
      await fetchText(`${API}/repos/${T.instance}`, {}, token());
      msg.textContent = `The token can read ${T.instance}.`;
    } catch (e) { msg.textContent = `The token cannot read ${T.instance}: ${e.message}`; }
  });
  document.getElementById("token-clear").addEventListener("click", () => {
    store.clear();
    viewSettings();
    document.getElementById("token-msg").textContent = token() ? "Clearing failed — token still stored." : "Nothing stored any more.";
  });
}

const EXPLAIN = {
  repo: `A <em>repository</em> is the folder on GitHub that holds a project's files and their history. You name it as
    <code>owner/name</code>, exactly as it appears in its address <code>github.com/owner/name</code>. The product's
    requirements and use cases will live in that repository; this dashboard only shows them.`,
  token: `A <em>token</em> is a key you create on GitHub and give to this page, so it can make commits for you — only in
    the repositories you select, only with the one permission it needs, and only until the date you choose.
    You can delete it on GitHub at any time; it then stops working immediately.<br><br>
    <strong>Why “Only select repositories”?</strong> GitHub preselects “All repositories”. That would let this page write
    to every repository you own. Choosing the two repositories named above limits it to what Agent M actually needs.`,
  store: `The token is saved in this browser only (its <code>localStorage</code>), never in a cookie, never in an
    address, never in any repository. It is sent only to GitHub's API, as a header. Another computer or browser
    does not have it. “Clear everything” in Settings removes it.`,
  add: `One click writes two commits under your account: into the product repository, the folders Agent M uses
    (<code>docs/use-cases/</code>, <code>docs/approvals/</code>, <code>docs/spec-freigaben/</code>), an empty
    <code>SPEC.md</code> and a <code>CHANGELOG.md</code> — only those that do not exist yet; and into this instance, one
    line in <code>docs/products.md</code>. Both are ordinary commits you can see and revert on GitHub.`,
};

async function viewAddProduct(preset = "") {
  const owner = T.instance.split("/")[0];
  const stored = token();
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← back</a></p>
    <section class="head"><h2>Add a product</h2>
      <p class="muted">Three steps. Steps A and B are needed only once per browser.</p></section>
    <section class="panel">
      <label>Product repository <input id="add-repo" value="${h(preset)}" placeholder="${h(owner)}/my-project" spellcheck="false" autocomplete="off"></label>
      <details class="explain"><summary>What is this?</summary><div>${EXPLAIN.repo}</div></details>
    </section>
    <div id="add-steps"></div>`;
  const input = document.getElementById("add-repo");
  const steps = document.getElementById("add-steps");
  const render = () => {
    const repo = input.value.trim();
    const valid = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(repo) && !repo.includes("..");
    const a = stepHtml({ title: stored ? "Step A · Your GitHub key (done)" : "Step A · Create your key on GitHub",
      body: `${stored ? `<p class="muted">A token is stored in this browser. If it does not cover
        <strong>${h(valid ? repo : "the product")}</strong>, extend it on GitHub:
        <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">your tokens ↗</a>
        → the Agent M token → Edit → Repository access → add it → Update.</p>` : ""}
        <p><a class="btn ${stored ? "" : "primary"}" href="${h(tokenLinkUrl(T.instance))}" target="_blank" rel="noopener">Open GitHub's token page (prefilled) ↗</a></p>
        <p>On that page:</p>
        <ol class="choices">${repositoryChoiceSteps(T.instance, valid ? repo : "<your product>").map((s) => `<li>${h(s)}</li>`).join("")}</ol>`,
      explain: EXPLAIN.token });
    const b = stepHtml({ title: "Step B · Give the key to Agent M",
      body: `<p class="notice">${h(sharedOriginNotice(owner))}</p>
        <p><label><input type="checkbox" id="add-ack"> I have read this.</label></p>
        <p><input type="password" id="add-token" placeholder="github_pat_…" autocomplete="off" spellcheck="false" disabled aria-label="GitHub token">
        <button class="btn" id="add-store" disabled>Store and check</button></p>
        <p id="add-check" class="muted">${stored ? `Stored (…${h(stored.slice(-4))}).` : ""}</p>`,
      explain: EXPLAIN.store });
    const c = stepHtml({ title: "Step C · Add the product",
      body: `<p><button class="btn primary" id="add-go" ${valid && token() ? "" : "disabled"}>Add product</button></p>
        <p id="add-result" class="muted">${!valid ? "Type the product repository above." : !token() ? "Store a token in Step B first." : ""}</p>`,
      explain: EXPLAIN.add });
    steps.innerHTML = a + b + c;
    wireAdd(repo, valid);
  };
  input.addEventListener("input", render);
  render();
}

async function checkReach(repo) {
  try {
    const r = JSON.parse(await fetchText(`${API}/repos/${repo}`, {}, token()));
    return { ok: true, priv: r.private, branch: r.default_branch };
  } catch (e) { return { ok: false, error: e.message }; }
}

function wireAdd(repo, valid) {
  const ack = document.getElementById("add-ack"), tok = document.getElementById("add-token");
  const store_ = document.getElementById("add-store"), check = document.getElementById("add-check");
  ack.addEventListener("change", () => { tok.disabled = store_.disabled = !canStore(ack.checked); });
  store_.addEventListener("click", async () => {
    const v = tok.value.trim();
    if (!canStore(ack.checked)) return;
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)) { check.textContent = "That is not a GitHub token — it starts with github_pat_ and is long."; return; }
    store.setToken(v);
    tok.value = "";
    const repos = [...new Set([T.instance, valid ? repo : null].filter(Boolean))];
    const res = await Promise.all(repos.map(async (r) => [r, await checkReach(r)]));
    check.innerHTML = res.map(([r, x]) => x.ok
      ? `✓ ${h(r)} readable${x.priv ? "" : " — public, so write access is confirmed only when you add the product"}`
      : `✗ ${h(r)}: ${h(x.error)}`).join("<br>");
    document.getElementById("add-go").disabled = !valid;
    document.getElementById("add-result").textContent = valid ? "" : "Type the product repository above.";
  });
  document.getElementById("add-go").addEventListener("click", async (ev) => {
    const out = document.getElementById("add-result"), b = ev.currentTarget;
    b.disabled = true;
    try {
      out.textContent = "Reading the product repository…";
      const info = await checkReach(repo);
      if (!info.ok) throw new Error(`cannot read ${repo}: ${info.error}`);
      const tree = JSON.parse(await fetchText(`${API}/repos/${repo}/git/trees/${encodeURIComponent(info.branch)}?recursive=1`, {}, token()));
      const files = missingLayout(tree.tree.filter((e) => e.type === "blob").map((e) => e.path), repo);
      const links = [];
      if (files.length) {
        out.textContent = `Writing ${files.length} files into ${repo}…`;
        const c = await commitFiles({ repo, branch: info.branch, token: token(), click: ev, files,
          message: "Add the Agent M review layout (Agent M dashboard)" });
        links.push(`<a href="${h(c.url)}" target="_blank" rel="noopener">layout in ${h(repo)}</a>`);
      }
      await loadProducts();
      if (!state.products.some((p) => p.repo === repo) && repo !== T.instance) {
        out.textContent = `Adding ${repo} to ${T.instance}…`;
        const base = state.productsText ?? "# Products of this instance\n\n## Products\n\n";
        const c = await commitFiles({ repo: T.instance, branch: "main", token: token(), click: ev,
          files: [{ path: "docs/products.md", content: addProductText(base, repo, "") }],
          message: `Add product ${repo} (Agent M dashboard)` });
        links.push(`<a href="${h(c.url)}" target="_blank" rel="noopener">entry in ${h(T.instance)}</a>`);
      }
      out.innerHTML = `Done${links.length ? " — " + links.join(" · ") : " — nothing was missing"}.
        <a class="btn primary" href="?repo=${encodeURIComponent(repo)}">Open ${h(repo)} →</a>`;
    } catch (e) {
      out.textContent = /403/.test(e.message)
        ? `Your token cannot write there (${e.message}). Extend it on GitHub (Step A), then click again.`
        : e.message;
      b.disabled = false;
    }
  });
}

function renderProductSelector() {
  const sel = document.getElementById("product");
  const options = [{ repo: T.instance, note: "this instance" }, ...state.products.filter((p) => p.repo !== T.instance)];
  sel.innerHTML = options.map((p) => `<option value="${h(p.repo)}" ${p.repo === T.repo ? "selected" : ""}>${h(p.repo)}${p.note ? " — " + h(p.note) : ""}</option>`).join("")
    + `<option value="__add">+ Add product…</option>`;
  sel.addEventListener("change", () => {
    if (sel.value === "__add") {
      sel.value = T.repo;
      location.hash = "#add";
      return;
    }
    const q = new URLSearchParams();
    if (sel.value !== T.instance) q.set("repo", sel.value);
    location.search = q.toString();
  });
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
    else if (kind === "uc" && a) await viewUseCase(decodeURIComponent(a));
    else await viewUseCases();
  } catch (e) {
    main().innerHTML = `<p class="warn">${h(e.message)}</p>`;
  }
  window.scrollTo(0, 0);
}

async function start() {
  await loadProducts();
  renderProductSelector();
  const early = /^#(settings|add)/.test(location.hash);
  if (early) {
    addEventListener("hashchange", route);
    route();
  }
  try {
    await loadAll();
    document.getElementById("repo-line").innerHTML =
      `<a href="https://github.com/${h(T.repo)}" target="_blank" rel="noopener">${h(T.repo)}</a> · ${h(T.ref)} · <code>${h(state.commit.slice(0, 12))}</code>`;
  } catch (e) {
    if (early) return;
    const limited = /403|429/.test(e.message), missing = /404/.test(e.message);
    main().innerHTML = `<p class="warn">Could not read ${h(T.repo)} @ ${h(T.ref)}: ${h(e.message)}</p>
      ${limited ? `<p class="muted">Without a token GitHub allows 60 API calls per hour and network; this page uses two per load. A token in <a href="#settings">Settings</a> raises that.</p>` : ""}
      ${missing && !token() ? `<p class="muted">A private repository cannot be read without a token — add one in <a href="#settings">Settings</a>.</p>` : ""}
      ${missing && token() ? `<p class="muted">The stored token does not reach this repository. Extend it on github.com or check the name.</p>` : ""}`;
    addEventListener("hashchange", route);
    return;
  }
  if (!early) { addEventListener("hashchange", route); route(); }
}

start();
