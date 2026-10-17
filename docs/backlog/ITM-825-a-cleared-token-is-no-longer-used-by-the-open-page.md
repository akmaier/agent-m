---
id: ITM-825
title: A cleared token is no longer used by the open page
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - ITM-819's pull request #768 (sprint team1/76), from developer-sonnet-a's finding 2
---
# ITM-825 A cleared token is no longer used by the open page

**REGISTER**

## Outcome

`A CLEAR IS A REAL CLEAR` reads: "Clearing the configuration removes the stored credentials from the browser, not only from
the displayed form". ITM-819 showed that *Clear everything* removes every entry of the instance from `localStorage`. The
lead it left, read from the code and not measured: the page's connected host may still hold the cleared token in memory, and
send it with a request until the page is reloaded.

At the start, a test clears the token on the live settings page and then triggers a read without reloading. It shows
whether the cleared token is still sent. If it is, the page drops its host on a clear, through the interfaces MOD-settings-
pages' Uses name. The modules the fix changes are named at the start.

## Acceptance

- After a clear, no request of the open page carries the cleared token, and the test pins it.
- The first commit holds only the tests, and CI is red on it if the lead holds. No stub is committed.
