# The round record

The schema of a job's round record, in MOD-documents' schema language: the format MOD-job-runner's file states under Data,
which `roundsText` writes and MOD-job-ledger appends to the end of a job's record. It is one section, `## Rounds`: for each
round, a heading `### Round <n> — <how many findings>`, each finding in MOD-text-tools' one form as a list item, with how
the drafter answered it beneath — `fixed`, `justified:` with its one line, or `answered:` with the reason a reviewer's
finding does not hold —; then one line naming what is left, why the loop stopped and its limit; then, where there are
any, the findings a person decides under `For a person:`, which were never sent back.

```json
{
  "schema": "rounds",
  "shape": "document",
  "rule": "THE ROUNDS ARE COUNTED AND SHOWN",
  "sections": [
    { "heading": "## Rounds", "required": true }
  ],
  "otherSections": "forbidden"
}
```
