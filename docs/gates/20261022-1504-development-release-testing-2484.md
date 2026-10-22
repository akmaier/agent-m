---
gate: Development → Release testing
job: JOB-20261022-1336-0e00
decider: po-sol
role: Product Owner
decision: passed
on:
  - 464990322e834d622ba9d5cefc7bcdfccc11b5ad
  - https://github.com/akmaier/agent-m/pull/1297
  - src/site-frame/look.css@f847b19a8e4b6d2b68833bdb73bb6318d4dd9a9c
  - tests/fixtures/requirements-repair/SPEC.md@af4294be2703a02682b82b29ad4a9d6e1a06dd82
  - tests/fixtures/requirements-repair/requirements.md@36facb5cb0e700bedb9fff823696597f43a717af
  - tests/site-usability.test.mjs@87048cf50aaecf1e0477d3e93992949a57ddf343
date: 2026-10-22 15:04 UTC
---
# Development → Release testing

**REGISTER**

## Reason

Passed for ITM-1178 on exact PR1297 head 464990322e834d622ba9d5cefc7bcdfccc11b5ad, into sprint/team1/109 only. Independent po-sol authored none of the Source, tests or measurements; developer-terra-a authored them. Current Team1 role assignment and the declared scrum-wip Development gate permit this decision. The accepted Frame is d38b1f2e6ef8946e0a995d2d28ae2d2b770d4bfa.

Scope: only 19 production lines in src/site-frame/look.css; one new system case TST-1178001 in tests/site-usability.test.mjs and its two explicitly marked, fixed Markdown input snapshots. Existing assertions, empty geometry arrays, IDs, levels, frozen922, helpers, shared fixtures, Trace behavior, grouping data and formal artifacts are unchanged. Test data are inputs, not additional executable cases or live production-count constraints.

First commit44e5642e contains only tests and their own data; its automatic CI39789632792 is red from retained Openbox before-hook failures, not an executed intended assertion. The actual clean-head pre-Source run at13:52:09.655-13:52:25.555Z fails the phone narrowing assertion,44 visible members versus the one literal expected name; later font/desktop assertions were not reached. Published PO11dd3415/Source permission8f71c63b precede all production edits. This satisfies the prospectively clarified boundary without adding a server-assertion requirement.

Failure path: Trace flow.mjs499 hides nonmatches; phone table-row display:block defeats the user-agent hidden default. The scoped .current-requirements [hidden] rule restores hidden precedence without changing the Trace code. TST-1178001 measures actual content, styles and geometry at390/1280. Baseline passes; removing only that owned rule fails at the original44-versus1 node; exact CSS restoration passes. Candidate/restored blob f847b19a8e4b6d2b68833bdb73bb6318d4dd9a9c, fault975b5b89746f103397e69a77b9b5cc99988255ce, unchanged test87048cf50aaecf1e0477d3e93992949a57ddf343. All three actual runs were on44e with uncommitted CSS before the later464 commit, as the immutable records and raw captures disclose.

All six original receipts were read and schema-validated. Published correction42f5378d maps their exact commit/path pairs to full version/participant/model/job provenance; its tree a954b6a28f7a97fb4b03510b71769dd45a25cada equals its parent. No record, clock, outcome or variant was rewritten. The Source commits already carry proper provenance. PR final body and title now describe the actual Source/evidence handoff.

Fresh public Host.pullRequestFacts at2026-10-22T15:04:31.165Z confirms first-commit CI failure and exact-head CI success with all23 required checks successful, remaining[]. CI39793252751 attempt3 reached the last six DesktopShell component bodies; receiptruns/d1fba8ae9454a829dd4992abdf7098821e449b41/20261022-1450-pull-request-449c.md at test-results f9d2d5624db84ee9cd3e6b4ff1d29a877f92e270 validates. Source1178001 and the owned system cases passed on the actual automatic run; local baseline/fault/restoration remain separate evidence, not substituted CI or relabelled canonical executions. Failed setup attempts, the bounded retries, all TODOs and same-commit flaky history, including retained276005 timeout/pass history, remain evidence; no cause-fixed or historical-all-pass claim.

This is only Development -> Release testing. SM alone publishes and performs the guarded exact-head sprint merge; no merge is performed here. Independent release verification of1178 on the integrated sprint is still required; existing relevant artifacts may be extended without a new-file or per-item quota. Global64cd remains pending independent green release evidence for all three selected items. No whole-product, whole-UC or universal AA acceptance is claimed. Cost is unknown.
