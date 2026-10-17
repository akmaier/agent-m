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

## Acceptance

- A requirement that names its source by the entry's title, or by a standard's designation, is listed for that source.
- A requirement that names another entry whose name begins with the same words is not listed (the longest match, as `entryNamed`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
