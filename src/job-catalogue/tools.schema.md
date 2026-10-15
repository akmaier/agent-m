# The register of the tools

The schema of MOD-job-catalogue's register `tools.md`, in MOD-documents' schema language: one table under the register's
title, one row per tool a kind may offer its drafter — its name, the capability its drafter must declare, the description
the drafter reads, and the JSON schema of its arguments on one line.

```json
{
  "schema": "job-tools",
  "shape": "document",
  "rule": "ONE DEFINITION, THREE DRIVERS",
  "path": "src/job-catalogue/tools.md",
  "sections": [
    { "heading": "# Tools", "required": true, "table": { "columns": [
      { "name": "Tool", "value": { "type": "text", "required": true } },
      { "name": "Needs", "value": { "type": "enum", "values": ["draft text", "read the repository",
        "write to the repository", "run code and tests", "use tools", "reach the web"], "required": true } },
      { "name": "Description", "value": { "type": "text", "required": true } },
      { "name": "Input", "value": { "type": "text", "required": true } }
    ] } }
  ],
  "otherSections": "forbidden"
}
```
