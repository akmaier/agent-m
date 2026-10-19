---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8aa11a0402ab98f45abb264d0438fa8ed84aa432
  - https://github.com/akmaier/agent-m/pull/988
date: 2026-10-19 08:55 UTC
---
# Development → Release testing: ITM-829, passed — the main page's greeting, stage links and the site footer

**REGISTER**

## Reason

ITM-829 (MOD-main-page, MOD-site-frame), pull request #988 into `sprint/team1/93`, passes on `8aa11a04`.

- **Four commits, one parent each, no merge, all with the trailer `developer-sonnet-d`.**
  - `efd21f59` holds the tests.
  - `ab31fe11` holds the code.
  - `5900631e` and `8aa11a04` take the harness line `tests/uc-019-prompt-bar-harness.mjs:144` back out and put it back
    again. Under the ruling `c4ce540c`, the harness is no release test.
- **The red** is `efd21f59`, tests only, in run 39225057776, each job with `# todo 0`:
  - node (14): `# fail 2`, TST-829001 and TST-829002;
  - node (10): `# fail 2`, TST-829003 and TST-829005;
  - node (7): `# fail 1`, TST-506001.
  The changed tests are unit tests. No release-level file changes.
- **The code meets the accepted texts (`c0118156`):**
  - `menuOf(page, loaded, product)` is in `menu.mjs` and is the one writer of `/product=` (MOD-site-frame.md:165).
  - The site footer is drawn after the route and before the page's foot (MOD-site-frame.md:156).
  - `greeting.mjs` and the stage links in `cards.mjs` match MOD-main-page.md:68 and :71.
- **CI:** run 39225748911 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`01a74588`) is clean.
- **Replayed in a clean worktree at the head:**
  - The five changed test files pass 78 of 78.
  - Counter-proof: without `siteFooter(UPSTREAM)` in `src/site-frame/index.mjs`, 2 fail, exactly TST-829005 and
    TST-506001.
