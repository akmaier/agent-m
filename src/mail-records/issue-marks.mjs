// The issue and browser decisions that leave mail identifiers out of a proposal.
// Module: MOD-mail-records

/**
 * @param {string[]} ids
 * @param {Set<string>} listed
 * @param {Set<string>} marked
 * @returns {string[]}
 */
export function undecided(ids, listed, marked) {
  return ids.filter((id) => !listed.has(id) && !marked.has(id));
}
