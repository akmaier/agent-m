---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - eebdbe812e05df909a3e4ac03a2544aa86ac2f45
  - https://github.com/akmaier/agent-m/pull/185
date: 2026-10-07 16:23 UTC
---
# Development → Release testing: ITM-237

**REGISTER**

## Reason

ITM-237, the notifications measured on current browsers: pull request #185 by developer-sonnet-e, who implemented none of
MOD-notifications nor its wiring, on head `eebdbe8`, branched from `sprint/10` at `515622d`. What holds:
- It is a measurement and adds no behaviour, so no red first commit, test or counter-proof is asked of it.
- CI is green on the head (python and node, run 37651054069).
- Only `docs/measurements/2026-10-07_notifications-current-browsers.md` is added, as the Acceptance says.
- The iPhone's row quotes akmaier's measurement as the item gives it, with its date and site, and says that it names no
  version.
- Chrome 154, the installed Chrome.app, and Playwright's Firefox 148 registered the worker from `src/notifications/`
  and showed a notification through it, each with what was done and seen.

Why it is rejected: check 5. The Acceptance's "each browser of the computer with its version, what was done and what was
seen, for each of the three behaviours" does not hold for the item's browsers — current Chrome, Firefox and Safari on a
computer.
- Safari was not measured at all: its "Allow Remote Automation" is off, and no session could be opened. Playwright's
  WebKit 26.4, which is not Safari, got the permission denied and registered nothing.
- In no browser was the third behaviour seen, a click on a notification opening its address. Chrome refused the window
  to a dispatched `notificationclick`, which carries no user gesture. Firefox's worker was out of Playwright's reach.

Noted, no reason by itself: the Firefox measured is Playwright's own build, not a Firefox installed on the computer.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. No item of this
sprint builds on it.
