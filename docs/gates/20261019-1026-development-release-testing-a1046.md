---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f640fcd040c94ae7a263397f1a43267e088713a4
  - https://github.com/akmaier/agent-m/pull/1010
date: 2026-10-19 10:26 UTC
---
# Development → Release testing: ITM-1046, passed — a release's files are listed with their sizes and checksums

**REGISTER**

## Reason

ITM-1046 (MOD-repository-hosts), pull request #1010 into `sprint/team1/93`, passes on `f640fcd0`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `fbd6dfce` holds only tests: `tests/repository-hosts-release-assets.test.mjs`.
  - `f640fcd0` holds the code: `src/repository-hosts/` only.
- **The red,** run 39236799761, job 118007716254: `# fail 5`, `# todo 0`, `# cancelled 0`, exactly the five `listReleaseAssets`
  tests.
- **The code meets MOD-repository-hosts.md:247-252.** Each file comes with its name, size, address and the SHA-256 the server
  reports, else `null`. The failures are `NotFound`, `TokenRefused`, `RateLimited` and `NotSupported`.
- **The readings stand:**
  - GitLab is built too, since the text covers both servers.
  - A clone with a token reaches the server's API, and only one without a token gives `NotSupported`. That is `connect`'s
    rule (MOD-repository-hosts.md:171-172): "every other function uses the REST adapter where a token is given, or throws
    `NotSupported`".
  - GitLab's address is `direct_asset_url`, else `url`, and `published` is each server's publishing date.
- **CI:** run 39237044523 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`c80a4a5f`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 5 of 5.
  - Counter-proof: with GitHub's digest never read, exactly the first test fails.
