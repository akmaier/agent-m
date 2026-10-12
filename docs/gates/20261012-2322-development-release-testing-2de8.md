---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4cd92435b97a15ec479881c117551bd913473a6d
  - https://github.com/akmaier/agent-m/pull/473
date: 2026-10-12 23:22 UTC
---
# Development → Release testing: ITM-362, drafting use cases on the review pages

**REGISTER**

## Reason

ITM-362, pull request #473 by developer-sonnet-d into `sprint/team1/25`, head `4cd9243`. The tests-only commits were
red on the new tests alone (run 38321186148, after one cancelled), and `4cd9243` is green (run 38321397471). The code
changes only `src/review-pages/`, `jobs.mjs` among the module's Parts; the new test names MOD-review-pages and its
guards, and 24 faults are recorded, all killed. The Acceptance holds: the default selection, *Run* only from the panel,
the files written open in one commit and listed, the rounds, a job's notes beside its use case, a job on the CI route
queued and not run in the tab, nothing written without the click.

The points weighed:
- A note holding a comma — UC-007 4a's — cannot stand in the End: the route writes the notes as items of the End's
  `results:` line, whose items are separated by commas, so the End is refused after the writer's files are committed,
  and the job stays without its End. The test shows the notes with 4b's note. The defect is MOD-job-ledger's format,
  whose file names no place for a writer's notes; ITM-468 carries it, waiting for akmaier's change of that file.
- The page queues a job on another route through `queueJob` alone, so with ITM-325, merged into `sprint/team1/25`
  after this branch began, a job on a Bridge's route is queued and handed over too; no test pins the earlier failure.
  The page reads an endpoint's stored `throughBridge`, which the settings page still writes (ITM-269), where
  MOD-browser-store's file names `bridge`; noted for the review.
- No reviewer is offered, as `derive-use-cases` has `review: none`; `places.sources` is empty, no source being linked
  for this kind.
