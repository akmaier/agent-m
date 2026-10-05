---
id: MOD-identifiers
title: The identifier scheme and the stability of identifiers
folder: src/identifiers/
realises:
follows:
  - ARC-048
uses:
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
provides:
  - IdentifierKind
  - IdentifierPlace
  - kindOfIdentifier
  - identifiersIn
  - nextIdentifier
  - positionalReferences
  - pagesAddress
  - instanceOfPagesAddress
---
# MOD-identifiers The identifier scheme and the stability of identifiers

## Responsibility

It belongs to the artifact model (ARC-048). It knows the scheme of `EVERY ARTIFACT HAS AN IDENTIFIER` — what an identifier
of each kind looks like —, finds the identifiers a text writes, gives the next free identifier of a kind, never one the version
history holds (`THE NAME IS THE ID AND IT SURVIVES`), and finds references made by position instead of by
identifier (`A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`). It also knows how an instance is named: by its repository
`owner/name`, whose GitHub Pages address is the instance's dashboard (`AN INSTANCE IS A FORK OF AGENT M`). It does not know the formats in which identifiers
stand; where an identifier is defined, its callers know from the format they read. It runs in a browser and in Node, and
performs no input or output.

## Parts

- `index.mjs` — the interface.
- `scheme.mjs` — the pattern of each kind.
- `positions.mjs` — references by position.

## Data

It keeps nothing. It owns the scheme:

| Kind | Pattern | Example |
|---|---|---|
| requirement | a name in capitals, digits, spaces, apostrophes, commas and hyphens, with no lowercase letter and no prefix below | `THE NAME IS THE ID AND IT SURVIVES` |
| `SRC` | `SRC-<slug>` | `SRC-eu-ai-act` |
| `UC` | `UC-<nnn>`, three or more digits | `UC-022` |
| `ARC` | `ARC-<nnn>` | `ARC-048` |
| `MOD` | `MOD-<slug>` | `MOD-identifiers` |
| `TST` | `TST-<nnn>` | `TST-014` |
| `ITM` | `ITM-<nnn>` | `ITM-202` |
| `RES` | `RES-<slug>` | `RES-alex-cluster` |
| `JOB` | `JOB-<yyyymmdd>-<hhmm>-<four hexadecimal digits>` | `JOB-20261005-0900-a1b2` |

A slug is lowercase letters and digits in words joined by single hyphens. The numbered kinds count up; a number or a
slug once used stays used.

An instance is named by its repository, `owner/name`; its dashboard is that repository's GitHub Pages address,
`https://<owner>.github.io/<name>/`, served from the root of its default branch (`THE PAGES ROOT IS THE REPOSITORY ROOT`).

## Interfaces

- `IdentifierKind` — `"requirement" | "SRC" | "UC" | "ARC" | "MOD" | "TST" | "ITM" | "RES" | "JOB"`.
- `IdentifierPlace` — `{ id: string, kind: IdentifierKind, path: string, line: number }`: an identifier written in a file,
  and where.
- `kindOfIdentifier(id: string) -> IdentifierKind | null` — the kind of a string by the scheme, or `null` when it is no
  identifier.
- `identifiersIn(path: string, text: string) -> IdentifierPlace[]` — every identifier a text writes, by the scheme, each
  with its line: prefixed identifiers wherever they stand, and requirement names where a text writes a name — in
  backticks, as a list item of front matter, or as the bold head of a requirement. It does not say whether a place
  defines the identifier or refers to it; the caller, which knows the format, decides that.
- `nextIdentifier(kind: "UC" | "ARC" | "TST" | "ITM" | "SRC" | "MOD" | "RES", everUsed: Iterable<string>, slug?: string)
  -> string` — the identifier a new artifact of the kind gets. For a numbered kind, one more than the highest number of
  that kind ever used. For a slug kind the slug is chosen by a person or a participant and given as `slug`; the result is
  `<kind>-<slug>`. Throws `IdentifierTaken` naming the identifier when it was ever used — a withdrawn identifier is never
  given again —, and `TypeError` when a slug kind has no slug or the slug breaks the scheme. `everUsed` must hold every
  identifier of the kind the version history knows; the caller collects them, since a withdrawn identifier stands only
  in the history.
- `pagesAddress(instance: string) -> string` — the dashboard's address of the instance `owner/name`,
  `https://<owner>.github.io/<name>/`. Throws `TypeError` for a string that is not `owner/name`.
- `instanceOfPagesAddress(location: { hostname: string, pathname: string }) -> string | null` — the instance `owner/name`
  a Pages address names: the owner from the host `<owner>.github.io`, the name from the first segment of the path;
  `null` for any other host.
- `positionalReferences(path: string, text: string) -> Finding[]` — a warning under `A REFERENCE NAMES THE IDENTIFIER, NOT
  THE POSITION` for each place where the text points at a part of an artifact of the product by a section number, a step
  number or a line number instead of by an identifier. A reference to a chapter or section of a book or another outside
  work is no such place.

## Files

It reads and writes no file.

## Uses

- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — the findings it reports.
