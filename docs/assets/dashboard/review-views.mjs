// Review views — the use cases, the architecture and the review pages of one area (SPEC §10, §11; UC-008, UC-022, UC-023),
// and what every reviewed file's page has: the accept panel, the ticks, the editor with its preview.
//
// Module: MOD-dashboard-app
//
// Routes #uc, #uc/<id>, #arc, #arc/<id>, #review/<area>. Every function gets `app`, the page's context (dashboard-app.mjs).

import {
  gitBlobSha, recordText, approvalPath, useCaseRecord, reviewedRecord, acceptItems, missingNeeds, itemLabel, lastAccepted,
  saveReviewedFile, reviewPage, recordsForId,
} from "../review-core.mjs";
import { writeRoute, webFileUrl, newFileUrl, editUrl } from "../git-host.mjs";
import { parseFrontMatter, reviewedId, ARCHITECTURE_FILE, parseArchitecture } from "../artifacts.mjs";
import { moduleHeaders, impactList, componentDiagram } from "../traceability.mjs";

export const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const esc = h;

export const LABEL = {
  open: ["open", "Not accepted yet"],
  accepted: ["accepted", "An approval record names exactly this text"],
  changed: ["changed", "Accepted earlier, edited since — the current text is not accepted"],
  approved: ["approved", "Approval recorded, not yet written into the SPEC — the apply workflow writes it after an approval committed on GitHub's page; accepted here with a token, record and SPEC section are one commit"],
  stale: ["stale", "Approved on a text that has changed since — decide again"],
  applied: ["in SPEC", "Accepted and present in the SPEC word for word"],
  superseded: ["superseded", "Accepted once, since replaced by a later change"],
};
export const badge = (s) => `<span class="badge b-${s}" title="${h(LABEL[s]?.[1])}">${h(LABEL[s]?.[0] ?? s)}</span>`;

// ---------------------------------------------------------------- the files of the review areas, read for the view shown

// ONE USE CASE, ONE FILE. The use cases of the tree, in its order, without reading one.
const ucEntries = (app) => app.paths(/^docs\/use-cases\/UC-\d{3}-[^/]+\.md$/);
async function loadUseCase(app, e, verify = false) {
  const text = await app.fileText(e.path);
  const blob = await gitBlobSha(text);
  const { fields, body } = parseFrontMatter(text);
  const st = await app.statusOf(e.path, blob, [fields.id], verify);
  if (verify) app.verified.set(e.path, st.status);
  return { path: e.path, text, blob, treeBlob: e.sha, fields, body, status: st.status };
}
const useCases = (app) => app.once("use-cases", () => Promise.all(ucEntries(app).map((e) => loadUseCase(app, e))));

// ONE ARCHITECTURE DECISION, ONE FILE · ONE MODULE, ONE FILE: docs/architecture/ARC-<nnn>-<slug>.md and MOD-<slug>.md.
const archEntries = (app) => app.paths(ARCHITECTURE_FILE).sort((a, b) => a.path.localeCompare(b.path));
async function loadArch(app, e, verify = false) {
  const { recIndex, readRecords } = app;
  const text = await app.fileText(e.path);
  const blob = await gitBlobSha(text);
  const arch = parseArchitecture(e.path, text);
  const st = await app.statusOf(e.path, blob, [arch.id], verify);
  if (verify) app.verified.set(e.path, st.status);
  // The records of its identifier: read when the file is opened, counted by their names in a list.
  const records = verify ? await app.recordsOf(arch.id) : null;
  const named = (recIndex().byId.get(arch.id) || []).length
    + (recIndex().unknown.length ? recordsForId(await readRecords(recIndex().unknown), arch.id).length : 0);
  return { path: e.path, text, blob, treeBlob: e.sha, arch, status: st.status, records, named };
}
const archFiles = (app) => app.once("architecture", () => Promise.all(archEntries(app).map((e) => loadArch(app, e))));

// ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS: the SPEC's requirements, and the use cases the files name — each with its status
// and the record that accepts its current text, from the tree's names. No use case is read; the record is read and checked
// on the commit an acceptance is written on (review-core.mjs architectureRefusal).
async function loadArchContext(app, files) {
  const want = new Set(files.flatMap((f) => f.arch.useCases));
  const [spec, list] = await Promise.all([app.fileText("SPEC.md"), Promise.all(ucEntries(app).filter((e) => want.has(reviewedId(e.path)))
    .map(async (e) => {
      const st = await app.statusOf(e.path, e.sha);
      return { id: reviewedId(e.path), path: e.path, blob: e.sha, status: st.status, record: st.status === "accepted" ? st.record : null };
    }))]);
  app.state.archCtx = { spec, useCases: list };
}

// ---------------------------------------------------------------- the last accepted text (UC-008 2a)

// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT (UC-008 2a): read once per identifier and pinned commit, then kept
// in memory for this page — the text a record names never changes — and kept in this browser by its blob SHA. The records are
// those of the identifier, read here: their content, not their names, says which text was accepted.
function lastAcceptedOf(app, id) {
  const { acceptedCache, state, GITLAB, T } = app;
  const key = `${id}@${state.commit}`;
  if (!acceptedCache.has(key)) {
    acceptedCache.set(key, app.recordsOf(id).then((records) => lastAccepted({ ...(GITLAB ? { product: T.product } : { repo: T.repo }),
      commit: state.commit, token: app.token(), records, id, cache: app.kept, repoKey: app.REPO_KEY }))
      .catch((e) => { acceptedCache.delete(key); throw e; }));
  }
  return acceptedCache.get(key);
}

