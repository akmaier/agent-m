---
id: ITM-999
title: The participants route offers and keeps a subagent's CLI agent
level: module
realises:
  - UC-017
  - UC-049
modules:
  - MOD-settings-pages
builds_on:
  - ITM-512
tests:
  - unit
origin:
  - ITM-512's stop for two of its parts (sprint team1/92), by developer-sonnet-a
---
# ITM-999 The participants route offers and keeps a subagent's CLI agent

**REGISTER**

## Outcome

MOD-settings-pages.md:172-173: for a subagent, the participants route offers "the CLI agent that starts it, which it is
reached through". That reads MOD-participant-list's `reachedThrough` (MOD-participant-list.md:96-97). MOD-settings-pages'
uses do not name it. Without it, the Change form (`src/settings-pages/participants.mjs:669-688`, `routeOf` at `:131-143`)
would blank a `through <name>` route. `participantsOf`, imported at `participants.mjs:13`, is not named either.

**The draft for akmaier, on `main`:** MOD-settings-pages.md's `uses` and Uses name MOD-participant-list.reachedThrough
and MOD-participant-list.participantsOf, for the participants route's subagents and its list. This item waits for its
acceptance.

## Acceptance

- For a subagent, the route offers the register's CLI agents, saves `through <participant>`, and keeps that route when
  the row is changed, with tests and counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
