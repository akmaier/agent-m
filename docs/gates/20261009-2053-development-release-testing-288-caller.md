# ITM-288 canonical Settings caller gate

**MEASUREMENT**

Decision: **HOLD / reject** PR272 exact `839e20967ab9f31b7c3c3440fb1f89eaf4b774b7`. Its full CI is red. No merge of this head is approved. Independently reviewed source PR265 is decided separately.

Job: JOB-20261009-2040-p18c, original Start blob `1f03eedb77272a3482beaeef5cd376387428bb95`, published main `adc38dd5fecf5240581cfb70917514fb598b7e03`.
Actual Taken: 2026-10-09 20:42:04 UTC, clock, after the original Start was read.
Decision at: 2026-10-09 20:53:01 UTC, clock.
Isolation: `.agent/worktrees/agent-po-sol-final-source-18`, branch `codex/p18-final-source-callers`, from that published main.
Decider: po-sol / gpt-6.1-sol. Usage/cost: null/null. Root alone publishes, rechecks, merges and Ends.

Full personally read originals were retained only by exact unchanged-blob verification. The 37 prior pins were checked at this Start: 34 unchanged; three changed job originals reread. The new Start, current D handoff, MOD-site-frame and the two completed gates were read as originals. The complete 42-pin record is `/private/tmp/p18c-read-pins.json`, SHA-256 `2f24d89a5a28240035a01e8f328270ba0fca6e5d34935ec7ea02b2a928bb6aad`; per-old/current verification is `/private/tmp/p18c-read-pin-verification.json`. No other agent summary substitutes for an original. The process model blob is `72fdea87d0c468ffcd53ae3a6d564623c686e22d`, pinned model commit `ef33e2f501289930960f13b55936e9b557003993`.

The complete bounded commands, statuses, stdout, exact source/test hashes, canonical results, PR metadata, raw CI and every named outcome are retained in `/private/tmp/p18c-evidence-manifest.json`, SHA-256 `726710f0e5d70cb5d6ea18ca84b5738844d06cf3985f10c617aeb329977d2eae`. This is private review evidence, not a product export. All temporary source faults were restored exactly; no production, test, accepted contract or process edit is part of this gate.

## Concrete remaining failure and permitted boundary

The full mixed existing case at `tests/dashboard-review-flows.test.mjs:678–695` still asserts at689 `<h3>Export and import</h3>`, the legacy heading deliberately removed with the duplicate controls. Actual GitHub CI37988438963 fails that assertion; its input is the legacy Settings HTML without that heading. This is a stale assertion in an incompletely cleaned-up retained case, not evidence that canonical export/import failed.

Actual caller path: settings route `docs/assets/dashboard/settings-view.mjs:1016` → viewSettings443 → renderSections501/505 → loaded `settings/endpoints.mjs:8` renderSection → actual public settings-pages settings route → the mounted canonical export/import controls. Known positive final TST-288101:29 observes two mounted public nodes; lines31–49 download the real canonical four-record plain export, clear those controlled records, import, restore exact stored bytes, report all four added records and observe zero repository writes. That same case passes before the inherited negative assertion is considered, including in the full failed CI.

SPEC §11 WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS expressly allows an own between-jobs PR that “removes what a module now provides together with the tests of what it removes”. The actual declared D write-tests End preceded the separate Settings Start at20:22:02. This is removal of duplicate legacy code under that sentence, not a refactoring label or permission to weaken unaffected expectations. Narrow next correction: remove only the retained mixed-case assertion of the removed legacy heading at689. Keep its Settings title/shared-origin notice, six browser rows/state/password/Show/Test/Change/Clear, Clear everything, product pseudonymisation/collaborators and all six explanations, plus new real canonical mount/roundtrip guard. A future corrected head requires fresh CI and review; this exact839 stays HOLD.

## Actual cleanup and exact removed-test inventory

Read full old/current settings-view and retained public endpoints caller before diagnosis, every affected old case and final diff. Ten changed files contain52insertions/366deletions. Source removal is limited to old settingKeys/exportSettings/readSettingsFile/mergeSettings imports, PASSPHRASE_NOTICE/exportNotice, builtIn.export markup, old importGo-disable binding, export/import events and saveExport helper. All remaining token/product/notification/clear/last-test/endpoint controls remain. Accepted public module and existing codec source are byte-identical to the prior source: eleven source files recorded in `/private/tmp/p18c-settings-retained-codecs.json`.

