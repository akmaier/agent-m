// A mail's pseudonymous identifier, kept entirely in memory (MOD-mail-records).
// Module: MOD-mail-records

import { sha256 } from "../text-tools/index.mjs";

/**
 * @param {{ messageId: string | null, bytes: Uint8Array | null }} mail
 * @returns {Promise<string>}
 */
export async function mailId({ messageId, bytes }) {
  const content = messageId === null ? bytes : messageId.replace(/^<|>$/g, "");
  if (content === null) {
    throw Object.assign(new Error("Read the mail's bytes and ask again."), { name: "NothingToName" });
  }
  return `MAIL-${(await sha256(content)).slice(0, 16)}`;
}
