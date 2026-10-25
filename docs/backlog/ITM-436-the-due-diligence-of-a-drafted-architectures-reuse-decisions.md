---
id: ITM-436
title: The due diligence of a drafted architecture's reuse decisions
level: module
realises:
  - UC-022
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - A PRODUCT DECLARES ITS LICENCE
modules:
  - MOD-reuse-facts
builds_on:
  - ITM-435
tests:
  - unit
origin:
  - UC-022 step 7, 7a, 7b, 7c, 7d
built_by:
  - 3cf6d450d195910f42d0759b55e0565593e7d93d
  - 855ab2deab9fcb8faa5acb55fcf0c59fcbce28cc
---
# ITM-436 The due diligence of a drafted architecture's reuse decisions

**REGISTER**

## Outcome

MOD-reuse-facts' `reuseStrategies` with the step `due-diligence`, as its file states it: for every reuse decision of a
drafted architecture — one that names a chosen candidate and its alternatives by name and ecosystem —, the facts of each
read with `registryFacts` against the licence of the product's `LICENSE` file from the job's context, and the
due-diligence section added to the decision with `appendSection`; a candidate not found leaving the warning the file
defines; a registry that could not be read leaving the decision without its section and with the mark the file defines,
which the writer `open-files` refuses (ITM-336); without a `LICENSE`, every row *not checked* and the section saying
why. MOD-job-runner runs it where the kind `derive-architecture` names it.

## Acceptance

- Unit tests that name MOD-reuse-facts state, before the code exists, with fake registries over a fixture draft: a
  decision with two candidates gaining its section, every fact with its address and date; a GPL-3.0 candidate of an MIT
  product marked; an unknown candidate's warning; a blocked registry's mark — an error under `A REUSE DECISION RECORDS
  ITS DUE DILIGENCE` on the line that names the candidate —; without a `LICENSE`, *not checked* in every row.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/reuse-facts/` and the tests that name MOD-reuse-facts change.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-436001 to 436004 (`tests/reuse-facts.test.mjs:276-356`) state the section a decision gains, the GPL-3.0 mark, the unknown candidate's warning, the blocked registry's error mark and *not checked* without a `LICENSE`; they pass on `main`; `src/reuse-facts/index.mjs:642` (`dueDiligence`); built in team 2's sprint 29. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
