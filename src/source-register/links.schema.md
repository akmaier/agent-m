# The links of a product to its sources

The schema of a product's links file `docs/sources.md`, in MOD-documents' schema language: the format that
MOD-source-register's file states under Data. A product names in it the sources that apply to it, each with the exact
version it uses: one table with one row per linked source. The table stands under the product's own title, which changes
from product to product, and has no heading of its own, so the schema names its section `{ "underTitle": true }`; text
may stand between the title and the table.

What the language cannot say is written where it applies:

- `Source` is the identifier of a register entry `docs/sources/SRC-<slug>.md` of the instance, `Version` one of that
  entry's versions, and `Hash` that version's hash: the SHA-256 of the lines `<SHA-256 of the file>  <file name>`, one per
  file, sorted by name. The schema reads one file, so whether the register holds that entry, version and hash is not
  decided here.
- `Part` names the part of the source that applies to the product — a safety class, a chapter, a set of articles —, and is
  left empty when the source applies as a whole.

```json
{
  "schema": "links",
  "shape": "document",
  "rule": "A PRODUCT LINKS THE SOURCES THAT APPLY",
  "path": "docs/sources.md",
  "sections": [
    { "underTitle": true, "required": true, "table": { "columns": [
      { "name": "Source", "value": { "type": "identifier", "of": ["SRC"], "required": true } },
      { "name": "Version", "value": { "type": "text", "required": true } },
      { "name": "Hash", "value": { "type": "sha", "digits": 64, "required": true } },
      { "name": "Part", "value": { "type": "text", "rule": "A LINK NAMES THE PART THAT APPLIES" } }
    ] } }
  ]
}
```
