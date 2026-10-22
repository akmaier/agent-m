---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d08e01c9669243f3e927605be50ff21c96a0a926
  - https://github.com/akmaier/agent-m/pull/1303
date: 2026-10-22 19:58 UTC
---
# Development → Release testing: ITM-745, the committed configuration against the schedule

**REGISTER**

## Reason

ITM-745, pull request #1303 into `sprint/team2/103`, passes on `d08e01c9`. The head holds the sprint branch with ITM-1179
(`9d176a2d`), and CI is green on 24 of 24 checks.

1. **Red first, from the full job log.** The tests-only commit `1ee6e3f6` failed in node (7): the new file
   `tests/test-schedule-configuration-drift.test.mjs` could not import the function that was not yet there. The sprint
   record holds the reading (`docs/backlog/sprints/team2/103.md`, "Before the gates").
2. **The accepted text.** MOD-test-schedule.md:133-137, with `resources` and `participants` in the signature (draft
   `c2f0a91e`). The change is in `src/test-schedule/generate.mjs` and `index.mjs`, with one new unit test.
3. **#788's two rejections are answered** by the brief's cases:
   - unedited files with a paid secret and a runner participant give no difference;
   - each single edited line, the secret and runner lines among them, gives exactly one.

   The expected text is generated from the parameters given, and nothing is read back from the committed file.
4. **The reading** is named in the description.
5. **Release runs on the head, by this gate:**
   - traceability 8 of 8;
   - test levels and expected results: 7 pass and 1 fails, which fails the same way on `main` on this machine (a node
     module missing locally).
