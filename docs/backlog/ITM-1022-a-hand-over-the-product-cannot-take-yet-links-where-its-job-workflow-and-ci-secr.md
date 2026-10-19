---
id: ITM-1022
title: A hand-over the product cannot take yet links where its job workflow and CI secrets are set up
level: module
realises:
  - UC-049
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-505
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-049-1, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1022 A hand-over the product cannot take yet links where its job workflow and CI secrets are set up

**REGISTER**

## Outcome

UC-049.md:151-152: "**4c. The product has no job workflow or no CI secrets yet.** Nothing is handed over; the conversation
says what is missing and links setting it up (UC-010)."

Built today: nothing is handed over, and the reason is named — `src/runtimes/routes.mjs:42` refuses the CI route with
"the product has no Agent M job workflow yet: add …", and a run without its secret ends `not run`, naming the secret
(MOD-runtimes.md:227-228). The bar shows the reason as text and links nothing: `src/prompt-bar/bar.mjs` sets a link only
for a run's address (`:42`) and goes only to the draft's route (`:244`).

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-prompt-bar.md:206-210:

> failure of the participant's route is shown in the conversation by name. A hand-over the product cannot take yet says
>   what is missing and links where it is set up (UC-049 4c): while the product has no job workflow — the CI route
>   unavailable, `routesFor` naming its files — the route `settings` through `go`, whose product section installs it; for a
>   run ended `not run` for a missing secret, the server's page of the repository's secrets (MOD-repository-hosts'
>   `webLinks`, `secrets`), naming the secret.

## Acceptance

- A hand-over refused for a missing job workflow, and a run ended `not run` for a missing secret, each show the reason and
  a link to the place the accepted text names; a test clicks it and finds `go` called with that route.
- Counter-proof: a refusal for another reason (a requirement not accepted) shows no such link.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
