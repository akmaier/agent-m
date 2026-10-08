---
id: ITM-279
title: The jump-host setting in the browser store
level: module
realises:
  - UC-044
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - CONFIGURATION LIVES IN THE BROWSER
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-browser-store
builds_on:
  - ITM-259
  - ITM-272
tests:
  - unit
origin:
  - UC-003
  - UC-044
---
# ITM-279 The jump-host setting in the browser store

**REGISTER**

## Outcome

Implement only the accepted jump-host catalogue entry, using existing openStore/readSetting/writeSetting/clearSetting
and listSettings. Preserve its accepted { hostname, user, sshPort, portRange, httpsAddress?, login? } value. The optional
web-server login is secret; the list describes what it grants without returning it. Existing bridge holds address/token.
Remote-session allocation, exports/imports and tunnel provisioning remain separate work.

## Acceptance

- New public-interface unit tests observe persistence after reopening, two-instance isolation and removal of the actual
  jump-host storage entry, including its login, on Clear.
- listSettings includes jump-host, set or unset, with the accepted SettingInfo fields and setup route bridge; neither
  login nor other stored values appear in its metadata. Existing endpoint, pairing and settings-list tests remain green.
- Unknown settings are still refused; no cookie, request, URL, repository or log receives these settings or credentials.
- Only src/browser-store/ and new tests naming MOD-browser-store change. The tests-only first commit has red CI, final
  head has full green CI, and each new case has an executed fault/restoration counter-proof. No paid service is called.
