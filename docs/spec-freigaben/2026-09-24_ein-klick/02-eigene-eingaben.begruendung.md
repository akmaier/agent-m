# What you typed yourself needs no second approval

§9 so far knows two kinds of change: reviewed artifacts (use cases, SPEC proposals — direct to
`main` as *open*, the approval record is the gate) and code (pull request with green CI). Setup and
one's own input fit neither, and without a rule they defaulted to a pull request — which is how
UC-001 ended up with two merges in one setup.

**`A PERSON'S OWN INPUT IS COMMITTED DIRECTLY`** — a requirement source you registered, a product you
added, a release you cut: you made the decision when you typed and saved it. Asking you to confirm it
again in a pull request is the "second click that controls nothing" that §9 was just rewritten to
remove.

**`ADDING A PRODUCT CREATES ITS LAYOUT`** — the scaffold (empty folders, a SPEC skeleton, a version
entry) and the product entry are written directly. Your instruction: *"Step 7 and 9 are author
merges in the same process. That's a bit much. Both need to be automated."*

What this does *not* cover: anything Agent M *generates* (requirements, use cases) still counts as a
proposal until accepted; code still goes through a pull request.
