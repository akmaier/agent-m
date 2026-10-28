---
id: ITM-895
title: The Bridge's window connects its host with the stored secrets
level: module
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-site-frame
builds_on:
  - ITM-882
tests:
  - unit
origin:
  - developer-sonnet-e's finding on ITM-882's pull request #848 (sprint team1/87)
---
# ITM-895 The Bridge's window connects its host with the stored secrets

**REGISTER**

## Outcome

The Bridge's window connects the instance's host with no token and no `secrets`:
`src/site-frame/index.mjs:470`, `connect(parseAddress(...))` in `startBridge`. Its comment says the window "connects no
repository until a view asks its supplied host to do so". Whether a Bridge view can commit through that host is not traced.
This is a lead, from developer-sonnet-e's work on ITM-882. If any Bridge view commits through it, a stored secret would
not be refused there (MOD-repository-hosts.md:199).

At the start, every Bridge view's use of the supplied host is read. If none writes, the item stops and reports it.

## Acceptance

- The Bridge's host passes the stored token and `secrets: secretValues(store)`, as the frame's does, and a commit through
  it that holds a stored secret is refused. A test checks this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
