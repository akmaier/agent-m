// Preparing a job (MOD-job-runner, Parts: prepare.mjs): preconditions, recipes, sizes, places, destinations. It sends
// nothing.
//
// Module: MOD-job-runner
//
// A part's size, in tokens, is estimated as its characters divided by three, rounded up — more than most texts take, so
// that a participant whose context is too small is named before anything is sent rather than after. A destination's size
// is its kind's prompt and every part it receives, so estimated. The drafter receives the parts of the kind's recipes; each
// reviewing participant those of the reviewer kind's recipes as they stand before a draft exists, the draft being added
// in the correction loop. Each part names the recipe that gave it, so that the loop puts it in that recipe's named place
// of the prompt; the job's parts are the drafter's and the reviewers', each once. A recipe whose part may be left out, and
// that fails, is left out with the failure's words as its reason; any other recipe's failure is thrown. Each reviewing
// participant differs from the drafter and from every other one, as the catalogue's `reviewers` says.

import { eligible } from "../participant-list/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { needs } from "./builtins.mjs";
import { failure, strategyOf } from "./registry.mjs";

const REGISTER = "docs/participants.md";
// estimate(text) -> number — a text's size in tokens as the runner estimates it: its characters divided by three, rounded up (MOD-job-runner, Data).
export const estimate = (text) => Math.ceil(text.length / 3);

// Every strategy a kind names, by its category in the registry, in the order a job meets them.
const named = (kind) => [
  ...kind.preconditions.map((name) => ["preconditions", name]),
  ...kind.recipes.map(({ name }) => ["recipes", name]),
  ...kind.checks.map((name) => ["checks", name]),
  ...kind.steps.map((name) => ["steps", name]),
  ["writers", kind.writer],
];

// The parts a kind's recipes build, each sized and naming its recipe, and otherwise as the recipe gave it — the existing
// artifacts a part shows among it; a part of a recipe whose part may be left out is not required, and such a recipe that
// fails is added to `leftOut` with its reason.
async function partsOf(kind, context, leftOut) {
  const parts = [];
  for (const { name, optional } of kind.recipes) {
    let given;
    try {
      given = await strategyOf("recipes", name)(context, context.params);
    } catch (error) {
      if (!optional || error.name === "UnknownStrategy") throw error;
      if (!leftOut.some((left) => left.part === name)) leftOut.push({ part: name, reason: error.message });
      continue;
    }
    for (const part of given) parts.push({ ...part, size: estimate(part.text), required: !optional, recipe: name });
  }
  return parts;
}

const destinationOf = (participant, role, kind, parts) => ({
  participant, role, place: participant.place ?? "", parts: parts.map((part) => part.name),
  size: estimate(kind.prompt) + parts.reduce((sum, part) => sum + part.size, 0),
});

// The findings of one need judged by eligible, each reason of the participant left out under `rule`.
function judged(destination, need, rule, fix, kindName) {
  const { participant, role } = destination;
  return eligible([participant], { capabilities: [], ...need }).leftOut.flatMap(({ reasons }) => reasons.map((reason) =>
    finding({ artifact: REGISTER, line: 1, kind: "error", rule,
      what: `${participant.name}, the ${role} of this job of ${kindName}, ${reason}`, fix })));
}

// The findings that keep a destination from receiving its parts: a capability its kind needs, a place a part's source or
// the mailbox does not allow, and, for a reviewing participant, one it does not differ from.
function blockingOf(destination, kind, parts, context, notLike, kindName) {
  const sources = [...new Set(parts.flatMap((part) => part.sources))].filter((source) => source in context.places.sources);
  return [
    ...judged(destination, { capabilities: kind.needs }, "A PARTICIPANT DECLARES ITS CAPABILITIES",
      `choose a participant that declares it, or declare it for ${destination.participant.name} in ${REGISTER}`, kindName),
    ...sources.flatMap((source) => judged(destination, { places: [{ from: source, allowed: context.places.sources[source] }] },
      "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS", `choose a participant at a place ${source} permits`, kindName)),
    ...(context.places.mailbox ? judged(destination, { places: [{ from: "the mailbox", allowed: context.places.mailbox }] },
      "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED", "choose a participant at a place the mailbox allows", kindName) : []),
    ...(notLike.length ? judged(destination, { notLike }, "NO REVIEWER IS THE DRAFTER",
      "choose another participant that uses another model", kindName) : []),
  ];
}

