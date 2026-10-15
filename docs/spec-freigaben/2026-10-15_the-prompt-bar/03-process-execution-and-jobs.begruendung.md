# 13. Process execution and jobs: a conversation is written to a repository only when recording is on

**The change.** `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY` reads "Every job other than a conversation held in a browser
tab has a record …"; its name stays. Three new requirements follow it:
- `A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON` — without the instance's switch, no message of a
  conversation reaches a repository;
- `A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD` — with it, every message is recorded under `docs/conversations/` of
  the repository of the page the conversation is held on;
- `SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS` — the notice before switching on, naming public repositories.

The rest of the section is carried over byte for byte.

**Why.** akmaier's decisions of 2026-10-15: the conversation in the prompt bar is held in the browser tab and is not
recorded in a repository; the browser stays open, and if it closes, what the conversation started ends with what it
produced. As an option under the general settings, all conversations can be recorded in git. Without the change to `A JOB
IS RECORDED IN ITS PRODUCT REPOSITORY`, every message would be a job whose record names its inputs, and the conversation
would be committed message by message whatever the setting says.

**A conversation stays a job.** Only the job record is exempted. Every other rule on jobs keeps applying to it — the
chapters of the book for the kind of work (`A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING` and its
three siblings), the context checks, the correction loop, `NO COST IS GUESSED`, `A CANCELLED JOB WRITES NOTHING MORE`.
`ONE DASHBOARD SHOWS EVERY JOB` lists a conversation in the tab that holds it, as it lists every job running in a tab. A
conversation record is not a job record: it holds the messages, and it is evidence (entry 02).

**The setting is the instance's.** It is one switch for every conversation of the instance, kept in the instance
repository's settings, because it binds everyone who works on the instance and is changed by a commit; a product's
repository receives the records of the conversations held on its pages. The notice names public repositories as `SWITCHING
PSEUDONYMISATION OFF STATES WHAT FOLLOWS` does, since recording there publishes what was said.

**Against the rest of the SPEC.** Work a conversation hands to CI is a job of its own and is recorded; with recording off,
its record names its inputs by reference — the participant, the page, the commit read. What a person saves from a
conversation is the person's commit, which names the Agent M version, the participant and the model (`AN ARTIFACT RECORDS
THE VERSION THAT PRODUCED IT`). Recording does not lift `NO SECRET IN THE REPOSITORY`, `NO PERSONAL DATA FROM A MAIL ENTERS
A REPOSITORY` or `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`: a message they forbid is not recorded, and the
record says that one was withheld and why. `A JOB IDENTIFIER IS NEVER REUSED` concerns recorded jobs only.

**Impact list.** Use cases that realise `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`: UC-010, UC-011, UC-024, UC-034,
UC-036, UC-043 — unchanged, as none of them holds a conversation; UC-049 realises it and the three new requirements, UC-042
the setting and its notice. Architecture: ARC-039, ARC-046, MOD-job-ledger. Code: `src/home/progress.mjs`,
`src/job-ledger/job.schema.md`, `src/workflow-entries/product.mjs`. Tests naming it: `tests/test_job_record.py`,
`tests/bridge-jobs-watch.test.mjs`, `tests/documents-findings.test.mjs`, `tests/job-ledger-append.test.mjs`,
`tests/job-ledger.test.mjs`, `tests/job-runner-writer-notes.test.mjs`,
`tests/release-uc-010-run-a-job-in-github-actions.test.mjs`, `tests/release-uc-011-local-cli-session.test.mjs`,
`tests/review-pages-draft-architecture.test.mjs`, `tests/review-pages-draft-use-cases.test.mjs`,
`tests/review-pages-prompt-use-case.test.mjs`, `tests/runtimes-bridge.test.mjs`, `tests/runtimes-ci.test.mjs`,
`tests/runtimes-tab.test.mjs`, `tests/system-uc-011-local-cli-session.test.mjs`,
`tests/workflow-entries-job-workflow.test.mjs`. New: `tests/test_conversation_not_recorded.py`; extended:
`tests/test_settings_disclosure.py`.
