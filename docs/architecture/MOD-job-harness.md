---
id: MOD-job-harness
title: Runs the correction loop of a drafting job, independent of the driver
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
  - AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
  - WHAT A PERSON DECIDES IS NOT SENT BACK
  - THE CORRECTION LOOP HAS A FIXED LIMIT
  - THE ROUNDS ARE COUNTED AND SHOWN
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - A RUNTIME IS INTERCHANGEABLE
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - UC-019
  - UC-022
  - UC-038
follows:
  - ARC-003
  - ARC-007
  - ARC-008
  - ARC-009
  - ARC-014
uses:
  - MOD-job-definitions.renderPrompt
  - MOD-job-definitions.validateOutput
  - MOD-derivation.classifyCandidates
  - MOD-participant-endpoint.driver
  - MOD-participant-ci.driver
  - MOD-participant-cli.driver
provides:
  - runDraft
  - formatFinding
  - splitFindings
  - deterministicChecks
---
# MOD-job-harness Runs the correction loop of a drafting job, independent of the driver

## Responsibility

The correction loop of ARC-008: one function for every drafting job, given a driver that reaches the
participant. It runs where the driver runs — in the browser, inside a CI job (whose draft is then
committed only as open, UC-019 6b), or in the bridge. Pure core apart from the drivers passed in.

Besides the deterministic checks, a drafting job may be checked by other participants: for a text drawn
from a mail, three checking participants, each reached by its own driver (ARC-008 decision 6, ARC-014).
Their findings go back to the drafting participant like any error, and the loop keeps their last
verdicts for the write decision (MOD-pseudonymiser). A finding about a person reaches only the drafting
participant, which read the mail already, and the dashboard; what is recorded of it names the text,
line and rule, never the person.

**Current state.** No code exists.

## Interfaces

- `runDraft({ definition, inputs, driver, limit, checks, checkers }) -> { draft, remaining, personFindings, verdicts, rounds, cost }` — sends, parses, checks and sends back until no finding is to be sent back, the limit fixed before the first round is reached, or a round leaves the findings unchanged; every round with its findings is returned. `checks` are named deterministic checks, those of `deterministicChecks` or closures the caller adds (the search for a mail's people). `checkers` are `[{ participant, driver, definition }]`: each round, after the deterministic checks, each checker's driver receives the draft's texts rendered with its own definition (`check-for-persons`) — nothing of `inputs` —, and each finding it reports becomes an error finding under `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`, sent back with the others. `verdicts` are the checkers' answers on the last draft, each with the checker's model and place and the SHA-256 of the text it checked. The recorded rounds name, for these findings, text, line and rule only.
- `formatFinding({ artifact, line, kind, what, rule, fix }) -> string` — `<artifact>:<line>: <error|warning>: <what> [<RULE>] — <fix>`, from the finding catalogue `docs/assets/jobs/findings.json`.
- `splitFindings(findings, justifications) -> { back, person, justified }` — errors and unjustified warnings go back; findings the SPEC leaves to a person (conflicts, renamed requirements) never do.
- `deterministicChecks -> { name: (draft, snapshot) -> [finding] }` — the named checks a definition may list: known realised names, identifier kept, five fields, use-case parts, architecture format, exact duplicates, a rule containing "and".

Uses, as declared above: `MOD-job-definitions.renderPrompt`, `MOD-job-definitions.validateOutput`, `MOD-derivation.classifyCandidates`, `MOD-participant-endpoint.driver`, `MOD-participant-ci.driver`, `MOD-participant-cli.driver`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; open until accepted.*
