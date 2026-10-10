// The implementation-plan order and sprint records (ITM-297) — fresh unit coverage for the two missing public schemas of MOD-work-plans.
// Run: node --test tests/work-plans-plan-schemas.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-002; UC-032; UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// The module owns schemas only. These cases read and write through MOD-documents' public interface and never introduce
// a caller, saved state, dependency validation, or a sprint action.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendSection, documentFindings, readDocument, readRegister, writeDocument } from "../src/documents/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const PLAN_PATH = "docs/plan/order.md";
const SPRINT_PATH = "docs/backlog/sprints/19.md";
const MODULE = new URL("../src/work-plans/index.mjs", import.meta.url);
const BACKLOG_ORDER_SCHEMA_FILE = new URL("../src/work-plans/backlog-order.schema.md", import.meta.url);
const PLAN_ORDER_SCHEMA_FILE = new URL("../src/work-plans/plan-order.schema.md", import.meta.url);
const SPRINT_SCHEMA_FILE = new URL("../src/work-plans/sprint.schema.md", import.meta.url);

const planOrderOf = (...rows) => [
  "# The order of the implementation plan", "", "**REGISTER**", "", "The plan's steps in their order.", "", "## Order", "",
  "| Step | Phase |", "|---|---|", ...rows.map(([step, phase]) => `| ${step} | ${phase} |`), "",
].join("\n");

const sprintOf = ({ selection = ["ITM-297", "ITM-298"], start = "2026-10-10", end = "", branch = "sprint/19" } = {}) => [
  "---", "sprint: 19", "goal: Give plans and sprints their schemas", `start: ${start}`, end ? `end: ${end}` : "end:",
  "closer: scrum-master-session", `branch: ${branch}`, "selection:", ...selection.map((item) => `  - ${item}`), "---",
  "# Sprint 19", "", "**REGISTER**", "", "The selected backlog work.", "",
].join("\n");

const findingsOf = (schema, path, text) => documentFindings(schema, readDocument(schema, path, text));

const findingShape = ({ artifact, line, kind, rule, what }) => ({ artifact, line, kind, rule, what });

let loads = 0;
async function load({ disk, fetch }) {
  const saved = { getBuiltinModule: process.getBuiltinModule, fetch: globalThis.fetch };
  const reads = [];
  process.getBuiltinModule = (name) => (name === "node:fs" ? disk?.(reads) : saved.getBuiltinModule.call(process, name));
  globalThis.fetch = fetch ? (url) => { reads.push(`fetch ${url}`); return fetch(url); } : undefined;
  try {
    loads += 1;
    return { module: await import(new URL(`?load=${loads}`, MODULE)), error: null, reads };
  } catch (error) {
    return { module: null, error, reads };
  } finally {
    process.getBuiltinModule = saved.getBuiltinModule;
    globalThis.fetch = saved.fetch;
  }
}

const realDisk = (reads) => ({
  readFileSync: (url, encoding) => { reads.push(`disk ${url}`); return readFileSync(url, encoding); },
});

// TST-297011
// given: an implementation-plan order with three ITM steps in two model phases
// input: readRegister(planSchemas.planOrder, docs/plan/order.md, text)
// expect: rows preserve Step and Phase values and their table order
// guards: UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
test("TST-297011: planSchemas.planOrder reads ordered Step and Phase rows", () => {
  const { rows } = readRegister(planSchemas.planOrder, PLAN_PATH,
    planOrderOf(["ITM-297", "Planning"], ["ITM-298", "Development"], ["ITM-299", "Development"]));
  assert.deepEqual(rows.map((row) => row.cells), [
    { Step: "ITM-297", Phase: "Planning" }, { Step: "ITM-298", Phase: "Development" }, { Step: "ITM-299", Phase: "Development" },
  ]);
});

// TST-297012
// given: canonical plan-order and sprint records, including a selected backlog list
// input: readDocument then writeDocument through their public schemas
// expect: each canonical record round-trips byte for byte
// guards: UC-032; UC-045; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
test("TST-297012: canonical plan order and sprint records round-trip without persisted state", () => {
  const plan = planOrderOf(["ITM-297", "Planning"], ["ITM-298", "Development"]);
  const sprint = sprintOf();
  assert.equal(writeDocument(planSchemas.planOrder, readDocument(planSchemas.planOrder, PLAN_PATH, plan)), plan);
  assert.equal(writeDocument(planSchemas.sprint, readDocument(planSchemas.sprint, SPRINT_PATH, sprint)), sprint);
  assert.equal(Object.hasOwn(readDocument(planSchemas.sprint, SPRINT_PATH, sprint).fields, "state"), false);
});

