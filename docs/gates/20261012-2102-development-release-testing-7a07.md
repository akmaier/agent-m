---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0fdd198e58120b3c4328ba08938db161c0e6848b
  - https://github.com/akmaier/agent-m/pull/456
date: 2026-10-12 21:02 UTC
---
# Development → Release testing: ITM-459, the Bridge app's packages at exact versions

**REGISTER**

## Reason

ITM-459, pull request #456 by developer-sonnet-c into `sprint/team1/23`, head `0fdd198`. The first commit `c646662`
holds only `tests/bridge-build-packages.test.mjs`, and CI was red on it (run 38306951896): its three tests fail, and no
other test does. CI is green on `0fdd198` (run 38307699567, 2142 tests, 0 failures). The change is only
`src/bridge-build/package.json` and `package-lock.json`; the test reads those files alone, names MOD-bridge-build, and 40
faults are recorded, none surviving. The Acceptance holds: the seven packages at the versions ARC-050, ARC-051 and
ARC-052 record — electron 44.5.1, electron-builder 26.15.3, electron-updater 6.8.9, imapflow 2.2.5, nodemailer 10.0.15,
postal-mime 4.0.4, ssh2 1.17.0 —, the lockfile at the same versions, `nan` and `cpu-features` installed by none of them.

The points weighed:
- electron and electron-builder stand in `devDependencies`, since electron-builder builds the app from them and refuses
  them in `dependencies`; the five packages the app runs with in `dependencies`.
- `nan` and `cpu-features` are in the lockfile as ssh2's optional dependencies; MOD-bridge-build installs "from the
  lockfile without optional dependencies", so they are left out as the file says.
- The known vulnerabilities, read at the gate with `npm audit` over the pull request's lockfile: eight, all
  `moderate`, none high or critical, all in electron-builder's build-time chain — `sprintf-js`'s denial of service
  through unbounded precision specifiers (GHSA-hp3w-g68c-fv3c), reached through `roarr`, `global-agent` and
  `@electron/get` in `app-builder-lib`, `dmg-builder` and `electron-builder-squirrel-windows`. None is in a package
  the app runs with; npm's offered fix is electron-builder 26.5.0, an older version than ARC-050 records. Changing a
  recorded version is a change of ARC-050, for akmaier; noted for the review.
