---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 77a6b6f9186d36cb244ce63ad2f98fba52b4d245
  - https://github.com/akmaier/agent-m/pull/867
date: 2026-10-18 08:54 UTC
---
# Development → Release testing: ITM-778, the instance's process models are listed

**REGISTER**

## Reason

ITM-778 (MOD-implementation-pages, route `models`; MOD-site-frame, `explanations.md`), pull request #867 into
`sprint/team2/89`, passes on its reworked head. The earlier rejection was on the condition named in
`20261018-0844-development-release-testing-e3fc.md`, and this head meets it.

**The condition.** The buttons now use the frame's own address form:
- *Adapt* and *Edit* lead to `#models/name=<name>`;
- *+ New model* leads to `#models/name=`, the empty name. No model can carry it, because `name` is required.

`routeOf` gives each name back. TST-778007 resolves every button's address through it. `src/site-frame/routing.mjs` is
unchanged, so the frame's routing stays as MOD-site-frame states it.

**The checks:**
1. The red commit `2e1429ad` holds only the test, and run 39111686286 is red on it. The fixture changed afterwards (the
   GraphQL batch read, and the order of the paths). The Acceptance's assertions did not change.
2. Run 39112961350 is green on `77a6b6f9`.
3. The scope:
   - `src/implementation-pages/index.mjs`;
   - `src/implementation-pages/process.mjs`: the route is now `modelsRoute` there, as the module's Parts say, and
     `models.mjs` is removed;
   - `src/site-frame/explanations.md`;
   - the new test, whose header names MOD-implementation-pages.
4. TST-778001 to 778007 name what they guard and their module. Three counter-proofs were replayed on the head, and each
   failed its test:
   - a button without `name=` failed 778003 and 778007;
   - *Adapt* labelled *Edit* failed 778003;
   - the kind showing the name failed 778001.
5. The Acceptance holds. Every sentence of the five explanation topics comes from the accepted line the pull request
   names.

**Agreement 83, widened.** The run used `LC_ALL=C`, after the Bridge install. 26 test files pass on the head:
- the release tests that read the changed files;
- `release-sprint-02-d-traceability`;
- the implementation-pages tests.

The same 26 pass on the head merged with the sprint head `851b6957`, and that merge is clean.

**The book chapters.** The developer read chapters 9 and 11 to 13 in full only for the rework. The work on the first
head did not show the gap. This goes to the retrospective.
