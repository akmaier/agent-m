---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5a21c2c50a91a56ff065471dd2fa7368c20210a8
  - https://github.com/akmaier/agent-m/pull/779
date: 2026-10-17 21:19 UTC
---
# Development → Release testing: ITM-839, the recipe report-data and the check people-search

**REGISTER**

## Reason

ITM-839 is pull request #779 into `sprint/team2/79`, at head `5a21c2c5`. Its base is `f61203bf`, the merge of ITM-838.

**1. Red first.** The first commit, `1a994456`, holds only `tests/personal-data-strategies.test.mjs`. Run 39069913552
was red on it: node (3) failed exactly the four new cases, each with a TypeError because `privacyStrategies` did not
exist yet.

**2. Green last.** Run 39070054879 passed ten of ten on its second attempt. Its first attempt failed one case, in
node (2): `#backlog in a browser — tables, panels and the chart keep the heading's margins`. That is a browser layout
case of the backlog page, which this change does not touch, and it passed on the rerun.

**3. Scope.** The pull request changes three files:
- `src/personal-data/strategies.mjs` (new) is a part that the module file names.
- `src/personal-data/index.mjs` gains one line that exports it.
- `tests/personal-data-strategies.test.mjs` (new) names MOD-personal-data in its header.

The new code imports only `eligible` and `finding`, and both are in the module's Uses. No dependency changed.

**4. Tests.** TST-839001 to 839004 each name their module, the requirement they guard, the given input and the expected
result. I replayed all four recorded counter-proofs in a checkout of the head:
- with a part listing the mail's names added, 001 fails;
- with the place check disabled, 002 fails ("PlaceNotAllowed");
- with addresses dropped from the search, 003 fails;
- with the people replaced by words the clean draft holds, 004 fails (and 003 fails too).

After restoring the code, the four cases pass, and all 65 cases of the tests naming MOD-personal-data pass.

**5. Acceptance.** Every line holds:
- `report-data` gives one part per picked piece and puts no person into a part;
- a participant at a place the mailbox does not allow gets `PlaceNotAllowed`, and no part is given;
- `people-search` finds the planted address on line 2 and the planted name on line 3, and finds nothing in the clean
  draft;
- the open values are named in the pull request, and the tests assert only names, lines, kinds and the rule;
- the existing tests are unchanged and green.

**Readings accepted.**
- **Participant, pieces and people are read from `params`.** The `Strategies` contract hands a recipe only
  `(context, params)`. `JobContext` has no field for the receiving participant or for the people, and the runner calls a
  recipe with `context.params`. So `params` is the job's context the module file means, and nothing is invented.
- **A `null` mailbox restricts nothing.** This is what `prepare.mjs` does for the same place check, and `JobContext`
  types the mailbox as `string[] | null`. The runner's own check of each destination stays in force on every job.
- **`PlaceNotAllowed` is built in the module.** `failure` lives in MOD-job-runner's private `registry.mjs`, and its
  `index.mjs` does not export it. Importing it would reach into another module's private file. The local error has the
  same shape: the name, plus `participant`, `place` and `allowed`.
- **The check reads `draft.text` only.** That is right for `rewrite-without-persons`, whose answer schema requires
  `text`.

**Findings for the sprint review** (these do not block this item):
- `propose-issues` also names `people-search`, but its draft is `{ proposals: [{ title, text, … }] }`. The check gives
  that draft no finding, and it does not search titles. Which people of which mail apply to which proposal is not
  stated anywhere in MOD-mail-handling or MOD-personal-data. That needs a module-file decision and an item before
  `mail-batch` is built.
- A recipe call without `params.participant`, and a check without `people`, pass silently. Today the runner's
  destination check covers the first. The second should be a failure of the check's input, named, once the callers
  exist.
