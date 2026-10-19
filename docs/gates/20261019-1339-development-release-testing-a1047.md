---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2db7102575aecf9a678b57b2e3288476f2015c2f
  - https://github.com/akmaier/agent-m/pull/1071
date: 2026-10-19 13:39 UTC
---
# Development → Release testing: ITM-1047, passed — the settings page offers the Bridge's file for this computer

**REGISTER**

## Reason

ITM-1047 (MOD-settings-pages), pull request #1071 into `sprint/team1/95`, passes on `2db71025`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-b`.**
  - `066c82be` holds only tests: `tests/settings-pages-bridge-download.test.mjs` (level `unit`).
  - `04aaff71` and `2db71025` change only `src/settings-pages/bridge.mjs`.
    - The route `bridge` draws at once.
    - The file of the latest release for this computer's system joins its section once `listReleaseAssets` answers.
- **The red,** run 39260203219, job 118085549733 on `066c82be`: `# fail 6`, `# cancelled 0`, exactly tests 152 to
  157 of the new file.
- **It meets the Acceptance and MOD-settings-pages.md:198-199.**
  - It offers the `.dmg`, `.exe` or `.AppImage` with its size and SHA-256, and never the updater's `.zip`.
  - Where the server reports no SHA-256, it links the checksum file.
  - The explanations of the two levels and of the warning are folded beside it.
  - Only `src/settings-pages/` and a test naming MOD-settings-pages change.
- **The page names no publisher, and that reading is kept.**
  - No accepted text gives MOD-settings-pages a source for the publisher's name, and the Acceptance does not ask for one.
  - UC-044 step 2 and the explanation `bridge-signed-warning` still name one. ITM-1079 is registered for this.
- **CI:** 20 of 20 checks passed on the head (run 39261308549).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/95` (`51b1a7dd`) is clean.
- **Replayed in a clean worktree at the head,** with a temporary folder of its own, and with `src/bridge-build`'s
  dependencies installed as `tests.yml` installs them:
  - The 342 tests of `tests/settings-pages*.test.mjs` pass.
  - The release tests of the Bridge's pages pass, since sprint-branch CI runs no release tests:
    `release-itm-269-endpoint-route`, `release-itm-280-dashboard-bridge-setup`, `release-itm-285-bridge-tunnels`,
    `release-itm-287-remote-sessions` and `release-uc-037-connect-mailbox`.
  - Counter-proof: with the macOS file allowed to be the `.zip`, the test of a release without a `.dmg` fails.
