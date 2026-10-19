// MOD-settings-pages' route `resources` — a product's resources, or the instance's (ITM-642), as docs/architecture/MOD-settings-pages.md and UC-040 state them: the list
// `docs/resources.md` of the repository the page is drawn for, grouped by kind with each entry's pin, licence, maintainer, route, processing place and the name of its secret;
// *+ Add resource* (a repository is pinned to its host's head), *Edit the list*, *Remove* and *Copy from the instance* open the list in a form whose *Save* is the person's own commit;
// *Check* shows a newer state upstream beside the pin and *Move* commits the new pin in one click; a compute resource reached by a runner is checked by a check job, shown in the run
// panel and queued on the person's click; each step carries its folded explanation. The route is rendered into the fixture DOM of tests/settings-pages-harness.mjs over MOD-repository-hosts'
// real GitHub host (connect), answered by a fake of fetch over repositories that hold files (tests/settings-pages-sources.d/github.mjs); nothing reaches the network.
// Run: node --test tests/settings-pages-resources.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-040; A PRODUCT DECLARES ITS RESOURCES; THE INSTANCE DECLARES ITS OWN RESOURCES; INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// Each test names its input and states its expected result in its own text (given / input / expect) before it runs; no expected value is read from a document, and none from the code.
// Where the texts leave a reading open, the tests state the reading they take, and the pull request names it with its source:
//   - `resources/instance` is the route `resources` with no product (ITM-642's reading of MOD-site-frame.md:117).
//   - A repository's pin is the head of its default branch, read through the host of its address; its licence and maintainer are entered by the person (no interface of the page's uses gives them).
//   - The check job works on UC-040 (a job's works_on holds identifiers, not a resource's name); the resource it checks is its parameter `resource`.
//   - schemaForm gives the section under the title of resources.schema.md a field, headed by the title line (src/site-frame/forms.mjs).
//   - The jobs and tests that name a resource, on *Move* and *Remove*, are ITM-1030's; the Bridge's probe and the Hugging Face Hub's revision are ITM-995's and ITM-996's, built into ITM-997.
// The counter-proofs (a planted fault in src/settings-pages/ and the test's failing result) are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { installDocument, byTag, click, turn } from "./settings-pages-harness.mjs";
import { attachedTarget, buttonLabelled, freshStore, press } from "./settings-pages-setup.d/dom.mjs";
import { githubWorld, installWorld, settled, withClass } from "./settings-pages-sources.d/github.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const { connect, parseAddress } = await import("../src/repository-hosts/index.mjs");
const { writeSetting } = await import("../src/browser-store/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "resources");

const INSTANCE = "akmaier/agent-m";
const PRODUCT_REPO = "alice/thesis-tool";
const PRODUCT = `https://github.com/${PRODUCT_REPO}`;
const TOKEN = "github_pat_INSTANCE0123456789abcdefghij";
const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghijk";
const OLD_PIN = "b".repeat(40);
// The head GitHub's fake gives the repository at its first state: the SHA-1 of "<owner>/<name>#0" (tests/settings-pages-sources.d/github.mjs).
const headOf = (repository) => createHash("sha1").update(`${repository}#0`).digest("hex");

const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const list = (title, ...rows) => `# Resources of ${title}\n\n${HEADER}\n${rows.join("\n")}\n`;
const DLLS = `| dlls | repository | https://github.com/alice/dlls | ${OLD_PIN} | MIT | the Acme organisation | read on its host | — | — | — |`;
const CLUSTER = "| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |";
const LLM = "| shared-llm | endpoint | http://workstation.example.org:8000/v1 | example-model | — | — | bridge workstation | the group's workstation | no | ci:LLM_KEY |";
const PRODUCT_LIST = list("thesis-tool", DLLS, CLUSTER);
const INSTANCE_LIST = list("agent-m", LLM, CLUSTER);
const PARTICIPANTS = ["# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| ci-drafter | CI agent | ci-model | 200000 | — | draft text, run code and tests | GitHub Actions in the USA | ci runner:gpu secret CI_KEY |", ""].join("\n");
const WORKFLOW = { ".github/workflows/agent-m-jobs.yml": "name: Agent M jobs\n" };

// The page: a world of the repositories, the real hosts over it, a context as the frame hands it to a route, and the route rendered.
let current = null; // the world of the page opened last
async function open(t, { productFiles = { "docs/resources.md": PRODUCT_LIST }, instanceFiles = { "docs/resources.md": INSTANCE_LIST, "docs/participants.md": PARTICIPANTS },
  visibility = "public", product = true } = {}) {
  const world = githubWorld({ [INSTANCE]: { files: instanceFiles }, [PRODUCT_REPO]: { files: productFiles, visibility }, "alice/dlls": { files: { "README.md": "# dlls\n" } }, "alice/dlls2": { files: { "README.md": "# dlls2\n" } } });
  installWorld(t, world);
  current = world;
  const store = freshStore();
  // The product's own token, as the settings page stores it: the person the job and the commit are made as.
  writeSetting(store, `github-token:${PRODUCT_REPO}`, { name: "Agent M", expires: "2027-06-01", stored: "2026-01-01", value: PRODUCT_TOKEN });
  const went = [];
  const context = { page: "review", instance: { repository: INSTANCE, host: connect(parseAddress(`https://github.com/${INSTANCE}`), { token: TOKEN }) },
    product: product ? { address: PRODUCT, kind: "github", host: connect(parseAddress(PRODUCT), { token: PRODUCT_TOKEN }) } : null, store, went, go(name, params) { went.push([name, params]); } };
  const target = attachedTarget();
  await route.render(target, context, {});
  return { world, context, target, went };
}
const pressed = async (button) => { await click(button); await settled(current); };
const entry = (target, name) => withClass(target, "resource").find((node) => node.getAttribute("data-resource") === name);
const line = (target, name, className) => withClass(entry(target, name), className)[0].textContent;
const productCommits = (page) => page.world.commits(PRODUCT_REPO);
const formOf = (target) => withClass(target, "schema-form")[0];
const editorArea = (target) => byTag(formOf(target), "textarea")[0];
const saveOfForm = (target) => byTag(formOf(target), "button").at(-1);
const typeInto = async (area, text) => { area.value = text; area.dispatchEvent(new Event("input")); await turn(); };
const result = (target) => withClass(target, "resources-result")[0].textContent;
const registered = new Set();
const registerOnce = () => { if (!registered.has("resources")) { registered.add("resources"); registerStrategies("tests/settings-pages-resources.test.mjs", view.strategies[0]); } };

// TST-642001 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 1; A PRODUCT DECLARES ITS RESOURCES; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; EVERY STEP EXPLAINS ITSELF
// given: a product whose docs/resources.md holds the repository dlls (pinned, MIT, maintained by the Acme organisation) and the compute resource cluster reached by the runner gpu; the page drawn for the product
// input: render the route resources
// expect: the page is headed "Resources" and names the repository; two groups, "Repository" and "Compute", in the order of the kinds, each entry in its group with its address and the lines "Pin: …", "Licence: …", "Maintainer: …", "Route: …", "Processing place: …" and "Secret: …", a value left out as "—"; the folded explanation of the topic resources stands on the page
test("resources — a product's list is shown grouped by kind with each entry's pin, licence, maintainer, route, place and secret", async (t) => {
  const { target } = await open(t);
  assert.equal(byTag(target, "h2")[0].textContent, "Resources");
  assert.match(withClass(target, "muted")[0].textContent, /alice\/thesis-tool/);
  assert.deepEqual(byTag(target, "h3").map((node) => node.textContent), ["Repository", "Compute"]);
  assert.deepEqual(withClass(target, "resource").map((node) => node.getAttribute("data-resource")), ["dlls", "cluster"]);
  assert.equal(line(target, "dlls", "resource-address"), "https://github.com/alice/dlls");
  assert.equal(line(target, "dlls", "resource-pin"), `Pin: ${OLD_PIN}`);
  assert.equal(line(target, "dlls", "resource-licence"), "Licence: MIT");
  assert.equal(line(target, "dlls", "resource-maintainer"), "Maintainer: the Acme organisation");
  assert.equal(line(target, "dlls", "resource-route"), "Route: read on its host");
  assert.equal(line(target, "dlls", "resource-place"), "Processing place: —");
  assert.equal(line(target, "dlls", "resource-secret"), "Secret: —");
  assert.equal(line(target, "cluster", "resource-pin"), "Pin: —");
  assert.equal(line(target, "cluster", "resource-route"), "Route: runner:gpu");
  assert.equal(line(target, "cluster", "resource-place"), "Processing place: NHR@FAU, Erlangen");
  assert.ok(target.textContent.includes(explain("resources").textContent), "the folded explanation of the topic resources stands on the page");
  assert.notEqual(explain("resources").textContent, "", "the topic resources exists in the explanations");
});

// TST-642002 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 5; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
// given: a list whose entry token-host has `sk-live-0123456789abcdef` in its Secret column (a value, not a name) and whose entry shared-llm names `ci:LLM_KEY`
// input: render the route resources for the product
// expect: the line of shared-llm reads "Secret: ci:LLM_KEY"; the line of token-host reads "Secret: not the name of a secret (not shown)"; the text `sk-live-0123456789abcdef` stands nowhere on the page, and the entry shows an error naming the rule A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
test("resources — a secret's name is shown and a value written in its column is never shown again", async (t) => {
  const bad = "| token-host | endpoint | http://localhost:8000/v1 | model-x | — | — | http://localhost:8000/v1 | this machine | no | sk-live-0123456789abcdef |";
  const { target } = await open(t, { productFiles: { "docs/resources.md": list("thesis-tool", LLM, bad) } });
  assert.equal(line(target, "shared-llm", "resource-secret"), "Secret: ci:LLM_KEY");
  assert.equal(line(target, "token-host", "resource-secret"), "Secret: not the name of a secret (not shown)");
  assert.equal(target.textContent.includes("sk-live-0123456789abcdef"), false);
  assert.match(line(target, "token-host", "resource-findings"), /A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE/);
});

// TST-642003 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 1b; THE INSTANCE DECLARES ITS OWN RESOURCES; INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
// given: the instance's docs/resources.md (shared-llm, cluster) and a product's (dlls, cluster); the page drawn with no product
// input: render the route resources with no product
// expect: the page is headed "Instance resources", names the repository akmaier/agent-m, lists shared-llm and cluster and not dlls, and offers no "Copy from the instance"; no request names the product's repository
test("resources — with no product the route shows the instance's list alone (resources/instance)", async (t) => {
  const page = await open(t, { product: false });
  assert.equal(byTag(page.target, "h2")[0].textContent, "Instance resources");
  assert.match(withClass(page.target, "muted")[0].textContent, /akmaier\/agent-m/);
  assert.deepEqual(withClass(page.target, "resource").map((node) => node.getAttribute("data-resource")), ["cluster", "shared-llm"]);
  assert.equal(buttonLabelled(page.target, "Copy from the instance"), undefined);
  assert.equal(page.world.requests.some((request) => request.repository === PRODUCT_REPO), false);
});

// TST-642004 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 1; A PRODUCT DECLARES ITS RESOURCES
// given: a product that has no docs/resources.md
// input: render the route resources for the product
// expect: the page says "<the product's address> declares no resource yet." and shows no entry; the page makes no write
test("resources — a product without a list shows an empty one and writes nothing", async (t) => {
  const page = await open(t, { productFiles: { "README.md": "# thesis-tool\n" } });
  assert.equal(withClass(page.target, "resources-empty")[0].textContent, `${PRODUCT} declares no resource yet.`);
  assert.equal(withClass(page.target, "resource").length, 0);
  assert.equal(productCommits(page).length + page.world.commits(INSTANCE).length, 0);
});

// TST-642005 · level: unit · module: MOD-settings-pages
// guards: UC-040 steps 2 to 4, 8; A RESOURCE IS PINNED TO AN EXACT STATE; A RESOURCE DECLARES ITS LICENCE; A RESOURCE NAMES ITS MAINTAINER; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION
// given: the product's list (dlls, cluster); the repository alice/dlls2 at its first state (the first state is the SHA-1 of "alice/dlls2#0")
// input: choose the kind repository, name "tools", address https://github.com/alice/dlls2, press "+ Add resource"; the form shows the draft row; set the licence MIT and the maintainer the Acme organisation in the list's text; press Save
// expect: the form's list holds the new row pinned to the head of alice/dlls2 (the SHA-1 of "alice/dlls2#0"); before the licence and maintainer are entered the form shows errors naming A RESOURCE DECLARES ITS LICENCE and A RESOURCE NAMES ITS MAINTAINER and its Save is disabled; after, Save writes one commit in the product's repository and none in the instance's, holding exactly the file docs/resources.md with the three rows, signed with the product's token; the page then lists tools
test("resources — adding a repository pins it to its host's head, and Save commits the list as the person's own commit", async (t) => {
  const page = await open(t);
  const tools = withClass(page.target, "resources-adding")[0];
  byTag(tools, "select")[0].value = "repository";
  const [name, address] = byTag(tools, "input");
  name.value = "tools";
  address.value = "https://github.com/alice/dlls2";
  await pressed(buttonLabelled(tools, "+ Add resource"));
  const area = editorArea(page.target);
  assert.match(area.value, /\| tools \| repository \| https:\/\/github\.com\/alice\/dlls2 \| [0-9a-f]{40} \|/);
  const pinned = /\| tools \| repository \| [^|]+ \| ([0-9a-f]{40}) \|/.exec(area.value)[1];
  assert.equal(pinned, headOf("alice/dlls2"));
  const found = withClass(formOf(page.target), "marks")[0].textContent;
  assert.match(found, /A RESOURCE DECLARES ITS LICENCE/);
  assert.match(found, /A RESOURCE NAMES ITS MAINTAINER/);
  assert.equal(saveOfForm(page.target).disabled, true);
  await typeInto(area, area.value.replace(/\| tools \| repository \| ([^|]+) \| ([0-9a-f]{40}) \| — \| — \|/, "| tools | repository | $1 | $2 | MIT | the Acme organisation |"));
  assert.equal(saveOfForm(page.target).disabled, false);
  await pressed(saveOfForm(page.target));
  assert.equal(productCommits(page).length, 1);
  assert.equal(page.world.commits(INSTANCE).length, 0);
  const commit = productCommits(page)[0];
  assert.deepEqual(Object.keys(commit.files), ["docs/resources.md"]);
  assert.equal(commit.files["docs/resources.md"], list("thesis-tool", DLLS, CLUSTER,
    `| tools | repository | https://github.com/alice/dlls2 | ${pinned} | MIT | the Acme organisation | read on its host | — | — | — |`));
  assert.equal(commit.authorization, `Bearer ${PRODUCT_TOKEN}`);
  assert.equal(result(page.target), `✓ docs/resources.md is saved in ${PRODUCT} (commit ${commit.sha.slice(0, 7)}).`);
  assert.deepEqual(withClass(page.target, "resource").map((node) => node.getAttribute("data-resource")), ["dlls", "tools", "cluster"]);
});

// TST-642006 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7, 9a; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the product's list pins dlls and a second repository, other, to the commit of 40 "b"; the repository alice/dlls stands at its head, the SHA-1 of "alice/dlls#0"
// input: press Check on dlls; then a click a script makes on Move; then the person's click on Move
// expect: Check writes nothing and shows "A newer state exists upstream: <the head>. The pin is bbbb…" and a button Move; the script's click writes nothing; the person's click writes one commit holding docs/resources.md with only the Pin of dlls changed to the head (the other rows, the pinned repository other among them, byte for byte), and the line "Pin: <the head>"; then Check says "alice/dlls stands at its pin" (the known positive of the newer-state check: it finds none once moved)
test("resources — Check shows a newer state beside the pin, and Move commits the new pin in one click and no other", async (t) => {
  const other = DLLS.replace("| dlls | repository | https://github.com/alice/dlls |", "| other | repository | https://github.com/alice/other |");
  const page = await open(t, { productFiles: { "docs/resources.md": list("thesis-tool", DLLS, other, CLUSTER) } });
  const head = headOf("alice/dlls");
  await pressed(buttonLabelled(entry(page.target, "dlls"), "Check"));
  assert.equal(productCommits(page).length, 0, "Check writes nothing");
  assert.equal(withClass(entry(page.target, "dlls"), "resource-newer")[0].textContent, `A newer state exists upstream: ${head}. The pin is ${OLD_PIN}.`);
  const move = buttonLabelled(entry(page.target, "dlls"), "Move");
  await press(move);
  await settled(current);
  assert.equal(productCommits(page).length, 0, "a click a script makes writes nothing");
  await pressed(move);
  assert.equal(productCommits(page).length, 1);
  assert.equal(productCommits(page)[0].files["docs/resources.md"], list("thesis-tool", DLLS.replace(OLD_PIN, head), other, CLUSTER));
  assert.equal(line(page.target, "dlls", "resource-pin"), `Pin: ${head}`);
  await pressed(buttonLabelled(entry(page.target, "dlls"), "Check"));
  assert.equal(withClass(entry(page.target, "dlls"), "resource-current")[0].textContent, `✓ https://github.com/alice/dlls stands at its pin, ${head}.`);
  assert.equal(buttonLabelled(entry(page.target, "dlls"), "Move"), undefined);
});

// TST-642007 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 8; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the product's list opened on the page; another person then commits docs/resources.md in the product (a different text)
// input: press Check on dlls and Move
// expect: nothing is written by the page (one commit stands in the product, the other person's); the page says "docs/resources.md changed since this page read it; nothing was written. Open the page again to read the newer file."
test("resources — Move writes nothing when the list changed meanwhile", async (t) => {
  const page = await open(t);
  await pressed(buttonLabelled(entry(page.target, "dlls"), "Check"));
  page.world.change(PRODUCT_REPO, "docs/resources.md", list("thesis-tool", DLLS, CLUSTER, LLM));
  await pressed(buttonLabelled(entry(page.target, "dlls"), "Move"));
  assert.equal(productCommits(page).length, 0);
  assert.equal(result(page.target), "docs/resources.md changed since this page read it; nothing was written. Open the page again to read the newer file.");
});

// TST-642008 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 1a; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the product's list (dlls, cluster)
// input: press Remove on cluster; the form shows the list without it; press Save
// expect: before Save nothing is written; Save writes one commit holding docs/resources.md with only the row of dlls; the page then lists dlls alone
test("resources — Remove opens the list without the entry, and Save commits the removal", async (t) => {
  const page = await open(t);
  await pressed(buttonLabelled(entry(page.target, "cluster"), "Remove"));
  assert.equal(editorArea(page.target).value.includes("| cluster |"), false);
  assert.equal(productCommits(page).length, 0);
  await pressed(saveOfForm(page.target));
  assert.equal(productCommits(page).length, 1);
  assert.equal(productCommits(page)[0].files["docs/resources.md"], list("thesis-tool", DLLS));
  assert.deepEqual(withClass(page.target, "resource").map((node) => node.getAttribute("data-resource")), ["dlls"]);
});

// TST-642009 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 2c; INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT; ONE CLICK PER DECISION
// given: the instance's list (shared-llm, cluster) and the product's (dlls, cluster)
// input: choose shared-llm in "An instance resource" and press "Copy from the instance"; press Save
// expect: only shared-llm is offered (cluster is already the product's); the form's list holds the product's rows and the copy of shared-llm; Save writes one commit in the product's repository with docs/resources.md holding the three rows, the copy byte for byte as the instance's row, and none in the instance's repository, whose list is unchanged
test("resources — Copy from the instance copies an entry into the product's list and changes the instance's not at all", async (t) => {
  const page = await open(t);
  const choice = withClass(page.target, "resources-copy-choice")[0];
  assert.deepEqual(byTag(choice, "option").map((option) => option.value), ["shared-llm"]);
  choice.value = "shared-llm";
  await pressed(buttonLabelled(page.target, "Copy from the instance"));
  assert.match(editorArea(page.target).value, /\| shared-llm \| endpoint \|/);
  await pressed(saveOfForm(page.target));
  assert.equal(productCommits(page).length, 1);
  assert.equal(productCommits(page)[0].files["docs/resources.md"], list("thesis-tool", DLLS, CLUSTER, LLM));
  assert.equal(page.world.commits(INSTANCE).length, 0);
  assert.equal(page.world.files(INSTANCE)["docs/resources.md"], INSTANCE_LIST);
});

// TST-642010 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a private product with Agent M's job workflow, whose list holds cluster reached by the runner gpu; the instance's register holds the CI agent ci-drafter on `ci runner:gpu secret CI_KEY`
// input: press Check on cluster; a click a script makes on Run; the person's click on Run
// expect: the page names the job on the runner gpu and ci-drafter, and shows the run panel with ci-drafter as destination and a button Run; the script's click writes nothing; the person's click writes one commit in the product's repository adding one file docs/jobs/JOB-….md that names the kind check-resource, the participant ci-drafter, the route "ci runner:gpu" and the resource cluster, signed with the product's token, and the page says "Queued as JOB-…"
test("resources — a compute resource reached by a runner is checked by a check job, shown in the run panel and queued on the person's click", async (t) => {
  registerOnce();
  const page = await open(t, { productFiles: { "docs/resources.md": PRODUCT_LIST, ...WORKFLOW }, visibility: "private" });
  await pressed(buttonLabelled(entry(page.target, "cluster"), "Check"));
  const running = withClass(entry(page.target, "cluster"), "resource-runner")[0].textContent;
  assert.match(running, /^The check runs as the job JOB-\d{8}-\d{4}-[0-9a-f]{4} on the runner gpu, with the participant ci-drafter\.$/);
  const panel = withClass(entry(page.target, "cluster"), "run-panel")[0];
  assert.match(panel.textContent, /ci-drafter/);
  const run = buttonLabelled(panel, "Run");
  assert.ok(run, "the run panel offers Run");
  await press(run);
  await settled(current);
  assert.equal(productCommits(page).length, 0, "a click a script makes writes nothing");
  await pressed(run);
  assert.equal(productCommits(page).length, 1);
  const commit = productCommits(page)[0];
  const paths = Object.keys(commit.files);
  assert.equal(paths.length, 1);
  assert.match(paths[0], /^docs\/jobs\/JOB-\d{8}-\d{4}-[0-9a-f]{4}\.md$/);
  const record = commit.files[paths[0]];
  for (const text of ["check-resource", "ci-drafter", "ci runner:gpu", "UC-040", "cluster"]) assert.ok(record.includes(text), `the job record holds ${text}`);
  assert.equal(commit.authorization, `Bearer ${PRODUCT_TOKEN}`);
  assert.match(withClass(entry(page.target, "cluster"), "resource-queued")[0].textContent, /^Queued as JOB-\d{8}-\d{4}-[0-9a-f]{4} on the runner gpu/);
  assert.equal(page.world.commits(INSTANCE).length, 0);
});

// TST-642011 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b, 9b; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
// given: the same page of TST-642010 but the product is public
// input: press Check on cluster
// expect: the page says that no CI agent of the instance reaches the runner gpu and gives the reason MOD-runtimes' routesFor gives (a self-hosted runner serves private repositories only); it offers no Run and writes nothing
test("resources — a runner is not offered for a public product, and the page says why", async (t) => {
  registerOnce();
  const page = await open(t, { productFiles: { "docs/resources.md": PRODUCT_LIST, ...WORKFLOW }, visibility: "public" });
  await pressed(buttonLabelled(entry(page.target, "cluster"), "Check"));
  const said = withClass(entry(page.target, "cluster"), "resource-no-runner")[0].textContent;
  assert.match(said, /^No CI agent of the instance reaches the runner gpu: .*private.*Nothing can check cluster until one does\.$/);
  assert.equal(buttonLabelled(entry(page.target, "cluster"), "Run"), undefined);
  assert.equal(productCommits(page).length, 0);
});

// TST-642012 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: the product's list holds shared-llm, an endpoint reached by `bridge workstation`, and dlls
// input: press Check on shared-llm
// expect: the page says that the check of an endpoint through the Bridge workstation (served models) is not built yet and that nothing was read; no request goes to any server for it
test("resources — a check through a Bridge is said not to be built, and reads nothing", async (t) => {
  const page = await open(t, { productFiles: { "docs/resources.md": list("thesis-tool", DLLS, LLM) } });
  const before = page.world.requests.length;
  await pressed(buttonLabelled(entry(page.target, "shared-llm"), "Check"));
  assert.equal(withClass(entry(page.target, "shared-llm"), "resource-not-built")[0].textContent,
    "The check of a endpoint through the Bridge workstation (served models) is not built yet; nothing was read.");
  assert.equal(page.world.requests.length, before);
});

// TST-642013 · level: unit · module: MOD-settings-pages
// guards: UC-040; EVERY STEP EXPLAINS ITSELF
// given: the explanations file of MOD-site-frame
// input: ask explain for each topic the page names: resources, resource-kind, resource-licence, resource-move, resource-check, resource-copy
// expect: each gives a folded "What is this?" with a text of its own (not empty, and no two the same); the page for a product with a copy to offer holds the folds of resources, resource-kind and resource-copy
test("resources — each step carries its folded explanation, and the topics exist", async (t) => {
  const topics = ["resources", "resource-kind", "resource-licence", "resource-move", "resource-check", "resource-copy"];
  const texts = topics.map((topic) => explain(topic).textContent);
  for (const [at, text] of texts.entries()) assert.match(text, /^What is this\?.{40}/s, `${topics[at]} has a text`);
  assert.equal(new Set(texts).size, topics.length);
  const { target } = await open(t);
  for (const topic of ["resources", "resource-kind", "resource-copy"]) assert.ok(target.textContent.includes(explain(topic).textContent), `${topic} stands on the page`);
});

// TST-642014 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 7b; ONE DEFINITION, THREE DRIVERS
// given: the view MOD-settings-pages gives the frame
// input: read view.routes and view.strategies
// expect: the routes include one named resources, and the strategies hold one set with the recipe resource-check, which the frame registers for the page's run panel
test("resources — the view gives the route resources and hands the frame MOD-resource-list's strategies", () => {
  assert.ok(view.routes.some((candidate) => candidate.name === "resources"));
  assert.equal(view.strategies.length, 1);
  assert.deepEqual(Object.keys(view.strategies[0].recipes), ["resource-check"]);
});

// TST-1030005 · level: unit · module: MOD-settings-pages
// guards: UC-040 step 1a, 9a; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
// given: the product holds the record docs/jobs/JOB-20261005-1432-7f3a.md whose inputs pin dlls, the record JOB-20261005-1500-aaaa whose inputs pin cluster-two, the test tests/dlls.test.mjs that names dlls, and tests/cluster.test.mjs that does not
// input: press Remove on dlls; on another page, press Check on dlls
// expect: Remove lists, in the entry of dlls, the record and tests/dlls.test.mjs and neither of the others, and writes nothing; Check, beside the line of the newer state and the button Move, lists the same two paths and writes nothing
test("resources — Remove and a newer state list the jobs and tests that name the resource, and change neither", async (t) => {
  const files = { "docs/resources.md": PRODUCT_LIST,
    "docs/jobs/JOB-20261005-1432-7f3a.md": `---\nid: JOB-20261005-1432-7f3a\nkind: implement\ninputs:\n  - dlls@${OLD_PIN}\nlimit: 5\n---\n`,
    "docs/jobs/JOB-20261005-1500-aaaa.md": `---\nid: JOB-20261005-1500-aaaa\nkind: implement\ninputs:\n  - cluster-two@${OLD_PIN}\nlimit: 5\n---\n`,
    "tests/dlls.test.mjs": "// guards the library dlls\n", "tests/cluster.test.mjs": "// guards the cluster\n" };
  const named = (page) => withClass(entry(page.target, "dlls"), "resource-named-by").map((node) => node.textContent);
  const page = await open(t, { productFiles: files });
  await pressed(buttonLabelled(entry(page.target, "dlls"), "Remove"));
  assert.equal(named(page).length, 1);
  assert.ok(named(page)[0].includes("docs/jobs/JOB-20261005-1432-7f3a.md") && named(page)[0].includes("tests/dlls.test.mjs"), named(page)[0]);
  assert.ok(!named(page)[0].includes("JOB-20261005-1500-aaaa") && !named(page)[0].includes("tests/cluster.test.mjs"), named(page)[0]);
  assert.equal(productCommits(page).length, 0);
  const second = await open(t, { productFiles: files });
  await pressed(buttonLabelled(entry(second.target, "dlls"), "Check"));
  assert.equal(named(second).length, 1);
  assert.ok(named(second)[0].includes("docs/jobs/JOB-20261005-1432-7f3a.md") && named(second)[0].includes("tests/dlls.test.mjs"), named(second)[0]);
  assert.ok(buttonLabelled(entry(second.target, "dlls"), "Move"));
  assert.equal(productCommits(second).length, 0);
});
