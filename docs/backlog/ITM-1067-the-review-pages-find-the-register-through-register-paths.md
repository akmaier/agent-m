---
id: ITM-1067
title: The review pages find the register's entries through registerPaths
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-review-pages
builds_on:
  - ITM-845
tests:
  - unit
origin:
  - ITM-845's pull request #978 (sprint team1/93), from developer-sonnet-a's finding
---
# ITM-1067 The review pages find the register's entries through registerPaths

**REGISTER**

## Outcome

`src/review-pages/spec-entries.mjs:49` keeps its own rule for the register's entries,
`/^docs\/sources\/[^/]+\.md$/`, beside MOD-source-register's `registerPaths` (ITM-845), which takes
`docs/sources/SRC-<slug>.md`. The two copies already differ: the review pages' also take a file whose name does not begin
with `SRC-`.

**First task:** read whether MOD-review-pages' uses name `MOD-source-register.registerPaths`. If they do not, the item
begins with a draft for akmaier that names it.

## Acceptance

- `spec-entries.mjs` finds the register's entries through `registerPaths`, and keeps no path rule of its own. A test shows
  that a file under `docs/sources/` that is no `SRC-` entry is not read as one, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
