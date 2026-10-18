---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - dfa4828df06da358fccd537619350a0a1f9e4493
  - https://github.com/akmaier/agent-m/pull/867
date: 2026-10-18 08:44 UTC
---
# Development → Release testing: ITM-778, the instance's process models are listed

**REGISTER**

## Reason

ITM-778 (MOD-implementation-pages, route `models`; MOD-site-frame, `explanations.md`), pull request #867 into
`sprint/team2/89`, is rejected on check 5. The item's Outcome says "The buttons lead to `models/<name>`". They do not.

**The addresses.** *Adapt* and *Edit* link to `#models/<name>`, and *+ New model* links to `#models/new`. The frame
takes the first part of the fragment as the route's name and the rest as its `params` (MOD-site-frame.md:117). It
reads a parameter only as `key=value` (`src/site-frame/routing.mjs:15-23`). Replayed on the head:
- `routeOf("#models/v-model")` gives `{ name: "models", params: {} }`;
- `routeOf("#models/new")` gives the same;
- the known positive `routeOf("#models/name=new")` gives `params.name = "new"`.

So no button names its model, and *+ New model* cannot be told from them. TST-778003 also fixes these addresses as
expected results. ITM-779 would then have to change an expected result to build `models/<name>`.

**How the + New model address is settled, by the texts.** No question goes to akmaier. The frame's form for a part of
a route is a parameter, as `library/<source>` is `#library/source=<id>` (`src/settings-pages/library.mjs:408`). So:
- *Adapt* and *Edit* lead to `#models/name=<name>`;
- *+ New model* leads to `#models/name=`, an empty name. No model can carry it, because `name` is required in
  `src/model-catalogue/model.schema.md`. A model named "new" is valid there, so `#models/new` would collide.

**The other checks hold:**
1. The red commit `2e1429ad` holds only `tests/implementation-pages-models.test.mjs`. CI run 39111686286 is red on it.
   The fixture changed afterwards in two ways:
   - the spy answers the GraphQL batch read;
   - the own models are expected in the order of their paths, as `catalogue` documents.

   The red came from the missing route, and the Acceptance's assertions are unchanged, so the red commit still
   proves the Acceptance.
2. Run 39112084729 is green on `dfa4828d`. The merge into the sprint head `8060bf21` is clean.
3. The changed files are in scope: `src/implementation-pages/index.mjs` and `models.mjs`,
   `src/site-frame/explanations.md`, and the new test, whose header names MOD-implementation-pages. One observation:
   the module's Parts put the instance's process models in `process.mjs`, but the route stands in a new `models.mjs`.
4. TST-778001 to 778006 name what they guard and the module. Three counter-proofs were replayed on the head, and each
   made its test fail:
   - the kind showing the name failed 778001;
   - *Adapt* labelled *Edit* failed 778003;
   - the findings dropped failed 778005 and 778006.
5. Apart from the addresses, the Acceptance holds as read: five shipped models, two of the instance's own, kinds,
   declaring products, and *Adapt* only on a shipped model. Each sentence of the five new explanation topics comes from
   the accepted line the pull request names: UC-031 1, 2, 2a, 2b, 4, 6, 6a, 7 and its table; MOD-model-catalogue
   `modelFindings`; and the item's reading.

**Agreement 83.** The tests ran with `LC_ALL=C` after the Bridge install. On the head, the new test and 19 release
tests that read the changed files pass, among them release-sprint-06-uc-002, itm-275, uc-014 and both uc-019.
`release-sprint-02-d-traceability` fails on `tests/prompt-bar-follow.test.mjs -guards-> UC-049 (5a)`. It fails the same
way on the sprint head `8060bf21`, so this pull request does not cause it.

**The book chapters.** The developer did not read chapters 9, 11, 12 and 13 in full (AGENTS.md §1). The work does not
show it otherwise: the explanations point to chapters 6 and 7, as UC-031 does. It is recorded for the retrospective.
