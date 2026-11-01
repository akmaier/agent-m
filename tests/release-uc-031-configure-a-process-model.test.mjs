// Release tests of UC-031 Configure a process model, the steps ITM-779 realises: 2 and 2a (Adapt, + New model), 3 and 6 (edit, Save, the model in the catalogue), 4 and 4a (the errors beside their fields while typed, Discard and keeping the draft), 5 and 5a (the plan's preview with its count) and 6b (the file changed since the editor opened it).
// The cases open the route `models/<name>` of MOD-implementation-pages as the address #models/name=<name> leads to it, drawn into a fixture DOM over the real MOD-repository-hosts GitHub host behind tests/app-harness.mjs' fake of
// GitHub's API (git-data commits included) and, for the product the preview reads, a second fake of GitHub. A person's click is the page's own listener called with a trusted event, a script's click one whose isTrusted is false;
// a person types by calling the field's own input listener; no input event of the operating system is made and nothing reaches the network. Each case states its input and its expected result in its own text (given / input /
// expect); every expected value is taken from the use case's step as quoted in the case or from the fixture the case builds, none from the code. The page is found by what UC-031 names - the form's parts by their headings, a
// finding by the part it stands beside, the buttons by their texts (Save, Discard) - and the model written is read back by MOD-model-catalogue's catalogue, as UC-002 reads it.
// Run: node --test tests/release-uc-031-configure-a-process-model.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-031; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A PLAN COVERS THE WHOLE SPECIFICATION; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; DIAGRAMS ARE MERMAID IN MARKDOWN; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: release
//
// Written for the release testing of sprint 141 by developer-sonnet-l, who implemented none of ITM-779 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Where the page and UC-031 disagree the case follows UC-031 and is marked
// `todo` with the word FINDING. Readings the texts leave open, which the cases state:
//   - "beside the field that causes it" is read as: in the form part the fault is typed into (the part holding the row, or the key), naming the fault; "Save becomes available" as: the form's Save is not disabled.
//   - "a phase no transition reaches" is read as a finding beside the part of the phases or of the transitions, either of which names the phase.
//   - "commits the definition ... under docs/process-models/ of the instance" is read as: one commit on the default branch of the instance, adding the one file docs/process-models/<name>.md for the name typed.
//   - "keep it in this browser to finish later" (4a) is read as a control of the page that says so, and a draft that is offered again when the editor is opened anew.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./site-frame-dom.mjs";
import { repoServer } from "./app-harness.mjs";
import { classed, open, settle, typeInto, walk } from "./uc-032-harness.mjs";
import { catalogue } from "../src/model-catalogue/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { blobSha } from "../src/text-tools/index.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const SHIPPED = Object.fromEntries(["waterfall", "v-model", "reuse-oriented", "scrum", "kanban"].map((name) => [`src/model-catalogue/models/${name}.md`, read(`src/model-catalogue/models/${name}.md`)]));
const INSTANCE = { ...SHIPPED, "README.md": "# Agent M\n" };
const PHASES = ["Concept", "Requirements", "Design", "Implementation", "Testing", "Validation & Verification", "Operation & Maintenance"];
const ADAPTED = "docs/process-models/v-model-adapted.md";
const LIBRARY = "https://github.com/alice/library";
const BARE = "https://github.com/alice/bare";

// ---------------------------------------------------------------- the page, as a person reads and fills it

