// The flows the dashboard already carries out, one test per main and alternative flow of UC-001, UC-006 and UC-008 and of the
// built parts of UC-014 (Finish setting up) and UC-042 (browser settings, export and import, pseudonymisation, collaborators).
// Characterisation tests (ITM-123, a refactoring job): they pin what the dashboard does today and were green from their first
// run. The real app (docs/assets/dashboard-app.mjs) runs in tests/app-harness.mjs against GitHub and GitLab fakes that record
// every request; every write is started by a click on the button that names it, with the event a person's click carries
// (isTrusted), and each write test has a counter-proof with a click a script makes. Run: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: UC-001; UC-006; UC-008; UC-014; UC-042; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; AN APPROVAL NAMES THE EXACT TEXT; STATUS IS DERIVED FROM THE RECORDS; EDITS ARE PREPARED ON THE DASHBOARD; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN EDITED FILE KEEPS ITS IDENTIFIER; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; A STALE APPROVAL IS NOT APPLIED; A QUEUE IS ACCEPTED IN ITS ORDER; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; A SPEC EDIT IS SAVED AS A PROPOSAL; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE SHARED PAGES ORIGIN IS DISCLOSED; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR; A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT STATES THAT IT CONTAINS SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
// Level: component
//
// Which flows are not carried out, and the counter-proof of every test here: docs/measurements/2026-10-01_built-flows-characterised.md.

import test from "node:test";
import assert from "node:assert/strict";
import {
  repoServer, fakeCaches, openDashboard, REPO, TOKEN, richDocument, press, settle, reEsc, unesc, attrOf,
} from "./app-harness.mjs";
import { gitBlobSha, recordText, useCaseRecord, approvalPath, specRecord } from "../docs/assets/review-core.mjs";
import { exportSettings } from "../docs/assets/settings-store.mjs";
import { B_SPEC, B_P05, B_P06, B_INDEX, QD, GL, GL_ADDR, GL_TOKEN, fakeGitLab } from "./review-core.d/helpers.mjs";

const TRUSTED = { isTrusted: true }, SCRIPTED = { isTrusted: false };
const API = "https://api.github.com";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

// richDocument and press — what the harness's document lacks for these flows, and a person's click on what it adds — are in
// tests/app-harness.mjs, beside the harness, so that other tests of the dashboard's editor use them too.

// A checkbox ticked (or unticked) by a person.
async function tick(server, el, on = true) {
  el.checked = on;
  el.fire("change", {});
  await settle(server);
}
const inMain = (sel) => globalThis.document.getElementById("main").querySelector(sel);
const writesOf = (requests) => requests.filter((r) => /^write /.test(r));

// GitHub's contents API in its JSON form — what the write path asks for a file's current blob before it writes over it
// (A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE); the harness serves the raw form only.
const contentsJson = (srv, repo) => (url, init) => {
  if (init.method !== "GET" || url.origin !== API || init.headers?.Accept !== "application/vnd.github+json") return undefined;
  const m = new RegExp(`^/repos/${reEsc(repo)}/contents/(.+)$`).exec(url.pathname);
  if (!m) return undefined;
  const sha = srv().shas[m[1].split("/").map(decodeURIComponent).join("/")];
  return sha ? json({ sha }) : json({ message: "Not Found" }, 404);
};
// Every request's method, address and Authorization header, in order (answers nothing itself).
const recorder = (seen) => (url, init) => { seen.push({ method: init.method, url: url.href, auth: init.headers?.Authorization ?? null }); };

// The instance's repository on GitHub: the harness's server, with the contents API and a record of every request.
async function instance({ files, history = [], handlers = [] }) {
  const seen = [];
  let srv = null;
  srv = await repoServer({ files, history, handlers: [recorder(seen), ...handlers, contentsJson(() => srv, REPO)] });
  srv.seen = seen;
  return srv;
}

// ---------------------------------------------------------------- the instance's files

const ucText = (id, title, step) => `---\nid: ${id}\ntitle: ${title}\narea: review\nactors:\n  - Reviewer\nrealises:\n  - RULE ONE\n---\n` +
  `# ${id} ${title}\n\n## Main flow\n\n1. ${step}\n\n\`\`\`mermaid\nflowchart LR\n  R[Reviewer] --> D[Dashboard]\n\`\`\`\n`;
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const UC3 = "docs/use-cases/UC-003-edit-a-file.md";
const UC3_ACCEPTED = ucText("UC-003", "Edit a file", "The reviewer edits the file.");
const QNAME = QD.split("/").pop();

// UC-001 accepted; UC-002 never accepted; UC-003 accepted in an earlier text and changed since. The SPEC and one queue: entry
// 05 replaces section 10 and creates the heading of section 11, which entry 06 replaces.
async function instanceFiles(over = {}) {
  const f = {
    "SPEC.md": B_SPEC,
    [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/05-a.begruendung.md`]: "# Why 05\n\nSection ten is out of date.\n",
    [`${QD}/06-b.md`]: B_P06, [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
    "docs/use-cases/README.md": "# Use cases\n", "docs/approvals/README.md": "# Approval records\n",
    [UC1]: ucText("UC-001", "Read a file", "The reviewer opens the file."),
    [UC2]: ucText("UC-002", "Show the status", "The dashboard shows the status."),
    [UC3]: ucText("UC-003", "Edit a file", "The reviewer edits the file and saves it."),
    ...over,
  };
  for (const [p, t] of [[UC1, f[UC1]], [UC3, UC3_ACCEPTED]]) {
    const b = await gitBlobSha(t);
    f[approvalPath(p === UC1 ? "UC-001" : "UC-003", b)] = recordText(useCaseRecord(p, b));
  }
  return f;
}
const ucServer = async (over = {}, handlers = []) => instance({ files: await instanceFiles(over), history: [UC3_ACCEPTED], handlers });

// ================================================================ UC-008 Review and accept a use case

test("UC-008 step 1: the use cases are listed with the status derived from the records — open, accepted, changed since acceptance", async () => {
  const page = await openDashboard({ server: await ucServer(), hash: "#uc" });
  const row = (id) => page.main().split("<tr>").find((r) => r.includes(`#uc/${id}"`));
  assert.match(row("UC-001"), /class="badge b-accepted"/);
  assert.match(row("UC-002"), /class="badge b-open"/);
  assert.match(row("UC-003"), /class="badge b-changed"/);
});

test("UC-008 main flow: a use case is shown with its text and diagram; one trusted click on Accept commits the record naming the shown text, and the page shows it accepted", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  const html = page.main();
  assert.match(html, /<h2>UC-002 Show the status <span class="badge b-open"/);
  assert.match(html, /The dashboard shows the status\./, "the text, rendered");
  assert.match(html, /<code class="language-mermaid">flowchart LR/, "the diagram, handed to Mermaid");
  assert.match(html, /<button class="btn primary" data-accept-key="[^"]+">Accept<\/button>/);
  assert.deepEqual(srv.writes, [], "opening writes nothing");
  const made = await page.click("[data-accept-key]");
  const blob = await gitBlobSha(srv.files[UC2]);
  assert.equal(srv.writes.length, 1, "one commit");
  assert.deepEqual(srv.writes[0].files, { [approvalPath("UC-002", blob)]: recordText(useCaseRecord(UC2, blob)) });
  assert.equal(recordText(useCaseRecord(UC2, blob)).trim().split("\n").length, 3, "a three-line record");
  assert.match(srv.writes[0].message, /accept UC-002/);
  assert.deepEqual(writesOf(made), ["write tree", "write commit", "write ref"]);
  // Under the reviewer's own account: every request of the commit carries the stored token.
  const commitRequests = srv.seen.filter((r) => r.method !== "GET");
  assert.ok(commitRequests.length === 3 && commitRequests.every((r) => r.auth === `Bearer ${TOKEN}`), JSON.stringify(commitRequests));
  // The page reads the new commit and shows the use case accepted, without an Accept.
  assert.match(page.main(), /<h2>UC-002 Show the status <span class="badge b-accepted"/);
  assert.doesNotMatch(page.main(), /data-accept-key/);
  assert.match(page.main(), /Accepted UC-002/);
});

test("UC-008 counter-proof: a click a script makes on Accept writes and reads nothing", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  assert.deepEqual(await page.click("[data-accept-key]", SCRIPTED), []);
  assert.deepEqual(srv.writes, []);
});

test("UC-008 2a: a use case changed since acceptance is shown with the difference to the text its last record names", async () => {
  const page = await openDashboard({ server: await ucServer(), hash: "#uc/UC-003" });
  assert.match(page.main(), /<h2>UC-003 Edit a file <span class="badge b-changed"/);
  const diff = page.el("accepted-diff");
  assert.match(diff, /Changed since it was last accepted/);
  assert.match(diff, /<span class="ddel">- 1\. The reviewer edits the file\.<\/span>/);
  assert.match(diff, /<span class="dadd">\+ 1\. The reviewer edits the file and saves it\.<\/span>/);
});

