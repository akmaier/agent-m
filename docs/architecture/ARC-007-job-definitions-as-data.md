---
id: ARC-007
title: Job definitions are data — prompt template, output schema, deterministic checks and finding templates — read by all three drivers
forced_by:
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - A FINDING READS LIKE A COMPILER MESSAGE
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - DERIVATION SEES THE EXISTING REQUIREMENTS
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - THE PAGE STATES WHAT IT SENDS WHERE
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - UC-010
  - UC-011
  - UC-019
---
# ARC-007 Job definitions are data

## Context

A job — derive requirements, derive use cases or architecture, change by prompt, generate tests,
implement a module, propose issues from mail, draft replies, close a sprint — runs in the browser
against a model endpoint, in CI, or through the bridge. The SPEC's origin story for
`ONE DEFINITION, THREE DRIVERS` is three copies of one rule drifting apart. The finding template of
the correction loop "lives once in the repository's single definition"
(`A FINDING READS LIKE A COMPILER MESSAGE`).

## Decision

1. **One folder per job kind** under `docs/assets/jobs/<kind>/` of Agent M's repository, served by
   Pages and compiled into the bridge (`--include`):
   - `job.json` — the kind, the role it belongs to, the capabilities it needs, the inputs it takes
     (by artifact kind), the output JSON Schema, the names of the deterministic checks to run on a
     draft, the default correction-round limit, and whether its result is a commit to the default
     branch (open artifacts) or a pull request (code);
   - `prompt.md` — the prompt template, Markdown with named placeholders for the inputs.
2. **One finding catalogue**, `docs/assets/jobs/findings.json`: each finding code with its kind
   (`error`, `warning`, or `person` — decided by a person, never sent back), the rule it enforces by
   name, and the message template in the compiler form
   `<artifact>:<line>: <kind>: <what> [<RULE>] — <expected correction>`.
3. **Checks are code, named by data.** The deterministic checks are pure functions in the core
   (for example `realisesKnownNames`, `identifierKept`, `exactDuplicate`, `fiveFields`,
   `useCaseSections`, `architectureFormat`); a definition lists which run. Adding a check is a code
   change with a test; choosing checks for a job is a data change.
4. **Drivers read, never copy.** The browser fetches the folder from its own Pages origin; the CI
   workflow checks out Agent M at the instance's commit and reads the same files; the bridge reads
   the copy compiled into it and states the Agent M version it was built from. Each job record
   names the Agent M commit whose definition it used (`AN ARTIFACT RECORDS THE VERSION THAT
   PRODUCED IT`).
5. **Context assembly is part of the definition's contract**: the inputs a definition names are
   collected completely (all existing requirements, all use cases, all architecture files, as the
   SPEC requires for each job kind) and the job refuses to send when they do not fit the chosen
   participant's context, naming the counts (`NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`).
   The run panel shows exactly what the definition will send and to which destination
   (`THE PAGE STATES WHAT IT SENDS WHERE`).

## Alternatives

- **Prompts embedded in JavaScript strings** — rejected: the CI workflow and the bridge would carry
  copies or have to import UI code; reviewers could not diff a prompt change as text.
- **Checks described declaratively too (a rule language)** — rejected: a second language to
  maintain for a dozen checks; YAGNI (book ch. 10 §3).
- **A prompt library such as a templating engine** — rejected: named placeholder substitution is a
  few lines; no reuse, no due diligence.

## Consequences

- `tests/test_single_definition.py` can check that no prompt or schema text appears outside
  `docs/assets/jobs/`.
- A definition change is reviewed like code (pull request with green CI), because it changes
  behaviour for every driver at once.
- The bridge carries the definitions of the Agent M version it was built from; a bridge older than
  the instance may run an older definition. The job record names both versions, and the dashboard
  warns when they differ.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
