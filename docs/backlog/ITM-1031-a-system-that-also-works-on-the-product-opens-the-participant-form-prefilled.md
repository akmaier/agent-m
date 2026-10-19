---
id: ITM-1031
title: A system that also works on the product opens the participant form prefilled
level: module
realises:
  - UC-040
  - ONE SYSTEM IN TWO ROLES IS TWO ENTRIES
modules:
  - MOD-settings-pages
builds_on:
  - ITM-642
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-10, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1031 A system that also works on the product opens the participant form prefilled

**REGISTER**

## Outcome

UC-040.md:156-159 (2a): "a link opens UC-017 with type and address prefilled. The two entries share no fields."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-settings-pages.md:179-180:

> - `participants` — the instance's participants in a form from the participant schema, a new one prefilled with the
>     parameters `type` and `address` where the route is opened with them: type, model, context and price, …

MOD-settings-pages.md:203-204:

> product, *Add as participant*, which opens `participants` with its parameters `type` and `address` filled in;
>     *Copy from the instance*.

## Acceptance

- A unit test naming MOD-settings-pages: *Add as participant* on an endpoint resource opens `participants` with
  `type` and `address`, and the form of a new participant shows them filled in.
- Counter-proof: the form without the parameters stays empty.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