// TST-297013
// given: known-valid plan and sprint records; then an invalid plan step, a sprint path outside its folder or with the
//        wrong extension, and an invalid sprint date
// input: documentFindings through planSchemas
// expect: valid records have no finding; each malformed value names its artifact, line, format rule and compiler message
// guards: THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
test("TST-297013: malformed identifiers, paths, and sprint dates are findings after known-valid records", () => {
  assert.deepEqual(findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderOf(["ITM-297", "Planning"])), []);
  assert.deepEqual(findingsOf(planSchemas.sprint, SPRINT_PATH, sprintOf()), []);
  const [badStep] = findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderOf(["NOT-297", "Planning"]));
  assert.deepEqual(findingShape(badStep), {
    artifact: PLAN_PATH, line: 11, kind: "error", rule: "THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY",
    what: 'the column Step does not fit: "NOT-297" is not an identifier ITM',
  });
  for (const path of ["docs/backlog/other/19.md", "docs/backlog/sprints/19.txt"]) {
    const [badPath] = findingsOf(planSchemas.sprint, path, sprintOf());
    assert.deepEqual(findingShape(badPath), {
      artifact: path, line: 1, kind: "error", rule: "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY",
      what: `the path ${path} does not match a path of the format sprint`,
    });
  }
  const [badDate] = findingsOf(planSchemas.sprint, SPRINT_PATH, sprintOf({ start: "2026-99-10" }));
  assert.deepEqual(findingShape(badDate), {
    artifact: SPRINT_PATH, line: 4, kind: "error", rule: "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY",
    what: 'the key start does not fit: "2026-99-10" is not a date YYYY-MM-DD',
  });
});

// TST-297014
// given: a sprint record and two later Selection headings, whose accepted format declares no structured fields
// input: appendSection with an empty field record twice, then readDocument
// expect: each allowed append retains every earlier byte, both headings remain in order, and no item/job state is added
// guards: UC-032; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
test("TST-297014: repeated Selection decisions append without changing earlier sprint bytes", () => {
  const first = appendSection(planSchemas.sprint, sprintOf(), "## Selection", {});
  const second = appendSection(planSchemas.sprint, first, "## Selection", {});
  assert.ok(first.startsWith(sprintOf()));
  assert.ok(second.startsWith(first));
  const document = readDocument(planSchemas.sprint, SPRINT_PATH, second);
  assert.deepEqual(document.appended.filter((section) => section.heading === "## Selection").map((section) => section.text), ["\n", "\n\n"]);
  assert.equal(second.includes("state:"), false);
});

// TST-297015
// given: a sprint record with each accepted appended section as freeform prose, feedback destinations, tables and lists
// input: readDocument then writeDocument through planSchemas.sprint
// expect: Ended, Review, Unfinished items and Retrospective retain their complete section text for later callers
// guards: UC-002; UC-032; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
test("TST-297015: sprint appended records preserve review, unfinished-item, and retrospective text", () => {
  const text = `${sprintOf()}\n## Ended\n\nThe Product Owner ended this sprint without a time box on 2026-10-10.\n\n## Review\n\nBy scrum-master-session, the closer of sprint 04, on sprint/04 at 1f18003, 2026-10-06. Who took part:\n- akmaier, the person: started the sprint;\n- po-opus, Product Owner: every gate;\n- tester-opus: the release tests.\n\nThe feedback below comes from:\n- the pull requests #97–#106, their CI runs and their reviews;\n- the gate records under docs/gates/;\n- the reports of the developers and the tester.\n\n**The increment.** UC-001 adds a product through the modules of the accepted architecture.\n\n**Feedback, each with where it goes.**\n- The order of the backlog is a table in MOD-work-plans.\n  → New item ITM-209.\n- Step A shows no tokens button before an address is typed.\n  → Noted.\n\n## Unfinished items\n\nNone of the selection is unfinished. ITM-204 and ITM-207 left the sprint by the Product Owner's start decision and stay in the backlog.\n\n## Retrospective\n\n**What went well.**\n- Every item began with failing tests, and every new test has a recorded counter-proof.\n\n**What did not.**\n- The Scrum Master wrote item texts that asked for re-exports in old files.\n\n**Changes, each with where it goes.** An agent's changes are proposals only.\n- Proposed, team agreement: a sprint runs as one coordinated run.\n`;
  const document = readDocument(planSchemas.sprint, SPRINT_PATH, text);
  const appended = document.appended;
  assert.equal(writeDocument(planSchemas.sprint, document), text);
  assert.deepEqual(appended.map((section) => section.heading), ["## Ended", "## Review", "## Unfinished items", "## Retrospective"]);
  assert.match(appended[1].text, /Feedback, each with where it goes/);
  assert.match(appended[1].text, /gate records under docs\/gates/);
  assert.match(appended[2].text, /stay in the backlog/);
  assert.match(appended[3].text, /Proposed, team agreement/);
});

