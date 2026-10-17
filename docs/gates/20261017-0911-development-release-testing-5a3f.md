---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 39fbfbec68254255bcc465d3fa69fcf86df79294
  - https://github.com/akmaier/agent-m/pull/713
date: 2026-10-17 09:11 UTC
---
# Development → Release testing: ITM-663, A note with a line break keeps its row whole

**REGISTER**

## Reason

ITM-663, pull request #713 into `sprint/team1/69`, at head `39fbfbec`. developer-sonnet-c wrote it.

**Red.** The tests-only commit `4e792897` was red in run 39019680453 (`failure` on `4e792897`). Node (6) has `# fail 4`
and `# todo 1` (existing): TST-663001 to 663004. They fail on behaviour, since the raw break splits the row.

**The code, read in the diff:** one line of `listedFiles` in `src/source-register/index.mjs`, which both writers use. Each
CR LF, CR or LF of a note becomes one space before `|` is escaped. Its two comments say so.

**What else holds.**
- CI is green in run 39019980931 on the head.
- GitHub's mergeability is unknown after #712's merge, so I checked it myself: `git merge-tree --write-tree` of
  `sprint/team1/69` and the head merges without a conflict (tree `f30fd5a8`).
- The planted fault, the replace removed, fails all four tests.
- The draft run, node and Python, changed no existing test, and ITM-018 passes.
- No read, no error and no harness is added.

**Readings taken.**
- **A line break is CR LF, CR or LF, and CR LF counts as one.** These are the line endings of Markdown (CommonMark: "a
  line ending is a line feed, a carriage return not followed by a line feed, or a carriage return and a following line
  feed"), the format the entry is written in.
- **The note is not trimmed.** A break at either end leaves a space, which keeps the note as the person gave it.
- **U+2028 and U+2029 are left as they are: no item.** They are not Markdown line endings, so they do not split a table
  row. The lead names no case where they would.
