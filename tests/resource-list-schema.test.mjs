// MOD-resource-list's schema and its findings (ITM-460), as the accepted text of docs/architecture/MOD-resource-list.md states them: "`resourceSchema() ->
// Schema` — the schema of the list"; "`resourceFindings(resources: Resource[]) -> Finding[]` — what the schema cannot express: the pin's form for the kind — a
// full commit, not a branch name such as `main` —, the columns its kind requires, a compute route other than `bridge <name>` or `runner:<label>`, an endpoint
// or agent without its Paid mark, an entry that carries a participant's capabilities or role, a secret's value where its name belongs, and, as a warning, a
// maintainer who is a single person"; and its Data: the list `docs/resources.md`, one table with one row per resource, ten columns, a closed set of six
// kinds. For UC-040 (steps 2 to 6, 4a, 4c, 2a). The other functions of the module (readPin, checkPlan, newerState, paidServices, reachableBy, the recipe) are
// other items'.
// Run: node --test tests/resource-list-schema.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; A PRODUCT DECLARES ITS RESOURCES; THE RESOURCE KIND IS ONE OF A CLOSED SET; A RESOURCE IS PINNED TO AN EXACT STATE; A RESOURCE DECLARES ITS LICENCE; A RESOURCE NAMES ITS MAINTAINER; A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; A RESOURCE DECLARES WHERE IT PROCESSES DATA; A RESOURCE IS USED, A PARTICIPANT DEVELOPS; COMMIT TESTS CALL NO PAID SERVICE
// Level: unit
//
// Every expected value is read from the module file: the example list is the one its Data shows, taken from the file itself; the kinds, columns and
// requirement names are its own. The list is read as every caller reads it, through MOD-documents with the schema resourceSchema gives; resourceFindings is
// given resources of the type Resource, as the file states it. Where the file leaves a reading open, the test states the one it takes, and the pull request
// names it:
//   - The schema names its own rule, `A PRODUCT DECLARES ITS RESOURCES`, and the title of the list is whatever the file says (the section under the title).
//   - A finding's `artifact` is `docs/resources.md`; its `line` is the entry's position in the list, from 1.
//   - An entry "carries a participant's capabilities or role" when its resource has a non-empty `capabilities` or `role`.
//   - A secret is a value, not a name, when it is none of `ci:<NAME>` (a name of letters, digits and underscores), `browser` and `—`.
//   - A maintainer is a single person when it is one `@<account>` or one `person <name>`; an organisation, `unknown`, and several accounts are not.
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that something is refused, the same
// call is first shown to succeed on a known positive. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentFindings, readRegister } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";
import * as resourceList from "../src/resource-list/index.mjs";

const { resourceSchema, resourceFindings } = resourceList;
const MODULE_FILE = new URL("../docs/architecture/MOD-resource-list.md", import.meta.url);
const PATH = "docs/resources.md";
const COLUMNS = ["Name", "Kind", "Address", "Pin", "Licence", "Maintainer", "Route", "Processing place", "Paid", "Secret"];
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

// ---------------------------------------------------------------- the list

// The example of the module file's Data, the one markdown block of it.
const EXAMPLE = /```markdown\n([\s\S]*?)\n```/.exec(readFileSync(MODULE_FILE, "utf8"))[1];
const HEAD = ["# Resources of this product", "", "**REGISTER**", "", "The resources this product is built with, tested on or calls at runtime.", ""];
const listOf = (...rows) => [...HEAD, `| ${COLUMNS.join(" | ")} |`, `|${COLUMNS.map(() => "---").join("|")}|`, ...rows, ""].join("\n");
const row = (cells) => `| ${COLUMNS.map((column) => cells[column] ?? "—").join(" | ")} |`;

// The findings of a list's text, read with resourceSchema.
function schemaFindings(text) {
  const schema = resourceSchema();
  return documentFindings(schema, readRegister(schema, PATH, text).document);
}
const rulesOf = (findings) => findings.map((found) => found.rule);

