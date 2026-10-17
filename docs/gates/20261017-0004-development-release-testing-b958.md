---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c2925bec431f6b1708bdd4f87e8e1acaf9c3edad
  - https://github.com/akmaier/agent-m/pull/656
date: 2026-10-17 00:04 UTC
---
# Development → Release testing: ITM-626, A hand-over gives each kind the parameters its strategies read

**REGISTER**

## Reason

ITM-626, pull request #656 into `sprint/team1/57`, at head `c2925bec`. developer-sonnet-a wrote it. Its branch was cut
from `acc73e58`, before the item's readings were committed, and the developer read them from `main`.

1. **The tests-only commit is red.** `fc7e02c4` was pushed alone, and run 38983988766 failed on it. The Scrum Master
   read the saved log: node (6) shows `# fail 7`, `# todo 0`.
   - The failures are TST-626001, 002, 005, 006, 007, 009 and 012. TST-626001 shows "UseCaseNotFound … undefined" on
     the base.
   - The other five new tests pin what stays, and pass on the base by design.
2. **CI is green on the head**: run 38984283189 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `src/prompt-bar/hand-over.mjs` and one new test file. No existing test
   changed.
   - The UC-019 table gives the same result on the base and on the head: 29 receipts.
   - ITM-018 passes, and the fetch spy saw no request.
4. **Each of the three planted faults is caught.**
5. **The Acceptance holds.**
   - A hand-over of `change-use-case` on one use case is prepared and queued, with `useCase`.
   - The tests state for every handed kind which parameters a hand-over gives. A kind that needs a key `works_on`
     cannot give is refused at preparation by its strategy's error: `NotLinked`, `ResourceNotNamed`, `NoWorkNamed`.

**The readings are taken.**
- **One rule for every kind.** The bar keeps no table per kind, since that would hold the strategies' knowledge a second
  time (nothing twice). `useCase` stands beside `useCases` for one use case, whatever the kind. So derive-architecture,
  review-architecture and converse receive it too, and their strategies ignore it.
- **`steps` or `items`.** A name is a plan step when the product holds `docs/plan/<name>-*.md`, and a backlog item
  otherwise. MOD-documents' item schema gives the two the paths `docs/plan/ITM-{nnn}-{slug}.md` and
  `docs/backlog/ITM-{nnn}-{slug}.md`, so the path is where a name says which it is.
- **The item's grep note.** `params` appears once in `tests/prompt-bar-hand-over.test.mjs` (`:234`), as the page
  subject's `paramsFor`. It is no assertion on a record, so the note's conclusion stands. Its count was the Product
  Owner's slip.

**A `converse` hand-over without `page` or `entry` is no defect.**
- MOD-job-runner's recipe `page` gives "the page the person sees, as its route's subject gives it", and gives no part
  where none is given (`src/job-runner/builtins.mjs:137`).
- `chapters-for-page` is optional in the kind (`chapters-for-page?`).
- The hand-over tool admits every kind with a participant (MOD-job-runner, `hand-over`), and the person's click decides.

No text asks such a hand-over to be refused, so registering one would be an obligation no text sets (AGENTS.md §6a.4).
