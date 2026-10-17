---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 05117e7f3bba3c888bc9a5349b4fa134d576d088
  - https://github.com/akmaier/agent-m/pull/813
date: 2026-10-17 23:29 UTC
---
# Development → Release testing: ITM-859, the process page's version comparison survives an unreadable declared commit

**REGISTER**

## Reason

ITM-859, pull request #813 into `sprint/team2/82` (branch from `1861e7f9`), at head `05117e7f`. Run 39078973264
passed twelve of twelve. It changes two files: `src/implementation-pages/process.mjs` and
`tests/implementation-pages-model-version.test.mjs`.

- **Red, then code.** The tests-only commit `f144d965` was red in run 39078630392 on TST-859001 alone, with
  `NotFound: no such commit`, the intended reason. Its `querySelector("form")` assertion was never reached there. The
  green commit replaces it with `byClass(target, "schema-form")`: the fake DOM has no `querySelector`, and the form is a
  `div.schema-form` (`src/site-frame/forms.mjs:137`). This fixes how the new test reads its own output, and the expected
  result stays "the form stands".
- **Scope.** `versionChange` catches the failed `readSnapshot` and returns one `p.warn` naming the commit and the
  host's message. The test header guards `UC-031`, as the item names.
- **Counter-proofs, replayed in a checkout of the head.** A warn line without the host's message fails with an
  AssertionError, and `1861e7f9`'s `process.mjs` fails with `NotFound`. Restored, the test passes.
- **The two release tests that failed #811,** run with `node --test` with the Bridge packages installed as CI does.
  release-sprint-02-d-traceability passes 8 of 8 and release-sprint-16-practice-workflow 3 of 3; both fail on
  `1861e7f9`. implementation-pages-model-version passes 6 of 6.
- **The developer's local failures.** workflow-entries-job-workflow fails identically on `1861e7f9` and on the head, so
  it is not this change. release-itm-269-endpoint-route passes here on both.
