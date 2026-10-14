// Independent ITM-418 system scenarios, authored by Developer terra-d (neither ITM-398 nor ITM-399's implementer).
// Module: MOD-trace-pages; MOD-review-pages; MOD-spec-changes; MOD-source-register; MOD-runtimes; MOD-job-runner
// Guards: UC-019
// Level: system
// Run: node --test tests/system-uc-019-change-requirements-by-prompt.test.mjs
// GitHub and the participant are app-harness servers. No request leaves this process.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDashboard, repoServer, press, settle } from "./app-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { view as tracePages } from "../src/trace-pages/index.mjs";
import { view as reviewPages } from "../src/review-pages/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

for (const [at, strategies] of reviewPages.strategies.entries()) registerStrategies(`ITM-418-independent-${at}`, strategies);

export const INSTANCE = "akmaier/agent-m", SOURCE = "SRC-author";
export const LOAN = "A LOAN HAS A DUE DATE", SHELF = "A BOOK IS SHELVED";
export const CHANGED = "A DUE DATE IS VISIBLE", CONFLICT = "A DUE DATE MAY BE HIDDEN";
export const INSTRUCTION = "Make the due date visible.";
export const CURRENT_RULE = "Every loan states its due date.";
const txt = (...lines) => `${lines.join("\n")}\n`;
export const SPEC = txt("# Lending tool", "", "## Lending", "", `**${LOAN}** *(SRC-policy)*`, CURRENT_RULE,
  "*Check:* `tests/loan.test.mjs`", "", `**${SHELF}** *(SRC-policy)*`, "Every book has a shelf.", "*Check:* `tests/shelf.test.mjs`", "");
