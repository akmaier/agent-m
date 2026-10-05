---
id: MOD-job-runner
title: The one runner of every job kind
folder: src/job-runner/
realises:
follows:
  - ARC-046
uses:
  - MOD-job-catalogue.kindOf
  - MOD-job-catalogue.KindDefinition
  - MOD-participant-list.eligible
  - MOD-participant-list.differs
  - MOD-participant-list.Participant
  - MOD-documents.documentFindings
  - MOD-documents.classifyCandidates
  - MOD-documents.loadSchema
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.graphFindings
  - MOD-trace-graph.selfSufficiencyFindings
  - MOD-spec-document.requirementFindings
  - MOD-group-document.parseGroupFile
  - MOD-group-document.hierarchy
  - MOD-test-document.testFindings
  - MOD-test-document.testDeclarations
  - MOD-text-tools.finding
  - MOD-text-tools.formatFinding
  - MOD-text-tools.Finding
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.readSnapshot
provides:
  - Strategies
  - Driver
  - DriverInput
  - Usage
  - JobContext
  - Part
  - Destination
  - Prepared
  - Round
  - JobResult
  - WriteOutcome
  - registerStrategies
  - prepareJob
  - runJob
  - writeResult
  - provenanceLines
  - roundsText
---
# MOD-job-runner The one runner of every job kind

## Responsibility

It belongs to Participants and jobs (ARC-046). It is the one runner shared by every subsystem and both programs: it
interprets a job kind's definition from MOD-job-catalogue — preconditions, recipes, the fit of the input to the
participant's context, the destinations, the correction loop with its checks and reviewing participants, the steps, the
gates, the writer —, keeps the registry of the strategies the kinds name, offers the strategies built on the artifact
model, and gives every commit a job makes its provenance lines. It knows no kind and no service by name. It runs
unchanged in a browser and in Node.

## Parts

- `index.mjs` — the interface.
- `registry.mjs` — the strategies registered by name, for the life of the program.
- `prepare.mjs` — preconditions, recipes, sizes, places, destinations.
- `loop.mjs` — the correction loop.
- `builtins.mjs` — the built-in strategies.
- `provenance.mjs` — the provenance lines of a commit.
- `rounds.schema.md` — the schema of the round record, in the schema language of MOD-documents.

## Data

It keeps the registry of strategies of the program it runs in, in memory, filled once by the program that composes it
(the Site's entry pages, MOD-workflow-entries, the Bridge's MOD-desktop-shell); it keeps nothing else.

**Built-in strategies**, registered by the runner itself:

| Name | Kind of strategy | What it does |
|---|---|---|
| `instruction` | recipe | the person's words, from the job's parameters, as one part |
| `draft` | recipe | the draft the job is handed: the draft under review, for a reviewing kind; the cases as the person left them, for `write-tests` |
| `return-draft` | writer | writes nothing; hands the result to the caller |
| `document-schema` | check | MOD-documents' `documentFindings` on every drafted document |
| `candidate-classes` | check | MOD-documents' `classifyCandidates` of the drafted candidates against the existing artifacts |
| `graph-checks` | check | MOD-trace-graph's `graphFindings` on the snapshot with the drafted files put in place of their paths, and its `selfSufficiencyFindings` there against the instance's repository, the `owner/name` of the context's instance |
| `requirement-form` | check | MOD-spec-document's `requirementFindings` on every drafted requirement |
| `group-rules` | check | the problems MOD-group-document's `hierarchy` reports for a drafted arrangement |
| `test-declarations` | check | MOD-test-document's `testFindings` on every declaration in the files the reported branch adds or changes, read with `testDeclarations` |

**The round record.** Every round of the correction loop is kept and recorded with the job (`THE ROUNDS ARE COUNTED AND
SHOWN`). Its text form, which MOD-job-ledger writes into the end of a job's record and the pages show beside a draft:

```markdown
## Rounds

### Round 1 — 2 findings
- UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.
  - fixed
- SPEC:3: warning: rule contains "and" [ONE STATEMENT PER REQUIREMENT] — split it, or keep it and give a one-line reason.
  - justified: the two clauses name one condition.

### Round 2 — no finding

Left: none · stopped because: passed · limit: 5
```

