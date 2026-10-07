// Release tests of sprint 02, strand D — the dashboard's review findings: the export notice (ITM-125), a refused save beside the
// newer version (ITM-131), Add product for a missing repository and a key that already reaches it (ITM-132), and the impact list
// on a SPEC change entry (ITM-134) (ITM-145). Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who
// implemented none of the strand's items, from the SPEC rules and use-case flows they realise; started on sprint/02 at a22de0a,
// 2026-10-02.
//
// Module: MOD-dashboard-app
// Guards: AN EXPORT STATES THAT IT CONTAINS SECRETS; ONE GITHUB TOKEN SERVES EVERY FEATURE; A REFUSED SAVE KEEPS THE EDIT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; EVERY STEP EXPLAINS ITSELF; ONE CLICK PER DECISION; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-001; UC-006; UC-008; UC-042
// Level: release
//
// The real dashboard runs in tests/app-harness.mjs: its page loads, its views, its clicks; GitHub's API is served from a fixture
// repository written in this file — the instance's own artifacts of a made-up "Thesis tool": a SPEC in the SPEC's own form of a
// requirement, one change queue, use cases, a decision, a module and tests with their header lines. A product repository to add
// is served beside it. GitHub's contents API answers a request for JSON with the file's blob SHA, as GitHub documents it. No
// request leaves the process. Every expectation is stated before its case runs, from the rule or the use-case step it names.
// Known findings are not re-tested: R1 (Add product writes no docs/architecture/), R2 and R3 — see the measurement record.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, REPO } from "./app-harness.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

// ------------------------------------------------------------------------------------------------ the fixture instance

const req = (name, source, rule) => `**${name}** *(${source})*\n${rule}\n*Occasion:* reviewers print it.\n*Check:* \`tests/x.test.mjs\`\n`;
const PDF = "EXPORT IS A PDF", TITLE = "THE TITLE PAGE NAMES THE AUTHOR", SERIF = "THE BODY TEXT IS SERIF";
const SECTION = {
  1: `## 1. Export\n\n${req(PDF, "PO B. Example, 2026-09-24", "The export is one PDF file.")}`,
  2: `## 2. Title page\n\n${req(TITLE, "PO B. Example, 2026-09-24", "The title page names the author.")}`,
  4: `## 4. Fonts\n\n${req(SERIF, "PO B. Example, 2026-09-24", "The body text is set in a serif font.")}`,
};
const SPEC = `# Thesis tool — Specification\n\n**VERBINDLICH (SPEC)**\n\n${SECTION[1]}\n${SECTION[2]}\n${SECTION[4]}`;

const QN = "2026-10-01_thesis", Q = `docs/spec-freigaben/${QN}`;
// Entry 01 changes TITLE; entry 02 keeps SERIF and adds a new requirement; entry 03 withdraws EXPORT IS A PDF.
const P = {
  1: [`${Q}/01-title.md`, "## 2. Title page", `## 2. Title page\n\n${req(TITLE, "PO B. Example, 2026-10-01", "The title page names the author and the supervisor.")}`],
  2: [`${Q}/02-margins.md`, "## 4. Fonts", `${SECTION[4]}\n${req("THE MARGINS ARE WIDE", "PO B. Example, 2026-10-01", "Every margin is at least three centimetres.")}`],
  3: [`${Q}/03-export.md`, "## 1. Export", `## 1. Export\n\n**${PDF}** *(PO B. Example, 2026-09-24 — withdrawn 2026-10-01)*\n*Withdrawn:* the export is printed by the browser. The name is not reused.\n`],
};
const INDEX = `# SPEC approvals — queue ${QN}\n\n**Zieldatei aller Einträge:** \`SPEC.md\`\n\n` +
  "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n" +
  Object.entries(P).map(([n, [path, anchor]]) => `| 0${n} | \`${path.split("/").pop()}\` | ${anchor} | — | — |\n`).join("");

const uc = (id, title, realises) => `---\nid: ${id}\ntitle: ${title}\nrealises:\n${realises.map((n) => `  - ${n}\n`).join("")}---\n` +
  `# ${id} ${title}\n\nThe author does it.\n`;
const UC1 = "docs/use-cases/UC-001-export-the-thesis.md", UC2 = "docs/use-cases/UC-002-print-the-title-page.md";
const UC3 = "docs/use-cases/UC-003-date-the-title-page.md";
const ARC1 = "docs/architecture/ARC-001-export-through-print.md", MODX = "docs/architecture/MOD-exporter.md", MODC = "docs/architecture/MOD-cover.md";
const ARC_TEXT = `---\nid: ARC-001\ntitle: Export through the browser's print\nforced_by:\n  - ${PDF}\n---\n# ARC-001 Export through the browser's print\n\n` +
  "## Context\n\nReaders print.\n\n## Decision\n\nThe browser prints.\n\n## Alternatives\n\nA PDF library.\n\n## Consequences\n\nNo library.\n";
