// MOD-result-records — result records and counter-proofs, and what they say per commit, test and release
// (docs/architecture/MOD-result-records.md): its interface. Of it, ITM-251 builds Outcome, resultSchema, resultsAt,
// flakyTests and rateComparison, in read.mjs. Reading a JUnit report (parseOutcomes), appending a record
// (appendResult), a test's history (testHistory) and the job kinds' strategies (resultStrategies) are UC-026's and
// UC-028's and not part of this item.
//
// Module: MOD-result-records

export { resultSchema, resultsAt, flakyTests, rateComparison } from "./read.mjs";

/**
 * One test's outcome in a run (MOD-result-records, Interfaces: Outcome) — test the TST-<nnn>, or the case's name for
 * an undeclared case; runs "<k> of <n>" for a model-dependent test; failure the declaration's expected result, the
 * observed one and an excerpt of the case's output. Built by parseOutcomes, not part of this item: named here as the
 * module's file states it.
 * @typedef {{ test: string, level: string | null, outcome: "passed" | "failed" | "not run" | "undeclared",
 *   runs: string | null, failure: { expected: string | null, observed: string, log: string } | null }} Outcome
 */