test("UC-008 5a: a file edited after acceptance shows as changed — no status was reset by anyone", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc/UC-001" });
  assert.match(page.main(), /badge b-accepted/);
  await srv.change(UC1, srv.files[UC1] + "\nOne more line.\n");
  const again = await openDashboard({ server: srv, hash: "#uc/UC-001" });
  assert.match(again.main(), /<h2>UC-001 Read a file <span class="badge b-changed"/);
  assert.match(again.main(), /data-accept-key/, "it can be accepted again");
});

test("UC-008 3a: Edit opens the editor with a preview; Save commits the edited text, and the use case is shown again with its new SHA, open", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  await page.go("#uc/UC-002");
  await page.click("[data-toggle-edit]");
  const ed = dom.edit();
  assert.equal(ed.hidden, false, "the editor is open");
  assert.match(ed.querySelector(".preview").innerHTML, /The dashboard shows the status\./, "the live preview");
  const ta = ed.querySelector("textarea");
  assert.equal(ta.value, srv.files[UC2], "the editor holds the file's text");
  const edited = srv.files[UC2].replace("shows the status.", "shows the status and the date.");
  ta.value = edited;
  const before = await gitBlobSha(srv.files[UC2]);
  await press(srv, inMain("[data-edit-save]"));
  assert.equal(srv.writes.length, 1);
  assert.deepEqual(srv.writes[0].files, { [UC2]: edited });
  assert.match(srv.writes[0].message, /edit UC-002-show-the-status\.md/);
  assert.ok(srv.seen.some((r) => r.method === "GET" && r.url.includes(`/contents/${UC2}?ref=`)), "the file's blob is checked before writing");
  const after = await gitBlobSha(edited);
  assert.notEqual(after, before);
  assert.match(page.main(), /shows the status and the date\./);
  assert.match(page.main(), new RegExp(`blob <code>${after.slice(0, 12)}</code>`));
  assert.match(page.main(), /<h2>UC-002 Show the status <span class="badge b-open"/);
});

test("UC-008 3a counter-proof: a click a script makes on Save writes nothing", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  await page.go("#uc/UC-002");
  dom.edit().querySelector("textarea").value = srv.files[UC2] + "\nmore\n";
  assert.deepEqual(writesOf(await press(srv, inMain("[data-edit-save]"), SCRIPTED)), []);
  assert.deepEqual(srv.writes, []);
});

test("UC-008 3a: an edit that changes the identifier is refused before anything is sent, and the edit stays in the editor", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  await page.go("#uc/UC-002");
  const ta = dom.edit().querySelector("textarea");
  ta.value = srv.files[UC2].replace("id: UC-002", "id: UC-099");
  const made = await press(srv, inMain("[data-edit-save]"));
  assert.deepEqual(made, [], "nothing is sent");
  assert.deepEqual(srv.writes, []);
  assert.match(dom.edit().querySelector(".result").textContent, /UC-002/);
  assert.match(ta.value, /id: UC-099/, "the edit is kept");
});

test("UC-008 3a: a save is refused when the file changed after the editor opened — nothing is written, the edit stays in the editor", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  await page.go("#uc/UC-002");
  const ta = dom.edit().querySelector("textarea");
  const edited = srv.files[UC2] + "\nMy edit.\n";
  ta.value = edited;
  await srv.change(UC2, srv.files[UC2] + "\nSomeone else's edit.\n");
  await press(srv, inMain("[data-edit-save]"));
  assert.deepEqual(srv.writes, []);
  assert.match(dom.edit().querySelector(".result").textContent, /changed since you opened it/);
  assert.equal(ta.value, edited, "the edit is kept");
});

test("UC-008 3d: each use case read gets a tick; Accept ticked writes one commit with one record per ticked file, naming the text shown", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  assert.doesNotMatch(page.main(), /data-tick=/, "a use case not opened on this page cannot be ticked");
  assert.match(page.main(), /data-accept-ticked disabled>Accept ticked \(0\)/);
  for (const id of ["UC-002", "UC-003"]) {
    await page.go(`#uc/${id}`);
    await tick(srv, inMain("[data-tick]"));
  }
  await page.go("#uc");
  assert.match(page.main(), /Ticked: UC-002, UC-003\./);
  await press(srv, inMain("[data-accept-ticked]"));
  assert.equal(srv.writes.length, 1, "one commit");
  const want = {};
  for (const [id, p] of [["UC-002", UC2], ["UC-003", UC3]]) {
    const b = await gitBlobSha(srv.files[p]);
    want[approvalPath(id, b)] = recordText(useCaseRecord(p, b));
  }
  assert.deepEqual(srv.writes[0].files, want);
});

test("UC-008 3d counter-proof: a ticked use case changed after it was shown is left out and named; the other is accepted", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  for (const id of ["UC-002", "UC-003"]) {
    await page.go(`#uc/${id}`);
    await tick(srv, inMain("[data-tick]"));
  }
  await page.go("#uc");
  await srv.change(UC3, srv.files[UC3] + "\nEdited meanwhile.\n");
  await press(srv, inMain("[data-accept-ticked]"));
  const b2 = await gitBlobSha(srv.files[UC2]);
  assert.deepEqual(Object.keys(srv.writes[0].files), [approvalPath("UC-002", b2)]);
  assert.match(page.main(), /Left out <strong>UC-003<\/strong>: the file changed after it was shown/);
});

test("UC-008 3b: without a token, Accept is GitHub's new-file page prefilled with the record, with the record and path to copy; Edit copies the text and opens GitHub's editor", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc", token: null });
  richDocument();
  await page.go("#uc/UC-002");
  const blob = await gitBlobSha(srv.files[UC2]);
  const path = approvalPath("UC-002", blob), rec = recordText(useCaseRecord(UC2, blob));
  const html = page.main();
  const href = `https://github.com/${REPO}/new/main?filename=${encodeURIComponent(path)}&amp;value=${encodeURIComponent(rec)}`;
  assert.ok(html.includes(href), "the prefilled new-file page");
  assert.match(html, /Open in GitHub to commit ↗/);
  assert.ok(html.includes(`data-copy="${path}"`), "the path to copy");
  assert.ok(html.includes(`<pre class="record">${rec.replace(/\n$/, "")}`), "the record, shown");
  assert.doesNotMatch(html, /data-accept-key|data-edit-save/);
  // Editing: the edited text goes to the clipboard, and GitHub's editor of the file opens.
  const copied = [], opened = [];
  Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText: async (t) => { copied.push(t); } }, configurable: true });
  globalThis.open = (...a) => { opened.push(a); };
  try {
    await page.click("[data-edit-commit]");
  } finally { delete globalThis.navigator.clipboard; delete globalThis.open; }
  assert.deepEqual(copied, [srv.files[UC2]]);
  assert.deepEqual(opened, [[`https://github.com/${REPO}/edit/main/${UC2}`, "_blank", "noopener"]]);
  assert.deepEqual(srv.writes, [], "nothing is written by the dashboard");
  assert.ok(srv.requests.every((r) => !/^write /.test(r)));
});

test("UC-008 1a: a private repository is read with the stored token through the API; without a token the page says so and shows no use case", async () => {
  // A private repository: GitHub answers 404 to every request without the token.
  const priv = (url, init) => (!init.headers?.Authorization && ((url.origin === API && url.pathname.startsWith(`/repos/${REPO}`))
    || (url.origin === "https://raw.githubusercontent.com" && url.pathname.startsWith(`/${REPO}/`)))
    ? json({ message: "Not Found" }, 404) : undefined);
  const srv = await ucServer({}, [priv]);
  const withToken = await openDashboard({ server: srv, hash: "#uc" });
  assert.match(withToken.main(), /UC-002/);
  assert.ok(withToken.requests.some((r) => r === `file ${UC1}`), "the files are read");
  assert.ok(srv.seen.filter((r) => r.url.startsWith(`${API}/repos/${REPO}/contents/`)).every((r) => r.auth === `Bearer ${TOKEN}`),
    "through the API, with the token");
  assert.ok(!srv.seen.some((r) => r.url.startsWith("https://raw.githubusercontent.com/")), "never through the raw host");
  const without = await openDashboard({ server: await ucServer({}, [priv]), hash: "#uc", token: null });
  assert.match(without.main(), /Could not read akmaier\/agent-m @ main: 404/);
  assert.match(without.main(), /A private repository cannot be read without a token — add one in <a href="#settings">Settings<\/a>\./);
  assert.doesNotMatch(without.main(), /UC-002/);
});