const mod = (id, realises, iface) => `---\nid: ${id}\ntitle: ${id.slice(4)}\nrealises:\n  - ${realises}\nfollows:\n  - ARC-001\nuses: []\n` +
  `provides:\n  - ${iface}\n---\n# ${id}\n\n## Responsibility\n\nIt does one thing.\n\n## Interfaces\n\n- \`${iface}(thesis) -> x\` — what it gives.\n`;
const testFile = (module, guards) => `// A test of the fixture.\n// Module: ${module}\n// Guards: ${guards.join("; ")}\n// Level: unit\n\nimport test from "node:test";\n`;

function instanceFiles() {
  return {
    "SPEC.md": SPEC, [`${Q}/index.md`]: INDEX, [`${Q}/entscheidungen.md`]: `# Decisions — queue ${QN}\n\nAppend-only.\n`,
    ...Object.fromEntries(Object.values(P).map(([path, , text]) => [path, text])),
    [UC1]: uc("UC-001", "Export the thesis", [PDF, TITLE]),
    [UC2]: uc("UC-002", "Print the title page", [TITLE]),
    // A name that begins like TITLE is another name.
    [UC3]: uc("UC-003", "Date the title page", [`${TITLE} AND THE DATE`]),
    [ARC1]: ARC_TEXT, [MODX]: mod("MOD-exporter", PDF, "exportPdf"), [MODC]: mod("MOD-cover", TITLE, "cover"),
    "tests/title.test.mjs": testFile("MOD-cover", [TITLE]),
    "tests/export.test.mjs": testFile("MOD-exporter", [PDF]),
    "tests/serif.test.mjs": testFile("MOD-cover", [SERIF]),
    "docs/approvals/README.md": "# Approvals\n",
  };
}

// GitHub's contents API: asked for JSON (Accept: application/vnd.github+json), it answers with the file's blob SHA at the branch.
const contentsJson = (box, repo = REPO) => async (url, init) => {
  const accept = new Headers(init.headers || {}).get("accept") || "";
  const m = new RegExp(`^/repos/${repo}/contents/(.+)$`).exec(url.pathname);
  if (url.origin !== "https://api.github.com" || init.method !== "GET" || !m || !accept.includes("vnd.github+json")) return undefined;
  const path = m[1].split("/").map(decodeURIComponent).join("/");
  return path in box.server.files ? json({ type: "file", path, sha: box.server.shas[path] }) : json({ message: "Not Found" }, 404);
};
async function instance({ files = instanceFiles(), handlers = [] } = {}) {
  const box = {};
  box.server = await repoServer({ files, handlers: [contentsJson(box), ...handlers] });
  return box.server;
}

// ------------------------------------------------------------------------------------------------ ITM-125

// AN EXPORT STATES THAT IT CONTAINS SECRETS · UC-042 step 6: before an export is saved, the page states that the file contains
// every token, key and password it holds, and what each grants. Expected with the GitHub token stored: the notice stands before
// the Export button and names the GitHub token with its writes — commits, issues, pull requests and workflow runs (ONE GITHUB
// TOKEN SERVES EVERY FEATURE). With a GitLab project token stored as well, it names that one too, with what it grants. With nothing
// stored, it claims no GitHub token.
test("ITM-125 · the export notice names each stored secret with what it grants — the GitHub token's pull requests included", async () => {
  const server = await instance();
  const page = await openDashboard({ server, hash: "#settings" });
  const main = page.main(), go = main.indexOf('id="export-go"');
  assert.ok(go > 0, "the settings page has its Export button");
  const notice = main.slice(main.lastIndexOf("<p", main.lastIndexOf("GitHub token", go)), go);
  for (const w of ["GitHub token", "commits", "issues", "pull requests", "workflow runs"]) assert.ok(notice.includes(w), `before Export: ${w}`);

  globalThis.localStorage.setItem("agent-m.gitlab-tokens", JSON.stringify({
    "https://gitlab.example.org/group/thesis": { token: "glpat-RELEASE0123456789abcd", expires: "2026-12-31" } }));
  await page.go("#uc");
  await page.go("#settings");
  const withGitLab = page.main();
  const before = withGitLab.slice(0, withGitLab.indexOf('id="export-go"'));
  assert.match(before, /GitLab project tokens?, which [^.;]*project/i, "the GitLab project token, with what it grants");
  assert.ok(before.includes("pull requests"), "and still the GitHub token's grant");

  const bare = await openDashboard({ server: await instance(), hash: "#settings", token: null });
  const none = bare.main();
  const exportPart = none.slice(none.indexOf("Export and import"), none.indexOf('id="export-go"'));
  assert.ok(exportPart.length > 0 && !/your GitHub token/.test(exportPart), "nothing stored: no GitHub token claimed");
});

