// MOD-result-records — result records and counter-proofs, and what they say per commit, test and release
// (docs/architecture/MOD-result-records.md): its interface. Of it, ITM-251 builds Outcome, resultSchema, resultsAt,
// flakyTests and rateComparison, in read.mjs. appendResult adds one supplied run record in append.mjs.
// parseOutcomes reads a JUnit report in junit.mjs (ITM-750). testHistory is in read.mjs (ITM-751). resultStrategies offers the recipe test-selection in strategies.mjs (ITM-752).
//
// Module: MOD-result-records

export { resultSchema, resultsAt, flakyTests, rateComparison, testHistory } from "./read.mjs";
export { appendResult } from "./append.mjs";
export { parseOutcomes } from "./junit.mjs";
export { resultStrategies } from "./strategies.mjs";

/**
 * One test's outcome in a run (MOD-result-records, Interfaces: Outcome) — test the TST-<nnn>, or the case's name for
 * an undeclared case; runs "<k> of <n>" for a model-dependent test; failure the declaration's expected result, the
 * observed one and an excerpt of the case's output. Built by parseOutcomes (junit.mjs).
 * @typedef {{ test: string, level: string | null, outcome: "passed" | "failed" | "not run" | "undeclared",
 *   runs: string | null, failure: { expected: string | null, observed: string, log: string } | null }} Outcome
 */
