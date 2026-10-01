# Export tool — Specification

## 1. Export

**EXPORT AS CSV** *(SRC-po, 2026-10-01)*
The list is exported as a CSV file.
*Occasion:* the reader opens it in a spreadsheet.
*Check:* `tests/export.test.js`

**EVERY EXPORT HAS A NAME** *(SRC-po, 2026-10-01)*
Every export carries a name.
*Occasion:* an export without a name cannot be found again.
*Check:* `tests/export.test.js`
