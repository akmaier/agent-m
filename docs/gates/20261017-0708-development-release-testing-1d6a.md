---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 17f4b30df220bd7bf10000602f21ea66de9605da
  - https://github.com/akmaier/agent-m/pull/701
date: 2026-10-17 07:08 UTC
---
# Development → Release testing: ITM-637, A source's affected requirements are those that name it by any of its names

**REGISTER**

## Reason

ITM-637, pull request #701 into `sprint/team1/67`, at head `17f4b30d`. developer-sonnet-e wrote it.

**Red.** The tests-only commit `b20b531c` was red in run 39012052187 (`failure` on `b20b531c`):
- node (0): `# fail 9` and `# todo 1`, the existing ITM-369-1. The failures are TST-589001 to 589005, which change with
  the signature as the item named, and the new TST-637001 to 637004.
- node (5): `# fail 1`, TST-637005, the `sources` route.

They fail on behaviour, since the function existed. TST-589003, the case the item said turns round, had its expected
value set before the red.

**The code, read in the diff.**
- `affectedRequirements(spec, register, source)` takes `entryNamed(register, source)`. It gives `[]` when that names no
  entry, and otherwise the requirements whose items `entryNamed` reads as the same entry.
- No matcher of its own is written, and `namesSource` stays private (nothing twice).
- `sources.mjs:125` passes the register it already read, and its comment states the new reading.

**What else holds.**
- CI is green in run 39012297328 on the head, and the pull request is mergeable.
- Four planted faults are caught.
- The draft run over 371 tests changed only TST-589001 to 589005.
- ITM-018 and the related release and system tests pass.
- **Measured on this repository's SPEC:** SRC-po-a-maier gives 383 requirements on the head, where the base gave 0 by its
  identifier. SRC-vibe-coding gives 46, where the base gave 0. So UC-015 2b now lists what it should.
- **No read is added** (sprint 66's agreement). The page sends 13 requests after opening, and 13 after four unticks.

**Readings taken.**
- **An unregistered identifier gives `[]`.** The accepted text reads "an item names it when the register entry the item
  names … is the entry `source` names". A `source` that names no entry names none, so no requirement is affected. The
  base's prefix match of the bare identifier is gone. It is an altered behaviour, and TST-637003 tests it (sprint 62's
  agreement).
- **A `source` given as an item** (TST-637004) is read through `entryNamed`, as `linkedVersion`'s text gives it ("an
  identifier, or an item of a requirement's source"). The accepted text of `affectedRequirements` says "the entry
  `source` names", which that reading meets, so the test stands.

**Findings** (sprint 63's agreement):
- **The test file's name**, `source-register-affected-589.test.mjs`, now holding TST-637 tests too: no item. A file's
  name is not a fact the SPEC or the module asks for.
- **The history in `src/source-register/index.mjs`'s header** ("ITM-589 adds …", and "a new version … not built yet",
  which is no longer true) is registered as ITM-660. The same kind of header stands in other modules (61 item ids in
  `src/*/index.mjs`). Each is for the next item that changes its module, and this point is for sprint 67's
  retrospective.
- **Process:** guard refusals were met with plain, separate commands, and nothing was disguised. That is sprint 66's
  agreement kept.
