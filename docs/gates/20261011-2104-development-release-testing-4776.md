---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b9d8f40b9777ef5c6bffbb912af072a015040841
  - https://github.com/akmaier/agent-m/pull/427
date: 2026-10-11 21:04 UTC
---
# Development → Release testing: ITM-439, the explanations of deriving the architecture

**REGISTER**

## Reason

ITM-439, pull request #427 by developer-sonnet-b into `sprint/team1/21`, head `b9d8f40`. The first commit `365063e`
holds only `tests/site-frame-architecture-explanations.test.mjs`, and CI was red on it (run 38174425544): its six
tests fail, and no other test does. CI is green on `b9d8f40` (run 38174607972, 1952 tests, 0 failures). The change is
only `src/site-frame/explanations.md`, four topics; the new test names MOD-site-frame and its guards, and 69 faults
are recorded. The Acceptance holds: `explain` gives each new topic, folded, with its text.

The licence statements weighed, each against its named source: without a licence there is no permission, the default
copyright reserving every right, and seeing or forking code on a host grants no use; a permissive licence such as MIT
or Apache-2.0 allows use, change and distribution, even commercially, and mainly asks to keep the copyright and licence
notices; a copyleft licence such as the GPL asks for the source of larger works that use it, under the same licence,
and so can restrict how a product is distributed — what choosealicense.com's pages on no permission and on those
licences say, no more. What Agent M does with a licence — the candidate not known to be compatible marked, a missing,
unknown or restrictive licence named in its row, *not checked* without a `LICENSE` file — is UC-022 7, 7c and 7d and
MOD-reuse-facts' file. That the GPL's condition binds when the work is distributed, which the topic implies through
distribution and does not say, is noted for the review. The book's pointers, ch. 10 and ch. 6 §5, are named.
