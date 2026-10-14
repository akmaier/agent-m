// MOD-result-records: its public interface for run records, JUnit outcomes and append-only writes.
//
// Module: MOD-result-records

export { resultSchema, resultsAt, flakyTests, rateComparison } from "./read.mjs";
export { parseOutcomes } from "./junit.mjs";
export { appendResult } from "./append.mjs";

/**
 * One test's outcome in a run (MOD-result-records, Interfaces: Outcome) — test the TST-<nnn>, or the case's name for
 * an undeclared case; runs "<k> of <n>" for a model-dependent test; failure the declaration's expected result, the
 * observed one and an excerpt of the case's output.
 * @typedef {{ test: string, level: string | null, outcome: "passed" | "failed" | "not run" | "undeclared",
 *   runs: string | null, failure: { expected: string | null, observed: string, log: string } | null }} Outcome
 */
