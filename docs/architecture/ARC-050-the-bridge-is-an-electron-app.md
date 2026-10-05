---
id: ARC-050
title: The Bridge is an Electron app
refines: ARC-037
forced_by:
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - THE BRIDGE IS PAIRED ONCE
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-011
  - UC-044
---
# ARC-050 The Bridge is an Electron app

## Context

The Bridge (ARC-040) is an app for a person who may never have used a terminal (UC-044). It is one file per platform — a
disk image for macOS, an installer for Windows, an executable for Linux — that starts with no Node or Deno installed
(`THE BRIDGE IS ONE FILE PER PLATFORM`), and it is built from the same JavaScript modules the dashboard uses (`THE BRIDGE
IS BUILT FROM THE DASHBOARD'S CODE`). It starts by a double click and runs with an icon in the menu bar or the tray, or
with its window open where there is no tray (`THE BRIDGE RUNS AS AN APP`). Its window shows the pairing token, the
agents, the tunnels and the settings, rendered with the site's frame and renderer (ARC-040). Every released file is
signed by the publisher — with an Apple Developer ID and notarised for macOS, with a code-signing certificate for Windows
(`THE BRIDGE IS SIGNED BY ITS PUBLISHER`) —, and a newer release is installed only after the person's click and only
with a valid signature (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`).

Underneath, the Bridge's own work needs what a browser does not have: an HTTP server bound to loopback, TCP with TLS to
mail servers, SSH, starting and stopping the coding agents' processes, and files that only their owner can read.

## Decision

The Bridge is an **Electron** app, built by **electron-builder** and updated by **electron-updater**.

- **Electron** is "based on Node.js and Chromium" (its README). MOD-desktop-shell's main process runs the shared modules
  and the Bridge's own modules on Node — its network, TLS, process and file interfaces — as they are. Electron's `Tray`
  "add[s] icons and context menus to the system's notification area", and its `BrowserWindow` makes the window (its API
  documentation). The window loads only the Bridge's own files, never a remote page.
- **electron-builder** builds MOD-bridge-build's three files: a DMG, the "macOS disk image"; an NSIS installer, the
  "default target for Windows"; and an AppImage, "a self-contained, portable Linux application format". On Windows it
  "signs every executable and installer" it produces, and it notarises the macOS build, which Gatekeeper requires of an
  app distributed outside the Mac App Store since macOS 10.15 (its documentation).
- **electron-updater** lets MOD-desktop-shell offer a newer release from the update feed that MOD-bridge-build
  publishes. With `autoDownload` switched off nothing is downloaded before the person's click, and with
  `autoInstallEvent = "manual"` nothing is installed until the Bridge calls `quitAndInstall()` on the person's choice.
  Before a downloaded file becomes installable, the Bridge's `verifyUpdateFile` step checks its signature against the
  publisher's key built into the Bridge, on every platform; a failed check aborts the update and deletes the file. On
  macOS and Windows electron-updater also validates the code signature (its documentation).

## Alternatives

- **Tauri.** In a Tauri app "the backend of the application is a rust-sourced binary", and its windows use "the system
  webview" (its README). Node.js comes into a Tauri app only as a *sidecar*, an external binary the app embeds (its
  documentation). The Bridge's modules would then run in a second program beside the app, whose own core would be Rust:
  two runtimes in one app, and the shared modules no longer the app's own code. Rejected (`KEEP IT SIMPLE`, `THE BRIDGE IS
  BUILT FROM THE DASHBOARD'S CODE`).
- **NW.js.** "An app runtime based on Chromium and node.js", with "complete support for Node.js APIs" (its README) — the
  same kind of runtime as Electron. Rejected: its package's adoption is a small fraction of Electron's (below), whereas
  for Electron one toolchain of wide adoption already covers packaging, signing, notarisation and signed updates.
- **Neutralinojs.** It "doesn't bundle Chromium and uses the existing web browser library in the operating system", and
  is extended with other languages through extension processes (its README). Node's interfaces would come only from a
  Node runtime shipped as an extension — the same two runtimes as with Tauri. Rejected.
- **Electron Forge** for packaging and updating. The update service Electron documents for its own tooling,
  update.electronjs.org, serves only apps that run on macOS or Windows, have a public GitHub repository, publish their
  builds to GitHub Releases and, on macOS, are code-signed (Electron's documentation). The Bridge needs updates on Linux
  too. electron-updater supports Linux and validates code signatures on Windows as well as on macOS (electron-builder's
  documentation). Rejected.

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption is the package's downloads from the npm registry between
2026-09-05 and 2026-10-04, or, for a Rust crate, its downloads on crates.io. Releases count every version the registry
lists, and in brackets those without a pre-release tag. Issues are those of the source repository the registry names.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| electron — chosen | MIT | yes | 2012-05-18 | 44.5.1, 2026-09-30 | 1,824 (1,102) | 580 / 21,361 | 31,400,299 | [1] | 2026-10-05 |
| electron-builder — chosen | MIT | yes | 2015-05-26 | 26.15.3, 2026-06-09 | 1,000 (942) | 24 / 7,316, in the repository it shares with electron-updater | 20,534,235 | [2] | 2026-10-05 |
| electron-updater — chosen | MIT | yes | 2015-05-01 | 6.8.9, 2026-06-05 | 330 (292) | 24 / 7,316, in the repository it shares with electron-builder | 14,341,383 | [3] | 2026-10-05 |
| tauri (crate) | Apache-2.0 OR MIT | yes, under MIT | 0.1.0, 2019-11-27 | 2.12.1, 2026-09-30 | 228 (126) | 1,311 / 5,179 | 13,388,637 in the last 90 days; 34,397,336 in all | [4] | 2026-10-05 |
| @tauri-apps/cli | Apache-2.0 OR MIT | yes, under MIT | 2021-04-13 | 2.12.1, 2026-09-30 | 179 (80) | 1,311 / 5,179, the same repository as the crate | 9,903,395 | [5] | 2026-10-05 |
| nw (NW.js) | MIT | yes | 2014-04-26 | 0.117.0, 2026-09-26 | 760 (317) | 1 / 84 in the installer's repository the registry names; 893 / 6,566 in NW.js's own repository | 18,147 | [6] | 2026-10-05 |
| Neutralinojs (runtime) | MIT (its `LICENSE`: "Neutralinojs core is licensed for use as follows: MIT License") | yes | v1.0.0-beta, 2018-07-06 | v6.9.0, 2026-07-24 | 64 (56) on GitHub | 165 / 865 | — the runtime is not a package; its command-line tool below | [7] | 2026-10-05 |
| @neutralinojs/neu | MIT | yes | 2020-01-04 | 11.7.2, 2026-06-03 | 103 (101) | 19 / 184 | 13,182 | [8] | 2026-10-05 |
| @electron-forge/cli | MIT | yes | 2018-04-16 | 8.0.1, 2026-09-29 | 122 (37) | 225 / 1,371 | 5,560,707 | [9] | 2026-10-05 |

No candidate is marked: every licence is known to be compatible with MIT.

Where each fact was read — from a registry entry: licence, first release (`time.created`), latest release
(`dist-tags.latest` and its time), releases (`versions`); adoption from the downloads address; open and closed issues as
`total_count` of the two searches:

- [1] https://registry.npmjs.org/electron · https://api.npmjs.org/downloads/point/last-month/electron ·
  https://api.github.com/search/issues?q=repo:electron/electron+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/electron/electron/main/README.md · `Tray`:
  https://raw.githubusercontent.com/electron/electron/main/docs/api/tray.md · `BrowserWindow`:
  https://raw.githubusercontent.com/electron/electron/main/docs/api/browser-window.md · update.electronjs.org:
  https://raw.githubusercontent.com/electron/electron/main/docs/tutorial/updates.md
- [2] https://registry.npmjs.org/electron-builder · https://api.npmjs.org/downloads/point/last-month/electron-builder ·
  https://api.github.com/search/issues?q=repo:electron-userland/electron-builder+is:issue+is:open and `+is:closed` · its
  documentation: https://raw.githubusercontent.com/electron-userland/electron-builder/master/website/docs/dmg.md,
  …/nsis.md, …/appimage.md, …/features/code-signing/code-signing-win.md, …/features/code-signing/notarization.md
- [3] https://registry.npmjs.org/electron-updater · https://api.npmjs.org/downloads/point/last-month/electron-updater ·
  the issues of [2] · its documentation:
  https://raw.githubusercontent.com/electron-userland/electron-builder/master/website/docs/features/auto-update.md
- [4] https://crates.io/api/v1/crates/tauri (licence of 2.12.1, first version, `max_stable_version` and its date,
  versions, `recent_downloads`, `downloads`) ·
  https://api.github.com/search/issues?q=repo:tauri-apps/tauri+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/tauri-apps/tauri/dev/README.md · the sidecar: https://v2.tauri.app/develop/sidecar/
- [5] https://registry.npmjs.org/@tauri-apps%2Fcli · https://api.npmjs.org/downloads/point/last-month/@tauri-apps/cli
- [6] https://registry.npmjs.org/nw · https://api.npmjs.org/downloads/point/last-month/nw ·
  https://api.github.com/search/issues?q=repo:nwjs/npm-installer+is:issue+is:open and `+is:closed` ·
  https://api.github.com/search/issues?q=repo:nwjs/nw.js+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/nwjs/nw.js/main/README.md
- [7] https://raw.githubusercontent.com/neutralinojs/neutralinojs/main/LICENSE ·
  https://api.github.com/repos/neutralinojs/neutralinojs/releases (all pages) ·
  https://api.github.com/search/issues?q=repo:neutralinojs/neutralinojs+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/neutralinojs/neutralinojs/main/README.md
- [8] https://registry.npmjs.org/@neutralinojs%2Fneu · https://api.npmjs.org/downloads/point/last-month/@neutralinojs/neu ·
  https://api.github.com/search/issues?q=repo:neutralinojs/neutralinojs-cli+is:issue+is:open and `+is:closed`
- [9] https://registry.npmjs.org/@electron-forge%2Fcli ·
  https://api.npmjs.org/downloads/point/last-month/@electron-forge/cli ·
  https://api.github.com/search/issues?q=repo:electron/forge+is:issue+is:open and `+is:closed`

## Consequences

- Every Bridge file carries Chromium and Node.js, so it is large; in exchange, the Bridge runs the shared modules
  unchanged and needs nothing else installed.
- The publisher of Agent M's releases holds an Apple Developer ID and a Windows code-signing certificate, and the private
  key whose public half the Bridge uses to check update files; MOD-bridge-build signs with them in the instance's release
  workflow, and the keys never enter a repository.
- Chromium's security fixes reach people only with a new Bridge release built on a newer Electron.
- Updates come from the update feed of the instance whose release the person installed; the Bridge never downloads one
  by itself.
- On macOS, electron-updater applies an update from a zip of the app published beside the disk image (electron-builder's
  documentation of auto-update, address [3]); the zip is in the feed, and people still download the one disk image.
  Whether a downloaded update on macOS waits for the person's click also at a relaunch is measured before the first
  release that offers updates, and recorded under `docs/measurements/` (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S
  CHOICE`).
