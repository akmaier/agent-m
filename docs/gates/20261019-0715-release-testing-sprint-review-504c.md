---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ddf8901c18f03fd372aa3873feba83e1da90850a
  - https://github.com/akmaier/agent-m/pull/971
date: 2026-10-19 07:15 UTC
---
# Release testing → Sprint review: sprint team2/95

**REGISTER**

## Reason

Sprint team2/95 was ended (`b43d804b`) and closed (`514981fe`). Its head is `ddf8901c`. Four items are done, each merged
at the head its gate passed:
- ITM-954 #956 (`40e04d8d`, `0ee4ac15`);
- ITM-1003 #959 (`18267de4`, `3e513994`);
- ITM-959 #961 (`38f7824c`, `7021899d`);
- ITM-1002 #960 (`ef777732`, `c3384395`, after the rejection `eeb8c6f5`).

**The release tests.** Run 39214571641 on #971, at `ddf8901c`, runs every level (mode=all) and passes 20 of 20 jobs. The
longest job takes 66 s, under the two-minute limit (agreement 80). The jobs' logs show the sprint's release files ran:
- `test_mail_replies` (ITM-959);
- `test_bridge_agents`, with TST-815001's records updated for ITM-1002.

**No installed packages in the history.** `git log 705b34dc..ddf8901c -- src/bridge-build/node_modules` prints nothing.