async function fillAcceptedDiff(app, u, id) {
  const { T, SERVER, diffHtml } = app;
  const box = document.getElementById("accepted-diff");
  if (!box) return;
  try {
    const last = await lastAcceptedOf(app, id);
    if (!document.body.contains(box) || !last) return;
    const r = last.record, name = r._path.split("/").pop();
    box.innerHTML = `<h3>Changed since it was last accepted</h3>
      <p class="muted small">Difference between the text accepted in
        <a href="${h(webFileUrl(T.product, T.ref, r._path))}" target="_blank" rel="noopener">${h(name)}</a>
        (blob <code>${h(r.blob.slice(0, 12))}</code>${r.file !== u.path ? `, then named <code>${h(r.file.split("/").pop())}</code>` : ""}${last.committedAt
          ? `, committed ${h(last.committedAt)} — the last of ${last.count} records of ${h(id)}` : ""}) and the text below.</p>
      ${diffHtml(last.text, u.text)}
      <details class="explain"><summary>What is this?</summary><div>The approval record names the accepted text by its git blob
        SHA, so ${h(SERVER)} still holds it; the dashboard reads it by that SHA and shows only what changed since. Records are
        matched by the file's identifier, so a file renamed since is compared too. With several records, the one committed
        last is used.</div></details>`;
  } catch (e) {
    app.noteRefusal(e);
    if (document.body.contains(box)) box.innerHTML = `<h3>Changed since it was last accepted</h3><p class="warn">The last accepted text could not be read: ${h(app.errorText(e))}</p>`;
  }
}

// ---------------------------------------------------------------- actions

export function gitlabTokenNeeded(app, what) {
  return `<p class="notice">${h(what)} on GitLab needs this project's own token: GitLab has no page that could be prefilled
    with the record or the text, so there is no route without it. <a class="btn primary" href="${h(app.tokenStepLink())}">Store the
    project's token</a></p>`;
}

// `item` is what this page showed the reviewer (see session); with a token, Accept commits exactly that.
export function acceptPanel(app, record, path, what, item) {
  const { T, SERVER, session } = app;
  const text = recordText(record);
  const route = writeRoute(T.product, app.token());
  if (route === "token-step") {
    return `
  <section class="panel accept">
    <h3>Accept ${h(what)}</h3>
    ${gitlabTokenNeeded(app, "Accepting")}
    <details class="explain"><summary>What is this?</summary><div>Accepting is a commit under your own account that adds an
      approval record naming exactly this text. On ${h(SERVER)} the dashboard makes that commit with the project access token
      you create for ${h(T.product.repo)} (role Maintainer, scope api); it is stored in this browser and sent only to that
      project's API.</div></details>
  </section>`;
  }
  if (route === "commit") {
    const key = session.show(item);
    return `
  <section class="panel accept">
    <h3>Accept ${h(what)}</h3>
    <p>One click commits an approval record under your account on ${h(SERVER)}. It names exactly the text shown
    here by its blob SHA <code>${h(record.blob.slice(0, 12))}</code>.</p>
    <p><button class="btn primary" data-accept-key="${h(key)}">Accept</button></p>
    ${tickBox(app, key)}
    <p class="result muted"></p>
    <details class="explain"><summary>What happens when I click?</summary><div>
      A three-line file is committed to <code>${h(path)}</code> in <code>${h(T.repo)}</code> with the token stored in
      this browser. Git records you as the author and the time; the file records which text you accepted.
      ${record.kind === "spec" ? `The same commit replaces the section in <code>${h(record.target)}</code> with the proposal,
      byte for byte, and adds the decision to the queue's <code>entscheidungen.md</code>. If the proposal or the SPEC
      section changed since this page loaded, nothing is written and the page shows the new state.`
        : `Nothing else is changed. If the text changed since this page loaded, nothing is written.${record.kind === "use-case" ? ""
          : " The requirements and use cases this file names are checked again on the commit written on; if one is no longer accepted there, nothing is written."}`}
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

export function editPanel(app, path, text, blob) {
  const route = writeRoute(app.T.product, app.token());
  return `
  <section class="panel edit" hidden>
    <h3>Edit</h3>
    <p class="muted">${route === "commit"
      ? `Change the text with a live preview; <strong>Save</strong> commits it to <code>${h(path)}</code> under your account.`
      : route === "token-step" ? "Change the text with a live preview. There is no Save without this project's token."
      : `Change the text with a live preview. Without a stored token, <strong>Copy &amp; open GitHub editor</strong> copies your
        text and opens GitHub's editor for <code>${h(path)}</code>: select all, paste, commit. A token in <a href="#settings">Settings</a>
        makes this one click.`} After saving, the file has a new SHA and is reviewed again.</p>
    ${route === "token-step" ? gitlabTokenNeeded(app, "Saving") : ""}
    <div class="editor">
      <textarea spellcheck="false" aria-label="Edited text">${h(text)}</textarea>
      <div class="preview md"></div>
    </div>
    <p>
      ${route === "commit" ? `<button class="btn primary" data-edit-save="${h(path)}">Save</button>`
        : route === "github-web" ? `<button class="btn primary" data-edit-commit="${h(path)}">Copy &amp; open GitHub editor ↗</button>` : ""}
      <button class="btn" data-edit-diff>Show difference</button>
      <button class="btn" data-edit-reset>Reset</button>
    </p>
    <p class="result muted"></p>
    <div class="edit-diff"></div>
  </section>`.replace('data-edit-save="', `data-edit-blob="${h(blob || "")}" data-edit-save="`);
}

// ---------------------------------------------------------------- ticks and acceptance (UC-006 4d, UC-008 3d)

export function tickBox(app, key) {
  return `<p><label><input type="checkbox" data-tick="${h(key)}" ${app.session.isTicked(key) ? "checked" : ""}>
    Tick for <em>Accept ticked</em></label></p>`;
}

// SEVERAL FILES ARE ACCEPTED IN ONE CLICK: the ticked files, and the one button that accepts them.
export function batchBar(app) {
  if (!app.token()) return "";
  const items = app.session.items(), gaps = missingNeeds(items);
  return `<section class="panel batch">
    <h3>Accept ticked</h3>
    <p>${items.length ? `Ticked: ${items.map((i) => h(itemLabel(i))).join(", ")}.`
      : "Nothing ticked. Open a use case, an architecture file or a SPEC entry and tick it to accept several in one commit."}</p>
    ${gaps.map((g) => `<p class="warn">${h(g.message)}</p>`).join("")}
    <p><button class="btn primary" data-accept-ticked ${items.length && !gaps.length ? "" : "disabled"}>Accept ticked (${items.length})</button></p>
    <p class="result muted"></p>
    <details class="explain"><summary>What happens when I click?</summary><div>
      One commit under your account holds one approval record per ticked file, each naming the text this page
      showed you. Ticked SPEC entries are written into the SPEC in the order of their queue's index, with their
      decisions. A file that changed after it was shown is left out and named; the others are still accepted.</div></details>
  </section>`;
}

async function runAccept(app, ev, items, b, out) {
  const { T, session } = app;
  b.disabled = true;
  out.textContent = "Checking the current texts and committing…";
  try {
    const r = await acceptItems({ ...app.writeTarget(), branch: T.ref, token: app.token(), click: ev, items, readAt: app.readAt });
    session.untick([...r.accepted, ...r.leftOut.map((l) => l.label)]);
    app.setFlash((r.commit
      ? `Accepted ${h(r.accepted.join(", "))} — <a href="${h(r.commit.url)}" target="_blank" rel="noopener">commit ${h(r.commit.sha.slice(0, 7))}</a>.`
      : "Nothing was written.")
      + (r.warning ? `<br><strong class="warn">${h(r.warning)}</strong>` : "")
      + r.leftOut.map((l) => `<br>Left out <strong>${h(l.label)}</strong>: ${h(l.reason)}`).join("")
      + (r.leftOut.length ? "<br>Shown below is the current state; decide again on what you see now." : ""));
    out.textContent = "Reloading…";
    await app.reloadAndRoute();
  } catch (e) {
    app.noteRefusal(e);
    out.textContent = app.writeErrorText(e);
    b.disabled = false;
  }
}

// scope: the part of the page whose buttons are wired now — an accept panel shown later (after the impact list) is wired alone,
// so that no button of the page gets a second listener.
export function wireAccept(app, root, scope = root) {
  const { session } = app;
  scope.querySelectorAll("[data-accept-key]").forEach((b) => b.addEventListener("click", (ev) => {
    runAccept(app, ev, [session.get(b.dataset.acceptKey)], b, b.closest(".panel").querySelector(".result"));
  }));
  scope.querySelectorAll("[data-tick]").forEach((c) => c.addEventListener("change", () => {
    session.tick(c.dataset.tick, c.checked);
    const bar = root.querySelector(".panel.batch");
    if (bar) { bar.outerHTML = batchBar(app); wireBatch(app, root); }
  }));
  if (scope === root) wireBatch(app, root);
}

function wireBatch(app, root) {
  root.querySelector("[data-accept-ticked]")?.addEventListener("click", (ev) => {
    const b = ev.currentTarget;
    runAccept(app, ev, app.session.items(), b, b.closest(".panel").querySelector(".result"));
  });
}

// openedId: the identifier the file was opened with (AN EDITED FILE KEEPS ITS IDENTIFIER); null for a SPEC proposal.
export function wireCommon(app, root, original, openedId = null) {
  const { T, md, renderMermaid, diffHtml } = app;
  wireAccept(app, root);
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
      const c = await saveReviewedFile({ ...app.writeTarget(), branch: T.ref, token: app.token(), click: ev, path: b.dataset.editSave, text,
        openedId, expectBlob: b.dataset.editBlob || null });
      out.innerHTML = `Saved — <a href="${h(c.url)}" target="_blank" rel="noopener">commit ${h(c.sha.slice(0, 7))}</a>. Reloading…`;
      await app.reloadAndRoute();
    } catch (e) { app.noteRefusal(e); out.textContent = app.writeErrorText(e); b.disabled = false; }
  });
  ed.querySelector("[data-edit-commit]")?.addEventListener("click", async (ev) => {
    const text = ta.value.endsWith("\n") ? ta.value : ta.value + "\n";
    await navigator.clipboard.writeText(text);
    window.open(editUrl(T.repo, T.ref, ev.currentTarget.dataset.editCommit), "_blank", "noopener");
    ev.currentTarget.textContent = "Copied — paste in GitHub's editor, then commit ✓";
  });
}

