---
id: ITM-996
title: hubFacts reads a model's or dataset's facts from the Hugging Face Hub
level: module
realises:
  - UC-040
modules:
  - MOD-reuse-facts
builds_on:
tests:
  - unit
origin:
  - ITM-642's stop before its first test (sprint team1/92), by developer-sonnet-c
---
# ITM-996 hubFacts reads a model's or dataset's facts from the Hugging Face Hub

**REGISTER**

## Outcome

MOD-reuse-facts.md:108-110 states `hubFacts(id) -> Promise<Fact[]>`: a model's or dataset's revision, licence and whether it
is gated or private, with `HubBlocked { reason }` and `NotFound { address }`. `src/reuse-facts/index.mjs:329-333` always
throws `NotBuilt` ("hubFacts is not part of ITM-435"). `registryFacts`, the known positive, is built.

MOD-settings-pages' resources page reads a Hub resource's pin through it.

## Acceptance

- `hubFacts` gives the facts the module file names for a fixture model and a fixture dataset, each with its address and
  date. It gives `HubBlocked` for a Hub that does not answer and `NotFound` for an unknown identifier. A test checks each
  against a fake fetch, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
