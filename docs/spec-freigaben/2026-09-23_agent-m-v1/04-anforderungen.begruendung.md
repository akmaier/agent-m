# Why the five-field form is adopted rather than designed

This is the one part of Agent M that is copied almost verbatim from the process repository, and
that is the point. The form was not derived from a methodology; it was arrived at after a night in
which twenty-one changes across roughly two thousand lines entered a specification without
agreement, and the constraints are each a response to a specific way that went wrong.

**The constraints, not the fields, are the contribution.** Any tool can offer five text boxes.
What most requirement tooling will not do is refuse a paragraph. The three refusals here are:

- *One statement.* An "and" makes the entry impossible to approve or withdraw in halves. The check
  is deliberately an advisory flag rather than a hard rejection, because German and English both
  produce legitimate single statements containing "and" — the tool surfaces the candidate and a
  person decides.
- *Checkable.* This is the line between a rule and a measurement. It has no automatic check, and
  claiming otherwise would be worse than admitting it: a check that cannot fail teaches everyone
  to ignore red, which does more damage than its absence.
- *No state.* The most common way a specification rots. State is true on the day it is written and
  wrong thereafter, and unlike a wrong rule, nobody goes looking for it.

**`A REQUIREMENT NAMES ITS CHECK` is what connects this section to §1.** The derived traceability
matrix can only answer "which requirements are unguarded?" if the guard is a field. The process
repository states the general form as *Traceability ist ein Feld, keine Prüfung* — and explains
why the alternative is worse: an assertion that checks whether a specification contains a
particular section is circular, because whoever changes both has verified nothing, while a green
suite implies coverage that does not exist.

**`A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` is cheap here and was not cheap there.**
In the process repository the impact list had to be assembled by hand. In Agent M the matrix is
already derived (§1), so the list is a query. That is a good argument for the rule existing: a
discipline that used to cost an afternoon now costs nothing, and the only reason not to require it
would be habit.

**What was deliberately not adopted:** priority or effort fields. Both are estimates, both are
state, and the book's own chapter on cost management is blunt about pseudo-precision in
estimation. If prioritisation is needed it belongs in the backlog, which is a different artifact
with a different lifetime.
