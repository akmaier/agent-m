// Job definitions as data (docs/assets/job-harness.mjs): the loader over docs/assets/jobs/<kind>/job.json and prompt.md, the
// prompt, the answer against the output schema, whether the inputs fit a participant's context, what the run panel states
// before Run, the compiler form of a finding with the finding catalogue docs/assets/jobs/findings.json, and the split of
// findings into those sent back, those a person decides and those justified. Deterministic, no network.
// Run: node --test tests/*.test.mjs
//
// Module: MOD-job-harness
// Guards: A FINDING READS LIKE A COMPILER MESSAGE; THE PAGE STATES WHAT IT SENDS WHERE; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED; WHAT A PERSON DECIDES IS NOT SENT BACK
// Level: unit
//
// ITM-023. The definitions read are Agent M's one job folder of today, docs/assets/jobs/propose-backlog-items/ (ITM-033),
// and the fixture folder tests/fixtures/jobs/change-use-case/, with the inputs of tests/fixtures/jobs/inputs/. Every read
// goes through the `read` port the harness is given; a broken definition is a copy of a complete one with one fault
// planted by plant(), which refuses a replacement that does not occur exactly once. The SPEC itself is never read
// (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE): the examples of the compiler form are those UC-019 step 7 gives. The fixture driver
// records every request; the disclosure is compared with what it received. Counter-proofs: the pull request of ITM-023.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  contextFits, disclosure, formatFinding, loadDefinition, renderPrompt, splitFindings, validateOutput,
} from "../docs/assets/job-harness.mjs";

const JOBS = new URL("../docs/assets/jobs/", import.meta.url);
const FIX = new URL("./fixtures/jobs/", import.meta.url);
const text = (url) => readFileSync(url, "utf8");

// A read port over a folder of job definitions; `findings.json` is always Agent M's own catalogue. It records every path
// asked for, and `planted` replaces the text of one path by a copy with a fault.
function reader(base, planted = {}) {
  const asked = [];
  const read = async (path) => {
    asked.push(path);
    if (path in planted) return planted[path];
    return text(new URL(path, path === "findings.json" ? JOBS : base));
  };
  return { read, asked };
}

function plant(source, from, to) {
  const n = source.split(from).length - 1;
  assert.equal(n, 1, `the planted text must occur exactly once: ${JSON.stringify(from)} occurs ${n} times`);
  return source.replace(from, () => to);
}

const CATALOGUE = JSON.parse(text(new URL("findings.json", JOBS)));
const REQUIREMENTS = text(new URL("inputs/requirements.md", FIX)).trim().split(/\n\n+/);
const USE_CASES = readdirSync(new URL("inputs/use-cases/", FIX)).sort()
  .map((n) => text(new URL(`inputs/use-cases/${n}`, FIX)));

const changeInputs = () => ({
  instruction: "Add an alternative flow for a list that is too long for one file.",
  useCase: USE_CASES[0],
  requirements: REQUIREMENTS.slice(0, 2),
  useCases: USE_CASES.slice(1),
});

