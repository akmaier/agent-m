---
id: ITM-282
title: The canonical tunnel and HTTPS proxy plans
level: module
realises:
  - UC-003
  - UC-011
  - UC-044
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
modules:
  - MOD-bridge-client
builds_on:
  - ITM-263
tests:
  - unit
origin:
  - UC-003
  - UC-044
---
# ITM-282 The canonical tunnel and HTTPS proxy plans

**REGISTER**

## Outcome

Implement only accepted allocatePort, tunnelCommands and proxyConfiguration, with JumpHost, RemoteSession and TunnelPlan, through src/bridge-client/index.mjs. Use the accepted shapes, bridgeApi default port where appropriate, separate remote/local key-file names, loopback-only plans, both keep-alive commands and the reverse service description. Generate Apache and nginx HTTPS proxy text with login before forwarding, instance-only CORS, web-server-handled preflights and each session's loopback destination, plus the trusted-certificate prerequisite. No request, command execution, provisioning or persistence occurs.

The working legacy docs/assets/bridge-tunnel.mjs is reference evidence only: its host/portFrom/portTo/session.bridgePort and two-argument result with url do not implement the canonical plans/service/proxy contract. No legacy file or caller changes belong here. This unit foundation supports later shell composition and UC-003's trusted HTTPS setup; it supplies neither of them.

## Acceptance

- Unit cases through the public exports observe the lowest free inclusive-range port, exhaustion as NoFreePort naming the range, distinct occupied ports, both commands and plans agreeing on the supplied ports/key files, loopback-only ends, keep-alives and the reverse service description.
- For both accepted web servers, cases guard login/TLS before forwarding, only the supplied instance origin, local preflight handling, every session's path/port and the trusted-certificate note. Generated output contains neither session token nor jump-host password; key files are names only. Inputs are constructed fixtures; no web server or SSH command is started.
- Preserve the delivered pair/bridgeAt/probe behaviour, canonical endpoint request and applicable old guards unchanged. Only src/bridge-client/ and new tests naming MOD-bridge-client change.
- The first writing commit contains only new tests and has actual red CI before implementation. Final exact-head full CI is green. Each new case declares a unique numeric TST, one unit level, module, guarded requirement/use case, readable precondition/input/expected result and its own executed relevant guarded-code fault, failure and byte-exact-restored positive. Existing expected results are not weakened. No paid service is called.
- The source PR names its concrete accepted consumer/data path and the actual failure node. Independent selected-item release coverage follows the approved merge; module source readiness and the aggregate release gate remain distinct.
