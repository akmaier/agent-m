// ITM-1124: after a Save, the resources page's snapshot holds the saved list, so that Check on a resource saved in the same visit reads the list as saved
// (MOD-settings-pages, route `resources`: "Check ... a compute resource reached by a runner: a check job, prepared, shown ... and queued on a click"; UC-040 step 7b).
// The page is drawn by MOD-site-frame's frame over the fake GitHub of tests/settings-pages-sources.d/github.mjs, as tests/system-uc-040-declare-the-products-resources.test.mjs does
// (TST-1041019 there is the same path as a system test and carries its todo mark until this item is built; the setup below is copied from it). Nothing reaches the network.
// Run: node --test tests/settings-pages-resources-saved-check.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-040; A PRODUCT DECLARES ITS RESOURCES; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { setMaxListeners } from "node:events";
import { installDocument, byTag } from "./settings-pages-harness.mjs";
import { press, storedKeys } from "./settings-pages-setup.d/dom.mjs";
import { withClass } from "./settings-pages-sources.d/github.mjs";
import { visit as visitFrame, click, settle, go } from "./settings-pages-sources.d/frame.mjs";

installDocument();
setMaxListeners(100); // each visit starts a frame on a window of its own
// The entry page registers the strategies of the views the frame loads before it starts the frame (src/site-frame/start.mjs); this file does the same for the view it opens, once.
const { view } = await import("../src/settings-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
for (const strategies of view.strategies) registerStrategies("tests/settings-pages-resources-saved-check.test.mjs", strategies);

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "https://github.com/alice/thesis-tool";
const PRODUCT_REPO = "alice/thesis-tool";
const FRAGMENT = `#resources/product=${encodeURIComponent(PRODUCT)}`;
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";
const BRIDGE_TOKEN = "bridge-token-0123456789";
const RESOURCE_KEY = "sk-llm-key-0123456789abcdef";
const OLD = "b".repeat(40);
const CONTENT = "TEXT-OF-A-FILE-IN-THE-DECLARED-REPOSITORY";

const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const list = (title, ...rows) => `# Resources of ${title}\n\n${HEADER}\n${rows.join("\n")}\n`;
const DLLS = `| dlls | repository | https://github.com/alice/dlls | ${OLD} | MIT | the Acme organisation | read on its host | — | — | — |`;
const CLUSTER = "| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |";
const LLM = "| shared-llm | endpoint | http://workstation.example.org:8000/v1 | example-model | — | — | bridge workstation | the group's workstation | no | ci:LLM_KEY |";
const PRODUCT_LIST = list("thesis-tool", DLLS, CLUSTER);
const INSTANCE_LIST = list("agent-m", LLM, CLUSTER);
const PARTICIPANTS = ["# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| ci-drafter | CI agent | ci-model | 200000 | — | draft text, run code and tests | GitHub Actions in the USA | ci runner:gpu secret CI_KEY |", ""].join("\n");
const WORKFLOW = { ".github/workflows/agent-m-jobs.yml": "name: Agent M jobs\n" };

// A person opens the page at `fragment`: the frame started on the module view of MOD-settings-pages, over this browser's store with the instance's token, the product with its own, and the Bridges `bridges`.
function visit(t, fragment, { productFiles = { "docs/resources.md": PRODUCT_LIST, ...WORKFLOW }, instanceFiles = { "docs/resources.md": INSTANCE_LIST, "docs/participants.md": PARTICIPANTS },
  visibility = "private", bridges = {} } = {}) {
  return visitFrame(t, fragment, {
    repositories: { [INSTANCE]: { files: instanceFiles }, [PRODUCT_REPO]: { files: productFiles, visibility },
      "alice/dlls": { files: { "README.md": CONTENT } }, "alice/dlls2": { files: { "README.md": CONTENT } } },
    settings: { "github-token": { value: TOKEN, name: "Agent M · akmaier/agent-m", expires: "2027-01-01" }, products: [PRODUCT],
      [`github-token:${PRODUCT_REPO}`]: { value: PRODUCT_TOKEN, name: "Agent M · alice/thesis-tool", expires: "2027-01-01" },
      ...Object.fromEntries(Object.entries(bridges).map(([name, kept]) => [`bridge:${name}`, typeof kept === "string" ? { address: kept, token: BRIDGE_TOKEN } : kept])) },
  });
}

// What a person sees and presses.
const entry = (page, name) => byTag(page.main(), "section").find((section) => byTag(section, "h4")[0]?.textContent === name);
const names = (page) => byTag(page.main(), "h4").map((heading) => heading.textContent);
const line = (page, name, className) => withClass(entry(page, name), className)[0]?.textContent;
const labelled = (root, text) => byTag(root, "button").find((button) => button.textContent === text);
const formOf = (page) => withClass(page.main(), "schema-form")[0];
const areaOf = (page) => byTag(formOf(page), "textarea")[0];
const saveOf = (page) => byTag(formOf(page), "button").at(-1);
const marks = (page) => withClass(formOf(page), "marks")[0]?.textContent ?? "";
const result = (page) => withClass(page.main(), "resources-result")[0].textContent;
const note = (page) => withClass(page.main(), "resources-note")[0].textContent;
const typeInto = async (area, text) => { area.value = text; area.dispatchEvent(new Event("input")); await settle(); };
const commitsOf = (page, repository) => page.world.commits(repository);
const filesOf = (page, repository) => page.world.files(repository);
// The head the world gives a repository at its first state: the SHA-1 of "<owner>/<name>#0" (tests/settings-pages-sources.d/github.mjs).
const headOf = (repository) => createHash("sha1").update(`${repository}#0`).digest("hex");
async function add(page, kind, name, address) {
  const adding = withClass(page.main(), "resources-adding")[0];
  byTag(adding, "select")[0].value = kind;
  const [nameField, addressField] = byTag(adding, "input");
  nameField.value = name;
  addressField.value = address;
  await click(labelled(adding, "+ Add resource"));
}

const saveRunner = async (page, name, address) => {
  await add(page, "compute", name, address);
  await typeInto(areaOf(page), areaOf(page).value.replace(`| ${name} | compute | ${address} | — | — | — | — | — | — | — |`, `| ${name} | compute | ${address} | — | — | — | runner:gpu | the group's workstation | — | — |`));
  await click(saveOf(page));
};

// TST-1124001 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// given: the product page with the job workflow and a CI agent on the runner gpu; the person adds the compute resource gpu-box with the route runner:gpu and presses Save, and does not open the page again
// input: press Check on gpu-box
// expect: the run panel of the check job is shown for gpu-box, and no "ResourceNotFound" is said
// Planted fault: the page keeps the snapshot it opened (only its commit replaced) and Check says "no list of resources holds gpu-box".
test("TST-1124001 Check on a runner resource saved in the same visit prepares its check job", async (t) => {
  const page = await visit(t, FRAGMENT);
  await saveRunner(page, "gpu-box", "gpu01.example.org");
  await click(labelled(entry(page, "gpu-box"), "Check"));
  const out = withClass(entry(page, "gpu-box"), "resource-out")[0].textContent;
  assert.doesNotMatch(out, /ResourceNotFound/);
  assert.ok(withClass(entry(page, "gpu-box"), "run-panel")[0], out);
});

// TST-1124002 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b
// given: the page of TST-1124001 after the first Save; the person then adds a second runner resource, gpu-two, and saves again
// input: press Check on gpu-two, and on gpu-box
// expect: both show the run panel of their own job and neither says ResourceNotFound (the list the page reads holds both after the second Save)
// Planted fault: the snapshot is replaced by one that holds only the last row, or not replaced after the second Save, and one of the two says ResourceNotFound.
test("TST-1124002 after a second Save the page reads the list of both saves", async (t) => {
  const page = await visit(t, FRAGMENT);
  await saveRunner(page, "gpu-box", "gpu01.example.org");
  await saveRunner(page, "gpu-two", "gpu02.example.org");
  for (const name of ["gpu-two", "gpu-box"]) {
    await click(labelled(entry(page, name), "Check"));
    const out = withClass(entry(page, name), "resource-out")[0];
    assert.doesNotMatch(out.textContent, /ResourceNotFound/, name);
    const panel = withClass(entry(page, name), "run-panel")[0];
    assert.ok(panel, `${name}: ${out.textContent}`);
  }
});

// TST-1124003 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// given: the saved page of TST-1124001, then the person removes gpu-box from the list and saves
// input: read the entries of the page
// expect: gpu-box has no entry and so no Check: a resource the saved list does not hold is not checked (the counter-proof of TST-1124001)
// Planted fault: an entry kept after its removal offers a Check on a resource the list does not hold.
test("TST-1124003 a resource the saved list does not hold has no Check", async (t) => {
  const page = await visit(t, FRAGMENT);
  await saveRunner(page, "gpu-box", "gpu01.example.org");
  const removal = labelled(entry(page, "gpu-box"), "Remove");
  assert.ok(removal, "known positive: gpu-box has a Remove");
  await click(removal);
  if (saveOf(page) && !saveOf(page).disabled) await click(saveOf(page));
  assert.equal(entry(page, "gpu-box"), undefined);
});
