---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 42c1958f06b1c65e8ab16e6bb6a3c0d8d81a3cb1
  - https://github.com/akmaier/agent-m/pull/1159
date: 2026-10-19 20:34 UTC
---
# Development → Release testing: ITM-1082, the release's notes name the publisher of each signed platform

**REGISTER**

## Reason

ITM-1082, pull request #1159 into `sprint/team2/97`, is rejected on `42c1958f`. This is its first rejection.

**The counter-proofs do not cover the cases.**
- The brief of sprint 97 (its first Selection, point 4): "Each case fails on a fault planted in the item's code, restored
  after."
- The pull request adds four test cases and records one planted fault. The case "no line for Linux", which the Acceptance
  names, has none.
- So a fault such as a Linux line being written, a Windows line dropped, or the `Developer ID Application: ` prefix kept may
  pass unseen.
- **Wanted:** a planted fault for each new case, each caught, listed in the pull request. If one cannot be caught, name the
  test it needs.

**Accepted as it stands, for the next gate.**
- Red first: `8e7e6627`, run 39319129683. g read its log.
- The change to the shared fake PowerShell verifier: it prints the signer's name on a second line, which the new reading
  needs. It is in the tests of MOD-bridge-build, the item's module. Test 14, which it touched, passes on the head.
- The readings:
  - a verifier that accepts the signature but reads no name gives `SignatureInvalid`;
  - the name is codesign's first `Authority=` line without its "Developer ID Application: " prefix, or PowerShell's
    `SignerCertificate.GetNameInfo('SimpleName')`;
  - a blank name is none.
- The real codesign and PowerShell output are not verified, since there are no macOS or Windows runners. That is named in
  the pull request, and stands until the release workflow runs on those platforms.