test("UC-008 3c: a GitLab product without its project token is read, but offers no Accept and no Save — it links to the step that stores the token", async () => {
  const gl = await fakeGitLab({ files: { [UC2]: ucText("UC-002", "Show the status", "The dashboard shows the status.") } });
  const srv = await instance({ files: await instanceFiles(), handlers: [(url, init) => (url.origin === GL ? gl.fetchMock(url.href, init) : undefined)] });
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002", token: null, search: `?product=${encodeURIComponent(GL_ADDR)}` });
  const html = page.main();
  assert.match(html, /UC-002 Show the status/);
  assert.match(html, /Accepting on GitLab needs this project's own token/);
  assert.ok(html.includes(`href="#add/${encodeURIComponent(GL_ADDR)}"`), "the step that stores the project's token");
  assert.doesNotMatch(html, /data-accept-key|data-edit-save|data-edit-commit|github\.com\/[^"]*\/new\//);
  assert.ok(gl.calls.every((c) => c.method === "GET"), "only read");
  assert.ok(!srv.seen.some((r) => r.url.startsWith(`${API}/repos/grp`)), "nothing of the product goes to GitHub");
});

// Changed by ITM-133 (UC-008 4a): the way through GitHub's page is offered as a link beside the refusal, not only named.
test("UC-008 4a: a commit the server refuses (no write access) writes nothing; the page says so and offers the way through GitHub's page as a link", async () => {
  const refuse = (url, init) => (init.method === "POST" && url.pathname.endsWith("/git/trees")
    ? json({ message: "Resource not accessible by personal access token" }, 403) : undefined);
  const srv = await ucServer({}, [refuse]);
  const page = await openDashboard({ server: srv, hash: "#uc/UC-002" });
  await page.click("[data-accept-key]");
  assert.deepEqual(srv.writes, []);
  const accept = inMain("[data-accept-key]");
  assert.equal(accept.disabled, false, "Accept can be pressed again");
  const result = accept.closest(".panel").querySelector(".result").innerHTML;
  assert.ok(result.startsWith(`Your token cannot write to ${REPO} (POST /git/trees: 403 Resource not accessible by personal access token). ` +
    "Extend it in Settings, or commit the record on GitHub&#39;s page instead"), result);
  assert.match(result, new RegExp(`href="https://github\\.com/${reEsc(REPO)}/new/main\\?filename=docs%2Fapprovals%2FUC-002-`));
});

// ================================================================ UC-006 Approve a specification change

const SECTION_10 = "## 10. R\n\nold ten\n";
const SPEC_HEAD = "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n";
const P05 = `${QD}/05-a.md`, P06 = `${QD}/06-b.md`, DECISIONS = `${QD}/entscheidungen.md`;
const ROW = /^\| \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC \| (\d+) \| uebernommen \| approval:(spec-[^ ]+\.md) \|$/;
const rowsOf = (text) => text.split("\n").filter((l) => l.startsWith("| 2")).map((l) => ROW.exec(l)).map((m) => m && [m[1], m[2]]);
async function specRecordFor(nr, proposalPath, proposalText, anchor, section) {
  const blob = await gitBlobSha(proposalText);
  const nn = String(nr).padStart(2, "0");
  return { path: approvalPath(`spec-${QNAME}-${nn}`, blob), text: recordText(specRecord({ queue: QD, entry: nr, proposal: proposalPath,
    blob, target: "SPEC.md", anchor, section: await gitBlobSha(section) })) };
}

test("UC-006 steps 1–2: an open entry is shown beside the SPEC section it replaces, with the difference and the rationale", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  const html = page.main();
  assert.match(html, new RegExp(`<h2>${reEsc(QNAME)} · 05 <span class="badge b-open"`));
  const now = html.indexOf("In the SPEC now"), proposed = html.indexOf("<h3>Proposed</h3>");
  assert.ok(now > 0 && proposed > now, "the current section beside the proposal");
  assert.match(html.slice(now, proposed), /old ten/);
  assert.match(html.slice(proposed), /new ten/);
  assert.match(html, /<span class="ddel">- old ten<\/span>/);
  assert.match(html, /<span class="dadd">\+ new ten<\/span>/);
  assert.match(html, /<h3>Rationale<\/h3>[^]*Section ten is out of date\./);
  assert.match(html, /<button class="btn primary" data-accept-key="[^"]+">Accept<\/button>/);
  assert.deepEqual(srv.writes, []);
});

test("UC-006 steps 4–7: one trusted click on Accept writes the record, the SPEC section byte for byte and the decision in one commit; the entry is then in SPEC", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  await page.click("[data-accept-key]");
  assert.equal(srv.writes.length, 1, "one commit");
  const w = srv.writes[0].files, rec = await specRecordFor(5, P05, B_P05, "## 10. R", SECTION_10);
  assert.deepEqual(Object.keys(w).sort(), [DECISIONS, "SPEC.md", rec.path].sort());
  assert.equal(w[rec.path], rec.text, "the record names the proposal and the section shown, by their blob SHAs");
  assert.equal(w["SPEC.md"], SPEC_HEAD + B_P05, "the section replaced by the proposal, byte for byte; the rest unchanged");
  assert.deepEqual(rowsOf(w[DECISIONS]), [["5", rec.path.split("/").pop()]]);
  assert.ok(w[DECISIONS].startsWith("# Decisions\n\nAppend-only.\n\n"), "the decision appended");
  assert.ok(srv.seen.filter((r) => r.method !== "GET").every((r) => r.auth === `Bearer ${TOKEN}`), "under the reviewer's own token");
  assert.match(page.main(), new RegExp(`<h2>${reEsc(QNAME)} · 05 <span class="badge b-applied"[^>]*>in SPEC</span>`));
  assert.doesNotMatch(page.main(), /data-accept-key/);
});

test("UC-006 counter-proof: a click a script makes on Accept writes and reads nothing", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  assert.deepEqual(await page.click("[data-accept-key]", SCRIPTED), []);
  assert.deepEqual(srv.writes, []);
});

test("UC-006 5a: the SPEC section changed after the entry was opened — nothing is written, and the page shows the new state", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  await srv.change("SPEC.md", B_SPEC.replace("old ten", "ten as someone else wrote it"));
  await page.click("[data-accept-key]");
  assert.deepEqual(srv.writes, []);
  assert.match(page.main(), new RegExp(`Nothing was written\\.<br>Left out <strong>${reEsc(QNAME)} 05</strong>: the SPEC section changed after it was shown`));
  assert.match(page.main(), /ten as someone else wrote it/, "the current text, to decide again");
});

test("UC-006 5a: the proposal changed after the entry was opened — nothing is written", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/05` });
  await srv.change(P05, B_P05.replace("new ten", "newer ten"));
  await page.click("[data-accept-key]");
  assert.deepEqual(srv.writes, []);
  assert.match(page.main(), /Left out <strong>[^<]+ 05<\/strong>: the proposal changed after it was shown/);
  assert.match(page.main(), /newer ten/);
});

test("UC-006 3a: the reviewer edits the proposal and saves — one commit of the proposal, the SPEC untouched; Accept then writes the new text", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#spec" });
  const dom = richDocument();
  await page.go(`#spec/${QNAME}/05`);
  await page.click("[data-toggle-edit]");
  const ta = dom.edit().querySelector("textarea");
  assert.equal(ta.value, B_P05);
  const edited = B_P05.replace("new ten", "new ten, reworded");
  ta.value = edited;
  await press(srv, inMain("[data-edit-save]"));
  assert.equal(srv.writes.length, 1);
  assert.deepEqual(srv.writes[0].files, { [P05]: edited }, "the proposal only");
  assert.equal(srv.files["SPEC.md"], B_SPEC, "SPEC.md byte-identical");
  assert.match(page.main(), /new ten, reworded/, "shown again with the new text");
  await page.click("[data-accept-key]");
  assert.equal(srv.writes.length, 2);
  assert.equal(srv.writes[1].files["SPEC.md"], SPEC_HEAD + edited, "Accept applies to the saved text");
});

test("UC-006 3a counter-proof: a click a script makes on Save writes nothing", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#spec" });
  const dom = richDocument();
  await page.go(`#spec/${QNAME}/05`);
  dom.edit().querySelector("textarea").value = "## 10. R\n\nanything\n";
  await press(srv, inMain("[data-edit-save]"), SCRIPTED);
  assert.deepEqual(srv.writes, []);
});

test("UC-006 4b: without a token, Accept opens GitHub's new-file page prefilled with the record; editing copies the text and opens GitHub's editor", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#spec", token: null });
  richDocument();
  await page.go(`#spec/${QNAME}/05`);
  const rec = await specRecordFor(5, P05, B_P05, "## 10. R", SECTION_10);
  const html = page.main();
  assert.ok(html.includes(`https://github.com/${REPO}/new/main?filename=${encodeURIComponent(rec.path)}&amp;value=${encodeURIComponent(rec.text)}`));
  assert.doesNotMatch(html, /data-accept-key|data-edit-save/);
  const copied = [], opened = [];
  Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText: async (t) => { copied.push(t); } }, configurable: true });
  globalThis.open = (...a) => { opened.push(a); };
  try {
    await page.click("[data-edit-commit]");
  } finally { delete globalThis.navigator.clipboard; delete globalThis.open; }
  assert.deepEqual(copied, [B_P05]);
  assert.deepEqual(opened, [[`https://github.com/${REPO}/edit/main/${P05}`, "_blank", "noopener"]]);
  assert.deepEqual(srv.writes, []);
});

