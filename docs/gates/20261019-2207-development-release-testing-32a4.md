---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - cb9745dcba7433a8014155d1bc369cecc16171e1
  - https://github.com/akmaier/agent-m/pull/1171
date: 2026-10-19 22:07 UTC
---
# Development → Release testing: ITM-1056, the release tests of the Bridge's release, its updates and its window's settings

**REGISTER**

## Reason

ITM-1056, pull request #1171 into `sprint/team2/97`, passes on `cb9745dc`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** The checks SPEC.md names, `tests/test_bridge_release.py` and
   `tests/test_bridge_settings.py`, each with its data in Markdown (AGENTS.md §7). No file in `src/` changes.
   - The red evidence is 25 planted faults.
   - I repeated one: the fuse `runAsNode` set to true in `src/bridge-build/builder.mjs:40` fails a test. Restored, the 8
     tests pass.
2. **The writer.** developer-sonnet-f built none of the Bridge's items (`RELEASE TESTS ARE NOT WRITTEN BY THE
   IMPLEMENTER`).
3. **f's readings, accepted as named limits, as ITM-1082's gate accepted the unverified codesign output:**
   - Starting the packaged app on each platform cannot run here. What the repository decides is checked: the app carries
     its Electron, and the fuses forbid plain Node.
   - The verification of notarisation and signatures runs only in `buildPlatform`, on the platforms' runners.
     `publishRelease` refuses a build that records no publisher.
   - Pair anew counts as setting the pairing token.
   - The working folder is typed, because Electron's folder dialog is not reachable here.
   - `builderConfig` is read from `builder.mjs`, because the interface cannot run without electron-builder.
4. **Findings:** none. Where the tests reach, the Bridge follows UC-044.
