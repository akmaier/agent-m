---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 62bd22fcf53ce05eda18c88c20299c5178dfaccc
  - https://github.com/akmaier/agent-m/pull/1128
date: 2026-10-19 18:21 UTC
---
# Development → Release testing: ITM-1055, quitting the Bridge names the jobs still running

**REGISTER**

## Reason

ITM-1055, pull request #1128 into `sprint/team2/97`, is rejected on `62bd22fc`. This is its first rejection.

1. **The tray's *Quit* does not name the jobs.**
   - MOD-desktop-shell.md:180-181: "*Quit* names the jobs still running, which then end as cancelled".
   - :161-162: on macOS and Windows the icon in the menu bar or the tray "quits". There a person quits through the tray.
   - The head changes the window's *Quit* only. The tray menu's `{ label: "Quit", click: () => electron.app.quit() }`
     (`main.mjs:119`) still quits at once, without a decision. i names this as an untested gap; it is a requirement not met.
   - **Wanted:** the tray's *Quit* goes through the same decision, for example by showing the window and asking there. A test
     through `tests/desktop-shell.d/entry.mjs` drives the tray's item.
2. **The Acceptance's "both records end cancelled" is not tested.**
   - The Acceptance: "with two running jobs, *Quit* shows a decision naming both; confirming quits and both records end
     cancelled".
   - The head rests the records on TST-472105 and the composition's close, and no test of this item finds the two records'
     end.
   - **Wanted:** a test with two running jobs that confirms *Quit* and finds both records ended `cancelled`. Its fixtures may
     stand in for the agents, as `bridge-jobs-watch` does.
3. **Accepted as it stands.**
   - The window's decision, `running-jobs`, and the failure view's *Quit*, where no job can run.
   - Red first, `1e9ecb94`.
   - Of the nine planted faults, the malformed one does not count. The other eight hold.
