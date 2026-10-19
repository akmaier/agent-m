---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b7291afefa24527cd7183ef1775d2249be149cf1
  - https://github.com/akmaier/agent-m/pull/947
date: 2026-10-19 05:36 UTC
---
# Development → Release testing: ITM-709, the frame reads a route's files in batches before it draws

**REGISTER**

## Reason

ITM-709 (MOD-site-frame), pull request #947 into `sprint/team1/93`, passes on `b7291afe`.

1. **The participant trailer is present** on both commits: `developer-sonnet-b`.
2. **The red is `60e37d54`.** It holds tests only, and run 39204703356 fails exactly TST-709001 to 709003 and 709005 to
   709009 on node (13). TST-709004 passes on the base by design.
3. **The change** is `src/site-frame/index.mjs`.
   - `readNamedFiles` takes the repository the route shows (the chosen product's, else the instance's) at its default
     branch, asked once per page.
   - It reads the route's `reads` with `readMany` before `render`, as the accepted text states.
   - A host's failure is left to the route, and any other error is thrown.
4. **Measured,** requests per load: with a route of 205 files and a token, 208 fall to 9.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 21 of 21;
   - with the frame not reading the named files, TST-709001, 709003, 709005 and 709006 fail.
6. **Green.** CI run 39204962171 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `02f8043b`).
7. **A gap of the accepted text, not of the head.** The frame now calls the host's `repositoryInfo` and `readSnapshot`
   (`src/site-frame/index.mjs`, `readNamedFiles`). MOD-site-frame's uses name only `Snapshot`, while other modules name
   these two (MOD-settings-pages, for one). The map's interface column missed them. A draft for akmaier names both in
   MOD-site-frame's uses.
8. **The developer's findings:**
   - the route's `render` reads the commit and tree again, since `ViewContext` carries no snapshot;
   - the frame's read adds three requests where nothing is batched (no token, GitLab, a clone).
   Both are text changes, read at the next start.
