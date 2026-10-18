---
id: ITM-939
title: publishGraph stores the impact lists of the files not accepted, and storedImpacts reads them
level: module
realises:
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - UC-023
modules:
  - MOD-trace-graph
builds_on:
  - ITM-908
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 to compute the dependency walk on the repository side, and docs/measurements/2026-10-18_review-all-on-the-real-network.md
---
# ITM-939 publishGraph stores the impact lists of the files not accepted, and storedImpacts reads them

**REGISTER**

## Outcome

Rests on the draft `c6baba33`, MOD-trace-graph.md:214-226. It starts when akmaier has accepted it, and the quote is checked
against the accepted blob first (sprint team2/93's agreement):
- "With `changed`, the decision and module files of the commit that are not accepted, each with the text it was last
  accepted at and that text's commit (`null` for a file never accepted), as the caller reads them, it adds
  `<commit>.impacts.json` in the same commit".
- `storedImpacts(source, commit)`, "read with the source's `readOn` in one request; `null` without `readOn`, or when the
  branch or the file is missing or holds another format".

ITM-908 builds `publishGraph` without `changed`. This item adds `changed`, the file `<commit>.impacts.json` and
`storedImpacts`.

## Acceptance

- Unit tests that name MOD-trace-graph, over a fake host and a fixture with one changed module file and one new one:
  - `publishGraph` with `changed` adds `<commit>.json` and `<commit>.impacts.json` in one commit. Each entry holds the
    file's path, its blob, `before`'s commit or `null`, and the same list `architectureImpact` gives for that file.
  - `storedImpacts` reads it back in one `readOn`, and gives `null` for a missing branch, a missing file or another format.
- Counter-proof: an impact list computed without the before-text fails the first test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
