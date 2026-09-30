---
id: MOD-bridge-app
title: The Agent M Bridge app — tray icon and window with a checked fallback, its own settings, job polling and the person-approved updater
realises:
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - UC-044
follows:
  - ARC-003
  - ARC-011
  - ARC-017
uses:
  - MOD-bridge-server.serve
  - MOD-bridge-server.pairing
  - MOD-participant-cli.detectAgents
  - MOD-participant-cli.runAgent
  - MOD-participant-cli.installGuide
  - MOD-participant-endpoint.localEndpointRoute
  - MOD-bridge-mail.mailRoutes
  - MOD-bridge-tunnel.superviseTunnel
  - MOD-bridge-tunnel.ensureKey
  - MOD-bridge-tunnel.sshClient
  - MOD-settings-store.readSettingsFile
  - MOD-run-engine.nextJobs
  - MOD-git-host.readSnapshot
  - MOD-release.verifyFeed
provides:
  - appShell
  - bridgeSettings
  - updateOffer
  - installUpdate
---
# MOD-bridge-app The Agent M Bridge app — tray icon and window with a checked fallback, its own settings, job polling and the person-approved updater

## Responsibility

The shell of ARC-011 and its composition root: it starts the server with the routes of the agent
runner, the local model servers, the mail client and the tunnel supervisor, shows the tray icon and the
window (pairing token, agents, jump host, tunnel state, import), checks that the tray was really created
and falls back to the window alone when it was not, polls the products it serves for queued jobs of its
agents using the run engine, and offers updates. It is the only module that touches Deno's desktop API,
so a rename of that API (`Deno.Tray` to `Deno.desktop.Tray`, open PR #35939) changes one place.

**Current state.** No bridge exists.

## Interfaces

- `appShell({ desktop, window, menu }) -> { mode: "tray" | "window" | "headless", reason? }` — creates the tray and reads its `trayId`; a `trayId` of `0` (the documented silent failure, ARC-011 decision 5) keeps the window as the only control and names the reason; no desktop session gives `headless`. The mode is reported in `GET /hello`.
- `bridgeSettings(dir) -> { get(), set(values), importExport(fileText, passphrase) }` — the bridge's own port, jump host, session port and local model servers, in a file readable by its owner only; an import takes only these keys and never writes a private key into anything.
- `updateOffer(feedUrl, current) -> { version, notes } | null` — a newer release, shown; nothing is downloaded before the click.
- `installUpdate(offer, click) -> { installed } | { refused: reason }` — after the click: feed signature, file SHA-256, platform signature, then the platform's install step (the new `.msi`, the `.app` from the new `.dmg`, the new `.AppImage`); any failure installs nothing.

Uses, as declared above: `MOD-bridge-server.serve`, `MOD-bridge-server.pairing`, `MOD-participant-cli.detectAgents`, `MOD-participant-cli.runAgent`, `MOD-participant-cli.installGuide`, `MOD-participant-endpoint.localEndpointRoute`, `MOD-bridge-mail.mailRoutes`, `MOD-bridge-tunnel.superviseTunnel`, `MOD-bridge-tunnel.ensureKey`, `MOD-bridge-tunnel.sshClient`, `MOD-settings-store.readSettingsFile`, `MOD-run-engine.nextJobs`, `MOD-git-host.readSnapshot`, `MOD-release.verifyFeed`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
