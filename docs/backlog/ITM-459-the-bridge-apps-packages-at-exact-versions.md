---
id: ITM-459
title: The Bridge app's packages at exact versions
level: module
realises:
  - UC-044
  - AGENT M'S SOURCE CODE LIVES IN SRC
modules:
  - MOD-bridge-build
builds_on:
tests:
  - unit
origin:
  - ITM-420, held in sprint team1/22
  - MOD-bridge-build, Parts: `package.json`, `package-lock.json`
---
# ITM-459 The Bridge app's packages at exact versions

**REGISTER**

## Outcome

MOD-bridge-build's `package.json` and `package-lock.json` in `src/bridge-build/`, as its file states them: the Bridge
app's packages at exact versions — electron, electron-builder and electron-updater as ARC-050 records them, imapflow,
nodemailer and postal-mime as ARC-051 records them, and ssh2 as ARC-052 records it —, with the lockfile from which
`buildPlatform` installs them, and ssh2's optional native dependencies, `nan` and `cpu-features`, left out (ARC-052).
`buildPlatform`, `publishRelease` and the release workflow are not part of this item.

How a test reaches these packages is not stated in MOD-bridge-build's file, which names their install only in
`buildPlatform`, "from the lockfile", on a release runner. The reading this item takes, which needs no change of an
accepted text (AGENTS.md §6a item 6): the packages a module of the Bridge uses are installed from this lockfile once,
before the tests run, by the CI step that runs them — as `buildPlatform` installs them — and never inside a test; a test
that needs one finds it there or is skipped naming the missing install, and no test downloads a package. That step
changes `.github/workflows/tests.yml`, a file no module owns, so it is a change between jobs of its own, named when an
item that needs the packages is selected (ITM-420).

## Acceptance

- Unit tests that name MOD-bridge-build state, before the files exist, from `src/bridge-build/package.json` and
  `package-lock.json` alone, with nothing installed and nothing reaching the network: each of the seven packages at the
  exact version its decision records, no range; the lockfile holding the same versions; neither `nan` nor
  `cpu-features` in what the lockfile installs.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-build/` and the tests that name MOD-bridge-build change.
