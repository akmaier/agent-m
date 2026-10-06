---
id: MOD-spec-document
title: The SPEC and its requirements
folder: src/spec-document/
realises:
follows:
  - ARC-048
uses:
  - MOD-text-tools.finding
  - MOD-text-tools.historyMarks
  - MOD-text-tools.Finding
provides:
  - Spec
  - SpecSection
  - Requirement
  - parseSpec
  - requirementFindings
  - sectionText
  - replaceSection
  - requirementNamesIn
  - renamedRequirements
  - specSkeleton
---
# MOD-spec-document The SPEC and its requirements

## Responsibility

It belongs to the artifact model (ARC-048). It owns the form of a product's `SPEC.md` — sections, and requirements inside
them, each of a name, a source, a rule and a check — and reads it, checks its
requirements, cuts out and replaces a section byte for byte, and tells renamed requirements from changed ones. It is
the SPEC's own module because the SPEC is not of the common shape that MOD-documents interprets: its requirements stand
inside sections. It runs in a browser and in Node, and performs no input or output.

## Parts

- `index.mjs` — the interface.
- `parse.mjs` — sections and requirements.
- `checks.mjs` — the findings of a requirement.
- `sections.mjs` — a section's exact bytes and its replacement.
- `skeleton.md` — the SPEC a new product starts with.

## Data

It keeps nothing. It owns the form of the SPEC:

- A title line `# <product> — Specification`, a preamble of any text, then sections. A **section** begins with a heading
  of level two and ends before the next heading of level two, or at the end of the file; a section's bytes include its
  heading line and every byte up to the next such heading.
- A **requirement** begins with its head line: its name in bold and in capitals, then its source in italics in
  parentheses — `**NAME** *(source)*`; the source may continue over further lines until `)*`. The source names one or
  more sources, separated by `;`, each optionally followed by `, ` and the part it draws on — `*(Product Owner; Vibe
  Coding, ch. 9)*`; which register entry an item names is MOD-source-register's to say. Then its **rule**, one or
  more lines. Then `*Check:* ` followed by a test's
  path, several separated by ` · `, or the words `no automatic check; at review`, possibly with a sentence on what the
  check does and its counter-proof; it may continue over further lines. A requirement ends at an empty line, a heading or
  the next head line.
- What a requirement constrains is where it stands (`A REQUIREMENT NAMES WHAT IT CONSTRAINS`): a requirement of a
  product's SPEC constrains that product; a requirement of the instance's own SPEC — Agent M's — constrains the
  development process. No line of a SPEC states it again.

```text
**ONE STATEMENT PER REQUIREMENT** *(Product Owner)*
The rule of a requirement is a single statement; a rule containing "and" or "additionally" is two requirements.
*Check:* `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the decision stays human.
```

The name is the requirement's identifier and is unique in the SPEC (`THE NAME IS THE ID AND IT SURVIVES`). A requirement
that a SPEC no longer holds is gone from it, without a note (`A DOCUMENT HOLDS NO HISTORY`); its earlier text is in the
version history.

## Interfaces

- `Spec` — `{ title: string, sections: SpecSection[], requirements: Map<string, Requirement> }`.
- `SpecSection` — `{ heading: string, line: number, start: number, end: number, requirements: string[] }`: a section, its
  first line, its byte range in the text, and the names of its requirements in order.
- `Requirement` — `{ name: string, source: string, sources: string[], rule: string, check: string | null, checkPaths:
  string[], section: string, line: number }`: `sources` are the items of `source`, split at `;` and trimmed.
- `parseSpec(text: string) -> Spec` — reads a SPEC, or the text of one section of it such as a change queue's proposal,
  in the form above. It never throws on content: a requirement missing a field is read with that field `null`, and
  `requirementFindings` names it. Two requirements of the same name are both read; the second is named by the findings.
- `requirementFindings(spec: Spec) -> Finding[]` — for each requirement: an error under `A REQUIREMENT HAS FOUR FIELDS`
  when its source, rule or check is missing; an error under `A REQUIREMENT NAMES ITS CHECK` when its check names neither
  a test nor review; a warning under `ONE STATEMENT PER REQUIREMENT` when its rule contains "and" or "additionally", which a person then
  splits or keeps with a reason; an error under `THE NAME IS THE ID AND IT SURVIVES` for a name given twice; and an
  error under `A DOCUMENT HOLDS NO HISTORY` for each mark of history. Each finding names the requirement and its line.
- `sectionText(specText: string, heading: string) -> string | null` — the exact bytes of the section whose heading line is
  `heading`, or `null` when there is none. A caller compares or hashes these bytes; it must not normalise them.
- `replaceSection(specText: string, heading: string, sectionText: string) -> string` — the SPEC with that section's bytes
  replaced by `sectionText`, byte for byte, every other byte unchanged (`THE APPROVED TEXT IS TAKEN VERBATIM`). A heading
  not yet in the SPEC is added as a new section at the place the caller's `sectionText` belongs after; the caller names it
  by passing the text with the preceding section. Throws `SectionNotFound` naming the heading when neither is possible.
- `requirementNamesIn(text: string) -> string[]` — the names of the requirements a text holds as head lines, in order.
- `renamedRequirements(before: string, after: string) -> { withdrawn: string[], added: string[] }` — for two versions of a
  section, the names that the second no longer holds and the names it holds new; a rename is one of each, proposed as a
  withdrawal and an addition (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`).
- `specSkeleton(product: string) -> string` — the SPEC a new product starts with: its title, a preamble saying what a
  requirement is in this form, and an empty first section.

## Files

It reads its own `skeleton.md` when it is loaded. If that read fails, the module still loads, and `specSkeleton` fails
with the reason when it is called, so that no page that loads the module fails with it. It reads and writes no file of a
repository; its callers give it the texts.

## Uses

- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — the findings it reports.
- `MOD-text-tools.historyMarks` — the marks of history in a SPEC.
