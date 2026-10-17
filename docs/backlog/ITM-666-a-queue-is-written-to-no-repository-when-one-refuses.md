---
id: ITM-666
title: A queue is written to no repository when one refuses
level: module
realises:
  - A GENERATED ARTIFACT IS A PROPOSAL
modules:
  - MOD-spec-changes
builds_on:
  - ITM-636
tests:
  - unit
origin:
  - ITM-636's gate on pull request #707 (docs/gates/20261017-0814-development-release-testing-4a9c.md), from developer-sonnet-a's finding
---
# ITM-666 A queue is written to no repository when one refuses

**REGISTER**

## Outcome

The writer `queue-entries` writes a queue to the product's repository and to the instance's. Since ITM-636 it composes
both before the first commit, so a `TwoChanges` writes nothing. Other refusals of the second repository still come after
the first is committed: `RationaleInvalid`, `NoHost` and `Moved`. They leave the first repository's queue written and the
second's not. Every refusal it can know before writing is checked for both repositories before the first commit.

**Settled at sprint team1/69's start, on `sprint/team1/68`'s code, which is `main`'s once #711 is merged. Selectable.**
- **The module whose files it changes:** MOD-spec-changes, `propose.mjs`, the writer `queue-entries`.
- **What it can know before writing.**
  - `NoHost` (no host for a repository) and `RationaleInvalid` (a rationale that breaks its schema) depend only on the
    draft and the context, so both are checked for both repositories before the first commit, as `TwoChanges` already
    is.
  - `Moved` is the server's answer to a commit whose expected head moved. It is known only by committing, so it stays
    where it is. The item's "every refusal it can know before writing" does not include it.
- **The error fields** (sprint 68): `NoHost` and `RationaleInvalid` exist and carry no field beyond their `name` and
  message, so nothing collides with `failure`'s spread.
- **The grep, full output read:** `grep -n "RationaleInvalid\|NoHost" src/spec-changes/propose.mjs` finds the writer's
  throws and those of `proposeSection` and `saveEntry` (:383, :419), which are other functions and stay. The tests of
  the writer are `tests/spec-changes-queue-entries.test.mjs`.
- **Reads, against the token budget:** none added. The same snapshots are read, and only checked earlier.
- **Reachable:** every derivation's write through the panel.
- **Sprint 68:** no release test is among the tests it is known to change. If the draft run finds one, the developer stops
  and reports it, and a separate item by another participant changes it first.
- **Sprint 64:** the developer's draft run over the modules' tests and their callers' lists every changed test before the
  tests-only commit.
- **Sprints 65 to 67:** DOM assertions compare booleans or strings, each shell command does one action, no refusal is
  worked around, and a module header the item touches loses its item history.

## Acceptance

- A refusal of the second repository that can be known before writing leaves neither repository written.
- Its counter-proof: the per-repository order planted back writes the first repository and fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
