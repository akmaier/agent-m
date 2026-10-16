---
id: ITM-494
title: The routes of a subagent and of an endpoint whose key is a CI secret
level: module
realises:
  - UC-017
  - UC-049
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
modules:
  - MOD-runtimes
  - MOD-review-pages
  - MOD-resource-list
builds_on:
  - ITM-483
  - ITM-489
  - ITM-493
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: routesFor
  - MOD-runtimes, accepted by akmaier at 4345829a (draft 2fcb4a2e): `routesFor(participant, participants, product, needs)`
---
# ITM-494 The routes of a subagent and of an endpoint whose key is a CI secret

**REGISTER**

## Outcome

`routesFor` offers a subagent the routes of the participant `reachedThrough` names, its job's input naming the
subagent; and a model endpoint whose route names the CI secret of its key also the server's runners, where opencode works
with that endpoint (MOD-agent-processes' Endpoint).

It builds against MOD-runtimes' file as accepted at `4345829a`, whose `routesFor` takes the participants:
`routesFor(participant, participants, product, needs)`. Its callers change with it. The three calls in MOD-review-pages
(`src/review-pages/jobs.mjs`) pass the participants their page already read. MOD-resource-list changes no code, only
the call in its test.

What the module file leaves unstated, and what is built:
- **A subagent.** A participant whose route `reachedThrough` names another is checked with MOD-participant-list's
  `eligible(participants, { capabilities: [] })`.
  - Left out there — reached through itself, or through no CLI agent among `participants` — it gets no offer, as a
    person gets none.
  - Otherwise it gets the offers of the participant it is reached through, given by the same rules as that participant's
    own.
- **Naming the subagent in the job's input.** That is the caller's, when it prepares the job (ITM-495, ITM-505).
  `RouteOffer` keeps its fields, `{ route, available, reason }`.
- **An endpoint whose route names the CI secret of its key** (`endpoint <name> secret <NAME>`). It gets the tab's offer
  first, as today, and then `{ kind: "ci", runner: "hosted" }`. That second offer is available exactly when a CI agent's
  hosted offer is — the product has the job workflow — with the same reason otherwise.

The existing tests whose call changes, named here. In each, only how the test calls `routesFor` changes, and every
expected result stays:
- TST-472706 to TST-472710 (`tests/runtimes-routes.test.mjs`), whose helper passes the fixture's participants;
- TST-472598 (`tests/resource-list-services.test.mjs`, MOD-resource-list);
- TST-375101 (`tests/release-uc-017-configure-participants.test.mjs`), a release test. It is changed by a Developer who
  implemented none of MOD-runtimes' routes (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`), never by this item's
  implementer.

## Acceptance

- Fixture participants give the routes the module file states, a self-hosted runner still refused for a public
  repository.
- A subagent through a CLI agent of `participants` gets that agent's offers; one through itself or through no CLI agent
  gets none. An endpoint with a CI secret gets the tab's offer and the hosted runner's.
- The first commit holds only the tests and the changed calls, and CI is red on it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); a
  further existing test that the change turns red is not changed here: the Developer stops and names it.
