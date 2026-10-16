---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 04bbcad00ef54eb8aa90df2f427e545e9c524cae
  - https://github.com/akmaier/agent-m/pull/628
date: 2026-10-16 20:14 UTC
---
# Development → Release testing: ITM-559, The route draft keeps its subject, and shows findings as compiler messages

**REGISTER**

## Reason

ITM-559 with S11 and S14, pull request #628 into `sprint/team1/51`, at head `04bbcad0`. developer-sonnet-c wrote it, as
`51.md` assigns. It lists the following as read in full: AGENTS.md, SPEC.md, the item, `51.md`, MOD-review-pages,
MOD-prompt-bar, MOD-job-catalogue, MOD-text-tools, UC-019 and chapters 9 to 13.

1. **The tests-only commits are red.** `27190d3a` and `b2a7edb8` were pushed alone. Run 38960174320's failures that are
   not `todo` are exactly:
   - TST-507043 and TST-507044, the form of the findings;
   - TST-507038–042, the subject;
   - TST-377007.

   The logs were saved before they were read. TST-377007 passes on the old code with its old fixture, and fails on the
   old code with its new readable draft, since `converse` cannot read a draft of files. The listing of
   `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38960499593, ten of ten jobs, on its first attempt. GitHub reports the pull request
   mergeable.
3. **The changes stay in the item's module.** `src/review-pages/conversation-draft.mjs` and two review-pages test files.
   Of the existing tests, only TST-377007's fixture changes, as decided in `51.md`, with every expected value kept.
   - ITM-018 passes, and no request reaches the network.
   - The wide run fails only TST-418104 and TST-418115, which ITM-571 changes in the release test, as decided.
4. **Each fault is caught.** Five planted faults are each caught:
   - `paramsFor` without the draft;
   - the old form of a finding;
   - an address not encoded;
   - the route's title in place of the identifier;
   - a subject given for any key.
5. **The Acceptance holds.**
   - **S11.** Where `latestDraft` finds a draft, the route gives its subject: the draft's key and kind, the identifier as
     its title, the draft route `draft/subject=<encodeURIComponent(key)>` (`conversation-draft.mjs:118`), and `paramsFor`
     giving the draft's parameters plus `draft`. Without a draft it gives `null`.
   - **S14.** Each finding left is shown with `formatFinding` (`:39`).

   UC-019's `todo`s TST-377012 and TST-418126 fail before and hold after, under their marks, for ITM-571.

**The interface checked**, as sprint 47 agreed. The route writes `draft/subject=<encodeURIComponent(key)>`, the same
string as `src/review-pages/subjects.mjs:122` and the trace pages' `changing()` in `src/trace-pages/subject.mjs`
(ITM-558). TST-507040 compares the route's with the review pages' own.

**A dependence to keep in mind.** `paramsFor` spreads the draft's own parameters, among them its old `instruction`,
`conversation`, `entry` and `refuses`. The bar's later spread overrides them (`src/prompt-bar/send.mjs:75`). That holds
while `send.mjs` keeps that order. TST-377007 sends the new follow-up, and so shows it.
