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
// participant differs from the drafter and from every other one, as the catalogue's `reviewers` says, except with `selfReview`.
//
// Agent M's own AGENTS.md, at the root of the instance repository, is the job's `rules`: the part every input to a model begins with, whatever
// repository the job works on — its text, or, where the participant works in a checkout of the instance, its path there —, counted in every
// destination's size. It carries no source: it is the instance's own file.
//
// The job's `form` is the part with which the drafter's input continues after `rules`: what the kind's built-in checks of form judge a draft by,
// chosen from its `checks` and from nothing else (A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY) — for `requirement-form`
// MOD-spec-document's requirementForm of the instance's SPEC.md, for `document-schema` MOD-documents' artifactSchemaTexts —, given as its text on
// every route, counted in the drafter's size, and carrying no source. A reading this file takes: an instance without a SPEC.md lacks every piece
// of the form, as one whose SPEC.md lacks a piece does, and the job is blocked the same way.

import { eligible } from "../participant-list/index.mjs";
import { artifactSchemaTexts } from "../documents/index.mjs";
import { requirementForm } from "../spec-document/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { needs } from "./builtins.mjs";
import { failure, registeredAll, strategyOf } from "./registry.mjs";

const REGISTER = "docs/participants.md";
const RULES = "AGENTS.md";
const SPEC = "SPEC.md";
const FORM_RULE = "A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY";
const FORM_HEADING = "## The form your draft is checked by";
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

// rulesOf(context) -> Part | null — Agent M's AGENTS.md, read from the instance's snapshot: its text, or in a checkout of the instance the path of the file
// there, followed by the sentence that asks the participant to read it; null where the instance has none.
async function rulesOf(context) {
  const { snapshot, checkout } = context.instance;
  const text = await snapshot?.read?.(RULES);
  if (typeof text !== "string") return null;
  const given = typeof checkout === "string"
    ? `${checkout.replace(/[\\/]+$/, "")}/${RULES}\n\nThe file above is Agent M's AGENTS.md: read it in full before anything else.` : text;
  return { name: RULES, text: given, size: estimate(given), sources: [], required: true, recipe: null, artifacts: [] };
}

// formOf(kind, context) -> { form: Part | null, lacking: Finding | null } — the job's form, as the head of this file states it: the heading, then
// each piece under its own heading, in the order requirement-form, document-schema; null for a kind that names neither. Where the instance's
// SPEC.md lacks a piece of the form of a requirement (FormMissing), no form and the error that names what it lacks, under FORM_RULE.
async function formOf(kind, context) {
  const pieces = [];
  if (kind.checks.includes("requirement-form")) {
    const text = await context.instance.snapshot?.read?.(SPEC);
    try {
      pieces.push(`### The form of a requirement\n\n${requirementForm(typeof text === "string" ? text : "")}`);
    } catch (error) {
      if (error.name !== "FormMissing") throw error;
      return { form: null, lacking: finding({ artifact: SPEC, line: 1, kind: "error", rule: FORM_RULE,
        what: `the instance's ${SPEC} lacks ${error.missing.join(", ")}, which the job of ${kind.name} gives its drafter as the form its draft is checked by`,
        fix: `restore ${error.missing.join(", ")} in the ${SPEC} at the root of the instance repository` }) };
    }
  }
  if (kind.checks.includes("document-schema")) pieces.push(...artifactSchemaTexts().map(({ path, text }) => `### ${path}\n\n${text}`));
  if (!pieces.length) return { form: null, lacking: null };
  const text = [FORM_HEADING, ...pieces].join("\n\n");
  return { form: { name: "The form your draft is checked by", text, size: estimate(text), sources: [], required: true, recipe: null, artifacts: [] }, lacking: null };
}

// A destination's size: the kind's prompt, the job's rules, for the drafter its form, and every part it receives.
const destinationOf = (participant, role, kind, parts, rules, form = null) => ({
  participant, role, place: participant.place ?? "", parts: parts.map((part) => part.name),
  size: estimate(kind.prompt) + (rules?.size ?? 0) + (form?.size ?? 0) + parts.reduce((sum, part) => sum + part.size, 0),
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
    ...judged(destination, { capabilities: kind.needs }, "A CONNECTION DECLARES ITS CAPABILITIES",
      `choose a participant whose connection declares it, or a connection of ${destination.participant.name}'s model that declares it`, kindName),
    ...sources.flatMap((source) => judged(destination, { places: [{ from: source, allowed: context.places.sources[source] }] },
      "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS", `choose a participant at a place ${source} permits`, kindName)),
    ...(context.places.mailbox ? judged(destination, { places: [{ from: "the mailbox", allowed: context.places.mailbox }] },
      "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED", "choose a participant at a place the mailbox allows", kindName) : []),
    ...(notLike.length ? judged(destination, { notLike }, "NO REVIEWER IS THE DRAFTER",
      "choose another participant that uses another model", kindName) : []),
  ];
}

