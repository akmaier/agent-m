---
id: ITM-280
title: The dashboard Bridge pairing and HTTPS settings
level: module
realises:
  - UC-003
  - UC-044
  - THE BRIDGE IS PAIRED ONCE
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - THE PAGE STATES WHAT IT SENDS WHERE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-settings-pages
builds_on:
  - ITM-263
  - ITM-265
  - ITM-275
  - ITM-276
  - ITM-279
tests:
  - unit
origin:
  - UC-003
  - UC-044
---
# ITM-280 The dashboard Bridge pairing and HTTPS settings

**REGISTER**

## Outcome

Implement the pairing/configuration slice of the accepted bridge route in public view, reached from Settings.
The person enters the source app's address and copied token; Pair uses public pair(address, token), stores its returned
bridge settings on success and reports its named failures without claiming success. Explain the shared Pages origin
and where the token goes before storing or sending it; hide secrets until Show. Reload, Change and real Clear use the
accepted store interfaces. Reuse the shared frame and bridge-pairing explanation.

Offer the accepted jump-host fields and an already-configured trusted HTTPS address with its optional web-server login.
Store the accepted jump-host record and the selected Bridge address/token separately; never extend bridge's persisted
shape with a login. An HTTPS configuration may be saved from the app's copied token even when this browser cannot pair
over loopback. Saving it is explicitly untested, not successful pairing or a working endpoint. ITM-269 reads httpsAddress
and login into BridgeSettings for its actual endpoint-test request, with credentials only in headers and endpoint args
only in the body. It must report that request's result before calling the endpoint working.

This item supplies configuration, not a tunnel, proxy server, certificate, general testBridge/agents view, download,
signed distribution or full UC-044 setup. State the configured HTTPS route's prerequisite: trusted certificate,
web-server login and forwarding only for this instance's origin. Actual reachability is measured by ITM-267.

## Acceptance

- New unit tests through public view/Route with controlled dependencies observe Pair success/refused token/unreadable
  response, browser-local reload and real Clear. Failure is actionable and never becomes a working state.
- The configured HTTPS address/login and Bridge token survive reload in their accepted separate keys. Saving HTTPS is
  explicitly untested and makes no hidden endpoint request; named direct/HTTPS destination disclosures precede actions.
- Secrets are hidden until Show and enter no URL, cookie, repository or log. Clear removes actual storage entries;
  endpoint settings and existing direct endpoint/add-product tests remain intact.
- Only src/settings-pages/ and new tests naming MOD-settings-pages change. First commit is tests-only with red CI;
  final head has full green CI; every new case has an executed planted-fault/restored-positive proof. No paid service.

## Integration prerequisite

After the owned route is approved and merged, reach it from the working dashboard through a separately reviewed,
bounded between-jobs public-view caller if the current adapter does not already route it. No setup logic or parser is
implemented in that adapter. Name the merged owned route and actual dashboard entry before selecting269; independent
system/release coverage must observe the public setup rather than merely seed its storage. This item is selected
in Sprint16 by its explicit Start decision: developer-terra-c owns source, developer-terra-e independent release
coverage after the approved source merge. Selection and current assignments live in docs/backlog/sprints/16.md.
