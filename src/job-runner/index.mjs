// MOD-job-runner — the one runner of every job kind (docs/architecture/MOD-job-runner.md): its interface — the registry of
// strategies (registry.mjs) with the built-in recipes `instruction` and `draft`, the writer `return-draft` and the checks
// `document-schema` and `requirement-form` (builtins.mjs); prepareJob (prepare.mjs), what a run panel shows before the
// person's click; runJob with the correction loop, and writeResult (loop.mjs); provenanceLines and roundsText
// (provenance.mjs), with the round record's schema rounds.schema.md. The other built-in checks on the artifact model are
// registered once the modules they use offer what they call: MOD-documents' classifyCandidates, MOD-trace-graph's
// graphFindings and selfSufficiencyFindings, MOD-group-document, MOD-test-document's testFindings.
//
// Module: MOD-job-runner
//
// It belongs to Participants and jobs (ARC-046). It runs unchanged in a browser and in Node. It keeps the registry of the
// strategies of the program it runs in, in memory, filled once by the program that composes it; it keeps nothing else. It
// reads the kinds through MOD-job-catalogue's kindOf and writes nothing. It knows no kind and no service by name. Every
// other file of this folder is private to the module.

// KindDefinition is MOD-job-catalogue's type; Participant MOD-participant-list's; Finding MOD-text-tools'; Snapshot and
// Host MOD-repository-hosts'.
import { builtins } from "./builtins.mjs";
import { registerStrategies } from "./registry.mjs";

export { registerStrategies } from "./registry.mjs";
export { prepareJob } from "./prepare.mjs";
export { runJob, writeResult } from "./loop.mjs";
export { provenanceLines, roundsText } from "./provenance.mjs";

/**
 * The plug-in contract: the recipes, checks, preconditions, steps and writers a module offers, each under its name. A
 * strategy throws only for a failure of its own input or output, and names it; a finding is returned, never thrown.
 * @typedef {{ recipes: Record<string, (context: JobContext, params: Record<string, unknown>) => Promise<Part[]>>,
 *   checks: Record<string, (draft: unknown, context: JobContext) => Finding[] | Promise<Finding[]>>,
 *   preconditions: Record<string, (context: JobContext) => Promise<Finding | null>>,
 *   steps: Record<string, (draft: unknown, context: JobContext) => Promise<{ draft: unknown, findings: Finding[] }>>,
 *   writers: Record<string, (result: unknown, context: JobContext) => Promise<unknown>> }} Strategies
 */

/**
 * Everything a strategy may read: the kind, the job's parameters, the product and the instance, opening another
 * repository, the participants, the places every restricted source and the mailbox allow, the gates at this job's points,
 * the person, the time, Agent M's version, and the job's identifier.
 * @typedef {{ kind: KindDefinition, params: Record<string, unknown>, product: { address: string, snapshot: Snapshot,
 *   host: Host | null }, instance: { snapshot: Snapshot, host: Host | null }, connect: (address: string) => Promise<Host>,
 *   participants: Participant[], places: { sources: Record<string, string[]>, mailbox: string[] | null },
 *   gates: Array<{ name: string, point: string, passed: boolean }>, person: string | null, now: Date,
 *   agentM: { version: string, commit: string }, jobId: string | null }} JobContext
 */

/**
 * One piece of a job's input: its size in tokens as estimated; the identifiers of the sources whose content it carries;
 * required false only where the kind says the part may be left out; and the recipe that gave it, whose named place of the
 * prompt it fills — set by the runner, not by the recipe.
 * @typedef {{ name: string, text: string, size: number, sources: string[], required: boolean, recipe: string }} Part
 */

/**
 * One participant behind its route: send makes one exchange and returns the participant's answer as text and the usage its
 * runtime reported, or null; it throws the failure of its route by name, and never retries until an answer pleases.
 * @typedef {{ participant: Participant, send(input: DriverInput, options?: { onOutput?: (chunk: string) => void,
 *   signal?: AbortSignal }): Promise<{ text: string, usage: Usage | null }> }} Driver
 */

/**
 * What a driver sends: the kind's prompt with each recipe's parts in its named place, the parts, the output schema the
 * answer must follow, the findings of the last round with the draft they concern, and for an agent that works in a
 * folder, that folder.
 * @typedef {{ prompt: string, parts: Part[], output: object | null, findings: Finding[], previous: string | null,
 *   workdir: string | null }} DriverInput
 */

/**
 * Exactly what a runtime reported; nothing is estimated.
 * @typedef {{ inputTokens: number | null, outputTokens: number | null, minutes: number | null,
 *   cost: { amount: number, currency: string } | null }} Usage
 */

/**
 * One round of the correction loop: its findings, how the drafter answered them, and whether the draft changed.
 * @typedef {{ number: number, findings: Finding[], answers: Array<{ finding: Finding, how: "fixed" | "justified" |
 *   "answered", text: string | null }>, changed: boolean }} Round
 */

/**
 * What a writer did; `shown` is what return-draft hands back.
 * @typedef {{ commits: string[], files: string[], pullRequest: string | null, shown: unknown }} WriteOutcome
 */

/**
 * A job's result: the draft as the output schema reads it; the raw answer, kept for a person when it could not be read;
 * the drafter; every round; what the loop left; what a person decides; what the kind's steps found; why the loop stopped;
 * the gate it stopped at; the usage of every exchange; what the writer did when it ran at once.
 * @typedef {{ draft: unknown, raw: string | null, drafter: Participant | null, rounds: Round[], remaining: Finding[],
 *   forPerson: Finding[], stepFindings: Finding[], stoppedBecause: "passed" | "limit" | "unchanged" | "unusable" |
 *   "not checked" | "gate", gate: string | null, usage: Array<{ participant: string, usage: Usage | null }>,
 *   written: WriteOutcome | null }} JobResult
 */

/**
 * One participant that will receive something, and what.
 * @typedef {{ participant: Participant, role: "drafter" | "reviewer" | "checker", place: string, parts: string[],
 *   size: number }} Destination
 */

/**
 * What a run panel shows before the person's click: blocking holds the findings of preconditions and of eligibility that
 * keep the job from starting.
 * @typedef {{ kind: KindDefinition, params: Record<string, unknown>, drafter: Participant | null, reviewers: Participant[],
 *   parts: Part[], destinations: Destination[], fits: boolean, notFitting: Array<{ participant: Participant, size: number,
 *   context: number | null }>, leftOut: Array<{ part: string, reason: string }>, blocking: Finding[], limit: number }} Prepared
 */

registerStrategies("MOD-job-runner", builtins);
