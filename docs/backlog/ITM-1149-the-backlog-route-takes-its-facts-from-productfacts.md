---
id: ITM-1149
title: The backlog route takes its facts from productFacts, which reads them as stored for the commit
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-1117
tests:
  - unit
origin:
  - po-opus-b's gate of #1182 (ITM-681), point 4, and akmaier's request of 2026-10-19 to precompile the main pages
---
# ITM-1149 The backlog route takes its facts from productFacts, which reads them as stored for the commit

**REGISTER**

## Outcome

ITM-681's route `backlog` (`src/implementation-pages/backlog.mjs`) reads the declaration, the model, the role
assignments, the sprints, the items and the module files itself. MOD-implementation-pages.md names
`MOD-progress-measures.productFacts` for "the product's facts". Once draft `9a2c9f4a` is accepted and ITM-1117 is built,
`productFacts` reads those facts from the file stored for the commit, in one request. The route takes them from there, so
that `#backlog`'s 11 batches of the 2026-10-19 measurement become one read, and it keeps no second reading of the
facts (AGENTS.md §2, principle 2).

## Not ready: a draft for akmaier

It waits for draft `9a2c9f4a` and for ITM-1117.

## Acceptance

- Over a counting fake GitHub that serves the stored facts of the commit, `#backlog` reads none of the files they come
  from, and shows the same page as without them. Counter-proof: without stored facts it reads the files in batches.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
