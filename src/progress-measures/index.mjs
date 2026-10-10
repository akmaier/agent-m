// MOD-progress-measures — a product's facts gathered once, and its progress in every measure
// (docs/architecture/MOD-progress-measures.md): its interface. Of it, ITM-235 builds waitingForAcceptance, in
// stages.mjs — less its release-test-report kind: no release candidate exists before UC-013's release is built;
// ITM-239 adds it. progressIn gives the burn-down of each team's sprint, in measures.mjs; its grid of a planned model and the
// board's flow are not built yet. Facts, productFacts, stageShares, currentStage, gateOverview, blocked, whoWorksOnWhat and
// waitingForAPerson are not built yet.
//
// Module: MOD-progress-measures

export { waitingForAcceptance } from "./stages.mjs";
export { progressIn } from "./measures.mjs";
