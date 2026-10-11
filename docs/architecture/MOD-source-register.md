---
id: MOD-source-register
title: The register of requirement sources and a product's links
folder: src/source-register/
realises:
follows:
  - ARC-045
uses:
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-text-tools.sha256
  - MOD-text-tools.lineDiff
  - MOD-text-tools.DiffLine
  - MOD-spec-document.parseSpec
  - MOD-spec-document.Requirement
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.Host
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.Part
provides:
  - SourceVersion
  - LinkedVersion
  - CommitPlan
  - sourceSchemas
  - registrationCommits
  - versionCommits
  - linkedVersion
  - personSource
  - readContent
  - affectedRequirements
  - sourceFindings
  - changedPassages
  - recogniseLegalText
  - fetchLegalText
  - permittedPlaces
  - sourceStrategies
---
# MOD-source-register The register of requirement sources and a product's links

## Responsibility

It belongs to Sources and resources (ARC-045). It keeps what a product must meet: the instance's register of requirement
sources (`THE INSTANCE KEEPS THE SOURCE REGISTER`) — each source a typed record with its kind, authority and licence
(`THE SOURCE MODEL IS GENERIC`), and its versions fixed by identifier and the SHA-256 of every file read, never
overwritten —; where a version's content lies, in the instance only where its licence permits republishing
(`RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE`); a product's links to the versions and parts that apply to it
(`A PRODUCT LINKS THE SOURCES THAT APPLY`); a version's content read only with its hashes checked; the places a
restricted source's content may go; the source of a person, found by their account (`THE PERSON WHO PROMPTS IS A
SOURCE`); EU legal texts recognised by their CELEX number or ELI and fetched from the EU's publication repository; the
recipe that gives a job the excerpt of a linked version; and the recipes that give a job the chapters of the book *Vibe
Coding* for its kind of work (`A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING`, `A TEST JOB
RECEIVES THE CHAPTER ON TESTING`, `AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND
IMPLEMENTATION`, `AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING`), in a
checkout of the instance by their files there (`A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`). It runs
in a browser and in Node; fetching a legal text runs in Node, in the instance's workflow (ARC-039).

## Parts

- `index.mjs` — the interface.
- `source.schema.md` — the schema of a register entry, in the schema language of MOD-documents.
- `links.schema.md` — the schema of a product's links file.
- `content.mjs` — where a version's files lie, and reading them with their hashes checked.
- `legal-text.mjs` — recognising an EU legal text, and fetching it.
- `strategies.mjs` — the recipe `source-excerpt`, and the four recipes of the book's chapters, each with the chapters
  of its kind of work.

## Data

**A register entry** `docs/sources/SRC-<slug>.md` of the instance repository. Front matter:

| Key | Holds | Required |
|---|---|---|
| `id` | `SRC-<slug>`, matching the file name | always |
| `title` | the source's name | always |
| `kind` | one of `organisation`, `person`, `standard`, `regulation`, `document`, `system`, `measurement` (`THE SOURCE KIND IS ONE OF A CLOSED SET`) | always |
| `authority` | `normative`, `advisory` or `informational`, as declared (`A SOURCE DECLARES ITS AUTHORITY`) | always |
| `licence` | `may be republished`, `restricted`, or `unknown`, which counts as restricted, and the licence's name or terms (`A SOURCE DECLARES ITS LICENCE`) | always |
| `designation` | a standard's full designation with edition and amendments, for example `IEC 62304:2006+AMD1:2015` (`A STANDARD IS REGISTERED BY ITS DESIGNATION`) | for a standard |
| `identifier` | an EU legal text's CELEX number or ELI; a repository's address; a person's account on a repository server, `<server>/<account>`, by which a page finds the source of the person who gives it an instruction | for those three |
| `content_repository` | the repository the person named for restricted content | for restricted content kept as files |
| `places` | the processing places its content may be given to | for restricted content |

Body: `## Versions`, a table with one row per version, appended and never changed (`A SOURCE VERSION IS NEVER
OVERWRITTEN`): the version's official identifier or edition, its date, for a fetched text its retrieval date and the
publication repository's version identifier, for a repository the commit read (`A LIVING SOURCE IS PINNED`), and each
file read with its SHA-256 (`A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH`), or a note where a copy that was only
hashed is kept. Then, optionally, `## Parts`: the known parts a link may name, such as safety classes.

