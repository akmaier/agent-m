// The rules of eligible (MOD-participant-list, Interfaces: eligible): which participants may do a job or hold a role, and
// for each one left out every reason, in words a person can act on.
//
// Module: MOD-participant-list
//
// Of the four things eligible judges, ITM-216 builds the two that UC-002 needs: the capabilities a role or a job needs, and
// the processing places that a restricted source or the mailbox allows. A Need's size, which a participant's context must
// hold, and its notLike, the participants it must differ from, are not judged yet; nor is differs built yet. Participant,
// Need and Eligibility are the types index.mjs states.

/**
 * eligible(participants: Participant[], need: Need) -> Eligibility — which participants may do the job or hold the role,
 * in the order they are given, and for each one left out every reason: first each capability of the need it lacks,
 * named; then each source or mailbox among the need's places that does not allow its processing place, naming the place
 * and the source or mailbox. A participant that declares no processing place, as a person does, is at no place a source
 * allows. Every participant considered appears in exactly one of the two lists, as the object it was given.
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
    ];
    if (reasons.length) eligibility.leftOut.push({ participant, reasons });
    else eligibility.eligible.push(participant);
  }
  return eligibility;
}
