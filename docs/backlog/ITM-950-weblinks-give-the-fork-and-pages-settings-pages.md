---
id: ITM-950
title: webLinks gives the fork page and the Pages settings page
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
# ITM-950 webLinks gives the fork page and the Pages settings page

**REGISTER**

## Outcome

MOD-repository-hosts.md:146-151 states `WebLinks` with `pagesSettings: string` and `fork: string | null`.
`src/repository-hosts/web-links.mjs` builds neither, and its line 9 leaves them "to the items whose use cases open them".
UC-014's steps 1 and 2 open them, through MOD-settings-pages' route `get-your-own` (ITM-587).

Measured by developer-sonnet-a: `connect(parseAddress("https://github.com/alice/agent-m"), {}).webLinks()` gives
`actions` and `runners`, but `fork` and `pagesSettings` are undefined.

## Acceptance

- `webLinks()` gives `fork` and `pagesSettings` for a GitHub and a GitLab repository, as MOD-repository-hosts.md:146-151
  states them. A server that offers no fork page gives `null` for `fork`.
- A unit test through the public export names each link for both servers, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
