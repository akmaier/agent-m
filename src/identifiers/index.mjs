// MOD-identifiers — the identifier scheme and the stability of identifiers (docs/architecture/MOD-identifiers.md): its
// interface. Of it, ITM-232 builds `IdentifierKind` and `kindOfIdentifier`, the kind of a string by the scheme, which
// MOD-approvals' `statuses` needs (ITM-233); nothing else of the module is built yet.
//
// Module: MOD-identifiers
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps no state, performs no
// input or output and uses no other module for this item.

/**
 * The kind of an identifier by the scheme: a requirement by its name in capitals, or one of the eight prefixed kinds.
 * @typedef {"requirement" | "SRC" | "UC" | "ARC" | "MOD" | "TST" | "ITM" | "RES" | "JOB"} IdentifierKind
 */

export { kindOfIdentifier } from "./scheme.mjs";
