// MOD-trace-pages' specification view reads the product's links file and the instance's register entries through Snapshot.readMany (ITM-833): on the
// default branch the person's own source is looked up in docs/sources.md and in the entries of docs/sources/, and these files are named to readMany
// before they are read, so that a host that can batch fetches them together.
//
// Run: node --test tests/trace-pages-register-batch.test.mjs
//
// Module: MOD-trace-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE PERSON WHO PROMPTS IS A SOURCE
// Level: unit
//
// The route is called through its public Route.render with Hosts of the test's own, which keep to MOD-repository-hosts' interface (readSnapshot,
// repositoryInfo, listTags) and write nothing. Every call the Snapshots receive is recorded in one list, in the order it was made: `many <paths>` for
// readMany, `read <path>` for read. Each case states its expected list in its own text; none is read from a document. Readings the cases take, each from
// the sentence quoted:
// - "one batch of the files it shows" (SPEC.md, A PAGE LOAD READS THE REPOSITORY IN BATCHES): the links file and the register entries are asked for in
//   one readMany call where they stand in one snapshot; where the product's and the instance's snapshots are two, the register's entries are asked for in
//   one call of the instance's snapshot, and the links file, a batch of one file, by its own read.
// - "It reads the product's snapshot at the chosen version" (MOD-trace-pages, Files): the register is looked up only on the default branch, where the
//   person's own source is given to the prompt bar; at a released version no file of the register is asked for.

import test from "node:test";
import assert from "node:assert/strict";
import { document, find } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SPEC = "# Fixture — Specification\n\n## First section\n\n**FIRST RULE** *(Source one)*\nFirst rule.\n*Check:* at review.\n";
const SHA = "0".repeat(64);
const PERSON = "SRC-acme-person", OTHER = "SRC-other-person";
const LINKS = `# The sources this product meets\n\n| Source | Version | Hash | Part |\n|---|---|---|---|\n| ${PERSON} | 2026-10-11 | ${SHA} | |\n`;
const entryText = (id, account) => `---\nid: ${id}\ntitle: A person\nkind: person\nauthority: normative\nlicence: may be republished — fixture\nidentifier: ${account}\n---\n# ${id} A person\n\nA fixture source.\n\n## Versions\n\n| Version | Date | Edition | Read from | Files |\n|---|---|---|---|---|\n| \`2026-10-11\` | 2026-10-11 | the fixture | this repository | one file, hashed only |\n`;
const PERSON_FILE = `docs/sources/${PERSON}.md`, OTHER_FILE = `docs/sources/${OTHER}.md`;
const REGISTER = { [PERSON_FILE]: entryText(PERSON, "github.com/acme"), [OTHER_FILE]: entryText(OTHER, "github.com/other") };
const REPOSITORY = { server: "github", origin: "https://github.com", path: "acme/agent-m", web: "https://github.com/acme/agent-m" };

// A Host whose Snapshots hold `files`; every call to a Snapshot is noted in `events` under `label`. `pinned`: the Host hands the same Snapshot for a ref every
// time, as the dashboard's host does while a page loads. `batching: false`: its Snapshots have no readMany.
function recordingHost({ label, files, events, pinned = false, batching = true }) {
  const held = new Map();
  const make = (ref) => {
    const snapshot = {
      ref, commit: ref, repository: REPOSITORY, paths: Object.keys(files), blob: () => null,
      async read(path) { events.push(`${label} read ${path}`); return files[path] ?? null; },
    };
    if (batching) snapshot.readMany = async (paths) => { events.push(`${label} many ${paths.join(",")}`); };
    return snapshot;
  };
  return {
    async readSnapshot(ref) {
      if (!pinned) return make(ref);
      if (!held.has(ref)) held.set(ref, make(ref));
      return held.get(ref);
    },
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async listTags() { return []; },
  };
}

async function drawn({ product, instance, ref = "main" }) {
  const target = document.createElement("div");
  document.body.append(target);
  const context = { page: "review", instance: { repository: "acme/agent-m", host: instance }, product: { address: "https://github.com/acme/library", kind: "github", host: product }, store: {}, go() {} };
  const params = { key: "specification", ref };
  await route.render(target, context, params);
  // A section opened is a subject with the person's source and reads nothing; a requirement opened would also read the register for its traces.
  find(target, (node) => node.localName === "button" && node.className.includes("spec-section-toggle"))[0]?.dispatchEvent(new Event("click"));
  return route.subject(params, context);
}
const register = (events) => events.filter((event) => event.includes("docs/sources"));

