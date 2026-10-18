---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a6bd984fb8f2d61c21afd955c83e99520bded5bd
  - https://github.com/akmaier/agent-m/pull/847
date: 2026-10-18 06:27 UTC
---
# Development → Release testing: ITM-870, imported settings are used by the open page

**REGISTER**

## Reason

ITM-870 (MOD-settings-pages), pull request #847 into `sprint/team1/87`, passes on `a6bd984f`.

1. **Red first.** `eb243aeb` holds only `tests/settings-pages-import-followed.test.mjs`. Run 39103636505 is red on exactly
   TST-870001 to 870003, so the lead held. The second commit changes no test.
2. **The change** is one line: `reconnectHosts(context);` after `importSettings` (`src/settings-pages/settings.mjs:394`),
   inside the handler's `try`. It is the path ITM-825, ITM-853 and ITM-860 closed for the other writes. Since ITM-868,
   `reconnectHosts` passes the stored secrets.
3. **Green.** Run 39103833960 on `a6bd984f` passes all twelve jobs.
4. **The Acceptance holds:** "After an import, the open page's requests carry the imported tokens, and the test pins it."
   - I ran the file on the head: 3 of 3.
   - I replayed the counter-proof in a clean checkout of the head: without the line, 3 of 3 fail. Restored, it is clean.
5. **sonnet-a's reading is accepted.** TST-870003 asserts that a GitLab-form token imported under `github-token` makes the
   import line show "That is a GitLab token". The reconnect throws it inside the handler's `try`, and the page shows it.
   That answers the note from ITM-869's gate: the failure surfaces at the import, not in a later host call. The token is
   still stored before the refusal. Refusing it before storing is ITM-893 (MOD-browser-store), not this item.
6. **Release tests (agreement 83).** Every release test that imports `src/settings-pages/` ran on the head, with ITM-868's
   tests and the Bridge packages installed as CI does: 53 of 53.

**Process.** The guard refused one chained command of the developer's. It was split into a script and a separate
`gh pr edit`, and the corrected body is published. An earlier body was published in between, and that has been reported.
This follows sprint 84's agreement.
