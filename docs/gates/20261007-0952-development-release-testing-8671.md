---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c5920b6eabb7987b8732e52de808fdf8ab81e31e
  - https://github.com/akmaier/agent-m/pull/155
date: 2026-10-07 09:52 UTC
---
# Development → Release testing: ITM-236

**REGISTER**

## Reason

ITM-236, the notifications of what waits: pull request #155 by developer-sonnet-c, on head `c5920b6`, branched from
`sprint/07` at `61a08ad`, which holds ITM-204 and ITM-235.
- The first commit, `7d6ef70`, amended once before any implementation existed, holds only `tests/notifications.test.mjs`,
  and CI was red on it as it stands: that file failed, since `src/notifications/` did not exist yet.
- CI is green on the head (python and node).
- Only the item's scope changed: `src/notifications/index.mjs`, `permission.mjs`, `checks.mjs` and `worker.mjs`, the
  module's Parts, using the modules it lists only through their interfaces; and the new test, whose header names
  MOD-notifications.
- The six new tests name what they guard and MOD-notifications, and each has its counter-proof recorded in the pull
  request.
- The Acceptance holds, one test per statement, with the browser's notification, worker and timer faked:
  - the permission is asked only on *Switch on*, and a refusal stores nothing;
  - the first check notifies nothing;
  - a file come to wait is notified once with its text and address, and anew once changed;
  - more than three of one kind give one notification of their number;
  - a repository that cannot be read is skipped until the next check;
  - *Switch off* removes both keys.

Noted for the sprint's end, no reason by themselves:
- `addressOf`'s route keys and parameters are this item's reading, for the change between jobs to confirm.
- The test notification's tag is `test`, not the instance and `test`.
- No test reaches the products a browser keeps.
- `notified` is keyed by a repository's path, where MOD-browser-store's catalogue says by the address a person opens.