Each finding stands in MOD-text-tools' one form; under it, how the drafter answered — `fixed`, `justified:` with its one
line, or, for a reviewer's finding, `answered:` with the reason it does not hold. Findings a person decides are listed
under `For a person:` and were never sent back.

**Provenance lines.** The lines every commit a job makes carries at the end of its message, as git trailers; the
artifacts it writes name none of them (`AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`):

```text
Agent-M-Version: <calendar version, or "unreleased">, commit <instance commit>
Agent-M-Job: JOB-<yyyymmdd>-<hhmm>-<4 hex>
Agent-M-Kind: <kind>
Agent-M-Participant: <participant's name>
Agent-M-Model: <model>
Agent-M-Rounds: <number of correction rounds>
Agent-M-Instruction: <the person's instruction, on one line, where the kind has one>
```

## Interfaces

- `Strategies` — `{ recipes: Record<string, (context: JobContext, params: Record<string, unknown>) => Promise<Part[]>>,
  checks: Record<string, (draft: unknown, context: JobContext) => Finding[] | Promise<Finding[]>>, preconditions:
  Record<string, (context: JobContext) => Promise<Finding | null>>, steps: Record<string, (draft: unknown, context:
  JobContext) => Promise<{ draft: unknown, findings: Finding[] }>>, writers: Record<string, (result: JobResult, context:
  JobContext) => Promise<WriteOutcome>> }`: the plug-in contract. A strategy throws only for a failure of its own input or
  output — a hash that does not match, a repository that refuses — and names it; a finding is returned, never thrown.
- `Driver` — `{ participant: Participant, send(input: DriverInput, options?: { onOutput?: (chunk: string) => void,
  signal?: AbortSignal }) -> Promise<{ text: string, usage: Usage | null }> }`: one participant behind its route. `send`
  makes one exchange and returns the participant's answer as text and the usage its runtime reported, or `null`; it
  throws the failure of its route by name — the endpoint's refusal, a browser that blocked the call, an agent that is
  missing or ended with an error, a cancel — and never retries until an answer pleases.
- `DriverInput` — `{ prompt: string, parts: Part[], output: object | null, findings: Finding[], previous: string | null,
  workdir: string | null }`: the kind's prompt, the parts, the output schema the answer must follow, the findings of the
  last round with the draft they concern, and for an agent that works in a folder, that folder.
- `Usage` — `{ inputTokens: number | null, outputTokens: number | null, minutes: number | null, cost: { amount: number,
  currency: string } | null }`: exactly what a runtime reported; nothing is estimated.
- `JobContext` — `{ kind: KindDefinition, params: Record<string, unknown>, product: { address: string, snapshot: Snapshot,
  host: Host | null }, instance: { snapshot: Snapshot, host: Host | null }, connect: (address: string) => Promise<Host>,
  participants: Participant[], places: { sources: Record<string, string[]>, mailbox: string[] | null }, gates: { name:
  string, point: string, passed: boolean }[], person: string | null, now: Date, agentM: { version: string, commit: string
  }, jobId: string | null }`: everything a strategy may read. `connect` opens another repository with the credentials of
  the program — the token in a browser, the CI secret in CI, the computer's login on a Bridge; `places` gives, for every
  restricted source and for the mailbox, the places they allow; `gates` the gates of the product's workflow at this job's
  points, with whether their decisions are recorded.
- `Part` — `{ name: string, text: string, size: number, sources: string[], required: boolean }`: one piece of a job's
  input; `size` in tokens as estimated; `sources` the identifiers of the requirement sources whose content it carries;
  `required` false only where the kind says the part may be left out, and then only with the reason shown.
- `Destination` — `{ participant: Participant, role: "drafter" | "reviewer" | "checker", place: string, parts: string[],
  size: number }`: one participant that will receive something, and what.
