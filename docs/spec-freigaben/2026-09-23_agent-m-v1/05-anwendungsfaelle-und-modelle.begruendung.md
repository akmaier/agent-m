# Why the use-case stage is mostly borrowed from the book

Chapter 9 already settles the two questions that would otherwise take a design round: what a use
case must contain, and what format diagrams take. There is also a public worked example —
`akmaier/dvd_database/tree/main/docs/requirements`, four files produced from a single prompt — so
the output shape is demonstrated rather than proposed.

What Agent M adds is the link back to §1: the requirement identifiers. The dvd_database example
has no identifiers, because it was produced in one pass and never had to survive a second. A tool
that runs the cycle repeatedly needs them, and stage 3 is where the first real coverage question
becomes answerable.

**`THE PROSE IS AUTHORITATIVE` exists because of a genuine limitation, and hiding it would be
worse than stating it.** Mermaid has no UML use-case diagram. What the reference project draws is
a flowchart arranged to look like one. That is a reasonable approximation and the book endorses
the approach, but an approximation that nobody labels tends to be read as the real thing — and
then a reviewer who knows UML spends an afternoon looking for semantics that were never there.
The rule costs one sentence and prevents that afternoon.

**`UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN` is the deliberate choice not to build a
gate.** It would be easy to make coverage a blocking condition, and it would be wrong at this
stage. The process repository's fifth test-design rule is explicit about the mechanism: a check
that goes red without anything having changed teaches everyone to ignore red, and then does more
damage than its absence. A requirement that has no use case on day three of a product is not a
defect; it is a requirement whose turn has not come.

The dashboard therefore reports both directions — requirements with no use case, and use cases
with no requirement — and neither stops a run. The second direction is the more interesting one in
practice: a use case that realises nothing usually means a requirement was discovered during
modelling and never written down, which is exactly the kind of drift the cycle is supposed to
surface.

**On the relationship to the book's other diagram types:** sequence, class, activity and state
diagrams all appear in chapter 9 and all belong in a complete requirements folder. They are not
specified here because they describe *design*, and design is stage 4 — out of scope for 2026.1.0.
The format rule above applies to them when their stage arrives; nothing here needs revisiting.
