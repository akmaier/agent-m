---
id: ITM-287
title: Canonical remote-session setup
level: module
realises:
  - UC-003
  - UC-011
  - UC-042
  - UC-044
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
modules:
  - MOD-settings-pages
builds_on:
  - ITM-280
  - ITM-282
  - ITM-283
tests:
  - unit
origin:
  - UC-011
  - UC-044
---
# ITM-287 Canonical remote-session setup

**REGISTER**

## Outcome

Extend the existing public Bridge route with the accepted + Remote session flow. Read canonical jump-host and remote-session settings; allocate the lowest unused inclusive port through allocatePort, store remote-session:<name> with its accepted port/token and reuse it on reopening. Show the canonical two tunnel commands for a computer without a Bridge and Apache/nginx proxyConfiguration for the configured instance origin/session paths. Show exhausted-range and invalid/setup-required input without falsely reporting a tunnel or tested HTTPS connection. Preserve existing pairing/HTTPS login storage and normal browser-direct endpoint access.

## Acceptance

Actual route cases construct canonical storage, choose/create distinct sessions, observe persisted port/token via readSetting after reopen, preserve existing sessions and show allocation exhaustion. Rendered commands and proxy text come from the delivered public builders and retain loopback binds, each route, independent web login/Bridge token and configured origin/preflight/TLS structure. Secrets remain hidden until Show where applicable, with disclosures before export/copy; generating setup text makes no request or process start. Existing dashboard-app #bridge positively mounts this same route with openStore: module cases are supplemented by bounded public-caller evidence, not an invented route.

Own src/settings-pages/bridge.mjs and uniquely named private helper files plus new tests. ITM-288 concurrently owns settings.mjs: neither writer changes index.mjs or the other’s files/shared helper. Any demonstrated shared edit is separately scheduled before writing. No legacy store migration or dashboard caller edit is hidden in this item.

## Verification boundary

Only the declared owned source and new module-named tests change. The first writing commit contains only failing new tests with actual red CI; final exact-head complete Linux CI is green, with existing expectations preserved. Each new case has a readable unique numeric TST, level/module/guard declarations, precondition/input/expected result and its actual relevant guarded-code fault, failure and byte-exact-restored positive under SPEC §12. Canonical testDeclarations → traceGraph → tracesTo proves the guards. Independent release writing follows the approved source merge; module readiness, public composition and aggregate release remain distinct.

No local broad/glob/full or native desktop/browser tests, Mac apps, clipboard/focus/settings/device state, personal export, external SSH/webserver or paid service. Explicit controlled nonnative files only; full/native integration runs on GitHub Linux. No SPEC/use-case/architecture/process change or human acceptance is implicit.