- `Prepared` — `{ kind: KindDefinition, params: Record<string, unknown>, drafter: Participant | null, reviewers:
  Participant[], parts: Part[], destinations: Destination[], fits: boolean, notFitting: { participant: Participant, size:
  number, context: number | null }[], leftOut: { part: string, reason: string }[], blocking: Finding[], limit: number }`:
  what a run panel shows before the person's click (`THE PAGE STATES WHAT IT SENDS WHERE`); `blocking` holds the findings
  of preconditions and of eligibility that keep the job from starting.
- `Round` — `{ number: number, findings: Finding[], answers: { finding: Finding, how: "fixed" | "justified" | "answered",
  text: string | null }[], changed: boolean }`.
- `JobResult` — `{ draft: unknown, raw: string | null, drafter: Participant | null, rounds: Round[], remaining: Finding[],
  forPerson: Finding[], stepFindings: Finding[], stoppedBecause: "passed" | "limit" | "unchanged" | "unusable" | "not
  checked" | "gate", gate: string | null, usage: { participant: string, usage: Usage | null }[], written: WriteOutcome |
  null }`: the draft as the output schema reads it; the raw answer, kept folded for a person when it could not be read;
  the participant that drafted it, whom a writer's provenance lines name; every round; what the loop left; what a person
  decides; what the kind's steps found, which the page shows and the writer reads — the mark of a reuse decision without
  its due diligence among them (MOD-reuse-facts); why the loop stopped; the gate it stopped at; what the writer did when it
  ran at once — `null` while the result waits for a person, or when nothing was written.
- `WriteOutcome` — `{ commits: string[], files: string[], pullRequest: string | null, shown: unknown }`: what a writer did;
  `shown` is what `return-draft` hands back.
- `registerStrategies(owner: string, strategies: Partial<Strategies>) -> void` — adds the named strategies a module
  offers. Throws `DuplicateStrategy { name, owners }` when a name is registered twice; a program registers each owner
  once, before its first job.
- `prepareJob(kind: string, context: JobContext, choice: { drafter: Participant | null, reviewers: Participant[], limit?:
  number }) -> Promise<Prepared>` — sends nothing. It reads the kind, evaluates its preconditions, builds the parts from
  its recipes, estimates their sizes, and checks each destination with MOD-participant-list's `eligible`: the
  capabilities the kind needs, the places every part's sources and the mailbox allow, the context against the size, and
  for a reviewer or checker that it `differs` from the drafter and, for checkers, from each other. Nothing is truncated:
  what does not fit is named in `notFitting` (`NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`, `NOTHING IS LEFT OUT
  OF AN ARCHITECTURE PROMPT SILENTLY`, `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY`). The limit is fixed here, before
  the first round: the caller's, else the kind's (`THE CORRECTION LOOP HAS A FIXED LIMIT`). Throws `UnknownKind`,
  `UnknownStrategy { name }` for a strategy no module registered, and whatever a recipe throws by name.
