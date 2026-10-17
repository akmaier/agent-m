# 1. Identity and traceability: the browser's requirements are checked by the tests of the views

**The change.** The *Check* of four requirements names `tests/test_spec_browser.py`. It names instead the test files of
the modules that build what each requirement asks:
- `THE BROWSER SHOWS ANY RELEASED VERSION`, `OPEN PROPOSALS ARE SHOWN IN THE BROWSER` and `A REQUIREMENT SHOWS ITS
  HISTORY` are checked by `tests/trace-pages-specification.test.mjs`. That is the test file of MOD-trace-pages'
  specification view.
- `A REQUIREMENT SHOWS WHAT TRACES TO IT` is checked by the same file and by `tests/trace-graph-guards.test.mjs` and
  `tests/trace-graph-facts.test.mjs`.

No requirement's text changes.

**Why.**
- `tests/test_spec_browser.py` does not exist. `ls tests/test_spec_browser.py` fails, and the same `ls` finds
  `tests/test_step_explanations.py`. No file under `tests/` names it except two fixtures of an old backlog.
- The browser is MOD-trace-pages' specification view, written in JavaScript and tested with `node --test`.
- `grep -rlE` over `tests/` for the four names finds only `A REQUIREMENT SHOWS WHAT TRACES TO IT`. It is in the `Guards`
  of `tests/trace-graph-guards.test.mjs` and `tests/trace-graph-facts.test.mjs`. The grep's known positive is `A
  REQUIREMENT HAS FOUR FIELDS`, found in `tests/spec-document-parse.test.mjs`.
- The other three have no test yet, because the view does not do what they ask. ITM-594 (released versions), ITM-597
  (traces and proposals) and ITM-598 (history) build it, and their tests guard each requirement by name in the view's
  test file.

**Against the rest of the SPEC.** It changes no requirement, only the tests that check four of them. Each named test
states its expected result in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).

**Impact list.**
- ITM-594, ITM-597 and ITM-598. Their acceptance names the requirement each test guards.
- No existing test changes.
