# Why sources are a stage of their own

Most requirement tooling starts at the requirement. Agent M starts one step earlier, because the
Product Owner asked for requirement *sources* as a first-class concept and because the question
"who is allowed to impose this on us?" is the one that decides what happens when two requirements
conflict.

**`authority` is the field that earns its place.** The process repository states the underlying
rule as *Verbindlichkeit wird deklariert, nicht vererbt* — bindingness is declared, not inherited —
and it exists there because the opposite kept happening: a document got linked, then cited, then
treated as a rule, and nobody could say when it had become one. Making authority a field of the
source rather than a property of the citation means the answer is written down once, at the place
where it can be checked, instead of being reconstructed from usage.

The three values are deliberately few. `normative` means violation is a defect. `advisory` means
the requirement has to be argued for on its merits. `informational` means the source explains
something but imposes nothing. A fourth value would be a research project.

**`pinned` is the field that will look like overhead until the first time it saves someone.** The
scenario is concrete: a reader builds against a published standard, the standard is revised, and
six months later a reviewer asks which version the product satisfies. Without a pin, the only
honest answer is "the one that was current at the time, probably". The process repository ran into
exactly this with a standard that published three versions in eight days, and the conclusion there
was that a clone at a known commit is the living source plus its history, whereas a file copy is a
snapshot that silently ages.

**`THE SOURCE MODEL IS GENERIC` has a test that is unusual and deliberate:** no source identifier
appears in Agent M's own code. That is a mutation-style check — it fails the moment somebody
hard-codes a convenience for one institution, which is exactly how generic tools stop being
generic. The process repository's rule for new checks applies: whoever writes one runs the
counter-proof once, by introducing the fault on purpose and confirming the check goes red.

**What was considered and left out:** a `trust` or `reliability` score per source. It would be a
number nobody could derive, and §3 already forbids putting measurements where rules belong. If
source quality needs to be assessed, that is a measurement document, not a field.
