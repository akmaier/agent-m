---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e86be6bb071877447d4def200c66758c9cbd7b40
  - https://github.com/akmaier/agent-m/pull/931
date: 2026-10-18 21:05 UTC
---
# Development → Release testing: ITM-669, a navigation that keeps the product keeps its host

**REGISTER**

## Reason

ITM-669 (MOD-site-frame), pull request #931 into `sprint/team1/92`, passes on `e86be6bb`. MOD-site-frame is accepted at
`ff84b83e`.

1. **The participant trailer is present** on every commit: `developer-sonnet-a`. `git show --cc` of the merge `cdc178e6`
   is empty.
2. **The reds are `1a362b48` and `5450caa3`,** which hold tests only.
   - Runs 39164111080 and 39165276323 fail TST-669001 to 669005.
   - TST-669006 is a guard that passes by design.
3. **The change** is `src/site-frame/routing.mjs` only.
   - It keeps one host per store and product address while the token's value, its name and `secretValues(store)` stay
     the same.
   - Otherwise it connects anew with the token, its name and the secrets.
   - This is the reading in 92.md, on MOD-repository-hosts.md:83.
4. **The slip, judged.** The system and release files that load the frame were not run before the code was pushed (sprint
   89's agreement), so CI on `074dc3f5` failed TST-599203. That test pinned the very read this item removes.
   - Its correction in `e86be6bb` is the item's own output (`d995c09b`), and it is quoted in the pull request. It came
     after the code, so it has no red run of its own.
   - **I replayed it instead:** with `routing.mjs` as it was at `5450caa3`, TST-599203 fails ("opening the gaps page a
     second time … asks for the lists' files no more"), and with the head's it passes.
   - The slip is a lesson for the retrospective, not a defect of the head.
5. **Counter-proofs, replayed by me in a clean checkout of the head:**
   - the two files pass 16 of 16;
   - with the old `routing.mjs`, TST-669001 to 669005 and TST-599203 fail.
   The developer's second counter-proof, a stamp without the secrets, failed TST-669005.
6. **Green.** CI run 39165876763 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `f59698ad`).
