# Derive against what exists, not into empty space

**The problem you named.** A derivation that sees only the source text produces a requirement for
everything it finds, including what the SPEC already says. Two runs over two sources that share an
obligation leave it in the SPEC twice, under two names, and from then on every change must be made
twice or the two copies diverge.

**Four classes, because they need four treatments:**
- *New* is the only class that creates a requirement.
- *Change* reuses the name. The old rule is replaced, with its current text beside the proposal and
  the list of what references it. Both rules for this already exist and are only applied here.
- *Duplicate* adds a second source to the existing requirement. That is information, since the rule
  now has two reasons, but not a second rule.
- *Conflict* stops and asks you, showing both sources with their authority. Agent M must not settle
  a normative-versus-advisory conflict on its own.

**Why two layers of duplicate detection.** Your process repository learned this the hard way
(SOFTWARE_MAINTENANCE.md §4.0a). What can be decided without a model must be, because it is
reproducible. What needs a model is measured as a rate, not trusted case by case. The exact
duplicate (same name, same normalised text) is therefore deterministic. "The same obligation in
other words" is a model judgement, whose rate is measured on a fixed set of examples and which you
see and can overrule.

**Why the stop rule.** Without it, a large SPEC would be cut to fit the model's context, and the
cut-off part would be duplicated on the next run, with the dashboard showing a successful
deduplication. Stopping and saying "these 340 requirements do not fit into this participant's
context" lets you choose a participant with a larger context, or narrow the derivation to a part of
the source.

**Merging within the run** comes first, because a long law repeats its obligations. Without it, the
comparison with the existing SPEC would see five identical candidates and propose five identical
changes.
