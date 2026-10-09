# Sprint18 planning and readiness decision

**MEASUREMENT**

Decision: SELECT ITM-286, ITM-287, ITM-288 and ITM-289 under the unchanged declared model.
Participant: po-sol; model: gpt-6.1-sol; Agent M: unreleased.
Job: JOB-20261009-1823-p18p, original published Start33fa21d7dc225b2911f3713bbea2e9da3c2b466d.
Actual Taken: 2026-10-09 18:24:50 UTC from clock, after reading that entire original and before planning edits.
Decision at: 2026-10-09 18:31:38 UTC from clock; validation completed afterward before commit.
Isolation: .agent/worktrees/agent-po-sol-plan-18 on codex/p18-plan from33fa21d.
Usage/cost: null/null.

The human’s goal remains FULL UC003, UC002 and UC047 implementation over further sprints, with003 first.
The canonical18 Start records exactly this bounded selection, source assignments A/B/D/C and independent release E.
It adds no binding requirement, human acceptance, architecture, participant or process change.

## Original reads and declared authority

Personally read AGENTS/SPEC/README/process/participants/model originals in full during the preceding continuous
review jobs and retained them only after current unchanged Git blob verification. Personally read the fresh1823
Start in full before new isolation; reread current affected UC/architecture/module originals, UC002 and UC013 in
full, current17 review/retrospective/closing, original032/order/items and B003 read-only Start/Taken/End. Earlier
source/release/aggregate/closing original gates remain personally read evidence; no other agent’s summary substitutes
for originals. AGENTS§2/6a and SPEC§11–13 require existing accepted interfaces, concrete caller/failure proof,
canonical declarations/trace, tests-first/own-case proof and the declared gates. UC032steps1–6/1c assigns this
selection to PO. scrum-wip WIP4 includes review, no timebox; one writing context per participant and root+max3children.

| Original | Current blob |
|---|---|
| AGENTS.md | 7e8f20ca35cd48a5250d143b07a469d46986f123 |
| SPEC.md | 1de56e76de63bfe5f3f4bb98820adad801041def |
| README.md | 37284376636ddf07efa58b63be4ff8a2ea12300a |
| docs/process_team2.md | eb772d456a24c145fe3f98778509f207e34e172d |
| docs/participants_team2.md | aba8b680f7df66e2807701294c960a3c29fb0148 |
| docs/process-models/scrum-wip.md | 72fdea87d0c468ffcd53ae3a6d564623c686e22d |
| docs/architecture/ARC-038-the-site.md | 1a583b96fa01cb37f2d277bd70036ce60dfdef83 |
| docs/architecture/ARC-040-the-bridge.md | 603620210312a514d004a58887157c04dbafe8c6 |
| docs/architecture/ARC-052-ssh-in-the-bridge.md | 3fee08bacbb70bd95ecdfac91417f06f9a07d95c |
| docs/architecture/MOD-tunnels.md | 0d7ed13e3e793bf081636b53c1ae64c7f15485f9 |
| docs/architecture/MOD-desktop-shell.md | 71d36abb286361f9349b30f3fa9bb8bd2e4f4a06 |
| docs/architecture/MOD-settings-pages.md | 6357592c6ff7a2dd528ae959c918ad4ec1a903a4 |
| docs/architecture/MOD-browser-store.md | 058fd3b05cc14cb361575f16a2059f174417e8ac |
| docs/architecture/MOD-test-pages.md | 25cf2dca00274bbbc2867b993891f10b6015b6c2 |
| docs/architecture/MOD-release-evidence.md | dbd34f3c7bf089692abf8e0b0cb4f4dba18a2047 |
| docs/use-cases/UC-002-choose-a-process-model.md | 48fd22da0bf353dc8dcc0e3fda4af6ab76d3aaa4 |
| docs/use-cases/UC-003-configure-a-model-endpoint.md | 82081a084479172f2f8f704211351b052edea8e6 |
| docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md | 982753a5278bdcb9e0f895d30d1cc274fe2ba80f |
| docs/use-cases/UC-013-release-a-version.md | 0a2ec7e3cc6770f66381e21d128754f64aabb2ea |
| docs/use-cases/UC-032-maintain-the-backlog.md | caa2f8e393cdeb36b7fa666448a46c90fa85b9bc |
| docs/use-cases/UC-042-manage-settings.md | a8c595676ef0afd54290024c928b7268c49dfbe9 |
| docs/use-cases/UC-044-install-and-pair-the-bridge.md | 6c80417a691b105488b2426c25245ae7f39a33a7 |
| docs/use-cases/UC-047-be-told-what-waits-for-your-acceptance.md | 9c3cf6e0500518f2e8af47f1efc160d351378f21 |

## Actual completion retained

Actual Sprint17 closing merge PR261 is4b427bca96d4b1fc2b21240a8c0690ea3a813abb at18:22:58UTC, ancestor of the
published planning base. Closing gate docs/gates/20261009-1819-retrospective-sprint-planning-17.md blob
38f6888c3f3b467f2194c29d062b03143384845f and aggregate20261009-1810-release-testing-sprint-review-17.md blob
1e92d5bdcf40b3011c1ea83af2c9222e1b4c8244 remain original immutable decisions. The closing own complete Linux
CI37972050218 checkout6e2a7226158f82c7f54dd169613203f0fac5dbdf/treef8c95531aea8680a164ef3aad31c1971030f10e2
observed Node1066/1058pass/zero fail/8TODO and Python399/388ordinaryOK/5skip/6expected; this is prior delivered
code evidence, never a claim it tested Sprint18 code. Source282/283/284/285 actual approved merges843a1978,
f84b04cc,1f76b165,d492b473 and independent releases77cfa162,36771218,e7cf7184 are ancestors of closed main.
Their complete original reds/final logs, actual trees,16unit/10release own faults/restoration and gates are retained
in the prior aggregate, not recreated here or converted to extra proof quotas. Historical native flips remain flaky.

