---
id: ITM-890
title: A proposed case names the paid service it calls
level: module
realises:
  - UC-026
  - COMMIT TESTS CALL NO PAID SERVICE
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - po-opus-b's settling of ITM-851's question at sprint team2/89's start, 2026-10-18
---
# ITM-890 A proposed case names the paid service it calls

**REGISTER**

## Outcome

UC-026:94-96: "A case that would call a paid service carries the recorded or constructed response it uses instead, and
is marked for the nightly run if it also needs the real call." The answer of `propose-tests`
(`src/job-catalogue/kinds/propose-tests/answer.schema.json`) has `response` and no mark of the service. A proposed case
gains `paid`, the name of the paid service it really calls, if any — the key a test declaration uses for the same
(MOD-test-document.md:61) —, and the kind's `prompt.md` asks for it in one sentence. ITM-851's check reads it.

## Acceptance

- The schema accepts a case with `paid` naming a service and a case without it, and refuses a `paid` that is not a
  string; the prompt names the key. Expected values literal.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/job-catalogue/kinds/propose-tests/` and the tests that name MOD-job-catalogue change.
