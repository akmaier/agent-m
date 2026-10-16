---
id: ITM-550
title: A mail's people
level: module
realises:
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
modules:
  - MOD-personal-data
builds_on:
  - ITM-549
tests:
  - unit
origin:
  - MOD-personal-data, Interfaces: MailText, peopleIn
  - sprint team1/47: how peopleIn finds a name in a mail's text was not stated; a draft states it
---
# ITM-550 A mail's people

**REGISTER**

## Outcome

MOD-personal-data's `peopleIn(mail: MailText) -> People`, with the type `MailText`. It returns every address and
display name of the mail's headers, and every name, address, phone number and account handle in its text and
signature. It is deterministic, and a person found twice is listed once.

How it finds a name in a mail's own text is not stated by the accepted module file. A draft of
`docs/architecture/MOD-personal-data.md` states each form, for akmaier's acceptance:
- **Addresses:** every mail address.
- **Phone numbers:** runs of at least seven digits.
- **Account handles:** `@` handles that are not part of a mail address.
- **Names:**
  - the display names of the headers;
  - the words after a greeting at the start of a line;
  - the line after a closing;
  - the first line of a signature after `-- `.

  A name that none of these forms gives is left to the three checking participants (UC-038 step 6).

This item builds `peopleIn` as that draft states it. The draft was accepted with `220b55d0`
(`docs/approvals/MOD-personal-data-200e7a95148e.md`). It calls no function of another module, and no existing test names
`peopleIn`.

## Acceptance

- **Each form is found.** For a fixture mail with each form, `peopleIn` gives each of its people under the right kind,
  once each.
- **Counter-proof.** A mail whose text names no one beyond its headers gives only the headers' people.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
