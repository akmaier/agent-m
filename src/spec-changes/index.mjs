// MOD-spec-changes — SPEC change queues, from proposal to the accepted section (docs/architecture/MOD-spec-changes.md):
// its interface. Of it, ITM-234 and ITM-339 build Queue and queues, in queues.mjs, ITM-339 entryView, and ITM-340 acceptEntries and
// applyApproved, in accept.mjs, and ITM-337 the recipes chosen-requirements, named-requirements and spec-with-queues of specStrategies, ITM-438 whole-spec,
// in strategies.mjs, and ITM-393 entrySections and ITM-338 the writer queue-entries, in propose.mjs. openQueueOf, proposeSection, saveEntry and requirementHistory
// are not built yet.
//
// Module: MOD-spec-changes

export { queues } from "./queues.mjs";
export { entryView, acceptEntries, applyApproved } from "./accept.mjs";
export { entrySections } from "./propose.mjs";
export { specStrategies } from "./strategies.mjs";
