# The schema of the implementation plan's order

The schema of `docs/plan/order.md`, in MOD-documents' schema language: the format MOD-work-plans' file states under Data — a
table `Step`, `Phase`: every implementation-plan step by identifier, in its order, with its model phase.

```json
{
  "schema": "plan-order",
  "shape": "document",
  "rule": "THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY",
  "path": "docs/plan/order.md",
  "sections": [
    { "heading": "## Order", "required": true, "table": { "columns": [
      { "name": "Step", "value": { "type": "identifier", "of": ["ITM"], "required": true } },
      { "name": "Phase", "value": { "type": "text", "required": true } }
    ] } }
  ]
}
```
