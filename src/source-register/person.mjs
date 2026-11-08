// The person who gives an instruction (MOD-source-register, Parts: person.mjs): their account on a repository server, which is their source
// (THE PERSON WHO PROMPTS IS A SOURCE).
//
// Module: MOD-source-register
//
// Snapshot is MOD-repository-hosts' type. No request is made.

/**
 * personAccount(instance: Snapshot) -> string | null — the account `<server>/<account>` of the person who gives an instruction, which is their
 * source: the owner of the instance's repository — the first segment of its path — on the host of its origin, `github.com` on GitHub where the
 * address names no origin. Null where the snapshot names no owner, and for a server whose host it does not name. No request is made.
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
