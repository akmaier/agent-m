---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 941922c1b13fa1c6d0eceda4f46a86973a33eb98
  - https://github.com/akmaier/agent-m/pull/451
date: 2026-10-12 21:12 UTC
---
# Development → Release testing: ITM-460, the resource list's schema and its findings

**REGISTER**

## Reason

ITM-460, pull request #451 by developer-sonnet-b into `sprint/team1/23`, head `941922c`. The first commit `66e73f7`
holds only `tests/resource-list-schema.test.mjs`, and CI was red on it (run 38305466031): the file fails as a whole, the
module it imports not existing yet, and no other test fails. The code `e568532` was red only in python, on the NO SERVER
line the change between jobs #455 has since added; with `sprint/team1/23` merged in (`a024503`) and the schema file's
convention stated (`941922c`), CI is green (run 38308812065, 2164 tests, 0 failures). Only `src/resource-list/` and the
new test differ from the sprint's branch; the test names MOD-resource-list and its guards, and 29 faults are recorded.
The Acceptance holds, case by case, every finding naming its rule.

The readings weighed: the schema names its rule, `A PRODUCT DECLARES ITS RESOURCES`, the requirement of the list it
reads, as MOD-documents asks of every schema; `—` is the left-out value the module file's table gives, so a column it
fills stands as given; a finding's line is the entry's place in the table; a Secret that is neither `ci:<NAME>` nor
`browser` is taken as a value and never repeated in a finding (`A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE`); and
a single-person maintainer — one `@<account>` or one `person <name>` — is a convention the module file does not give,
now stated in `resources.schema.md`, the module's own data file, and noted for the review.
