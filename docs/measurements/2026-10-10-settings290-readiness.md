# Selected290 producer and public-context readiness

**MEASUREMENT**

Observed by po-sol / gpt-6.1-sol under JOB-20261010-0026-p19settings. Taken 2026-10-10 00:28:48 UTC before isolation;
repository observations completed 00:33:13 UTC. Published base: 5a23fac197396e9b4ebfa1ba64a8e934a0fe6e1b.
New isolated branch: codex/p19-settings-readiness. No source/test/accepted-contract change or local test execution.
Usage/cost: null. Root records End, publishes and dispatches; this is a readiness decision, not human acceptance.

## Original requirements and decision

AGENTS §1: “Read originals, never another agent’s summary.” §2: “EVERY SPEC CHANGE MUST BE COORDINATED WITH THE USER.”
SPEC §11 requires implementation against public interfaces in assigned modules; the selected item names its modules.
These original rules are applied without editing SPEC, accepted use cases, architecture, process or participants.

MOD-site-frame Interfaces already declares `instance: { repository: string, host: Host }` and
`product: ProductContext | null`; ProductContext holds address, kind and Host. It is not a missing Host contract.
MOD-personal-data Interfaces: `settingsSchemas() -> Promise<{ settings: Schema, collaborators: Schema }>` and
`pseudonymisationOf(settings: Document | null) -> "on" | "off"`. Its Data owns front matter pseudonymisation on/off
and Name/Account/Agreed yes collaborators; missing file/key means on. The accepted owner approval identifies blob
4daf5fb0befa4c06f11fac61b11e04c757ef4ed9.
MOD-browser-store Interfaces: `clearEverything(store: Store) -> void` removes every instance entry;
`secretValues(store: Store) -> string[]` supplies stored secrets for refusal of a repository commit.

Decision:290 remains selected and incomplete. Add only MOD-personal-data schemas/reader and MOD-browser-store
whole-clear/secret-value foundation to its explicit module assignment. D next receives a fresh personal-data source
job, then a separate browser-store job. B receives a fresh full Settings consumer job after those prerequisites.
Old B source scope is not broadened and its checkpoint is not accepted as complete. Later caller composition remains
a separate between-jobs assignment. Root must publish correctly scoped Starts before source work. Selection stays
290/291/292/257, WIP4, root plus at most three active children. No additional privacy/mailbox/expiry/search implementation.
Independent source/release gates still apply; no omission is waived because a dependency is absent.

## Failure nodes and known positives

Public path: docs/assets/dashboard-app.mjs:501 route → :543–546 views.routes dispatch →
docs/assets/dashboard/settings-view.mjs:1016 viewSettings → :443 findSections → :505 renderSections →
docs/assets/dashboard/settings/endpoints.mjs:13 context → :28 settings route.render → src/settings-pages/index.mjs.
The adapter supplies instance.repository and product:null, while the accepted route context includes both Hosts.
Expected: the caller constructs that existing context for the actual chosen product and preserves every mapped control.
Verification at the node: pinned adapter text shows missing host/product; accepted context text shows the required fields.
No context architecture change is necessary.

Product path: settings-view.mjs:851 loadProductSettings → product tree/blob and app.fileText → legacy pseudonymiser
reading → off/consent forms → dashboard/writes.mjs:119–129 savePseudonymisation/saveCollaborators → trusted authority,
opened blob and product write target. Existing public controls commit with the person's product token, or refuse/read
only when it is absent. Legacy settings use a body bullet, and collaborators use Agreed on dates; accepted schemas
own canonical front matter and Agreed yes. Expected replacement preserves off, names/accounts/consent dates,
unrelated text and stale/permission refusal. No silent default-on or erased consent is permissible. This is a required
compatibility verification at the read/save node, not permission for a new format contract or migration API.
Legacy Remove commits withdrawal and explains history; it does not prove the whole accepted current-file finding flow.
This review claims preservation of implemented controls, not whole UC042 completion.

