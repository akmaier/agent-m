---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c2d084a31379a65d1b37da7d6fcc9d33f2fb3ae2
  - https://github.com/akmaier/agent-m/pull/773
date: 2026-10-17 20:41 UTC
---
# Release testing → Sprint review: sprint team1/76

**REGISTER**

## Reason

Sprint team1/76 was ended on `sprint/team1/76` at `c2d084a3`. Its items are merged on the heads their gates passed:
- ITM-711 with #767 at `24860104`;
- ITM-819 with #768 at `ea4e36fb`;
- ITM-710 with #772 at `aba1a0d4`.

ITM-821 left the sprint, waiting for a draft.

**The release tests.** Run 39067570326, on #773 at `c2d084a3`, runs every level (mode=all, read by the Scrum Master in
each log) and passes all ten jobs. I read the eight saved node logs (`sm-773-*.log`).
- Each ends with `# fail 0`. There are 3848 tests and 12 todos, the known findings.
- **The release tests next to this sprint's reads:** `ok 175 - TST-479201` and `ok 176 - TST-479202`, unchanged, since
  the entry page's batch went to ITM-830. load-per-view's `ok 108` and `ok 109` are the new `#review/uc` cases.
- **The release tests named every sprint:** `ok 158 - TST-418104`, `ok 117 - TST-276901`, `ok 386 - TST-377012` and
  `ok 387 - TST-377013`.
