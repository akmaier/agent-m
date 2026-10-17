---
id: ITM-631
title: The pseudonymous identifier of a mail
level: module
realises:
  - UC-038
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
modules:
  - MOD-mail-records
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - MOD-mail-records, Data the mail identifier and Interfaces mailId
  - UC-038, naming mails before relating them to issues
---
# ITM-631 The pseudonymous identifier of a mail

**REGISTER**

## Outcome

Implement the accepted public mailId(mail: { messageId: string | null, bytes: Uint8Array | null })
-> Promise<string> of MOD-mail-records. The identifier is MAIL- followed by the first sixteen lower-case
hexadecimal digits of the SHA-256 of the Message-ID value between its angle brackets, encoded as UTF-8;
without a Message-ID it is derived from the mail's complete supplied bytes. Both inputs missing gives
the accepted NothingToName error, so the caller can obtain the bytes and ask again.

Use the accepted identifier.mjs responsibility and export it from this module's index. Call the existing
public MOD-text-tools.sha256, rather than another hash implementation. ITM-212 supplies the TextTools
module foundation; its later, already-delivered sha256 helper is used unchanged, not attributed to
ITM-212's excluded scope and not implemented again.

Only src/mail-records/ and new owned unit tests naming MOD-mail-records change. The issue-list, note,
label, thread-matching and undecided-mail functions remain separate work. Mailbox reading/finding,
Graph or Bridge adapters, MIME parsing, mail handling, issue creation, sending, page integration and
live mail access are outside this item. No old expected result changes; existing MailRoutes, hash,
privacy, planGrid and ITM-538 assertions remain untouched. No new public interface or formal artifact
change, and no whole UC-038 or MailRecords-module completion is claimed.

## Acceptance

- Unit cases call the public mailId with constructed literal inputs and expected identifiers stated
  before execution, never derived from runtime documents or the implementation. They cover a
  Message-ID taking precedence over supplied bytes, repeated reading giving the same identifier,
  different stated Message-IDs giving their literal identifiers, UTF-8 input, and complete-byte
  fallback when the Message-ID is absent.
- Both missing inputs produce NothingToName. A positive usable input is shown before the refusal;
  empty supplied bytes are bytes, not missing input. Output is MAIL- with exactly sixteen lower-case
  hexadecimal digits, without a copied address or header value.
- Reuse the existing public sha256 helper; keep all mail input in memory. This pure primitive makes
  no network request and writes no repository, issue, file or browser setting. Tests use synthetic
  data and no credentials, device, live mailbox, paid service or production deployment.
- Follow the existing implementation-job rules: tests-only first commit and actual intended server
  red, followed by source assignment; each new case has its actual source-fault failure at the case's
  assertion and exact restoration. An import/launcher crash is not substituted for assertion evidence.
- Existing case bodies and expected results stay unchanged. No other module source, model data,
  workflow, dependency, SPEC, use case, architecture or process changes. Only unit tests are selected;
  no new release-case or release-author job is introduced.
