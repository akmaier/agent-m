---
id: ITM-950
title: webLinks gives the fork, Pages settings and pipeline schedules pages
level: module
realises:
  - UC-014
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - ITM-587's stop before its first test (sprint team1/92), by developer-sonnet-a
---
# ITM-950 webLinks gives the fork, Pages settings and pipeline schedules pages

**REGISTER**

## Outcome

MOD-repository-hosts.md:146-151 states `WebLinks` with `pagesSettings: string` and `fork: string | null`.
`src/repository-hosts/web-links.mjs` builds neither, and its line 9 leaves them "to the items whose use cases open them".
UC-014's steps 1 and 2 open them, through MOD-settings-pages' route `get-your-own` (ITM-587). `pipelineSchedules: string | null`, stated in
the same place, is not built either. UC-027 3a shows it after a schedule is applied (ITM-746), and developer-sonnet-a found
it undefined on both servers, beside `runners` and `actions`, which are there.

Measured by developer-sonnet-a: `connect(parseAddress("https://github.com/alice/agent-m"), {}).webLinks()` gives
`actions` and `runners`, but `fork` and `pagesSettings` are undefined.

## Acceptance

- `webLinks()` gives `fork`, `pagesSettings` and `pipelineSchedules` for a GitHub and a GitLab repository, as
  MOD-repository-hosts.md:146-151 states them. A page the server does not offer is `null`.
- A unit test through the public export names each link for both servers, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