// ------------------------------------------------------------------------------------------------ ITM-131

const EDIT_LINE = "Edited on the dashboard by the reviewer.", THEIR_LINE = "Committed meanwhile by somebody else.";

// One editor of a review view, driven as a person drives it: open the file, open the editor, type, and — when `meanwhile` — someone
// commits to the same file on the branch before Save is clicked. -> what the page shows and what was written.
async function saveInEditor(hash, path, { meanwhile = true } = {}) {
  const server = await instance();
  const page = await openDashboard({ server, hash: "" });
  const rich = richDocument();
  await page.go(hash);
  assert.ok(page.main().includes("data-edit-save"), `${hash}: the editor offers Save`);
  const original = server.files[path];
  const edited = `${original.replace(/\n$/, "")}\n\n${EDIT_LINE}\n`;
  rich.edit().querySelector("textarea").value = edited;
  const newer = `${original.replace(/\n$/, "")}\n\n${THEIR_LINE}\n`;
  if (meanwhile) await server.change(path, newer);
  const writes = server.writes.length;
  await page.click("[data-edit-save]");
  const ed = rich.edit();
  return { server, page, edited, newer, written: server.writes.slice(writes), textarea: ed?.querySelector("textarea")?.value,
    beside: ed?.querySelector(".edit-newer")?.innerHTML ?? "", result: ed?.querySelector(".result")?.textContent ?? "" };
}

// A REFUSED SAVE KEEPS THE EDIT · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE · UC-008 3a, UC-006 3a: after the file changed
// on the branch, Save writes nothing, the edited text stays in the editor, and the newer version is shown beside it. Expected, in
// every editor the review views open — a use case, an architecture decision, a module — and on the SPEC changes page: no write;
// the textarea still holds the edit; beside it, the newer text (its added line) and the edit (its added line); the refusal says
// that the file changed.
for (const [what, hash, path] of [
  ["a use case", "#uc/UC-001", UC1], ["an architecture decision", "#arc/ARC-001", ARC1], ["a module", "#arc/MOD-exporter", MODX],
  ["a SPEC change proposal", `#spec/${QN}/01`, P[1][0]],
]) {
  test(`ITM-131 · ${what}: a refused save writes nothing, keeps the edit and shows the newer version beside it`, async () => {
    const r = await saveInEditor(hash, path);
    assert.deepEqual(r.written, [], "nothing written");
    assert.equal(r.server.files[path], r.newer, "the branch keeps the newer text");
    assert.equal(r.textarea, r.edited, "the edit stays in the editor");
    assert.ok(r.beside.includes(THEIR_LINE), "the newer version is shown");
    assert.ok(r.beside.includes(EDIT_LINE), "beside the edit");
    assert.match(r.result, /changed/i, "the refusal names the change");
  });
}

// UC-008 3a, the main path of the same editor: Save commits the edited text. Expected: without a commit meanwhile, one write, of
// exactly the edited text at the file's path; no newer version is shown. (The counterpart that shows the refusal above is not
// "every save fails".)
test("ITM-131 · without a commit meanwhile, Save commits the edit and shows no newer version", async () => {
  const r = await saveInEditor("#uc/UC-001", UC1, { meanwhile: false });
  assert.equal(r.written.length, 1, "one commit");
  assert.deepEqual(Object.keys(r.written[0].files), [UC1]);
  assert.equal(r.written[0].files[UC1], r.edited);
  assert.ok(!r.beside.includes(THEIR_LINE));
});

// ------------------------------------------------------------------------------------------------ ITM-132