test("UC-006 4d: an entry whose heading another creates is offered only together with it, naming it; Accept ticked writes both in the queue's order in one commit", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/06` });
  const html = page.main();
  assert.match(html, /its heading “## 11\. X” is created by entry 05 of this queue — accept it together with or after entry 05\./);
  assert.doesNotMatch(html, /data-accept-key/, "no Accept of its own");
  await tick(srv, inMain("[data-tick]"));
  await page.go(`#spec/${QNAME}/05`);
  await tick(srv, inMain("[data-tick]"));
  await page.go("#spec");
  assert.match(page.main(), /data-accept-ticked >Accept ticked \(2\)/);
  await press(srv, inMain("[data-accept-ticked]"));
  assert.equal(srv.writes.length, 1, "one commit");
  const w = srv.writes[0].files;
  const r05 = await specRecordFor(5, P05, B_P05, "## 10. R", SECTION_10);
  const r06 = await specRecordFor(6, P06, B_P06, "## 11. X", "## 11. X\n\n*(not yet approved)*\n");
  assert.equal(w["SPEC.md"], `${SPEC_HEAD}## 10. R\n\nnew ten\n\n${B_P06}`, "both sections, in the queue's order");
  assert.equal(w[r05.path], r05.text);
  assert.equal(w[r06.path], r06.text);
  assert.deepEqual(rowsOf(w[DECISIONS]).map(([nr]) => nr), ["5", "6"]);
});

test("UC-006 4d counter-proof: the dependent entry ticked alone cannot be accepted — the bar names the entry it needs", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: `#spec/${QNAME}/06` });
  await tick(srv, inMain("[data-tick]"));
  await page.go("#spec");
  assert.match(page.main(), /<p class="warn">[^<]*06: its heading “## 11\. X” is created by entry 05/);
  assert.match(page.main(), /data-accept-ticked disabled>Accept ticked \(1\)/);
  // Even a click on it writes and reads nothing.
  assert.deepEqual(writesOf(await page.click("[data-accept-ticked]")), []);
  assert.deepEqual(srv.writes, []);
});

// ================================================================ UC-001 Add a managed product

const PRODUCT = "alice/thesis", PRODUCT_ADDR = `https://github.com/${PRODUCT}`;
const LAYOUT = ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"];
const stored = (key) => globalThis.localStorage.getItem(key);

// The product's repository, a second server behind the instance's: GitHub's API under /repos/alice/thesis goes to it.
// refuse: its server refuses a write (403); missing: it does not exist (404 to everything).
async function withProduct(files, { refuse = false, missing = false } = {}) {
  let ps = null;
  const tree = (url, init) => (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`
    ? ps.fetch(`${API}/repos/${PRODUCT}/git/trees/${ps.head}?recursive=1`, init) : undefined);
  const refused = (url, init) => (refuse && init.method === "POST" && url.pathname === `/repos/${PRODUCT}/git/trees`
    ? json({ message: "Resource not accessible by personal access token" }, 403) : undefined);
  const gone = () => (missing ? json({ message: "Not Found" }, 404) : undefined);
  ps = await repoServer({ repo: PRODUCT, files, handlers: [gone, refused, tree] });
  const srv = await instance({ files: await instanceFiles(),
    handlers: [(url, init) => (url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`) ? ps.fetch(url.href, init) : undefined)] });
  return { srv, ps };
}
const addHash = (address) => `#add/${encodeURIComponent(address)}`;

test("UC-001 main flow: Step A names the token, the product and the instance; Check reads the product; one trusted click on Add product writes only the missing layout into the product and keeps its address in this browser", async () => {
  const { srv, ps } = await withProduct({ "README.md": "# Thesis\n", "SPEC.md": "# Thesis — its own SPEC\n", "docs/use-cases/UC-001-x.md": "x\n" });
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  const html = page.el("add-steps");
  assert.match(html, /<h3>Step A · Let your key reach the product<\/h3>/);
  assert.ok(html.includes('href="https://github.com/settings/personal-access-tokens"'), "Open your tokens on GitHub");
  assert.match(html, /Open your tokens on GitHub ↗/);
  assert.ok(html.includes("Click the token “Agent M · akmaier/agent-m”, then “Edit”."));
  assert.ok(html.includes("add “alice/thesis” — keep “akmaier/agent-m” selected."));
  assert.ok(html.includes("Press “Update” at the bottom. The token itself stays the same — nothing to copy, nothing to paste here."));
  assert.equal((html.match(/<summary>What is this\?<\/summary>/g) || []).length, 3, "every step explains itself");
  // Step B · Check: the product is read with the stored token.
  await press(srv, dom.byId("add-check-btn"));
  assert.equal(dom.byId("add-check").innerHTML, "✓ alice/thesis reachable — public, so write access is confirmed only by the first write");
  assert.ok(srv.seen.some((r) => r.url === `${API}/repos/${PRODUCT}` && r.auth === `Bearer ${TOKEN}`));
  assert.deepEqual(ps.writes, [], "checking writes nothing");
  // Step C · Add the product.
  await press(srv, dom.byId("add-go"));
  assert.equal(ps.writes.length, 1, "one commit into the product");
  assert.deepEqual(Object.keys(ps.writes[0].files).sort(), ["CHANGELOG.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md"],
    "only what is missing — the product's own SPEC and use cases are kept");
  assert.equal(ps.writes[0].message, "Add the Agent M review layout (Agent M dashboard)");
  assert.equal(ps.files["SPEC.md"], "# Thesis — its own SPEC\n");
  assert.deepEqual(srv.writes, [], "nothing is written into the instance");
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]), "the address, in this browser");
  const done = dom.byId("add-result").innerHTML;
  assert.ok(done.includes(`<a href="https://github.com/${PRODUCT}/commit/${ps.head}" target="_blank" rel="noopener">layout in alice/thesis</a>`), "the commit as a link");
  assert.ok(done.includes(`<a class="btn primary" href="?repo=alice%2Fthesis">Open alice/thesis →</a>`), "the switch to the new product");
  assert.match(page.el("product"), /<option value="https:\/\/github\.com\/alice\/thesis" >https:\/\/github\.com\/alice\/thesis<\/option>/);
});

test("UC-001 counter-proof: a click a script makes on Add product writes nothing, stores nothing and reads nothing", async () => {
  const { srv, ps } = await withProduct({ "README.md": "# Thesis\n" });
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  assert.deepEqual(await press(srv, dom.byId("add-go"), SCRIPTED), []);
  assert.deepEqual(ps.writes, []);
  assert.equal(stored("agent-m.products"), null);
});

test("UC-001 5b: a product that already has the whole layout gets no commit — only its address is kept in this browser", async () => {
  const files = Object.fromEntries(LAYOUT.map((p) => [p, `# ${p}\n`]));
  const { srv, ps } = await withProduct(files);
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  const made = await press(srv, dom.byId("add-go"));
  assert.deepEqual(writesOf(made), []);
  assert.deepEqual(ps.writes, []);
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]));
  assert.match(dom.byId("add-result").innerHTML, /^Done — nothing was missing in the product; https:\/\/github\.com\/alice\/thesis is now in this browser's product list\./);
});

test("UC-001 a product without any layout gets all of it in one commit", async () => {
  const { srv, ps } = await withProduct({ "README.md": "# Thesis\n" });
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  await press(srv, dom.byId("add-go"));
  assert.deepEqual(Object.keys(ps.writes[0].files).sort(), LAYOUT);
  assert.match(ps.writes[0].files["SPEC.md"], /^# alice\/thesis — Specification\n/);
});

test("UC-001 4a: the check fails — the page names the repository it cannot reach", async () => {
  const { srv } = await withProduct({}, { missing: true });
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  await press(srv, dom.byId("add-check-btn"));
  assert.match(dom.byId("add-check").innerHTML, /^✗ alice\/thesis: 404/);
  assert.match(page.el("add-steps"), /Step A · Let your key reach the product/, "Step A is on the page");
});

test("UC-001 5a: the write is refused although the read succeeded — nothing is written, nothing kept, and the page sends the author back to Step A", async () => {
  const { srv, ps } = await withProduct({ "README.md": "# Thesis\n" }, { refuse: true });
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  await press(srv, dom.byId("add-go"));
  assert.deepEqual(ps.writes, []);
  assert.equal(stored("agent-m.products"), null, "the list is unchanged");
  assert.equal(dom.byId("add-result").textContent, "Your key cannot write to alice/thesis yet (POST /git/trees: 403 Resource not " +
    "accessible by personal access token). Do Step A — add the product to your key on GitHub — and click again.");
  assert.equal(dom.byId("add-go").disabled, false, "Add product can be clicked again");
});

test("UC-001 3b: without a token the panel first shows the key setup naming both repositories; storing the key checks both, and then Add product writes the layout", async () => {
  const { srv, ps } = await withProduct({ "README.md": "# Thesis\n" });
  const page = await openDashboard({ server: srv, hash: "", token: null });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  const html = page.el("add-steps");
  assert.match(html, /<h3>Step A · Create your key on GitHub<\/h3>/);
  assert.ok(html.includes("Open “Select repositories” and pick “akmaier/agent-m” and “alice/thesis” — nothing else."));
  assert.match(html, /<h3>Step B · Give the key to Agent M<\/h3>/);
  assert.match(html, /every other GitHub Pages site of akmaier is served from the same address/i);
  assert.equal(dom.byId("add-go").disabled, true, "Add product waits for the key");
  assert.equal(dom.byId("key-store").disabled, true, "storing waits for the notice to be read");
  await tick(srv, dom.byId("key-ack"));
  const key = "github_pat_NEWKEY0123456789abcdefghij";
  dom.byId("key-token").value = key;
  await press(srv, dom.byId("key-store"));
  assert.equal(stored("agent-m.github-token"), key);
  assert.match(stored("agent-m.github-token-expires"), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(dom.byId("key-check").innerHTML, "✓ akmaier/agent-m reachable — public, so write access is confirmed only by the first write<br>" +
    "✓ alice/thesis reachable — public, so write access is confirmed only by the first write");
  assert.ok([`${API}/repos/${REPO}`, `${API}/repos/${PRODUCT}`].every((u) => srv.seen.some((r) => r.url === u && r.auth === `Bearer ${key}`)));
  assert.equal(dom.byId("add-go").disabled, false);
  await press(srv, dom.byId("add-go"));
  assert.deepEqual(Object.keys(ps.writes[0].files).sort(), LAYOUT);
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]));
});

