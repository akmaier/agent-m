// The person who gives an instruction (MOD-source-register, Parts: person.mjs): their account on a repository server, and their own
// source in the instance's register (THE PERSON WHO PROMPTS IS A SOURCE).
//
// Module: MOD-source-register
//
// Document and Snapshot are MOD-documents' and MOD-repository-hosts' types. No request is made.

import { linkOf } from "./content.mjs";

/**
 * personSource(links: Document, register: Document[], account: string) -> string | null — the identifier of the register entry of
 * kind `person` whose `identifier` is `account`, the person's account on a repository server written `<server>/<account>`, such
 * as github.com/akmaer, and which the product links — its links file holds a row for the entry —: the source of the person who
 * gives an instruction (THE PERSON WHO PROMPTS IS A SOURCE). Null when there is none: no entry of that account, an entry of
 * that account the product does not link, an entry of another kind, or no account. The account is compared whole, as written;
 * of two entries of one account, the linked one answers.
 * @param {Document} links — a product's links file, read with the schema sourceSchemas gives
 * @param {Document[]} register — the instance's register entries
 * @param {string} account
 * @returns {string | null}
 */
export function personSource(links, register, account) {
  if (typeof account !== "string" || account === "") return null;
  const entry = register.find((each) => each.fields.kind === "person" && each.fields.identifier === account
    && linkOf(links, each) !== undefined);
  return entry ? entry.id : null;
}

/**
 * personAccount(instance: Snapshot) -> string | null — the account `<server>/<account>` of the person who gives an instruction, which
 * personSource takes: the owner of the instance's repository — the first segment of its path — on the host of its origin, `github.com`
 * on GitHub where the address names no origin. Null where the snapshot names no owner, and for a server whose host it does not name.
 * No request is made.
 * @param {{ repository?: { server?: string, origin?: string, path?: string } }} instance — a MOD-repository-hosts Snapshot
 * @returns {string | null}
 */
export function personAccount(instance) {
  const owner = String(instance.repository?.path ?? "").split("/")[0];
  if (!owner) return null;
  let server = instance.repository?.server === "github" ? "github.com" : null;
  try { server = new URL(instance.repository?.origin).host || server; } catch { /* use the canonical GitHub host above */ }
  return server ? `${server}/${owner}` : null;
}
