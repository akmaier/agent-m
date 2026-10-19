---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f8a3ddd0f7e920fb50f1ca66a5d0f0c666311470
  - https://github.com/akmaier/agent-m/pull/955
date: 2026-10-19 06:23 UTC
---
# Release testing → Sprint review: sprint team2/94

**REGISTER**

## Reason

Sprint team2/94 was ended (`ece7e49e`) and closed (`8a2becd2`). After the close, `sprint/team2/94` took ITM-1001, the
jsrun fix, which the release tests needed (94.md, "After the close"). Its head is `f8a3ddd0`. Ten items are done, each
merged at the head its gate passed:
- ITM-608 #908 (`8ccbeba9`, `94f2165a`);
- ITM-955 #923 (`0e8df73f`, `81d8cc49`, after the rejection `befce70b`);
- ITM-952 #925 (`bb93fa28`, `6da63ed4`);
- ITM-873 #904 (`ee5d1364`, `1edbe699`, after the rejection `ba157fdf`);
- ITM-934 #924 (`016efabe`, `2cf6e17a`);
- ITM-958 #952 (`ade8a55c`, `8e0056ec`);
- ITM-1000 #948 (`70712540`, `490f1639`);
- ITM-757 #928 (`effd2aad`, `7246ae9a`, after the rejection `e411ef49`);
- ITM-953 #929 (`bc0e206f`, `d340614e`);
- ITM-1001 #957 (`7c1304f5`, `b718c0b4`).
ITM-954 and ITM-961 go into the next sprint.

**The release tests.** Run 39209355610, on #955 at `f8a3ddd0`, checks out "Merge f8a3ddd0… into 7c1304f5…". It runs every
level (mode=all) and passes 20 of 20 jobs. The longest job takes 83 s, under the two-minute limit (agreement 80).
- TST-412100 (`tests/test_no_history.py`) passes. It failed on the first run of #955 with "Argument list too long" and is
  ITM-1001's direct proof.
- The earlier failure of TST-321003 (node (1)) did not recur. It was the flaky case already noted.

**No installed packages in the history.** `git log d4fd882b..f8a3ddd0 -- src/bridge-build/node_modules` prints nothing.
