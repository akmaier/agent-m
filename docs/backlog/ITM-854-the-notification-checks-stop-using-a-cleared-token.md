---
id: ITM-854
title: The notification checks stop using a cleared token
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-site-frame
builds_on:
  - ITM-825
tests:
  - unit
origin:
  - ITM-825's pull request #804 (sprint team1/79), from developer-sonnet-a's findings
---
# ITM-854 The notification checks stop using a cleared token

**REGISTER**

## Outcome

`src/site-frame/dashboard-app.mjs:525` connects the notifications' instance host with the token once, at start. After a
clear, the checks may keep sending the cleared token while notifications are on. This was read from the code, not
measured. At the start, a test clears the token with notifications on and lets a check run. It shows whether the token is
still sent. If it is, the frame reconnects that host on a clear.

## Acceptance

- After a clear, no notification check carries the cleared token, and the test pins it.
- The first commit holds only the tests, and CI is red on it if the lead holds. No stub is committed.
