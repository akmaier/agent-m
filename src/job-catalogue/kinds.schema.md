# The index of the kinds of job

The schema of MOD-job-catalogue's index `kinds.md`, in MOD-documents' schema language: one table under the index's title,
one row per kind of job — its name, and the folder under the catalogue that holds its definition, its prompt and the
schema of the draft it expects. A new kind is a new folder and a row here.

```json
{
  "schema": "job-kinds",
  "shape": "document",
  "rule": "ONE DEFINITION, THREE DRIVERS",
  "path": "src/job-catalogue/kinds.md",
  "sections": [
    { "heading": "# Kinds of job", "required": true, "table": { "columns": [
      { "name": "Kind", "value": { "type": "text", "required": true } },
      { "name": "Folder", "value": { "type": "path", "required": true } }
    ] } }
  ],
  "otherSections": "forbidden"
}
```
