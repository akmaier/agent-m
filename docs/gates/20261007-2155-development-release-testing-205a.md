---
gate: Development → Release testing
job: JOB-20261007-2129-d899
decider: po-sol
role: Product Owner
decision: passed
on:
  - ab2fc48eee31b19d8c3f9e7c075af5e437b3a5be
  - https://github.com/akmaier/agent-m/pull/205
date: 2026-10-07 21:55 UTC
---
# Development → Release testing: ITM-207 dashboard migration to main

**REGISTER**

## Reason

Passed: merge only this exact promotion head into main under the human's urgent ITM-207 delivery instruction and
Sprint09's separately scoped migration promotion procedure. po-sol did none of the implementation/tests; the source
retains developer-terra-b and developer-terra-d authorship. Scrum Master executes the exact-head merge. No sprint
closure, endpoint promotion, full UC-003 delivery, architecture acceptance or production deployment is decided.

Read original AGENTS, unchanged binding SPEC and accepted UC-001/UC-042/store/settings/frame contracts, Team 2 roles
and process, current job record and promotion procedure, live complete PR description/commit/diff/CI, and independently
approved source gate20261007-2145-development-release-testing-187f.md. The source f8770ea merged into sprint/09 at
f2dbd8c. Verified all21 changed paths have identical blobs/deletions to that approved source; no new behaviour or
expected-result change is introduced. The promotion parent08c26e29b18a16f4c67c0672b5c8ba157602d63c includes Sprint12
merge732aa02 and corrected ITM-207 module promotiondbfc97f. Compared the common base3b640bd with that main parent:
none of these21 paths had intervening main changes. Every other main path is untouched, including the existing
browser-store implementation; endpoint catalogue/driver/frame/item work from Sprint09 is absent. Later gate/job
records on current main remain independent additive changes and are preserved by the merge.

The21 paths are the same bounded between-jobs scope: docs/assets/dashboard-app.mjs and product-store-adapter.mjs
call accepted public modules; unowned src/home/home.mjs delegates migrated configuration to existing consumers;
src/site/views.mjs and docs/assets/dashboard/built.json register the replaced route. tests/app-harness.mjs supports
its public DOM. dashboard-shell, dashboard-review-flows, release-sprint-01 and release-sprint-02-a/b/d dashboard-app
and review-core.d authority/dashboard-app test files drive the replaced route or remove its old coverage. Deleted
legacy dashboard/add-product-view.mjs, dashboard-add-product/system-uc-001 and three release-sprint-04-uc-001 test
files remove the replaced code and its coverage. The new dashboard-product-store-migration test retains TST-265–270.
No owned-module implementation, allowlist, SPEC, architecture, participant or process change enters this promotion.

Retained data path: #add/<address> → dashboard-app public add-product Route.render → openStore(instance) → existing
accepted settings module. Settings Clear at settings-view:628/686 → adapter:104–107/121–124 → clearSetting removes
canonical token and established legacy clear removes its mirror. Remove at settings-view:716 → adapter:136–141 clears
token and updates/removes the canonical products list before legacy removal. The approved source gate independently
observed known-positive → Clear/Remove → reload, with no resurrection and other product/expiry/instance preservation.
The promotion's identical corrected adapter and tests preserve that proof; independently reran all six cases on this
exact promotion head:6 pass,0 fail,0 skip/todo, including actual public dashboard synthetic-zero and canonical removal.
Trusted positive module coverage remains in main's already accepted ITM-273 correction.

Original proof lineage remains actual tests-only correction33ee7cd and red37690695287, fix04dcd16 and final source
CI37691252222, with all six individually executed/restored faults in PR187 and its gate. Retained settings/export/import,
UC-008, expiry and Backlog read-only checks were reviewed/run at the source gate; its existing TODO limitations and
selected independent ITM-245 replacement evidence are not erased by this promotion. Live promotion run37692221654
is completed SUCCESS on ab2fc48: Node113034980136 and Python113034979883. Fresh target CI, rather than source CI
alone, establishes the current main-base compatibility.

JOB-20261007-2129-d899 truthfully records this continuation and promotion resume/gate handoff. Its earlier-start
absence remains acknowledged; no old gate or timestamp is reconstructed and no complete historical job compliance
is asserted. This delivers the approved dashboard migration alongside the corrected module, while independent
ITM-244/245 and remaining release findings stay outstanding. Sprint09 stays open; any changed PR head needs a new gate.
