// MOD-job-runner — the one runner of every job kind (docs/architecture/MOD-job-runner.md): its interface. Of it, this
// builds the registry of strategies (registry.mjs) with the built-in recipes `instruction` and `draft` and the writer
// `return-draft` (builtins.mjs), and prepareJob (prepare.mjs): what a run panel shows before the person's click. The
// correction loop with runJob and the built-in checks, writeResult, provenanceLines and roundsText are not built yet.
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
 * required false only where the kind says the part may be left out.
 * @typedef {{ name: string, text: string, size: number, sources: string[], required: boolean }} Part
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