// One resource of each kind, in the form the type states and with everything its kind requires.
const GOOD = {
  repository: { name: "tools", kind: "repository", address: "https://github.com/acme/tools", pin: COMMIT, licence: "MIT", maintainer: "Acme Research Group",
    route: "read from the host", place: null, paid: null, secret: null },
  data: { name: "corpus", kind: "data", address: "acme/corpus", pin: "a".repeat(64), licence: "CC-BY-4.0", maintainer: "unknown", route: "downloaded",
    place: null, paid: null, secret: null },
  model: { name: "weights", kind: "model", address: "acme/small", pin: "main-2026", licence: "Apache-2.0", maintainer: "Acme Research Group", route: "downloaded",
    place: null, paid: null, secret: null },
  compute: { name: "cluster", kind: "compute", address: "cluster.example.org", pin: null, licence: null, maintainer: null, route: "runner:gpu",
    place: "NHR@FAU, Erlangen", paid: null, secret: null },
  endpoint: { name: "local-llm", kind: "endpoint", address: "http://workstation.example.org:8000/v1", pin: "example-model", licence: null, maintainer: null,
    route: "bridge workstation", place: "the group's workstation", paid: false, secret: null },
  agent: { name: "coder", kind: "agent", address: "https://agent.example.org", pin: "example-model", licence: null, maintainer: "Acme Research Group",
    route: "bridge workstation", place: "the group's workstation", paid: true, secret: "ci:AGENT_KEY" },
};
const withChange = (kind, change) => ({ ...GOOD[kind], ...change });
const findingsFor = (...resources) => resourceFindings(resources);

// ---------------------------------------------------------------- resourceSchema

// guards: A PRODUCT DECLARES ITS RESOURCES; UC-040 (step 2)
// given: the example list of the module file's Data, with a title and a sentence as every list has
// input: the list read with resourceSchema and judged by documentFindings; resourceSchema's own rule
// expect: no finding at all; the schema names the rule `A PRODUCT DECLARES ITS RESOURCES` and the path docs/resources.md
test("resourceSchema reads the module file's example list without a finding", () => {
  const schema = resourceSchema();
  assert.equal(schema.rule, "A PRODUCT DECLARES ITS RESOURCES");
  assert.equal(schema.path, PATH);
  assert.deepEqual(schemaFindings([...HEAD, EXAMPLE, ""].join("\n")).map(formatFinding), []);
  assert.equal(readRegister(schema, PATH, [...HEAD, EXAMPLE, ""].join("\n")).rows.length, 2, "known positive: both example rows are read");
});

// guards: THE RESOURCE KIND IS ONE OF A CLOSED SET; UC-040 (4a)
// given: a list of one row of each of the six kinds, and the same list with one row of the kind `database`
// input: both read with resourceSchema
// expect: the first gives no finding; the second one finding, an error naming THE RESOURCE KIND IS ONE OF A CLOSED SET
test("a resource kind outside the closed set is refused", () => {
  const rows = [
    row({ Name: "tools", Kind: "repository", Address: "https://github.com/acme/tools", Pin: COMMIT, Licence: "MIT", Maintainer: "Acme", Route: "read from the host", Secret: "—" }),
    row({ Name: "corpus", Kind: "data", Address: "acme/corpus", Pin: "a".repeat(64), Licence: "CC-BY-4.0", Maintainer: "unknown", Route: "downloaded" }),
    row({ Name: "weights", Kind: "model", Address: "acme/small", Pin: "rev-1", Licence: "Apache-2.0", Maintainer: "Acme", Route: "downloaded" }),
    row({ Name: "cluster", Kind: "compute", Address: "cluster.example.org", Route: "runner:gpu", "Processing place": "Erlangen" }),
    row({ Name: "llm", Kind: "endpoint", Address: "http://h:8000/v1", Pin: "m", Route: "bridge ws", "Processing place": "ws", Paid: "no" }),
    row({ Name: "coder", Kind: "agent", Address: "https://a.example.org", Pin: "m", Maintainer: "Acme", Route: "bridge ws", "Processing place": "ws", Paid: "yes" }),
  ];
  assert.deepEqual(schemaFindings(listOf(...rows)).map(formatFinding), []);
  const found = schemaFindings(listOf(...rows, row({ Name: "db", Kind: "database", Address: "db.example.org", Route: "read" })));
  assert.equal(found.length, 1, found.map(formatFinding).join("\n"));
  assert.equal(found[0].kind, "error");
  assert.equal(found[0].rule, "THE RESOURCE KIND IS ONE OF A CLOSED SET");
});

