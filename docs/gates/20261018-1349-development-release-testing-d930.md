---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6d99d3611156922fcb15e4a9b1a1143dcde820c2
  - https://github.com/akmaier/agent-m/pull/901
date: 2026-10-18 13:49 UTC
---
# Development → Release testing: ITM-930, the checks' browser boot sends again any call that is not answered

**REGISTER**

## Reason

ITM-930 (MOD-site-frame, test code only), pull request #901 into `sprint/team1/90`, passes on `6d99d361`.

1. **The cause is named from the log** (`ITM-916-green-node6.log`, lines 2188-2200). `Page.navigate` went out about 51 ms
   after "the window is open" and was never answered. It had the whole 30 s, so it was never sent again. The log cannot tell
   a lost command from a lost answer, and the tests cover both.
2. **Red first.** `8d4c1aac` holds only the new `tests/site-usability-boot-resend.test.mjs`. Run 39132478082 is red on exactly
   TST-930001, 930002 and 930004 to 930009. TST-930003 passes by design.
3. **The change** is in `tests/site-usability.d/browser.mjs`, `routes.mjs` and six setup lines of the two checks:
   - `again(name, attempt, { answerWithin = 3000, limit = 30000 })` gives each attempt 3 s within one total of 30 s;
   - the setup commands, `Page.enable` and the first evaluation, and `Page.navigate` inside the "is loaded" wait, are all
     sent again through it.
   No longer wait was added.
4. **Green.** Run 39132885986 on `6d99d361` passes all twelve jobs, the slowest 1 min 20 s. `git merge-tree --write-tree`
   merges the head into `sprint/team1/90` without a conflict (tree `5351ed4c`).
5. **The Acceptance holds, as amended.**
   - I ran the boot tests on the head: 15 of 15.
   - I replayed the counter-proof in a clean checkout of the head: without `answerWithin` on `Page.navigate`, TST-930001 and
     930002 fail. Restored, it is clean.
   - **The line "both checks pass in a shard beside other Electron files" is amended in the item.** CI decides which
     files share a shard. In this run usability was in node (0) and accessibility in node (2), with no other Electron file,
     and the developer's partition script failed its known positive. The resend is shown deterministically by the tests.
     The line now reads that both checks pass in the sprint pull request's mode=all run, which the end gate reads.
6. **The reading of "the boot" is accepted:** every call up to the first drawn route. The measurement reads, the axe check
   and the planted inserts after it are sent once. The axe check may take longer than one attempt, and an insert is not
   safe to repeat.
7. **The stray path** the developer wrote by mistake under the scratch directory's parent was removed at once. The listing
   before and after is the same. Nothing is left.
