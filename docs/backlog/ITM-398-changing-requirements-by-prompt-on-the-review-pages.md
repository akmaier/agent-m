---
id: ITM-398
title: Changing requirements by prompt on the review pages
level: module
realises:
  - UC-019
  - THE PERSON WHO PROMPTS IS A SOURCE
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - THE PAGE STATES WHAT IT SENDS WHERE
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
modules:
  - MOD-review-pages
  - MOD-runtimes
  - MOD-job-runner
  - MOD-endpoint-calls
  - MOD-agent-processes
builds_on:
  - ITM-363
  - ITM-341
  - ITM-383
  - ITM-387
  - ITM-389
  - ITM-393
  - ITM-396
tests:
  - unit
origin:
  - UC-019 steps 1 to 9 for requirements, 4b, 8a, 9a
---
# ITM-398 Changing requirements by prompt on the review pages

**REGISTER**

## Outcome

MOD-review-pages' routes `requirement/<name>/prompt` and `requirements/prompt` for a group of requirements whose names
the specification browser hands it, as its file states them: the instruction, the participant and the run panel of
`change-requirements`, whose parameter `source` is the person's own source that `personSource` names among the product's
linked sources (ITM-383) — without one nothing is sent, the page says so and links registering and linking a source
(UC-019 4b) —; the draft as the sections `entrySections` composes from it and its classes (ITM-393, ITM-387), each
requirement beside the one it refers to with its class, which the author may change, a conflict decided by the author;
*Refine* (ITM-389); and *Save*, each section with `proposeSection` as an entry of the person's open queue of the day,
only on the text the job read, with the job's provenance lines as trailers, GitHub's pages without a token (UC-019 step
9, 9a).

MOD-runtimes' existing `runOnTab` boundary passes the optional refinement draft to MOD-job-runner and includes the loop's
current draft and findings in the prompt delivered to the actual endpoint or Bridge driver. The review page reaches this
recording boundary rather than running an unrecorded job of its own.

Every actual driver carries the current draft and canonical findings from DriverInput into its one exchange, in both
the tab and CI. The transient context is serialized once; no tab-only compensation duplicates it.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, with a fixture host and a fixture driver: a
  change of one requirement and of a group; the person's source as the job's parameter; no source, nothing sent and the
  links shown; a class changed and a conflict decided reaching the saved entry; *Refine* running once more on the draft;
  *Save* refused when a section changed meanwhile, with the draft kept; the provenance lines in the commit.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Unit tests at MOD-runtimes' actual driver boundary prove that the current refinement draft reaches the endpoint,
  with an ordinary request as the known positive counter-proof.
- Direct driver and actual CI-entry tests prove that correction findings and the current draft reach their recipient,
  with the ordinary request as the known positive and with no duplicated recipe parts or transient context.
- Only the assigned modules' folders and the tests that name them change.
