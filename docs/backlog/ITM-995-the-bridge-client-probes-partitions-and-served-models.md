---
id: ITM-995
title: The Bridge client probes partitions and served models
level: module
realises:
  - UC-040
modules:
  - MOD-bridge-client
builds_on:
  - ITM-960
tests:
  - unit
origin:
  - ITM-642's stop before its first test (sprint team1/92), by developer-sonnet-c
---
# ITM-995 The Bridge client probes partitions and served models

**REGISTER**

## Outcome

MOD-bridge-client.md:157 states `probe(bridge, kind: "agent" | "endpoint-models" | "partitions", args)`, and the protocol
(`protocol.mjs:26`) names all four kinds. `src/bridge-client/index.mjs:191` accepts only `endpoint-test` and `agent`, and
throws a `TypeError` for the other two.

MOD-resource-list's `checkPlan` (`src/resource-list/pins.mjs:49`) plans exactly these two probes for a resource's *Check*
through a Bridge (MOD-settings-pages.md:187-190).

**First task:** read whether the Bridge app answers both kinds. If it does not, the item stops and names the Bridge's
missing part.

## Acceptance

- `probe` sends `endpoint-models` and `partitions` as the protocol states them and returns the Bridge's answer, against a
  fake Bridge, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
