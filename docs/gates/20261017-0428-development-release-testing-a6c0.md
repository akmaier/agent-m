---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 97ef6b7c1d3908596a17ad2fa15b4f8eaa7d886f
  - https://github.com/akmaier/agent-m/pull/686
date: 2026-10-17 04:28 UTC
---
# Development → Release testing: ITM-594, The specification view offers every release tag and shows a released version as of its tag

**REGISTER**

## Reason

ITM-594, pull request #686 into `sprint/team1/64`, at head `97ef6b7c`. developer-sonnet-d wrote it.

**Red.** The tests-only commit `41f7eca3` was red in run 39002048676 (`failure` on `41f7eca3`). Node (3) has `# fail 8`
and `# todo 1`:
- TST-594000 to 594006;
- TST-473167 (CASE ITM-277-03, the empty state of an absent SPEC). Its expected whole text changes now that the choice
  is drawn above it.

Nothing changed between the red and the green.

**The code against the readings in the item.**
- The choice offers the handed ref, labelled *current* on the default branch, then the tags. Release tags come newest
  first by `vYYYY.MINOR.PATCH`, and other forms follow in the host's order.
- A tag is drawn read-only and "as of" it. Without tags, only the handed ref is offered (1c).
- The header `flow.mjs:1-2` is rewritten, as the item's grep named.
- The fakes gained `listTags` as listed, except `tests/system-uc-018-edit-dashboard.test.mjs:164`, whose host never
  reaches the trace route.
- **`subject.mjs` is accepted, though the item did not name it.**
  - Once the route can change its version, the bar's subject must name the version shown, not the handed
    `params.ref`.
  - MOD-trace-pages' descriptor says the subject at a released version is "the requirement as it read there"
    (UC-020 1a).
  - It is a behaviour the change alters, so it has its test (sprint 62): TST-594004, which fails with `params.ref`
    planted back.

**What else holds.**
- CI is green, ten of ten on the head, and GitHub reports the pull request mergeable.
- Six planted faults are caught.
- The release tests TST-472516 and 472518 pass before and after. Both open the public `#spec` through
  `openDashboard`, so the live caller runs the new code.
- The UC-019 release tests and ITM-018 pass, and the fetch spy, proved on a positive, sent nothing.

**Readings and findings** (sprint 63's agreement):
1. **The start missed TST-473167.** The item named "any test whose expected result does change" as a rule, but listed
   only TST-472516 and 472518 as candidates. It named a fake (`system-uc-018…:164`) that the route never reaches. Both
   are slips of the start, for sprint 64's feedback. The developer named TST-473167 in the pull request before the red.
2. **Two failed reads stay plain:** a chosen version that cannot be read, and a failed `listTags`.
   - The second is worse: `tagsOf` reads a failure as no tags, and the view then says "No release is tagged yet", which
     is false when the tags could not be read.
   - Both are registered in ITM-601, which already gives the specification view MOD-site-frame's `readProblem` and
     waits for the draft `1928b0ff`.
   - They do not block this item: its acceptance names tags, a tag's view and no tags, and none of them is a failed
     read.
3. **No look at the live `#spec` is asked.** No binding text requires one (AGENTS.md §6a.4), and the release tests
   above already run the live caller.
