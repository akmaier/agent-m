---
id: ITM-997
title: The resources page checks through a Bridge and pins a Hub resource
level: module
realises:
  - UC-040
modules:
  - MOD-settings-pages
builds_on:
  - ITM-642
  - ITM-995
  - ITM-996
tests:
  - unit
origin:
  - ITM-642's stop before its first test (sprint team1/92), by developer-sonnet-c
---
# ITM-997 The resources page checks through a Bridge and pins a Hub resource

**REGISTER**

## Outcome

The part of MOD-settings-pages' routes `resources` and `resources/instance` (MOD-settings-pages.md:187-190) that ITM-642
leaves out:
- *Check* through the Bridge the route names, with the probes of ITM-995;
- the pin of a Hugging Face Hub resource, read with ITM-996's `hubFacts`.

## Acceptance

- In a small DOM with a fake Bridge and a fake Hub, *Check* through a Bridge shows the probe's answer, and a Hub
  resource's pin is read and shown, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
