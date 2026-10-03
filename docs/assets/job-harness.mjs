// Job harness — job kinds as data (ARC-007 decisions 1, 2, 5): a job definition read from docs/assets/jobs/<kind>/job.json and
// prompt.md and validated, its prompt filled, an answer checked against its output schema, whether the inputs fit a
// participant's context, what the run panel states before Run, a finding in the compiler form with the finding catalogue
// docs/assets/jobs/findings.json, and the split of findings into those sent back, those a person decides and those justified.
// Kernel (ARC-003): pure functions over what they are given; files are read only through the `read` port passed in, nothing is
// sent, stored or timed here, and no job kind is known by name.
//
// Module: MOD-job-harness
//
// The read port: read(path) -> Promise<string>, `path` relative to the folder docs/assets/jobs/ — `<kind>/job.json`,
// `<kind>/prompt.md`, `findings.json`. The browser fetches it from its own Pages origin, CI and the bridge read the files.
//
// A finding: { artifact, line, kind: "error" | "warning" | "person", what, rule, fix }, written by formatFinding as
//
//   <artifact>:<line>: <kind>: <what> [<RULE>] — <fix>
//
// A finding may instead name a `code` of the catalogue with the `values` its texts need; the catalogue then gives its kind, its
// rule and the texts of what and fix.

// ---------------------------------------------------------------- the definition

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INPUT_NAME = /^[A-Za-z][A-Za-z0-9]*$/;
const PLACEHOLDER = /\{\{(\w+)\}\}/g;
// The two result routes of ARC-007 decision 1: a commit to the default branch (open artifacts) or a pull request (code).
const RESULTS = ["commit", "pull-request"];
// The keywords of JSON Schema the harness checks. A schema using another one is refused when the definition is read: a
// keyword nobody checks would let an answer pass unchecked.
const SCHEMA_KEYWORDS = new Set(["type", "properties", "required", "additionalProperties", "items", "minItems", "maxItems",
  "minLength", "maxLength", "enum", "description", "title"]);
const TYPES = ["object", "array", "string", "integer", "number", "boolean", "null"];
// The codes the harness itself gives; the catalogue must hold them.
const UNREADABLE = "answer-unreadable";
const NOT_IN_SCHEMA = "answer-not-in-schema";
const FINDING_KINDS = ["error", "warning", "person"];

const isStringList = (v) => Array.isArray(v) && v.every((s) => typeof s === "string" && s.trim() !== "");

function schemaProblems(schema, at, out) {
  if (schema === null || typeof schema !== "object" || Array.isArray(schema)) {
    out.push(`output${at}: a schema must be an object`);
    return;
  }
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.has(key)) out.push(`output${at}: the keyword ${key} is not checked by the harness`);
  }
  if ("type" in schema && !TYPES.includes(schema.type)) out.push(`output${at}: type ${JSON.stringify(schema.type)} is none of ${TYPES.join(", ")}`);
  if ("required" in schema && !isStringList(schema.required)) out.push(`output${at}: required must be a list of property names`);
  if ("enum" in schema && !Array.isArray(schema.enum)) out.push(`output${at}: enum must be a list`);
  if ("additionalProperties" in schema && typeof schema.additionalProperties !== "boolean") {
    out.push(`output${at}: additionalProperties must be true or false`);
  }
  for (const key of ["minItems", "maxItems", "minLength", "maxLength"]) {
    if (key in schema && !(Number.isInteger(schema[key]) && schema[key] >= 0)) out.push(`output${at}: ${key} must be a whole number`);
  }
  if ("properties" in schema) {
    if (schema.properties === null || typeof schema.properties !== "object" || Array.isArray(schema.properties)) {
      out.push(`output${at}: properties must be an object`);
    } else {
      for (const [name, sub] of Object.entries(schema.properties)) schemaProblems(sub, `${at}/properties/${name}`, out);
    }
  }
  if ("items" in schema) schemaProblems(schema.items, `${at}/items`, out);
}

