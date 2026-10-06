---
id: MOD-text-tools
title: The text primitives every format uses
folder: src/text-tools/
realises:
follows:
  - ARC-048
uses:
provides:
  - FrontMatter
  - Finding
  - DiffLine
  - HistoryMark
  - parseFrontMatter
  - formatFrontMatter
  - blobSha
  - sha256
  - lineDiff
  - finding
  - formatFinding
  - parseFinding
  - historyMarks
---
# MOD-text-tools The text primitives every format uses

## Responsibility

It belongs to the artifact model (ARC-048). It offers the primitives every format of the review layout is built on:
front matter, the two hashes Agent M names texts by, line differences, the one form of a finding, and the marks of
history a document must not carry. It runs unchanged in a browser and in Node; it keeps no state and performs no input
or output.

## Parts

- `index.mjs` — the interface.
- `front-matter.mjs` — reading and writing front matter.
- `hashes.mjs` — git's blob SHA-1 and SHA-256, through the platform's WebCrypto.
- `line-diff.mjs` — the line difference of two texts.
- `findings.mjs` — the finding, its text form, and reading it back.
- `history-marks.mjs` — the marks of history in a document.

## Data

It keeps nothing. It owns two formats.

**Front matter.** A text begins with a line `---`, then lines of keys, then a line `---`; the body is every byte after the
closing line. Lines end in LF or in CR LF, and a value never keeps its CR. A key is `[a-z][a-z0-9_-]*`, followed by `:`.
A key with a value on its line holds that value as text, trimmed; a key with nothing after its colon, or with `[]`,
holds a list, whose items are the following lines of the form `  - item`. There is no nesting, no quoting and no other
syntax; a text without the opening line has no front matter, and all of it is body.

```text
---
id: MOD-text-tools
follows:
  - ARC-048
uses:
---
# MOD-text-tools …
```

**The finding**, in the one form `A FINDING READS LIKE A COMPILER MESSAGE` demands — as data, and as one line of text:

```text
{ artifact: "UC-007", line: 12, kind: "error", rule: "A USE CASE REALISES NAMED REQUIREMENTS",
  what: "realises \"EXPORT AS PDF\" matches no requirement", fix: "use an existing name or remove the line" }

UC-007:12: error: realises "EXPORT AS PDF" matches no requirement [A USE CASE REALISES NAMED REQUIREMENTS] — use an existing name or remove the line.
```

`artifact` is the identifier of the artifact the finding concerns — or, for a file without an identifier, its path;
`line` counts from 1 in that artifact's file; `kind` is `error` or `warning`; `rule` is a requirement's name exactly as
the SPEC writes it; `what` says what is wrong; `fix` says the correction expected.

## Interfaces

- `FrontMatter` — `{ fields: Record<string, string | string[]>, order: string[], body: string, bodyLine: number }`: the
  fields by key, the keys in the order they stand, the body, and the line on which the body begins (from 1).
- `Finding` — `{ artifact: string, line: number, kind: "error" | "warning", rule: string, what: string, fix: string }`, as
  defined under Data.
- `DiffLine` — `{ op: "same" | "added" | "removed", text: string, before: number | null, after: number | null }`: one
  line of a difference, with its line in the text before and in the text after, where it has one.
- `HistoryMark` — `{ line: number, kind: "withdrawal" | "edit-stamp" | "dated-change", text: string }`: one place in a
  document that records history (`A DOCUMENT HOLDS NO HISTORY`).
- `parseFrontMatter(text: string) -> FrontMatter` — reads the front matter of a text as defined under Data. It never
  throws: a text without front matter, or whose closing line is missing, has empty `fields` and is all body. A caller
  that requires front matter checks that `order` is not empty.
- `formatFrontMatter(fields: Record<string, string | string[]>, order: string[], body: string) -> string` — writes front
  matter with the keys in `order`, each list one item per line and an empty list as `key:` alone, then the body
  unchanged; `formatFrontMatter` of what `parseFrontMatter` read gives back the same bytes for a text written in this
  form. Throws `TypeError` for a key that is not `[a-z][a-z0-9_-]*`, or a value holding a line break.
- `blobSha(text: string) -> Promise<string>` — git's blob SHA-1 of the text's UTF-8 bytes: 40 lowercase hexadecimal
  digits, the same as `git hash-object` gives for the file. The text is hashed as given; a caller that read a file must
  pass its exact bytes, line endings included, or the SHA names another text.
- `sha256(content: string | Uint8Array) -> Promise<string>` — the SHA-256 of the bytes, or of a string's UTF-8 bytes, as
  64 lowercase hexadecimal digits.
- `lineDiff(before: string, after: string) -> DiffLine[]` — the lines of two texts as a difference: every line of both,
  in order, each `same`, `added` or `removed`, with as few `added` and `removed` lines as the two texts allow. Line
  endings are not part of a line, so a text that changed only its line endings shows no difference; a caller that must
  know whether two texts are byte-identical compares their `blobSha`.
- `finding(fields: Finding) -> Finding` — a finding, checked: throws `TypeError` when `kind` is neither `error` nor
  `warning`, when `line` is not a whole number of at least 1, or when `rule` is not a requirement's name in capitals.
  Every module that reports a finding makes it with this function.
- `formatFinding(finding: Finding) -> string` — the finding as its one line of text, as defined under Data.
- `parseFinding(line: string) -> Finding | null` — a line of that form read back; `null` for any other line.
- `historyMarks(text: string) -> HistoryMark[]` — the places of a document that record its history, each told by its
  words: a note that something was withdrawn (`withdrawal`); a stamp of who edited what or when, such as
  `Last edited by …` or `reworded <date>` (`edit-stamp`); and a date given as the date of a change (`dated-change`) —
  after a word of decision or acceptance, `PO decision <date>`, or set off by a comma as the date of an attribution,
  `(PO A. Maier, <date>)` or `PO, <date>: …`. Any other date is no mark: a document states the dates its content needs —
  the date a fact was read (`DUE DILIGENCE IS FETCHED, NOT RECALLED`), a version, a release, a measurement it names —,
  with the words that say what they are or in a table's cells. So every mark is history: a caller whose kind of document
  must hold none reports each one, without telling dates apart itself; records and measurements are dated by nature, and
  their callers do not ask.

## Files

It reads and writes no file.

## Uses

It uses no other module. The hashes use the WebCrypto interface that browsers and Node both offer.