// The compiler form of A FINDING READS LIKE A COMPILER MESSAGE: <artifact>:<line>: <kind>: <what> [<RULE>] — <fix>.
const FORM = /^(?<artifact>[^\s:]+):(?<line>[^\s:]+): (?<kind>error|warning|person): (?<what>\S.*) \[(?<rule>[A-Z][A-Z0-9 ,'-]*[A-Z0-9]|UC-\d{3})\] — (?<fix>\S.*)$/;

// ---------------------------------------------------------------- loadDefinition

test("loadDefinition reads Agent M's job folder propose-backlog-items through the read port, with the finding catalogue", async () => {
  const { read, asked } = reader(JOBS);
  const d = await loadDefinition("propose-backlog-items", read);
  assert.deepEqual(asked.sort(), ["findings.json", "propose-backlog-items/job.json", "propose-backlog-items/prompt.md"]);
  assert.equal(d.kind, "propose-backlog-items");
  assert.equal(d.role, "Product Owner");
  assert.deepEqual(d.capabilities, ["draft text"]);
  assert.deepEqual(d.inputs, ["requirements", "useCases", "items"]);
  assert.deepEqual(d.checks, ["itemProblems"]);
  assert.equal(d.rounds, 3);
  assert.equal(d.result, "commit");
  assert.deepEqual(d.output, JSON.parse(text(new URL("propose-backlog-items/job.json", JOBS))).output);
  assert.equal(d.prompt, text(new URL("propose-backlog-items/prompt.md", JOBS)));
  assert.deepEqual(d.findings, CATALOGUE);
});

test("loadDefinition reads a fixture job folder of the same form", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  assert.equal(d.kind, "change-use-case");
  assert.deepEqual(d.inputs, ["instruction", "useCase", "requirements", "useCases"]);
  assert.equal(d.rounds, 5);
});

test("counter-proof: a definition with a planted fault is refused, naming the job and the fault", async () => {
  const JOB = text(new URL("change-use-case/job.json", FIX));
  const PROMPT = text(new URL("change-use-case/prompt.md", FIX));
  const cases = [
    ["job.json", plant(JOB, '"role": "Requirements Engineer",', ""), /role/],
    ["job.json", plant(JOB, '"capabilities": ["draft text"]', '"capabilities": "draft text"'), /capabilities/],
    ["job.json", plant(JOB, '"inputs": ["instruction", "useCase", "requirements", "useCases"]', '"inputs": []'), /inputs/],
    ["job.json", plant(JOB, '"inputs": ["instruction", "useCase", "requirements", "useCases"]',
      '"inputs": ["instruction", "useCase", "useCase", "requirements", "useCases"]'), /useCase/],
    ["job.json", plant(JOB, '"rounds": 5', '"rounds": 0'), /rounds/],
    ["job.json", plant(JOB, '"rounds": 5', '"rounds": 2.5'), /rounds/],
    ["job.json", plant(JOB, '"result": "commit"', '"result": "push"'), /result/],
    ["job.json", plant(JOB, '"checks": ["formatChecks"]', '"checks": [42]'), /checks/],
    ["job.json", plant(JOB, '"kind": "change-use-case"', '"kind": "change-a-use-case"'), /change-a-use-case/],
    ["job.json", plant(JOB, '"text": { "type": "string", "minLength": 1 }', '"text": { "oneOf": [{ "type": "string" }] }'), /oneOf/],
    ["job.json", plant(JOB, '"required": ["text"],', '"required": "text",'), /required/],
    ["job.json", plant(JOB, '"output": {', '"output": 7, "unused": {'), /output/],
    ["job.json", plant(JOB, '"result": "commit"', '"result": "commit",'), /job\.json/],
    ["prompt.md", plant(PROMPT, "{{useCases}}", "{{otherUseCases}}"), /otherUseCases/],
    ["prompt.md", plant(PROMPT, "{{useCases}}", "the other use cases"), /useCases/],
  ];
  for (const [file, broken, names] of cases) {
    const { read } = reader(FIX, { [`change-use-case/${file}`]: broken });
    await assert.rejects(loadDefinition("change-use-case", read), (e) => {
      assert.match(e.message, /change-use-case/, `the refusal names the job: ${e.message}`);
      assert.match(e.message, names, `the refusal names the fault: ${e.message}`);
      return true;
    }, `${file}: ${names}`);
  }
});

test("counter-proof: a kind that is no folder name is refused before anything is read", async () => {
  for (const kind of ["../secrets", "Change-Use-Case", "", "a/b"]) {
    const { read, asked } = reader(FIX);
    await assert.rejects(loadDefinition(kind, read), /kind/);
    assert.deepEqual(asked, [], kind);
  }
});

// ---------------------------------------------------------------- renderPrompt

test("renderPrompt fills every named placeholder with its input; the rest of the template is the template", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  const inputs = changeInputs();
  const messages = renderPrompt(d, inputs);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].role, "user");
  const content = messages[0].content;
  assert.ok(content.includes(inputs.instruction));
  assert.ok(content.includes(USE_CASES[0]));
  for (const r of REQUIREMENTS.slice(0, 2)) assert.ok(content.includes(r), r.split("\n")[0]);
  for (const u of USE_CASES.slice(1)) assert.ok(content.includes(u));
  assert.ok(!content.includes(REQUIREMENTS[2]), "an input not given is not in the prompt");
  assert.ok(!/\{\{\w+\}\}/.test(content), "no placeholder is left");
  // The template's own text, with the inputs taken out again, is unchanged.
  const parts = d.prompt.split(/\{\{\w+\}\}/);
  let at = 0;
  for (const part of parts) {
    const found = content.indexOf(part, at);
    assert.ok(found >= at, `the template text ${JSON.stringify(part.slice(0, 40))} stands in the prompt in its order`);
    at = found + part.length;
  }
});

