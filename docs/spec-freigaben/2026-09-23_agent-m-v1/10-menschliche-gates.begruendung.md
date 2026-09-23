# Why the gates are the product, not a safety feature bolted on

It would be possible to build Agent M without this section: generate requirements, write them,
generate use cases, write those, done. It would demo well and it would be the wrong tool, because
the problem it exists to solve is not that artifacts are slow to produce. Chapter 6 of the book
states the mechanism: AI can reduce process overhead but does not make process optional, and if
anything faster generation *increases* the need for clear gates, because more candidate changes
arrive per hour than anyone can check.

So the gates are the feature. Everything else is the thing being gated.

**Four of the seven are taken verbatim in substance from the process repository**, and their
occasions are recorded incidents rather than principles. The night in which twenty-one changes
across roughly two thousand lines entered a specification without agreement is what produced the
approval tool, and with it the three rules that make an approval mean something: the current text
stands beside the proposal, what the approver leaves standing is written unchanged, and the
replaced text stays recoverable through the history rather than in a parallel folder that drifts.

That last detail is worth the sentence it costs. The first version of that design kept replaced
sections in a `ersetzt/` directory. It was removed because it did the same job twice and the two
copies diverged; git already holds the old text, and `git show <commit>^:<file>` retrieves it.
Agent M inherits the corrected version, not the first attempt.

**`EVOLUTION ENTERS THROUGH THE SPECIFICATION` is the requirement the Product Owner stated
directly** — issues map to spec-first changes that result in a version update — and it is the one
that closes the cycle. Without it, Agent M runs forward once and then watches the product drift
away from the documents it generated. With it, the ninth stage feeds the first, which is what
makes this a cycle rather than a pipeline.

**`A GENERATED ARTIFACT IS A PROPOSAL` is the rule that makes all the others enforceable.** If the
tool can write to the default branch, every gate above becomes advisory — a step that can be
skipped by whoever is in a hurry. Routing all output through branches and pull requests costs
nothing extra, because the artifacts are Markdown and pull requests are where Markdown is best
reviewed.

**`THE GATE IS RECORDED` is what a regulated profile (§5) needs and what nobody writes down
voluntarily.** An approval that was given but not recorded is, three months later, an approval
that cannot be shown to have been given. The regulated profiles in §5 would otherwise have to add
this mechanism themselves, which would mean two approval mechanisms — one for normal products and
one for regulated ones — and the second would be the one that never gets tested.
