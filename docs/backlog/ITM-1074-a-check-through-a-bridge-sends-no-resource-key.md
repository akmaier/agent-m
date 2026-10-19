---
id: ITM-1074
title: A check through a Bridge sends no resource key
level: module
realises:
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
  - UC-040
modules:
  - MOD-settings-pages
builds_on:
  - ITM-997
tests:
  - unit
origin:
  - ITM-1028's stop (sprint team1/93), from developer-sonnet-a's finding in what ITM-997 merged (#997)
---
# ITM-1074 A check through a Bridge sends no resource key

**REGISTER**

## Outcome

SPEC.md:2262-2264: "A credential stored for a resource leaves the browser only as the authorisation of requests to that
resource's server." `src/settings-pages/resources.mjs:181`, merged with ITM-997, sends an endpoint resource's key kept in
this browser (`resource-key:<name>`) to the Bridge in the probe `endpoint-models` (`key: keyOf(resource)`). That request goes
to the Bridge's address, not to the resource's server. So the sprint branch breaks the sentence.

## Acceptance

- *Check* through a Bridge sends no resource key in any request. An endpoint that needs its key answers with its diagnosis,
  which the page shows.
- A test shows that no request to the Bridge carries the stored key. Counter-proof: with the key sent, the test fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
