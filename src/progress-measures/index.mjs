// MOD-progress-measures — a product's facts gathered once, and its progress in every measure
// (docs/architecture/MOD-progress-measures.md): its interface. Built: productFacts with the scopes `work` and `all` (facts.mjs; a fact
// neither scope reads is "unknown"), progressIn for a model with sprints (measures.mjs; its
// grid of a planned model and the board's flow are null), and stageShares, currentStage, buildInProgress, waitingForAPerson and
// waitingForAcceptance (stages.mjs). gateOverview, blocked and whoWorksOnWhat are not built yet.
//
// Module: MOD-progress-measures

export { waitingForAcceptance, stageShares, currentStage, buildInProgress, waitingForAPerson } from "./stages.mjs";
export { progressIn } from "./measures.mjs";
export { productFacts } from "./facts.mjs";
