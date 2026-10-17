---
id: ITM-591
title: A source gets a new version in the library, and a product moves to it
level: module
realises:
  - UC-016
  - UC-004
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-589
tests:
  - unit
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-591 A source gets a new version in the library, and a product moves to it

**REGISTER**

## Outcome

UC-016 steps 1, 3, 4 and 5, with 4a and 1a, on the page; its second postcondition; and UC-004 1a: "offers to add a new version instead". `versionCommits` and `SameBytes` are built (ITM-385). The page part is not (`src/settings-pages/library.mjs:3-4`).

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-590's merge.**
- *Move* changes a link's version in a product's `docs/sources.md`, which ITM-590's route writes. It calls that code, so
  the link's write is not built twice.
- `versionCommits` with `SameBytes`, `affectedRequirements` and `changedPassages` are built and in MOD-settings-pages'
  Uses.
- **Reached** as ITM-590 reads it.

**Read at sprint team1/65's start: it waits for akmaier's acceptance of the draft committed with that start.**
- ITM-590 is merged (#684), so ITM-590 no longer holds it.
- *Move* lists "the changed passages". `changedPassages(before, after)` needs the two versions' texts, and only
  MOD-source-register's `readContent` gives a version's content. MOD-settings-pages' Uses do not name `readContent`.
  The grep's known positive is `readContent` in MOD-source-register's file at :36 and :166.
- So the draft adds `MOD-source-register.readContent` to MOD-settings-pages' Uses, for the passages *Move* lists.
- The rest is read for its start:
  - *+ New version* goes through `versionCommits`, committed through the module's own `commitTo`.
  - `SameBytes` is the refusal.
  - UC-004 1a's text at `library.mjs:241` becomes an offer.
  - The products are those this browser keeps, each read through its host.
  - *Move* writes through ITM-590's `sources.mjs`.
  - A file that is only hashed waits for ITM-576.
  - `affectedRequirements` is called as it stands until ITM-637.

**Settled at sprint team1/71's start, now that `readContent` is in MOD-settings-pages' accepted Uses (`b43da779`).
Selectable.** The readings above hold. Since ITM-576, *+ New version* also asks for a hashed-only file's note.
- **Reads, against the token budget** (sprints 66 and 69):
  - Opening `library/<source>` lists the products on older versions. It reads each kept product's `docs/sources.md`:
    one snapshot (two requests) and one read per product.
  - *Move* reads the two versions' contents through `readContent`, on a click.
  - **The measurement asked** (sprint 67): a committed test counting the requests of opening the page with two kept
    products, and of one *Move*.
- **Error fields:** `SameBytes { version }` and `NoteMissing { file }` carry no field that collides with `failure`'s
  spread.
- **Release tests:** none of UC-016 exists (ITM-639 is UC-015's). The draft run stops at any release test it changes.
- **Sprints 68 and 70:** a release test among the changed tests stops the developer, who reports it, and the whole release
  file is run on the draft.
- **Sprints 64 to 67:** the draft run lists the changed tests; one action per shell command; DOM assertions compare
  booleans or strings; no refusal is worked around; a header the item touches loses its item history.

## Acceptance

- *+ New version* is refused when its bytes equal an existing version's.
- The products still on older versions are shown.
- *Move* lists the affected requirements and the changed passages, then commits `docs/sources.md` with a message that names those requirements.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-settings-pages' Uses with `MOD-source-register.readContent` (accepted blob b94701420bcf). It is free of drafts; its readings are read at its start.

**Added at ITM-576's gate (2026-10-17, po-opus).** `versionCommits` now refuses a file not kept that has no note (`NoteMissing`). So *+ New version* asks for the note of a file only hashed, as the registration form does since ITM-576, and shows the module's refusal. A file that is only hashed no longer waits for ITM-576.

**At its gate on #723 (`docs/gates/20261017-1055-development-release-testing-d40b.md`): MOD-site-frame joins its modules,** for the topics `source-new-version` and `source-move` that *+ New version* and *Move* fold (`EVERY STEP EXPLAINS ITSELF`).
