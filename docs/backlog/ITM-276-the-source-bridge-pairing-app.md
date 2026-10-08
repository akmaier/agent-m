---
id: ITM-276
title: The source Bridge pairing app
level: subsystem
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW
  - THE BRIDGE IS PAIRED ONCE
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-261
  - ITM-275
tests:
  - component
origin:
  - UC-044
  - UC-003
---
# ITM-276 The source Bridge pairing app

**REGISTER**

## Outcome

Build the runnable source-folder pairing and lifecycle slice of MOD-desktop-shell, using the accepted Electron app,
appDescription, main.mjs, compose.mjs, window.html/window.mjs and fixed preload.cjs. The source start takes its instance
and Pages origin from the command line and offers no updates. It uses the real production entry and composition that
ITM-268 will extend; no standalone server or test-only app entry substitutes for it.

Compose ITM-261's server with no work handlers yet, on loopback for the configured origin. The local-files-only window
uses MOD-site-frame's page bridge with its own routes and empty strategies. It shows the address and token with Copy,
Pair anew with its decision, pairing explanations and notices. Main-process metadata and the fixed preload calls carry
the shell's controls; PageSetup gains no configuration fields. The app's own local protocol preserves the configured
instance through the accepted frame's hostname/pathname identity, including a fork other than upstream.

Create the instance-specific user-only data folder and token; support the single running app, opening its window again,
pause/resume and quit, the accepted tray/window lifecycle, a port conflict and an unwritable folder. Use accepted defaults
for this slice's settings. No endpoint key or repository credential is retained. Jobs, agents, tunnels, mail, imports,
updates and signed platform distribution remain later deliveries; this component does not complete UC-044 or UC-003.

## Acceptance

- Component tests start the actual Electron source entry with a controlled instance/origin and real Bridge server;
  observe the pairing window's address/token, Copy and confirmed Pair anew, and token rotation refusing the old token.
- The window loads only the app's own files and has no Node access beyond its fixed preload. A non-upstream instance
  reaches the frame and its own data folder; the server answers only the configured origin and binds only to loopback.
- Tests cover the second start reopening the first window, platform window/tray behaviour, pause/resume and server
  shutdown on quit, plus the visible port-conflict and data-folder failures. Unsupported work has the protocol's named
  refusal; no missing future module is replaced with a successful fake handler.
- Pairing explanations use the shared frame and renderer. No endpoint setting, token or credential enters a repository,
  URL or log; only the accepted private pairing-token file retains the token.
- Only src/desktop-shell/ and new tests naming MOD-desktop-shell change. The PR names the runnable entry, command and
  merged prerequisite revisions, and distinguishes this source component from signed UC-044 distribution.
- The tests-only first commit has actual red CI; final-head CI is green; each new case has an executed planted-fault
  counter-proof and restored positive. No paid service is called.

## Runtime readiness and CI recovery

Use the exact Electron44.5.1 runtime in a temporary tool directory outside the checkout. A new test adapter naming
MOD-desktop-shell launches that real binary on the production `src/desktop-shell/main.mjs` entry with the controlled
instance/origin, and observes the real window/server/lifecycle. The existing Node suite invokes this component test;
do not substitute an injected Electron fake, source-text regex or successful missing-runtime skip for it. Name the
runtime acquisition and source-start commands in the PR. Keep module source free of test-only app entry points.

No repository package manifest or lockfile is selected: accepted MOD-bridge-build owns those for release packaging,
which remains later work. Do not install builder, updater, mail, tunnel or signing packages just for this pairing slice.
Measure the real runtime/test path on the existing CI runner and retain the declared CI budget. If it demonstrably needs
additional unowned CI/helper tooling, report the concrete known-positive/failure path and obtain separately bounded
between-jobs integration before editing; no workflow change or helper bypass is authorised by this item.

Obtain actual red CI on the original job's tests-only first commit through a separate recovery PR before continuing
source work. Preserve existing Git history and the recorded job parameter through ordinary integration. Final
source-head CI, real component acceptance, per-case fault/restoration and independent source/release gates remain
required.
