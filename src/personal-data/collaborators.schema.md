# Product collaborators schema

The canonical register of people who agreed to be named in one product repository.

```json
{
  "schema": "collaborators",
  "shape": "document",
  "rule": "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT",
  "path": "docs/collaborators.md",
  "sections": [
    {
      "underTitle": true,
      "required": true,
      "table": {
        "columns": [
          { "name": "Name", "value": { "type": "text", "required": true } },
          { "name": "Account", "value": { "type": "text", "required": true } },
          { "name": "Agreed", "value": { "type": "enum", "values": ["yes"], "required": true } }
        ]
      }
    }
  ],
  "otherSections": "allowed"
}
```
