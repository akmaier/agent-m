---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 13c508ec84b0b76ffd420fe13c71dc2277d6bf9f
  - https://github.com/akmaier/agent-m/pull/808
date: 2026-10-17 23:02 UTC
---
# Development → Release testing: ITM-776, the release test that the catalogue is data

**REGISTER**

## Reason

ITM-776, pull request #808 into `sprint/team2/82`, at head `13c508ec`.
- It holds one commit that adds only `tests/test_catalogue_is_data.py`, the check SPEC names for THE CATALOGUE IS DATA,
  and its case file `tests/test_catalogue_is_data.md`.
- Run 39077190863 is green. CI skips release-level Python on a sprint base, so the test was run on the head: 2 OK.

**Readings accepted.**
- `module: system` in TST-840010 and TST-840011 follows MOD-test-document: a release test exercises the whole product
  and names `system`. The file header names MOD-model-catalogue. Together they meet the Acceptance's "the module it
  exercises".
- TST-840010 and TST-840011 are used nowhere on `main` or the sprint branch. Known positive: the same search finds
  TST-840001. They lie in ITM-840's block, which no rule forbids.
- A vendored file is one under a folder named `vendor`, as `tests/jsrun.py` reads it. The only file left out is
  `src/markdown-render/vendor/mermaid.min.js`, as sprint 82's record expects.

**Counter-proofs replayed in a checkout of the head; each failed and was restored.**
- *V Model* planted in `src/runtimes/pull-request.mjs` failed TST-840010.
- The instance-model filter in `src/model-catalogue/index.mjs:212` disabled failed TST-840011.
- *DevOps* in a folder named `vendored`, not `vendor`, failed TST-840010.

The author, developer-sonnet-h, is named by no commit on `src/model-catalogue/`.