// guards: A RESOURCE IS PINNED TO AN EXACT STATE; UC-040 (4a)
// given: resources of the type Resource: a repository pinned to a full commit; the same pinned to `main`, to a seven-digit abbreviation and to a tag
// input: resourceFindings of each; and the schema reading of a list whose repository is pinned to `main`
// expect: none for the commit; for each of the others an error naming A RESOURCE IS PINNED TO AN EXACT STATE and the resource and the pin; the schema's reading
//         names the same rule
test("a repository pinned to a branch name, an abbreviation or a tag is named", () => {
  assert.deepEqual(findingsFor(GOOD.repository), [], "known positive");
  for (const pin of ["main", "0123456", "v1.2.0"]) {
    const found = findingsFor(withChange("repository", { pin }));
    assert.equal(found.length, 1, pin);
    assert.equal(found[0].kind, "error");
    assert.equal(found[0].rule, "A RESOURCE IS PINNED TO AN EXACT STATE");
    assert.match(found[0].what, /tools/);
    assert.ok(found[0].what.includes(pin), found[0].what);
  }
  const text = listOf(row({ Name: "tools", Kind: "repository", Address: "https://github.com/acme/tools", Pin: "main", Licence: "MIT", Maintainer: "Acme", Route: "read" }));
  assert.ok(rulesOf(schemaFindings(text)).includes("A RESOURCE IS PINNED TO AN EXACT STATE"));
});