test("renderPrompt inserts an input as it is: a placeholder inside an input is not filled", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  const content = renderPrompt(d, { ...changeInputs(), instruction: "Mention {{useCase}} literally." })[0].content;
  assert.ok(content.includes("Mention {{useCase}} literally."));
});

test("counter-proof: an input the definition does not name, or one it names but is not given, is refused", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  const { useCases, ...missing } = changeInputs();
  assert.throws(() => renderPrompt(d, missing), /useCases/);
  assert.throws(() => renderPrompt(d, { ...changeInputs(), mail: "From: someone" }), /mail/);
});

// ---------------------------------------------------------------- validateOutput

test("validateOutput: an answer in the output schema is its value; a single fenced JSON block is read too", async () => {
  const d = await loadDefinition("propose-backlog-items", reader(JOBS).read);
  const value = { items: [{ title: "Export", outcome: "The list is exported.", realises: ["THE LIST IS EXPORTED AS CSV"] }] };
  assert.deepEqual(validateOutput(d, JSON.stringify(value)), { value });
  assert.deepEqual(validateOutput(d, "```json\n" + JSON.stringify(value, null, 2) + "\n```\n"), { value });
});

test("validateOutput: an unreadable answer is an error finding, never an empty result", async () => {
  const d = await loadDefinition("propose-backlog-items", reader(JOBS).read);
  for (const answer of ["", "Here are your items: none.", '{"items": [', null, "```json\n{\"items\": []}\n```\n```json\n{}\n```"]) {
    const r = validateOutput(d, answer);
    assert.ok(!("value" in r), JSON.stringify(answer));
    assert.equal(r.findings.length, 1, JSON.stringify(answer));
    const [f] = r.findings;
    assert.equal(f.code, "answer-unreadable");
    assert.equal(f.kind, "error");
    assert.equal(f.rule, "AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED");
    assert.match(formatFinding(f), FORM);
  }
});

test("validateOutput: each departure from the output schema is an error finding naming where it is", async () => {
  const d = await loadDefinition("propose-backlog-items", reader(JOBS).read);
  const item = { title: "Export", outcome: "The list is exported.", realises: ["THE LIST IS EXPORTED AS CSV"] };
  const cases = [
    [{}, "/items", /required/],
    [{ items: "none" }, "/items", /array/],
    [{ items: [{ ...item, realises: [] }] }, "/items/0/realises", /at least 1/],
    [{ items: [{ ...item, title: "" }] }, "/items/0/title", /at least 1/],
    [{ items: [{ ...item, owner: "Ada" }] }, "/items/0/owner", /not allowed/],
    [{ items: [{ ...item, realises: [7] }] }, "/items/0/realises/0", /string/],
    [{ items: [item], extra: true }, "/extra", /not allowed/],
    [[item], "/", /object/],
  ];
  for (const [value, line, what] of cases) {
    const r = validateOutput(d, JSON.stringify(value));
    assert.ok(!("value" in r), JSON.stringify(value));
    assert.deepEqual(r.findings.map((f) => [f.code, f.kind, f.artifact, f.line]), [["answer-not-in-schema", "error", "answer", line]],
      JSON.stringify(value));
    assert.match(r.findings[0].what, what);
    assert.match(formatFinding(r.findings[0]), FORM);
  }
});

