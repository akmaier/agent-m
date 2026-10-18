---
id: ITM-960
title: The Bridge answers the probes endpoint-models and partitions
level: module
realises:
  - UC-040
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - THE LOCAL BRIDGE REQUIRES A TOKEN
modules:
  - MOD-bridge-jobs
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-960 The Bridge answers the probes endpoint-models and partitions

**REGISTER**

## Outcome

UC-040.md:119-122: "The author presses **Check**. Agent M reaches the resource by its route: ... through the Bridge the
route names, with its token, a harmless request — for a SLURM cluster the partition list, for an endpoint the list of
served models — and shows what answered. For an endpoint or agent, the served identifier becomes its pin."
MOD-bridge-jobs.md:105-110: "`POST /v1/probes/{kind}` — a harmless request: ... `endpoint-models` lists the models an
endpoint on this computer serves; ... `partitions` lists a cluster's partitions through its scheduler's command on this
computer (UC-003, UC-017, UC-040)." Its Parts name `probes.mjs` — "the harmless requests of the probes"
(MOD-bridge-jobs.md:67).

`src/bridge-jobs/handlers.mjs` answers `POST /v1/probes/agent` (:60) and `endpoint-test` (:96) only, and there is no
`src/bridge-jobs/probes.mjs`. The protocol (`src/bridge-http/protocol.mjs:26`) and the page's `probe`
(`src/bridge-client/index.mjs:190`) already name both kinds. ITM-326 left them out ("`endpoint-models` and `partitions`
are not part of this item").

## Acceptance

- Unit tests that name MOD-bridge-jobs: `endpoint-models` against a fake OpenAI-compatible endpoint on loopback gives its
  served model identifiers; `partitions` with a fixture `sinfo` executable on the path gives each partition's name and
  state; a missing scheduler or an endpoint that does not answer is `upstream-failed` naming it. Counter-proof: a probe
  without the Bridge's token is refused by the server before the handler runs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.

## Not ready: the interface is not fixed by an accepted text (po-opus-b, at sprint team2/94)

developer-sonnet-i stopped at the start (rule 1), and the stop holds. MOD-bridge-jobs.md:105-110 names the probes
`endpoint-models` ("lists the models an endpoint on this computer serves") and `partitions` ("lists a cluster's partitions
through its scheduler's command on this computer"). No accepted text fixes what a build needs:
- `args` and the answer of either probe: MOD-bridge-http.md:61 and MOD-bridge-client.md:157 give `args: unknown`;
- a function that lists an endpoint's models: MOD-endpoint-calls provides none;
- the scheduler's command: none is named, `sinfo` or another;
- the errors beyond `upstream-failed`, and whether the key rule of the endpoint probes covers a models listing.
The proposal was marked READY by mistake. The item waits for a draft of MOD-bridge-jobs, MOD-bridge-http and
MOD-bridge-client for akmaier that fixes these. Until then it is not selected.

