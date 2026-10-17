// Pure matching of reply headers to an issue's listed mail identifiers.
// Module: MOD-mail-records

import { mailId } from "./identifier.mjs";

/**
 * @param {{ inReplyTo: string | null, references: string[] }} mail
 * @param {Map<string, number>} listed
 * @returns {Promise<number | null>}
 */
export async function threadMatch({ inReplyTo, references }, listed) {
  const messageIds = inReplyTo === null ? references : [inReplyTo, ...references];
  for (const messageId of messageIds) {
    const id = await mailId({ messageId, bytes: null });
    if (listed.has(id)) return listed.get(id);
  }
  return null;
}