// ---------------------------------------------------------------- views

export function counts(list) {
  const c = {};
  for (const x of list) c[x.status] = (c[x.status] || 0) + 1;
  return Object.entries(c).map(([k, v]) => `${badge(k)} ${v}`).join(" ");
}

// A tick in a list: only for a file this page has shown (UC-008 3d — each one read gets a tick).
export function tickCell(app, key, acceptable) {
  const { session } = app;
  if (!app.token()) return "";
  if (!acceptable) return "<td></td>";
  return session.wasShown(key)
    ? `<td><input type="checkbox" data-tick="${h(key)}" ${session.isTicked(key) ? "checked" : ""} aria-label="Tick for Accept ticked"></td>`
    : `<td class="muted small" title="Open it first — only what you have read can be ticked">—</td>`;
}
const ucItem = (u) => ({ kind: "use-case", id: u.fields.id, path: u.path, blob: u.blob });

// The use cases read for the list: the text of each, its status from the records' names — or, once opened on this page, from
// the records themselves.
async function viewUseCases(app) {
  const { T, GITLAB, session, verified, main, md, renderMermaid } = app;
  const seq = app.seq();
  const [read, overview] = await Promise.all([useCases(app), app.fileText("docs/use-cases/README.md")]);
  if (seq !== app.seq()) return;
  const list = read.map((u) => ({ ...u, status: verified.get(u.path) ?? u.status }));
  const rows = list.map((u) => `
    <tr>
      ${tickCell(app, session.key(ucItem(u)), u.status !== "accepted")}
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.id)}</a></td>
      <td><a href="#uc/${h(u.fields.id)}">${h(u.fields.title)}</a></td>
      <td>${h(u.fields.area)}</td>
      <td>${Array.isArray(u.fields.realises) ? u.fields.realises.length : 0}</td>
      <td>${badge(u.status)}</td>
    </tr>`).join("");
  main().innerHTML = `
    ${GITLAB ? (app.token() ? "" : `<section class="panel setup-banner"><h3>Read-only: no token for this GitLab project</h3>
      <p>This browser has no project token for <strong>${h(T.product.address)}</strong>. You can read and review; accepting and
      editing need the token.</p><p><a class="btn primary" href="${h(app.tokenStepLink())}">Store the project's token</a>
      <a class="btn" href="#settings">Import settings</a></p></section>`)
    : app.ghToken() ? "" : `<section class="panel setup-banner"><h3>Finish setting up your instance</h3>
      <p>This browser has no key for <strong>${h(T.instance)}</strong> yet. Without one you can read and review;
      accepting and editing then go through GitHub's own pages, and products cannot be added.</p>
      <p><a class="btn primary" href="#setup">Set up now</a> <a class="btn" href="#settings">Import settings</a>
        <span class="muted small">— from a file exported in another browser (Settings → Export settings).</span></p></section>`}
    <section class="head"><h2>Use cases</h2><p>${counts(list)}</p>${reviewAllLink("uc", list)}</section>
    ${batchBar(app)}
    <table class="list"><thead><tr>${app.token() ? "<th>Tick</th>" : ""}<th>ID</th><th>Title</th><th>Area</th><th>Realises</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    ${overview ? `<section class="md overview">${md(overview)}</section>` : ""}`;
  wireAccept(app, main());
  await renderMermaid(main());
}

