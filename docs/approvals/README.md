# Approval records

Each file here records one acceptance (SPEC §10). The commit that added it is the act of
acceptance: git records who and when, and the file names what by its git blob SHA. Records are
created from the review dashboard, which opens GitHub's new-file page prefilled with the record.

Use case:

```
kind: use-case
file: docs/use-cases/UC-008-review-and-accept-a-use-case.md
blob: <40-digit blob SHA of the accepted text>
```

SPEC change (written into `SPEC.md` by `.github/workflows/apply-approvals.yml`):

```
kind: spec
queue: docs/spec-freigaben/<queue>
entry: 01
proposal: docs/spec-freigaben/<queue>/01-<name>.md
blob: <blob SHA of the proposal>
target: SPEC.md
anchor: ## <section heading>
section: <blob SHA of the SPEC section shown beside it>
```

Records are never edited or deleted to change a status. Status is derived: a file is accepted
while a record names its current SHA.