Known-positive absence check: `git ls-tree -r --name-only 5a23fac src/browser-store src/personal-data` returns
browser-store/index.mjs, catalogue.mjs, store.mjs and export.mjs, and no personal-data folder. Original accepted owner
and its approval are present. Browser-store/index.mjs explicitly marks clearEverything/secretValues unbuilt, and its
actual exports confirm the missing producers; list/read/write/export/import/readExport are delivered.
Repository-hosts connect/Host and Documents reading/forms plus artifact-edits.saveFile are delivered; no new cross-module
API is needed. Canonical/legacy credential adapter mirrors test/expiry state; clears must not resurrect old tokens.

Checkpoint 2e37907d8eec159c3260b8bbf59d3f965af4a75b adds mounted tabs, basic credential lines, export, endpoint/Bridge
slices and simplified notification controls. Its repositoryLine has Show/Change/Clear, but lacks existing Test/Save,
expiry/refusal/renewal and chosen-product schema/read/consent/save controls. Products are treated as a generic stored
credential line. Its two new tests check mounted tab/form state, not those missing behaviors or rendered geometry.
Expected: all mapped working controls and explanations remain reachable with visible browser/instance/product scope;
actual served public narrow/desktop Linux layout evidence is still required before290 completion.

Retained first-red CI38008168162 on 24f8579187c1750b013e7876bd28f15867509f1e supplies known positive controls:
PASS181 off acknowledgement/trusted commit;183 back on;184 consent name/account/date;186 Remove/history;
474/476 public release product controls;760 collaborator write authority;808 lossless parse/format;809 consent/Remove.
Only new TST290001/002 fail because tabs are absent. Node:1077 pass,2 fail,8 todo; Python:396 pass,5 skip,6 xfail.
Retained full raw log /private/tmp/root-p19-ci-38008168162.log SHA256:
adca7c12143782f1b8f09808aac4c66cf0f15b75fd544e8497f293638e347f6c (independently hashed).
No new CI run or local browser/native/full execution is claimed.

## Reproducible original pins and limits

|Original at published base|Git blob|
|---|---|
|AGENTS.md|7e8f20ca35cd48a5250d143b07a469d46986f123|
|SPEC.md|1de56e76de63bfe5f3f4bb98820adad801041def|
|MOD-site-frame|4349b0b66830d8f07fab12616677cbfd86ef61a3|
|MOD-personal-data|4daf5fb0befa4c06f11fac61b11e04c757ef4ed9|
|MOD-browser-store|058fd3b05cc14cb361575f16a2059f174417e8ac|
|settings/endpoints.mjs|8291dc993ec54c87d13e1fa4857d74f876c631a6|
|settings-view.mjs|15a565effd0697edbd2fd412a042b12bc6201e9f|
|pseudonymiser.mjs|a9f2cd08c831b3b3cb0df66866eff0746014e66f|
|browser-store/index.mjs|a0dc72ce0a08d2a263518e7176627a571788b391|

Read original job, AGENTS/SPEC/README/process_team2/participants_team2/scrum-wip, Sprint19/item290,
affected UC042/003/017/047/001/014/040 and the named module originals. Textbook register and relevant Scrum/principles
passages were consulted before questions. Read actual callers, token adapter, notification/product/save paths and the
same-scope tests: Settings Python page/disclosure/core; endpoint and notification wiring; notification components;
settings export/import, canonical export, browser-store/list/export and product-store migration/last-test;
pseudonymiser; UC042 sections of dashboard review/release flows; B's exact tab cases. Retained Linux CI corroborates
those actual controls; this is not a fresh exhaustive release verification. No DOM harness supplies layout geometry.
Fresh source jobs must read their complete original test scopes and perform the declared gates. Native/full/rendered
layout verification stays on controlled GitHub Ubuntu; no local personal device, external service or paid work occurred.
