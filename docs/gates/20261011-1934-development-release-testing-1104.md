---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d8366b0c60f6cf29c63809d568259c5abf8194ff
  - https://github.com/akmaier/agent-m/pull/403
date: 2026-10-11 19:34 UTC
---
# Development → Release testing: ITM-311, the pages of CI secrets, of the workflow runs and of one run

**REGISTER**

## Reason

ITM-311, pull request #403 by developer-sonnet-d into `sprint/team1/19`, head `d8366b0`. The first commit `415852a`
holds only `tests/repository-hosts-ci-pages.test.mjs`, and CI was red on it (run 38168220384): its six tests fail, and
no other test does. CI is green on `d8366b0` (run 38168387241, 1715 tests, 0 failures). The code changes only
`src/repository-hosts/web-links.mjs`; the new test names MOD-repository-hosts and its guards, and 14 faults planted on
the draft are recorded, none surviving. The Acceptance holds: for a GitHub and a GitLab address, each of the three
addresses, none carrying a token.

The reading weighed: MOD-repository-hosts' file asks for each page "as the server documents it" and names no address.
The pull request takes GitHub's `/settings/secrets/actions`, `/actions` and `/actions/runs/<id>`, and GitLab's
`/-/settings/ci_cd`, `/-/pipelines` and `/-/pipelines/<id>` — the pages the servers' documentation names for a
repository's Actions secrets, its workflow runs and one run, and a project's CI/CD variables, its pipelines and one
pipeline; the two settings pages were read from the documentation's menu descriptions, not opened while signed in.
They are navigation only, with the run's identifier encoded and no credential.
