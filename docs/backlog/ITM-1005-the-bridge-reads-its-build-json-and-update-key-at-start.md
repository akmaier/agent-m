---
id: ITM-1005
title: The Bridge reads its build.json and update key at start
level: module
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-16, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1005 The Bridge reads its build.json and update key at start

**REGISTER**

## Outcome

MOD-desktop-shell.md:130 and :197-198 have the app read its resources `build.json` and `update-key.pem` at start.
`src/desktop-shell/main.mjs:13-16` reads `--instance`, `--origin` and `--data-folder` from the command line only, and
throws a `TypeError` without `--instance`. So a packaged app started as a person starts it, without arguments, ends at
once. ITM-961's real build (TST-961006) and its tunnel check wait for this item.

## The accepted text

Quoted from `main` at 40e04d8d, MOD-desktop-shell.md:130-136:

> **What the build places among the app's resources**, read at start:
>
> - `build.json` — `{ "instance": "alice/agent-m", "appId": "io.github.alice.agent-m.bridge", "origin":
>   "https://alice.github.io", "version": "2026.10.0", "commit": "<commit>" }`: the instance whose release this is, the
>   app's identifier, the instance's Pages origin — the one origin the API answers across origins —, the version and its
>   commit.
> - `update-key.pem` — the publisher's public update key, Ed25519, in PEM.

## Acceptance

- Unit tests naming MOD-desktop-shell: started without arguments, over a fixture resources folder holding `build.json` and
  `update-key.pem`, the app serves the Bridge with `origin` from `build.json` and its data folder from the instance; the
  update check uses the key from `update-key.pem`.
- A missing or unreadable `build.json` ends the start with an error naming the file, and nothing is served.
- Counter-proof: an `origin` taken from anywhere but `build.json` fails the first test.
- Whether the command-line options stay, for tests, is the developer's reading of the accepted text, named in the pull
  request; the text names only the resources.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
