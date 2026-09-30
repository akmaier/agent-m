---
id: MOD-bridge-app
title: The Agent M Bridge app — tray icon, window, its own settings, job polling and the person-approved updater
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
  - MOD-bridge-mail.mailRoutes
  - MOD-bridge-tunnel.superviseTunnel
  - MOD-bridge-tunnel.ensureKey
  - MOD-settings-store.readSettingsFile
  - MOD-run-engine.nextJobs
  - MOD-git-host.readSnapshot
  - MOD-release.verifyFeed
provides:
  - bridgeSettings
  - updateOffer
  - installUpdate
---
# MOD-bridge-app The Agent M Bridge app — tray icon, window, its own settings, job polling and the person-approved updater

## Responsibility

The shell of ARC-011 and its composition root: it starts the server with the routes of the agent
runner, the mail client and the tunnel supervisor, shows the tray icon and the window (pairing token,
agents, jump host, tunnel state, import), polls the products it serves for queued jobs of its agents
using the run engine, and offers updates.

**Current state.** No bridge exists.

## Interfaces

- `bridgeSettings(dir) -> { get(), set(values), importExport(fileText, passphrase) }` — the bridge's own port, jump host and session port, in a file readable by its owner only; an import takes only these keys and never writes a private key into anything.
- `updateOffer(feedUrl, current) -> { version, notes } | null` — a newer release, shown; nothing is downloaded before the click.
- `installUpdate(offer, click) -> { installed } | { refused: reason }` — after the click: feed signature, file SHA-256, platform signature, then replace; any failure installs nothing.

Uses, as declared above: `MOD-bridge-server.serve`, `MOD-bridge-server.pairing`, `MOD-participant-cli.detectAgents`, `MOD-participant-cli.runAgent`, `MOD-participant-cli.installGuide`, `MOD-bridge-mail.mailRoutes`, `MOD-bridge-tunnel.superviseTunnel`, `MOD-bridge-tunnel.ensureKey`, `MOD-settings-store.readSettingsFile`, `MOD-run-engine.nextJobs`, `MOD-git-host.readSnapshot`, `MOD-release.verifyFeed`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