test("UC-001 3b counter-proof: a click on Store and check without the notice ticked stores nothing", async () => {
  const { srv } = await withProduct({ "README.md": "# Thesis\n" });
  const page = await openDashboard({ server: srv, hash: "", token: null });
  const dom = richDocument();
  await page.go(addHash(PRODUCT_ADDR));
  dom.byId("key-token").value = "github_pat_NEWKEY0123456789abcdefghij";
  dom.byId("key-store").fire("click", TRUSTED);   // as if the disabled button were pressed anyway
  await settle(srv);
  assert.equal(stored("agent-m.github-token"), null);
});

test("UC-001 1a: in another browser the product list is empty — the selector offers the instance and + Add product only", async () => {
  const page = await openDashboard({ server: await ucServer(), hash: "#uc" });
  assert.equal(page.el("product"), `<option value="https://github.com/${REPO}" selected>${REPO} — this instance</option>` +
    `<option value="__add">+ Add product…</option>`);
});

// A GitLab server behind the instance's: requests to its origin go to it.
async function withGitLab(files = { "README.md": "# proj\n" }) {
  const gl = await fakeGitLab({ files });
  const srv = await instance({ files: await instanceFiles(), handlers: [(url, init) => (url.origin === GL ? gl.fetchMock(url.href, init) : undefined)] });
  return { srv, gl };
}

test("UC-001 3c: a GitLab product gets a project token of its own — Step A opens its Access tokens page, Step B stores the token for this project only, and Add product commits the layout there with it", async () => {
  const { srv, gl } = await withGitLab();
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(GL_ADDR));
  const html = page.el("add-steps");
  assert.match(html, /<h3>Step A · Create a key for this project<\/h3>/);
  assert.ok(html.includes(`href="${GL_ADDR}/-/settings/access_tokens"`));
  assert.ok(html.includes("Token name: Agent M."));
  assert.ok(html.includes("Select a role: Maintainer — GitLab lets only Maintainers push to a protected default branch. Select scopes: api — nothing else."));
  assert.equal(dom.byId("add-go").disabled, true);
  assert.ok(html.includes(`<p id="add-result" class="muted">Store the project's token in Step B first.</p>`));
  await tick(srv, dom.byId("gl-ack"));
  dom.byId("gl-token").value = GL_TOKEN;
  await press(srv, dom.byId("gl-store"));
  const tokens = JSON.parse(stored("agent-m.gitlab-tokens"));
  assert.deepEqual(Object.keys(tokens), [GL_ADDR], "stored for this project only");
  assert.equal(tokens[GL_ADDR].token, GL_TOKEN);
  assert.match(dom.byId("gl-check-out").innerHTML, /^✓ https:\/\/gitlab\.example\.org\/grp\/sub\/proj reachable — the token acts as Developer/);
  const from = gl.calls.length, before = srv.requests.length;
  await press(srv, dom.byId("add-go"));
  const posts = gl.calls.slice(from).filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "one commit");
  assert.deepEqual(posts[0].body.actions.map((a) => [a.action, a.file_path]).sort(), LAYOUT.map((p) => ["create", p]));
  assert.ok(gl.calls.every((c) => c.token === GL_TOKEN || c.token === undefined) && gl.calls.slice(from).every((c) => c.token === GL_TOKEN),
    "the project token, to its own project's API");
  assert.ok(gl.calls.every((c) => c.authorization === undefined), "never the GitHub token");
  assert.ok(srv.requests.slice(before).every((r) => r.startsWith(`handler `) && r.includes(GL)), "nothing to GitHub");
  assert.deepEqual(srv.writes, []);
  assert.equal(stored("agent-m.products"), JSON.stringify([GL_ADDR]));
});

test("UC-001 3c counter-proof: a GitHub token pasted as the project's token is refused and nothing is stored", async () => {
  const { srv } = await withGitLab();
  const page = await openDashboard({ server: srv, hash: "" });
  const dom = richDocument();
  await page.go(addHash(GL_ADDR));
  await tick(srv, dom.byId("gl-ack"));
  dom.byId("gl-token").value = TOKEN;
  await press(srv, dom.byId("gl-store"));
  assert.equal(stored("agent-m.gitlab-tokens"), null);
  assert.equal(dom.byId("gl-check-out").textContent, "That is a GitHub token. A GitLab product needs the project access token created on GitLab.");
});

test("UC-001 3d: the page says why a server may offer no project token or the author may not be Maintainer, and that a personal token is broader — the author decides", async () => {
  const { srv } = await withGitLab();
  const page = await openDashboard({ server: srv, hash: "" });
  richDocument();
  await page.go(addHash(GL_ADDR));
  const html = page.el("add-steps");
  assert.match(html, /<summary>The page offers no project access tokens, or you are not Maintainer<\/summary>/);
  assert.match(html, /gitlab\.example\.org is a self-managed GitLab: it offers project access tokens with any licence/);
  assert.match(html, /A personal access token would also work here, but it is broader: with scope api it reaches every project you can reach/);
  assert.match(html, /You decide\./);
});

// ================================================================ UC-014 Get your own Agent M — Finish setting up (steps 6–9)

const day = (days) => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()) + days * 864e5).toISOString().slice(0, 10); };
const agentKeys = () => Object.keys(Object.fromEntries([...Array(globalThis.localStorage.length).keys()]
  .map((i) => [globalThis.localStorage.key(i), 1]))).filter((k) => k.startsWith("agent-m.")).sort();

test("UC-014 step 6: without a token the start page shows Finish setting up, with Set up now and Import settings; with one it does not", async () => {
  const page = await openDashboard({ server: await ucServer(), hash: "#uc", token: null });
  assert.match(page.main(), /<h3>Finish setting up your instance<\/h3>/);
  assert.match(page.main(), /<a class="btn primary" href="#setup">Set up now<\/a> <a class="btn" href="#settings">Import settings<\/a>/);
  const set = await openDashboard({ server: await ucServer(), hash: "#uc" });
  assert.doesNotMatch(set.main(), /Finish setting up/);
});

test("UC-014 step 7: Step A opens GitHub's token page prefilled with name, description, 90 days and every permission, and says to select only the instance", async () => {
  const page = await openDashboard({ server: await ucServer(), hash: "#setup", token: null });
  const html = page.main();
  assert.match(html, /<h3>Step A · Create your key on GitHub<\/h3>/);
  const href = unesc(/href="(https:\/\/github\.com\/settings\/personal-access-tokens\/new\?[^"]+)"/.exec(html)[1]);
  const q = Object.fromEntries(new URL(href).searchParams);
  assert.deepEqual(q, { name: "Agent M · akmaier/agent-m",
    description: "Agent M dashboard of akmaier/agent-m: commits, issues, pull requests and runs of the work you start.",
    expires_in: "90", contents: "write", issues: "write", pull_requests: "write", actions: "write", workflows: "write", metadata: "read" });
  assert.ok(html.includes("Under “Repository access”, choose “Only select repositories”."));
  assert.ok(html.includes("Open “Select repositories” and pick “akmaier/agent-m” — nothing else."), "only the instance — products come later");
  for (const p of ["Contents", "Issues", "Pull requests", "Actions", "Workflows", "Metadata"]) assert.ok(html.includes(`<em>${p}</em>`), `why ${p}`);
  assert.equal((html.match(/<summary>What is this\?<\/summary>/g) || []).length, 2, "both steps explain themselves");
});

test("UC-014 steps 8–9: after the notice is ticked, the pasted token and its expiry date are stored, the instance is read with it, and the instance is ready", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc", token: null });
  const dom = richDocument();
  await page.go("#setup");
  assert.match(page.main(), /Everything Agent M stores in this browser is stored for the address https:\/\/akmaier\.github\.io/);
  assert.equal(dom.byId("key-expires").value, day(90), "preset to the 90 days of the prefilled link");
  assert.equal(dom.byId("key-store").disabled, true);
  await tick(srv, dom.byId("key-ack"));
  const key = "github_pat_MINE0123456789abcdefghijkl";
  dom.byId("key-token").value = key;
  dom.byId("key-expires").value = "2027-01-15";
  await press(srv, dom.byId("key-store"));
  assert.deepEqual(agentKeys(), ["agent-m.github-token", "agent-m.github-token-expires"], "one token, in this browser, and nothing else");
  assert.equal(stored("agent-m.github-token"), key);
  assert.equal(stored("agent-m.github-token-expires"), "2027-01-15", "the date as entered");
  assert.ok(srv.seen.some((r) => r.url === `${API}/repos/${REPO}` && r.auth === `Bearer ${key}`), "the instance is read with it");
  assert.equal(dom.byId("key-check").innerHTML, "✓ akmaier/agent-m reachable — public, so write access is confirmed only by the first write");
  assert.equal(dom.byId("setup-done").innerHTML, `<a class="btn primary" href="#uc">Your instance is ready →</a> <a class="btn" href="#add">+ Add a product</a>`);
  assert.deepEqual(srv.writes, []);
  await page.go("#uc");
  assert.doesNotMatch(page.main(), /Finish setting up/);
});