// ---------------------------------------------------------------- contextFits

test("contextFits measures every input completely and refuses when the total exceeds the participant's context", () => {
  const inputs = { requirements: REQUIREMENTS, source: "The list is exported as a spreadsheet." };
  const total = REQUIREMENTS.join("\n\n").length + inputs.source.length;
  const fit = contextFits(inputs, { context: { limit: total } });
  assert.equal(fit.fits, true);
  const over = contextFits(inputs, { context: { limit: total - 1 } });
  assert.equal(over.fits, false);
  assert.equal(over.limit, total - 1);
  assert.deepEqual(over.counts.requirements, { items: REQUIREMENTS.length, size: REQUIREMENTS.join("\n\n").length });
  assert.deepEqual(over.counts.source, { items: 1, size: inputs.source.length });
  assert.equal(over.counts.total, total);
});

test("contextFits counts in the participant's unit: characters by default, UTF-8 bytes, or the participant's own count", () => {
  const inputs = { useCase: "Größe ✓" };
  assert.equal(contextFits(inputs, { context: { limit: 7 } }).fits, true);
  assert.equal(contextFits(inputs, { context: { limit: 7, unit: "bytes" } }).fits, false);
  assert.equal(contextFits(inputs, { context: { limit: 11, unit: "bytes" } }).fits, true);
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  assert.equal(contextFits(inputs, { context: { limit: 2, unit: "tokens", count: words } }).fits, true);
  assert.equal(contextFits(inputs, { context: { limit: 1, unit: "tokens", count: words } }).fits, false);
});

test("counter-proof: a participant whose context is not stated, or stated in a unit without a count, is a fault of the caller", () => {
  assert.throws(() => contextFits({ a: "x" }, {}), /context/);
  assert.throws(() => contextFits({ a: "x" }, { context: { limit: 10, unit: "tokens" } }), /tokens/);
  assert.throws(() => contextFits({ a: "x" }, { context: { limit: -1 } }), /limit/);
});

// ---------------------------------------------------------------- disclosure

// A fixture driver: it records every request it receives, as a model endpoint would see it.
function recordingDriver(participant) {
  const requests = [];
  return {
    requests,
    describe: () => participant,
    send: async (job, messages) => {
      requests.push({ destination: participant.destination, job: job.kind, messages });
      return '{"text": "x"}';
    },
  };
}

const ENDPOINT = {
  destination: "https://models.example.org/v1/chat/completions", place: "EU", billing: "per use",
  context: { limit: 200000 },
};

test("disclosure names, before Run, the destination, the place, every input with how many and how much, and the billing", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  const inputs = changeInputs();
  const said = disclosure(d, inputs, ENDPOINT);
  assert.equal(said.destination, ENDPOINT.destination);
  assert.equal(said.place, "EU");
  assert.equal(said.billing, "per use");
  assert.deepEqual(said.items.map((i) => [i.input, i.items]), [["instruction", 1], ["useCase", 1], ["requirements", 2], ["useCases", 2]]);
  // The run: what the driver receives is exactly what was named.
  const driver = recordingDriver(ENDPOINT);
  await driver.send(d, renderPrompt(d, inputs));
  assert.equal(driver.requests.length, 1);
  const [request] = driver.requests;
  assert.equal(request.destination, said.destination, "the run contacts only the destination named");
  const sent = request.messages.map((m) => m.content).join("");
  assert.equal(said.counts.messages, request.messages.length);
  assert.equal(said.counts.size, sent.length, "the size named is the size sent");
  for (const item of said.items) {
    const value = inputs[item.input];
    for (const piece of Array.isArray(value) ? value : [value]) assert.ok(sent.includes(piece), `${item.input} is sent as named`);
  }
});

