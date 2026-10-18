---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 73d64ef9bc61d4dfbceab2ad7c053036769a59c1
  - https://github.com/akmaier/agent-m/pull/823
date: 2026-10-18 00:33 UTC
---
# Development → Release testing: ITM-860, a token stored on the add-product page is used by the open page (narrowed)

**REGISTER**

## Reason

ITM-860, pull request #823 into `sprint/team1/81`, at head `73d64ef9`. Run 39082905137 passed all twelve jobs. It changes
`src/settings-pages/products.mjs` and `settings.mjs` and adds two test files, +215.

**Narrowed to the add-product page.**
- *Finish setting up*'s token reaches pages through MOD-site-frame's `instance.host`. Its fix lies outside MOD-settings-pages,
  so it is ITM-869 (MOD-site-frame).
- The developer's option (b), reconnecting when Settings opens, would leave every other page stale, and is not taken.

**Red, then code.** Both tests-only commits were red: `de8d56d2` on TST-860001, and `e268145a` on TST-860001 to 003. The
code was pushed after each run had ended.

**The acceptance is met for the add-product page.**
- The settings page's in-place context gains `tokenStored`, beside `endpointsChanged`, which runs ITM-825's
  `reconnectHosts`. The add-product page calls it after storing a token, on GitHub's step A and GitLab's step B.
- The product's next request carries the new token. Three planted faults are caught.
- The local failures are the same eight names on the base and the head.
- No release test was changed, so no release-test item is needed.

**A finding against a hard rule, registered with a draft.**
- `reconnectHosts` connects without the stored secrets that `startSite` and `chosenProduct` pass. A reconnected host then no
  longer refuses a commit that holds a stored secret.
- That weakens `NO SECRET IN THE REPOSITORY` (SPEC.md:37) since ITM-825.
- `secretValues` is not in MOD-settings-pages' Uses. So the draft adding it is committed with this gate, for akmaier
  (`docs/architecture/MOD-settings-pages.md`).
- The fix is ITM-868, first in line once akmaier accepts.

**Other findings, registered.**
- ITM-869: the setup page's token and the frame's instance host.
- ITM-870: *Import settings* stores tokens without a reconnect.
- The eight local failures are the known environment cases.

**Process.**
- A refused script was not repeated in another form, and plain commands were used.
- The mistyped path, created and removed at once, is the third this sprint, and goes to the retrospective.