/**
 * prepareJob(kind: string, context: JobContext, choice: { drafter: Participant | null, reviewers: Participant[], limit?:
 * number }) -> Promise<Prepared> — sends nothing. It reads the kind, checks that every strategy it and its reviewer kind
 * name is registered, evaluates its preconditions, builds the parts from its recipes, estimates their sizes, and checks
 * each destination with MOD-participant-list's eligible: the capabilities the kind needs, the places every part's sources
 * and the mailbox allow, the context against the size, and for a reviewing participant that it differs from the drafter
 * and from each other, and asks each check the kind names what it needs of the context. Nothing is cut: what does not fit
 * is named in notFitting. The limit is fixed here: the caller's, else the kind's. Throws CheckoutAtOtherCommit { checkout, expected, found } for a checkout of the instance at another commit than the one
 * `context.agentM.commit` names, before anything runs; UnknownKind and InvalidKind as kindOf does, UnknownStrategy { strategy } for a strategy no module registered, and whatever a recipe throws by name.
 */
export async function prepareJob(name, context, choice) {
  // A checkout of the instance holds the commit the job's record names, which its snapshot — read from it — is at.
  const { checkout, snapshot } = context.instance;
  if (typeof checkout === "string" && snapshot?.commit !== context.agentM.commit) {
    throw failure("CheckoutAtOtherCommit", `the checkout ${checkout} is at ${snapshot?.commit ?? "no commit"}, not at ${context.agentM.commit}, which the job's record names`,
      { checkout, expected: context.agentM.commit, found: snapshot?.commit ?? null });
  }
  const kind = await kindOf(name);
  const reviewing = kind.reviewer === null ? null : await kindOf(kind.reviewer);
  for (const definition of [kind, reviewing]) {
    for (const [category, strategy] of definition ? named(definition) : []) strategyOf(category, strategy);
  }

  const blocking = [];
  for (const precondition of kind.preconditions) {
    const found = await strategyOf("preconditions", precondition)(context);
    if (found) blocking.push(found);
  }
  const leftOut = [];
  const parts = await partsOf(kind, context, leftOut);
  const reviewerParts = reviewing && choice.reviewers.length ? await partsOf(reviewing, context, leftOut) : [];
  const shared = (part, among) => among.some((other) => other.recipe === part.recipe && other.name === part.name);

  const destinations = [];
  if (choice.drafter) {
    const destination = destinationOf(choice.drafter, "drafter", kind, parts);
    destinations.push(destination);
    blocking.push(...blockingOf(destination, kind, parts, context, [], kind.name));
  }
  choice.reviewers.forEach((reviewer, at) => {
    const destination = destinationOf(reviewer, "reviewer", reviewing ?? kind, reviewerParts);
    destinations.push(destination);
    const notLike = [choice.drafter, ...choice.reviewers.filter((other, which) => which !== at)].filter(Boolean);
    blocking.push(...blockingOf(destination, reviewing ?? kind, reviewerParts, context, notLike, kind.name));
  });
  for (const check of kind.checks) {
    const lacking = needs.get(check)?.(context, kind);
    if (lacking) blocking.push(lacking);
  }

  const notFitting = destinations
    .filter((destination) => eligible([destination.participant], { capabilities: [], size: destination.size }).leftOut.length)
    .map(({ participant, size }) => ({ participant, size, context: participant.context }));

  return { kind, params: context.params, drafter: choice.drafter, reviewers: choice.reviewers,
    parts: [...parts, ...reviewerParts.filter((part) => !shared(part, parts))], destinations,
    fits: notFitting.length === 0, notFitting, leftOut, blocking, limit: choice.limit ?? kind.limit };
}
