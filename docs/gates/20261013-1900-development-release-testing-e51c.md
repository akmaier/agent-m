---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ec47138baa4eb6c1037c491759fde703f7f8c3ac
  - https://github.com/akmaier/agent-m/pull/493
date: 2026-10-13 19:00 UTC
---
# Development → Release testing: ITM-472, Each test case of the modules carries its declaration

**REGISTER**

## Reason

ITM-472, pull request #493 by developer-sonnet-c into `sprint/team1/27`, head `ec47138`, one commit. The item adds no
behaviour and no test, so its first commit need not be red, as its Acceptance says. CI is green (run 38450671463).

Scope: 253 files under `tests/`, each naming one of the item's modules; nothing else changed.

No code changed:
- Every code and string token is identical between `fbc8bf0` and the head: the 244 `.mjs` files compared with acorn's
  tokenizer, the 9 `.py` files with `tokenize`.
- I first planted a line inside a template string and inside a docstring, and the comparison caught both.
- So no expected result and no fixture changed, including in the release tests, which a pull request into a sprint's
  branch no longer runs.

The Acceptance holds:
- Read as `test-declarations` reads a file, the changed files hold 1656 declarations.
- `testFindings` finds nothing in them. It was first shown to catch a deleted `expect:` line.
- No identifier is used twice in `tests/`.
- Every test case of the files in scope is declared. The only exceptions are four `test(` lines inside template-string
  fixtures, which are not cases.
- The files left without declarations name in their header only modules outside the item, or none, so the item leaves
  them out.

Joining multi-line comment lines into one line each changes existing comment lines, not only adds them. The Acceptance
forbids changing code and expected results, and neither changes. The words stay, apart from the labels
"Precondition"/"Expected" becoming `given`/`expect`.

Noted for the review:
- At level `system`, `release` or `user` the declarations name the header's module, as the item's Outcome asks.
  MOD-test-document's Data asks for the word `system` there. The two accepted texts differ.
- 35 cases declare MOD-work-items, which has no module file, as their file names it.
- `tests/dashboard-product-store-migration.test.mjs`: its declarations `level: integration` and
  `module: MOD-dashboard-app` were corrected to the header's `component` and MOD-browser-store, and its label `TST-266A`
  was replaced.
- About 130 cases' `given`, `input` and `expect` were read from their titles and code. The cases of UC-042 in
  `dashboard-review-flows.test.mjs` were checked least.
