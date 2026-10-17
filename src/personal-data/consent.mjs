// MOD-personal-data — names in generated artifacts against accounts and consenting collaborators. Pure.

import { finding } from "../text-tools/index.mjs";
import { personHits } from "./people.mjs";

const RULE = "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT";
const plain = (text) => text.trim().replace(/^@/, "").toLowerCase();

/**
 * namedPersonFindings(text, artifact, known: People, collaborators: Document | null, accounts: string[]) -> Finding[] — one error
 * for every occurrence in `text` of a name of `known` that is neither an account of `accounts` (whatever its case, with or without
 * a leading `@`) nor the Name of a row whose Agreed is `yes`, of of the collaborators document; the finding names the artifact and the line.
 */
export function namedPersonFindings(text, artifact, known, collaborators, accounts) {
  const passing = new Set([
    ...accounts.map(plain),
    ...(collaborators?.sections ?? []).flatMap((section) => section.rows ?? []).filter((row) => row.cells.Agreed === "yes").map((row) => plain(row.cells.Name ?? "")),
  ]);
  const unnamed = known.names.filter((name) => !passing.has(plain(name)));
  return personHits(text, { names: unnamed, addresses: [], phones: [], accounts: [] })
    .map((hit) => finding({
      artifact,
      line: hit.line,
      kind: "error",
      rule: RULE,
      what: `names ${hit.value}, who is neither an account on the server nor a collaborator who agreed`,
      fix: "name the person by account, or remove the name",
    }));
}