**A version's content** lies in `docs/sources/SRC-<slug>/<version>/` — of the instance when the licence permits
republishing, of the named repository otherwise; a file the person only hashed is not stored at all. A source of kind
repository is its repository at the pinned commit.

**An EU legal text that waits for its fetch** is an entry whose `identifier` `recogniseLegalText` recognises and whose
`## Versions` has no row yet. Whether its last fetch failed, and why, is the state of the instance's run of
`onSourcesCommitted` (MOD-workflow-entries) that concerned it, which the library shows beside the entry; it is never
written into the entry (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`).

**A part of a version**, which a job's parameter `part` names, is a set of the version's files by their names, such as
the chapters of a book. A version of a single file has no smaller part.

**A version's hash** is the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, one per file, sorted by name — the
value a product's link records.

**A product's links file** `docs/sources.md`: a table with one row per linked source — Source (`SRC-` identifier),
Version, Hash (the version's hash), Part (free text, or empty) (`A LINK NAMES THE PART THAT APPLIES`).

**The book's chapters for a kind of work.** Every instance holds the register entry `SRC-vibe-coding`, being a fork of
Agent M (UC-014), with the chapters of the book as the files of each version. The chapters a job receives for its kind
of work are given once, by four recipes:

| Recipe | Kind of work | Chapters |
|---|---|---|
| `chapters-for-requirements` | writing or changing requirements or use cases | 8 |
| `chapters-for-tests` | writing or changing tests | 13 |
| `chapters-for-architecture` | writing, changing or reviewing the architecture | 9, 10, 11, 12 |
| `chapters-for-implementation` | implementing | 9, 11, 12, 13 |

A chapter is the file of the version whose name begins with the chapter's number in two digits and `_`, such as
`08_requirements-engineering.md`.

**How a requirement names a source.** Each item of a requirement's source (MOD-spec-document's `Requirement.sources`)
names the register entry whose identifier, title or — for a standard — designation the item begins with, the longest
such match, followed by the end of the item or by `, ` and the part it draws on: `Vibe Coding, ch. 9` names the entry
titled `Vibe Coding`, and `SRC-eu-ai-act, Art. 13` the entry `SRC-eu-ai-act`. An item that begins with no entry's name
names no source.

## Interfaces

- `SourceVersion` — `{ source: string, version: string, date: string, retrieved: string | null, repositoryVersion: string
  | null, commit: string | null, files: { name: string, sha256: string, stored: boolean }[], hash: string }`.
- `LinkedVersion` — `{ source: Document, version: SourceVersion, part: string | null }`.
- `CommitPlan` — `{ repository: string, files: { path: string, content: string | Uint8Array }[] }[]`: what to commit
  where, for the caller to commit with the person's token.
- `sourceSchemas() -> { entry: Schema, links: Schema }` — the schemas of a register entry and of a product's links file,
  for reading, writing and forms through MOD-documents.
- `registrationCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean }[], instance: string) ->
  Promise<CommitPlan>` — the register entry with its first version, and the files: to the instance when the licence
  permits republishing, to the named repository otherwise, and nowhere when the person only hashed them. Hashes every
  file. Throws `ContentRepositoryMissing` for restricted files without a named repository.
- `versionCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean }[], version: { version:
  string, date: string }) -> Promise<CommitPlan>` — a new version appended to the entry, with its files. Throws
  `SameBytes { version }` when its files' hashes equal those of an existing version, and nothing is recorded.
- `linkedVersion(links: Document, register: Document[], source: string) -> LinkedVersion | null` — the version a product
  links of the source that `source` names — an identifier, or an item of a requirement's source —, with the part its
  link names, or `null` when it names no register entry, the product links none, or the entry records no version the link
  names. The version carries the hash the product's link records, since a hash is not computed synchronously; `readContent`
  checks each of its files against its own SHA-256 when the version is read.
- `personSource(links: Document, register: Document[], account: string) -> string | null` — the identifier of the
  register entry of kind `person` whose `identifier` is the account `<server>/<account>` and which the product links, or
  `null`: the source of the person who gives an instruction (`THE PERSON WHO PROMPTS IS A SOURCE`).
- `readContent(version: SourceVersion, open: (source: string) => Promise<Host>) -> Promise<{ name: string, bytes:
  Uint8Array }[]>` — reads every stored file of the version from `docs/sources/<source>/<version>/` of the repository that
  holds it, at its default branch, across the network through the host `open` gives for the version's source — its
  caller holds the register entry, and with it where the content lies: the instance, or the entry's content repository —,
  and checks each against its recorded SHA-256. Throws `HashMismatch { file, expected, actual }`, so that a changed file is caught
  before anything is derived from it (UC-005), `ContentUnreadable { repository, reason }` when the holder cannot be read
  with the credentials at hand, and what the host names.
- `affectedRequirements(spec: string, source: string) -> string[]` — the names of the requirements one of whose source
  items names this source, read with MOD-spec-document.
- `sourceFindings(requirements: Requirement[], links: Document, register: Document[]) -> Finding[]` — an error under `A
  REQUIREMENT HAS A REGISTERED SOURCE` for each requirement none of whose source items names a source the product links,
  naming the requirement, its line and its items.
- `changedPassages(before: string, after: string) -> DiffLine[]` — the passages that changed between two versions of a
  text, line by line.
- `recogniseLegalText(address: string) -> { celex: string } | { eli: string } | null` — the CELEX number or ELI an
  EUR-Lex or ELI address names.
- `fetchLegalText(identifier: { celex: string } | { eli: string }) -> Promise<{ files: { name: string, bytes: Uint8Array
  }[], retrieved: string, repositoryVersion: string }>` — in Node: fetches the official text from the EU's publication
  repository, across the network, with the date it was retrieved and the repository's version identifier (`AN EU LEGAL
  TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY`). Throws `NotFound { address }` when the address names no text, and
  `Unreachable { reason }`; nothing is guessed.
- `permittedPlaces(entry: Document) -> string[] | "any"` — the places a source's content may be given to: any for content
  that may be republished, its declared places otherwise, none when it declares none.
- `sourceStrategies` — `Partial<Strategies>` with the recipe `source-excerpt`: for the source a job's parameter
  `source` names, reads the version the product links, through `readContent`, where its content lies, and returns the
  texts of the files its parameter `part` names — every file of the version when it names none —, in the version's
  order, a blank line between them, as one part that names the source, so that the runner gives it only to participants
  at the places the source permits (`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`); the part's name names the
  version, the files sent and the part the product's link names. A smaller part is fewer files, and a version of one file
  has none (UC-005 2a). Throws as `readContent` throws, `NotLinked { source }` for a source the product does not link,
  and `NotInVersion { files }` for a part that names a file the version does not hold.
  And the four recipes of the book's chapters, `chapters-for-requirements`, `chapters-for-tests`,
  `chapters-for-architecture` and `chapters-for-implementation`: each reads the instance's register entry
  `SRC-vibe-coding`, takes its newest version — the last row of its `## Versions` —, reads that version's files through
  `readContent`, and returns one part per chapter of its row above, in the order of their numbers: the whole file,
  naming `SRC-vibe-coding` as its source and, in the part's name, the file, the version and the version's hash as its
  pin. For a job whose participant works in a checkout of the instance — the context's `instance.checkout` —, each part
  holds instead the path of the chapter's file in that checkout and none of its text, once the file read there has the
  SHA-256 the version records (`A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE`). None of these parts may
  be left out: a participant whose context cannot hold them is named as not fitting, and nothing is cut. Throws as
  `readContent` throws, `NotRegistered { source }` when the instance has no entry `SRC-vibe-coding`, and `ChapterMissing
  { chapter, version }` when the version holds no file for a chapter.

## Files

It reads `docs/sources/` of the instance, a product's `docs/sources.md`, a product's `SPEC.md`, the content of source
versions where they lie, and, for a job in a checkout of the instance, the book's chapter files in that checkout; it
returns what to write, and the caller commits it. Its own schema files are data.

## Uses

- `MOD-documents.loadSchema`, `MOD-documents.readDocument`, `MOD-documents.readRegister`, `MOD-documents.Schema`,
  `MOD-documents.Document` — its schemas, and reading entries and links.
- `MOD-text-tools.sha256`, `MOD-text-tools.lineDiff`, `MOD-text-tools.DiffLine` — the hashes of files and versions, and the
  passages that changed.
- `MOD-spec-document.parseSpec` and the type `MOD-spec-document.Requirement` — the requirements and the sources they name.
- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — a requirement that names no linked source.
- `MOD-repository-hosts.Snapshot`, `MOD-repository-hosts.Host` — the repositories that hold content.
- `MOD-job-runner.Strategies`, `MOD-job-runner.JobContext`, `MOD-job-runner.Part` — the recipe it offers.
