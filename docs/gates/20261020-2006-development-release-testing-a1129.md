---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 4e41a9cdbecc28b00be9f54d051f80765b1c609d
  - https://github.com/akmaier/agent-m/pull/1233
date: 2026-10-20 20:06 UTC
---
# Development → Release testing: ITM-1129, rejected — TST-513027 still fails, and its todo stays

**REGISTER**

## Reason

ITM-1129 (MOD-prompt-bar), pull request #1233 into `sprint/team1/101`, is rejected on `4e41a9cd`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-d`.
- **The red,** run 39485864666, job 118845986239 on `0ab7041b`: `# fail 2`, `# cancelled 0`, exactly tests 146 and 147.
- The two deleted lines of `tests/prompt-bar-hand-over.test.mjs` are the fixture's `open` signature and its subject,
  rewritten to take a subject of the test's choosing. No assertion is removed.
- **The rejection of `f2754010` is answered.**
  - The fixture subject gives `page`, `target` and `draft`, the participant's answer, beside `source`, as the draft
    route's subject does.
  - The record holds only `source`, and the planted page text and answer are absent.
  - A hand-over of another kind takes no source.
- The code takes only `source` from `paramsFor`, as the accepted draft `58a09eb0` says.
- CI passes on the head (run 39486382371).

**What fails: the Acceptance's first line,** "TST-513027 passes and its `todo` is removed".
- Replayed at the head, `tests/system-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs` still fails TST-513027 (test
  22, marked todo).
- The error is the item's own: "JOB-… failed: entrySections needs the job's source as text" (`:535`, `'failed' !== 'done'`).
- The test is of level `system`, so its implementer may change it (SPEC.md:1501-1503 covers `release`).

**What passes on the next head.**
- TST-513027 passes, and its todo is removed. developer-sonnet-d first reads why the job still lacks its source:
  - The accepted text gives the source only to a hand-over of the subject's own kind. If the test's page is not of the
    kind `change-requirements`, the test's world must open the page UC-049 4a means, and the pull request names it.
  - Where the job receives the source in a form `entrySections` does not read, the code gives it as that function asks.
- Where neither reading fits the accepted texts, the item stops and names why.