const ROOT = new URL("../", import.meta.url);
export const readOriginal = (path) => readFileSync(new URL(path, ROOT), "utf8");
const PERSON = txt("---", `id: ${SOURCE}`, "title: Author", "kind: person", "identifier: github.com/akmaier", "authority: advisory",
  "licence: may be republished - fixture", "---", `# ${SOURCE} Author`, "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
const POLICY = PERSON.replaceAll(SOURCE, "SRC-policy").replace("kind: person", "kind: document")
  .replace("identifier: github.com/akmaier", "identifier: Lending policy").replace("authority: advisory", "authority: normative");
const LINKS = txt("# Sources", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| ${SOURCE} | 2026-10-13 | ${"0".repeat(64)} | prompt |`, `| SRC-policy | 2026-10-13 | ${"0".repeat(64)} | lending |`);
const registerHead = readOriginal("docs/participants.md").split("\n");
const header = registerHead.slice(0, registerHead.findIndex((line) => line.startsWith("|---")) + 1).join("\n");
const register = (context) => txt(header,
  `| drafter | model endpoint | fixture-model | ${context} | - | draft text | this machine | endpoint fixture |`,
  "| observer | model endpoint | observer-model | 200000 | - | read repository | this machine | endpoint fixture |",
  "| ci-drafter | CI agent | ci-model | 200000 | - | draft text | GitHub Actions in the USA | ci hosted secret CI_KEY |");

export const candidate = (fields = {}) => ({ name: CHANGED, rule: "Every loan visibly displays its due date.",
  check: "`tests/loan.test.mjs`", constrains: "product", passage: "make visible", class: "change", of: LOAN, ...fields });
export const draft = (...candidates) => ({ candidates: candidates.length ? candidates : [candidate()] });

// The existing app-harness models DOM elements but lacks a few native DOM operations used by these module routes.
// This adapter supplies only DOM mechanics; it performs no application routing, job preparation or persistence.
function nativeNodes() {
  const create = globalThis.document.createElement.bind(globalThis.document);
  globalThis.document.createElement = (tag) => {
    const node = create(tag), attrs = new Map();
    node.nodeType = 1;
    Object.defineProperty(node, "childNodes", { get: () => node.children });
    const append = node.append.bind(node), replace = node.replaceChildren.bind(node);
    node.append = (...children) => { for (const child of children) if (typeof child === "object" && child) child.parentNode = node; append(...children); };
    node.replaceChildren = (...children) => { for (const child of node.children) if (typeof child === "object") child.parentNode = null; replace(); node.append(...children); };
    node.setAttribute = (name, value) => { attrs.set(name, String(value)); if (name === "disabled") node.disabled = true; else if (name === "class") node.className = String(value); else node[name] = String(value); };
    node.getAttribute = (name) => name === "class" ? node.className : (attrs.get(name) ?? null);
    node.hasAttribute = (name) => attrs.has(name);
    node.removeAttribute = (name) => { attrs.delete(name); if (name === "disabled") node.disabled = false; };
    node.insertBefore = (child, before) => { const at = node.children.indexOf(before); assert.ok(at >= 0, "DOM reference child exists"); child.parentNode = node; node.children.splice(at, 0, child); };
    node.remove = () => { if (node.parentNode) node.parentNode.children.splice(node.parentNode.children.indexOf(node), 1); node.parentNode = null; };
    return node;
  };
}

export function all(root, tag, className = null) {
  const found = [];
  for (const child of root?.children ?? []) {
    if (typeof child !== "object" || !child) continue;
    if ((!tag || child.localName === tag) && (!className || child.className.split(/\s+/).includes(className))) found.push(child);
    found.push(...all(child, tag, className));
  }
  return found;
}
export const one = (root, tag, className) => { const nodes = all(root, tag, className); assert.equal(nodes.length, 1, `one ${tag}.${className}: ${root?.textContent ?? ""}`); return nodes[0]; };
export const namedButton = (root, text) => { const button = all(root, "button").find((node) => node.textContent === text); assert.ok(button, `${text} is offered: ${root.textContent}`); return button; };
export const row = (s, name = CHANGED) => { const found = all(s.target, "li", "candidate").find((node) => node.getAttribute("data-name") === name); assert.ok(found, `candidate ${name} is shown: ${s.target.textContent}`); return found; };
export const proposalWrites = (s) => s.product.writes.filter((write) => Object.keys(write.files).some((path) => path.endsWith(".begruendung.md")));
export const proposalTexts = (s) => proposalWrites(s).flatMap((write) => Object.entries(write.files).filter(([path]) => /\/\d\d-[^/]+\.md$/.test(path) && !path.endsWith(".begruendung.md")).map(([, text]) => text));
export const recordTexts = (s) => Object.entries(s.product.files).filter(([path]) => /^docs\/jobs\/JOB-.*\.md$/.test(path)).map(([, text]) => text);

export async function scenario({ owner = "akmaier", linked = true, answers = [draft()], context = 200000, bridge = false, extraFiles = {} } = {}) {
  const repo = `${owner}/lending-tool`, endpointRequests = [], bridgeRequests = [];
  let answerNumber = 0;
  const endpointAnswer = () => {
    const value = answers[Math.min(answerNumber++, answers.length - 1)];
    return typeof value === "function" ? value(endpointRequests, bridgeRequests) : value;
  };
  const answerText = () => {
    const value = endpointAnswer();
    return typeof value === "string" ? value : JSON.stringify(value && Object.hasOwn(value, "draft") ? value : { draft: value, answers: [] });
  };
  const response = (value) => new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } });
  const handler = async (url, init) => {
    if (url.origin === "https://fixture-endpoint.example.test") {
      endpointRequests.push({ url: url.href, body: JSON.parse(init.body), headers: init.headers });
      return response({ choices: [{ message: { content: answerText() } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    }
    if (url.origin === "http://127.0.0.1:9418") {
      bridgeRequests.push({ url: url.href, method: init.method, body: init.body && JSON.parse(init.body), headers: init.headers });
      if (init.method === "POST" && url.pathname === "/v1/ask") return response({ ask: "fixture-ask" });
      if (init.method === "GET" && url.pathname === "/v1/ask/fixture-ask") return response({ state: "done", text: answerText(), usage: { inputTokens: 10, outputTokens: 5 }, error: null });
      return new Response(JSON.stringify({ error: "not-found" }), { status: 404 });
    }
    return null;
  };
  const product = await repoServer({ repo, files: { "README.md": "# Lending tool\n", "SPEC.md": SPEC,
    "docs/sources.md": linked ? LINKS : LINKS.split("\n").filter((line) => !line.startsWith(`| ${SOURCE} |`)).join("\n"),
    ".github/workflows/agent-m-jobs.yml": "name: Agent M jobs\n", ...extraFiles } });
  const chapterPath = "docs/sources/SRC-vibe-coding/2026-10-05/08_requirements-engineering.md";
  const chapterFolder = "docs/sources/SRC-vibe-coding/2026-10-05/";
  const chapters = Object.fromEntries(readdirSync(new URL(chapterFolder, ROOT)).filter((path) => path.endsWith(".md"))
    .map((path) => [chapterFolder + path, readOriginal(chapterFolder + path)]));
  const instance = await repoServer({ files: { "docs/participants.md": register(context), [`docs/sources/${SOURCE}.md`]: PERSON,
    "docs/sources/SRC-policy.md": POLICY, "docs/sources/SRC-vibe-coding.md": readOriginal("docs/sources/SRC-vibe-coding.md"),
    ...chapters }, handlers: [handler, (url, init) => url.pathname === `/repos/${repo}`
      ? response({ default_branch: "main", private: false, archived: false, permissions: { push: true }, description: "" })
      : url.pathname.startsWith(`/repos/${repo}/`) ? product.fetch(url, init) : null] });
  const page = await openDashboard({ server: instance, hash: "#uc", search: `?repo=${repo}` });
  nativeNodes();
  const store = openStore(INSTANCE);
  writeSetting(store, `github-token:${repo}`, { value: "github_pat_FIXTURE0123456789", name: "github.com/akmaier", expires: "2027-01-01" });
  writeSetting(store, "endpoint:fixture", { url: "https://fixture-endpoint.example.test/v1", kind: "openai-compatible", model: "fixture-model", ...(bridge ? { bridge: "release-bridge" } : {}) });
  if (bridge) writeSetting(store, "bridge:release-bridge", { address: "http://127.0.0.1:9418", token: "fixture-pairing-token" });
  const instanceHost = connect(parseAddress(`https://github.com/${INSTANCE}`), { token: "fixture-instance-token" });
  const host = connect(parseAddress(`https://github.com/${repo}`), { token: "fixture-product-token" });
  const target = document.createElement("div");
  const viewContext = { page: "review", instance: { repository: INSTANCE, host: instanceHost }, product: { address: `https://github.com/${repo}`, kind: "github", host }, store, go() {} };
  return { product, server: instance, page, target, viewContext, host, repo, endpointRequests, bridgeRequests, chapter: readOriginal(chapterPath) };
}

export async function fromTrace(s, group = false) {
  const trace = tracePages.routes.find((route) => route.name === "trace");
  assert.ok(trace, "the public trace route exists");
  await trace.render(s.target, s.viewContext, { key: "specification", ref: "main" });
  await press(s.server, one(s.target, "button", "spec-section-toggle"));
  if (!group) await press(s.server, all(s.target, "button", "requirement-name").find((button) => button.textContent === LOAN));
  const link = one(s.target, "a", group ? "requirement-group-prompt" : "requirement-prompt");
  const [name, ...parts] = link.getAttribute("href").slice(1).split("/");
  const params = Object.fromEntries(parts.map((part) => part.split("=").map(decodeURIComponent)));
  if (group) assert.deepEqual(JSON.parse(params.requirements), [LOAN, SHELF], "trace hands the group's displayed order to the review flow");
  else assert.equal(params.name, LOAN);
  const route = reviewPages.routes.find((route) => route.name === name);
  assert.ok(route, "the public control reaches a declared review route");
  await route.render(s.target, s.viewContext, params);
  return params;
}

export async function prepare(s, { group = false, participant = "drafter", instruction = INSTRUCTION } = {}) {
  await fromTrace(s, group);
  const field = one(s.target, "textarea", "instruction");
  field.value = instruction;
  const selected = all(s.target, "input", "participant").find((input) => input.value === participant);
  assert.ok(selected, "the drafting participant is offered");
  selected.checked = true;
  await selected.fire("change");
  await press(s.server, one(s.target, "button", "prepare"));
  return one(s.target, "section", "run-panel");
}

export async function run(s, options = {}) {
  await prepare(s, options);
  await press(s.server, namedButton(s.target, "Run"));
  assert.equal(all(s.target, "section", "requirements-result").length, 1, `the job returns its requirement editor: ${s.target.textContent}`);
}

export async function save(s) { await press(s.server, namedButton(s.target, "Save")); }

export function assertProposal(s) {
  assert.equal(s.product.files["SPEC.md"], SPEC, "SPEC stays byte-identical before acceptance");
  assert.equal(proposalWrites(s).length, 1, "one Save produces one proposal commit for the affected section");
  const text = proposalTexts(s).join("\n");
  assert.match(text, /SRC-author, make visible/, "the prompting source reaches the saved proposal");
  assert.ok(!Object.keys(s.product.files).some((path) => path.startsWith("docs/approvals/")), "the generated proposal carries no acceptance");
  return text;
}

if (process.argv.includes(fileURLToPath(import.meta.url))) {
  // TST-418001
  // level: system
  // module: MOD-trace-pages; MOD-review-pages
  // guards: UC-019
  // given: the real dashboard's SPEC view at the product's current default branch
  // input: expand Lending, open A LOAN HAS A DUE DATE and follow Change by prompt
  // expect: the public dashboard exposes the prompt control and its address opens the instruction form
  test("TST-418001: the dashboard's public SPEC control opens the requirement prompt", async () => {
    const s = await scenario();
    const main = document.getElementById("main");
    let mounted = [];
    const replace = main.replaceChildren.bind(main);
    main.replaceChildren = (...nodes) => { mounted = nodes; replace(...nodes); };
    await s.page.go("#spec");
    const root = { get children() { return mounted; } };
    await press(s.server, one(root, "button", "spec-section-toggle"));
    await press(s.server, all(root, "button", "requirement-name").find((button) => button.textContent === LOAN));
    const link = one(root, "a", "requirement-prompt");
    await s.page.go(link.getAttribute("href"));
    assert.equal(all(root, "textarea", "instruction").length, 1, "the actual dashboard router opens the prompt form");
  });

  // TST-418002
  // level: system
  // module: MOD-trace-pages; MOD-review-pages; MOD-job-runner; MOD-runtimes; MOD-spec-changes; MOD-source-register
  // guards: UC-019
  // given: one requirement, a linked author source and a fixture drafting endpoint
  // input: public trace prompt control, instruction, participant, run panel, Run, edit the returned rule, Save
  // expect: one recorded job and the author's exact edit as one open proposal; SPEC is unchanged
  test("TST-418002: one requirement traverses trace, review, job and proposal Save", async () => {
    const s = await scenario();
    await run(s);
    assert.equal(s.endpointRequests.length, 1);
    assert.equal(proposalWrites(s).length, 0, "a draft alone writes no proposal");
    const edit = one(row(s), "textarea", "candidate-rule");
    edit.value = "Every loan displays a readable due date.";
    await edit.fire("input");
    await save(s);
    assert.match(assertProposal(s), /Every loan displays a readable due date\./);
    assert.equal(recordTexts(s).length, 1, "one job record covers the single Run");
  });

  // TST-418003
  // level: system
  // module: MOD-trace-pages; MOD-review-pages; MOD-job-runner; MOD-spec-changes
  // guards: UC-019
  // given: the Lending group's two requirements in its nonalphabetical display order and two changed candidates
  // input: public group Change by prompt, Run and Save
  // expect: the job preserves LOAN then SHELF, both changes are saved as one section proposal and SPEC is unchanged
  test("TST-418003: an ordered group traverses the same public flow", async () => {
    const s = await scenario({ answers: [draft(candidate(), candidate({ name: "A SHELF IS VISIBLE", of: SHELF, rule: "Every book displays its shelf." }))] });
    await run(s, { group: true });
    const record = recordTexts(s)[0];
    assert.match(record, /"requirements": \[\s*"A LOAN HAS A DUE DATE",\s*"A BOOK IS SHELVED"\s*\]/);
    await save(s);
    const text = assertProposal(s);
    assert.match(text, /Every book displays its shelf\./);
    assert.ok(text.indexOf(`**${LOAN}**`) < text.indexOf(`**${SHELF}**`));
  });

  // TST-418004
  // level: system
  // module: MOD-trace-pages; MOD-review-pages; MOD-source-register
  // guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE
  // given: the author source exists in the instance but is not linked by the product
  // input: public requirement Change by prompt (UC-019 4b)
  // expect: no request or write, with separate source-registration and source-linking controls
  test("TST-418004: missing personal source stops before a run", async () => {
    const s = await scenario({ linked: false });
    await fromTrace(s);
    assert.equal(all(s.target, "p", "no-source").length, 1);
    assert.equal(one(s.target, "a", "register-source").getAttribute("href"), "#library");
    assert.equal(one(s.target, "a", "link-source").getAttribute("href"), "#sources");
    assert.equal(s.endpointRequests.length, 0);
    assert.equal(s.product.writes.length, 0);
  });

  // TST-418005
  // level: system
  // module: MOD-review-pages; MOD-job-runner; MOD-spec-changes
  // guards: UC-019; A CONFLICT IS DECIDED BY A PERSON
  // given: a contradictory candidate returned by the endpoint
  // input: Run then Save without deciding, then choose change of LOAN and Save (UC-019 8a)
  // expect: no proposal while undecided, the conflict stays editable, and the person's decision allows a proposal
  test("TST-418005: an unresolved conflict is retained until its author's decision", async () => {
    const s = await scenario({ answers: [draft(candidate({ name: CONFLICT, class: "conflict", rule: "Every loan may hide its due date." }))] });
    await run(s);
    await save(s);
    assert.equal(proposalWrites(s).length, 0);
    assert.match(s.target.textContent, /ConflictUndecided/);
    const conflict = row(s, CONFLICT);
    one(conflict, "select", "class").value = "change";
    await save(s);
    assert.match(assertProposal(s), /Every loan may hide its due date\./);
  });

  // TST-418006
  // level: system
  // module: MOD-review-pages; MOD-spec-changes
  // guards: UC-019; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
  // given: an editable draft, followed by a concurrent commit changing the target section
  // input: Save (UC-019 9a)
  // expect: no proposal, with the exact draft retained beside the actual newer section
  test("TST-418006: a stale section refuses Save and retains the draft beside the newer text", async () => {
    const s = await scenario();
    await run(s);
    const edit = one(row(s), "textarea", "candidate-rule");
    edit.value = "Every loan displays the author's retained edit.";
    await s.product.change("SPEC.md", SPEC.replace(CURRENT_RULE, "Every loan states its updated due date."));
    const before = s.product.writes.length;
    await save(s);
    assert.equal(s.product.writes.length, before);
    assert.equal(edit.value, "Every loan displays the author's retained edit.");
    assert.match(one(s.target, "div", "newer").textContent, /Every loan states its updated due date\./);
  });
}
