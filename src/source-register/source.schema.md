# The register entry of a requirement source

The schema of a register entry, `docs/sources/SRC-<slug>.md` of the instance repository, in MOD-documents' schema
language: the format that MOD-source-register's file states under Data. A source is a typed record with its kind, its
authority and its licence, and its versions stand in a table that only grows.

What the language cannot say is written where it applies:

- `licence` begins with the words `may be republished`, `restricted` or `unknown` — which counts as restricted — and goes
  on with the licence's name or terms, as in `restricted — the publisher's terms of use`. The language has no type for a
  text that begins so: the schema holds it as text, and `permittedPlaces` reads the licence's class from its first words.
- `identifier` is written for an EU legal text and for a repository, `content_repository` for restricted content kept as
  files, and `places` for restricted content. A condition of the language compares a whole value, and no key holds what
  these depend on, so none of them is required by a condition; `designation` is, for a standard.
- `## Versions` has one row per version, appended and never changed: the version's identifier, its date, its edition,
  what it was read from — a repository and the commit read, or the publication repository with the retrieval date and
  its version identifier —, and its files. A version's files, each with its SHA-256, may be listed under a lower heading
  inside the section, such as `### Files of <version>`; the section's table is its first one.
- `## Parts`, optional, names the parts of the source that a link may name, such as safety classes or chapters.

```json
{
  "schema": "source",
  "shape": "document",
  "path": "docs/sources/SRC-{slug}.md",
  "identifier": { "field": "id", "kind": "SRC" },
  "frontMatter": {
    "id": { "type": "identifier", "of": ["SRC"], "required": true },
    "title": { "type": "text", "required": true },
    "kind": { "type": "enum", "values": ["organisation", "person", "standard", "regulation", "document", "system",
      "measurement"], "required": true },
    "authority": { "type": "enum", "values": ["normative", "advisory", "informational"], "required": true },
    "licence": { "type": "text", "required": true },
    "designation": { "type": "text", "requiredWhen": { "field": "kind", "in": ["standard"] } },
    "identifier": { "type": "text" },
    "content_repository": { "type": "url" },
    "places": { "type": "list", "item": { "type": "text" } }
  },
  "title": "# {id} {title}",
  "sections": [
    { "heading": "## Versions", "required": true, "table": { "appendOnly": true, "columns": [
      { "name": "Version", "value": { "type": "text", "required": true } },
      { "name": "Date", "value": { "type": "date", "required": true } },
      { "name": "Edition", "value": { "type": "text" } },
      { "name": "Read from", "value": { "type": "text" } },
      { "name": "Files", "value": { "type": "text", "required": true } }
    ] } },
    { "heading": "## Parts", "required": false }
  ],
  "otherSections": "forbidden"
}
```
