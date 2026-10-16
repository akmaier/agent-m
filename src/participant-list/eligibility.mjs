// The rules of eligible and differs (MOD-participant-list, Interfaces: eligible, differs): which participants may do a job or
// hold a role, and for each one left out every reason, in words a person can act on; and whether two participants differ.
//
// Module: MOD-participant-list
//
// eligible judges four things: the capabilities a role or a job needs, the processing places a restricted source or the
// mailbox allows, whether a participant's context holds the size of the job, and whether it differs from the participants
// it must differ from. Participant, Need and Eligibility are the types index.mjs states.

/**
 * eligible(participants: Participant[], need: Need) -> Eligibility — which participants may do the job or hold the role,
 * in the order they are given, and for each one left out every reason: first each capability of the need it lacks,
 * named; then each source or mailbox among the need's places that does not allow its processing place, naming the place
 * and the source or mailbox; then a context smaller than the need's size, or none declared, naming both; then each
 * participant of the need's notLike it does not differ from, naming it; then, for a subagent, `reached through itself`
 * when its starter is itself, or `reached through <name>, which is no CLI agent of the register` when its starter is
 * none of the participants given or is not of the type CLI agent. A participant that declares no processing place,
 * as a person does, is at no place a source allows. Every participant considered appears in exactly one of the two
 * lists, as the object it was given.
 * @param {Participant[]} participants
 * @param {Need} need
 * @returns {Eligibility}
 */
export function eligible(participants, need) {
  const eligibility = { eligible: [], leftOut: [] };
  for (const participant of participants) {
    const reasons = [
      ...need.capabilities.filter((capability) => !participant.capabilities.includes(capability))
        .map((capability) => `lacks the capability "${capability}"`),
      ...(need.places ?? []).filter(({ allowed }) => !allowed.includes(participant.place))
        .map(({ from }) => (participant.place === null
          ? `declares no processing place, so the content of ${from} may not go to it`
          : `processes data at "${participant.place}", where the content of ${from} may not go`)),
      ...sizeReasons(participant, need.size),
      ...(need.notLike ?? []).filter((other) => !differs(participant, other)).map((other) => sameReason(participant, other)),
      ...throughReasons(participant, participants),
    ];
    if (reasons.length) eligibility.leftOut.push({ participant, reasons });
    else eligibility.eligible.push(participant);
  }
  return eligibility;
}

// Why a subagent cannot be reached: its starter is itself, or no CLI agent among the participants given. Any other
// participant has none.
function throughReasons(participant, participants) {
  const starter = reachedThrough(participant);
  if (starter === null) return [];
  if (starter === participant.name) return ["reached through itself"];
  return participants.some(({ name, type }) => name === starter && type === "CLI agent") ? []
    : [`reached through ${starter}, which is no CLI agent of the register`];
}

// A subagent's route: the word `through`, one space and a participant's name.
const THROUGH = /^through ([a-z0-9-]+)$/;

/**
 * reachedThrough(participant: Participant) -> string | null — the name of the participant a subagent is reached through,
 * from a route that is the word `through`, one space and a participant's name (lower-case letters, digits and hyphens);
 * null for every other route.
 * @param {Participant} participant
 * @returns {string | null}
 */
export function reachedThrough(participant) {
  return THROUGH.exec(participant.route ?? "")?.[1] ?? null;
}

// Why a participant's context does not hold a job of `size` tokens — none when the need names no size.
function sizeReasons(participant, size) {
  if (size === undefined) return [];
  if (participant.context === null) return [`declares no context size, so the ${size} tokens of the job may not fit`];
  return participant.context < size ? [`its context holds ${participant.context} tokens, fewer than the ${size} of the job`] : [];
}

// Why a participant does not differ from `other`: it is `other`, one of the two names no model, or both name one model.
function sameReason(participant, other) {
  if (participant.name === other.name) return `is ${other.name}, from which it must differ`;
  if (participant.model === null) return `names no model, so it cannot be shown to differ from ${other.name}`;
  if (other.model === null) return `${other.name} names no model, so it cannot be shown to differ from it`;
  return `uses the model ${participant.model} of ${other.name}, from which it must differ`;
}

/**
 * differs(a: Participant, b: Participant) -> boolean — true when the two are different participants and name different
 * models; false when either names no model. A reviewer must differ from the drafter, and each of three checkers from the
 * rewriter and from each other.
 * @param {Participant} a
 * @param {Participant} b
 * @returns {boolean}
 */
export function differs(a, b) {
  return a.name !== b.name && a.model !== null && b.model !== null && a.model !== b.model;
}
