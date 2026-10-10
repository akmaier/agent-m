---
id: ITM-296
title: Read-only pull-request records and facts on both repository hosts
level: module
realises:
  - UC-002
  - UC-032
  - STATUS IS DERIVED FROM THE RECORDS
  - A REMOTE INTERFACE NAMES HOW IT FAILS
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-205
  - ITM-247
tests:
  - unit
origin:
  - UC-002
  - UC-032
---
# ITM-296 Read-only pull-request records and facts on both repository hosts

**REGISTER**

## Outcome

Implement exactly the accepted Host.listPullRequests(filter) and Host.pullRequestFacts(number) for GitHub and GitLab
through MOD-repository-hosts' public connect interface. Lists use the accepted optional state/branch filter and
PullRequest shape. Facts provide the accepted ordered commits and each commit's changed files/CI state, changed
files, commit-specific reviews, named head checks and read(path, "base" | "head") for the exact sides of the request.
Use the module's existing REST/authentication/refusal and immutable snapshot-reading patterns; read the existing
working legacy pull-request caller and guards before adapting its patterns, without changing that caller or its
older data shape. Reading a missing side path returns null as accepted; requests retain their named failures.

These are necessary live facts for derived work-plan progress and later Definition-of-Done checks. They are ready
on the delivered repository-host foundation and recorded REST fixtures; they do not depend on Settings290 or
component294. Completion does not implement doneCheck, open/merge requests, CI dispatch, a local-clone adapter,
job execution, dashboard composition or whole UC002 continuation. Preserve existing clone refusal and all existing
read/write/tag/token behavior. No additional network writer is authorized.

## Acceptance

- Public module cases with recorded GitHub/GitLab responses prove lists across pages and accepted state/branch filters,
  open/merged/closed records with dates/head/base/draft/url, then the accepted facts: commits in order, their files/CI,
  reviews on their actual commits, every named head check and exact base/head file texts, including absent paths.
- Positive server reads precede refusal cases. Existing TokenRefused/PermissionMissing/RateLimited/NotFound/
  Unreachable meanings and token-to-its-own-server behavior remain intact; failures are not empty successful lists.
  Exact-side reads use immutable commits and retain the existing blob cache behavior rather than moving branch texts.
- Existing repository-host, tag and legacy pull-request expectations remain unchanged. Only src/repository-hosts/ and
  tests naming MOD-repository-hosts change. No caller, host writer, accepted contract or process declaration changes.
- The implementation job's first commit contains only tests and its own product CI is red before source is written.
  Final numeric canonical declarations, relevant guarded-code fault/SAME-case failure/exact restoration/SAME-case
  pass, complete exact-head Ubuntu CI within each job's 120-second bound and independent gates follow the declared
  process. No additional per-assertion fault quota is imposed.
