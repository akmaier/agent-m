// MOD-trace-pages' specification view reads the instance's default branch once for the drawing it is given: the person's own source on the default branch
// (personsSource) and the sources of an opened requirement (sourcesOf) take the same instance snapshot, however often the version is drawn again or a requirement
// is opened, so that the instance's repository information, its commit and that commit's tree are asked for once.
//
// Run: node --test tests/trace-pages-instance-once.test.mjs
//
// Module: MOD-trace-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// The route is called through its public Route.render with Hosts of the test's own, which keep to MOD-repository-hosts' interface (readSnapshot, repositoryInfo,
// listTags) and write nothing. The instance's Host notes every readSnapshot and repositoryInfo it receives in `events`, as `instance info` and `instance snapshot <ref>`.
// Each case states its expected list in its own text; none is read from a document. Readings the cases take, each from the sentence quoted:
// - "one load of a dashboard page reads its commit and that commit's tree once" (SPEC.md, A PAGE LOAD READS THE REPOSITORY IN BATCHES): one load is one Route.render
//   with one context, and whatever the person does on it afterwards — choosing another version, opening requirements; the instance's snapshot of its default branch
//   is its commit and tree, so it is asked for by one readSnapshot after one repositoryInfo.
// - "Opening a requirement reads the instance's commit and tree no more than once per load" (ITM-867, Acceptance): the person's own source on the default branch and the
//   sources of an opened requirement count together.
// - a read that failed has not read the snapshot: the next caller asks again (case ITM-867-04); a second load, with a context of its own, reads again (case ITM-867-05).

import test from "node:test";
import assert from "node:assert/strict";
import { document, find, until } from "./trace-pages-harness.mjs";
import { storedGraphReadOn } from "./stored-graph-fake.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SHA = "0".repeat(64);
const PERSON = "SRC-acme-person", OTHER = "SRC-other-person";
const SPEC_TWO = "# Fixture — Specification\n\n## First section\n\n**FIRST RULE** *(SRC-acme-person)*\nFirst rule.\n*Check:* at review.\n\n**SECOND RULE** *(SRC-acme-person)*\nSecond rule.\n*Check:* at review.\n";
const LINKS = `# The sources this product meets\n\n| Source | Version | Hash | Part |\n|---|---|---|---|\n| ${PERSON} | 2026-10-11 | ${SHA} | |\n`;
const entryText = (id, account) => `---\nid: ${id}\ntitle: A person\nkind: person\nauthority: normative\nlicence: may be republished — fixture\nidentifier: ${account}\n---\n# ${id} A person\n\nA fixture source.\n\n## Versions\n\n| Version | Date | Edition | Read from | Files |\n|---|---|---|---|---|\n| \`2026-10-11\` | 2026-10-11 | the fixture | this repository | one file, hashed only |\n`;
const REGISTER = { [`docs/sources/${PERSON}.md`]: entryText(PERSON, "github.com/acme"), [`docs/sources/${OTHER}.md`]: entryText(OTHER, "github.com/other") };
const REPOSITORY = { server: "github", origin: "https://github.com", path: "acme/agent-m", web: "https://github.com/acme/agent-m" };
const SOURCES_SHOWN = "A person — version 2026-10-11";

