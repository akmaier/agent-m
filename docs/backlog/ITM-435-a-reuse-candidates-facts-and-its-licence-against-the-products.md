---
id: ITM-435
title: A reuse candidate's facts, and its licence against the product's
level: module
realises:
  - UC-022
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
modules:
  - MOD-reuse-facts
builds_on:
  - ITM-434
tests:
  - unit
origin:
  - UC-022 step 7, 7a, 7b, 7c, 7d
built_by:
  - 2bc299c5c22833c2b3fc30e6ff47950b48e5f323
  - e64190f8e3e8eda02790ac8440d26da07bcd7cfc
---
# ITM-435 A reuse candidate's facts, and its licence against the product's

**REGISTER**

## Outcome

MOD-reuse-facts, as its file states it, begun in `src/reuse-facts/`: `Candidate`, `Fact` and `DueDiligence`;
`registries.md`, the public addresses read for each fact on npm, PyPI, crates.io and Maven Central, and `licences.md`,
the candidate licences known to be compatible with each product licence, as data; `licenceVerdict(candidate, product)`;
and `registryFacts(candidate, productLicence)` — whether it exists, its licence, its first and its latest release with
its date and the number of releases, its open and closed issues through its source repository's host without a token
(ITM-434) and where they are filed, and its adoption, each fact with its address and the date it was read; a candidate
not found with `found: false` and the address queried; a registry that refuses a browser's call with `blocked` naming it
and the reason, and no facts. It never fills in a fact it did not read. `hubFacts` (UC-040) and the step `due-diligence`
(ITM-436) are not part of this item.

## Acceptance

- Unit tests that name MOD-reuse-facts state, before the code exists, with fake registries and a fake repository host:
  each fact of an npm and of a PyPI candidate with its address and date; an unknown candidate not found, with its
  address; a refused call `blocked`, with no facts; `licenceVerdict` giving *not known to be compatible* for a GPL-3.0
  candidate of an MIT product, *compatible* for an MIT one, and *not checked* without a product licence.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/reuse-facts/` and the tests that name MOD-reuse-facts change.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-435001 to 435005 (`tests/reuse-facts.test.mjs:135-265`) state an npm and a PyPI candidate's facts with address and date, an unknown candidate not found with its address, a refused call `blocked` with no facts, and `licenceVerdict`'s three answers; they pass on `main`; `src/reuse-facts/index.mjs:152` (`licenceVerdict`), `:298` (`registryFacts`); built in team 2's sprint 28. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