const editorOf = (page) => classed(page.target, "model-editor")[0];
const heading = (page) => walk(editorOf(page), (node) => node.localName === "h2")[0].textContent;
const fieldOf = (page, key) => walk(page.target, (node) => node.getAttribute("data-key") === key)[0];
const valueOf = (page, key) => fieldOf(page, key).getElementsByTagName("input")[0].value;
const sectionOf = (page, part) => walk(page.target, (node) => node.getAttribute("data-section") === part)[0];
const areaOf = (page, part) => sectionOf(page, part).getElementsByTagName("textarea")[0];
// The findings standing beside a part: the lines of its marks and its list of findings, not the text of the part itself.
const findingsIn = (field) => [...classed(field, "marks"), ...classed(field, "findings")].map((list) => list.textContent).join("\n").trim();
const besideSection = (page, part) => findingsIn(sectionOf(page, part));
const besideKey = (page, key) => findingsIn(fieldOf(page, key));
const saveOf = (page) => walk(classed(page.target, "schema-form")[0], (node) => node.localName === "button" && node.textContent === "Save").at(-1);
const disabledOf = (control) => control.disabled === true || control.getAttribute("disabled") !== null;
const typeSection = (page, part, text) => typeInto(areaOf(page, part), text);
const typeKey = (page, key, text) => typeInto(fieldOf(page, key).getElementsByTagName("input")[0], text);
const addRow = (page, part, row) => typeSection(page, part, `${areaOf(page, part).value.trimEnd()}\n${row}\n`);
async function replaceIn(page, part, from, to) {
  const before = areaOf(page, part).value;
  const after = before.replace(from, to);
  assert.notEqual(after, before, `known positive: "${from}" stands in ${part}`);
  await typeSection(page, part, after);
}
const diagramOf = (page) => classed(page.target, "model-diagram")[0].textContent;
const previewOf = (page) => classed(page.target, "plan-preview")[0];
const kindButton = (page, kind) => walk(page.target, (node) => node.getAttribute("data-kind") === kind)[0];
const previewButton = (page, address) => walk(previewOf(page), (node) => node.getAttribute("data-preview-product") === address)[0];
const commitsOf = (page) => page.srv.writes;
// The harness's fake fast-forwards the ref refs/heads/main with the one request it counts as "write ref".
const movedMain = (page) => page.srv.requests.filter((what) => what === "write ref");

// Storage as the browser holds it, and this browser's store: the instance's, the products it manages and the token of each.
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function browserStore(products = [LIBRARY, BARE]) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("akmaier/agent-m");
  writeSetting(store, "products", products);
  for (const name of ["library", "bare"]) writeSetting(store, `github-token:alice/${name}`, { value: `github_pat_${name.toUpperCase()}0123456789abcdefghij`, name, expires: "2027-01-01" });
  return store;
}

