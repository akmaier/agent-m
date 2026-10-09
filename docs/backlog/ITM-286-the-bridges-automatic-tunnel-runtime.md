---
id: ITM-286
title: The Bridge’s automatic tunnel runtime
level: module
realises:
  - UC-003
  - UC-011
  - UC-044
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
modules:
  - MOD-tunnels
builds_on:
  - ITM-282
  - ITM-284
  - ITM-285
tests:
  - unit
origin:
  - UC-044
  - UC-011
---
# ITM-286 The Bridge’s automatic tunnel runtime

**REGISTER**

## Outcome

Implement accepted MOD-tunnels openTunnels, closeTunnels, tunnelState and tunnelHandlers using the delivered canonical TunnelPlan and real ssh2. Reverse forwarding accepts only the jump host’s loopback and streams to the supplied local Bridge port; forward forwarding listens only on local loopback and streams to remote loopback. Keep alive, reopen after disconnection with growing waits, and let each refused/unreachable tunnel fail without stopping the others. Close ends listeners, connections and pending reconnects on pause/quit or replacement. State has the accepted name/kind/state/reason shape and the handler returns it through the delivered authenticated route.

Use the Bridge’s persistent own key and per-user known-jump-hosts outside repositories. Trust a host on first connection and refuse its changed key before forwarding; map auth-refused, host-unreachable, host-key-changed and port-taken to observable state. Canonical plans have no name field: derive a stable meaningful name from their actual existing fields; do not add a required plan field or change the accepted architecture. Reject non-loopback plans with NotLoopback. This supplies the shell’s runtime prerequisite; it does not compose shell controls or demonstrate trusted browser HTTPS.

## Acceptance

Controlled real ssh2 loopback server/client fixtures exercise actual reverse and forward byte delivery, host verification before forwarding, independent failures/state reasons, reconnect and complete close with no reconnect afterward. Generated real keys and supplied temporary data folders use the existing external runtime acquisition pattern; establish a known-positive real dependency before reporting product reds. No fake ssh2, system ssh subprocess or real host is used. Own only src/tunnels/ and new MOD-tunnels tests; reuse existing key bytes/expectations unchanged.

## Verification boundary

Only the declared owned source and new module-named tests change. The first writing commit contains only failing new tests with actual red CI; final exact-head complete Linux CI is green, with existing expectations preserved. Each new case has a readable unique numeric TST, level/module/guard declarations, precondition/input/expected result and its actual relevant guarded-code fault, failure and byte-exact-restored positive under SPEC §12. Canonical testDeclarations → traceGraph → tracesTo proves the guards. Independent release writing follows the approved source merge; module readiness, public composition and aggregate release remain distinct.

No local broad/glob/full or native desktop/browser tests, Mac apps, clipboard/focus/settings/device state, personal export, external SSH/webserver or paid service. Explicit controlled nonnative files only; full/native integration runs on GitHub Linux. No SPEC/use-case/architecture/process change or human acceptance is implicit.
