// A run's outcomes from the JUnit XML reports of its jobs, read together as one — MOD-result-records' parseOutcomes
// (docs/architecture/MOD-result-records.md, Interfaces: parseOutcomes). Each test case is matched to its declaration by
// the TST-<nnn> at the start of its name; a case with a failure or an error is failed, a skipped one not run, any other
// passed. Several cases of a deterministic test, in one report or in several, pass only if all pass; the cases of a
// model-dependent test are its runs, "<k> of <n>" against the number its declaration fixes, and not run when fewer ran.
// A case without a declaration is undeclared, a declared test without a case in any report not run. Every outcome's
// reason is null: its caller sets it. A text that is not a JUnit XML report — a report cut off counts as one — gives
// UnreadableReport { index, reason }, naming its place in the list.
//
// Module: MOD-result-records

const LOG_LIMIT = 2000;
const ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

const unreadable = (reason) => Object.assign(new Error(`parseOutcomes: not a JUnit XML report — ${reason}`),
  { name: "UnreadableReport", reason });

// The test cases of every report, in order; an unreadable report's error carries its index.
function casesOfAll(reports) {
  if (!Array.isArray(reports)) throw new TypeError("parseOutcomes: reports is not a list of texts");
  return reports.flatMap((report, index) => {
    try {
      return cases(report);
    } catch (error) {
      if (error.name === "UnreadableReport") {
        error.index = index;
        error.message = `parseOutcomes: the report at ${index} is not a JUnit XML report — ${error.reason}`;
      }
      throw error;
    }
  });
}

const decode = (text) => text.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|(lt|gt|amp|quot|apos));/g,
  (_, dec, hex, name) => (name ? ENTITIES[name] : String.fromCodePoint(dec ? Number(dec) : parseInt(hex, 16))));

// The elements of a report as a flat list of events: open (name, attributes, selfClosing), close, text.
function tokens(report) {
  const events = [];
  const pattern = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<\/([^\s>]+)\s*>|<([A-Za-z_][^\s/>]*)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)|(<)/g;
  for (const match of report.matchAll(pattern)) {
    const [, cdata, close, name, attributes, selfClosing, text, stray] = match;
    if (stray) throw unreadable("a tag is not finished");
    if (cdata !== undefined) events.push({ text: cdata });
    else if (close) events.push({ close });
    else if (name) {
      const attrs = {};
      for (const a of attributes.matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = decode(a[2] ?? a[3]);
      events.push({ open: name, attrs, selfClosing: selfClosing === "/" });
    } else if (text !== undefined) events.push({ text: decode(text) });
  }
  return events;
}

// The test cases of a report: name, kind (passed, failed, skipped), message and log of the failure.
function cases(report) {
  if (typeof report !== "string") throw unreadable("the report is not a text");
  const events = tokens(report);
  const stack = [];
  const found = [];
  let current = null;
  let element = null;
  let sawRoot = false;
  for (const event of events) {
    if (event.open) {
      if (!stack.length) {
        if (event.open !== "testsuites" && event.open !== "testsuite") throw unreadable(`the root element is ${event.open}`);
        sawRoot = true;
      }
      if (!event.selfClosing) stack.push(event.open);
      if (event.open === "testcase") {
        current = { name: event.attrs.name ?? "", kind: "passed", message: "", log: "" };
        found.push(current);
        if (event.selfClosing) current = null;
      } else if (current && ["failure", "error", "skipped"].includes(event.open)) {
        if (current.kind !== "failed") current.kind = event.open === "skipped" ? "skipped" : "failed";
        if (event.open !== "skipped") { current.message = event.attrs.message ?? ""; element = event.selfClosing ? null : current; }
      }
    } else if (event.close) {
      if (stack.pop() !== event.close) throw unreadable(`</${event.close}> closes nothing that is open`);
      if (event.close === "testcase") current = null;
      if (["failure", "error"].includes(event.close)) element = null;
    } else if (element) element.log += event.text;
  }
  if (!sawRoot) throw unreadable("it holds no testsuites or testsuite element");
  if (stack.length) throw unreadable(`<${stack.at(-1)}> is not closed`);
  return found;
}

/**
 * The outcomes of one run from the JUnit XML reports of its jobs (see the file's head). In the order the tests first
 * appear across the reports, then the declared tests without a case in the order of the declarations.
 * @param {string[]} reports
 * @param {Array<{ id: string, level: string | null, expect: string | null, runs: number | null }>} declarations
 * @returns {object[]} Outcome[] (index.mjs)
 */
export function parseOutcomes(reports, declarations) {
  const declared = new Map(declarations.map((d) => [d.id, d]));
  const slots = []; // in the order of the report: an undeclared outcome, or the id of a declared test at its first case
  const byTest = new Map();
  for (const found of casesOfAll(reports)) {
    const id = /^TST-\d+/.exec(found.name)?.[0];
    if (!id || !declared.has(id)) slots.push({ test: found.name, level: null, outcome: "undeclared", runs: null, failure: null, reason: null });
    else if (byTest.has(id)) byTest.get(id).push(found);
    else { byTest.set(id, [found]); slots.push(id); }
  }
  const outcomeOf = (declaration) => {
    const own = byTest.get(declaration.id) ?? [];
    const base = { test: declaration.id, level: declaration.level, runs: null, failure: null, reason: null };
    if (!own.length) return { ...base, outcome: "not run" };
    if (declaration.runs) {
      const ran = own.filter((c) => c.kind !== "skipped");
      const passed = ran.filter((c) => c.kind === "passed").length;
      return { ...base, outcome: ran.length >= declaration.runs ? "passed" : "not run", runs: `${passed} of ${declaration.runs}` };
    }
    const failed = own.find((c) => c.kind === "failed");
    if (failed) {
      const failure = { expected: declaration.expect, observed: failed.message || failed.log.trim().split("\n")[0], log: failed.log.trim().slice(0, LOG_LIMIT) };
      return { ...base, outcome: "failed", failure };
    }
    return { ...base, outcome: own.some((c) => c.kind === "skipped") ? "not run" : "passed" };
  };
  const withoutCase = declarations.filter((d) => !byTest.has(d.id));
  return [...slots.map((slot) => (typeof slot === "string" ? outcomeOf(declared.get(slot)) : slot)), ...withoutCase.map(outcomeOf)];
}
