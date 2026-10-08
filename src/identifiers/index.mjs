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

// instanceOfPagesAddress(location) -> "owner/repository" | null — the repository whose GitHub Pages address is given:
// <owner>.github.io/<repository>/... . Other hosts do not name an Agent M instance. This is pure so that both a browser page
// and the Bridge's own-protocol window can derive the same identity without reading a repository.
export function instanceOfPagesAddress({ hostname, pathname }) {
  const owner = /^([a-z0-9-]+)\.github\.io$/i.exec(String(hostname ?? ""))?.[1];
  const repository = String(pathname ?? "").split("/").find(Boolean);
  return owner && repository ? `${owner}/${repository}` : null;
}
