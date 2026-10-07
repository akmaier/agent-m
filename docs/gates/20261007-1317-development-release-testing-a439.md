---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - a93dc2e2613dcb7e531192208694dfae5e52fd89
  - https://github.com/akmaier/agent-m/pull/162
date: 2026-10-07 13:17 UTC
---
# Development → Release testing: ITM-248

**REGISTER**

## Reason

ITM-248, the declarations of the tests: pull request #162 by developer-sonnet-b, on head `a93dc2e`, branched from
`sprint/08` at `7815b0a`. What holds:
- The first commit, `94da753`, holds only `tests/test-document-declarations.test.mjs`, and CI was red on it: the module
  did not exist yet.
- CI is green on the head (python and node).
- Only `src/test-document/index.mjs` and `declarations.mjs`, among the module's Parts, and the new test, whose header
  names MOD-test-document, changed.
- The nine new tests name what they guard and the module, and the pull request records counter-proofs that turn each of
  them red.

Why it is rejected: check 5, the Acceptance's "a declaration ending at the first line not of its form", does not hold.
- MOD-test-document's Data: "Its first line names the identifier; each following line is `key: value`", and "A
  declaration ends at the first line that is not a comment line of this form."
- `declarations.mjs` also splits every following line at ` · ` and ends the declaration when a part is no `key: value`.
  So a following line whose value holds ` · ` — a line of the form — ends it, and that key and every line after it are
  lost.
- Run on the head:
  - the module file's own example is read with every key;
  - the same declaration, with `// expect: the notification "UC-047 waits for your acceptance · akmaier/agent-m"` and
    `// runs: 1` after it, is read with `expect` and `runs` null. UC-047's notification text holds exactly such a ` · `.

Noted, no reason by itself: the gap the pull request names. The file types `level` and `guards` without `null`, while
`testDeclarations` reads a missing key as `null`.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-249, ITM-254,
ITM-256, ITM-257 and ITM-239 build on it.
