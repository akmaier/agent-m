---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b44291122a359504fbb1828c7614ea185ffefda9
  - https://github.com/akmaier/agent-m/pull/592
date: 2026-10-16 14:32 UTC
---
# Release testing → Sprint review: sprint team1/45

**REGISTER**

## Reason

Sprint team1/45 was ended on `sprint/team1/45` at `b4429112`. The four items still selected are merged, each on the head
its gate passed:
- ITM-543 with #589 at `d0fa66f4`;
- ITM-542 with #588 at `d3eb12e2`;
- ITM-535, as cut, with #590 at `b662e5ab`;
- ITM-544 with #591 at `b4429112`.

ITM-536 went back to the backlog before any test. It waits for akmaier's acceptance of `5957e038`.

**The release tests of the selected items.** ITM-543 changed how two test fixtures run their `apt-get` calls, among them
those of the release test TST-290115. As its gate named, both first run on Linux here, in run 38916108581:
- `ok 185 - TST-290115: public Settings tabs fit phone and desktop layouts` (job 117023897027);
- `ok 24 - TST-294001: Settings reaches the composed Bridge through real Apache and nginx TLS reverse tunnels` (job
  117023896986).

ITM-542, ITM-535 and ITM-544 change no release test, and their developers ran the release tests of their modules
locally before their gates.

**Green on the sprint branch.** Run 38916108581, on #592 at `b4429112` in mode `all`, runs every test, the release tests
among them. All ten jobs pass on its first attempt, with no re-run.