- `runJob(prepared: Prepared, drivers: { drafter: Driver | null, reviewers: Driver[] }, options: { attended: boolean,
  context: JobContext, from?: unknown, onRound?: (round: Round) => void, onOutput?: (chunk: string) => void, onGate?:
  (gate: string) => Promise<void>, signal?: AbortSignal }) -> Promise<JobResult>` — refuses to start while
  `prepared.blocking` or `prepared.notFitting` is not empty (`NotStartable`). It sends the input to the drafter — or, with
  `from`, begins with that draft, one a person changed and wants checked again as a whole (UC-022, UC-023), and without a
  drafter only returns the findings on it —, reads the answer by the output schema — an answer that cannot be read is a
  finding of the loop, and if it still cannot be read after the last round the result is `unusable` —, runs the kind's
  checks and then its reviewing participants, whose findings are warnings
  whatever they say (`A REVIEWER'S FINDING IS A WARNING`); an answer of a reviewer that cannot be read is a check not done,
  asked again within the limit, and the result is `not checked` if it never can be read. Findings whose rule the kind
  leaves to a person go to `forPerson` and are never sent back (`WHAT A PERSON DECIDES IS NOT SENT BACK`); errors and
  warnings go back to the drafter, which must fix every error and fix or justify each warning in one line, and answer a
  reviewer's finding that does not hold with its reason (`A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON`). The loop
  stops when nothing is left, at the limit, or when a round leaves the findings unchanged; then the kind's steps run, so
  that a person sees what they add, such as the due diligence (UC-022), and what they find goes into `stepFindings`,
  never back to the drafter. At a point of the kind where a gate of
  `context.gates` is not passed, it calls `onGate` — the route appends the gate to the job's record — and stops with
  `gate`. What follows depends on the kind's `review` and on `attended`, which the caller sets when a person started the
  job on the page and waits for its result, outside a run:
  - a kind of `review: person`, attended: the job ends with the draft, its rounds and the findings left, and writes
    nothing; `writeResult` writes it on the person's click;
  - otherwise — `review: none`, or nobody attends: a job on CI or on a Bridge that runs it, an agent planner's among them
    (UC-045), and every job of a run (UC-043) —: it calls the kind's writer at once (`A CI AGENT'S DRAFT ENTERS AS OPEN`),
    which refuses by name what it must not write, unless the signal was aborted: after a cancel, nothing more is written
    (`A CANCELLED JOB WRITES NOTHING MORE`).

  A driver's failure ends the job and is thrown by name; `Cancelled` when the signal is aborted.
- `writeResult(prepared: Prepared, draft: unknown, options: { result: JobResult, context: JobContext }) ->
  Promise<WriteOutcome>` — writes a result that waited for a person, on their click — *Write proposals*, *Save*, *Save
  plan*, *Add to backlog*: runs the kind's steps again on the draft as the person left it, since they may have changed
  what a step works on, such as the reuse candidate they chose, and then calls the kind's writer with `result`, its draft
  replaced by theirs and its `stepFindings` by those the steps return now. `result` is what `runJob` returned, whose
  drafter and rounds the provenance lines name; `context` is read at the click, so that the writer commits on the current
  head. Throws what the writer throws by name — `DueDiligenceMissing` from `open-files`, which then writes nothing, while
  a reuse decision carries the mark of a registry that could not be read (UC-022); a refused commit because the branch
  moved.
- `provenanceLines(job: { agentM: { version: string, commit: string }, jobId: string, kind: string, participant:
  Participant, rounds: number, instruction: string | null }) -> string[]` — the trailer lines defined under Data.
- `roundsText(rounds: Round[], left: Finding[], forPerson: Finding[], stoppedBecause: string, limit: number) -> string` —
  the round record's text form defined under Data, for the job's record.

## Files

It reads the data files of MOD-job-catalogue through `kindOf`, its own `rounds.schema.md`, and, for `test-declarations`,
the branch a coding participant reports, through the host. It writes nothing itself: the writers write, and the route
appends to the job's record.

## Uses

- `MOD-job-catalogue.kindOf`, `MOD-job-catalogue.KindDefinition` — the definition it interprets.
- `MOD-participant-list.eligible`, `MOD-participant-list.differs`, `MOD-participant-list.Participant` — who may receive
  what, and that reviewers and checkers differ.
- `MOD-documents.documentFindings`, `MOD-documents.classifyCandidates`, `MOD-trace-graph.traceGraph`,
  `MOD-trace-graph.graphFindings`, `MOD-trace-graph.selfSufficiencyFindings`, `MOD-spec-document.requirementFindings`,
  `MOD-group-document.parseGroupFile`, `MOD-group-document.hierarchy`, `MOD-test-document.testFindings`, `MOD-test-document.testDeclarations` — the built-in
  checks.
- `MOD-documents.loadSchema` — the round record's schema.
- `MOD-text-tools.finding`, `MOD-text-tools.formatFinding`, `MOD-text-tools.Finding` — findings of its own, such as an
  answer that cannot be read, and their text in the round record.
- `MOD-repository-hosts.Snapshot`, `MOD-repository-hosts.Host` — the types of the context.
- `MOD-repository-hosts.readSnapshot` — the branch a coding participant reports, for `test-declarations`.
