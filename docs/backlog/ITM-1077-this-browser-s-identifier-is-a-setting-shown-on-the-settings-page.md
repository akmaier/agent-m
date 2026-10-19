---
id: ITM-1077
title: This browser's identifier is a setting of the catalogue, a line of the settings page with Clear
level: module
realises:
  - UC-042
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-browser-store
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - ITM-1025's stop (developer-sonnet-i, sprint 96), read against the accepted texts on main at c53134a8
---
# ITM-1077 This browser's identifier is a setting of the catalogue, a line of the settings page with Clear

**REGISTER**

## Outcome

MOD-browser-store.md:76 has the key `browser` in the catalogue: "this browser's identifier, sixteen random hexadecimal
digits made at its first use, which a job record names when this browser's tab takes a job". `src/browser-store/catalogue.mjs`
does not know it, so `writeSetting` refuses it. MOD-browser-store.md:83-84: "A key outside this catalogue is never written:
`writeSetting` refuses it, so no key exists that the settings page does not show." `tests/test_settings_page.py` fails
with `browser` planted in `LITERAL_KEYS`, and 26 cases pass without it (measured by developer-sonnet-i).

## The accepted text

Quoted from `main` at c53134a8, MOD-settings-pages.md:137-139:

> - `settings` — three sections — this browser, the instance, each product —, one line per setting with its state:
>     works, with the date of the last successful test; expires on, from fourteen days before a token's recorded expiry;
>     refused; not set. A browser setting has *Test*, *Change* and *Clear*, …

The value is an identifier only, so the line shows it and *Clear*; there is nothing to test or change. This is the same
reading as ITM-1044's for `not-an-issue`.

## Acceptance

- Unit tests naming MOD-browser-store: `writeSetting(store, "browser", "0123456789abcdef")` stores it, and `listSettings`
  lists it as not secret.
- Unit tests naming MOD-settings-pages: with an identifier stored, the line in the section of this browser shows it and
  *Clear*, which removes the key from `localStorage`; without one, *not set*. `tests/test_settings_page.py` passes with
  `browser` among the catalogue's keys.
- Counter-proof: the line removed from the page makes `test_settings_page` fail.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/browser-store/catalogue.mjs`, `src/settings-pages/` and the tests that name these two modules change.
  Nothing makes the identifier here; ITM-1025 does, once its draft is accepted.