// A product the preview reads: its repository behind a fake of GitHub of its own, which the instance's fake hands the requests for it.
const requirement = (name) => [`**${name}** *(PO A. Maier)*`, `The rule ${name}.`, "*Check:* no automatic check; at review.", ""];
const specOf = (...names) => ["# SPEC", "", "## 1. Rules", "", ...names.flatMap(requirement)].join("\n");
const NOTHING = (url) => (/\/(pulls|tags|commits)$/.test(url.pathname) ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } })
  : /\/actions\/runs$/.test(url.pathname) ? new Response(JSON.stringify({ total_count: 0, workflow_runs: [] }), { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);
async function products() {
  const library = await repoServer({ repo: "alice/library", head: "1".repeat(40), files: { "SPEC.md": specOf("A LOAN HAS A DUE DATE", "A LATE LOAN IS NAMED", "A RETURN IS RECORDED") }, handlers: [NOTHING] });
  const bare = await repoServer({ repo: "alice/bare", head: "2".repeat(40), files: { "README.md": "# A product with no SPEC yet\n" }, handlers: [NOTHING] });
  const answers = (url, init) => (url.pathname.startsWith("/repos/alice/library") || url.pathname.startsWith("/alice/library/") || String(init.body ?? "").includes('"name":"library"') ? library.fetch(url, init)
    : url.pathname.startsWith("/repos/alice/bare") || url.pathname.startsWith("/alice/bare/") || String(init.body ?? "").includes('"name":"bare"') ? bare.fetch(url, init) : undefined);
  return { library, bare, answers };
}

// The editor opened as the address #models/name=<name> leads to it, with the folded explanations and the product's servers around it.
async function edit(name, { files = INSTANCE, withProducts = false } = {}) {
  const around = withProducts ? await products() : null;
  const page = await open("models", { name }, { files, store: browserStore(), server: around ? [around.answers] : [] });
  await settle();
  return Object.assign(page, { around });
}

// The catalogue as UC-002 reads it from the instance's files after a commit.
function snapshotOf(files) {
  const held = { ...files };
  return { repository: { server: "github", path: "akmaier/agent-m" }, ref: "main", commit: "9".repeat(40), paths: Object.keys(held), read: async (path) => held[path] ?? null, readMany: async () => {},
    blob: () => null };
}

// A minimal planned model of two phases, typed into + New model: every part of the definition, nothing more.
const TINY = {
  name: "tiny-plan",
  "## Phases": "| Name | Role | Produces |\n|---|---|---|\n| Specify | Owner | requirements |\n| Build | Builder | MOD |\n",
  "## Transitions": "| From | To | Kind |\n|---|---|---|\n| Specify | Build | sequence |\n",
  "## Verification pairs": "| Phase | Checked by |\n|---|---|\n| Specify | Build |\n",
  "## Gates": "| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Specify → Build | the requirements | every requirement states how it is checked | Owner |\n",
  "## Roles": "| Name | Filled by | How many | Capabilities |\n|---|---|---|---|\n| Owner | person | one | read the repository |\n| Builder | either | several | read the repository, write to the repository |\n",
};

// TST-779101 · level: release · module: MOD-implementation-pages
// guards: UC-031; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; DIAGRAMS ARE MERMAID IN MARKDOWN
// given: an instance whose catalogue holds the shipped V-model (7 phases, 3 gates decided by Reviewer) and no model of its own
// input: the author opens Adapt on the V-model; reads the live diagram; adds the gate "Implementation → Testing" that checks the threat model ARC, decided by the new role Security reviewer (either, one, read the repository); renames the model v-model-with-security-review; a script presses Save, then the person
// expect: UC-031 step 2 "opens an editor on a copy with a new name": headed "Adapt v-model", the name is not v-model, the form names the model it was adapted from (v-model) and holds the V-model's 7 phases, and a diagram of the 7 phases stands next to it; step 3: the diagram first shows no Security reviewer and, once the gate and the role are typed, shows it; step 6 "one click": the script's click commits nothing and the person's click makes one commit on the default branch that adds only docs/process-models/v-model-with-security-review.md, which "records the definition it was adapted from" (adapted_from: v-model), holds the gate decided by Security reviewer, and is read by the catalogue without a finding; step 7: the route models then lists v-model-with-security-review among the instance's own models, as a planned model
test("TST-779101: UC-031 2, 3, 6, 7: Adapt opens a copy, the author adds a gate and a role, and Save commits it once as a model the catalogue reads", async () => {
  const page = await edit("v-model");
  try {
    assert.equal(heading(page), "Adapt v-model");
    assert.notEqual(valueOf(page, "name"), "v-model");
    assert.equal(valueOf(page, "adapted_from"), "v-model");
    for (const phase of PHASES) assert.ok(areaOf(page, "## Phases").value.includes(`| ${phase} |`), `the copy holds the phase ${phase}`);
    for (const phase of PHASES) assert.ok(diagramOf(page).includes(`"${phase.replace("&", "&amp;")}"`) || diagramOf(page).includes(`"${phase}"`), `the diagram shows ${phase}`);
    assert.doesNotMatch(diagramOf(page), /Security reviewer/, "known positive: the diagram shows a gate's decider, and none is Security reviewer yet");
    assert.match(diagramOf(page), /Reviewer/);
    await addRow(page, "## Gates", "| Implementation → Testing | the threat model ARC | a person has accepted the threat model | Security reviewer |");
    await addRow(page, "## Roles", "| Security reviewer | either | one | read the repository |");
    assert.match(diagramOf(page), /Security reviewer/, "the diagram follows the typing");
    await typeKey(page, "name", "v-model-with-security-review");
    assert.equal(disabledOf(saveOf(page)), false, "the definition has no error, so Save is available");
    await page.script(saveOf(page));
    assert.equal(commitsOf(page).length, 0, "a script's click commits nothing");
    await page.press(saveOf(page));
    assert.equal(commitsOf(page).length, 1, "one click, one commit");
    assert.equal(movedMain(page).length, 1, "on the default branch");
    assert.deepEqual(Object.keys(commitsOf(page)[0].files), ["docs/process-models/v-model-with-security-review.md"]);
    const written = commitsOf(page)[0].files["docs/process-models/v-model-with-security-review.md"];
    assert.match(written, /^adapted_from: v-model$/m);
    const read = await catalogue(snapshotOf({ ...SHIPPED, ...commitsOf(page)[0].files }));
    const model = read.models.find((candidate) => candidate.name === "v-model-with-security-review");
    assert.ok(model, "the catalogue reads the model");
    assert.equal(model.adaptedFrom, "v-model");
    assert.ok(model.gates.some((gate) => gate.from === "Implementation" && gate.to === "Testing" && gate.decider === "Security reviewer"));
    assert.deepEqual(read.findings["docs/process-models/v-model-with-security-review.md"], []);
    const list = await open("models", {}, { files: { ...INSTANCE, ...commitsOf(page)[0].files }, store: browserStore(), server: [] });
    try {
      const own = classed(list.target, "own-models")[0];
      const listed = walk(own, (node) => node.getAttribute("data-model") === "v-model-with-security-review")[0];
      assert.ok(listed, "step 7: the model appears among the instance's own");
      assert.equal(classed(listed, "kind")[0].textContent, "planned");
    } finally { list.done(); }
  } finally { page.done(); }
});

// TST-779102 · level: release · module: MOD-implementation-pages
// guards: UC-031; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
// given: the editor on the adapted V-model, which has no error
// input: for each fault UC-031 step 4 lists that applies to a planned model, the author types it into the part that holds it: a transition to the phase Nowhere; a phase Orphan that no transition reaches; a verification pair naming the phase Ghost; a gate without artifacts, without a condition, without a decider; a role without capabilities; a phase without a role; a gate that checks the TST files before any phase produces them; a progress measure that does not fit the kind of work (the planned V-model's measure typed as "remaining items per time box"); then the fault is undone; the person presses Save with the fault typed
// expect: each fault is named beside the part it was typed into (the text of the part names the fault: Nowhere, Orphan, Ghost, the missing column or the role), Save is unavailable and the person's click commits nothing; with the fault undone the finding is gone and Save is available again; known positive: the copy as opened has none of these findings and Save is available
test("TST-779102: UC-031 4: each fault of step 4 is listed beside its part while the author types, Save is unavailable and nothing is committed", async () => {
  const faults = [
    ["a transition naming a phase that is not defined", "## Transitions", (page) => replaceIn(page, "## Transitions", "| Validation & Verification | Operation & Maintenance | sequence |", "| Validation & Verification | Nowhere | sequence |"), /Nowhere/],
    ["a phase no transition reaches", "## Phases", (page) => addRow(page, "## Phases", "| Orphan | Developer | — |"), /Orphan/],
    ["a verification pair naming a missing phase", "## Verification pairs", (page) => addRow(page, "## Verification pairs", "| Ghost | Testing |"), /Ghost/],
    ["a gate without artifacts", "## Gates", (page) => replaceIn(page, "## Gates", "| the requirements | each requirement", "|  | each requirement"), /artifacts/i],
    ["a gate without a condition", "## Gates", (page) => replaceIn(page, "## Gates", "| each requirement states how it will be checked on the way back up |", "|  |"), /condition/i],
    ["a gate without a decider", "## Gates", (page) => replaceIn(page, "## Gates", "| the verification is documented before the release | Reviewer |", "| the verification is documented before the release |  |"), /decider/i],
    ["a role without capabilities", "## Roles", (page) => replaceIn(page, "## Roles", "| Reviewer | either | several | read the repository |", "| Reviewer | either | several |  |"), /capabilities/i],
    ["a phase without a role", "## Phases", (page) => replaceIn(page, "## Phases", "| Concept | Product owner | — |", "| Concept |  | — |"), /role/i],
    ["a gate that checks an artifact kind no earlier phase produces", "## Gates", (page) => addRow(page, "## Gates", "| Requirements → Design | the TST files of the testing | the tests exist | Reviewer |"), /TST/],
  ];
  const clean = await edit("v-model");
  try {
    assert.equal(disabledOf(saveOf(clean)), false, "known positive: the copy as opened can be saved");
    for (const part of ["## Phases", "## Transitions", "## Verification pairs", "## Gates", "## Roles"]) assert.equal(besideSection(clean, part), "", `known positive: no finding stands beside ${part} as opened`);
  } finally { clean.done(); }
  for (const [what, part, type, naming] of faults) {
    const page = await edit("v-model");
    try {
      const original = areaOf(page, part).value;
      await type(page);
      const parts = /Orphan/.test(naming.source) ? ["## Phases", "## Transitions"] : [part];
      const beside = parts.map((one) => besideSection(page, one)).join("\n");
      assert.match(beside, naming, `${what}: named beside ${part}`);
      assert.equal(disabledOf(saveOf(page)), true, `${what}: Save is unavailable`);
      await page.press(saveOf(page));
      assert.equal(commitsOf(page).length, 0, `${what}: nothing is committed`);
      await typeSection(page, part, original);
      for (const one of parts) assert.equal(besideSection(page, one), "", `${what}: the finding is gone once undone`);
      assert.equal(disabledOf(saveOf(page)), false, `${what}: Save is available again`);
    } finally { page.done(); }
  }
  const pulled = await edit("v-model");
  try {
    await typeKey(pulled, "measure", "remaining items per time box");
    assert.match(besideKey(pulled, "measure"), /measure/i, "a progress measure that does not fit the kind of work is named beside the measure");
    assert.equal(disabledOf(saveOf(pulled)), true);
    await pulled.press(saveOf(pulled));
    assert.equal(commitsOf(pulled).length, 0);
  } finally { pulled.done(); }
});

// TST-779103 · level: release · module: MOD-implementation-pages
// guards: UC-031; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
// given: the editor on the adapted Scrum, a pulled model whose Flow control holds a time box of 1 week and no WIP limit
// input: the author types a WIP limit of 3 as well; then removes the time box; then removes the WIP limit too; the person presses Save with each of the three typed
// expect: UC-031 step 4 "for pulled work, neither a time box nor a WIP limit, or both": with both, the part Flow control names the fault and Save is unavailable; with only the WIP limit, Save is available; with neither, the part names the fault and Save is unavailable; a click on Save while unavailable commits nothing; known positive: the copy as opened (the time box only) has no such finding and Save is available
test("TST-779103: UC-031 4: a pulled model with both a time box and a WIP limit, or with neither, is named beside Flow control and cannot be saved", async () => {
  const page = await edit("scrum");
  try {
    const flow = areaOf(page, "## Flow control").value;
    assert.match(flow, /\| Time box \| 1 week \|/, "known positive: the copy holds the time box");
    assert.equal(disabledOf(saveOf(page)), false, "known positive: the copy as opened can be saved");
    const naming = /time box|WIP/i;
    await typeSection(page, "## Flow control", flow.replace("| WIP limit | — |", "| WIP limit | 3 |"));
    assert.match(besideSection(page, "## Flow control"), naming, "both");
    assert.equal(disabledOf(saveOf(page)), true);
    await page.press(saveOf(page));
    assert.equal(commitsOf(page).length, 0);
    await typeSection(page, "## Flow control", flow.replace("| WIP limit | — |", "| WIP limit | 3 |").replace("| Time box | 1 week |", "| Time box | — |"));
    assert.equal(disabledOf(saveOf(page)), false, "the WIP limit alone is a flow control");
    await typeSection(page, "## Flow control", flow.replace("| Time box | 1 week |", "| Time box | — |"));
    assert.match(besideSection(page, "## Flow control"), naming, "neither");
    assert.equal(disabledOf(saveOf(page)), true);
    await page.press(saveOf(page));
    assert.equal(commitsOf(page).length, 0);
  } finally { page.done(); }
});

// TST-779104 · level: release · module: MOD-implementation-pages
// guards: UC-031; A PLAN COVERS THE WHOLE SPECIFICATION
// given: the editor on the adapted V-model (7 phases); this browser manages alice/library, whose SPEC holds three requirements (A LOAN HAS A DUE DATE, A LATE LOAN IS NAMED, A RETURN IS RECORDED)
// input: the page as opened; then the author picks alice/library for the preview
// expect: UC-031 step 5 "a preview of the plan the definition would produce for a product the author picks": before the pick no request reaches alice/library; after it, the preview says "3 requirements × 7 phases = 21 plan entries" and "Every accepted requirement of that product appears once in every phase": each of the 7 phases lists exactly the three requirements, once each
test("TST-779104: UC-031 5: the preview of a product the author picks holds every accepted requirement once in every phase, with the count", async () => {
  const page = await edit("v-model", { withProducts: true });
  try {
    assert.equal(page.around.library.requests.length, 0, "nothing of the product is read before it is picked");
    await page.press(previewButton(page, LIBRARY));
    await settle();
    assert.ok(page.around.library.requests.length > 0, "known positive: picking the product reads it");
    assert.equal(classed(previewOf(page), "plan-count")[0].textContent, "3 requirements × 7 phases = 21 plan entries");
    const phases = classed(previewOf(page), "plan-phase");
    assert.deepEqual(phases.map((phase) => phase.getAttribute("data-phase")), PHASES);
    for (const phase of phases) {
      assert.deepEqual(walk(phase, (node) => node.localName === "li").map((entry) => entry.textContent).sort(), ["A LATE LOAN IS NAMED", "A LOAN HAS A DUE DATE", "A RETURN IS RECORDED"], phase.getAttribute("data-phase"));
    }
  } finally { page.done(); }
});

// TST-779105 · level: release · module: MOD-implementation-pages
// guards: UC-031; A PLAN COVERS THE WHOLE SPECIFICATION
// given: the editor on the adapted V-model; this browser manages alice/bare, which has no accepted requirement
// input: the author picks alice/bare for the preview
// expect: UC-031 5a "The preview says so, and shows the plan's structure as empty phases": the preview says that alice/bare has no accepted requirements, its count is "0 requirements × 7 phases = 0 plan entries", and the 7 phases stand with no entry
test("TST-779105: UC-031 5a: a product without accepted requirements shows the plan's phases empty and says so", async () => {
  const page = await edit("v-model", { withProducts: true });
  try {
    await page.press(previewButton(page, BARE));
    await settle();
    assert.match(previewOf(page).textContent, /no accepted requirements/i);
    assert.equal(classed(previewOf(page), "plan-count")[0].textContent, "0 requirements × 7 phases = 0 plan entries");
    const phases = classed(previewOf(page), "plan-phase");
    assert.equal(phases.length, 7);
    for (const phase of phases) assert.equal(walk(phase, (node) => node.localName === "li").length, 0, phase.getAttribute("data-phase"));
  } finally { page.done(); }
});

// TST-779106 · level: release · module: MOD-implementation-pages
// guards: UC-031; A PLAN COVERS THE WHOLE SPECIFICATION
// given: the editor on the adapted V-model with alice/library picked for the preview (3 requirements); and the editor on the adapted Scrum, a pulled model
// input: the author adds the phase Security review (role Reviewer, produces nothing) after Testing, with a transition Testing → Security review; and the pulled model's editor is drawn
// expect: UC-031 step 5 is for a *planned* model: the count follows the definition as typed, "3 requirements × 8 phases = 24 plan entries", and the new phase lists the three requirements; the editor of the pulled model shows no preview of a plan (its preview is hidden)
test("TST-779106: UC-031 5: the preview follows the definition typed, and a pulled model has none", async () => {
  const page = await edit("v-model", { withProducts: true });
  try {
    await page.press(previewButton(page, LIBRARY));
    await settle();
    assert.equal(classed(previewOf(page), "plan-count")[0].textContent, "3 requirements × 7 phases = 21 plan entries", "known positive: the preview as opened");
    await addRow(page, "## Phases", "| Security review | Reviewer | — |");
    await addRow(page, "## Transitions", "| Testing | Security review | sequence |");
    await settle();
    assert.equal(classed(previewOf(page), "plan-count")[0].textContent, "3 requirements × 8 phases = 24 plan entries");
    const added = classed(previewOf(page), "plan-phase").find((phase) => phase.getAttribute("data-phase") === "Security review");
    assert.deepEqual(walk(added, (node) => node.localName === "li").map((entry) => entry.textContent).sort(), ["A LATE LOAN IS NAMED", "A LOAN HAS A DUE DATE", "A RETURN IS RECORDED"]);
  } finally { page.done(); }
  const pulled = await edit("scrum", { withProducts: true });
  try {
    assert.equal(valueOf(pulled, "kind"), "pulled");
    assert.ok(previewOf(pulled).hidden === true || previewOf(pulled) === undefined, "a pulled model has no plan preview");
  } finally { pulled.done(); }
});

// TST-779107 · level: release · module: MOD-implementation-pages
// guards: UC-031; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: an instance with no model of its own
// input: the author chooses + New model (the route models with the empty name); picks the kind planned; reads the form; types the name tiny-plan and the five parts of a two-phase model; the person presses Save
// expect: UC-031 2a "The author first picks the kind of work, and Agent M adapts the form to it": before the pick the page asks for the kind (planned or pulled) and shows no form; after planned the form holds kind planned and no Flow control, with Save unavailable (no name, no phase); once the name and the parts are typed Save is available and the person's click makes one commit that adds docs/process-models/tiny-plan.md alone, which names no model it was adapted from and which the catalogue reads without a finding
test("TST-779107: UC-031 2a: + New model first asks for the kind of work, and a model typed from nothing is saved as a model the catalogue reads", async () => {
  const page = await edit("");
  try {
    assert.deepEqual([kindButton(page, "planned")?.textContent, kindButton(page, "pulled")?.textContent], ["planned", "pulled"]);
    assert.equal(classed(page.target, "schema-form").length, 0, "no form before the kind is picked");
    await page.press(kindButton(page, "planned"));
    assert.equal(valueOf(page, "kind"), "planned");
    assert.equal(disabledOf(saveOf(page)), true, "nothing typed yet, so Save is unavailable");
    await typeKey(page, "name", TINY.name);
    for (const part of ["## Phases", "## Transitions", "## Verification pairs", "## Gates", "## Roles"]) await typeSection(page, part, TINY[part]);
    assert.equal(disabledOf(saveOf(page)), false, "the definition has no error, so Save is available");
    await page.press(saveOf(page));
    assert.equal(commitsOf(page).length, 1);
    assert.deepEqual(Object.keys(commitsOf(page)[0].files), ["docs/process-models/tiny-plan.md"]);
    assert.doesNotMatch(commitsOf(page)[0].files["docs/process-models/tiny-plan.md"], /adapted_from: ./);
    const read = await catalogue(snapshotOf({ ...SHIPPED, ...commitsOf(page)[0].files }));
    const model = read.models.find((candidate) => candidate.name === "tiny-plan");
    assert.equal(model.kind, "planned");
    assert.deepEqual(model.phases.map((phase) => phase.name), ["Specify", "Build"]);
    assert.deepEqual(read.findings["docs/process-models/tiny-plan.md"], []);
  } finally { page.done(); }
  const pulled = await edit("");
  try {
    await pulled.press(kindButton(pulled, "pulled"));
    assert.equal(valueOf(pulled, "kind"), "pulled");
    for (const row of ["WIP limit", "Time box", "Sprints"]) assert.ok(areaOf(pulled, "## Flow control").value.includes(`| ${row} |`), `a pulled model's form holds ${row}`);
  } finally { pulled.done(); }
});

// TST-779108 · level: release · module: MOD-implementation-pages
// guards: UC-031
// given: the editor on the adapted V-model, opened at the instance's head; after it opened, someone else commits docs/process-models/v-model-adapted.md in the repository as "# Someone else's model"
// input: the person presses Save
// expect: UC-031 6b "Nothing is written. Agent M shows both versions and asks the author to decide": no commit is made, the file in the repository is still the other version; the page shows the repository's version ("# Someone else's model") and the author's (name: v-model-adapted); the author's definition stays in the form; known positive: without the other commit the same click commits once
test("TST-779108: UC-031 6b: a file changed in the repository since the editor opened it is not written, and both versions are shown", async () => {
  const same = await edit("v-model");
  try {
    await same.press(saveOf(same));
    assert.equal(commitsOf(same).length, 1, "known positive: with no other commit the click commits");
  } finally { same.done(); }
  const page = await edit("v-model");
  try {
    await page.srv.change(ADAPTED, "# Someone else's model\n");
    const before = commitsOf(page).length;
    await page.press(saveOf(page));
    assert.equal(commitsOf(page).length, before, "nothing is written");
    assert.equal(page.srv.files[ADAPTED], "# Someone else's model\n");
    const shown = editorOf(page).textContent;
    assert.match(shown, /Someone else's model/, "the repository's version is shown");
    assert.match(shown, /name: v-model-adapted/, "the author's version is shown");
    assert.equal(valueOf(page, "name"), "v-model-adapted", "the author's definition stays in the form");
  } finally { page.done(); }
});

// TST-779109 · level: release · module: MOD-implementation-pages
// guards: UC-031
// given: the editor on the adapted V-model with a fault typed (a transition to Nowhere), so that the definition stays invalid
// input: the author reads the page for what to do with the draft; presses Discard
// expect: UC-031 4a "The author can discard the draft": the page offers Discard, a link that leads back to the list of the process models (#models); "An invalid definition is never committed": no commit was made
test("TST-779109: UC-031 4a: an invalid draft can be discarded, and is never committed", async () => {
  const page = await edit("v-model");
  try {
    await replaceIn(page, "## Transitions", "| Validation & Verification | Operation & Maintenance | sequence |", "| Validation & Verification | Nowhere | sequence |");
    const discard = walk(page.target, (node) => node.localName === "a" && node.textContent === "Discard");
    assert.equal(discard.length, 1, "Discard is offered");
    assert.equal(discard[0].getAttribute("href"), "#models");
    assert.equal(commitsOf(page).length, 0);
  } finally { page.done(); }
});

// TST-779110 · level: release · module: MOD-implementation-pages
// guards: UC-031
// given: the editor on the adapted V-model with a fault typed (a transition to Nowhere), so that the definition stays invalid
// input: the author reads the page for a way to keep the draft in this browser
// expect: UC-031 4a "The author can discard the draft, or keep it in this browser to finish later": next to Discard the page offers a control that keeps the draft in this browser (a button or link whose text names keeping it and this browser)
test("TST-779110: UC-031 4a: the author can keep an invalid draft in this browser to finish later",
  { todo: "FINDING UC-031-4A — the editor offers Discard only: the draft is kept on the screen, since MOD-implementation-pages' Uses name no write to the browser's store (ITM-779's Reading names this gap of the architecture; no backlog item builds the control yet)" }, async () => {
    const page = await edit("v-model");
    try {
      await replaceIn(page, "## Transitions", "| Validation & Verification | Operation & Maintenance | sequence |", "| Validation & Verification | Nowhere | sequence |");
      const keeps = walk(page.target, (node) => ["button", "a"].includes(node.localName) && /keep/i.test(node.textContent) && /browser/i.test(node.textContent));
      assert.ok(keeps.length >= 1, "a control keeps the draft in this browser");
    } finally { page.done(); }
  });

// TST-779111 · level: release · module: MOD-implementation-pages
// guards: UC-031; EVERY STEP EXPLAINS ITSELF
// given: the editor on the adapted V-model, and the page of + New model before the kind is picked
// input: the folded explanations of the editor's parts
// expect: UC-031 "Every part carries a folded What is this? It explains, for someone new to software processes, what a phase, a verification pair and a gate are, with a pointer to book ch. 6 (plan-driven) or ch. 7": the form, the diagram, the preview and the choice of the kind each hold a folded <details> (not open) headed "What is this?"; the diagram's holds a phase, a verification pair and a gate, and chapters 6 and 7
test("TST-779111: UC-031 explains: every part of the editor carries a folded What is this?, the diagram's naming phase, verification pair and gate", async () => {
  const adapted = await edit("v-model");
  const fresh = await edit("");
  try {
    for (const [page, part] of [[adapted, "model-form"], [adapted, "model-picture"], [adapted, "plan-preview"], [fresh, "kind-choice"]]) {
      const folded = walk(classed(page.target, part)[0], (node) => node.localName === "details");
      assert.ok(folded.length >= 1, `${part} carries an explanation`);
      assert.equal(folded[0].hasAttribute("open"), false, `${part}: folded`);
      assert.equal(folded[0].children[0].textContent, "What is this?", part);
      assert.ok(folded[0].textContent.length > "What is this?".length + 40, `${part}: a text, not an empty fold`);
    }
    const picture = walk(classed(adapted.target, "model-picture")[0], (node) => node.localName === "details")[0].textContent;
    assert.match(picture, /phase/i);
    assert.match(picture, /verification pair/i);
    assert.match(picture, /gate/i);
    assert.match(picture, /chapters? 6/);
    assert.match(picture, /7/);
  } finally { adapted.done(); fresh.done(); }
});

// TST-779112 · level: release · module: MOD-implementation-pages
// guards: UC-031
// given: the page of + New model
// input: the author picks the kind planned; then, on another page of + New model, the kind pulled
// expect: UC-031 2a "The author first picks the kind of work, and Agent M adapts the form to it", with the table's "Flow control (pulled only)": the form of the planned model holds no Flow control section; the form of the pulled model holds one; known positive: the pulled form's Flow control holds the rows WIP limit, Time box and Sprints
test("TST-779112: UC-031 2a: the form of a planned model has no Flow control, which is for pulled work only",
  { todo: "FINDING UC-031-2A-FLOW — the form of + New model for the kind planned still shows an empty Flow control section, though UC-031 marks flow control as pulled only (MOD-implementation-pages process.mjs, the editor of `models/<name>`; a backlog item to be added by the Product Owner)" }, async () => {
    const pulled = await edit("");
    try {
      await pulled.press(kindButton(pulled, "pulled"));
      assert.ok(sectionOf(pulled, "## Flow control") !== undefined, "known positive: the pulled form holds Flow control");
      for (const row of ["WIP limit", "Time box", "Sprints"]) assert.ok(areaOf(pulled, "## Flow control").value.includes(`| ${row} |`), row);
    } finally { pulled.done(); }
    const planned = await edit("");
    try {
      await planned.press(kindButton(planned, "planned"));
      assert.equal(sectionOf(planned, "## Flow control") === undefined, true, "a planned model's form has no Flow control section");
    } finally { planned.done(); }
  });
