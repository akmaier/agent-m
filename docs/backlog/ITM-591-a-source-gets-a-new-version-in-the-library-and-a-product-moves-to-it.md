---
id: ITM-591
title: A source gets a new version in the library, and a product moves to it
level: module
realises:
  - UC-016
  - UC-004
modules:
  - MOD-settings-pages
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

## Acceptance

- *+ New version* is refused when its bytes equal an existing version's.
- The products still on older versions are shown.
- *Move* lists the affected requirements and the changed passages, then commits `docs/sources.md` with a message that names those requirements.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-settings-pages' Uses with `MOD-source-register.readContent` (accepted blob b94701420bcf). It is free of drafts; its readings are read at its start.
