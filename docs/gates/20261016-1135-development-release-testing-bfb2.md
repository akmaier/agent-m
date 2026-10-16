---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 62f1651e5bdb36552452a6b0a037277939de6da9
  - https://github.com/akmaier/agent-m/pull/571
date: 2026-10-16 11:35 UTC
---
# Development → Release testing: ITM-504, The prompt bar offers its participants and sends a message as a job in this tab

**REGISTER**

## Reason

ITM-504, pull request #571 into `sprint/team1/40`, at head `62f1651e`. developer-sonnet-a made the three commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `40.md`, MOD-prompt-bar and UC-049 as read in full.

1. **The red commit.** The tests-only commit `9416f730` was pushed alone, and CI was red on it (run 38893928970). Both new
   files failed at load, on the missing export `currentJob`. Sprint 33's agreement asks that such a commit be run once
   against an uncommitted stub, and the pull request lists no such run. So I ran it:
   - with stand-ins of `startPromptBar`, `latestDraft`, `currentJob`, `offeredAmong`, `placeOf`, `readParticipants` and
     `whyNot` answering nothing, 17 of the 19 tests fail on behaviour;
   - the two that pass guard empty states: no job running, and nothing drawn with no participant.
   So the commit is red for the item. TST-600033 came later, in the rework, with its own counter-proof.
2. **CI is green on the head**: ten of ten jobs. The pull request is mergeable. Locally, 25 tests of MOD-prompt-bar pass,
   ITM-503's five among them. No release or system test of UC-049 exists yet (ITM-513).
3. **The changes stay in the item's scope.** `bar.mjs`, `offer.mjs`, `send.mjs` and `index.mjs` in `src/prompt-bar/`, and
   two new test files that name MOD-prompt-bar. `record.mjs` and every existing test are unchanged. The rework removed
   the import of `formatFinding`, which MOD-prompt-bar's Uses does not name.
4. **The new tests.** TST-600010 to TST-600015 and TST-600020 to TST-600033 state their values in their own text, and
   their counter-proofs are recorded in #571.
   - Removing the `reachedThrough` guard fails no test, because a route `through <x>` matches neither route an offered
     participant needs.
   - The guard is redundant but kept, since MOD-prompt-bar's file names it. This is no gap in the tests.
5. **The Acceptance holds, with the values the start decision named.**
   - The bar offers participants by route and store, and draws nothing with none.
   - It names every destination with its place before it sends.
   - It sends nothing while a reason holds.
   - It shows the answer with its rounds and findings, and keeps a draft and leads to its route.
   - *Stop* aborts the job.
   - It appends the record only with recording on; a planted write with recording off is caught.

**Readings the developer named, within the accepted texts.**
- **A third tab value, `prompt-bar:records`,** keeps each repository's record path, whose random digits must survive a
  change of page. MOD-prompt-bar says the conversation is kept "in the tab's values" and names no list of keys. The start
  decision named two keys and does not forbid a third.
- **`tabContext` is built twice,** with `kind: null` for `prepareJob`, which reads the kind by name, and with
  `prepared.kind` for `runOnTab`. So `kindOf`, which the bar's Uses does not name, is not imported.
- **`reviewers: []`**, and a hand-over is shown without *Hand over* (ITM-505).
- `explain("prompt-bar")` is empty until ITM-530.

Noted for the retrospective: the stub run that sprint 33 agreed was missing from the pull request, and the Product Owner
made it at the gate.
