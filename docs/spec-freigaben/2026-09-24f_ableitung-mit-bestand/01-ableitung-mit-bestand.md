## 3. Requirements

**A REQUIREMENT HAS FIVE FIELDS** *(PO A. Maier, 2026-09-23)*
A requirement consists of a name, a source with a date, a rule, an occasion, and a check.
*Occasion:* the five fields are what make a requirement approvable. A paragraph in which rule,
reason and measurement run together cannot be decided on — not because it is long, but because one
cannot see what one is deciding.
*Check:* `tests/test_requirement_fields.py`

**ONE STATEMENT PER REQUIREMENT** *(PO A. Maier, 2026-09-23)*
The rule of a requirement is a single statement; a rule containing "and" or "additionally" is two
requirements.
*Occasion:* two rules in one entry cannot be approved, changed or withdrawn separately, so the
entry becomes a package deal forever.
*Check:* `tests/test_single_statement.py` — flags conjunctions in the rule field for review; the
decision stays human.

**A RULE IS CHECKABLE** *(PO A. Maier, 2026-09-23)*
A rule is stated so that it can be shown to hold or not hold.
*Occasion:* "Poppler wins on conflict" can be checked; "Docling is the expensive part" cannot — it
is a measurement, and it belongs in the occasion.
*Check:* no automatic check; at review.

**NO STATE IN THE SPECIFICATION** *(PO A. Maier, 2026-09-23)*
A requirement states the target, never the current condition of a system.
*Occasion:* "Poppler is not installed on the server" was true for exactly one day. Current
condition belongs in a check that establishes it, never in a document that asserts it.
*Check:* no automatic check; at review.

**A REQUIREMENT NAMES ITS CHECK** *(PO A. Maier, 2026-09-23)*
Every requirement names the test that guards it, or states explicitly that it is guarded only at
review.
*Occasion:* traceability is a field, not an assertion in code. A requirement with no named guard
is a wish, and a green test suite that does not know which requirements it protects proves
nothing about them.
*Check:* `tests/test_requirement_names_check.py`

**A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST** *(PO A. Maier, 2026-09-23)*
Before an existing requirement is changed, the artifacts that reference it are listed, and the
list is part of the proposal rather than a result reported afterwards.
*Occasion:* the renumbering that broke fifteen files would have produced the number "fifteen"
beforehand, had anyone looked. It was noticed afterwards.
*Check:* `tests/test_impact_list.py` — a change proposal touching an existing identifier carries
the derived reference list.

**A REQUIREMENT NAMES WHAT IT CONSTRAINS** *(PO A. Maier, 2026-09-24)*
Every requirement states whether it constrains the product or the development process.
*Occasion:* a requirement source may impose rules on either. "The export is a PDF" constrains the
product; "every change to a safety-relevant unit is verified and the verification is recorded"
constrains how the product is developed. Only the second kind changes the workflow (§5), so Agent M
has to know which is which.
*Check:* `tests/test_requirement_fields.py`

**DERIVATION SEES THE EXISTING REQUIREMENTS** *(PO A. Maier, 2026-09-24)*
When requirements are derived, every requirement of the product — in its SPEC and in its open change
queues — is part of the input the deriving participant receives.
*Occasion:* PO, 2026-09-24: "Any derivation of new requirements should also have the old ones in
context and modify them instead of duplicating them." A model that sees only the source text cannot
know what is already specified.
*Check:* `tests/test_derivation_context.py`

**NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY** *(PO A. Maier, 2026-09-24)*
If the existing requirements do not fit into the deriving participant's context, the run stops and
says so before anything is sent.
*Occasion:* a deduplication that silently misses part of the SPEC produces exactly the duplicates it
exists to prevent, and looks as if it worked.
*Check:* `tests/test_derivation_context.py`

**A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT** *(PO A. Maier, 2026-09-24)*
Every derived candidate is classified as a new requirement, a change to a named existing requirement,
a duplicate of one, or a conflict with one.
*Occasion:* only a new requirement becomes a new entry; the other three touch something that exists,
and each needs a different treatment.
*Check:* `tests/test_derivation_classes.py`

**EXACT DUPLICATES ARE FOUND WITHOUT A MODEL** *(PO A. Maier, 2026-09-24)*
A candidate whose name or normalised rule text equals an existing requirement's is classified as a
duplicate deterministically, before any model classification.
*Occasion:* what can be decided without a model is decided without one (SOFTWARE_MAINTENANCE.md
§4.0a rule 3): reproducible, fast, and it cannot be argued with.
*Check:* `tests/test_derivation_classes.py`

**THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED** *(PO A. Maier, 2026-09-24)*
How often the model classifies a candidate correctly is measured as a rate on a fixed set of
examples, and every classification is shown to a person, who can change it.
*Occasion:* "states the same rule in other words" is a judgement a model makes stochastically. Its
quality is a number over many cases, not a verdict on one (§4.0a rule 4).
*Check:* `tests/test_derivation_classes.py` — the rate is reported, not gated.

**A CHANGE IS PROPOSED UNDER THE EXISTING NAME** *(PO A. Maier, 2026-09-24)*
A candidate that changes an existing requirement is proposed as a change to that requirement, under
its name, with its current text beside it and its impact list.
*Occasion:* a changed rule under a new name leaves the old one standing, and the SPEC then contains
both — the duplication this pass exists to prevent.
*Check:* `tests/test_derivation_classes.py`

**A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT** *(PO A. Maier, 2026-09-24)*
A candidate that restates an existing requirement is proposed as an additional source of that
requirement, never as a new requirement.
*Occasion:* when a second source demands the same thing, that is valuable — the requirement now has
two reasons — but it is still one requirement.
*Check:* `tests/test_derivation_classes.py`

**A CONFLICT IS DECIDED BY A PERSON** *(PO A. Maier, 2026-09-24)*
A candidate that contradicts an existing requirement is shown beside it, with both sources and their
authority, and is neither applied nor dropped until a person decides.
*Occasion:* a normative source contradicting an advisory one, or two laws pulling in different
directions, is a decision with consequences, not a formatting question.
*Check:* `tests/test_derivation_classes.py`

**CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES** *(PO A. Maier, 2026-09-24)*
Candidates of one run that state the same rule are merged into one candidate, naming every passage
they came from, before they are compared with the existing requirements.
*Occasion:* a long source states the same obligation in several places; a model extracting from it
produces the same candidate several times.
*Check:* `tests/test_derivation_classes.py`
