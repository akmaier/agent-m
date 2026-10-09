---
id: ITM-288
title: Canonical Settings export/import controls
level: module
realises:
  - UC-003
  - UC-042
  - UC-044
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-277
  - ITM-283
tests:
  - unit
origin:
  - UC-042
  - UC-044
---
# ITM-288 Canonical Settings export/import controls

**REGISTER**

## Outcome

Add the accepted Settings export/import controls by composing MOD-browser-store exportSettings/importSettings, rather than another codec. Before a person exports, state the stored secrets and their grants and that whoever holds the file can use them; explain optional passphrase locking and that the passphrase cannot be recovered. Download only on the person’s click. Import a chosen plain or locked canonical file, ask for its passphrase where needed, keep existing settings unchanged, add absent settings, list complete added/kept sets and show NotAnExport/WrongPassphrase without partial writes. The implemented canonical catalogue is the scope; do not claim unfinished mailbox/foreign catalogue support or complete UC-042.

## Acceptance

Actual settings route cases observe constructed export bytes, correct instance/every implemented stored value including jump-host/login/remote-session/Bridge secrets, locked unreadability and successful public import. Observe all added/kept sets and preserved existing values, and failed input into a clean destination with absent valid keys proving no partial new write. Notice precedes download; no secret enters network, URL, repository or logging. Existing endpoint/Bridge settings and shared-origin notices remain.

The actual public Settings caller docs/assets/dashboard/settings/endpoints.mjs already calls this canonical settings route with openStore(app.T.instance); built.json publishes it. Exercise this positive composition with controlled DOM/storage. The separate legacy settings-view export controls still call the old codec: after the module merge, root separately scopes removal/replacement of those duplicate controls between jobs and proves the actual public download uses the canonical path. That integration is necessary before full public-delivery acceptance, not part of this owned source change.

Own src/settings-pages/settings.mjs and uniquely named private helper files plus new tests. ITM-287 owns bridge.mjs independently; no index/shared helper/legacy caller edits here.

## Verification boundary

Only the declared owned source and new module-named tests change. The first writing commit contains only failing new tests with actual red CI; final exact-head complete Linux CI is green, with existing expectations preserved. Each new case has a readable unique numeric TST, level/module/guard declarations, precondition/input/expected result and its actual relevant guarded-code fault, failure and byte-exact-restored positive under SPEC §12. Canonical testDeclarations → traceGraph → tracesTo proves the guards. Independent release writing follows the approved source merge; module readiness, public composition and aggregate release remain distinct.

No local broad/glob/full or native desktop/browser tests, Mac apps, clipboard/focus/settings/device state, personal export, external SSH/webserver or paid service. Explicit controlled nonnative files only; full/native integration runs on GitHub Linux. No SPEC/use-case/architecture/process change or human acceptance is implicit.