function catalogueProblems(catalogue) {
  const out = [];
  if (!catalogue || !Array.isArray(catalogue.findings)) return ["findings.json: no list findings"];
  const seen = new Set();
  for (const f of catalogue.findings) {
    const name = f?.code ?? JSON.stringify(f);
    if (typeof f?.code !== "string" || !SLUG.test(f.code)) out.push(`findings.json: code ${name} is not a slug`);
    if (seen.has(f?.code)) out.push(`findings.json: code ${name} is given twice`);
    seen.add(f?.code);
    if (!FINDING_KINDS.includes(f?.kind)) out.push(`findings.json: ${name}: kind is none of ${FINDING_KINDS.join(", ")}`);
    for (const key of ["rule", "what", "fix"]) {
      if (typeof f?.[key] !== "string" || !f[key].trim()) out.push(`findings.json: ${name}: no ${key}`);
    }
  }
  for (const code of [UNREADABLE, NOT_IN_SCHEMA]) {
    if (!seen.has(code)) out.push(`findings.json: the code ${code} the harness gives is missing`);
  }
  return out;
}

function definitionProblems(kind, job, prompt) {
  const out = [];
  if (job === null || typeof job !== "object" || Array.isArray(job)) return ["job.json: not a JSON object"];
  if (job.kind !== kind) out.push(`job.json: kind ${JSON.stringify(job.kind)} is not the folder's name ${kind}`);
  if (typeof job.role !== "string" || !job.role.trim()) out.push("job.json: no role");
  if (!isStringList(job.capabilities)) out.push("job.json: capabilities must be a list of names");
  if (!Array.isArray(job.inputs) || job.inputs.length === 0) {
    out.push("job.json: inputs must name at least one input");
  } else {
    const seen = new Set();
    for (const name of job.inputs) {
      if (typeof name !== "string" || !INPUT_NAME.test(name) || name === "total") {
        out.push(`job.json: the input ${JSON.stringify(name)} is no name of the form ${INPUT_NAME.source}, or is "total"`);
      } else if (seen.has(name)) {
        out.push(`job.json: the input ${name} is named twice`);
      }
      seen.add(name);
    }
  }
  if (job.output === null || typeof job.output !== "object" || Array.isArray(job.output)) {
    out.push("job.json: output must be a JSON Schema object");
  } else {
    schemaProblems(job.output, "", out);
  }
  if (!Array.isArray(job.checks) || !job.checks.every((c) => typeof c === "string" && c.trim())) {
    out.push("job.json: checks must be a list of check names");
  }
  if (!(Number.isInteger(job.rounds) && job.rounds > 0)) out.push("job.json: rounds must be a whole number above 0");
  if (!RESULTS.includes(job.result)) out.push(`job.json: result ${JSON.stringify(job.result)} is none of ${RESULTS.join(", ")}`);
  for (const key of Object.keys(job)) {
    if (!["kind", "role", "capabilities", "inputs", "output", "checks", "rounds", "result"].includes(key)) {
      out.push(`job.json: the key ${key} is not part of a job definition`);
    }
  }
  if (typeof prompt === "string" && Array.isArray(job.inputs)) {
    const named = new Set([...prompt.matchAll(PLACEHOLDER)].map((m) => m[1]));
    for (const p of named) if (!job.inputs.includes(p)) out.push(`prompt.md: the placeholder {{${p}}} names no input`);
    for (const i of job.inputs) if (!named.has(i)) out.push(`prompt.md: the input ${i} has no placeholder {{${i}}}`);
  }
  return out;
}

// loadDefinition(kind, read) -> Promise<definition> — docs/assets/jobs/<kind>/job.json and prompt.md, and the finding catalogue,
// read through `read` and validated. A definition with a fault is refused as a whole: the error names the job and every fault.
// definition: { kind, role, capabilities, inputs, output, checks, rounds, result, prompt, findings }.
export async function loadDefinition(kind, read) {
  if (typeof kind !== "string" || !SLUG.test(kind)) {
    throw new TypeError(`loadDefinition: the kind ${JSON.stringify(kind)} is no folder name of docs/assets/jobs/ (a slug)`);
  }
  const [jobText, prompt, catalogueText] = await Promise.all([read(`${kind}/job.json`), read(`${kind}/prompt.md`), read("findings.json")]);
  const problems = [];
  let job = null, findings = null;
  try {
    job = JSON.parse(jobText);
  } catch (e) {
    problems.push(`job.json: not JSON (${e.message})`);
  }
  try {
    findings = JSON.parse(catalogueText);
  } catch (e) {
    problems.push(`findings.json: not JSON (${e.message})`);
  }
  if (typeof prompt !== "string" || !prompt.trim()) problems.push("prompt.md: empty");
  if (job !== null) problems.push(...definitionProblems(kind, job, prompt));
  if (findings !== null) problems.push(...catalogueProblems(findings));
  if (problems.length) {
    const error = new Error(`the job definition ${kind} is refused:\n${problems.map((p) => `  ${kind}/${p}`).join("\n")}`);
    error.problems = problems;
    throw error;
  }
  return { ...job, prompt, findings };
}