// One use case: its text, and its records — read here, so that its status is what their content says, not their names.
async function viewUseCase(app, id) {
  const { T, SERVER, state, main, md, renderMermaid } = app;
  const seq = app.seq();
  const entries = ucEntries(app);
  // By the identifier in its file name; a use case whose front matter names another one is found among all of them.
  const e = entries.find((x) => reviewedId(x.path) === id) ?? (await useCases(app)).find((x) => x.fields.id === id);
  if (!e) { main().innerHTML = `<p class="warn">No use case ${h(id)} on ${h(T.ref)}.</p>`; return; }
  const u = await app.once(`use-case:${e.path}`, () => loadUseCase(app, state.byPath.get(e.path), true));
  const ucId = u.fields.id || reviewedId(u.path);
  // Every record of this identifier, also those naming an earlier path of a renamed file.
  const approved = await app.recordsOf(ucId);
  if (seq !== app.seq()) return;
  const showDiff = u.status !== "accepted" && approved.length > 0;
  const idx = entries.findIndex((x) => x.path === u.path);
  const prev = reviewedId(entries[idx - 1]?.path), next = reviewedId(entries[idx + 1]?.path);
  main().innerHTML = `
    <p class="crumbs"><a href="#uc">← all use cases</a>
      ${prev ? `· <a href="#uc/${h(prev)}">← ${h(prev)}</a>` : ""}
      ${next ? `· <a href="#uc/${h(next)}">${h(next)} →</a>` : ""}</p>
    <section class="head">
      <h2>${h(u.fields.id)} ${h(u.fields.title)} ${badge(u.status)}</h2>
      <p class="meta">Area <strong>${h(u.fields.area)}</strong> ·
        Actors: ${(u.fields.actors || []).map(h).join(", ")} ·
        blob <code>${h(u.blob.slice(0, 12))}</code> ·
        <a href="${h(webFileUrl(T.product, T.ref, u.path))}" target="_blank" rel="noopener">file on ${h(SERVER)} ↗</a></p>
      ${u.treeBlob !== u.blob ? `<p class="warn">The SHA computed from the shown text differs from ${h(SERVER)}'s tree. Do not accept; reload.</p>` : ""}
    </section>
    ${showDiff ? `<section class="panel accepted-diff" id="accepted-diff"><h3>Changed since it was last accepted</h3>
      <p class="muted">Reading the last accepted text…</p></section>` : ""}
    <div class="cols">
      <article class="md doc">${md(u.body)}</article>
      <aside>
        <section class="panel"><h3>Realises</h3>
          <ul class="names">${(u.fields.realises || []).map((n) => `<li>${h(n)}</li>`).join("")}</ul>
          <p class="muted small">Requirement names from <a href="${h(webFileUrl(T.product, T.ref, "SPEC.md"))}" target="_blank" rel="noopener">SPEC.md ↗</a>.</p>
        </section>
        ${approved.length ? `<section class="panel"><h3>Approval records</h3><ul class="names">${approved.map((r) =>
          `<li><a href="${h(webFileUrl(T.product, T.ref, r._path))}" target="_blank" rel="noopener">${h(r._path.split("/").pop())}</a>
           ${r.blob === u.blob ? "— current text" : "— an earlier text"}${r.file !== u.path ? ", under an earlier file name" : ""}</li>`).join("")}</ul></section>` : ""}
        <section class="panel"><button class="btn" data-toggle-edit>Edit…</button></section>
        ${u.status === "accepted" ? "" : acceptPanel(app, useCaseRecord(u.path, u.blob), approvalPath(u.fields.id, u.blob), u.fields.id, ucItem(u))}
        ${batchBar(app)}
      </aside>
    </div>
    ${editPanel(app, u.path, u.text, u.blob)}`;
  wireCommon(app, main(), u.text, ucId);
  if (showDiff) fillAcceptedDiff(app, u, ucId);
  await renderMermaid(main());
}

// ---------------------------------------------------------------- architecture (SPEC §11; UC-022 step 8, 10; UC-023 steps 4–5)

// The accept panel while something the file names is open: no Accept that could be pressed, each open item named.
export function prerequisitesHtml(open) {
  if (!open.length) return "";
  return `<section class="panel accept blocked">
    <h3>Accept</h3>
    <p class="notice">This file can be accepted once everything it names is accepted. Still open:</p>
    <ul class="names">${open.map((o) => `<li><strong>${esc(o.name)}</strong> — ${esc(o.reason)}</li>`).join("")}</ul>
    <p><button class="btn primary" disabled>Accept</button></p>
    <details class="explain"><summary>What is this?</summary><div>An architecture decision or a module rests on the
      requirements and use cases it names (ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS). If one of them is still under review, the
      decision would be taken for a text that may still change. Accept the use cases on the <em>Use cases</em> tab and the
      requirements through <em>SPEC changes</em>, or edit this file so that it names only accepted ones.</div></details>
  </section>`;
}

// The impact list as the page shows it (UC-023 step 4).
export function impactHtml(imp) {
  const li = (xs) => (xs.length ? xs.map((x) => `<code>${esc(x)}</code>`).join(", ") : "—");
  const rows = imp.affected.map((a) => `<li><strong>${esc(a.id)}</strong>${a.breaks ? ` <span class="badge b-stale">breaks</span>` : ""}
      — ${esc(a.reasons.join("; "))}<br>
      <span class="small">Code: ${a.code.length ? li(a.code) : "<em>no code yet</em>"} · Tests: ${li(a.tests)}</span></li>`).join("");
  const n = imp.names;
  return `<h3>Impact of this change</h3>
    ${imp.removedInterfaces.length || imp.alteredInterfaces.length ? `<p class="small">Interfaces removed: ${li(imp.removedInterfaces)} ·
      altered: ${li(imp.alteredInterfaces)}</p>` : ""}
    <p class="small"><strong>Affected modules</strong></p>
    <ul class="names">${rows || "<li>none — no module follows this decision</li>"}</ul>
    <p class="small"><strong>Requirements and use cases</strong> — named before and now: ${li(n.kept)} · newly named: ${li(n.added)} ·
      no longer named: ${li(n.removed)}</p>
    <details class="explain"><summary>What is this?</summary><div>Before a change to an accepted decision or module is accepted,
      the dashboard derives from the repository at the commit shown what hangs on it (AN ARCHITECTURE CHANGE IS NOT ACCEPTED
      WITHOUT AN IMPACT LIST): the modules that follow the decision or use an interface the change alters or removes — those
      that use a removed one first, marked <em>breaks</em> —, the code files and tests that name each in a header line
      <code>Module: MOD-…</code>, and the requirements and use cases the file names. Accepting changes no code: the code still
      reflects the old architecture until an implementation job changes it.</div></details>`;
}

// A change to an accepted decision or module: accepted before under its identifier, not in this text — by the records read
// when the file is opened, by their names in a list.
const isArchChange = (f) => f.status !== "accepted" && (f.records ? f.records.length : f.named) > 0;
const archItem = (app, f, extra = {}) => ({ kind: f.arch.kind, id: f.arch.id, path: f.path, blob: f.blob,
  requires: app.prerequisitesOf(f).useCases, changed: isArchChange(f), ...extra });

async function viewArchitecture(app) {
  const { session, verified, main, md, renderMermaid, prerequisitesOf } = app;
  const seq = app.seq();
  const files = (await archFiles(app)).map((f) => ({ ...f, status: verified.get(f.path) ?? f.status }));
  await loadArchContext(app, files);
  if (seq !== app.seq()) return;
  const table = (kind, head, cols) => {
    const list = files.filter((f) => f.arch.kind === kind);
    if (!list.length) return `<p class="muted">None yet.</p>`;
    return `<table class="list"><thead><tr>${app.token() ? "<th>Tick</th>" : ""}<th>ID</th><th>Title</th>${head}<th>Status</th></tr></thead><tbody>
      ${list.map((f) => { const open = prerequisitesOf(f).open; return `<tr>
        ${tickCell(app, session.key(archItem(app, f)), f.status !== "accepted" && !open.length)}
        <td><a href="#arc/${h(f.arch.id)}">${h(f.arch.id)}</a></td>
        <td><a href="#arc/${h(f.arch.id)}">${h(f.arch.title)}</a>${f.arch.problems.length ? ` <span class="warn small">${h(f.arch.problems.length)} format problem(s)</span>` : ""}
          ${open.length ? `<br><span class="muted small">waits for ${open.map((o) => h(o.name)).join(", ")}</span>` : ""}</td>
        ${cols(f)}<td>${badge(f.status)}</td></tr>`; }).join("")}
      </tbody></table>`;
  };
  const mods = files.filter((f) => f.arch.kind === "module");
  main().innerHTML = `
    <section class="head"><h2>Architecture</h2><p>${counts(files)}</p>${reviewAllLink("arc", files)}
      <p class="muted">Architecture decisions (<code>ARC-&lt;nnn&gt;</code>) and modules (<code>MOD-&lt;slug&gt;</code>) in
      <code>docs/architecture/</code>, each accepted like a use case, once everything it names is accepted.</p>
      <details class="explain"><summary>What is this?</summary><div>A <em>decision</em> states its context, the decision, the
        alternatives weighed and the consequences, and names the requirements and use cases that force it. A <em>module</em> states
        its one responsibility, the interfaces it provides and those of other modules it uses, what it realises and which decisions
        it follows (book ch. 10). Each file is accepted by an approval record naming its exact text; a decision or module can be
        accepted only when every requirement and use case it names is accepted, and a change to an accepted one only beside its
        impact list.</div></details></section>
    ${batchBar(app)}
    <h3>Decisions</h3>
    ${table("architecture-decision", "<th>Forced by</th>", (f) => `<td>${f.arch.names.length}</td>`)}
    <h3>Modules</h3>
    ${table("module", "<th>Realises</th><th>Follows</th>", (f) => `<td>${f.arch.names.length}</td><td>${f.arch.follows.map(h).join(", ")}</td>`)}
    ${mods.length ? `<section class="panel"><h3>Components</h3>
      <div class="md">${md("```mermaid\n" + componentDiagram(mods.map((f) => f.arch)) + "```\n")}</div>
      <details class="explain"><summary>What is this?</summary><div>Computed from the modules' <code>uses</code> and
        <code>provides</code> at the commit shown: an arrow from a module to the module whose interface it uses. An interface that
        no module provides is drawn dashed and marked <em>missing</em>.</div></details></section>` : ""}`;
  wireAccept(app, main());
  await renderMermaid(main());
}

// The files every impact list reads: module headers of the code at the pinned commit, read once per commit — every code file
// of the tree, each kept in this browser by its blob SHA.
function headersAt(app) {
  const { headersCache, state } = app;
  if (!headersCache.has(state.commit)) {
    headersCache.set(state.commit, moduleHeaders({ paths: state.tree.map((e) => e.path), read: app.fileText })
      .catch((e) => { headersCache.delete(state.commit); throw e; }));
  }
  return headersCache.get(state.commit);
}

// AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST: derived beside the difference, and only then is Accept offered.
async function fillImpact(app, f) {
  const box = document.getElementById("impact"), acc = document.getElementById("arc-accept");
  if (!box) return;
  try {
    const [last, headers, all] = await Promise.all([lastAcceptedOf(app, f.arch.id), headersAt(app), archFiles(app)]);
    if (!document.body.contains(box) || !last) return;
    const imp = impactList({ before: parseArchitecture(last.record.file, last.text), after: f.arch,
      modules: all.map((x) => x.arch), headers });
    box.innerHTML = impactHtml(imp);
    if (acc) {
      acc.innerHTML = acceptPanel(app, reviewedRecord(f.path, f.blob), approvalPath(f.arch.id, f.blob), f.arch.id,
        archItem(app, f, { impactShown: true }));
      wireAccept(app, app.main(), acc);
    }
  } catch (e) {
    app.noteRefusal(e);
    if (document.body.contains(box)) box.innerHTML = `<h3>Impact of this change</h3><p class="warn">The impact list could not be derived:
      ${h(app.errorText(e))} — without it, this change cannot be accepted. Reload to try again.</p>`;
  }
}

// One architecture file: its text, its records — read here, so that its status is what their content says —, the SPEC and the
// use cases it names; every module and the code's headers only for a change, whose impact list needs them.
async function viewArchitectureFile(app, id) {
  const { T, SERVER, state, main, md, renderMermaid, prerequisitesOf } = app;
  const seq = app.seq();
  const entries = archEntries(app);
  const e = entries.find((x) => reviewedId(x.path) === id) ?? (await archFiles(app)).find((x) => x.arch.id === id);
  if (!e) { main().innerHTML = `<p class="warn">No architecture file ${h(id)} on ${h(T.ref)}.</p>`; return; }
  const f = await app.once(`architecture:${e.path}`, () => loadArch(app, state.byPath.get(e.path), true));
  await loadArchContext(app, [f]);
  if (seq !== app.seq()) return;
  const a = f.arch, pre = prerequisitesOf(f), approved = f.records;
  const change = isArchChange(f);
  const idx = entries.findIndex((x) => x.path === f.path);
  const prev = entries[idx - 1] && { arch: { id: reviewedId(entries[idx - 1].path) } };
  const next = entries[idx + 1] && { arch: { id: reviewedId(entries[idx + 1].path) } };
  const nameState = (n) => { const o = pre.open.find((x) => x.name === n); return o ? ` <span class="warn small">${h(o.reason)}</span>` : " ✓"; };
  const accept = f.status === "accepted" ? ""
    : pre.open.length ? prerequisitesHtml(pre.open)
    : change ? `<div id="arc-accept"><section class="panel accept"><h3>Accept ${h(a.id)}</h3>
        <p class="muted">Accept is offered once the impact list of this change is shown.</p></section></div>`
    : acceptPanel(app, reviewedRecord(f.path, f.blob), approvalPath(a.id, f.blob), a.id, archItem(app, f));
  main().innerHTML = `
    <p class="crumbs"><a href="#arc">← all architecture</a>
      ${prev ? `· <a href="#arc/${h(prev.arch.id)}">← ${h(prev.arch.id)}</a>` : ""}
      ${next ? `· <a href="#arc/${h(next.arch.id)}">${h(next.arch.id)} →</a>` : ""}</p>
    <section class="head">
      <h2>${h(a.id)} ${h(a.title)} ${badge(f.status)}</h2>
      <p class="meta">${a.kind === "module" ? "Module" : "Architecture decision"} ·
        blob <code>${h(f.blob.slice(0, 12))}</code> ·
        <a href="${h(webFileUrl(T.product, T.ref, f.path))}" target="_blank" rel="noopener">file on ${h(SERVER)} ↗</a></p>
      ${f.treeBlob !== f.blob ? `<p class="warn">The SHA computed from the shown text differs from ${h(SERVER)}'s tree. Do not accept; reload.</p>` : ""}
      ${a.problems.length ? `<p class="warn">${a.problems.map(h).join("<br>")}</p>` : ""}
    </section>
    ${change ? `<section class="panel accepted-diff" id="accepted-diff"><h3>Changed since it was last accepted</h3>
      <p class="muted">Reading the last accepted text…</p></section>
      <section class="panel impact" id="impact"><h3>Impact of this change</h3><p class="muted">Deriving the impact list…</p></section>` : ""}
    <div class="cols">
      <article class="md doc">${md(a.body)}</article>
      <aside>
        <section class="panel"><h3>${a.kind === "module" ? "Realises" : "Forced by"}</h3>
          <ul class="names">${a.names.map((n) => `<li>${h(n)}${nameState(n)}</li>`).join("") || "<li class=\"muted\">nothing</li>"}</ul>
          <p class="muted small">Requirement names from <a href="${h(webFileUrl(T.product, T.ref, "SPEC.md"))}" target="_blank" rel="noopener">SPEC.md ↗</a>;
            use cases on the <a href="#uc">Use cases</a> tab.</p>
        </section>
        ${a.kind === "module" ? `<section class="panel"><h3>Interfaces</h3>
          <p class="small">Follows: ${a.follows.map((x) => `<a href="#arc/${h(x)}">${h(x)}</a>`).join(", ") || "—"}</p>
          <p class="small">Provides: ${a.provides.map((x) => `<code>${h(x)}</code>`).join(", ") || "—"}</p>
          <p class="small">Uses: ${a.uses.map((u) => `<code>${h(u.module)}.${h(u.iface)}</code>`).join(", ") || "—"}</p></section>` : ""}
        ${approved.length ? `<section class="panel"><h3>Approval records</h3><ul class="names">${approved.map((r) =>
          `<li><a href="${h(webFileUrl(T.product, T.ref, r._path))}" target="_blank" rel="noopener">${h(r._path.split("/").pop())}</a>
           ${r.blob === f.blob ? "— current text" : "— an earlier text"}${r.file !== f.path ? ", under an earlier file name" : ""}</li>`).join("")}</ul></section>` : ""}
        <section class="panel"><button class="btn" data-toggle-edit>Edit…</button></section>
        ${accept}
        ${batchBar(app)}
      </aside>
    </div>
    ${editPanel(app, f.path, f.text, f.blob)}`;
  wireCommon(app, main(), f.text, a.id);
  if (change) { fillAcceptedDiff(app, f, a.id); fillImpact(app, f); }
  await renderMermaid(main());
}

// ---------------------------------------------------------------- review pages (SPEC §10 SEVERAL FILES ARE ACCEPTED IN ONE CLICK;
// UC-008 3e, UC-022 step 10, UC-023 step 5)
//
// One page per area shows every file that is not accepted, one after the other: a changed one as its difference to the text its
// most recent approval record names (the single view's diff), with an architecture change's impact list; a new one in full; a
// withdrawn decision or module with its note. Below them, one button accepts every file the page counted (review-core.mjs
// reviewPage), through acceptItems as Accept ticked does: re-read at the head, a file changed since left out and named. Reads:
// each file's status from the names in the tree, so that an accepted file is not read; the text and records of each file shown;
// for a change its last accepted text — and, in the architecture, every module and the code's headers, which its impact list needs.

const AREAS = { uc: { name: "use cases", one: "use case" }, arc: { name: "architecture", one: "decision or module" } };

function reviewAllLink(area, list) {
  const n = list.filter((x) => x.status !== "accepted").length;
  return n ? `<p><a class="btn primary" href="#review/${area}">Review all ${n} open</a>
    <span class="muted small">— every ${AREAS[area].one} not accepted on one page, accepted with one click</span></p>` : "";
}

// The tree's files of an area whose current blob no record names — by the records' names; no file is read for this.
async function notAccepted(app, entries) {
  const st = await Promise.all(entries.map((e) => app.statusOf(e.path, e.sha)));
  return entries.filter((_, i) => st[i].status !== "accepted");
}

// One file of the page: the item Accept all would accept (naming the blob of the text rendered here), what it waits for, and what
// is shown — its difference to the last accepted text, or its text.
async function reviewUseCase(app, e) {
  const { SERVER } = app;
  const u = await app.once(`review-file:${e.path}`, () => loadUseCase(app, e));
  const id = u.fields.id || reviewedId(u.path);
  const x = { item: { ...ucItem(u), id }, status: app.verified.get(u.path) ?? u.status, open: [], problem: null, id, path: u.path,
    title: u.fields.title, href: `#uc/${id}`, kind: "Use case", text: u.text, body: u.body, blob: u.blob };
  if (u.treeBlob !== u.blob) x.problem = `the text read differs from ${SERVER}'s tree — reload the page`;
  if (x.status === "accepted") return x;
  try {
    if ((await app.recordsOf(id)).length) x.last = await lastAcceptedOf(app, id);
  } catch (err) { app.noteRefusal(err); x.problem = `its last accepted text could not be read: ${app.errorText(err)}`; }
  return x;
}

