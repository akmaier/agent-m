---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d0e5eb49d68bfe868532f092df14f5ad6ef2f441
  - https://github.com/akmaier/agent-m/pull/927
date: 2026-10-19 07:35 UTC
---
# Development → Release testing: ITM-641, a route of another view is embedded through the frame

**REGISTER**

## Reason

ITM-641 (MOD-site-frame), pull request #927 into `sprint/team1/93`, passes on `d0e5eb49`. MOD-site-frame is accepted at
`f7ab160a` (`e1fc8bd7`).

1. **Every commit carries the trailer** `developer-sonnet-a`, its merge `d0e5eb49` of the sprint branch included.
2. **The red is `ae61dae8`,** run 39155924222, which fails TST-641001 to 641007 on behaviour. Its new test file waited for
   ITM-958, which is on `main`.
3. **The change:**
   - `embedRoute` renders a route of another view loaded on the page into the target, with its parameters;
   - a route not on the page gives `RouteNotLoaded`, with the frame's link to it in the target;
   - `tests/site-frame.test.mjs:17` no longer lists `embedRoute` as untested.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - `tests/site-frame-embed-route.test.mjs` passes 7 of 7;
   - with `embedRoute` always giving `RouteNotLoaded`, TST-641001 to 641004 fail.
5. **Green.** CI run 39211676952 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into today's
   `sprint/team1/93` without a conflict (tree `33bda90c`).
