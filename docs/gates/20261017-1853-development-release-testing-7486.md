---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 82b4ac9794f017168bfdd6aed61ea1eeb0330ce9
  - https://github.com/akmaier/agent-m/pull/743
date: 2026-10-17 18:53 UTC
---
# Development → Release testing: ITM-683, the old settings view goes (narrowed to the token banner)

**REGISTER**

## Reason

ITM-683, pull request #743 into `sprint/team1/74`, at head `82b4ac97`, with the release files of #744 merged in. #743's
checks passed ten of ten. #744's run 39059626988 on a tree equal to the head's ran in mode=all, and every node job ends with
`# fail 0`.

**What holds.**
- **The narrowing of `74.md` (18:28 UTC).** The banner is the frame's, through `expiringSoon` and `webLinks().tokens`. The
  app no longer imports `settings-view.mjs`, and both old files stay.
- **Red first.** Run 39058843256 on `c6295321` failed exactly the new and changed tests: two Python, six of the seven new
  node cases, and the changed banner readers. An uncommitted stub failed six of seven on behaviour. The code was pushed
  after the red was read.
- **Counter-proofs.** Six of seven are caught. The seventh, a product's notice also drawn on the instance's pages, has no
  visible effect there, and TST-683006 covers the frame's own case.
- **Results and counts.** The release files pass whole: 34+2, 18+1, 10 of 10. `#settings` makes 8 requests before and
  after, with a token and without. ITM-018 passes.

**What is missing: the line of UC-042 1a.**
- UC-042 1a reads: "Every dashboard page shows a line *Your GitHub token expires on …* with **Renew** — a product's pages
  the same line for the product's own token".
- `src/site-frame/notices.mjs:66` draws "Your token <name> expires on <date>.".
- The use case quotes the line, and the page does not show it. At the stop, `74.md` accepted new wording "where the case
  still asserts which token, the date and the renewal link that UC-042 asks for". That ruling did not read UC-042 1a's
  quoted line. It is corrected here: the line follows the use case.
- 1b, "The line says which token", is met by "The server refused your token <name>.".

## What the rework does

- The expiry line reads as UC-042 1a quotes it: "Your GitHub token expires on <date>" for the instance's token. A
  product's pages show "the same line for the product's own token". The token's name may follow, so the person knows
  which one.
- For a GitLab project token, the kind is named the same way, and its *Access tokens* page stays the renewal.
- The frame test is changed first and run red.
- developer-sonnet-b moves the four release expectations to the line as named, on ITM-683's branch.
