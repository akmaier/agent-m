// MOD-spec-changes — SPEC change queues, from proposal to the accepted section (docs/architecture/MOD-spec-changes.md):
// its interface. Of it, ITM-234 and ITM-339 build Queue and queues, in queues.mjs, and entryView, in accept.mjs. openQueueOf,
// proposeSection, saveEntry, entrySections, acceptEntries, applyApproved, requirementHistory and specStrategies are not built yet.
//
// Module: MOD-spec-changes

export { queues } from "./queues.mjs";
export { entryView } from "./accept.mjs";
