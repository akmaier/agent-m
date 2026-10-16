// MOD-prompt-bar, offer.mjs — the participants offered and the place each is named with (docs/architecture/MOD-prompt-bar.md: Parts,
// Interfaces: startPromptBar). The participants are the rows of the instance's docs/participants.md; one is offered when it is a
// model endpoint, a CLI agent or a sandboxed agent that is reached through no other participant and whose route this browser reaches:
// an endpoint `endpoint <name>` whose setting `endpoint:<name>` the store keeps — and, where that setting names a Bridge, whose
// `bridge:<bridge>` the store keeps —, or an agent `bridge <bridge> agent <agent>` whose `bridge:<bridge>` the store keeps (UC-049,
// Precondition, 1a, 1b).
//
// Module: MOD-prompt-bar
//
// It reads settings of the store and the register of the instance; it writes and sends nothing.

import { readSetting } from "../browser-store/index.mjs";
import { readRegister } from "../documents/index.mjs";
import { participantSchema, participantsOf, reachedThrough } from "../participant-list/index.mjs";

const REGISTER = "docs/participants.md";
const OFFERED_TYPES = new Set(["model endpoint", "CLI agent", "sandboxed agent"]);

/**
 * readParticipants(snapshot: Snapshot) -> Promise<Participant[]> — the participants of the instance's register at that snapshot, in its
 * order; none for an instance without the register.
 */
export async function readParticipants(snapshot) {
  const text = await snapshot.read(REGISTER);
  return text === null ? [] : participantsOf(readRegister(participantSchema(), REGISTER, text).document);
}

// Whether this browser reaches the participant by its route: the endpoint it names, and the Bridge that endpoint is called through, or the
// Bridge its agent is on, are among what the store keeps.
function reached(participant, store) {
  const route = participant.route ?? "";
  const endpoint = /^endpoint\s+(\S+)/.exec(route)?.[1];
  if (endpoint !== undefined) {
    const stored = readSetting(store, `endpoint:${endpoint}`);
    if (!stored) return false;
    return !stored.bridge || readSetting(store, `bridge:${stored.bridge}`) !== null;
  }
  const bridge = /^bridge\s+(\S+)\s+agent\s+\S+/.exec(route)?.[1];
  return bridge !== undefined && readSetting(store, `bridge:${bridge}`) !== null;
}

/**
 * offeredAmong(participants: Participant[], store: Store) -> Participant[] — the participants the bar offers, in the register's order.
 */
export function offeredAmong(participants, store) {
  return participants.filter((participant) => OFFERED_TYPES.has(participant.type) && reachedThrough(participant) === null
    && reached(participant, store));
}

/**
 * placeOf(participant: Participant) -> string — where the participant processes data, as the selector names it; a participant whose row
 * declares none is named as having none, never left unnamed (THE PAGE NAMES WHERE IT SENDS).
 */
export const placeOf = (participant) => participant.place ?? "no processing place declared";