// ---------------------------------------------------------------- inputs, prompt and context

// The inputs a definition takes, exactly: an input it does not name, or one it names but is not given, is a fault of the
// caller — nothing is sent that the definition, and so the disclosure, does not name.
function checkInputs(definition, inputs, who) {
  const given = Object.keys(inputs ?? {});
  const extra = given.filter((k) => !definition.inputs.includes(k));
  const missing = definition.inputs.filter((k) => !given.includes(k) || inputs[k] === undefined || inputs[k] === null);
  if (extra.length || missing.length) {
    throw new TypeError(`${who}: the job ${definition.kind} takes the inputs ${definition.inputs.join(", ")}`
      + (missing.length ? `; not given: ${missing.join(", ")}` : "")
      + (extra.length ? `; not named by the definition: ${extra.join(", ")}` : ""));
  }
}

// One input as it stands in the prompt: a text as it is, a list one item per block, anything else as JSON.
const asText = (v) => (typeof v === "string" ? v : JSON.stringify(v, null, 2));
function inputText(value) {
  return Array.isArray(value) ? value.map(asText).join("\n\n") : asText(value);
}
const itemCount = (value) => (Array.isArray(value) ? value.length : 1);

// renderPrompt(definition, inputs) -> [{ role: "user", content }] — the template with each placeholder {{name}} replaced by its
// input, in one pass: a placeholder inside an input is left as it is.
export function renderPrompt(definition, inputs) {
  checkInputs(definition, inputs, "renderPrompt");
  const content = definition.prompt.replace(PLACEHOLDER, (_, name) => inputText(inputs[name]));
  return [{ role: "user", content }];
}

// The participant's measure: characters (code points) by default, UTF-8 bytes, or the participant's own count for any
// other unit (a tokenizer), which the participant must then bring.
function measure(participant, who) {
  const context = participant?.context;
  if (!context || typeof context !== "object") throw new TypeError(`${who}: the participant states no context { limit, unit }`);
  if (!(Number.isFinite(context.limit) && context.limit >= 0)) throw new TypeError(`${who}: the context limit must be a number of 0 or more`);
  const unit = context.unit ?? "characters";
  if (typeof context.count === "function") return { unit, limit: context.limit, size: (s) => context.count(s) };
  if (unit === "characters") return { unit, limit: context.limit, size: (s) => [...s].length };
  if (unit === "bytes") return { unit, limit: context.limit, size: (s) => new TextEncoder().encode(s).length };
  throw new TypeError(`${who}: the participant counts its context in ${unit} and brings no count(text) for it`);
}

// contextFits(inputs, participant) -> { fits: true, counts, limit, unit } | { fits: false, counts, limit, unit } — every input
// measured whole in the participant's unit, and the total against the participant's context limit; nothing is shortened to
// fit. counts: { <input>: { items, size }, total }. participant.context: { limit, unit?, count? }.
export function contextFits(inputs, participant) {
  const m = measure(participant, "contextFits");
  const counts = {};
  let total = 0;
  for (const [name, value] of Object.entries(inputs ?? {})) {
    if (name === "total") throw new TypeError('contextFits: an input may not be named "total"');
    const size = m.size(inputText(value));
    counts[name] = { items: itemCount(value), size };
    total += size;
  }
  counts.total = total;
  return { fits: total <= m.limit, counts, limit: m.limit, unit: m.unit };
}

// ---------------------------------------------------------------- disclosure

const BILLING = ["per use", "not per use"];

