## 3. Requirements

**A REQUIREMENT HAS FOUR FIELDS** *(PO A. Maier)*
A requirement consists of a name, a source, a rule, and a check.
*Check:* `tests/test_requirement_fields.py`

**ONE STATEMENT PER REQUIREMENT** *(PO A. Maier)*
The rule of a requirement is a single statement; a rule containing "and" or "additionally" is two
requirements.
*Check:* `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the
decision stays human.

**A RULE IS CHECKABLE** *(PO A. Maier)*
A rule is stated so that it can be shown to hold or not hold.
*Check:* no automatic check; at review.

**NO STATE IN THE SPECIFICATION** *(PO A. Maier)*
A requirement states the target, never the current condition of a system.
*Check:* no automatic check; at review.

**A REQUIREMENT NAMES ITS CHECK** *(PO A. Maier)*
Every requirement names the test that guards it, or states explicitly that it is guarded only at
review.
*Check:* `tests/test_requirement_names_check.py`

**A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST** *(PO A. Maier)*
Before an existing requirement is changed, the artifacts that reference it are listed, and the
list is part of the proposal rather than a result reported afterwards.
*Check:* `tests/test_impact_list.py` — a change proposal touching an existing identifier carries
the derived reference list.

**A REQUIREMENT NAMES WHAT IT CONSTRAINS** *(PO A. Maier)*
Every requirement states whether it constrains the product or the development process.
*Check:* `tests/test_requirement_fields.py`

**DERIVATION SEES THE EXISTING REQUIREMENTS** *(PO A. Maier)*
When requirements are derived, every requirement of the product — in its SPEC and in its open change
queues — is part of the input the deriving participant receives.
*Check:* `tests/test_derivation_context.py`

**NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY** *(PO A. Maier)*
If the existing requirements do not fit into the deriving participant's context, the run stops and
says so before anything is sent.
*Check:* `tests/test_derivation_context.py`

**A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT** *(PO A. Maier)*
Every derived candidate is classified as a new requirement, a change to a named existing requirement,
a duplicate of one, or a conflict with one.
*Check:* `tests/test_derivation_classes.py`

**EXACT DUPLICATES ARE FOUND WITHOUT A MODEL** *(PO A. Maier)*
A candidate whose name or normalised rule text equals an existing requirement's is classified as a
duplicate deterministically, before any model classification.
*Check:* `tests/test_derivation_classes.py`

**THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED** *(PO A. Maier)*
How often the model classifies a candidate correctly is measured as a rate on a fixed set of
examples, and every classification is shown to a person, who can change it.
*Check:* `tests/test_derivation_classes.py` — the rate is reported, not gated.

**A CHANGE IS PROPOSED UNDER THE EXISTING NAME** *(PO A. Maier)*
A candidate that changes an existing requirement is proposed as a change to that requirement, under
its name, with its current text beside it and its impact list.
*Check:* `tests/test_derivation_classes.py`

**A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT** *(PO A. Maier)*
A candidate that restates an existing requirement is proposed as an additional source of that
requirement, never as a new requirement.
*Check:* `tests/test_derivation_classes.py`

**A CONFLICT IS DECIDED BY A PERSON** *(PO A. Maier)*
A candidate that contradicts an existing requirement is shown beside it, with both sources and their
authority, and is neither applied nor dropped until a person decides.
*Check:* `tests/test_derivation_classes.py`

**CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES** *(PO A. Maier)*
Candidates of one run that state the same rule are merged into one candidate, naming every passage
they came from, before they are compared with the existing requirements.
*Check:* `tests/test_derivation_classes.py`