test("disclosure states billing as the participant states it, and unknown when it does not (NO COST IS GUESSED)", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  assert.equal(disclosure(d, changeInputs(), { ...ENDPOINT, billing: "not per use" }).billing, "not per use");
  const { billing, ...unstated } = ENDPOINT;
  assert.equal(disclosure(d, changeInputs(), unstated).billing, "unknown");
  assert.throws(() => disclosure(d, changeInputs(), { ...ENDPOINT, billing: "cheap" }), /billing/);
});

test("counter-proof: no disclosure without a destination and a place, nor for an input the definition does not name", async () => {
  const d = await loadDefinition("change-use-case", reader(FIX).read);
  const { destination, ...nowhere } = ENDPOINT;
  assert.throws(() => disclosure(d, changeInputs(), nowhere), /destination/);
  const { place, ...placeless } = ENDPOINT;
  assert.throws(() => disclosure(d, changeInputs(), placeless), /place/);
  assert.throws(() => disclosure(d, { ...changeInputs(), mail: "From: someone" }, ENDPOINT), /mail/);
});

// ---------------------------------------------------------------- formatFinding and the catalogue

const EXAMPLES = [
  // UC-019 step 7, verbatim.
  ["UC-007:4: error: id changed from UC-007 to UC-043 [AN EDITED FILE KEEPS ITS IDENTIFIER] — keep UC-007.",
    { code: "identifier-changed", artifact: "UC-007", line: 4, values: { opened: "UC-007", found: "UC-043" } }],
  ['UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.',
    { code: "unknown-realised-name", artifact: "UC-007", line: 12, values: { name: "EXPORT AS PDF" } }],
  ['SPEC:§3: error: "EXPORT IS A PDF" restates the existing requirement word for word but is classed new [EXACT DUPLICATES ARE FOUND WITHOUT A MODEL] — class it as duplicate of EXPORT IS A PDF.',
    { code: "exact-duplicate-classed-otherwise", artifact: "SPEC", line: "§3", values: { name: "EXPORT IS A PDF", class: "new", existing: "EXPORT IS A PDF" } }],
  ['SPEC:§3: warning: rule contains "and" [ONE STATEMENT PER REQUIREMENT] — split it, or keep it and give a one-line reason.',
    { code: "rule-conjunction", artifact: "SPEC", line: "§3", values: { word: "and" } }],
];

test("formatFinding writes a finding in the compiler form — UC-019's examples, from the fields and from the catalogue", () => {
  for (const [expected, coded] of EXAMPLES) {
    assert.equal(formatFinding(coded, CATALOGUE), expected);
    const m = FORM.exec(expected).groups;
    assert.equal(formatFinding({ artifact: m.artifact, line: m.line, kind: m.kind, what: m.what, rule: m.rule, fix: m.fix }), expected);
  }
});

test("counter-proof: formatFinding refuses a finding that cannot be written in the form", () => {
  const ok = { artifact: "UC-007", line: 12, kind: "error", what: "x", rule: "A RULE", fix: "y." };
  assert.equal(formatFinding(ok), "UC-007:12: error: x [A RULE] — y.");
  for (const [broken, names] of [
    [{ ...ok, kind: "note" }, /kind/], [{ ...ok, rule: "" }, /rule/], [{ ...ok, what: "" }, /what/],
    [{ ...ok, fix: undefined }, /fix/], [{ ...ok, artifact: "" }, /artifact/], [{ ...ok, line: undefined }, /line/],
    [{ code: "no-such-code", artifact: "UC-007", line: 1 }, /no-such-code/],
    [{ code: "identifier-changed", artifact: "UC-007", line: 4, values: { opened: "UC-007" } }, /found/],
    [{ code: "identifier-changed", artifact: "UC-007", line: 4, kind: "warning", values: { opened: "UC-007", found: "UC-043" } }, /kind/],
  ]) {
    assert.throws(() => formatFinding(broken, CATALOGUE), names, JSON.stringify(broken));
  }
  assert.throws(() => formatFinding({ code: "identifier-changed", artifact: "UC-007", line: 4, values: {} }), /catalogue/);
});

