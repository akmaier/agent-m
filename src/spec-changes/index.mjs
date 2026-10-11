// MOD-spec-changes — SPEC change queues, from proposal to the accepted section (docs/architecture/MOD-spec-changes.md):
// its interface. Of it, ITM-234 and ITM-339 build Queue and queues, in queues.mjs, ITM-339 entryView, and ITM-340 acceptEntries and
// applyApproved, in accept.mjs. openQueueOf, proposeSection, saveEntry, entrySections, requirementHistory and specStrategies are not
// built yet.
//
// Module: MOD-spec-changes

export { queues } from "./queues.mjs";
export { entryView, acceptEntries, applyApproved } from "./accept.mjs";
