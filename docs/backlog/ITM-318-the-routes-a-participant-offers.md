---
id: ITM-318
title: The routes a participant offers
level: module
realises:
  - UC-005
  - UC-007
  - UC-010
  - UC-011
  - UC-017
  - UC-019
  - A RUNTIME IS INTERCHANGEABLE
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
modules:
  - MOD-runtimes
builds_on:
  - ITM-253
tests:
  - unit
origin:
  - UC-005 step 3
  - UC-010 step 1
  - UC-011 1c
  - UC-017 step 3
---
# ITM-318 The routes a participant offers

**REGISTER**

## Outcome

MOD-runtimes' `RouteOffer`, `ResourceNeed` and `routesFor`, as its file states them, in `routes.mjs`. From a
participant's route in the register — `endpoint <name>`, `bridge <bridge> server <name>`, `ci hosted secret <NAME>`, `ci
runner:<label> secret <NAME>`, `bridge <bridge or session> agent <agent>` — the routes it offers: a model endpoint in
the tab or through its Bridge; a CI agent on the server's runners, or on its self-hosted runner only for a product the
server reports as private, refused with the reason otherwise; a CLI or sandboxed agent through its Bridge; the CI route
unavailable, naming the job workflow's files, while the product has none; a job that needs a resource reached only by a
Bridge or a runner offered only on the routes that reach it. Pure: no request. The pages that start a job (ITM-361,
ITM-362, ITM-363) and the participants page (ITM-352) call it.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists: for each route form, with a private and a public
  product, with and without the job workflow, and with the needs `bridge` and `runner:gpu`, the offers and each
  refusal's reason — among them a self-hosted runner refused for the public product, and a `runner:gpu` need offered
  on the runner labelled `gpu` and not on the server's runners.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