Actual removal is twelve complete Node cases and three Python ExportDisclosure cases. Their full original bodies directly address the deleted legacy events/helper; none is a blanket deletion of a remaining page snapshot. Inventory `/private/tmp/p18c-settings-removal-inventory.json` includes complete old bodies and exact retained blocks.

| Removed case, exact old title | Old node | Removed-code boundary |
| --- | --- | --- |
| UC-042 step 6: the export states what it contains and what each secret grants; Export saves every browser setting, the token included, and sends nothing | `tests/dashboard-review-flows.test.mjs:973` | deleted legacy export/import controls and events |
| UC-042 step 6: an export locked with a passphrase holds no secret in clear; two different passphrases save nothing | `tests/dashboard-review-flows.test.mjs:987` | deleted legacy export/import controls and events |
| UC-042 step 6 · UC-014 7a: Import, after the notice is ticked, restores every setting of an export in a browser that had none | `tests/dashboard-review-flows.test.mjs:1006` | deleted legacy export/import controls and events |
| UC-042 step 6: a locked file is imported with its passphrase; with a wrong one nothing is imported | `tests/dashboard-review-flows.test.mjs:1020` | deleted legacy export/import controls and events |
| UC-042 6a: an import keeps what this browser has, adds only what is missing, and lists both | `tests/dashboard-review-flows.test.mjs:1036` | deleted legacy export/import controls and events |
| UC-042 step 6: an export carries the last test with its token, and an import into an empty browser shows it | `tests/dashboard-settings-last-test.test.mjs:247` | deleted legacy export/import controls and events |
| UC-042 6a: an import that keeps this browser's own token keeps its own last test — the file's does not stick to it | `tests/dashboard-settings-last-test.test.mjs:262` | deleted legacy export/import controls and events |
| release · UC-042 6 · UC-014 7a: export with and without passphrase; a second browser imports it with the passphrase only | `tests/release-sprint-01-dashboard-app.test.mjs:1031` | deleted legacy export/import controls and events |
| release · UC-042 6a: an import keeps the products this browser has, adds the missing ones and lists both | `tests/release-sprint-01-dashboard-app.test.mjs:1066` | deleted legacy export/import controls and events |
| release · ITM-136 UC-042 6: the export carries a setting's last test; another browser shows it after the import | `tests/release-sprint-02-a-dashboard-app.test.mjs:875` | deleted legacy export/import controls and events |
| ITM-125 · the export notice names each stored secret with what it grants — the GitHub token's pull requests included | `tests/release-sprint-02-d-dashboard-app.test.mjs:94` | deleted exportNotice helper |
| the settings export is saved as a file only — never committed, fetched or put into an address | `tests/review-core.d/dashboard-app.test.mjs:299` | deleted saveExport wiring |
| ExportDisclosure.test_the_notice_names_each_secret_and_what_it_grants | `tests/test_settings_disclosure.py:47` | deleted exportNotice helper |
| ExportDisclosure.test_the_github_grant_names_every_write_of_the_one_token | `tests/test_settings_disclosure.py:56` | deleted exportNotice helper |
| ExportDisclosure.test_a_forgotten_passphrase_is_stated_before_saving | `tests/test_settings_disclosure.py:65` | deleted exportNotice helper |


The three mixed retained codec cases (GitLab tokens merged per product; GitHub product tokens merged per product; JumpHost/RemoteSessions settings) keep every actual codec assertion and lose only their one deleted exportNotice assertion and its import. All ten codec cases remain. The rest of all affected inherited test bodies are unchanged. Neither secret/merge/locked-file codec expectations nor other controls have been weakened. The one residual old heading assertion identified above has not been edited by this reviewer.

## Actual complete CI and inherited outcomes

GitHub Ubuntu CI37988438963: FAIL. Node20:39:29→20:40:28 =59s; Python20:39:30→20:40:14 =44s, SUCCESS; both within120s. Actual checkout `24133b2b80f482ead23fd1a56f04375feaf47bbe`, parents `9fa6ec0aef3c4280084ef52b9c0da526f8776835` + exact839, tree `db47bb5abbacdb5518116f9e1fe7aa5cdef4b3ec`. Independently fetched actual objects and computed merge-tree agree; observed PR base matches9fa6. This tree includes independent E270 as base, not source947 or any later corrected caller.

