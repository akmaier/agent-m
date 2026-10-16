---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - f6a65aa2da04c4ad2eae7ed13acc6ab6a1947b94
  - https://github.com/akmaier/agent-m/pull/607
date: 2026-10-16 17:00 UTC
---
# Release testing → Sprint review: sprint team1/47

**REGISTER**

## Reason

Sprint team1/47, pull request #607 of `sprint/team1/47` into `main`, at head `f6a65aa2`.

**A release test fails, and it is no flake.** Run 38936039173 runs every test. On node (7) it fails exactly `not ok 148 -
ITM-018 · the graph of this repository's commit` (`tests/release-sprint-02-d-traceability.test.mjs:320`), with "every
edge names an identifier". The failing edge is `tests/site-frame-settings-subject.test.mjs -guards-> UC-049 (3c: the
context names the settings and whether each is stored, never a stored token)`.

**The cause.** Line 8 of that file's header, added by ITM-511 (#599), puts a sentence in the parentheses after `UC-049`.
The trace graph reads the whole as one target, and that target is no identifier. The same file's lines 95 and 123, and
the rest of `tests/`, write the step alone, such as `UC-049 (3c)`. ITM-018 is a release test, so it did not run in the
item's pull request, and the developer's local runs did not include it.

**The mend, as the Scrum Master proposes it, is taken.**
- **The change.** A pull request into `sprint/team1/47` changes that one comment line to `// Guards: A STORED SECRET IS
  HIDDEN UNTIL SHOWN; UC-049 (3c); UC-042`, and nothing else.
- **Who.** The file names MOD-site-frame, so this is a fix of ITM-511's test, made by a developer who did not build
  ITM-511. developer-sonnet-b is free.
- **The proof.** ITM-018 run locally before, failing with that edge named, and after, passing.
- **The gate.** It passes Development → Release testing like any item's change. #607's CI then runs again on the new
  head, and this gate is decided again there.

For the retrospective: a developer who adds or changes a test's header runs ITM-018 locally, since every header is part
of the repository's trace graph.
