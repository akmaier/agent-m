---
id: ITM-267
title: Endpoint and Bridge reachability on current browsers
level: system
realises:
  - UC-003
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
modules:
  - MOD-settings-pages
  - MOD-endpoint-calls
  - MOD-bridge-client
builds_on:
  - ITM-269
tests:
  - system
origin:
  - UC-003
---
# ITM-267 Endpoint and Bridge reachability on current browsers

**REGISTER**

## Start condition

**Blocked.** An endpoint is never accessed through the Bridge. Endpoint configuration and its test use the direct browser-to-endpoint path. This item's endpoint-through-Bridge scope conflicts with that boundary; do not select or start it. UC-003 alternative 2a contains a contradictory Bridge route and must not be used to authorize this work.

## Outcome

A dated measurement under docs/measurements/ of UC-003's integrated revision on current Chrome, Firefox and Safari: permitted direct endpoint call, refused browser call with its observable diagnosis, local model test through a paired loopback Bridge where the browser allows it, and the configured trusted HTTPS/jump-host route for Safari. Name the served revision, origin, endpoint fixtures, Bridge revision and each browser's version. Use controlled endpoints; real paid-provider behaviour is not inferred from fixture results.

Wait for the dashboard wiring and a running Bridge with its endpoint handler. UC-044 must supply the authenticated HTTPS forwarding setup. Record failed or unavailable paths honestly; no browser measurement is invented or replaced by a mock.

## Acceptance

- For every route state the exact setup, action, observed result and any observable restriction; no secret values appear in the record.
- Include the evidence that the model received a short test through the Bridge rather than a models-list probe or a direct browser request.
- Any absent setup or failed required route remains unfinished or a finding at sprint close; successful fixture CI alone is not a browser measurement.
- Only docs/measurements/ changes.
