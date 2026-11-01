# 7. Configuration and secrets: every page loads in under three seconds

**The change.** `EVERY PAGE LOADS IN UNDER THREE SECONDS` is added after `A PAGE LOAD READS THE REPOSITORY IN BATCHES`. The
rest of the section is as it stands.

**Why.** akmaier, 2026-11-01, after the review pages took up to fifteen seconds to load with a token and `#arc` stopped at
"loading…": "I want a new requirement: every page of agent m must complete loading on the live GitHub page is less than 3
seconds including all ajax loads." `A PAGE LOAD READS THE REPOSITORY IN BATCHES` counts requests; it holds for a page that
waits ten seconds for one of them. The new rule states the time the person waits.

**Design principles** (AGENTS.md §2):
- One responsibility per rule: the batches rule keeps the count of requests, the new rule the time.
- Nothing twice: no other requirement names a time for a page load.
- Nothing the SPEC already says: `A PAGE LOAD READS THE REPOSITORY IN BATCHES` names no time.
- Adding one of a kind changes nothing of another kind: no other requirement changes.
- No special first case: every page of the site is held to the same time.

**Impact list.**
- `tests/live-page-load.py`: the new check, run over night against the live site.

**Origin.** SRC-po-a-maier (registered person github.com/akmaier).