// A Host whose Snapshots hold `files`, for any ref. `label: "instance"` notes its readSnapshot and repositoryInfo calls in `events`. `tags`: the names listTags gives.
// `failing`: the number of readSnapshot calls, counted from the first, that fail as an unreachable server does. Each ref's graph is stored on trace-cache, as the
// workflow "main changed" stores it (tests/stored-graph-fake.mjs).
function host({ label, files, events, tags = [], failing = 0 }) {
  let snapshots = 0;
  return {
    async readSnapshot(ref) {
      events.push(`${label} snapshot ${ref}`);
      if (++snapshots <= failing) throw Object.assign(new Error("unreachable"), { name: "Unreachable" });
      const read = async (path) => files[path] ?? null;
      return {
        ref, commit: ref, repository: REPOSITORY, paths: Object.keys(files), blob: () => null, read,
        async readMany() {},
        readOn: storedGraphReadOn({ commit: ref, paths: Object.keys(files), read }),
      };
    },
    async repositoryInfo() { events.push(`${label} info`); return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async listTags() { return tags.map((name) => ({ name, commit: `commit-of-${name}` })); },
  };
}

const PRODUCT_FILES = { "SPEC.md": SPEC_TWO, "docs/sources.md": LINKS };
const instanceCalls = (events) => events.filter((event) => event.startsWith("instance "));
const opened = (target, name) => find(target, (node) => node.className === "requirement-opened").some((node) => node.textContent.includes(name));

// The specification route drawn at `ref` with one context; -> { target, context }.
async function drawn({ product, instance, ref = "main" }) {
  const target = document.createElement("div");
  document.body.append(target);
  const context = { page: "review", instance: { repository: "acme/agent-m", host: instance }, product: { address: "https://github.com/acme/library", kind: "github", host: product }, store: {}, go() {} };
  await route.render(target, context, { key: "specification", ref });
  return { target, context };
}

// The requirement `name` opened in what `target` shows, waited for until it no longer says it is reading.
async function open(target, name) {
  find(target, (node) => node.localName === "button" && node.textContent === name)[0].dispatchEvent(new Event("click"));
  await until(() => find(target, (node) => node.className === "traces-reading").length === 0);
}

// CASE ITM-867-01
// TST-867001 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product Host whose Snapshots hold SPEC.md (two requirements naming SRC-acme-person) and docs/sources.md, and an instance Host, another one, whose Snapshots hold the two register entries
// input: the specification route drawn at main, the default branch, then the requirement FIRST RULE opened
// expect: the instance's Host received exactly `instance info` and `instance snapshot main`, in that order, once each — the drawing's and the opening's calls together; known positive: the Sources of the opened requirement read "A person — version 2026-10-11", and the subject of the opened requirement carries the source SRC-acme-person
test("on the default branch the drawing and an opened requirement read the instance's snapshot once", async () => {
  const events = [];
  const { target, context } = await drawn({ product: host({ label: "product", files: PRODUCT_FILES, events }), instance: host({ label: "instance", files: REGISTER, events }) });
  await open(target, "FIRST RULE");
  assert.deepEqual(instanceCalls(events), ["instance info", "instance snapshot main"]);
  assert.ok(target.textContent.includes(SOURCES_SHOWN), "known positive: the sources are shown");
  assert.equal(route.subject({ key: "specification", ref: "main" }, context).paramsFor({ name: "po-opus" }).source, PERSON);
});

// CASE ITM-867-02
// TST-867002 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Hosts of case 1
// input: the specification route drawn at main, then FIRST RULE opened and SECOND RULE opened
// expect: the instance's Host received exactly `instance info` and `instance snapshot main`, once each; known positive: both requirements are open
test("two requirements opened on the default branch still read the instance's snapshot once", async () => {
  const events = [];
  const { target } = await drawn({ product: host({ label: "product", files: PRODUCT_FILES, events }), instance: host({ label: "instance", files: REGISTER, events }) });
  await open(target, "FIRST RULE");
  await open(target, "SECOND RULE");
  assert.deepEqual(instanceCalls(events), ["instance info", "instance snapshot main"]);
  assert.ok(opened(target, "FIRST RULE") && opened(target, "SECOND RULE"), "known positive: both requirements are open");
});

// CASE ITM-867-03
// TST-867003 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Hosts of case 1, the product's listTags naming v1.0
// input: the specification route drawn at main, FIRST RULE opened, then the version v1.0 chosen in the version choice (the page is drawn again, with the same context) and FIRST RULE opened there
// expect: the instance's Host received exactly `instance info` and `instance snapshot main`, once each, though the page was drawn twice and a requirement was opened in each drawing; known positive: the page says "as of v1.0" and the Sources of the requirement opened at v1.0 read "A person — version 2026-10-11"
test("drawing the page again at a release and opening a requirement there reads the instance's snapshot no more", async () => {
  const events = [];
  const { target } = await drawn({ product: host({ label: "product", files: PRODUCT_FILES, events, tags: ["v1.0"] }), instance: host({ label: "instance", files: REGISTER, events }) });
  await open(target, "FIRST RULE");
  const before = find(target, (node) => node.localName === "select")[0];
  before.value = "v1.0";
  before.dispatchEvent(new Event("change"));
  await until(() => find(target, (node) => node.localName === "select")[0] !== before);
  await open(target, "FIRST RULE");
  assert.deepEqual(instanceCalls(events), ["instance info", "instance snapshot main"]);
  assert.ok(target.textContent.includes("as of v1.0"), "known positive: the release is drawn");
  assert.ok(target.textContent.includes(SOURCES_SHOWN), "known positive: the sources at the release are shown");
});

// CASE ITM-867-04
// TST-867004 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Hosts of case 1, the instance's first readSnapshot failing as an unreachable server does
// input: the specification route drawn at main (its reading of the person's own source fails), then FIRST RULE opened
// expect: the instance's Host received `instance info`, `instance snapshot main`, `instance info`, `instance snapshot main` — the failed read is not kept, and the opening asks again; known positive: the Sources of the opened requirement read "A person — version 2026-10-11"
test("a read of the instance's snapshot that failed is asked for again by the next caller", async () => {
  const events = [];
  const { target } = await drawn({ product: host({ label: "product", files: PRODUCT_FILES, events }), instance: host({ label: "instance", files: REGISTER, events, failing: 1 }) });
  await open(target, "FIRST RULE");
  assert.deepEqual(instanceCalls(events), ["instance info", "instance snapshot main", "instance info", "instance snapshot main"]);
  assert.ok(target.textContent.includes(SOURCES_SHOWN), "known positive: the sources are shown");
});

// CASE ITM-867-05
// TST-867005 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Hosts of case 1
// input: the specification route drawn at main twice, each time with a context of its own (two loads), FIRST RULE opened in each
// expect: the instance's Host received `instance info` and `instance snapshot main` twice each, once for each load: a second load asks again and is not served from the first
test("a second load with a context of its own reads the instance's snapshot again", async () => {
  const events = [];
  const product = host({ label: "product", files: PRODUCT_FILES, events }), instance = host({ label: "instance", files: REGISTER, events });
  for (let load = 0; load < 2; load += 1) await open((await drawn({ product, instance })).target, "FIRST RULE");
  assert.deepEqual(instanceCalls(events), ["instance info", "instance snapshot main", "instance info", "instance snapshot main"]);
});