## Concrete paths and positive readiness

- **286:** src/tunnels/index.mjs:27 → ensureKey actually creates/reuses the real Ed25519 pair, delivered284 with
  its real dependency known-positive/finalCI. Its current only export is ensureKey; there is no runtime/state/handler.
  Canonical bridge-client plans delivered282 feed accepted MOD-tunnels openTunnels → ssh2 forwardIn/forwardOut →
  loopback byte stream → local Bridge.285 positively serves supplied-handler authenticated state. These working
  prerequisites establish the runtime gap; no missing-folder inference or unavailable dependency red is used.
  State name derives existing plan identity; accepted plans have no required name. Private key/known-host data stay
  in controlled per-user/temp folders outside repositories, never exported.
- **287:** dashboard-app.mjs:532 → settingsPages bridge route.render → openStore(instance) → current bridge.mjs
  writes canonical jump-host and Bridge settings, a positive existing public consumer. Its actual form lacks remote
  sessions. Add session selection → public allocatePort → writeSetting(remote-session:name) → tunnelCommands /
  proxyConfiguration rendered in the same route.282/283 already supply those public accepted functions; Save makes
  no external request. No duplicate own-model endpoint transport is selected.
- **288:** public settings-view → built settings/endpoints.mjs renderSection → settingsPages routes(settings).render
  with canonical openStore → current settings.mjs endpoint/Bridge/jump-host lines. This is a verified positive public
  mount; the new module controls extend it. The current old settings-view.mjs:902 → saveExport → legacy
  exportSettings(store.entries()), product-store-adapter.mjs entries → syncLegacy → legacy.entries mirrors only
  products/token families. Canonical stored endpoint/Bridge/jump-host/session entries therefore have no path into that
  old export. Compose the delivered283 public codec in settings.mjs, then root separately replaces/removes duplicate
  old controls and proves actual public export/import before full delivery. No second codec/crypto or migration quota.
- **289:** actual notificationView returns release → addressOfNotification writes #release; src/test-pages/release.mjs:
  189 render → void params → paintForm:199. paintCandidate:112 is positively called only by newly starting a candidate:
  163. src/release-evidence/report.mjs:260 reportsAwaitingAcceptance positively resolves newest unreported/unreleased
  done candidate to its record/blob; same module’s acceptAndRelease reconstructs candidate/changelog from recorded
  job/tag. Reuse public services/records to reopen that report. Public dashboard currently imports settingsPages but
  no testPages: fresh bounded root caller composition after module merge is required, then257 actual-dashboard tests
  can become ready. Existing stale comments about unbuilt239 are not current delivery evidence.

No planning probe, full local suite, native execution or device state was used. These paths come from actual source,
accepted originals and retained positive production/CI outcomes. New implementation tests will check their actual
failure nodes, rather than isolated substitute assertions. Current UC002 author flow remains assessed separately;
its prior20/22 cases plus281 and current notification confirmation do not prove all accepted end-to-end postconditions.

## Ownership and independence

Complete non-merge source histories of tunnels/settings-pages/test-pages/browser-store/bridge-client/release-evidence
were read (277lines), alongside guarded result-records/job-ledger/test-document/trace-graph/site-frame/markdown-render
histories. Tunnels15c9f6f is C; builders2c13f53/f1cf1ff and pending-report b1e6234/f1dbd3b are B; store5630f1d is D
and its earlier store implementation SonnetA/TerraB; existing release route80451ff is SonnetD, report254 SonnetC;
result251 SonnetA, ledger252/test-declarations248/graph249 SonnetB; frame/render predecessors are OpusB/SonnetC/C.
E/SonnetE authored none of these guarded source paths. Tests-only E release merges do not establish source authorship.
Private original history outputs: /private/tmp/p18-source-provenance.txt and p18-more-source-provenance.txt.
Release Starts recheck all actual guarded/caller lineage after source delivery. Source B287 owns bridge.mjs, D288
settings.mjs, distinct private helpers/tests, no shared index edit; runtime A286 and test-pages C289 are disjoint folders.

All four are ready against existing public interfaces. Runtime/shell sequencing is kept truthful: the shell’s automatic
import/key/window/lifecycle/handler composition is later necessary work after286, not a selected incomplete dependency.
Public289 and duplicate legacy288 caller work is separately scoped between jobs, never hidden in module/release PRs.
257/267 stay unfinished/unselected;267 is real trusted HTTPS/current-browser measurement and controlled fixtures do
not satisfy it. No device/browser interaction or human acceptance is authorized by this planning.

## Bounded validation and limits

Explicit permitted nonnative documentation checks: python3 -m unittest test_backlog_item_fields test_backlog_layout
 test_origin_links →42 tests OK, one existing expected failure; node --test tests/work-plans-backlog-order.test.mjs
→3pass, zero fail. No new test or source was written; no local broad/glob/native/full suite was executed.
The changed set is four new items, order, canonical18 Start and this new immutable measurement only.
Earlier D283 prohibited local Mac Electron execution stays excluded. No audit/cleanup/private-state conclusion;
old CI37968811524 samecommit native failure/positive flip stays flaky, never passed. Root keeps original receipts,
exact new heads/combined checkout trees and complete Linux outcomes in future gates. Manual corrections have no
fixed3-round cap, no invented additional quota. Unknown usage/cost remain null. This selection neither closes18 nor
selects19, tags a release or accepts a report or binding artifact on the human’s behalf.
