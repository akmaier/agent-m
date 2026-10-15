# 7. Configuration and secrets: the page names where it sends

**The change.** `THE PAGE STATES WHAT IT SENDS WHERE` is withdrawn. In its place, `THE PAGE NAMES WHERE IT SENDS` reads
"Before Agent M sends anything, it names every destination it will contact — a participant with the place where that
participant processes data." The name changes because the rule no longer promises *what* is sent; a renamed requirement is
withdrawn and added (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`). The rest of the section is carried over byte for byte.

**Why.** akmaier's decision of 2026-10-15: a participant that uses tools — the endpoint harness in the browser tab, a CLI
agent on a Bridge, an agent in CI — decides while it works which files it reads, so what it is sent cannot be named before
it starts. Where the data goes can: the participant and its processing place are known when the person chooses it, and the
prompt bar names both beside every participant it offers. What a job was given is recorded with it (`A JOB IS RECORDED IN
ITS PRODUCT REPOSITORY`). The protection of content is carried by other requirements, unchanged: `A PARTICIPANT DECLARES
WHERE IT PROCESSES DATA`, `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`, `THE PLACES A MAILBOX'S MAIL MAY GO ARE
CONFIGURED` and `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`.

**Against the rest of the SPEC.** "Before Agent M sends anything" covers a run and every message of a conversation alike.
A run panel may still show what it sends; the SPEC no longer requires it. `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`,
which `tests/test_destination_disclosure.py` also guards, is unaffected.

**Impact list.** Use cases that realise the withdrawn name: UC-001, UC-005, UC-019, UC-022, UC-024, UC-026, UC-028, UC-032,
UC-034, UC-038, UC-039, UC-043, UC-045 — drafted with this queue to name the new requirement. Architecture: ARC-037, ARC-038,
ARC-046, MOD-job-runner, MOD-site-frame. Code: `src/review-pages/jobs.mjs`, `src/site-frame/run-panel.mjs`. Tests naming it
in their header: `tests/test_destination_disclosure.py`, `tests/site-frame-run-panel.test.mjs`,
`tests/job-runner-left-out.test.mjs`, `tests/job-runner-prepare.test.mjs`, `tests/job-runner-run.test.mjs`,
`tests/mod-settings-pages-bridge-endpoint.test.mjs`, `tests/release-sprint-09-uc-001-add-product.test.mjs`,
`tests/release-uc-019-change-by-prompt.test.mjs`, `tests/release-uc-019-change-requirements-by-prompt.test.mjs`,
`tests/release-uc-022-derive-architecture.test.mjs`, `tests/review-pages-draft-architecture.test.mjs`,
`tests/review-pages-draft-requirements.test.mjs`, `tests/review-pages-draft-use-cases.test.mjs`,
`tests/review-pages-prompt-requirements.test.mjs`, `tests/review-pages-prompt-use-case.test.mjs`,
`tests/settings-pages-add-product.test.mjs`, `tests/settings-pages-endpoints.test.mjs`,
`tests/site-frame-derivation-explanations.test.mjs`, `tests/site-frame-drafting-explanations.test.mjs`,
`tests/site-frame-endpoint-explanations.test.mjs`, `tests/site-frame-participant-explanations.test.mjs`. Backlog items
ITM-207, ITM-264, ITM-265, ITM-269, ITM-280, ITM-344, ITM-361, ITM-362, ITM-363, ITM-398, ITM-442. Renaming the guarded
name in these files is work for a team after acceptance.
