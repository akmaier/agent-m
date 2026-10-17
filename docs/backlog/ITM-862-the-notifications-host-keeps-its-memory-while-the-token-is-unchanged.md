---
id: ITM-862
title: The notifications' host keeps its memory while the token is unchanged
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-854
tests:
  - unit
origin:
  - ITM-854's pull request #818 (sprint team1/80), from developer-sonnet-c's findings
---
# ITM-862 The notifications' host keeps its memory while the token is unchanged

**REGISTER**

## Outcome

ITM-854's `instanceHostFollowingToken` reconnects the notifications' host only when the stored token has changed. A fault
that reconnects on every call would lose the host's memory of the texts it has read by blob. The checks would then read them
again. ITM-854's fixture reads no blob in its later check, so no test catches that fault.

A fixture whose second check reads a blob the first one read counts the requests of both. It shows that the second reads
no text again while the token is unchanged. Its counter-proof is reconnecting on every call.

## Acceptance

- Over two checks with the same token, a blob read in the first is not read again in the second, and the test pins it.
- The test fails against a host that reconnects on every call.
