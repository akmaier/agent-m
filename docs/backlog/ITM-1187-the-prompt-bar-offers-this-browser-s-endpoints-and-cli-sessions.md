---
id: ITM-1187
title: The prompt bar offers this browser's endpoints and CLI sessions, and hands workflow work only to a listed participant
level: module
realises:
  - UC-049
  - UC-019
  - THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-1185
tests:
  - unit
  - system
origin:
  - akmaier's request, accepted in MOD-prompt-bar at blob e6007c77 (f35b9903), UC-049 at 0c086a47 and UC-019 at db5a9f34 (9559c14f), and the SPEC sentence in akmaier's chat of 2026-10-22; the findings UC019-S14 and S15 of #1308
---
# ITM-1187 The prompt bar offers this browser's endpoints and CLI sessions, and hands workflow work only to a listed participant

**REGISTER**

## Outcome

Since `35f3485d` and `fd01d2ee` the bar offers first this browser's endpoints that declare a place, a context and a model
(`endpointsOffered`, `endpointLacks`), and an endpoint that names a CI secret and no Bridge spawns its own job (*Spawn
job*). Beside them it still reads the instance's participant list and offers the participants this browser reaches
(`src/prompt-bar/bar.mjs:501-505`), as MOD-prompt-bar.md:211-213 says, "until the offer of CLI sessions is built". It offers no
CLI session, and where none can do the kind its link goes to `participants` (`bar.mjs:457-462`). The accepted text,
`docs/architecture/MOD-prompt-bar.md:194-211`, says instead:
- It first reads this browser's configuration, and reads no participant list for the offer (UC-049 1).
- It offers each `endpoint:<name>` and each CLI session a stored Bridge offers (`testBridge`) whose configuration
  declares a place, a context and a model. One lacking any of them is not offered (1b), and with none it draws nothing
  (1a).
- It hands each to the job runner in MOD-participant-list's `Participant` shape:
  - for an endpoint, the route is `endpoint <name>`, with ` secret <NAME>` (MOD-prompt-bar.md:201-205);
  - for a CLI session, it is `bridge <bridge> agent <agent>`.
- Where none can do the kind, its link goes to the route `endpoints` (UC-019 3a).
- A hand-over of a kind of the product's workflow goes only to a participant of the instance's list that the hand-over
  names, never to the endpoint or CLI session itself, and only when `holdsRole` finds it (UC-049 4a.1).

## Acceptance

- `tests/prompt-bar-endpoints.test.mjs` is written. It is the check SPEC.md:413-419 names for THE PROMPT BAR'S
  ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE, and holds the cases and the counter-proof that check names.
- **The system findings close:** TST-377016 (UC019-S14) and TST-377017 (UC019-S15) in
  `tests/system-uc-019-change-by-prompt.test.mjs` lose their `todo` and pass.
- **The release test changes by a participant who did not build this item** (RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER):
  - `tests/prompt-bar-endpoints.test.mjs` leaves `MISSING_CHECKS` in
    `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs`;
  - the requirement goes into `COVERED_BY_RELEASE`;
  - TST-513202 loses its `todo`.
- The offer is unit-tested with a store holding an endpoint, a Bridge offering a CLI session, and one of each lacking a
  model. Counter-proof: the instance's participant list is not read for the offer.
- The endpoint offer and *Spawn job* stand as built (`35f3485d`) and are not built again.
- Nothing beyond the accepted text. No new route, setting or driver.
- The first commit holds only the tests, and CI is red on it.
