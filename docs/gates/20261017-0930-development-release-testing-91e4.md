---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ed13797cbe9873f928860e004fc1c38af46cf7f8
  - https://github.com/akmaier/agent-m/pull/715
date: 2026-10-17 09:30 UTC
---
# Development → Release testing: ITM-648, An opened requirement shows the open proposals that touch it

**REGISTER**

## Reason

ITM-648, pull request #715 into `sprint/team1/69`, at head `ed13797c`. developer-sonnet-d wrote it.

**What holds.**
- **Red.** The tests-only commit `d4203a56` was red in run 39020340306 (`failure` on `d4203a56`). Node (5) has `# fail 9`:
  TST-597015 and 597202, the changes the item named, and TST-648001 to 648006 and 648201.
- **CI and merging.** CI is green, ten of ten in run 39021139210, and the pull request is mergeable.
- **The rule.** The view lists the SPEC's open entries whose `entryView(...).impact` names the requirement, with their
  state and the 5c note. It shows nothing at a tag, and has no rule of its own.
- **Other checks.** Seven planted faults are caught. TST-472516, 472518 and 473167 pass. The fetch spy saw no call, and
  ITM-018 passes.
- **The readings are taken:**
  - "open" is any state but "in SPEC";
  - only entries whose target is `SPEC.md` are asked;
  - 5c's note starts at two entries;
  - the entry's address is `spec-entry` with `spec-<queue>-<NN>`.

**Rejected: the reads at this repository's scale, against sprint 66's agreement and akmaier's words.**
- akmaier's words, recorded in ITM-574 (`:16`): "The excessive use of token requests is still a problem that needs to be
  fixed."
- `queues` (`src/spec-changes/queues.mjs`) reads one by one through `snapshot.read`, without `readMany`: each queue's
  `index.md` (:216) and `entscheidungen.md` (:116-117), each record (:168), proposal (:179) and target (:192).
- This repository has 56 queues (`ls docs/spec-freigaben | wc -l`), so a first opening of a requirement at a version
  costs more than 112 requests. With a token they are API calls on the person's budget.
- This is the cost class I rejected ITM-598 for. The fixture's 4 → 7 does not show it, and the developer's measurement
  at scale was refused by the guard. The developer stopped, as the agreement asks.
- **The fix is in MOD-spec-changes' `queues`, without a draft.** It gathers the paths it will read and reads them first
  through `Snapshot.readMany`, which is MOD-repository-hosts' interface and in MOD-spec-changes' Uses. With a token that
  is one GraphQL batch per 100 paths. MOD-spec-changes joins ITM-648's modules for it; ITM-666, which changed the same
  module this sprint, is merged into the sprint branch.

**What is asked, in new commits on #715, nothing rewritten.**
1. **A committed test** (sprint 67's form): a fixture snapshot with many queues, say 60, each with entries, records and
   proposals. It counts the snapshot's requests for a first opening. Run red against the head's `queues`, it shows reads
   that grow with the queues.
2. **`queues` reads through `readMany` first**, so that the count is one batch per 100 paths with a token. The test pins
   it.
3. The draft run lists any test this changes, and stops at a release test (sprint 68).

**TST-597009, not named, is accepted.** Its fixture was changed to files without queues, with the same expected value. It
avoided a snapshot that keeps no reads, where each `entryView` builds its own graph. A real host keeps blobs, so no
request is added. The N+1 builds are registered as ITM-674.

**Findings** (sprint 63's agreement):
- **One trace graph per `entryView` call:** ITM-674.
- **`queues` and `entryView` ignore `until`:** ITM-675.
- **The live `#spec` page load and the route both read the queues' files:** recorded in ITM-574, since the page load's
  reads are in `docs/assets/`, which waits for queue `2026-10-17d`.
- **`entryView` names an existing requirement "added" when the anchor is missing:** ITM-676.

**Process.** Four scratch scripts were refused, and nothing was worked around, as sprint 66's agreement asks. The
committed test asked above is the form in which the measurement can be made.
