---
id: ITM-677
title: The queues are read in batches
level: module
realises:
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
  - UC-006
modules:
  - MOD-spec-changes
  - MOD-repository-hosts
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - ITM-648's stop at its rework's draft run (sprint team1/69), from developer-sonnet-d's draft
---
# ITM-677 The queues are read in batches

**REGISTER**

## Outcome

`queues` (`src/spec-changes/queues.mjs`) reads one file at a time through `snapshot.read`: each queue's `index.md`
and `entscheidungen.md`, each record, proposal and target. On this repository's 56 queues that is over 112 requests per
call. With a token those are API calls on the person's budget. akmaier's words in ITM-574 (`:16`): "The excessive use of
token requests is still a problem that needs to be fixed."

`queues` is MOD-spec-changes' shared reader. Its callers are the review pages' entries and edits, the notifications'
facts (`src/progress-measures/`), the result records, the recipes and the writer. So reading in batches belongs here, not
in one view.
- It gathers the paths it will read and reads them first through `Snapshot.readMany`, which is in its Uses. No draft is
  needed.
- The measurement is a committed test (sprint 67's form): a fixture of about 60 queues counts a call's requests, with
  one batch per 100 paths with a token.

**What ITM-648's draft of it found**, read again at this item's start:
- **Two behaviours broke**, and must hold, not take new expected values:
  - `tests/dashboard-notifications.test.mjs`, "a newly open use case and a newly open SPEC change are each notified",
    expected 2 and got 0;
  - release test TST-418106 timed out "waiting for the requirement's page".
- **Counts and filters change** in the release tests TST-472516 and 472518 (their `writes()` counts the batch's
  `POST /graphql`), TST-479201 and 479202 (14 → 16 requests), and in the system tests TST-479101 to 479104. Those release
  tests are changed by a participant who builds none of this item, in ITM-678, before this item's gate (sprint 68's
  agreement).
- **`tests/app-harness.mjs` has no `/graphql` handler**, and its header names no module, so this item may not change
  it. Whether the batch falls back to single reads there, as `readMany` does on a failed batch
  (`src/repository-hosts/index.mjs:133`), or the harness needs the handler, is read at the start. If the harness must
  change, it waits for queue `2026-10-17d`.

## Acceptance

- A call of `queues` on a snapshot of about 60 queues reads in one batch per 100 paths with a token, and the committed test pins it.
- The notifications and UC-019's requirement page behave as on the base.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**At sprint team1/70's start (2026-10-17, po-opus).** akmaier accepted queue `2026-10-17` (`e513ce62`), so
`A PAGE LOAD READS THE REPOSITORY IN BATCHES` is binding. `queues`' reads one by one now break it, and this item is a
SPEC requirement's.
- **The harness question, read.** `tests/app-harness.mjs:90` answers every non-GET it does not handle with status 500.
  The GitHub adapter reads a 500 as `Unreachable`, which `readMany` passes on
  (`src/repository-hosts/index.mjs:133`, `KNOWN_FAILURES`). So on that harness a batch fails the read instead of falling
  back, which is what broke the notifications and TST-418106 in ITM-648's draft.
- **So the harness must serve the batch request.** Its header names no module. Under queue `2026-10-17d`, accepted in
  `45dbf4d8`, it is changed only by the implementation job of the module whose file names it as taken over. That module
  is settled in the migration plan of the code outside the architecture, which this item waits for.

**Plan (2026-10-17):** builds on ITM-574, whose `app-harness.mjs` serves the batch request.