Node1067 =1058pass/1fail/0skip/8TODO. Python396 =385ordinaryOK/5skip/6expected failures. Every named outcome was compared to actual baseline37985184237. After the exact twelve authorized removals and the new288101 addition, all1066 remaining inherited Node names exist;1057pass plus8TODO remain unchanged and the mixed-case heading is the only ok→notok result (1065 unchanged). All396 remaining Python outcomes match individually after exactly the three removed names above. Raw `/private/tmp/p18c-ci37988438963.log` has7459lines, SHA-256 `659ff179a9cc8f50be1b78b5ffed941d2823e736040ee6f32c7f432b723b66a0`. Complete raw/status and named comparisons remain private, not reduced to totals. Prior TODO/skip/expected failures and historical flaky/native results are not promoted to passed.

## Independent exact-case fault and trace

Only the new nonnative canonical case file was selected locally in disposable exact839 archive. Its one positive passed (256.766959ms). Relevant actual caller fault at settings-view501 replaces `renderSections(app, own);` with `void own;`. SAME TST-288101 fails at its public mount node29 with actual0 versus expected2 (exit1). Exact source bytes are restored; SAMEcase passes (exit0). Full15s-bounded command/output/source/test/log hashes: `/private/tmp/p18c-settings-own-faults.json`, `/private/tmp/p18c-settings-288101-fault.log`, `/private/tmp/p18c-settings-288101-restored.log`. Source SHA-256 restored `83fd6d0cbd171cabe8332978911b69581bf40247917489fa94cc8706b44aab45`; final test unchanged `4074ef2b05e7704baee89c4d4e7df6bba37445ae9edb66004602f6468da51739`, directly compared to exact head.

Author prepared multiline body was read. Author later confirmed no original fault/restoration artifacts retained, only historical tool outputs/current positives. The paths relayed as author logs were actually the fresh reviewer logs above; they are counted only as reviewer evidence. No separately hashed author cycle or final author canonical raw is claimed. This limitation does not waive the real full-CI failure or prevent this HOLD.

Real testDeclarations/traceGraph/tracesTo on all2016 tracked paths of actual tested merge, including SPEC, finds134declarations/523nodes/159edges/0unread. TST-288101 is unique across the entire repository, numericID first in actual title, one component level and MOD-settings-pages module, contiguous lowercase readable guards/given/input/expect, with real requirement traces. `/private/tmp/p18c-settings-canonical-trace.json` retains the full result. The title guards include locked export, but this new caller case actually exercises the four-record plain path; separate previously approved E270 public-module plain/locked/full-catalogue evidence is distinct and is not a new local full-case run.

## Read pins and limits

| Original | Blob |
| --- | --- |
| `SPEC.md` | `1de56e76de63bfe5f3f4bb98820adad801041def` |
| `docs/architecture/ARC-038-the-site.md` | `1a583b96fa01cb37f2d277bd70036ce60dfdef83` |
| `docs/architecture/MOD-browser-store.md` | `058fd3b05cc14cb361575f16a2059f174417e8ac` |
| `docs/architecture/MOD-settings-pages.md` | `6357592c6ff7a2dd528ae959c918ad4ec1a903a4` |
| `docs/backlog/ITM-288-canonical-settings-export-import-controls.md` | `1ec50f70d61d1f5dd8ede92bbb147e9ccef24642` |
| `docs/use-cases/UC-042-manage-settings.md` | `a8c595676ef0afd54290024c928b7268c49dfbe9` |
| `docs/jobs/JOB-20261009-1939-d18w.md` | `aa87f422b5522dd35783cf1551ea6d19ccf74e6b` |
| `docs/architecture/MOD-site-frame.md` | `4349b0b66830d8f07fab12616677cbfd86ef61a3` |


Exact839 cannot proceed while its actual CI is red. The narrow obsolete assertion cleanup is supported by the accepted removal boundary; the future head is outside this decision. No source, old test, accepted document or process was changed. No full UC042, actual browser download, human release, shell/aggregate composition, local native/full/glob suite, device/personal-state access, external SSH or paid service is claimed. Root alone publishes this HOLD and coordinates the correction; no PR271, later release caller, fixture correction or future head is reviewed under this Start.
