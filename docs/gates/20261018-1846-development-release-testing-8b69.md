---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 81d8cc49ef641aae7d0ff9881a4bda7c79796216
  - https://github.com/akmaier/agent-m/pull/923
date: 2026-10-18 18:46 UTC
---
# Development → Release testing: ITM-955, publishRelease checks every platform's build, its signatures and licences, reworked

**REGISTER**

## Reason

ITM-955, pull request #923 into `sprint/team2/94`, was reworked on the condition of the first rejection (`befce70b`). It
passes on `81d8cc49`. I checked it in a clone of my own.

**The condition holds.** `dueDiligence` reads `CARRIED`, which is Electron and the manifest's run-time packages: electron,
electron-updater, imapflow, nodemailer, postal-mime and ssh2 (`src/bridge-build/publish.mjs:20`). These are the packages
of Parts that the app needs at run time. electron-builder stays out, since it only builds.
- The release notes name each package with its version from `package-lock.json`. MOD-reuse-facts' `Candidate` takes no
  version (MOD-reuse-facts.md:96), so the registry is read by name, as the accepted interface allows.
- TST-473962 gives Electron the licence GPL-3.0 and expects `LicenceNotCompatible`, with nothing published.

**Replayed.**
- The rework's tests-only commit `24eb6262` is red (run 39155425402).
- The head's tests on the first head's `src/` (`58aaff3c`) fail 2 of 8.
- With `"electron"` removed from `CARRIED`, they fail 2 of 8.
- On the head, the tests of MOD-bridge-build and MOD-reuse-facts and the traceability release test pass, 31 of 31.

**What holds besides.** The head is green (run 39155438350). The rework changes only `src/bridge-build/publish.mjs` and
the item's test file, and `package.json` is unchanged. The readings accepted at the first gate stand.

**For the review:**
- The pull request's description still says "five packages". The code and the tests say six.
- `SecretMissing`'s field is `secret`, not the text's `name`, which is a text gap.
- SPEC.md sections 13 to 16 were read by search only.
