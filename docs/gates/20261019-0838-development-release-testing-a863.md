---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2deb3e53f299e70f8a54c41d0e84e119af82069e
  - https://github.com/akmaier/agent-m/pull/981
date: 2026-10-19 08:38 UTC
---
# Development → Release testing: ITM-863, passed — the main page hands the notification checks each product's host

**REGISTER**

## Reason

ITM-863 (MOD-notifications, MOD-site-frame, MOD-main-page), pull request #981 into `sprint/team1/93`, passes on `2deb3e53`.

- **Commits:** all five carry the trailer `developer-sonnet-a`. The merge `bc910b9b` brings in the sprint branch, and its
  `git show --cc` is empty.
- **The first red** is `942f70fc`, recorded at the earlier gate.
- **The new red** is `cb397786`, tests only: one file, `tests/dashboard-notifications-wiring.test.mjs`. In run 39223046922,
  job node (1) has `# fail 1`, `# todo 0`, and the one failure is TST-863201: "the main page's checks reach a kept product
  through its host, and a token removed since is not sent".
- **The code meets the accepted texts (`c0118156`):**
  - `src/home/home.mjs` hands `watchForAcceptance` `productHost: productHostFollowingStore({ store: notificationsStore })`,
    imported from `../site-frame/index.mjs`.
  - `src/site-frame/index.mjs` exports `productHostFollowingStore`, which MOD-site-frame.md:45 provides.
  - MOD-main-page.md:16-17 lists `MOD-site-frame.productHostFollowingStore` and `MOD-notifications.watchForAcceptance` among
    its uses.
  - This settles the earlier rejection.
- **CI:** run 39223660598 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` is clean onto `sprint/team1/93` (`37886a09`) and onto #986's head
  `b17c28d6`. #986 merges first.
- **Replayed in a clean worktree at the head:**
  - `tests/dashboard-notifications-wiring.test.mjs` passes 7 of 7.
  - Counter-proof: without `productHost` in `home.mjs`, 6 pass and 1 fails.
