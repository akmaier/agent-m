---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 96ee3ec22317bbeb7170d6659f6772b9f39282f6
  - https://github.com/akmaier/agent-m/pull/587
date: 2026-10-16 13:59 UTC
---
# Release testing → Sprint review: sprint team1/44

**REGISTER**

## Reason

Sprint team1/44 was ended on `sprint/team1/44` at `96ee3ec2`. Both selected items are merged, each on the head its gate
passed: ITM-541 with #586 at `f4f9d46a`, and ITM-540 with #585 at `a7b3e892`.

**The release tests of the selected items.** ITM-541 changed one release test, TST-276901 — only how its fixture
installs Openbox — by developer-sonnet-e, who built none of the desktop shell. As its gate named, it first runs on Linux
here: run 38911623039 gives `ok 130 - TST-276901` (job 117009490206).

**Green on the sprint branch.** Run 38911623039, on #587 at `96ee3ec2`, runs every test, the release tests among them,
and passes ten of ten jobs.
- Its first attempt failed node (5) on TST-290115 (`tests/release-itm-290-public-settings-layout.test.mjs`): its apt
  install of Openbox found the dpkg lock held by another test's `apt-get` in the same shard.
- No change of this sprint touches that file, and the job's re-run passed.
- As sprint 37 agreed, it becomes an item: ITM-543, registered with sprint 45's start.
