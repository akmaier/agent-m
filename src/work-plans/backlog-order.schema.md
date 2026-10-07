# The order of the backlog

The schema of `docs/backlog/order.md`, in MOD-documents' schema language: the format MOD-work-plans' file states under
Data — a table `Item`: every backlog item by identifier, in its order. The file carries a title and prose on what the
order is before its table, which stands under its own heading, `## Order`; the schema names no front matter, since the
file has none.

```json
{
  "schema": "backlog-order",
  "shape": "document",
  "rule": "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY",
  "path": "docs/backlog/order.md",
  "sections": [
    { "heading": "## Order", "required": true, "table": { "columns": [
      { "name": "Item", "value": { "type": "identifier", "of": ["ITM"], "required": true } }
    ] } }
  ]
}
```