test("UC-014 step 8 counter-proof: a text that is no GitHub token is refused, and nothing is stored", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc", token: null });
  const dom = richDocument();
  await page.go("#setup");
  await tick(srv, dom.byId("key-ack"));
  dom.byId("key-token").value = "my password";
  await press(srv, dom.byId("key-store"));
  assert.deepEqual(agentKeys(), []);
  assert.equal(dom.byId("key-check").textContent, "That is not a GitHub token — it starts with github_pat_ and is long.");
});

// ================================================================ UC-042 Manage settings in one place

const confirms = [];
let confirmAnswer = true;
globalThis.confirm = (text) => { confirms.push(text); return confirmAnswer; };
// The settings page of a dashboard whose browser holds `entries` beside the token (set after the first load, before the page).
async function settingsPage({ server = null, entries = {}, token = TOKEN } = {}) {
  const srv = server ?? await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc", token });
  for (const [k, v] of Object.entries(entries)) globalThis.localStorage.setItem(k, v);
  const dom = richDocument();
  confirms.length = 0;
  confirmAnswer = true;
  await page.go("#settings");
  return { srv, page, dom, box: () => dom.byId("browser-settings"), product: () => dom.byId("product-settings") };
}
// A control of a part of the page, found as the view finds it: by the exact selector the view asks for (inBox), or — where the
// view takes every control of one attribute and picks one by its value — among those (among). The harness keeps one control per
// selector, so a listener sits on the control of the selector the view used; in a browser both are the same element.
const inBox = (el, sel) => el.querySelector(sel);
const among = (el, attr, value) => el.querySelectorAll(`[${attr}]`).find((c) => attrOf(c.tag, attr) === value) ?? null;
// Until `cond` holds — for work that waits on the browser's cryptography rather than on a request.
async function until(cond, what) {
  for (let i = 0; i < 4000; i++) { if (cond()) return; await new Promise((r) => setTimeout(r, 5)); }
  throw new Error(`waited in vain for ${what}`);
}

test("UC-042 step 1: one page — each browser setting is a line with its state, the token in a password field; the product's settings; export and import; clear everything", async () => {
  const { page, dom } = await settingsPage();
  const html = page.main(), browser = dom.byId("browser-settings").innerHTML;
  assert.match(html, /<h2>Settings<\/h2>/);
  assert.match(html, /<h3>Before you store anything<\/h3>[^]*every other GitHub Pages site of akmaier is served from the same address/i);
  assert.deepEqual([...browser.matchAll(/data-setting-row="([^"]+)"/g)].map((m) => m[1]),
    ["github-token", "products", "gitlab-tokens", "jump-host", "remote-sessions"]);
  assert.match(browser, /<p class="state">stored — not tested yet<\/p>/);
  assert.match(browser, /<input class="secret" type="password" readonly value="github_pat_HARNESS0123456789abcdefghij"/);
  assert.match(browser, /data-show="agent-m\.github-token">Show</);
  for (const b of ["data-test", "data-change", "data-clear"]) assert.ok(browser.includes(`${b}="agent-m.github-token"`), b);
  assert.match(html, /<h3>Export and import<\/h3>/);
  assert.match(html, /<h3>Clear everything in this browser<\/h3>/);
  assert.match(dom.byId("product-settings").innerHTML, /<h3>Product · https:\/\/github\.com\/akmaier\/agent-m<\/h3>[^]*Pseudonymisation — <span class="state">on \(the default\)<\/span>[^]*Collaborators — none named/);
  assert.equal((browser.match(/<summary>What is this\?<\/summary>/g) || []).length, 5, "every line explains itself");
});

test("UC-042 step 1: a stored secret is hidden until Show, which reveals it in full; Hide hides it again", async () => {
  const { srv, box } = await settingsPage();
  await press(srv, among(box(), "data-show", "agent-m.github-token"));
  assert.match(box().innerHTML, /<input class="secret" type="text" readonly value="github_pat_HARNESS0123456789abcdefghij"[^>]*> <button class="btn small" data-show="agent-m\.github-token">Hide</);
  await press(srv, among(box(), "data-show", "agent-m.github-token"));
  assert.match(box().innerHTML, /<input class="secret" type="password"/);
});

test("UC-042 step 2: Test sends one harmless request with the token to its own server and shows that it works", async () => {
  const { srv, box } = await settingsPage();
  const from = srv.seen.length;
  await press(srv, inBox(box(), '[data-test="agent-m.github-token"]'));
  assert.deepEqual(srv.seen.slice(from).map((r) => [r.method, r.url, r.auth]), [["GET", `${API}/repos/${REPO}`, `Bearer ${TOKEN}`]]);
  assert.match(box().innerHTML, new RegExp(`<p class="state">✓ works — tested ${day(0)}</p>`));
  assert.equal(inBox(box(), '[data-result="agent-m.github-token"]').textContent, "GitHub accepted the token: it can read akmaier/agent-m.");
});

test("UC-042 step 2: Clear removes the token from localStorage after one confirmation that says what no longer works", async () => {
  const { srv, box, dom } = await settingsPage({ entries: { "agent-m.github-token-expires": day(60) } });
  await press(srv, inBox(box(), '[data-clear="agent-m.github-token"]'));
  assert.deepEqual(confirms, ["Clear the GitHub token from this browser? Without it, accepting and editing go through GitHub's own pages, " +
    "products cannot be added, and private repositories cannot be read."]);
  assert.equal(stored("agent-m.github-token"), null);
  assert.equal(stored("agent-m.github-token-expires"), null, "its date with it");
  assert.equal(dom.byId("token-msg").textContent, "The token is gone from this browser.");
  assert.match(box().innerHTML, /<p class="state">— not set<\/p>/);
});

test("UC-042 step 2 counter-proof: a Clear that is not confirmed keeps the token", async () => {
  const { srv, box } = await settingsPage();
  confirmAnswer = false;
  await press(srv, inBox(box(), '[data-clear="agent-m.github-token"]'));
  assert.equal(confirms.length, 1);
  assert.equal(stored("agent-m.github-token"), TOKEN);
});

test("UC-042 step 2: Change stores a new token with its expiry date, after the notice at the top is ticked", async () => {
  const { srv, box, dom } = await settingsPage();
  assert.equal(dom.byId("token-change").hidden, true);
  await press(srv, inBox(box(), '[data-change="agent-m.github-token"]'));
  assert.equal(dom.byId("token-change").hidden, false, "the same fields as in the setup, in place");
  assert.equal(dom.byId("token-save").disabled, true, "storing waits for the notice");
  assert.equal(dom.byId("token-expires").value, day(90), "preset to the 90 days of the prefilled link");
  await tick(srv, dom.byId("ack"));
  const key = "github_pat_RENEWED0123456789abcdefghij";
  dom.byId("token-input").value = key;
  await press(srv, dom.byId("token-save"));
  assert.equal(stored("agent-m.github-token"), key);
  assert.equal(stored("agent-m.github-token-expires"), day(90));
  assert.equal(dom.byId("token-msg").textContent, "Stored. Press Test to check it; reload to read with it.");
});

test("UC-042 1a: a token that expires within fourteen days is named on every page, with Renew; one that expires later is not", async () => {
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc" });
  globalThis.localStorage.setItem("agent-m.github-token-expires", day(5));
  await page.go("#spec");
  const banner = page.el("token-banner");
  assert.ok(banner.includes(`<strong>Your GitHub token expires on ${day(5)} (in 5 days).</strong>`));
  assert.ok(banner.includes('<a class="btn small" href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">Renew ↗</a>'));
  assert.match(banner, /Regenerate token/);
  globalThis.localStorage.setItem("agent-m.github-token-expires", day(30));
  await page.go("#uc");
  assert.equal(page.el("token-banner"), "");
});

test("UC-042 1b: a token the server refused is named, with its renewal, at the top and on its line", async () => {
  let refuse = false;
  const srv = await ucServer({}, [(url) => (refuse && url.href === `${API}/repos/${REPO}` ? json({ message: "Bad credentials" }, 401) : undefined)]);
  const page = await openDashboard({ server: srv, hash: "#uc" });
  const dom = richDocument();
  refuse = true;
  await page.go("#settings");
  await press(srv, inBox(dom.byId("browser-settings"), '[data-test="agent-m.github-token"]'));
  assert.ok(page.el("token-banner").includes("<strong>GitHub refused your GitHub token — it has expired, or was regenerated or deleted on GitHub.</strong>"));
  assert.ok(page.el("token-banner").includes('href="https://github.com/settings/personal-access-tokens"'));
  assert.match(dom.byId("browser-settings").innerHTML, /<p class="state">✗ refused — GitHub did not accept it at the last use<\/p>/);
});

