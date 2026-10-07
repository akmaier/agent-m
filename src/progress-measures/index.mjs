// MOD-progress-measures — a product's facts gathered once, and its progress in every measure
// (docs/architecture/MOD-progress-measures.md): its interface. Of it, ITM-235 builds waitingForAcceptance, in
// stages.mjs — less its release-test-report kind: no release candidate exists before UC-013's release is built;
// ITM-239 adds it. Facts, productFacts, progressIn, stageShares, currentStage, gateOverview, blocked, whoWorksOnWhat
// and waitingForAPerson are not built yet.
//
// Module: MOD-progress-measures

export { waitingForAcceptance } from "./stages.mjs";
