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

The job workflow MOD-runtimes generates (`jobWorkflowFiles`, :249) declares the input `secret`. It names a key the
file already reads.

## Decided at the stop (po-opus-b, by the texts)

developer-sonnet-i stopped under AGENTS.md §6a.6, before any code, on the first stop point. **The reading taken is (a), the
static one:** the run reads the key only from a secret the workflow file names when it is generated.
- **The data flow, as i read it:**
  - `src/runtimes/workflow/github.yml:30-35`, through `ci.mjs:202-215`, writes one static line
    `NAME: ${{ secrets.NAME }}` for each name of `secrets.keys`, and lists them in `AGENT_M_KEY_NAMES`;
  - `workflow-entries/compose.mjs:91-94` (`keysOf`) gives `env.job.keys`;
  - `product.mjs:344-349` reads `env.job.keys[secret]`.
- **Why (a), and not a secret read by a name given at dispatch:**
  - MOD-runtimes.md:145-147 and :249 describe only static keys.
  - The SPEC's check of A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET (`tests/test_runtime_levels.py:46`) pins
    exactly that form.
  - A name chosen at dispatch could hand any secret of the repository, `AGENT_M_TOKEN` among them, to a model endpoint
    outside it. The static list keeps the keys the person named when installing.
- **Where the names come from:** MOD-runtimes.md:145-147, "an agent's key from the secret the participant's route
  names". The SPEC's THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE makes a configured endpoint
  count as a participant for every rule. So the *Install* of the job workflow names, beside the CI secrets of the
  participants' routes, those of this browser's endpoints. That is ITM-1186's, in MOD-settings-pages' `jobWorkflowInput`.
- **Where `handOverJob` takes the name:** i's reading holds. It takes the name from the route of the participant
  `prepared` was prepared for, `endpoint <name> secret <NAME>` (MOD-prompt-bar.md:187-190). `target.endpoint` stays as
  MOD-runtimes.md:258-260 types it.
- **The second stop point does not hold.** MOD-participant-list.md:56 already allows ` secret <NAME>`, and
  `src/runtimes/routes.mjs:27` (`namesCiSecret`) parses it.

## Acceptance

- `handOverJob` passes `secret` for a participant whose route is `endpoint <name> secret <NAME>`, and no `secret`
  otherwise.
- The generated job workflow declares the input `secret`, and keeps one static line for each key it reads. No secret is
  read by a name given at dispatch.
- `tests/test_runtime_levels.py` stays green, its counter-proof included.
- Counter-proof: a route without ` secret <NAME>` gives no CI route, as `routesFor` states.
- ITM-1189 takes the key in `onDispatch`. Its developer is the same, so the two agree on how the key reaches the run.
- The first commit holds only the tests, and CI is red on it.