test("a finding is one line: a line break in what or fix becomes a space", () => {
  assert.equal(formatFinding({ artifact: "answer", line: 1, kind: "error", what: "the answer\nis not JSON", rule: "A RULE", fix: "answer\r\nwith JSON." }),
    "answer:1: error: the answer is not JSON [A RULE] — answer with JSON.");
});

test("every finding of the catalogue formats in the compiler form, each code once", () => {
  assert.ok(Array.isArray(CATALOGUE.findings) && CATALOGUE.findings.length > 0);
  const codes = CATALOGUE.findings.map((f) => f.code);
  assert.deepEqual(codes, [...new Set(codes)], "each code once");
  for (const entry of CATALOGUE.findings) {
    assert.match(entry.code, /^[a-z0-9]+(-[a-z0-9]+)*$/, entry.code);
    assert.ok(["error", "warning", "person"].includes(entry.kind), entry.code);
    const names = [...`${entry.what} ${entry.fix}`.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    const values = Object.fromEntries(names.map((n) => [n, `<${n}>`]));
    const line = formatFinding({ code: entry.code, artifact: "UC-001", line: 7, values }, CATALOGUE);
    const m = FORM.exec(line);
    assert.ok(m, `${entry.code}: ${line}`);
    assert.deepEqual([m.groups.artifact, m.groups.line, m.groups.kind, m.groups.rule], ["UC-001", "7", entry.kind, entry.rule], entry.code);
  }
});

// The findings the accepted SPEC and use cases name for a correction loop (ITM-023's outcome), by the rule each enforces and
// its kind: the format rules of MOD-artifacts' formatChecks (ITM-013) and of a backlog item, and those UC-005, UC-007,
// UC-019, UC-022, UC-026 and UC-038 name.
const NAMED = [
  // UC-007 step 5, UC-019 step 7, UC-022 step 6: an unknown realised name, a changed identifier.
  ["A USE CASE REALISES NAMED REQUIREMENTS", "error"],
  ["AN EDITED FILE KEEPS ITS IDENTIFIER", "error"],
  // UC-005 step 6, UC-019 step 7: an exact duplicate classed otherwise, a candidate without its fields or check, a conjunction.
  ["EXACT DUPLICATES ARE FOUND WITHOUT A MODEL", "error"],
  ["A REQUIREMENT HAS FIVE FIELDS", "error"],
  ["A REQUIREMENT NAMES ITS CHECK", "error"],
  ["ONE STATEMENT PER REQUIREMENT", "warning"],
  // UC-026 step 6: a test without expected result, model-dependent on one run, at commit level calling a paid service, guarding nothing.
  ["A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS", "error"],
  ["A MODEL-DEPENDENT TEST IS MEASURED AS A RATE", "error"],
  ["COMMIT TESTS CALL NO PAID SERVICE", "error"],
  ["EVERY ARTIFACT NAMES ITS ORIGIN", "error"],
  // UC-038 step 6: a mention of a person, found by the search for the mail's people or by a checking participant.
  ["A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE", "error"],
  ["REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS", "error"],
  // UC-019 step 7: not sent back — a conflict, a renamed requirement.
  ["A CONFLICT IS DECIDED BY A PERSON", "person"],
  ["A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED", "person"],
  // The answer itself (ARC-007 decision 7): unreadable, or not in the output schema.
  ["AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED", "error"],
  // The format rules of formatChecks (ITM-013) and of a backlog item.
  ["EVERY ARTIFACT HAS AN IDENTIFIER", "error"],
  ["A REQUIREMENT HAS A REGISTERED SOURCE", "error"],
  ["A RESOURCE'S TERMS ENTER AS A SOURCE", "error"],
  ["A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION", "error"],
  ["ONE USE CASE, ONE FILE", "error"],
  ["DIAGRAMS ARE MERMAID IN MARKDOWN", "error"],
  ["ONE ARCHITECTURE DECISION, ONE FILE", "error"],
  ["AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES", "error"],
  ["ONE MODULE, ONE FILE", "error"],
  ["A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES", "error"],
  ["THE NAME IS THE ID AND IT SURVIVES", "error"],
  ["THE NAME IS THE ID AND IT SURVIVES", "warning"],
  ["EVERY TEST HAS ONE LEVEL", "error"],
  ["ARTIFACTS ARE ARRANGED IN NESTED GROUPS", "error"],
  ["A GROUP CARRIES NO IDENTIFIER", "error"],
  ["A GROUP HOLDS ONE KIND OF ARTIFACT", "error"],
  ["AN ITEM HAS ONE PLACE IN ITS HIERARCHY", "error"],
  ["EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN", "error"],
  ["A BACKLOG ITEM NAMES WHAT IT REALISES", "error"],
  ["THE BACKLOG LIVES IN THE PRODUCT REPOSITORY", "error"],
  ["UC-032", "warning"],
];

test("the catalogue holds every finding the SPEC and the use cases name for a correction loop", () => {
  const held = new Set(CATALOGUE.findings.map((f) => `${f.rule} / ${f.kind}`));
  const missing = NAMED.map(([rule, kind]) => `${rule} / ${kind}`).filter((k) => !held.has(k));
  assert.deepEqual(missing, []);
  for (const code of ["answer-unreadable", "answer-not-in-schema", "identifier-changed", "unknown-realised-name",
    "exact-duplicate-classed-otherwise", "rule-conjunction", "conflict", "requirement-renamed"]) {
    assert.ok(CATALOGUE.findings.some((f) => f.code === code), code);
  }
});

// ---------------------------------------------------------------- splitFindings

const F = {
  error: { artifact: "UC-007", line: 12, kind: "error", what: 'realises "EXPORT AS PDF" matches no requirement', rule: "A USE CASE REALISES NAMED REQUIREMENTS", fix: "use an existing name or remove the line." },
  warning: { artifact: "SPEC", line: "§3", kind: "warning", what: 'rule contains "and"', rule: "ONE STATEMENT PER REQUIREMENT", fix: "split it, or keep it and give a one-line reason." },
  conflict: { artifact: "SPEC", line: "§3", kind: "person", what: '"EXPORT IS A PNG" contradicts THE EXPORT IS A PDF', rule: "A CONFLICT IS DECIDED BY A PERSON", fix: "the person decides." },
};

test("splitFindings: errors and unjustified warnings go back; a person's finding never does", () => {
  const r = splitFindings([F.error, F.warning, F.conflict], []);
  assert.deepEqual(r.back, [F.error, F.warning]);
  assert.deepEqual(r.person, [F.conflict]);
  assert.deepEqual(r.justified, []);
});

test("splitFindings: a warning answered with a one-line justification leaves the loop with it; an error does not", () => {
  const why = (f, reason) => ({ artifact: f.artifact, rule: f.rule, what: f.what, reason });
  const r = splitFindings([F.error, F.warning, F.conflict],
    [why(F.warning, "the rule names one export in two formats."), why(F.error, "the name will exist.")]);
  assert.deepEqual(r.back, [F.error]);
  assert.deepEqual(r.person, [F.conflict]);
  assert.deepEqual(r.justified, [{ ...F.warning, justification: "the rule names one export in two formats." }]);
});

test("counter-proof: a justification of more than one line, an empty one, or one for another finding does not justify", () => {
  for (const reason of ["first line\nsecond line", "", "   "]) {
    const r = splitFindings([F.warning], [{ artifact: F.warning.artifact, rule: F.warning.rule, what: F.warning.what, reason }]);
    assert.deepEqual(r.back, [F.warning], JSON.stringify(reason));
  }
  const other = splitFindings([F.warning], [{ artifact: "UC-001", rule: F.warning.rule, what: F.warning.what, reason: "fine." }]);
  assert.deepEqual(other.back, [F.warning]);
  assert.throws(() => splitFindings([{ ...F.error, kind: "note" }], []), /kind/);
});
