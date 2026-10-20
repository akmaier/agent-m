---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - f71fcfb7
  - https://github.com/akmaier/agent-m/pull/1262
date: 2026-10-20 22:56 UTC
---
# Development → Release testing: ITM-767, an opened test shows its declaration, counter-proof and history

**REGISTER**

## Reason

Pull request #1262 into `sprint/team1/102` does not pass on `f71fcfb7`. One reading adds a bound that the item's text
does not hold.

1. **The commit that removed a test is looked for in only 30 commits: a failure, fixed here.**
   - ITM-767's reading of 5a: "The commit that removed a test is the first commit in its file's history
     (`readHistory`) whose version of the file no longer declares it." UC-029 5a marks the test removed "at the commit
     that removed it".
   - `src/trace-pages/test-detail.mjs:18-19,108` reads one page, `HISTORY_PAGE = 30`. Where the file has changed more
     than 30 times since, the page reads "Removed (the commit is not among the latest commits of its file)" and names
     no commit.
   - `readHistory`'s `limit` is optional (MOD-repository-hosts.md:192-195), and its history is read a page at a time.
     So the whole history is within the accepted text, and the bound is a rule the texts do not give (AGENTS.md §6a.7).
   - **The way back:**
     - first, a commit that holds only tests: a fixture whose test was removed more than 30 commits of its file ago
       names that commit, and its CI is red;
     - then the fix: the history is read until the commit is found.
2. **5b is cut, not a stop.** A log the server no longer keeps is told by MOD-repository-hosts' `ciRunLog`. MOD-trace-pages'
   uses do not name it, and a history mark names its run only through a record's optional `run` address. So 5b needs a
   draft, which ITM-767's drafts did not cover.
   - It is cut into **ITM-1168**, which begins with that draft.
   - ITM-767's Outcome now names the cut, so "each part above" in its acceptance no longer holds 5b.
3. **The scope.** ITM-767's acceptance bounded it to `src/trace-pages/`. Its accepted draft `be70bf16` gives
   MOD-repository-hosts' `WebLinks.file`, which is built here in `src/repository-hosts/web-links.mjs`, with
   `tests/repository-hosts-web-links-file.test.mjs` (Module: MOD-repository-hosts). The acceptance now names both. The
   change stays within them.
4. **sonnet-c's other readings, judged.** Each follows the item or an accepted text, and none adds a rule:
   - the schedule row is the test's level, or `paid`;
   - a test not declared at the version shown is looked for in the release tags, newest first;
   - a model-dependent test's rate line has one point per release, as step 5 says ("its rate per release").
5. **What was checked.** The Scrum Master read the reds of `37db73b0` from the raw logs:
   - job 118931049117: "# fail 9", "# cancelled 0", tests 283 to 291;
   - job 118931049257: "# fail 3", tests 147 to 149.
   Run 39511212784 is green on the head. The replay waits for the fixed head.
