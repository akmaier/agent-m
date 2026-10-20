---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - a9619c36e4115ee908aac4633d9446ed1f1af75a
  - https://github.com/akmaier/agent-m/pull/1197
date: 2026-10-20 11:44 UTC
---
# Development → Release testing: ITM-1139, rejected — the implementer changed a release test of the behaviour

**REGISTER**

## Reason

ITM-1139 (MOD-prompt-bar), pull request #1197 into `sprint/team1/97`, is rejected on `a9619c36`.

**What holds.**
- Three commits, all with the trailer `developer-sonnet-d`. `a9619c36` merges `sprint/team1/97`, and its `--cc` prints
  nothing.
- **The red,** run 39415801301 on `8c95ca69`: `# fail 1`, exactly TST-1139001.
- `290d265a` changes only `src/prompt-bar/bar.mjs`: *Send* returns unless `event.isTrusted === true`. That meets the
  Acceptance and SPEC.md:986.
- CI passes 20 of 20 checks on the head (run 39416556829).
- The tests that `8c95ca69` changes so that they press *Send* as a person are of level `unit`, `component` and
  `system`. The implementer may change them, and that includes the helpers `uc-019-prompt-bar-harness.mjs` and
  `uc-049-world.mjs`.

**What fails.**
- `8c95ca69` also changes `tests/test_conversation_not_recorded.py`, whose header names level `release` and
  MOD-prompt-bar. It changes how that test presses *Send*.
- *Send* is the behaviour that developer-sonnet-d implemented in this item.
- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503): a test of level `release` is written by a
  participant other than the one that implemented the behaviour it tests.

**What passes on the next head.**
- developer-sonnet-d gives that file back its text of `1d9cd123`, in a commit on this branch. Nothing else changes, and
  the head is gated again.
- developer-sonnet-e, who implemented none of *Send*, changes the release test in a pull request of its own into
  `sprint/team1/97`, as #1085 did for ITM-726. Release tests run only on the sprint's pull request into `main`, so the
  sprint branch stays green meanwhile.
