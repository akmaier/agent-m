---
id: ITM-637
title: A source's affected requirements are those that name it by any of its names
level: module
realises:
  - UC-015
  - UC-016
  - A REQUIREMENT HAS A REGISTERED SOURCE
modules:
  - MOD-source-register
  - MOD-settings-pages
builds_on:
  - ITM-589
  - ITM-590
tests:
  - unit
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-637 A source's affected requirements are those that name it by any of its names

**REGISTER**

## Outcome

`affectedRequirements(spec, source)` (`src/source-register/index.mjs:281`) matches a source item against the entry's
identifier alone. `linkedVersion` and `sourceFindings` match it through `entryNamed`, by identifier, title or a
standard's designation.

developer-sonnet-e measured the difference on this repository's SPEC:
- for SRC-po-a-maier, 0 requirements by its identifier against 383 by its title;
- for SRC-vibe-coding, 0 against 46.

So on a product whose requirements name their sources by title, UC-015 2b lists nothing before a link is removed, and
UC-016 step 5 marks nothing.

ITM-589's reading, "a title or a designation is not matched", followed the signature, which carried no register. The
draft committed with this item gives the function the register. It then reads an item as `entryNamed` does, so the one
grammar holds for all three functions (nothing twice).

It waits for akmaier's acceptance of that draft. Its callers change with it:
- MOD-settings-pages' `sources` route (`src/settings-pages/sources.mjs:125`);
- MOD-trace-pages, whose Uses name the function for *source changed*.

**Settled at sprint team1/67's start. Selectable.**
- **The modules whose files it changes:**
  - MOD-source-register: `index.mjs`, `affectedRequirements` (:273-281) and its comment at :233;
  - MOD-settings-pages: `sources.mjs`, its call at :125 and its comments at :4 and :20.
- **The grep, full output read:** `grep -rn affectedRequirements src tests docs/architecture` finds:
  - the four places above;
  - the caller's comments;
  - `tests/settings-pages-sources.test.mjs:18`, a comment;
  - `tests/source-register-affected-589.test.mjs`, every case of `affectedRequirements` (:55, :68, :84, :93, :106);
  - the module files: MOD-settings-pages and MOD-trace-pages' Uses, MOD-source-register's interface, ARC-045:87.
- **The expected results that change:**
  - every call in `tests/source-register-affected-589.test.mjs` gains the register;
  - its case at :84, "a title is not matched for an identifier, since the signature carries no register", turns round:
    a title, or a standard's designation, is matched, by the longest name, as `entryNamed` reads it;
  - the developer's run on a draft lists every other changed test before the tests-only commit (sprint 64).
- **The rule is the module's own grammar** (`namesSource`, `entryNamed`, `index.mjs:225-245`). `affectedRequirements`
  calls it and writes no matcher of its own (nothing twice).
- **Reads, against the token budget:** none is added. `sources.mjs` already holds the register it read, and passes it.
- **Reachable** through MOD-site-frame's route `sources`, as `64.md`'s reading takes it.
- ITM-591 and ITM-657 call the new signature.

## Acceptance

- A requirement that names its source by the entry's title, or by a standard's designation, is listed for that source.
- A requirement that names another entry whose name begins with the same words is not listed (the longest match, as `entryNamed`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-source-register's `affectedRequirements(spec, register, source)` (accepted blob de89c5f23334). It is free of drafts; its readings are read at its start.
