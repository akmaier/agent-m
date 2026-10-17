---
id: ITM-674
title: An entry's impact is read from one graph per snapshot
level: module
realises:
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - ITM-648's gate on pull request #715 (docs/gates/20261017-0930-development-release-testing-91e4.md), from developer-sonnet-d's finding
---
# ITM-674 An entry's impact is read from one graph per snapshot

**REGISTER**

## Outcome

`entryView`'s impact builds its own trace graph on every call (`impactOf`), so N open entries build N+1 graphs of
one snapshot. On a host that keeps the blobs it has read, this adds no request, only work. On a snapshot that keeps
none, each build reads the files again: TST-597009's fixture had to avoid that case. Whether the graph is passed in, or
kept per snapshot, is read at the start against `entryView`'s accepted signature. If the signature must change, the item
waits for a draft.

## Acceptance

- N open entries of one snapshot build one graph, and the test counts its reads on a snapshot that keeps none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
