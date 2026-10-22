// MOD-progress-measures — a product's facts gathered once, and its progress in every measure
// (docs/architecture/MOD-progress-measures.md): its interface. Built: productFacts with the scopes `build`, `work` and `all` (facts.mjs; a fact
// neither scope reads is "unknown"), progressIn for a planned model and for a model with sprints
// (measures.mjs; the board's flow is null), and stageShares, currentStage, buildInProgress, waitingForAPerson and
// waitingForAcceptance (stages.mjs). gateOverview, whoWorksOnWhat and blocked (overviews.mjs) too.
//
// Module: MOD-progress-measures

export { waitingForAcceptance, stageShares, currentStage, buildInProgress, waitingForAPerson, publishOverview, storedOverview } from "./stages.mjs";
export { progressIn } from "./measures.mjs";
export { productFacts } from "./facts.mjs";
export { storedFacts } from "./stored.mjs";
export { blocked, gateOverview, whoWorksOnWhat } from "./overviews.mjs";