// disclosure(definition, inputs, participant) -> { job, destination, place, items, counts, billing } — what the run panel shows
// before Run: the destination the run contacts and the place the participant processes data at, as the participant states
// them; each input with how many items and how much; the messages and their size, which is exactly what is sent; and whether
// the call is billed per use — "unknown" when the participant does not say (NO COST IS GUESSED).
export function disclosure(definition, inputs, participant) {
  if (typeof participant?.destination !== "string" || !participant.destination.trim()) {
    throw new TypeError("disclosure: the participant names no destination");
  }
  if (typeof participant?.place !== "string" || !participant.place.trim()) {
    throw new TypeError("disclosure: the participant names no place it processes data at");
  }
  const billing = participant.billing ?? "unknown";
  if (billing !== "unknown" && !BILLING.includes(billing)) {
    throw new TypeError(`disclosure: billing ${JSON.stringify(billing)} is none of ${BILLING.join(", ")}`);
  }
  const messages = renderPrompt(definition, inputs);
  // Sizes in the participant's unit where it states its context, in characters otherwise.
  const m = measure(participant.context ? participant : { context: { limit: 0 } }, "disclosure");
  const items = definition.inputs.map((name) => ({ input: name, items: itemCount(inputs[name]), size: m.size(inputText(inputs[name])) }));
  const size = messages.reduce((n, msg) => n + m.size(msg.content), 0);
  return {
    job: definition.kind, destination: participant.destination, place: participant.place, items,
    counts: { messages: messages.length, size, unit: m.unit }, billing,
  };
}

// ---------------------------------------------------------------- findings

const oneLine = (s) => String(s).replace(/\s*[\r\n]+\s*/g, " ");

function fill(template, values, code) {
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    if (values == null || values[name] === undefined || values[name] === null) {
      throw new TypeError(`formatFinding: the finding ${code} needs the value ${name}`);
    }
    return String(values[name]);
  });
}

// A finding as the catalogue gives it: kind, rule, what and fix of its code, with its values filled in.
// A finding with its code that already carries all four (as validateOutput returns it) is written as it is when no catalogue
// is given.
function resolve(finding, catalogue) {
  if (finding.code === undefined) return finding;
  const complete = ["kind", "rule", "what", "fix"].every((k) => typeof finding[k] === "string");
  if (complete && !catalogue) return finding;
  if (!catalogue || !Array.isArray(catalogue.findings)) {
    throw new TypeError(`formatFinding: the finding ${finding.code} needs the finding catalogue`);
  }
  const entry = catalogue.findings.find((f) => f.code === finding.code);
  if (!entry) throw new TypeError(`formatFinding: the catalogue holds no finding ${finding.code}`);
  for (const key of ["kind", "rule"]) {
    if (finding[key] !== undefined && finding[key] !== entry[key]) {
      throw new TypeError(`formatFinding: the finding ${finding.code} gives the ${key} ${finding[key]}, the catalogue ${entry[key]}`);
    }
  }
  return {
    ...finding, kind: entry.kind, rule: entry.rule,
    what: fill(entry.what, finding.values, finding.code), fix: fill(entry.fix, finding.values, finding.code),
  };
}

// formatFinding({ artifact, line, kind, what, rule, fix }, catalogue?) -> string — the compiler form
// `<artifact>:<line>: <kind>: <what> [<RULE>] — <fix>`, on one line. A finding naming a `code` takes its kind, rule and texts
// from the catalogue, its `values` filled in. A finding that cannot be written in the form is a fault of its caller.
export function formatFinding(finding, catalogue = null) {
  const f = resolve(finding ?? {}, catalogue);
  if (typeof f.artifact !== "string" || !f.artifact.trim()) throw new TypeError("formatFinding: no artifact");
  if (f.line === undefined || f.line === null || String(f.line).trim() === "") throw new TypeError("formatFinding: no line");
  if (!FINDING_KINDS.includes(f.kind)) throw new TypeError(`formatFinding: kind ${JSON.stringify(f.kind)} is none of ${FINDING_KINDS.join(", ")}`);
  for (const key of ["what", "rule", "fix"]) {
    if (typeof f[key] !== "string" || !f[key].trim()) throw new TypeError(`formatFinding: no ${key}`);
  }
  return `${f.artifact}:${f.line}: ${f.kind}: ${oneLine(f.what)} [${f.rule}] — ${oneLine(f.fix)}`;
}

// A finding of the catalogue on the answer, in full: its code and values, and what the catalogue gives for them.
function answerFinding(definition, code, line, values) {
  return { ...resolve({ code, artifact: "answer", line, values }, definition.findings), code, values };
}

