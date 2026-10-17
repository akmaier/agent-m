---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2486010411d50d58b7967e668f17d42da41c8af8
  - https://github.com/akmaier/agent-m/pull/767
date: 2026-10-17 20:16 UTC
---
# Development → Release testing: ITM-711, the comments name the app where it is

**REGISTER**

## Reason

ITM-711, pull request #767 into `sprint/team1/76`, at head `24860104`. It is one commit across six files, +10/−16. It is
mergeable, and run 39065821293 is green. It is declared as refactoring.

**Comments only.** The Scrum Master filtered `git diff -U0` against the sprint branch for added or removed lines that do
not start with `//`, and found none.

**The acceptance is met.** MOD-markdown-render's and MOD-artifact-edits' comments name the app where it is, or no file
that is gone:
- `render.mjs` names `src/site-frame/dashboard-app.mjs`;
- `difference.mjs`, `editor.mjs` and `fallback.mjs` drop clauses about files and functions that no longer exist;
- `fallback.mjs` and `save.mjs` lose the item history in their headers (sprint 67's agreement).

**The reading at `layout.mjs:9` and `save.mjs:10` is accepted.** Those comments named functions of `writes.mjs` as their
models. They now name the live callers instead: `src/settings-pages/products.mjs:371`, and
`src/review-pages/file-edit.mjs:102` and `file-drafts.mjs:39`. The old file still exists, but nothing imports those
functions, so the comment names what runs.

**Runs.** The two modules' tests pass 84 before and after. ITM-018 passes, and no release result changed.

**Findings, none new.**
- `writes.mjs`'s `saveReviewedFile` and `addProduct`, which nothing imports, go with that file (ITM-713).
- `review-core.mjs:536` belongs to the job that moves it (ITM-690).
