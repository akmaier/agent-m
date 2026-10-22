---
id: ITM-1188
title: A hand-over to GitHub Actions passes the CI secret its endpoint's route names
level: module
realises:
  - UC-049
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - akmaier's request, accepted in MOD-runtimes at blob f43c460b (f35b9903) and UC-049 4a at 0c086a47 (9559c14f), 2026-10-22
---
# ITM-1188 A hand-over to GitHub Actions passes the CI secret its endpoint's route names

**REGISTER**

## Outcome

The accepted text:
- `docs/architecture/MOD-runtimes.md:258-266`: `handOverJob` starts the product's job workflow with the inputs `job`,
  `task`, and, for a model endpoint, `endpoint` and `secret`, the CI secret its route names.
- :161-164: `routesFor` offers the server's runners for an endpoint whose route names the CI secret of its key.

The job workflow MOD-runtimes generates (`jobWorkflowFiles`, :249) takes the input, and makes the secret it names
available to the run.

## Acceptance

- `handOverJob` passes `secret` for an endpoint whose route is `endpoint <name> secret <NAME>`, and no `secret`
  otherwise.
- The generated job workflow declares the input `secret` and hands the run the key from the secret it names. It never
  hands over a secret's value as an input.
- Counter-proof: a route without ` secret <NAME>` gives no CI route, as `routesFor` states.
- **Where the text is open, the developer stops under AGENTS.md §6a.6 and reports.** Two places:
  - how the generated workflow reaches a secret by a name given at dispatch;
  - whether MOD-participant-list's route grammar (`MOD-participant-list.md:56` names `endpoint <name>` only) refuses the
    suffix on any path this item calls.
- ITM-1189 takes the key in `onDispatch`. Its developer is the same, so the two agree on how the key reaches the run.
- The first commit holds only the tests, and CI is red on it.
