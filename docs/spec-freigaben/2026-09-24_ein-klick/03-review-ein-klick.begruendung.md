# Accepting and editing become one click; the rule that forbade it is withdrawn

**Your decision, 2026-09-24:** with a stored token, the dashboard makes the commit itself.

**`THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ` is withdrawn — the second withdrawal in two
days, and that is worth naming.** It replaced `THE REVIEW DASHBOARD HOLDS NO CREDENTIAL` yesterday.
Both were right for the design at the time; the design moved twice because each round of review
showed the cost to the user. The replacement, `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`, states
the property that actually mattered all along: every write is a person's decision, under that
person's name. The two withdrawn names stay in the SPEC with their notes and are never reused.

**`ACCEPTANCE IS A COMMIT IN GITHUB` keeps its name** — it stays true: an API commit is a commit in
GitHub, authored by the token's owner. Only the words "in GitHub's web interface" go.

**`WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`** keeps what exists today for anyone who
does not store a token. `NO TEXT TRAVELS IN A URL` stays in force for it.

**Two rules for the whole interface, from your review of UC-001:**
- `ONE CLICK PER DECISION` — a measurable standard for every use case: count the clicks between a
  decision and its effect. It has no automatic check; it is checked when a use case is reviewed,
  which is where you found the problem.
- `EVERY STEP EXPLAINS ITSELF` — folded explanations for people new to GitHub. Folded, so that they
  cost nothing to people who do not need them.