async function reviewArch(app, f, modules) {
  const { SERVER } = app;
  const a = f.arch, x = { status: app.verified.get(f.path) ?? f.status, open: app.prerequisitesOf(f).open, problem: null, id: a.id,
    path: f.path, title: a.title, href: `#arc/${a.id}`, kind: a.kind === "module" ? "Module" : "Architecture decision", text: f.text,
    body: a.body, blob: f.blob, withdrawn: a.withdrawn };
  if (f.treeBlob !== f.blob) x.problem = `the text read differs from ${SERVER}'s tree — reload the page`;
  let impactShown = false;
  if (isArchChange(f) && x.status !== "accepted") {
    try {
      x.last = await lastAcceptedOf(app, a.id);
      x.impact = impactList({ before: parseArchitecture(x.last.record.file, x.last.text), after: a, modules: modules.files.map((m) => m.arch),
        headers: modules.headers });
      impactShown = true;
    } catch (err) { app.noteRefusal(err); x.problem = `its difference and impact list could not be derived: ${app.errorText(err)}`; }
  }
  x.item = archItem(app, f, impactShown ? { impactShown } : {});
  return x;
}

function reviewSectionHtml(app, x, blocked) {
  const { T, SERVER, md, diffHtml } = app;
  const why = blocked && (blocked.problem
    ? `<p class="warn"><strong>Not counted</strong> — ${h(blocked.problem)}.</p>`
    : `<p class="warn"><strong>Not counted</strong> — it can be accepted once everything it names is accepted. Still open:
      ${blocked.open.map((o) => `<strong>${h(o.name)}</strong> (${h(o.reason)})`).join(", ")}.</p>`);
  const w = x.withdrawn;
  const r = x.last?.record;
  return `<section class="panel review-file" id="review-${h(x.id)}">
    <h3><a href="${h(x.href)}">${h(x.id)}</a> ${h(x.title)} ${badge(x.status)}</h3>
    <p class="meta">${h(x.kind)} · blob <code>${h(x.blob.slice(0, 12))}</code> ·
      <a href="${h(webFileUrl(T.product, T.ref, x.path))}" target="_blank" rel="noopener">file on ${h(SERVER)} ↗</a></p>
    ${why || ""}
    ${w ? `<div class="notice withdrawn"><p><strong>Withdrawn</strong> on ${h(w.date)}${w.replacedBy
      ? ` — replaced by <a href="#arc/${h(w.replacedBy)}">${h(w.replacedBy)}</a>` : ""}.</p>${w.note ? md(w.note) : ""}</div>` : ""}
    ${x.last ? `<h4>Changed since it was last accepted</h4>
      <p class="muted small">Difference between the text accepted in
        <a href="${h(webFileUrl(T.product, T.ref, r._path))}" target="_blank" rel="noopener">${h(r._path.split("/").pop())}</a>
        (blob <code>${h(r.blob.slice(0, 12))}</code>${r.file !== x.path ? `, then named <code>${h(r.file.split("/").pop())}</code>` : ""}) and the
        text now.</p>
      ${diffHtml(x.last.text, x.text)}`
    : `<article class="md doc">${md(x.body)}</article>`}
    ${x.impact ? `<div class="impact">${impactHtml(x.impact)}</div>` : ""}
  </section>`;
}

