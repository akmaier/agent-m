---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 58aaff3cb497916bcd0610eff7ec6635723845c4
  - https://github.com/akmaier/agent-m/pull/923
date: 2026-10-18 18:42 UTC
---
# Development → Release testing: ITM-955, publishRelease checks every platform's build, its signatures and licences

**REGISTER**

## Reason

ITM-955, pull request #923 into `sprint/team2/94`, is rejected on `58aaff3c`, on one condition. The due diligence leaves
out Electron, a package the app carries.
- MOD-bridge-build.md, at the accepted blob `279df7dc`, says that `publishRelease` "reads again the due diligence of every
  package the app carries (ARC-052)".
- Its Data says what the app carries: "the packages above that the app needs at run time". The packages above are those
  of Parts (:37-38): "electron, electron-builder and electron-updater (ARC-050); imapflow, nodemailer and postal-mime
  (ARC-051); ssh2 (ARC-052)".
- Of these, the app needs all but electron-builder at run time. Electron is the runtime the app ships.
- `dueDiligence` (`src/bridge-build/publish.mjs`) reads only `package.json`'s `dependencies`. Those are electron-updater,
  imapflow, nodemailer, postal-mime and ssh2. `electron` stands under `devDependencies`, because electron-builder
  requires it there. So its licence is never read again, and a release would publish whatever Electron's licence became.
- The tests take the same list (`RUN_TIME`, `tests/bridge-build-publish-release.test.mjs:32`), so they cannot see it.
- The rework reads the six run-time packages of Parts, Electron included, at the versions of the lockfile. A test fails
  when Electron's licence is not known to be compatible. Transitive packages are not asked for: the text names "the
  packages above".

**What holds, and the readings I accept**, so that no further condition comes after the rework:
- The tests-only first commit `89cb951c` is red (run 39154897336), and the head is green (run 39155080137). Only
  `src/bridge-build/` and one new test file naming MOD-bridge-build changed. The seven tests carry recorded
  counter-proofs, and `tests/bridge-build-*.test.mjs` pass on the head, 13 of 13.
- **`SecretMissing` for a missing `BRIDGE_UPDATE_KEY`: admissible.** `SecretMissing` is this module's error for a
  missing secret (MOD-bridge-build.md:97), and the key is one of its secrets (Data). Without the key, `SHA256SUMS`
  cannot be signed, so failing before anything is published follows the text. It is no invented interface.
  - The field is `secret`, not the text's `name`, because an error's own `name` is `SecretMissing`. The text cannot
    hold both, and this goes to the review as a text gap.
- **Only `not known to be compatible` refuses: admissible.** The text's trigger, "no longer known to be compatible", is
  MOD-reuse-facts' verdict `not known to be compatible`. A registry that does not answer, or answers with no licence,
  gives `not checked` or `blocked`, and the notes name it.
- **The rest is admissible as named:**
  - deviation 2: a local checksum or size mismatch is `SignatureInvalid`;
  - deviation 4: the commit is read from `listTags`;
  - deviation 6: a server that reports no SHA-256 is `ChecksumMismatch`;
  - deviation 7: `<file>.sig` comes from `platform-build.json`;
  - the fake registry at `fetch`.

**For the review, not a condition:** SPEC.md sections 13 to 16 were read by search only. The brief asked for SPEC.md in
full, while `docs/instructions/developers.md`, point 3, asks for the item's requirements.
