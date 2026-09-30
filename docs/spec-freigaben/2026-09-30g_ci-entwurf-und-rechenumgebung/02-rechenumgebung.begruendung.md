# §15: the software environment of a compute resource is pinned in the job's own files

**The question (queue 2026-09-24g, entry 10, open question 4).** `A RESOURCE IS PINNED TO AN EXACT STATE`
fixes a repository to a commit, data or a model to a revision or file hashes, an endpoint or agent to the
identifier of the model it serves — and names no pin for `compute` (a SLURM cluster, a GPU workstation).
Hardware has no version; what changes results is the software on it — the container image, the loaded
modules, the driver and CUDA versions. UC-040's table left the field as an open question.

**PO decision, 2026-09-30: option (b)** — the environment is pinned where the job defines it: the product's
job scripts, CI configuration or container definition. The alternatives were (a) a pin in the compute entry
itself, and (c) both.

**A correction by the main agent.** When presenting the options, I wrote that (b) needs no SPEC change. That
was wrong: the rule's first words, "A resource records the exact state the product uses", bind *every*
resource, `compute` included. Without a change, a compute entry without a pin would violate it. Hence this
entry:
- `A RESOURCE IS PINNED TO AN EXACT STATE` is **narrowed** to the five kinds that have a state of their own;
  its check gains the counter-case "a `compute` entry without a pin passes".
- **New:** `A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES` — states option (b) as a rule. Strike it
  if the narrowing alone is enough for you; the narrowing is what removes the contradiction.

**§15 is the last section,** so the entry covers the whole section; every other rule of it is carried over
byte for byte.

**Impact list** (every file naming `A RESOURCE IS PINNED TO AN EXACT STATE`, searched in `docs/`, `tests/`,
`tools/` and `SPEC.md`): `SPEC.md`, UC-040. UC-040's table of kinds and its list of realised requirements are
updated in the same commit, and open for review on the dashboard.