function acceptAllPanel(app, page) {
  const { T, SERVER } = app;
  const n = page.items.length, route = writeRoute(T.product, app.token());
  const blocked = page.blocked.length ? `<p class="muted">Not counted: ${page.blocked.map((b) => `<strong>${h(b.label)}</strong>`).join(", ")}
    — each says above why.</p>` : "";
  const explain = `<details class="explain"><summary>What is this?</summary><div>The button accepts exactly what this page shows:
    one approval record per file counted above, each naming by its git blob SHA the very text this page rendered — the same record
    <em>Accept</em> commits on the file's own page. It is the same decision as accepting each file there: you read every text
    here, a changed one as its difference to what was accepted before, with its impact list, and nothing you did not see is
    accepted. Before the commit each file is read again on the branch; one that changed after this page was built is left out and
    named, and so is a file whose requirements or use cases are no longer accepted there. A file that waits for something still
    open is shown but not counted.</div></details>`;
  if (route === "token-step") return `<section class="panel accept accept-all"><h3>Accept all ${n} shown</h3>${gitlabTokenNeeded(app, "Accepting")}${blocked}${explain}</section>`;
  if (route === "commit") {
    return `<section class="panel accept accept-all"><h3>Accept all ${n} shown</h3>
      <p>One click commits ${n === 1 ? "one approval record" : `${n} approval records`} under your account on ${h(SERVER)}, in one commit:
      one per file counted above, each naming exactly the text shown here.</p>
      ${blocked}
      <p><button class="btn primary" data-accept-all ${n ? "" : "disabled"}>Accept all ${n} shown</button></p>
      <p class="result muted"></p>
      ${explain}
    </section>`;
  }
  // WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK: GitHub's page commits one new file at a time — one prefilled page per record.
  return `<section class="panel accept accept-all"><h3>Accept all ${n} shown</h3>
    <p>Without a token stored in this browser the dashboard cannot write one commit for all of them: GitHub's page commits one file
    at a time. Each record below opens prefilled; press <em>Commit changes…</em> there, then reload this page. A token in
    <a href="#settings">Settings</a> makes this one click.</p>
    <ol>${page.items.map((it) => {
      const path = approvalPath(it.id, it.blob), rec = it.kind === "use-case" ? useCaseRecord(it.path, it.blob) : reviewedRecord(it.path, it.blob);
      return `<li>${h(it.id)} — <a class="btn small" href="${h(newFileUrl(T.repo, T.ref, path, recordText(rec)))}" target="_blank"
        rel="noopener">Open in GitHub to commit ↗</a></li>`;
    }).join("")}</ol>
    ${blocked}
    ${explain}
  </section>`;
}

