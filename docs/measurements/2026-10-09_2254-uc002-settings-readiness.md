# UC002 and Settings readiness for the next planning job

**MEASUREMENT — 2026-10-09 22:54:00 UTC.** Independent po-sol / gpt-6.1-sol assessment for
JOB-20261009-2244-p18u; actual Taken 22:45:45 UTC. Usage/cost: null.
This supplies evidence for fresh planning after Sprint18 closes; it selects no item and decides no gate.

## Inputs and method

- Document base: `a6aaf7b9a86486d84a1ddff7708f1a3b9e4344be`; product source:
  `d855bed3f1a90f79e9ee9f7eb09d6e9b297a2298`, tree `c42ea71be322aa0c74c223cd10f60fd1aefbf481`.
- Original AGENTS/SPEC/README, Team2 process/participants/Scrum, Sprint18, accepted UC003/042/047 and
  affected architecture were retained only after exact original-blob verification. Of 63 prior originals,
  62 were unchanged; changed JOB2233 was reread in full. Fresh full reads include this Start, UC002,
  UC017, ITM290, backlog order, ITM256/257/268/283, catalogue/participant/process contracts and
  the actual public process/Settings/release composition. Desktop compose/main/preload/window and
  accepted MOD-desktop-shell/MOD-agent-processes were read before dependency conclusions.
- Actual read pins: `/private/tmp/p18u-read-pins.json`, SHA256
  `3c5601ec1baae19a9b7f34310a18931df992464b184197f97a67668e3c3cbc23`.
  It distinguishes personally retained originals, fresh full reads and retained source-byte verification.
- Existing controlled DOM/host fixtures ran in an exact d855 archive, `/private/tmp/p18u-d855`:
  `/opt/homebrew/bin/node --test tests/system-uc-002-choose-a-process-model.test.mjs`
  `tests/release-sprint-06-uc-002-implementation-pages.test.mjs tests/dashboard-canonical-settings-export.test.mjs`.
  Actual run 22:49:27.581458–22:49:28.607600 UTC, exit0, 1.025864s, 43 pass, no fail/skip/TODO.
  Complete argv/time/status/stdout/stderr and before/after input hashes are retained in
  `/private/tmp/p18u-selected-receipt.json`; changedBytes is empty. This count describes that run only.
- Complete stdout: `/private/tmp/p18u-selected.stdout`, SHA256
  `53bdf433dfb5161b39a4b818e0371a2c912991593976557dbdb147fe15d28c18`; stderr is empty.
  Seven-artifact manifest: `/private/tmp/p18u-evidence-manifest.json`, SHA256
  `31256cba5badb21a90707d4273448bfbc31ed6a92fb3b20777db6a91c27205eb`.
  No source/test bytes changed; no new test or planted fault was required for this assessment.

## UC002: delivered observations and limits

The public `docs/assets/dashboard/process-view.mjs` connects the instance and chosen product and calls
MOD-implementation-pages' process route. `process.mjs` reads their default-branch snapshots, the model
catalogue and participant register; schemaForm edits one declaration; MOD-product-process findings
control Save; the author's own product commit stores it. No model is assumed before selection.

The selected existing system/release cases exercise the five-model groups and risk explanations,
roles/processing places, phases/transitions/verification pairs/gates, branches and their end gates,
practices, source-marked requirement additions, DoD, one-click author Save and reopening. They also
exercise custom model data, later model changes without deletion, missing-person and missing-capability
paths, a forbidden processing-place warning with Save still possible, no process requirements, and an
added gate without replacing Kanban. Every selected case passed through its existing controlled fixture.

The filledBy question remains open as a product question, not an evidenced defect. UC002 step4 says
“offers only participants that have every capability the role needs”; alternative4a requires disabled
Save when a person role has no person. Actual `process.mjs:311–315` displays filledBy and calls
`eligible(allParticipants, { capabilities: role.capabilities })`; `declaration.mjs:139–147` detects the
missing person; schemaForm disables Save for that error. The existing known positive assigns a person
and permits Save, then the missing-person case names the role and disables Save. There is no evidence
here justifying an extra filledBy filter, changed accepted behavior or new backlog defect.

`workflow.mjs` builds the workflow from the selected model, selected tabled practice additions and
process requirements. The additional full original findings test includes selected/unselected practice
additions, but that unit file was read rather than executed in this assessment. The delivered process
view is distinct from executing UC002's final continuation into plans/backlogs/jobs. Those later flows
were not walked by the selected tests. Likewise alternative4c's warning/declaration behavior is observed;
these fixtures do not send a subsequent job to prove restricted source content never reaches its holder.
These are coverage limits, not demonstrated failure nodes or new item selections.

## ITM290: map the actual Settings page

