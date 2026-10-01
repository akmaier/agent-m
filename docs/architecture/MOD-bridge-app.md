---
id: MOD-bridge-app
title: The Agent M Bridge app — the bridge runtime's composition root, its one store, the tray and window with a checked fallback, job polling and the person-approved, signed updates
realises:
  - THE BRIDGE IS PAIRED ONCE
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - UC-044
follows:
  - ARC-003
  - ARC-011
  - ARC-017
uses:
  - MOD-bridge-server.serve
  - MOD-bridge-server.pairing
  - MOD-participants.cliDriver
  - MOD-participants.endpointRoutes
  - MOD-participants.agentRoutes
  - MOD-participants.detectAgents
  - MOD-participants.installGuide
  - MOD-mailbox.mailRoutes
  - MOD-bridge-tunnel.sshClient
  - MOD-bridge-tunnel.ensureKey
  - MOD-bridge-tunnel.superviseTunnel
  - MOD-bridge-tunnel.tunnelCommands
  - MOD-bridge-tunnel.tunnelBindProblems
  - MOD-run-engine.nextJobs
  - MOD-run-engine.runJob
  - MOD-run-engine.endRecord
  - MOD-git-host.readSnapshot
  - MOD-git-host.readFile
  - MOD-git-host.commitFiles
  - MOD-git-host.appendRecords
  - MOD-settings-store.readSettingsFile
  - MOD-test-records.resultRecord
  - MOD-derivation.derivationInputs
  - MOD-derivation.classifyCandidates
provides:
  - appShell
  - bridgeStore
  - updateFeed
  - verifyFeed
  - installUpdate
---
# MOD-bridge-app The Agent M Bridge app

## Responsibility

Shell. The bridge runtime's composition root (ARC-003, ARC-011): it creates the bridge's one store, starts
the server with the route table composed from the participants' agent and endpoint handlers, the
mailbox's mail handlers and the tunnel supervisor, shows the tray icon and the window (pairing token,
agents, jump host, tunnel state, import), checks that the tray was really created and falls back to the
window alone when it was not, polls the products it serves for queued jobs of its agents and runs them
through the run engine on the `agent-login` authority, and offers updates. It is the only module that
touches Deno's desktop API, so a rename of that API changes one place. It holds every text of the bridge
window. It also owns the update feed: the release writes it, the bridge reads it.

## Interfaces

- `appShell({ desktop, window, menu }) -> { mode: "tray" | "window" | "headless", reason? }` — creates the tray and reads its `trayId`; a `trayId` of `0` (the documented silent failure, ARC-011) keeps the window as the only control and names the reason; no desktop session gives `headless`. The mode is reported in `GET /hello`.
- `bridgeStore(dir) -> { get(), set(values), importExport(fileText, passphrase), pairingFile }` — the bridge runtime's one store: its own port, jump host, session port, local model servers and the pairing token, in files readable by their owner only; an import takes only these keys through `readSettingsFile` and never writes a private key into anything. The other bridge modules receive it, or values from it, as a port.
- `updateFeed(release, files) -> feed` — the signed feed a release publishes: version, notes, each platform's file with its SHA-256; a file whose platform signature or notarisation cannot be verified is refused, and no feed is written.
- `verifyFeed(feed, publicKey, current) -> { version, notes } | null` — a newer release whose feed signature is valid, shown; nothing is downloaded before the click.
- `installUpdate(offer, click) -> { installed } | { refused: reason }` — after the click: feed signature, file SHA-256, platform signature, then the platform's install step (the new `.msi`, the `.app` from the new `.dmg`, the new `.AppImage`); any failure installs nothing.

## Testing

Component tests with a fake desktop API, a stand-in file system and a scripted update server
(`tests/test_bridge_token.py`, `tests/test_bridge_settings.py`, `tests/test_bridge_release.py`): a `trayId`
of `0` yields window mode with its reason; after a restart the stored pairing token is accepted and its
file is readable by its owner only; an import takes only the bridge's keys; an update with an invalid
signature is refused and a valid one installed only after the click; a release with an unsigned file
publishes no feed. The seams are the desktop API, the file system and `fetch`. That the tray and the
window appear on each platform, and the platform signatures, are checked on the release candidate's
files before a release (ARC-016, ARC-017). No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the bridge runtime's composition root with its one store, takes over the update feed of MOD-release and runs jobs through the run engine, the current state removed; open until accepted.*