async function viewReviewAll(app, area) {
  const { main, renderMermaid } = app;
  const seq = app.seq();
  if (!AREAS[area]) { main().innerHTML = `<p class="warn">No review page for ${h(area)}.</p>`; return; }
  let shown;
  if (area === "uc") {
    shown = await Promise.all((await notAccepted(app, ucEntries(app))).map((e) => reviewUseCase(app, e)));
  } else {
    const files = await Promise.all((await notAccepted(app, archEntries(app))).map((e) =>
      app.once(`review-file:${e.path}`, () => loadArch(app, e))));
    // The records of each file decide whether it is a change: those of its identifier, also under an earlier file name.
    const open = await Promise.all(files.map(async (f) => ({ ...f, records: await app.recordsOf(f.arch.id) })));
    await loadArchContext(app, open);
    const changes = open.some((f) => (app.verified.get(f.path) ?? f.status) !== "accepted" && isArchChange(f));
    const [all, headers] = changes ? await Promise.all([archFiles(app), headersAt(app)]) : [[], []];
    shown = await Promise.all(open.map((f) => reviewArch(app, f, { files: all, headers })));
  }
  if (seq !== app.seq()) return;
  const page = reviewPage(shown);
  const blockedOf = new Map(page.blocked.map((b) => [b.label, b]));
  const A = AREAS[area];
  main().innerHTML = `
    <p class="crumbs"><a href="#${area}">← all ${h(A.name)}</a></p>
    <section class="head"><h2>Review all — ${h(A.name)}</h2>
      <p>${page.shown.length ? `${counts(page.shown)} · ${page.items.length} of ${page.shown.length} counted for <em>Accept all</em>`
        : `Nothing to review: every ${h(A.one)} is accepted.`}</p>
      <p class="muted">Every ${h(A.one)} that is not accepted, one after the other: a changed one as its difference to the text last
      accepted${area === "arc" ? ", with its impact list" : ""}, a new one in full${area === "arc" ? ", a withdrawn one with its note" : ""}.
      Accept all, at the bottom, accepts what this page shows.</p></section>
    ${page.shown.map((x) => reviewSectionHtml(app, x, blockedOf.get(itemLabel(x.item)))).join("")}
    ${page.shown.length ? acceptAllPanel(app, page) : ""}`;
  main().querySelector("[data-accept-all]")?.addEventListener("click", (ev) => {
    const b = ev.currentTarget;
    runAccept(app, ev, page.items, b, b.closest(".panel").querySelector(".result"));
  });
  await renderMermaid(main());
}

// ---------------------------------------------------------------- routes

export const routes = {
  uc: (app, a) => (a ? viewUseCase(app, decodeURIComponent(a)) : viewUseCases(app)),
  arc: (app, a) => (a ? viewArchitectureFile(app, decodeURIComponent(a)) : viewArchitecture(app)),
  review: (app, a) => viewReviewAll(app, a),
};
