---
id: ITM-118
title: Measure the HTTPS route through a real jump host with a trusted certificate
kind: measurement
level: 2
realises:
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
modules: []
depends_on:
  - ITM-104
  - ITM-107
origin: backlog refinement 2026-10-01
---
# ITM-118 Measure the HTTPS route through a real jump host with a trusted certificate

**REGISTER**

## Outcome

ARC-013 open measurements 2 and 3: the generated Apache and nginx blocks applied to a real web server with a Let's Encrypt certificate and a reverse tunnel; the preflight, a request without login (401, nothing forwarded), a request with login and token (answered by the bridge), a preflight from another origin (refused) — in all four browsers.

## Realises

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`
- `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`
- `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`

## Where it came from

ARC-013 consequences (open measurements 2, 3).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_https-route-jump-host.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_bridge_tunnel.py` — `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`; `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`; `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`
- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Acceptance criteria

From the SPEC's checks:

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST` — `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and the settings page names the certificate as a possible cause.
- `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN` — `tests/test_bridge_tunnel.py` — a request without the login is answered `401` and reaches no bridge; counter-proof: with the login and the bridge's token it is answered by the bridge.
- `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE` — `tests/test_bridge_tunnel.py` — a preflight from the Pages origin is allowed; counter-proof: one from any other origin is refused.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-104 — the route tested in CI first
- ITM-107 — the dashboard's HTTPS-route settings

## Needs a person

A person with a jump host they administer (a web server with a public name and certificate) and real browsers.