const PRODUCT = "alice/thesis-tool";
// The product repository on GitHub: missing (404), private or public; a tree read by the branch's name; writes on the branch.
async function productRepo(state) {
  const server = await repoServer({ repo: PRODUCT, files: { "README.md": "# Thesis tool\n" } });
  const handler = async (url, init) => {
    if (url.origin !== "https://api.github.com" || !url.pathname.startsWith(`/repos/${PRODUCT}`)) return undefined;
    if (state === "missing") return json({ message: "Not Found", documentation_url: "https://docs.github.com/rest" }, 404);
    if (url.pathname === `/repos/${PRODUCT}`) return json({ private: state === "private", visibility: state, default_branch: "main" });
    if (init.method === "GET" && url.pathname === `/repos/${PRODUCT}/git/trees/main`) {
      return json({ sha: "t".repeat(40), truncated: false, tree: Object.keys(server.files).map((path) => ({ path, type: "blob", mode: "100644", sha: server.shas[path] })) });
    }
    return server.fetch(url, init);
  };
  return { server, handler };
}
// The Add product panel with the product's address typed in (UC-001 steps 1 and 2).
async function addPanel(state, { token } = {}) {
  const product = await productRepo(state);
  const server = await instance({ handlers: [product.handler] });
  const page = await openDashboard({ server, hash: "", ...(token === undefined ? {} : { token }) });
  const rich = richDocument();
  await page.go("#add");
  const input = rich.byId("add-repo");
  input.value = `https://github.com/${PRODUCT}`;
  input.fire("input");
  // Step A is redrawn in its own element after Check; before, it stands in the steps' HTML.
  const stepA = () => rich.byId("add-step-a").innerHTML || cut(rich.byId("add-steps").innerHTML);
  return { product, server, page, rich, stepA, steps: () => rich.byId("add-steps").innerHTML };
}
const cut = (html) => { const at = html.indexOf("Step A"); return at < 0 ? "" : html.slice(at, html.indexOf("</section>", at)); };
const NEW_REPO = "https://github.com/new";

// UC-001 2a · EVERY STEP EXPLAINS ITSELF: when the product repository does not exist, Agent M says so and links GitHub's page for a
// new repository, with a folded explanation of the choices there. Expected after Check on an address GitHub answers 404 for: the
// answer says the repository is not there (or not seen), links https://github.com/new, and carries a folded "What is this?" with
// text; nothing is written anywhere. Counter: an existing private repository gets no such link.
async function entryPage(nr, { token, files = instanceFiles() } = {}) {
  const server = await instance({ files });
  const page = await openDashboard({ server, hash: "", ...(token === undefined ? {} : { token }) });
  await page.go(`#spec/${QN}/0${nr}`);
  const main = page.main();
  const accept = Math.max(main.indexOf("data-accept-key"), main.indexOf("Open in GitHub to commit"));
  return { main, accept };
}
const IMPACT_OF_TITLE = ["UC-001", "UC-002", "MOD-cover", "tests/title.test.mjs"];

test("ITM-134 · an entry that adds a new requirement shows no impact list", async () => {
  const { main, accept } = await entryPage(2);
  assert.ok(accept > 0);
  for (const id of ["UC-001", "UC-002", "UC-003", "MOD-cover", "MOD-exporter", "ARC-001", "tests/title.test.mjs", "tests/serif.test.mjs"]) {
    assert.ok(!main.includes(id), `${id} is not listed`);
  }
  assert.doesNotMatch(main, /impact/i, "no impact list, not even an empty one");
});

// UC-006 3b for a withdrawal, which changes an existing requirement too. Expected for entry 03, which withdraws EXPORT IS A PDF:
// what still names it — UC-001, ARC-001, MOD-exporter, tests/export.test.mjs — before Accept; not UC-002.
test("ITM-134 · an entry withdrawing a requirement lists what still names it", async () => {
  const { main, accept } = await entryPage(3);
  assert.ok(accept > 0);
  for (const id of ["UC-001", "ARC-001", "MOD-exporter", "tests/export.test.mjs"]) {
    const at = main.indexOf(id);
    assert.ok(at > 0 && at < accept, `${id} is listed before Accept`);
  }
  assert.ok(!main.includes("UC-002"));
});

// UC-006 3b when the entry takes a requirement out of its section without naming it again: entry 01 replaces "## 2. Title page"
// (step 6: byte for byte) with a text that states THE TITLE PAGE NAMES THE AUTHOR AND THE SUPERVISOR — TITLE renamed in place —
// or no requirement at all. Accepted, either takes TITLE out of the SPEC while UC-001, UC-002, MOD-cover and tests/title.test.mjs
// still name it. Expected: those four listed before Accept, as for any change of TITLE.
// FINDING D1 (back to Development: ITM-134) — the page shows no list; see the measurement record.
test("ITM-134 · an entry that takes a requirement out of its section lists what references it", async () => {
  const renamed = `## 2. Title page\n\n${req(`${TITLE} AND THE SUPERVISOR`, "PO B. Example, 2026-10-01", "The title page names both.")}`;
  const dropped = "## 2. Title page\n\nThe title page is laid out by the faculty's template.\n";
  for (const [what, text] of [["renamed in place", renamed], ["left out", dropped]]) {
    const { main, accept } = await entryPage(1, { files: { ...instanceFiles(), [P[1][0]]: text } });
    assert.ok(accept > 0, `${what}: the entry is offered for acceptance`);
    for (const id of IMPACT_OF_TITLE) {
      const at = main.indexOf(id);
      assert.ok(at > 0 && at < accept, `${what}: ${id} is listed before Accept`);
    }
  }
});
