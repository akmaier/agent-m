# Why versioning gets its own section rather than a line in the release stage

Three of these five would normally be release plumbing. They sit in the specification because the
Product Owner named versioning explicitly, and because two of them are load-bearing for a feature
that was requested: a dashboard for reviewing tests and artifacts *across versions*.

**`EVERY PRODUCT HAS ITS OWN VERSION LINE` is what makes parallel products work.** The requirement
was that one instance processes multiple products at once. If versions were shared, releasing one
product would renumber the others, and a reader looking at product B's version 2026.4.0 would have
no way to tell whether anything in B had changed since 2026.3.0. Independence costs nothing to
implement and is awkward to retrofit.

**`AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT` is the one that will matter most in
practice.** Generated artifacts change when any of three things change: the prompt, the model, or
the source. When output quality shifts — and with model endpoints under someone else's control it
will shift without warning — the first question is which of the three moved. A run stamp answers
it in seconds; without one, the investigation starts by guessing.

This is the same reasoning the process repository arrived at after a measurement complex where the
gate log did not record the answer text, so the effect of a detector change could not be
recalculated and had to be argued from a single documented case. The rule it wrote down was that
at least the triggering evidence belongs in the log, because otherwise the next change is again
only estimable.

**`A VERSION IS NOT REWRITTEN` protects the dashboard.** Comparing version to version is only
meaningful if a version denotes a fixed state. A moved tag turns every stored comparison into a
statement about something unknown, and the damage is silent — the dashboard keeps rendering, it
just stops being true.

**What is not specified here, deliberately:** when the minor number increases versus the patch
number. Every attempt to fix that mechanically ends in a rule that is either trivially gameable or
argued about on every release. It is a judgement call, it belongs to whoever cuts the release, and
a specification that pretends otherwise would be specifying something it cannot check.