// CASE ITM-833-01
// TST-833001 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: one Host for the product and the instance, which hands the same Snapshot for main each time; that Snapshot holds SPEC.md, docs/sources.md and two register entries
// input: the specification route drawn at main, its first section opened, the subject asked for
// expect: of the calls that name a file of the register, the first is one readMany of docs/sources.md and the two entries, in that order; the three files are then read once each; readMany was called once in all; known positive: the subject's source is SRC-acme-person
test("on the default branch the links file and the register entries are named to readMany together before they are read", async () => {
  const events = [];
  const host = recordingHost({ label: "host", files: { "SPEC.md": SPEC, "docs/sources.md": LINKS, ...REGISTER }, events, pinned: true });
  const subject = await drawn({ product: host, instance: host });
  assert.equal(register(events)[0], `host many docs/sources.md,${PERSON_FILE},${OTHER_FILE}`);
  assert.deepEqual(register(events).slice(1).sort(), [`host read docs/sources.md`, `host read ${OTHER_FILE}`, `host read ${PERSON_FILE}`].sort());
  assert.equal(events.filter((event) => event.startsWith("host many")).length, 1);
  assert.equal(subject.paramsFor({ name: "po-opus" }).source, PERSON);
});

// CASE ITM-833-02
// TST-833002 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product Host whose Snapshot holds SPEC.md and docs/sources.md, and an instance Host, another one, whose Snapshot holds the two register entries
// input: the specification route drawn at main, its first section opened, the subject asked for
// expect: the instance's Snapshot is told the two entries in one readMany, before it reads them once each; the product's Snapshot is told nothing and reads docs/sources.md once; known positive: the subject's source is SRC-acme-person
test("where the register is another snapshot's, its entries are named to readMany together and the links file is read by itself", async () => {
  const events = [];
  const product = recordingHost({ label: "product", files: { "SPEC.md": SPEC, "docs/sources.md": LINKS }, events });
  const instance = recordingHost({ label: "instance", files: REGISTER, events });
  const subject = await drawn({ product, instance });
  const instanceCalls = events.filter((event) => event.startsWith("instance "));
  assert.equal(instanceCalls[0], `instance many ${PERSON_FILE},${OTHER_FILE}`);
  assert.deepEqual(instanceCalls.slice(1).sort(), [`instance read ${OTHER_FILE}`, `instance read ${PERSON_FILE}`].sort());
  assert.deepEqual(events.filter((event) => event.startsWith("product many")), []);
  assert.deepEqual(events.filter((event) => event === "product read docs/sources.md"), ["product read docs/sources.md"]);
  assert.equal(subject.paramsFor({ name: "po-opus" }).source, PERSON);
});

// CASE ITM-833-03
// TST-833003 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Host of case 1 without readMany on its Snapshots
// input: the specification route drawn at main, its first section opened, the subject asked for
// expect: the three files of the register are read once each by read, no call is refused, and the subject's source is SRC-acme-person
test("a snapshot without readMany is read file by file as before", async () => {
  const events = [];
  const host = recordingHost({ label: "host", files: { "SPEC.md": SPEC, "docs/sources.md": LINKS, ...REGISTER }, events, pinned: true, batching: false });
  const subject = await drawn({ product: host, instance: host });
  assert.deepEqual(register(events).sort(), [`host read docs/sources.md`, `host read ${OTHER_FILE}`, `host read ${PERSON_FILE}`].sort());
  assert.equal(subject.paramsFor({ name: "po-opus" }).source, PERSON);
});

// CASE ITM-833-04
// TST-833004 · level: unit · module: MOD-trace-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the Host of case 1, and a ref v1.0 that is not the default branch
// input: the specification route drawn at v1.0, its first section opened
// expect: no call names docs/sources.md or an entry of the register, and nothing is told to readMany
test("at a released version no file of the register is asked for", async () => {
  const events = [];
  const host = recordingHost({ label: "host", files: { "SPEC.md": SPEC, "docs/sources.md": LINKS, ...REGISTER }, events, pinned: true });
  await drawn({ product: host, instance: host, ref: "v1.0" });
  assert.deepEqual(register(events), []);
  assert.deepEqual(events.filter((event) => event.startsWith("host many")), []);
});