test("UC-042 step 2: products — Remove takes one off this browser's list after a confirmation; Clear takes all, with the GitLab products' tokens; no repository changes", async () => {
  const gitlab = JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } });
  const { srv, box, page } = await settingsPage({ entries: { "agent-m.products": JSON.stringify([PRODUCT_ADDR, GL_ADDR]), "agent-m.gitlab-tokens": gitlab } });
  assert.match(box().innerHTML, /<p class="state">2 in this browser<\/p>/);
  await press(srv, among(box(), "data-remove-product", PRODUCT_ADDR));
  assert.deepEqual(JSON.parse(stored("agent-m.products")), [GL_ADDR]);
  assert.equal(stored("agent-m.gitlab-tokens"), gitlab, "another product's token stays");
  await press(srv, inBox(box(), '[data-clear="agent-m.products"]'));
  assert.equal(stored("agent-m.products"), null);
  assert.equal(stored("agent-m.gitlab-tokens"), null);
  assert.equal(confirms.length, 2);
  assert.deepEqual(srv.writes, []);
  assert.doesNotMatch(page.el("product"), /alice\/thesis|gitlab\.example/, "the selector follows");
});

test("UC-042 step 2: a GitLab project token — hidden until Show, changed after the notice, cleared after a confirmation", async () => {
  const gitlab = JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: day(60) } });
  const { srv, box, dom } = await settingsPage({ entries: { "agent-m.products": JSON.stringify([GL_ADDR]), "agent-m.gitlab-tokens": gitlab } });
  assert.ok(box().innerHTML.includes(`<input class="secret" type="password" readonly value="${GL_TOKEN}"`));
  await press(srv, among(box(), "data-change-gitlab", GL_ADDR));
  assert.equal(among(box(), "data-result-gitlab", GL_ADDR).textContent, "Tick “I have read this” at the top of the page first.");
  await tick(srv, dom.byId("ack"));
  await press(srv, among(box(), "data-change-gitlab", GL_ADDR));
  const form = among(box(), "data-change-form", GL_ADDR);
  const renewed = "glpat-renewedTOKENvalue0123456789";
  form.querySelector("[data-gl-token]").value = renewed;
  form.querySelector("[data-gl-expires]").value = day(80);
  await press(srv, form.querySelector("[data-gl-store]"));
  assert.deepEqual(JSON.parse(stored("agent-m.gitlab-tokens")), { [GL_ADDR]: { token: renewed, expires: day(80) } });
  await press(srv, among(box(), "data-clear-gitlab", GL_ADDR));
  assert.equal(stored("agent-m.gitlab-tokens"), null);
  assert.deepEqual(JSON.parse(stored("agent-m.products")), [GL_ADDR], "the product stays in the list");
});

