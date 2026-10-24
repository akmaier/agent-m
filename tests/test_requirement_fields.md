# Requirement Fields Cases

The cases of `tests/test_requirement_fields.py`, for **A REQUIREMENT HAS FOUR FIELDS**: "A requirement consists of a name, a source, a rule, and a check." Each case is a fixture SPEC of a made-up product, never Agent M's own SPEC.md, read by MOD-spec-document's `parseSpec`; its findings are those of `requirementFindings`.

**How a case reads.** `given` is its precondition. `input.spec` is the text read. `expected.fields` names, for each requirement by its name, the fields it is read with: `name`, `source`, `rule` and `check` (a field the case does not name is not compared). `expected.findings` is the list of the findings under A REQUIREMENT HAS FOUR FIELDS, each as `<requirement>:<line>: <kind>: <what>`; findings under other rules are not compared.

## A requirement consists of a name, a source, a rule, and a check

### A requirement with its four fields is read with them and has no finding

```json
{
  "given": "A requirement in the SPEC's own form: its name in bold capitals, its source in italics in parentheses, one rule, and its check; no further field, and a source named as it is written, without a date.",
  "input": {
    "spec": "# A product\n\n## 1. Rules\n\n**THE EXPORT IS A PDF** *(PO A. Maier)*\nThe export of a report is a PDF file.\n*Check:* `tests/test_export.py`\n"
  },
  "expected": {
    "fields": {
      "THE EXPORT IS A PDF": {
        "name": "THE EXPORT IS A PDF",
        "source": "PO A. Maier",
        "rule": "The export of a report is a PDF file.",
        "check": "`tests/test_export.py`"
      }
    },
    "findings": []
  }
}
```

### A source named by its identifier, and a check that runs over several lines, are read whole

```json
{
  "given": "Two requirements with four fields each: one whose source is a source identifier, one whose check says it is guarded at review; the first check runs over two lines.",
  "input": {
    "spec": "# A product\n\n## 1. Rules\n\n**THE PRODUCT IS NOT SOLD** *(SRC-model-licence)*\nThe product is offered free of charge.\n*Check:* `tests/test_price.py` — the price shown\nis zero.\n\n**THE COVER IS GREEN** *(SRC-brand-office)*\nThe cover of a report is green.\n*Check:* no automatic check; at review.\n"
  },
  "expected": {
    "fields": {
      "THE PRODUCT IS NOT SOLD": {
        "source": "SRC-model-licence",
        "rule": "The product is offered free of charge.",
        "check": "`tests/test_price.py` — the price shown\nis zero."
      },
      "THE COVER IS GREEN": {
        "source": "SRC-brand-office",
        "check": "no automatic check; at review."
      }
    },
    "findings": []
  }
}
```

## A REQUIREMENT HAS FOUR FIELDS: counter-proofs

### Counter-proof: a requirement without a source is an error

```json
{
  "given": "The requirement of the first case with its source left out of its head line: its name in bold alone, then its rule and its check.",
  "input": {
    "spec": "# A product\n\n## 1. Rules\n\n**THE EXPORT IS A PDF**\nThe export of a report is a PDF file.\n*Check:* `tests/test_export.py`\n"
  },
  "expected": {
    "findings": [
      "THE EXPORT IS A PDF:5: error: no source"
    ]
  }
}
```

### Counter-proof: a requirement without a rule is an error

```json
{
  "given": "The requirement of the first case with its rule left out: its head line, then its check.",
  "input": {
    "spec": "# A product\n\n## 1. Rules\n\n**THE EXPORT IS A PDF** *(PO A. Maier)*\n*Check:* `tests/test_export.py`\n"
  },
  "expected": {
    "findings": [
      "THE EXPORT IS A PDF:5: error: no rule"
    ]
  }
}
```

### Counter-proof: a requirement without a check is an error

```json
{
  "given": "The requirement of the first case with its check left out: its head line, then its rule; another requirement follows.",
  "input": {
    "spec": "# A product\n\n## 1. Rules\n\n**THE EXPORT IS A PDF** *(PO A. Maier)*\nThe export of a report is a PDF file.\n\n**THE COVER IS GREEN** *(PO A. Maier)*\nThe cover of a report is green.\n*Check:* no automatic check; at review.\n"
  },
  "expected": {
    "findings": [
      "THE EXPORT IS A PDF:5: error: no check"
    ]
  }
}
```
