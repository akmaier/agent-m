# 10. Review on GitHub Pages: a decision row that names the SPEC commit decides an entry

**The change.** `STATUS IS DERIVED FROM THE RECORDS` gains one clause: a SPEC change entry also counts as decided when its
queue's decision row names the commit that wrote it into the SPEC. The rest of the section is carried over byte for byte.

**Why.** The same sixteen entries as in entry 01: accepted on 2026-09-23 through `scripts/spec_dashboard.py`, each with a
decision row naming the commit that wrote it into `SPEC.md`, none named by an approval record. Entry 01 ends their open
state; this entry makes the status the dashboard derives agree with it, so that the two requirements read the same
records the same way. A status derived from the records still is: the decision row is a record of the queue, and the
commit it names is in the repository's history.

**Against the rest of §10.** The clause covers only SPEC change entries. A use case, an architecture decision or a module
file is still accepted exactly when an approval record names its current blob. A new acceptance still writes an approval
record, so the clause adds no second way to accept; it reads one that was used before approval records existed.

**Impact list.** As entry 01.
