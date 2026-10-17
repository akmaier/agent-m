# Plan Coverage Release Cases

The V-model's phases are those of UC-031's table (book ch. 6 §4); a requirement name stands for one accepted requirement.

## Three accepted requirements in the V-model: each stands once in each of the seven phases

### Case

```json
{
  "given": "A product with three accepted requirements and the shipped V-model of seven phases.",
  "input": { "kind": "grid", "model": "v-model", "requirements": ["THE DISPLAY SHOWS STATUS", "A SESSION CAN END", "RECORDS STAY READABLE"] },
  "expected": {
    "phases": ["Concept", "Requirements", "Design", "Implementation", "Testing", "Validation & Verification", "Operation & Maintenance"],
    "entries": 21,
    "count": "3 requirements × 7 phases = 21 plan entries"
  }
}
```

## Forty-two accepted requirements: the count reads as UC-031 step 5 shows it

### Case

```json
{
  "given": "A product with 42 accepted requirements and the shipped V-model of seven phases.",
  "input": { "kind": "grid", "model": "v-model", "generated": 42 },
  "expected": {
    "phases": ["Concept", "Requirements", "Design", "Implementation", "Testing", "Validation & Verification", "Operation & Maintenance"],
    "entries": 294,
    "count": "42 requirements × 7 phases = 294 plan entries"
  }
}
```

## One more accepted requirement adds seven plan entries

### Case

```json
{
  "given": "A product with 5 accepted requirements and the shipped V-model of seven phases, which then accepts one more requirement.",
  "input": { "kind": "added", "model": "v-model", "generated": 5, "added": "ONE MORE RULE" },
  "expected": { "before": 35, "after": 42, "added": 7, "newRequirementPhases": 7 }
}
```

## No accepted requirement: the plan has no entry and the count says zero

### Case

```json
{
  "given": "A product with no accepted requirement and the shipped V-model of seven phases.",
  "input": { "kind": "empty", "model": "v-model", "requirements": [] },
  "expected": {
    "phases": [],
    "entries": 0,
    "count": "0 requirements × 7 phases = 0 plan entries"
  }
}
```

## A pulled model is refused: no plan is derived

### Case

```json
{
  "given": "A product with two accepted requirements and the shipped Kanban model, which works from a backlog.",
  "input": { "kind": "refused", "model": "kanban", "requirements": ["THE DISPLAY SHOWS STATUS", "A SESSION CAN END"] },
  "expected": { "error": "NotPlanned" }
}
```