// guards: A RESOURCE DECLARES ITS LICENCE; A RESOURCE NAMES ITS MAINTAINER; A RESOURCE DECLARES WHERE IT PROCESSES DATA; A RESOURCE IS PINNED TO AN EXACT STATE; UC-040 (2a)
// given: one resource of each kind with everything its kind requires; then each with a column its kind requires taken away
// input: resourceFindings of each; the schema's reading of a list with a repository without a licence, a compute without a place and an endpoint without a pin
// expect: none for the complete ones; for the incomplete an error naming the column's rule — licence for a repository, data and a model; maintainer for a repository,
//         data, a model and an agent; processing place for compute, an endpoint and an agent; pin for every kind but compute; and the schema names the same rules
test("a column its kind requires, missing, is named", () => {
  for (const kind of Object.keys(GOOD)) assert.deepEqual(findingsFor(GOOD[kind]), [], `known positive: ${kind}`);
  const required = [
    ["repository", "licence", "A RESOURCE DECLARES ITS LICENCE"], ["data", "licence", "A RESOURCE DECLARES ITS LICENCE"], ["model", "licence", "A RESOURCE DECLARES ITS LICENCE"],
    ["repository", "maintainer", "A RESOURCE NAMES ITS MAINTAINER"], ["data", "maintainer", "A RESOURCE NAMES ITS MAINTAINER"],
    ["model", "maintainer", "A RESOURCE NAMES ITS MAINTAINER"], ["agent", "maintainer", "A RESOURCE NAMES ITS MAINTAINER"],
    ["compute", "place", "A RESOURCE DECLARES WHERE IT PROCESSES DATA"], ["endpoint", "place", "A RESOURCE DECLARES WHERE IT PROCESSES DATA"],
    ["agent", "place", "A RESOURCE DECLARES WHERE IT PROCESSES DATA"],
    ["repository", "pin", "A RESOURCE IS PINNED TO AN EXACT STATE"], ["data", "pin", "A RESOURCE IS PINNED TO AN EXACT STATE"],
    ["model", "pin", "A RESOURCE IS PINNED TO AN EXACT STATE"], ["endpoint", "pin", "A RESOURCE IS PINNED TO AN EXACT STATE"],
    ["agent", "pin", "A RESOURCE IS PINNED TO AN EXACT STATE"],
  ];
  for (const [kind, column, rule] of required) {
    const found = findingsFor(withChange(kind, { [column]: null }));
    assert.equal(found.length, 1, `${kind} without ${column}: ${found.map(formatFinding).join("; ")}`);
    assert.equal(found[0].kind, "error");
    assert.equal(found[0].rule, rule, `${kind} without ${column}`);
    assert.match(found[0].what, new RegExp(GOOD[kind].name));
  }
  const text = listOf(row({ Name: "tools", Kind: "repository", Address: "https://github.com/acme/tools", Pin: COMMIT, Maintainer: "Acme", Route: "read" }),
    row({ Name: "cluster", Kind: "compute", Address: "cluster.example.org", Route: "runner:gpu" }),
    row({ Name: "llm", Kind: "endpoint", Address: "http://h:8000/v1", Route: "bridge ws", "Processing place": "ws", Paid: "no" }));
  assert.deepEqual(rulesOf(schemaFindings(text)).sort(), ["A RESOURCE DECLARES ITS LICENCE", "A RESOURCE DECLARES WHERE IT PROCESSES DATA", "A RESOURCE IS PINNED TO AN EXACT STATE"]);
});

// guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; UC-040 (4c)
// given: compute resources whose route is `bridge lab-pc`, `runner:gpu`, and `ssh gpu`, `runner:`, `bridge`, `ci hosted`
// input: resourceFindings of each
// expect: none for the first two; for each other an error naming A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER and the route; an endpoint with
//         its own address as route is not judged by this rule
test("a compute route that names neither a Bridge nor a runner is named", () => {
  for (const route of ["bridge lab-pc", "runner:gpu"]) assert.deepEqual(findingsFor(withChange("compute", { route })), [], route);
  for (const route of ["ssh gpu", "runner:", "bridge", "ci hosted"]) {
    const found = findingsFor(withChange("compute", { route }));
    assert.equal(found.length, 1, route);
    assert.equal(found[0].rule, "A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER");
    assert.ok(found[0].what.includes(route), found[0].what);
  }
  assert.deepEqual(findingsFor(withChange("endpoint", { route: "http://workstation.example.org:8000/v1" })), []);
});

// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-040
// given: an endpoint and an agent with Paid yes and no; the same with the mark left out
// input: resourceFindings of each
// expect: none with a mark; for each without an error naming COMMIT TESTS CALL NO PAID SERVICE; a repository (which carries no mark) is not judged by it
test("an endpoint or an agent without its Paid mark is named", () => {
  for (const kind of ["endpoint", "agent"]) {
    for (const paid of [true, false]) assert.deepEqual(findingsFor(withChange(kind, { paid })), [], `${kind} ${paid}`);
    const found = findingsFor(withChange(kind, { paid: null }));
    assert.equal(found.length, 1, kind);
    assert.equal(found[0].kind, "error");
    assert.equal(found[0].rule, "COMMIT TESTS CALL NO PAID SERVICE");
    assert.match(found[0].what, new RegExp(GOOD[kind].name));
  }
  assert.deepEqual(findingsFor(withChange("repository", { paid: null })), []);
});

// guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS; UC-040
// given: a resource that carries capabilities, one that carries a role, one with both empty lists and no role
// input: resourceFindings of each
// expect: an error naming A RESOURCE IS USED, A PARTICIPANT DEVELOPS for the first two, and none for the third
test("an entry that carries a participant's capabilities or role is named", () => {
  assert.deepEqual(findingsFor({ ...GOOD.endpoint, capabilities: [], role: null }), [], "known positive");
  for (const extra of [{ capabilities: ["draft text", "run code and tests"] }, { role: "reviewer" }]) {
    const found = findingsFor({ ...GOOD.endpoint, ...extra });
    assert.equal(found.length, 1, JSON.stringify(extra));
    assert.equal(found[0].kind, "error");
    assert.equal(found[0].rule, "A RESOURCE IS USED, A PARTICIPANT DEVELOPS");
    assert.match(found[0].what, /local-llm/);
  }
});

// guards: A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; NO SECRET IN THE REPOSITORY; UC-040
// given: secrets `ci:API_KEY`, `ci:CODER_2`, `browser`, none; and `sk-live-abc123`, `ci:`, `ci:with space`, `ghp_0123456789abcdef`
// input: resourceFindings of an endpoint with each
// expect: none for the first four; for each other an error naming A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE, whose text does not repeat a value that is no `ci:` form
test("a secret's value where its name belongs is named, without repeating it", () => {
  for (const secret of ["ci:API_KEY", "ci:CODER_2", "browser", null]) assert.deepEqual(findingsFor(withChange("endpoint", { secret })), [], String(secret));
  for (const secret of ["sk-live-abc123", "ci:", "ci:with space", "ghp_0123456789abcdef"]) {
    const found = findingsFor(withChange("endpoint", { secret }));
    assert.equal(found.length, 1, secret);
    assert.equal(found[0].kind, "error");
    assert.equal(found[0].rule, "A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE");
    if (!secret.startsWith("ci:")) assert.equal(formatFinding(found[0]).includes(secret), false, "the finding does not repeat the value");
  }
});

// guards: A RESOURCE NAMES ITS MAINTAINER; UC-040
// given: repositories whose maintainer is `@alice`, `person Alice Example`; and `Acme Research Group`, `unknown`, `@alice, @bob`, `org acme`
// input: resourceFindings of each
// expect: for the first two one finding of kind warning naming A RESOURCE NAMES ITS MAINTAINER and the resource; none for the others
test("a maintainer who is a single person is a warning", () => {
  for (const maintainer of ["Acme Research Group", "unknown", "@alice, @bob", "org acme"]) assert.deepEqual(findingsFor(withChange("repository", { maintainer })), [], maintainer);
  for (const maintainer of ["@alice", "person Alice Example"]) {
    const found = findingsFor(withChange("repository", { maintainer }));
    assert.equal(found.length, 1, maintainer);
    assert.equal(found[0].kind, "warning");
    assert.equal(found[0].rule, "A RESOURCE NAMES ITS MAINTAINER");
    assert.match(found[0].what, /tools/);
  }
});

// guards: A PRODUCT DECLARES ITS RESOURCES; UC-040
// given: a list of two resources, the second with a branch pin and a secret's value
// input: resourceFindings of both, in a list
// expect: every finding is an error or a warning with a requirement's name as its rule, in the artifact docs/resources.md, each naming the position of its entry from 1 as its
//         line, and none for the first; findings come in the list's order
test("every finding names its rule, the list and the entry's position", () => {
  const found = findingsFor(GOOD.repository, withChange("repository", { name: "other", pin: "main", secret: "sk-live-abc123" }));
  assert.equal(found.length, 2);
  for (const each of found) {
    assert.match(each.rule, /^[A-Z][A-Z0-9 ,'-]+$/);
    assert.equal(each.artifact, PATH);
    assert.equal(each.line, 2);
    assert.equal(formatFinding(each).includes("sk-live-abc123"), false);
  }
  assert.deepEqual(found.map((each) => each.rule), ["A RESOURCE IS PINNED TO AN EXACT STATE", "A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE"]);
});
