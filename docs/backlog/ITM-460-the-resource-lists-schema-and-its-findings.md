---
id: ITM-460
title: The resource list's schema and its findings
level: module
realises:
  - UC-040
  - A PRODUCT DECLARES ITS RESOURCES
  - THE INSTANCE DECLARES ITS OWN RESOURCES
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES
  - A RESOURCE DECLARES ITS LICENCE
  - A RESOURCE NAMES ITS MAINTAINER
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE DECLARES WHERE IT PROCESSES DATA
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
  - COMMIT TESTS CALL NO PAID SERVICE
modules:
  - MOD-resource-list
builds_on:
tests:
  - unit
origin:
  - UC-040 steps 2 to 6, 4a, 4c, 2a
  - MOD-resource-list, Data and Interfaces
---
# ITM-460 The resource list's schema and its findings

**REGISTER**

## Outcome

MOD-resource-list, as its file states it, begun in `src/resource-list/`: `index.mjs`, `resources.schema.md` — the
schema of `docs/resources.md`, the list of a product or of the instance, in MOD-documents' schema language, naming the
rule it applies — and `rules.mjs`; `Resource` and `resourceSchema()`; and `resourceFindings(resources)`, what the schema
cannot express: the pin's form for the kind, a full commit and not a branch name; the columns the kind requires; a
compute route other than `bridge <name>` or `runner:<label>`; an endpoint or agent without its Paid mark; an entry that
carries a participant's capabilities or role; a secret's value where its name belongs; and, as a warning, a maintainer
who is a single person. The other functions of the module are not part of this item.

## Acceptance

- Unit tests that name MOD-resource-list state, before the code exists, on fixture lists of the form the module's file
  shows: the file's example list read with `resourceSchema` without a finding; a kind outside the closed set refused; a
  repository pinned to `main` named; a column its kind requires missing named; a compute route that names neither a
  Bridge nor a runner named; an endpoint without its Paid mark named; a capability or role in an entry named; a secret's
  value in the Secret column named; a single-person maintainer a warning; every finding naming its rule.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.