// With `selfReview`, which only MOD-prompt-bar sets for a change described in the prompt bar, the reviewers are the drafter alone.
const drafterAlone = ({ drafter, reviewers }) => drafter !== null && reviewers.length === 1 && reviewers[0].name === drafter.name;
const notDrafterAlone = ({ drafter, reviewers }, kindName) => finding({ artifact: REGISTER, line: 1, kind: "error", rule: "NO REVIEWER IS THE DRAFTER",
  what: `with selfReview, the reviewers of this job of ${kindName} are ${reviewers.map((each) => each.name).join(", ") || "none"}, not the drafter ${drafter?.name ?? "(none)"} alone`,
  fix: "review a change described in the prompt bar by its drafter alone, or prepare the job without selfReview" });

/**
 * prepareJob(kind: string, context: JobContext, choice: { drafter: Participant | null, reviewers: Participant[], limit?:
 * number, selfReview?: boolean }) -> Promise<Prepared> — sends nothing. It reads the kind, checks that every strategy it and its reviewer kind
 * name is registered, evaluates its preconditions, builds the parts from its recipes, estimates their sizes, and checks
 * each destination with MOD-participant-list's eligible: the capabilities the kind needs, the places every part's sources
 * and the mailbox allow, the context against the size, and for a reviewing participant that it differs from the drafter
 * and from each other — except with selfReview, for a change described in the prompt bar: the reviewers are then the drafter
 * alone, not asked to differ, and any other reviewers are refused under NO REVIEWER IS THE DRAFTER —, and asks each check the kind names what it needs of the context. Nothing is cut: what does not fit
 * is named in notFitting. Agent M's AGENTS.md, read from the instance, is the job's `rules` and is counted in every destination's size; the job's `form`,
 * chosen from the kind's checks, is counted in the drafter's, and an instance's SPEC.md that lacks a piece of it blocks the job (FormMissing). The limit is fixed here: the caller's, else the kind's. Throws CheckoutAtOtherCommit { checkout, expected, found } for a checkout of the instance at another commit than the one
 * `context.agentM.commit` names, before anything runs; UnknownKind and InvalidKind as kindOf does, UnknownStrategy { strategy } for a strategy no module registered, and whatever a recipe throws by name.
 */
export async function prepareJob(name, context, choice) {
  await registeredAll();
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
  const rules = await rulesOf(context);
  const { form, lacking: formLacking } = await formOf(kind, context);
  if (formLacking) blocking.push(formLacking);
  const leftOut = [];
  const parts = await partsOf(kind, context, leftOut);
  const reviewerParts = reviewing && choice.reviewers.length ? await partsOf(reviewing, context, leftOut) : [];
  const shared = (part, among) => among.some((other) => other.recipe === part.recipe && other.name === part.name);

  const destinations = [];
  if (choice.drafter) {
    const destination = destinationOf(choice.drafter, "drafter", kind, parts, rules, form);
    destinations.push(destination);
    blocking.push(...blockingOf(destination, kind, parts, context, [], kind.name));
  }
  choice.reviewers.forEach((reviewer, at) => {
    const destination = destinationOf(reviewer, "reviewer", reviewing ?? kind, reviewerParts, rules);
    destinations.push(destination);
    const notLike = choice.selfReview ? [] : [choice.drafter, ...choice.reviewers.filter((other, which) => which !== at)].filter(Boolean);
    blocking.push(...blockingOf(destination, reviewing ?? kind, reviewerParts, context, notLike, kind.name));
  });
  if (choice.selfReview && !drafterAlone(choice)) blocking.push(notDrafterAlone(choice, kind.name));
  for (const check of kind.checks) {
    const lacking = needs.get(check)?.(context, kind);
    if (lacking) blocking.push(lacking);
  }

  const notFitting = destinations
    .filter((destination) => eligible([destination.participant], { capabilities: [], size: destination.size }).leftOut.length)
    .map(({ participant, size }) => ({ participant, size, context: participant.context }));

  return { kind, params: context.params, drafter: choice.drafter, reviewers: choice.reviewers, rules, form,
    parts: [...parts, ...reviewerParts.filter((part) => !shared(part, parts))], destinations,
    fits: notFitting.length === 0, notFitting, leftOut, blocking, limit: choice.limit ?? kind.limit };
}
