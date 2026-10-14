// JUnit XML to the accepted Outcome shape. XML syntax belongs to the pinned parser, not this mapping.
// Module: MOD-result-records
import { parseXml } from "./vendor/parse-xml.mjs";

function unreadable(reason) {
  return Object.assign(new Error(reason), { name: "UnreadableReport", reason });
}

function reportCases(report) {
  let document;
  try {
    document = parseXml(report);
  } catch (error) {
    throw unreadable(error.message);
  }
  const root = document.children.find((node) => node.type === "element");
  if (!root || !["testsuite", "testsuites"].includes(root.name)) {
    throw unreadable("The XML root is not a JUnit testsuite or testsuites.");
  }
  const cases = [];
  function visit(suite) {
    for (const node of suite.children) {
      if (node.type !== "element") continue;
      if (node.name === "testcase") cases.push(node);
      else if (["testsuite", "testsuites"].includes(node.name)) visit(node);
    }
  }
  visit(root);
  return cases;
}

function caseResult(node) {
  const children = node.children.filter((child) => child.type === "element");
  const faults = children.filter((child) => ["failure", "error"].includes(child.name));
  const skipped = children.some((child) => child.name === "skipped");
  return {
    name: node.attributes.name ?? "",
    outcome: faults.length ? "failed" : skipped ? "not run" : "passed",
    observed: faults.map((fault) => fault.attributes.message || fault.text || fault.name).join("\n"),
    log: children.filter((child) => ["failure", "error", "system-out", "system-err"].includes(child.name))
      .map((child) => child.text).filter(Boolean).join("\n"),
  };
}

function outcomeOf(test, level, cases, declaration = null) {
  const faults = cases.filter((entry) => entry.outcome === "failed");
  const passed = cases.filter((entry) => entry.outcome === "passed").length;
  const ran = cases.filter((entry) => entry.outcome !== "not run").length;
  const fixedRuns = declaration?.runs ?? null;
  let outcome = faults.length ? "failed" : cases.length && cases.every((entry) => entry.outcome === "passed") ? "passed" : "not run";
  if (fixedRuns !== null && ran < fixedRuns) outcome = "not run";
  return {
    test, level, outcome: declaration ? outcome : "undeclared",
    runs: fixedRuns === null ? null : `${passed} of ${fixedRuns}`,
    failure: faults.length ? {
      expected: declaration?.expect ?? null,
      observed: faults.map((entry) => entry.observed).join("\n"),
      log: faults.map((entry) => entry.log).join("\n"),
    } : null,
  };
}

/**
 * parseOutcomes(report: string, declarations: TestDeclaration[]) -> Outcome[].
 * Matches only a leading TST identifier. Missing and skipped cases never count as passed or as executed model runs.
 * Throws UnreadableReport { reason } for malformed XML or a non-JUnit root. No I/O.
 */
export function parseOutcomes(report, declarations) {
  const declared = new Map(declarations.map((declaration) => [declaration.id, { declaration, cases: [] }]));
  const undeclared = [];
  for (const node of reportCases(report)) {
    const entry = caseResult(node);
    const id = /^(TST-\d+)\b/.exec(entry.name)?.[1];
    if (id && declared.has(id)) declared.get(id).cases.push(entry);
    else undeclared.push(outcomeOf(entry.name, null, [entry]));
  }
  return [...declared.values()].map(({ declaration, cases }) =>
    outcomeOf(declaration.id, declaration.level, cases, declaration)).concat(undeclared);
}
