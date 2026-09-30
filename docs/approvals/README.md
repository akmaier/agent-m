# Approval records

Each file here records one acceptance (SPEC §10). The commit that added it is the act of
acceptance: git records who and when, and the file names what by its git blob SHA. Records are
created from the review dashboard: with a token stored in the browser, the dashboard commits the record
itself under the accepting person's account; without one, it opens GitHub's new-file page prefilled
with the record.

Use case:

```
kind: use-case
file: docs/use-cases/UC-008-review-and-accept-a-use-case.md
blob: <40-digit blob SHA of the accepted text>
```

SPEC change. With a token, the dashboard writes the record, the SPEC section replaced by the
approved proposal and the decision row in the queue's `entscheidungen.md` in one commit (SPEC §10
`AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL`). Without a token, the record alone is
committed through GitHub's page, and `.github/workflows/apply-approvals.yml` of this instance writes
the section and the decision row — for the instance's own `SPEC.md` only; a product repository carries
no workflow (`WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`):

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