test("UC-042 step 2: the jump host and a remote session are set, their commands written, and each is cleared — all in this browser", async () => {
  const { srv, box, dom } = await settingsPage();
  await press(srv, inBox(box(), '[data-change="agent-m.jump-host"]'));
  const form = inBox(box(), "[data-jump-form]");
  for (const [k, v] of Object.entries({ host: "jump.example.org", user: "agentm", portFrom: "20001", portTo: "20003", reverseKey: "", forwardKey: "" })) {
    form.querySelector(`[data-j="${k}"]`).value = v;
  }
  await press(srv, form.querySelector("[data-jump-save]"));
  assert.deepEqual(JSON.parse(stored("agent-m.jump-host")),
    { host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003, reverseKey: "", forwardKey: "" });
  assert.match(box().innerHTML, /agentm@jump\.example\.org — ports 20001–20003/);
  await tick(srv, dom.byId("ack"));
  await press(srv, inBox(box(), "[data-add-session]"));
  const s = inBox(box(), "[data-session-form]");
  assert.equal(s.querySelector('[data-s="port"]').value, "20001", "the lowest free port of the range");
  s.querySelector('[data-s="name"]').value = "lab-pc";
  s.querySelector('[data-s="bridgePort"]').value = "8765";
  s.querySelector('[data-s="token"]').value = "bridgeTOKEN-0123456789abcdef";
  await press(srv, s.querySelector("[data-session-save]"));
  assert.deepEqual(JSON.parse(stored("agent-m.remote-sessions")).map((x) => [x.name, x.port, x.bridgePort, x.token]),
    [["lab-pc", 20001, 8765, "bridgeTOKEN-0123456789abcdef"]]);
  assert.match(box().innerHTML, /<pre class="cmd">[^<]*127\.0\.0\.1:20001[^<]*<\/pre>/, "the commands, written from the settings");
  assert.doesNotMatch(box().innerHTML.replace(/value="bridgeTOKEN-[^"]*"/, ""), /bridgeTOKEN/, "the bridge token is in no command");
  await press(srv, among(box(), "data-clear-session", "lab-pc"));
  assert.equal(stored("agent-m.remote-sessions"), null);
  await press(srv, inBox(box(), '[data-clear="agent-m.jump-host"]'));
  assert.equal(stored("agent-m.jump-host"), null);
  assert.deepEqual(srv.writes, []);
});

test("UC-042 3a: without a token the product's settings are read-only, and link to the token step of UC-001", async () => {
  const { product } = await settingsPage({ token: null });
  const html = product().innerHTML;
  assert.ok(html.includes(`Read-only: this browser has no token. <a href="#add/${encodeURIComponent(`https://github.com/${REPO}`)}">Give your token access to it</a> (UC-001).`));
  assert.doesNotMatch(html, /id="pseudo-off"|id="pseudo-on"|id="coll-add"|data-remove-collaborator/);
});

test("UC-042 step 4: switching pseudonymisation off shows what follows — published for a public repository —, needs the tick, and one trusted click commits docs/settings.md", async () => {
  const { srv, dom, product } = await settingsPage();
  await press(srv, dom.byId("pseudo-off"));
  assert.equal(dom.byId("pseudo-confirm").hidden, false);
  assert.ok(product().innerHTML.includes("With pseudonymisation off, report data from mails — the names, addresses and other details of the people " +
    "who write — enters the issues and the repository of akmaier/agent-m unchanged. This is advisable only on a protected, non-public data space. " +
    "Issue texts themselves stay neutral either way. GitHub reports akmaier/agent-m as public: the data will be published — anyone on the internet can read it."));
  assert.equal(dom.byId("pseudo-save").disabled, true, "Save waits for the tick");
  await tick(srv, dom.byId("pseudo-ack"));
  await press(srv, dom.byId("pseudo-save"));
  assert.equal(srv.writes.length, 1);
  assert.deepEqual(Object.keys(srv.writes[0].files), ["docs/settings.md"]);
  assert.match(srv.writes[0].files["docs/settings.md"], /^# Settings of akmaier\/agent-m\n[^]*\n- pseudonymisation: off\n$/);
  assert.equal(srv.writes[0].message, "settings: pseudonymisation off (Agent M dashboard)");
  assert.deepEqual(agentKeys(), ["agent-m.github-token"], "no product setting in this browser");
  assert.match(product().innerHTML, /Pseudonymisation — <span class="state">off<\/span>/);
});

test("UC-042 step 4 counter-proofs: a click a script makes writes nothing; a Save without the tick writes nothing and says why", async () => {
  const { srv, dom } = await settingsPage();
  await press(srv, dom.byId("pseudo-off"));
  await tick(srv, dom.byId("pseudo-ack"));
  await press(srv, dom.byId("pseudo-save"), SCRIPTED);
  assert.deepEqual(srv.writes, []);
  await tick(srv, dom.byId("pseudo-ack"), false);
  dom.byId("pseudo-save").fire("click", TRUSTED);   // as if the disabled button were pressed anyway
  await settle(srv);
  assert.deepEqual(srv.writes, []);
  assert.equal(dom.byId("pseudo-msg").textContent, "Tick “I have read this” under the notice first.");
});

test("UC-042 4a: switching pseudonymisation back on is saved without a notice — the page says data written meanwhile stays in the history", async () => {
  const off = "# Settings of akmaier/agent-m\n\nintro\n\n- pseudonymisation: off\n";
  const { srv, dom, product } = await settingsPage({ server: await ucServer({ "docs/settings.md": off }) });
  assert.match(product().innerHTML, /Pseudonymisation — <span class="state">off<\/span>/);
  assert.ok(product().innerHTML.includes("Data written while pseudonymisation was off stays in the repository&#39;s history; removing it needs a rewrite of that history."));
  await press(srv, dom.byId("pseudo-on"));
  assert.deepEqual(srv.writes.map((w) => w.files), [{ "docs/settings.md": "# Settings of akmaier/agent-m\n\nintro\n\n" }]);
  assert.match(product().innerHTML, /Pseudonymisation — <span class="state">on \(the default\)<\/span>/);
});

const COLLABORATORS_HEAD = "# Collaborators of akmaier/agent-m\n\nPeople who agreed to be named in this repository, with the date they agreed. Anyone else is\n" +
  "named only by their account. Changed on the Agent M dashboard (Settings).\n\n| Name | Account | Agreed on |\n|---|---|---|\n";

test("UC-042 step 5: + Collaborator with the tick that the person agreed commits docs/collaborators.md with name, account and date", async () => {
  const { srv, dom, product } = await settingsPage();
  dom.byId("coll-name").value = "Jane Doe";
  dom.byId("coll-account").value = "jdoe";
  dom.byId("coll-agreed").value = "2026-09-30";
  dom.byId("coll-consent").checked = true;
  await press(srv, dom.byId("coll-add"));
  assert.deepEqual(srv.writes.map((w) => w.files), [{ "docs/collaborators.md": `${COLLABORATORS_HEAD}| Jane Doe | @jdoe | 2026-09-30 |\n` }]);
  assert.equal(srv.writes[0].message, "collaborators: update (Agent M dashboard)");
  assert.match(product().innerHTML, /Collaborators — 1 named/);
});

test("UC-042 step 5 counter-proofs: without the tick nothing is written and the page says why; a click a script makes writes nothing", async () => {
  const { srv, dom } = await settingsPage();
  dom.byId("coll-name").value = "Jane Doe";
  dom.byId("coll-account").value = "jdoe";
  await press(srv, dom.byId("coll-add"));
  assert.deepEqual(srv.writes, []);
  assert.equal(dom.byId("coll-msg").textContent, "Tick “this person has agreed to be named” — without it, a person is named only by account.");
  dom.byId("coll-consent").checked = true;
  await press(srv, dom.byId("coll-add"), SCRIPTED);
  assert.deepEqual(srv.writes, []);
});

test("UC-042 5a: Remove takes a collaborator off the list with one commit, and says that earlier commits keep the name", async () => {
  const two = `${COLLABORATORS_HEAD}| Jane Doe | @jdoe | 2026-09-30 |\n| Max Müller | @max-m | 2026-10-01 |\n`;
  const { srv, product, page } = await settingsPage({ server: await ucServer({ "docs/collaborators.md": two }) });
  await press(srv, among(product(), "data-remove-collaborator", "jdoe"));
  assert.deepEqual(srv.writes.map((w) => w.files), [{ "docs/collaborators.md": `${COLLABORATORS_HEAD}| Max Müller | @max-m | 2026-10-01 |\n` }]);
  assert.match(page.main(), /Removed @jdoe; earlier commits keep the name in the history — <a href="[^"]+"[^>]*>commit [0-9a-f]{7}<\/a>\./);
});

// The file the browser would download: what Export hands to URL.createObjectURL; the ten-second timer that revokes it is not
// left running.
async function downloaded(f) {
  const blobs = [], real = { create: URL.createObjectURL, revoke: URL.revokeObjectURL, timer: globalThis.setTimeout };
  URL.createObjectURL = (b) => { blobs.push(b); return "blob:export"; };
  URL.revokeObjectURL = () => {};
  globalThis.setTimeout = (fn, ms, ...a) => (ms >= 1000 ? 0 : real.timer(fn, ms, ...a));
  try { await f(); } finally { URL.createObjectURL = real.create; URL.revokeObjectURL = real.revoke; globalThis.setTimeout = real.timer; }
  return Promise.all(blobs.map((b) => b.text()));
}

test("UC-042 step 6: the export states what it contains and what each secret grants; Export saves every browser setting, the token included, and sends nothing", async () => {
  const { srv, dom, page } = await settingsPage({ entries: { "agent-m.products": JSON.stringify([PRODUCT_ADDR]) } });
  assert.ok(page.main().includes("The file contains every setting of this browser in full, including your GitHub token, which writes — commits, issues, " +
    "pull requests and workflow runs — to every repository it was given, under your account. It opens all of that to whoever holds the file — keep it like a " +
    "password, or lock it with a passphrase."));
  let made;
  const [file] = await downloaded(async () => { made = await press(srv, dom.byId("export-go")); });
  assert.deepEqual(made, [], "nothing is sent anywhere");
  assert.deepEqual(srv.writes, []);
  const f = JSON.parse(file);
  assert.deepEqual(f.settings, { "agent-m.github-token": TOKEN, "agent-m.products": JSON.stringify([PRODUCT_ADDR]) });
  assert.equal(dom.byId("io-msg").textContent, "Saved. The file holds your token in clear — keep it like a password.");
});

test("UC-042 step 6: an export locked with a passphrase holds no secret in clear; two different passphrases save nothing", async () => {
  const { srv, dom } = await settingsPage();
  dom.byId("export-pass").value = "correct horse";
  dom.byId("export-pass2").value = "correct hors";
  assert.deepEqual(await downloaded(() => press(srv, dom.byId("export-go"))), []);
  assert.equal(dom.byId("io-msg").textContent, "The two passphrases differ — nothing was saved.");
  dom.byId("export-pass2").value = "correct horse";
  const [file] = await downloaded(async () => {
    await press(srv, dom.byId("export-go"));
    await until(() => /^Saved/.test(dom.byId("io-msg").textContent), "the locked file");
  });
  assert.ok(!file.includes(TOKEN), "no token in clear");
  assert.ok(JSON.parse(file).locked, "locked");
  assert.equal(dom.byId("io-msg").textContent, "Saved, locked with your passphrase.");
});

// A settings file handed to the page's file field.
const fileField = (dom, text) => { dom.byId("import-file").files = [{ text: async () => text }]; };

test("UC-042 step 6 · UC-014 7a: Import, after the notice is ticked, restores every setting of an export in a browser that had none", async () => {
  const file = await exportSettings({ "agent-m.github-token": TOKEN, "agent-m.github-token-expires": day(60),
    "agent-m.products": JSON.stringify([PRODUCT_ADDR]) });
  const { srv, dom } = await settingsPage({ token: null });
  assert.equal(dom.byId("import-go").disabled, true, "Import waits for the notice");
  await tick(srv, dom.byId("ack"));
  fileField(dom, file);
  await press(srv, dom.byId("import-go"));
  assert.equal(stored("agent-m.github-token"), TOKEN);
  assert.equal(stored("agent-m.github-token-expires"), day(60));
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]));
  assert.equal(dom.byId("io-msg").innerHTML, `Imported.<br>Added: GitHub token, product ${PRODUCT_ADDR}.`);
});

test("UC-042 step 6: a locked file is imported with its passphrase; with a wrong one nothing is imported", async () => {
  const file = await exportSettings({ "agent-m.github-token": TOKEN }, { passphrase: "correct horse" });
  const { srv, dom } = await settingsPage({ token: null });
  await tick(srv, dom.byId("ack"));
  fileField(dom, file);
  dom.byId("import-pass").value = "wrong horse";
  await press(srv, dom.byId("import-go"));
  await until(() => dom.byId("io-msg").textContent !== "", "the answer to the wrong passphrase");
  assert.deepEqual(agentKeys(), []);
  assert.equal(dom.byId("io-msg").textContent, "Wrong passphrase, or the file is damaged — nothing was imported.");
  dom.byId("import-pass").value = "correct horse";
  await press(srv, dom.byId("import-go"));
  await until(() => stored("agent-m.github-token") !== null, "the import");
  assert.equal(stored("agent-m.github-token"), TOKEN);
});

test("UC-042 6a: an import keeps what this browser has, adds only what is missing, and lists both", async () => {
  const file = await exportSettings({ "agent-m.github-token": "github_pat_OTHER0123456789abcdefghijkl",
    "agent-m.products": JSON.stringify([PRODUCT_ADDR]) });
  const { srv, dom } = await settingsPage();
  await tick(srv, dom.byId("ack"));
  fileField(dom, file);
  await press(srv, dom.byId("import-go"));
  assert.equal(stored("agent-m.github-token"), TOKEN, "this browser's token is kept");
  assert.equal(stored("agent-m.products"), JSON.stringify([PRODUCT_ADDR]));
  assert.equal(dom.byId("io-msg").innerHTML, `Imported.<br>Added: product ${PRODUCT_ADDR}.<br>Kept as this browser had them: GitHub token.`);
});

test("UC-042 step 6: Clear everything removes every Agent M entry from localStorage and the kept file texts, after a confirmation", async () => {
  const caches = fakeCaches();
  const srv = await ucServer();
  const page = await openDashboard({ server: srv, hash: "#uc", caches });
  for (const [k, v] of Object.entries({ "agent-m.github-token-expires": day(60), "agent-m.products": JSON.stringify([PRODUCT_ADDR]),
    "agent-m.gitlab-tokens": JSON.stringify({ [GL_ADDR]: { token: GL_TOKEN, expires: null } }),
    "agent-m.jump-host": JSON.stringify({ host: "jump.example.org", user: "agentm", portFrom: 20001, portTo: 20003 }) })) {
    globalThis.localStorage.setItem(k, v);
  }
  globalThis.localStorage.setItem("another-site.setting", "kept");
  assert.ok(caches.stores.size > 0, "file texts were kept");
  const dom = richDocument();
  await page.go("#settings");
  confirmAnswer = false;
  await press(srv, dom.byId("token-clear"));
  assert.equal(agentKeys().length, 5, "not confirmed: everything stays");
  confirmAnswer = true;
  await press(srv, dom.byId("token-clear"));
  assert.deepEqual(agentKeys(), []);
  assert.equal(stored("another-site.setting"), "kept", "only Agent M's entries");
  assert.equal(caches.stores.size, 0, "the kept file texts too");
  assert.equal(dom.byId("token-msg").textContent, "Nothing stored any more.");
});
