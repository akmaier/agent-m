// confirmations.mjs — the single-use confirmations (MOD-mail-protocols, Parts). Each is { value, ref, sha256, expiresAt, spent }, in
// memory only; a restart of the Bridge forgets them. EVERY OUTGOING MAIL IS RELEASED BY A PERSON.
//
// Module: MOD-mail-protocols

import { randomBytes } from "node:crypto";
import { bridgeFailure } from "./imap.mjs";

// The accepted file says "valid for minutes" and no number; this is the choice of this code.
const VALID_FOR_MS = 5 * 60 * 1000;

const open = new Map();

// A confirmation for one draft and one SHA-256.
export function confirm(ref, sha256) {
  const now = Date.now();
  for (const [value, each] of open) if (each.expiresAt <= now) open.delete(value);
  const confirmation = { value: randomBytes(24).toString("hex"), ref, sha256, expiresAt: now + VALID_FOR_MS, spent: false };
  open.set(confirmation.value, confirmation);
  return { confirmation: confirmation.value, expiresAt: new Date(confirmation.expiresAt).toISOString() };
}

// Spends the confirmation of this value and gives it; one that is unknown, spent or expired is refused.
export function spend(value) {
  const found = open.get(value);
  const reason = !found ? "unknown" : found.spent ? "spent" : found.expiresAt <= Date.now() ? "expired" : null;
  if (reason) throw bridgeFailure("confirmation-refused", `The confirmation is ${reason}; nothing was sent.`);
  found.spent = true;
  return found;
}
