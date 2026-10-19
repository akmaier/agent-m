---
id: ITM-1004
title: The Bridge's window shows the origin it is paired with
level: module
realises:
  - UC-044
  - THE BRIDGE IS PAIRED ONCE
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-1003
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-14, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1004 The Bridge's window shows the origin it is paired with

**REGISTER**

## Outcome

UC-044-install-and-pair-the-bridge.md:81-82 (step 4): "… and tests it; the bridge's window shows *paired with
`<owner>.github.io`*."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-desktop-shell.md:171-174:

> - *Pairing* — the Bridge's address and its pairing token with *Copy* (`THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS
>     WINDOW`); *paired with* the origin MOD-bridge-http's `pairedWith()` gives, or *not yet paired since this start*; and
>     *Pair anew*, a decision that names that every paired browser must pair again (`THE BRIDGE IS PAIRED
>     ONCE`).

## Acceptance

- A unit test naming MOD-desktop-shell, over a served Bridge: after a request with the token from the instance's origin,
  the Pairing view says *paired with* that origin; after *Pair anew*, it says *not yet paired since this start* until the
  next such request.
- Counter-proof: a request from another origin, or without the token, leaves *not yet paired since this start*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
