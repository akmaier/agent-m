# 13. Process execution and jobs: a drafting job receives the form its draft is checked by

**The change.** Adds `A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY`, after `EVERY MODEL READS AGENT M'S
AGENTS.MD FIRST`: the input of a job whose draft Agent M checks for the form of a requirement or the schema of a document
gives, in full, what that check judges by — the paragraph *Form of a requirement* of Agent M's own `SPEC.md` with every
requirement the check of a requirement cites, or the schema of every kind of document the check of a document reads. Its
place is the group `13. Process execution and jobs`, beside the other requirements on a job's input. Every other byte of
the section is carried over.

**Why.** akmaier, 2026-11-08: "agent-m has rules and they need to be followed automatically by all agents". A CI run of
`change-requirements` (participant and model `nvidia/nemotron-3-ultra-550b-a55b`, job JOB-20261108-2127-fa70 of the
product it changed) received Agent M's `AGENTS.md` and chapter 8 of the book, as `EVERY MODEL READS AGENT M'S AGENTS.MD
FIRST` and `A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING` ask, but none of the rules its draft was
then checked by: the input a job receives is `AGENTS.md`, the kind's prompt and the parts of its recipes, and no recipe
gives Agent M's own SPEC. What the drafter learned of the form was the kind's prompt, which restates it in its own words —
"a `name` in capitals, a `rule` — one statement in the required target state —" —, as the prompts of
`derive-requirements`, `derive-use-cases`, `change-use-case`, `derive-architecture` and `change-architecture` each restate
it in theirs, while the form is defined once and checked: a requirement by the SPEC's preamble and the requirements the
check of a requirement cites, a use case, a decision, a module and a backlog item by the schemas of MOD-documents. Six
paraphrases of two definitions drift from them; this one let names with underscores through, which the drafter also saw
in the product's own requirements. Giving the drafter the definitions themselves, chosen by the checks its kind names, makes it read the rule it is
judged by and removes the copies (*Nothing twice*); a new kind with those checks receives them without a line of its own
(*No special first case*, *Adding one of a kind changes nothing of another kind*). A finding sent back in the correction
loop names a rule by its name only; with the rule's text in the input, the drafter can read what the name means instead
of guessing it.

No requirement of the SPEC gives this already (*Nothing the SPEC already says*): `EVERY MODEL READS AGENT M'S AGENTS.MD
FIRST` gives one file, the four chapter requirements give the book, and `A FINDING READS LIKE A COMPILER MESSAGE` gives
the rule's name with a finding, not its text before the first round.

**Impact list.**
- `A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY`: new; nothing names it yet.
- Architecture: MOD-job-runner (a built-in part `form` beside `rules`), MOD-job-catalogue (the prompts of the drafting
  kinds no longer restate the form), MOD-spec-document (the form of a requirement, cut from Agent M's `SPEC.md`) and
  MOD-documents (the texts of its four schemas) are drafted for acceptance once this entry is accepted.
- Use cases: none changes. Like `EVERY MODEL READS AGENT M'S AGENTS.MD FIRST`, the rule concerns how every input is
  composed and is realised through the steps of UC-005, UC-007, UC-019, UC-022, UC-023 and UC-049 that send a job's
  input as they stand.
- Checks: `tests/test_job_reading.py` gains the cases the rule's check names.

**Origin.** akmaier's order of 2026-11-08, on the queue entry the run above wrote.
