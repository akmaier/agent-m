// The join of participantsOf, and the rules of eligible and differs (MOD-participant-list, Parts: eligibility.mjs; Interfaces:
// participantsOf, eligible, differs): the register's people and agents on the connections that offer the agents' models; which
// participants may do a job or hold a role, and for each one left out every reason, in words a person can act on; and whether two
// participants differ.
//
// Module: MOD-participant-list
//
// eligible judges five things: whether a connection offers an agent's model, the capabilities a role or a job needs, the
// processing places a restricted source or the mailbox allows, whether a participant's context holds the size of the job,
// and whether it differs from the participants it must differ from. The capabilities, the place and the context are those
// of the connection a participant runs on. Participant, Need and Eligibility are the types index.mjs states.

/**
 * eligible(participants: Participant[], need: Need) -> Eligibility — which participants may do the job or hold the role,
 * in the order they are given, and for each one left out every reason: for an agent that no connection given offers its
 * model — of the type `agent` —, that no connection offers its model, naming the model, and nothing of a connection it
 * has none of; otherwise first each capability of the need its connection lacks, named; then each source or mailbox among
 * the need's places that does not allow its connection's processing place, naming the place and the source or mailbox;
 * then a context smaller than the need's size, or none declared, naming both. Then, for every participant, each
 * participant of the need's notLike it does not differ from, naming it. A person runs on no connection: it has no
 * capability and is at no place a source allows. Every participant considered appears in exactly one of the two lists, as
 * the object it was given.
 * @param {Participant[]} participants
 * @param {Need} need
 * @returns {Eligibility}
 */
export function eligible(participants, need) {
  const eligibility = { eligible: [], leftOut: [] };
  for (const participant of participants) {
    const reasons = [
      ...(participant.type === "agent" ? [`no connection offers its model ${participant.model}`]
        : connectionReasons(participant, need)),
      ...(need.notLike ?? []).filter((other) => !differs(participant, other)).map((other) => sameReason(participant, other)),
    ];
    if (reasons.length) eligibility.leftOut.push({ participant, reasons });
    else eligibility.eligible.push(participant);
  }
  return eligibility;
}

// Why the connection a participant runs on cannot do the job: the capabilities it lacks, the places a source does not
// allow, and a context that does not hold the job.
function connectionReasons(participant, need) {
  return [
    ...need.capabilities.filter((capability) => !participant.capabilities.includes(capability))
      .map((capability) => `lacks the capability "${capability}"`),
    ...(need.places ?? []).filter(({ allowed }) => !allowed.includes(participant.place))
      .map(({ from }) => (participant.place === null
        ? `declares no processing place, so the content of ${from} may not go to it`
        : `processes data at "${participant.place}", where the content of ${from} may not go`)),
    ...sizeReasons(participant, need.size),
  ];
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
 * models; false when either names no model. A reviewer must differ from the drafter. Of one agent on two connections, neither
 * differs from the other.
 * @param {Participant} a
 * @param {Participant} b
 * @returns {boolean}
 */
export function differs(a, b) {
  return a.name !== b.name && a.model !== null && b.model !== null && a.model !== b.model;
}

/**
 * participantsOf(register: Document, connections: Connection[]) -> Participant[] — the participants of a register read with
 * participantSchema, in its order: a person once; an agent once for each connection among `connections` whose `model` is
 * the agent's, in their order, and once without a route where none is. Pure. It judges no row: a row's errors are those
 * documentFindings names with participantSchema.
 * @param {Document} register
 * @param {Connection[]} [connections]
 * @returns {Participant[]}
 */
export function participantsOf(register, connections = []) {
  return register.sections.flatMap((section) => section.rows ?? []).flatMap(({ cells }) => {
    const name = cells.Name ?? null;
    if (cells.Type === "person") return [onNoConnection(name, "person", null)];
    const model = cells.Model ?? null;
    const offering = connections.filter((connection) => connection.model === model);
    if (!offering.length) return [onNoConnection(name, "agent", model)];
    return offering.map(({ type, context, capabilities, place, route }) =>
      ({ name, type, model, context, capabilities, place, route }));
  });
}

// A person, or an agent whose model no connection given offers: no context, no capabilities, no place and no route.
function onNoConnection(name, type, model) {
  return { name, type, model, context: null, capabilities: [], place: null, route: null };
}
