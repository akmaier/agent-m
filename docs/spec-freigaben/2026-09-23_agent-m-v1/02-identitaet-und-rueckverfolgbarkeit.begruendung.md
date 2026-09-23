# Why identity comes before everything else

Agent M's whole claim is that it runs a *cycle*, not a sequence of unrelated generations. The only
thing that makes a cycle out of nine separate AI calls is that stage n+1 can say which output of
stage n it is answering. Take the identifiers away and the tool degrades into a prompt collection
that happens to write files into the same folder.

This is also where the scope decision for 2026.1.0 pays off. Stages 1–3 are exactly the stages
that *mint* identifiers — sources, requirements, use cases. Everything later only consumes them.
Getting the scheme wrong while rushing through all nine stages would have been expensive to
correct, because the correction would have to reach into generated code and tests.

**Three of the five rules are borrowed, not invented.** `THE NAME IS THE ID AND IT SURVIVES` and
`A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION` come from the process repository, where they
were paid for: a renumbering from `R1a…R8` to `R1…R12` broke references in fifteen files without
changing a single rule. `EVERY ARTIFACT NAMES ITS ORIGIN` is the V-model's pairing of a
decomposition step with its verification step, expressed as data rather than as a diagram.

**`THE TRACEABILITY MATRIX IS DERIVED` is the one that will be argued about**, because a stored
matrix is easier to build and looks identical on the first day. The difference appears on the
fiftieth: a stored matrix has drifted and asserts coverage that no longer exists, and the only way
to discover that is to recompute it — at which point there was never a reason to store it. The
process repository has the general form of this lesson written down as `KEIN SOLLWERT AUS DER
SPEC`: whoever parses a target value out of a document has made the document into source code.

**What this rule does not do:** it does not claim the matrix is complete. A requirement with no
use case and a use case with no requirement are both *findable* once the matrix is derived — that
is the dashboard's job in §4 — but finding them is not the same as forbidding them. Early in a
product, unrealised requirements are the normal state, not a defect.
