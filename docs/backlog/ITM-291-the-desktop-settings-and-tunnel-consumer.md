---
id: ITM-291
title: The desktop settings and tunnel consumer
level: module
realises:
  - UC-003
  - UC-044
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-276
  - ITM-268
  - ITM-282
  - ITM-283
  - ITM-284
  - ITM-285
  - ITM-286
  - ITM-287
  - ITM-288
tests:
  - unit
  - component
origin:
  - UC-003
  - UC-044
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
---
# ITM-291 The desktop settings and tunnel consumer

**REGISTER**

## Outcome

One coupled MOD-desktop-shell outcome: the real source-folder app takes its own settings from its window or the
canonical dashboard export, persists its bounded private settings, and composes the delivered key, tunnel runtime and
authenticated tunnel-state handlers. Settings and Tunnels are reachable in the existing app window alongside Pairing.
Use the accepted public readExport, tunnelCommands, ensureKey, openTunnels, closeTunnels, tunnelState and tunnelHandlers;
keep main/preload/window's fixed-call boundary and the existing source entry, own-file protocol and loopback server.

The accepted settings.json shape supplies name, port, products, interval, paused, jumpHost and tunnel plans in the
instance's private per-user folder. Taking over an export keeps only products, jump-host and remote-session:<name>
values for the matching instance. Refuse another instance. No repository token, endpoint key, mailbox or sign-in secret
is retained. The person's own-computer choice creates forward plans for the remote sessions; choosing this computer's
remote-session name creates its reverse plan and takes its name/port/pairing token as the contract states. Plans come
from the same public tunnelCommands as the dashboard; their keyFile is always the Bridge's own key. Plain and locked
exports use readExport, with the passphrase in memory; no duplicate codec, exported private key or repository write.

Manual controls preserve each existing explicit action and show what was taken over, the public key and where to add
it on the jump host, and each tunnel's state/reason. Settings take effect through the actual compose/main lifecycle,
including port retry and restart. Pause stops taking new work; already-running jobs remain followable/cancellable.
Pause is not a command to close their server/tunnels. Quit closes the composed runtime and server through the existing
lifecycle. Preserve pairing renewal, source entry and existing job-handler behavior; unbuilt watching/job-execution
producers are not silently implemented or represented as delivered by this bounded item.

No agents discovery, updates, mail, strategy registry, signed distribution, trusted HTTPS provisioning or current-browser
measurement is part of this outcome. It advances the accepted desktop/tunnel handoff; it does not claim all UC044.

Trace runtime dependency setup through the working launcher before implementing composition. Tunnels requires ssh2
at module load; the existing native fixture stages Electron44.5.1, while the real tunnel fixtures stage ssh2@1.17.0
and pass NODE_PATH into their child. This is an open setup question, not a diagnosed product failure. Keep old native
cases passing through controlled Ubuntu CI. Any necessary unowned/global acquisition-adapter change requires actual
evidence and a separately bounded job; it is not hidden in this owned source item.

## Acceptance

- Tests first name MOD-desktop-shell and the accepted requirements, with canonical readable unique declarations.
  The actual tests-only first commit has its observed product-red CI before implementation.
- Controlled temporary-file unit cases exercise manual settings, plain/locked matching-instance import, named refusals
  and no partial import, own/remote plan choices, persisted bounded values and private-key exclusion. Existing valid
  values and existing endpoint/pairing expectations remain guarded.
- Component cases use the production main/compose/preload/window entry and existing controlled Linux fixture pattern:
  import or manual settings reach the actual key/runtime/handlers, state/public-key controls, restart/retry and quit.
  Controlled real loopback SSH adapters observe the forwarding path and cleanup. No result stub substitutes for the runtime.
- The window and composed lifecycle preserve Pause's new-work refusal and current follow/cancel semantics; a missing
  unrelated job producer is reported, not concealed by a stub or a claim of full job continuation.
- Each final new case has its relevant production-code fault, actual SAME-case failure, exact source-byte restoration
  and SAME-case positive retained with commands, streams, timings and hashes. Independent release author observes
  the actual consumer through accepted public paths; source and every predecessor's authorship are checked.
- Only src/desktop-shell/ and new tests naming MOD-desktop-shell change. Other modules are used through index.mjs;
  no private imports or accepted-document change. No source/test edits outside the published job's scope.
- Native/full verification runs only in controlled GitHub Ubuntu, with each CI job within SPEC's 120 seconds. Local
  work is limited to explicitly selected nonnative controlled loopback/temp cases; no local full/glob/native or user state.