// TST-297016
// given: MOD-work-plans loaded afresh from disk, then from each of its three own schema addresses, and finally with its
//        first own schema address refused
// input: planSchemas on each module load
// expect: each schema is read once from the selected owned boundary; a refused own schema stops the module and names its file
// guards: A DATA FORMAT IS DEFINED ONCE; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
test("TST-297016: planSchemas loads each owned schema from its module boundary", async () => {
  const texts = new Map([
    [BACKLOG_ORDER_SCHEMA_FILE.href, readFileSync(BACKLOG_ORDER_SCHEMA_FILE, "utf8")],
    [PLAN_ORDER_SCHEMA_FILE.href, readFileSync(PLAN_ORDER_SCHEMA_FILE, "utf8")],
    [SPRINT_SCHEMA_FILE.href, readFileSync(SPRINT_SCHEMA_FILE, "utf8")],
  ]);
  const onDisk = await load({ disk: realDisk });
  const atAddress = await load({ disk: undefined, fetch: async (url) => new Response(texts.get(new URL(url).href) ?? "Not Found", {
    status: texts.has(new URL(url).href) ? 200 : 404,
  }) });
  for (const [where, loaded, read] of [["disk", onDisk, "disk"], ["address", atAddress, "fetch"]]) {
    assert.equal(loaded.error, null, `${where}: the module loads: ${loaded.error?.message}`);
    assert.deepEqual(loaded.reads, [
      `${read} ${BACKLOG_ORDER_SCHEMA_FILE.href}`,
      `${read} ${PLAN_ORDER_SCHEMA_FILE.href}`,
      `${read} ${SPRINT_SCHEMA_FILE.href}`,
    ], where);
    assert.deepEqual(loaded.module.planSchemas.planOrder, planSchemas.planOrder, where);
    assert.deepEqual(loaded.module.planSchemas.sprint, planSchemas.sprint, where);
  }
  const notServed = await load({ disk: undefined, fetch: async () => new Response("Not Found", { status: 404 }) });
  assert.deepEqual(notServed.reads, [`fetch ${BACKLOG_ORDER_SCHEMA_FILE.href}`]);
  assert.equal(notServed.module, null, "a refused own schema stops the module");
  assert.ok(notServed.error instanceof Error && notServed.error.message.includes("backlog-order.schema.md")
    && notServed.error.message.includes("404"), `the error names the refused own schema: ${notServed.error?.message}`);

  // CI-only source-copy proof: omit the two new schema initializers, run the same public and loader-boundary cases,
  // restore the original bytes, and run that identical child selection again. The child marker prevents recursion.
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_297_WORKPLANS_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-297-workplans-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    const source = join(copied, "src", "work-plans", "index.mjs");
    const testPath = join(copied, "tests", "work-plans-plan-schemas.test.mjs");
    const original = readFileSync(source);
    const faultLines = [
      '  planOrder: loadSchema(disk ? disk.readFileSync(PLAN_ORDER_SCHEMA_FILE, "utf8") : await ownFile(PLAN_ORDER_SCHEMA_FILE), OWNER),\n',
      '  sprint: loadSchema(disk ? disk.readFileSync(SPRINT_SCHEMA_FILE, "utf8") : await ownFile(SPRINT_SCHEMA_FILE), OWNER),\n',
    ];
    for (const line of faultLines) assert.equal(original.toString().split(line).length - 1, 1, "each new schema initializer is a unique fault target");
    const ids = ["TST-297011", "TST-297012", "TST-297013", "TST-297014", "TST-297015", "TST-297016"];
    const argv = [process.execPath, "--test", "--test-name-pattern", "TST-29701[1-6]", testPath];
    const invoke = () => {
      const env = { ...process.env, AGENT_M_297_WORKPLANS_FAULT_CHILD: "1" };
      delete env.NODE_TEST_CONTEXT;
      return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 40_000, env });
    };
    const originalHash = createHash("sha256").update(original).digest("hex");
    const testHash = createHash("sha256").update(readFileSync(testPath)).digest("hex");
    const faultStarted = new Date().toISOString();
    writeFileSync(source, faultLines.reduce((text, line) => text.replace(line, ""), original.toString()));
    const faultHash = createHash("sha256").update(readFileSync(source)).digest("hex");
    const failed = invoke();
    const faultEnded = new Date().toISOString();
    const restoreStarted = new Date().toISOString();
    writeFileSync(source, original);
    const restoredHash = createHash("sha256").update(readFileSync(source)).digest("hex");
    const passed = invoke();
    const restoreEnded = new Date().toISOString();
    process.stdout.write(`TST-297016-counterproof ${JSON.stringify({ argv, cwd: copied, ids, source, testPath, originalHash, faultHash, restoredHash, testHash, faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultStdout: failed.stdout, faultStderr: failed.stderr, restoreStarted, restoreEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr })}\n`);
    assert.equal(restoredHash, originalHash, "byte-exact source restoration precedes the same-case pass");
    assert.equal(failed.status, 1, "faulted child has normal Node test failure status");
    assert.equal(failed.signal, null); assert.equal(failed.error, undefined);
    for (const id of ids) assert.match(failed.stdout, new RegExp(`not ok \\d+ - ${id}:`), `${id} fails with the missing public schema`);
    assert.equal(passed.status, 0, "restored same-case child passes");
    assert.equal(passed.signal, null); assert.equal(passed.error, undefined);
    for (const id of ids) assert.match(passed.stdout, new RegExp(`ok \\d+ - ${id}:`), `${id} passes after restoration`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
