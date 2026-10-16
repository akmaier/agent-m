---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d1e223ae60530fccb56d0764d12379efa2d7e401
  - https://github.com/akmaier/agent-m/pull/606
date: 2026-10-16 16:55 UTC
---
# Development → Release testing: ITM-514, UC-019's flows through the prompt bar are covered

**REGISTER**

## Reason

ITM-514, pull request #606 into `sprint/team1/47`, at head `d1e223ae`. developer-sonnet-e wrote it, and implemented none
of ITM-507, ITM-508 or ITM-551 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). It lists the following as read in
full: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `47.md`, UC-019, UC-049, MOD-review-pages,
MOD-trace-pages, MOD-prompt-bar and MOD-site-frame.

1. **No red commit is required.** These are tests of built behaviour, which the item allows. The counter-proofs: 29
   faults planted in a copy of `src/` each fail their named test, and the copy is restored byte for byte. Two faults
   first had no effect and were rewritten until they were caught.
2. **CI is green on the head**: run 38935408300, ten of ten jobs. GitHub reports the pull request mergeable. It is one
   commit on `5ba1a742`, with no force-push.
3. **The changes stay in the item's scope.** Exactly the four UC-019 test files change. A search of them for `/prompt`,
   `requirements-prompt`, *Change by prompt* and `prompt=1` finds nothing. The same search finds three hits of *Change by
   prompt* in `tests/system-uc-019-change-requirements-by-prompt.test.mjs` on the sprint branch, as the known positive.
   So ITM-551 may remove the old routes.
4. **The release tests, before and after.**
   - `release-uc-019-change-by-prompt`: 2 pass and 7 todo before, 24 pass and 1 todo after.
   - `release-uc-019-change-requirements-by-prompt`: 24 pass before, 39 pass and 3 todo after.

   The system files give 49 pass and 6 todo, steadily over three runs. The tests drive the real frame, views, prompt bar,
   job runner, runtimes and host, against in-memory servers. The `fetch` spy saw only those servers and loopback.
5. **The Acceptance holds.** Each pending finding is either replaced by executable evidence or kept as a finding that
   names what the code does instead. Each finding is a `todo` test that fails now, beside a passing known positive. Only
   test files change.

## The findings it leaves, and where each goes

Each finding is a defect or a gap of code already built:
- **S7 and S8 → ITM-558** (MOD-trace-pages).
  - S7: from the specification browser the draft cannot be reached. Its subject gives `draft`, where MOD-prompt-bar
    asks for "the route of the review pages that shows a draft of this subject". ITM-507 writes that as
    `draft/subject=<key>`, and ITM-508 does not.
  - S8: from the specification browser, a message without the person's source is sent, where UC-019 4b sends nothing.
- **S11 and S14 → ITM-559** (MOD-review-pages).
  - S11: the route `draft` has the default subject, so a follow-up offers no *Review the draft*.
  - S14: the draft's findings do not read as a compiler message. MOD-text-tools' `formatFinding` is not among the review
    pages' uses, so a draft adds it.
- **S9 and S13 → ITM-560** (MOD-prompt-bar).
  - S9: a participant that cannot draft text is offered, and refused only on *Send*.
  - S13: the round limit is not named before the first round.
- **S10 → ITM-561.** "Context too small" names tokens and a larger participant, where UC-019 names the number of
  requirements or use cases.
- **S12** is ITM-505, already registered.
- **S15 → ITM-562** (MOD-site-frame). The topic `prompt-bar` lacks UC-019 step 1's examples.

A temporary path outside the scratchpad was made once by a typo and removed at once. That is the sixth such slip; it goes
to the retrospective.
