// MOD-identifiers — the identifier scheme and the stability of identifiers (docs/architecture/MOD-identifiers.md): its
// interface. It provides `IdentifierKind`, `IdentifierPlace`, `kindOfIdentifier`, `identifiersIn`, `nextIdentifier`,
// `positionalReferences`, `pagesAddress` and `instanceOfPagesAddress`.
//
// Module: MOD-identifiers
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps no state and performs no
// input or output. Of another module it uses MOD-text-tools' `finding`, for the findings `positionalReferences` reports.

/**
 * The kind of an identifier by the scheme: a requirement by its name in capitals, or one of the eight prefixed kinds.
 * @typedef {"requirement" | "SRC" | "UC" | "ARC" | "MOD" | "TST" | "ITM" | "RES" | "JOB"} IdentifierKind
 */

/**
 * An identifier written in a file, and where: the identifier, its kind, the file's path and the line it stands on (from 1).
 * @typedef {{ id: string, kind: IdentifierKind, path: string, line: number }} IdentifierPlace
 */

export { kindOfIdentifier, identifiersIn, nextIdentifier } from "./scheme.mjs";
export { positionalReferences } from "./positions.mjs";

// instanceOfPagesAddress(location) -> "owner/repository" | null — the repository whose GitHub Pages address is given:
// <owner>.github.io/<repository>/... . Other hosts do not name an Agent M instance. This is pure so that both a browser page
// and the Bridge's own-protocol window can derive the same identity without reading a repository.
export function instanceOfPagesAddress({ hostname, pathname }) {
  const owner = /^([a-z0-9-]+)\.github\.io$/i.exec(String(hostname ?? ""))?.[1];
  const repository = String(pathname ?? "").split("/").find(Boolean);
  return owner && repository ? `${owner}/${repository}` : null;
}

// pagesAddress(instance) -> string — the address of the dashboard of the instance `owner/name`: its repository's GitHub Pages
// site, https://<owner>.github.io/<name>/. Throws TypeError for a string that is not `owner/name`: an owner and a name, each of
// the characters a GitHub account or repository is named by, with one slash between them.
const INSTANCE = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/;
export function pagesAddress(instance) {
  const m = typeof instance === "string" ? INSTANCE.exec(instance) : null;
  if (!m) {
    const shown = typeof instance === "string" ? JSON.stringify(instance) : String(instance);
    throw new TypeError(`pagesAddress: ${shown} is not owner/name`);
  }
  return `https://${m[1]}.github.io/${m[2]}/`;
}