// ---------------------------------------------------------------- validateOutput

const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const fits = (type, v) => typeOf(v) === type || (type === "number" && typeOf(v) === "integer");

// The departures of a value from a schema, each with the place it is at as a JSON pointer.
function departures(schema, value, at, out) {
  const where = at || "/";
  if (schema.type && !fits(schema.type, value)) {
    out.push([where, `${where} is ${typeOf(value)}, not ${schema.type}`, `${where} as ${schema.type}`]);
    return;
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) {
    out.push([where, `${where} is none of ${schema.enum.map((e) => JSON.stringify(e)).join(", ")}`, `${where} as one of the values listed`]);
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) {
      out.push([where, `${where} must hold at least ${schema.minLength} characters`, `${where} filled in`]);
    }
    if (schema.maxLength !== undefined && [...value].length > schema.maxLength) {
      out.push([where, `${where} must hold at most ${schema.maxLength} characters`, `${where} shortened`]);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      out.push([where, `${where} must hold at least ${schema.minItems} items`, `${where} with at least ${schema.minItems} items`]);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      out.push([where, `${where} must hold at most ${schema.maxItems} items`, `${where} with at most ${schema.maxItems} items`]);
    }
    if (schema.items) value.forEach((v, i) => departures(schema.items, v, `${at}/${i}`, out));
  }
  if (typeOf(value) === "object") {
    const props = schema.properties ?? {};
    for (const name of schema.required ?? []) {
      if (!(name in value)) out.push([`${at}/${name}`, `${at}/${name} is required and missing`, `${where} with ${name}`]);
    }
    for (const [name, v] of Object.entries(value)) {
      if (name in props) departures(props[name], v, `${at}/${name}`, out);
      else if (schema.additionalProperties === false) out.push([`${at}/${name}`, `${at}/${name} is not allowed`, `no ${name}`]);
    }
  }
}

// The text of an answer as JSON: the answer itself, or the content of the one fenced block it consists of.
function parseAnswer(answer) {
  if (typeof answer !== "string") return { reason: `no text but ${typeOf(answer)}` };
  const text = answer.trim();
  if (!text) return { reason: "the answer is empty" };
  const fenced = /^```[A-Za-z]*\n([\s\S]*?)\n```$/.exec(text);
  const body = fenced && !fenced[1].includes("\n```") ? fenced[1] : text;
  try {
    return { value: JSON.parse(body) };
  } catch (e) {
    return { reason: oneLine(e.message) };
  }
}

// validateOutput(definition, answer) -> { value } | { findings } — the answer parsed as JSON and checked against the
// definition's output schema. An unreadable answer is one error finding, never an empty result; each departure from the
// schema is an error finding at its JSON pointer.
export function validateOutput(definition, answer) {
  const parsed = parseAnswer(answer);
  if (!("value" in parsed)) return { findings: [answerFinding(definition, UNREADABLE, 1, { reason: parsed.reason })] };
  const out = [];
  departures(definition.output, parsed.value, "", out);
  if (!out.length) return { value: parsed.value };
  return { findings: out.map(([line, problem, expected]) => answerFinding(definition, NOT_IN_SCHEMA, line, { problem, expected })) };
}

// ---------------------------------------------------------------- splitFindings

// splitFindings(findings, justifications) -> { back, person, justified } — errors and unjustified warnings go back to the
// participant; a finding a person decides never does. A warning leaves the loop when a justification names its artifact, rule
// and what (the line may move between drafts) with a reason of one non-empty line; the reason travels with it. An error is
// not justified away.
export function splitFindings(findings, justifications = []) {
  const back = [], person = [], justified = [];
  for (const f of findings ?? []) {
    if (!FINDING_KINDS.includes(f?.kind)) throw new TypeError(`splitFindings: kind ${JSON.stringify(f?.kind)} is none of ${FINDING_KINDS.join(", ")}`);
    if (f.kind === "person") {
      person.push(f);
      continue;
    }
    const j = f.kind === "warning" && (justifications ?? []).find((x) => x.artifact === f.artifact && x.rule === f.rule
      && x.what === f.what && typeof x.reason === "string" && x.reason.trim() && !/[\r\n]/.test(x.reason));
    if (j) justified.push({ ...f, justification: j.reason.trim() });
    else back.push(f);
  }
  return { back, person, justified };
}