The public `#settings` route currently combines `docs/assets/dashboard/settings-view.mjs` with the
canonical Settings slice through `dashboard/settings/endpoints.mjs`. The canonical module owns endpoint,
Bridge and jump-host controls plus the single canonical export/import. Legacy sections still own
repository connections/tokens, products, remote sessions, product settings and notifications.
The built-files inventory does not include `settings/instance.mjs`, the mailbox Settings slice or the
participants page. Generic instance/product Edit-in-place from UC042 step3 remains an accepted contract,
not a delivered universal Settings editor; tabs must preserve existing Save forms and must not claim
those absent sections are implemented by rearranging the page.
TST288101 passed the public mount, four canonical setup-record round trip and zero repository writes;
it also checks that the removed duplicate legacy export controls remain absent.

| Preliminary tab | Actual controls to organize and preserve |
|---|---|
| General | Shared-origin/storage notices and acknowledgement; canonical export/import with passphrases and results; existing browser-wide clear. Keep browser scope explicit. |
| Repositories | Instance GitHub token, connected products, product GitHub and GitLab tokens, expiry/renewal/refusal notices and existing Test/Change/Clear/Show; product pseudonymisation/collaborator forms, consent and their explicit Save/Remove actions. Distinguish browser credentials from instance/chosen-product repository data. |
| Endpoints & Agents | Canonical model endpoint controls, guided endpoint/Bridge setup, Bridge token/address, jump host and existing remote-session controls/commands. Preserve existing participant links; an unbuilt participant view is not delivered merely by giving this tab its name. |
| Usability | Existing notification status/enable/disable explanations and permission behavior. No speculative preference is needed to fill the tab. Preserve the person's prior delivery confirmation. |

All current controls, explanations and scope sections must stay reachable. Switching a tab must preserve
unfinished token/address/form/passphrase input, acknowledgements and shown test/import results, without
requests, permission prompts or repository writes. Existing explicit Show/Hide and action semantics must
remain; tab selection must not expose a secret implicitly. Current legacy `viewSettings` replaces main
HTML and canonical `route.render` replaces its children: using those whole-page rebuilds simply to switch
panes would discard DOM-held input/results. This is an implementation dependency to preserve and test,
not a failure observed in a tab implementation that does not yet exist.

MOD-settings-pages is the owned delivery boundary. `src/site-frame/look.css` belongs to MOD-site-frame;
shared appearance work must be assigned to its owner where needed. The public dashboard currently also
loads `docs/assets/style.css`; that fact does not permit arbitrary legacy styling under a module job.
SPEC §11 “AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES” confines module work to owned folders/tests;
“WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS” permits a separate caller PR only for its stated forms,
such as making old code call a delivered module or removing what it now provides and its tests.
The owned prerequisite must be available before that caller is changed; no new framework or store is needed.

Actual rendered narrow/desktop layout is still missing for the requested four-tab outcome. ITM290 explicitly
requires controlled Linux browser observation of readable labels, usable touch controls and no overflow,
including long addresses/notices/commands. The current small DOM fixtures prove behavior, not geometry.
A future selected job needs the actual public page on that Linux route plus keyboard/selected-state/focus
and state-preservation evidence. No Mac/phone UI or repeated notification experiment is called for.

## Grounded dependencies for fresh planning

ITM290 has a delivered canonical Settings prerequisite (288) and a working public composition to replace
within the existing ownership/process rules. The tab organization, preservation and Linux rendered-layout
outcomes are not delivered yet. That observation does not select it during Sprint18.

The accepted desktop settings/export foundation can use delivered MOD-browser-store.readExport,
MOD-bridge-client.tunnelCommands and the key/tunnel interfaces. Its actual `compose.mjs` currently starts
a loopback server with jobs handlers only; fixed preload calls and the window expose pairing, pause/resume,
port retry and quit. There is no delivered desktop settings file/import route or its fixed-call consumption
of the canonical export, nor tunnel lifecycle composition there. A bounded desktop foundation would need
that actual owned delivery and controlled verification; passing lower-level tunnel cases is not its proof.

An Agents window consumes `MOD-agent-processes.installedAgents`. The exact git-tree inventory finds the
known-positive desktop source files but no `src/agent-processes/` producer. It therefore cannot be called
source-ready solely because its window could be separate from Settings/tunnels. This does not establish
that building discovery is necessary for UC003's own-model endpoint goal, and does not recommend a new
producer item to obtain four parallel outcomes. Update UI/prerequisites also cannot be assumed delivered
from the accepted desktop contract alone. The fourth independent source-ready outcome remains unresolved.

ITM257's public prerequisite is now concrete: the built release view calls MOD-test-pages' release route,
which prepares a candidate, reads completed run/report evidence and accepts with recorded limitations.
ITM257 requires new whole-UC013 main/alternative system and per-requirement release cases, using its
fixture server/completed-run route, by a participant who implemented none of 247–256 or the caller change.
Existing report-reopen tests do not substitute for that whole flow. Independent test-only work is a grounded
candidate for fresh planning; author independence must be verified there, and no item is selected here.

Standing UC003/002/047 implementation priority is retained. The requested UC004–006 backlog fill remains
after Settings290 delivery. Current exact PR274 e80 remains HOLD; this assessment neither waives its red
native acquisition evidence nor diagnoses the unknown apt timeout cause. D2242's investigation is separate.
Sprint18 aggregate/release/close, next sprint selection and any future head require their own assigned jobs.
