# §3: a requirement constrains the product unless it says otherwise

**Finding (backlog refinement, 2026-10-01).** `A REQUIREMENT NAMES WHAT IT CONSTRAINS` reads "Every
requirement states whether it constrains the product or the development process." None of the
requirements of Agent M's own SPEC states it, and the SPEC has no field for it — the form in its preamble
and in `A REQUIREMENT HAS FIVE FIELDS` has five fields, and this would be a sixth.

**Why not a sentence in the preamble.** A preamble saying "every requirement of this SPEC constrains the
product" does not satisfy the rule as written: the rule asks *every requirement* to state it, and a default
stated once elsewhere is not the requirement stating it. The preamble is also not a section; it has no
`## N.` anchor, so a queue entry cannot change it, and the SPEC is not written by hand. The default has to
live in the rule.

**The change:** the rule becomes "A requirement constrains the product unless it states that it constrains the
development process." Name kept (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED` is not needed): a process
requirement still names what it constrains; a product requirement no longer has to. The occasion says why,
and the check gains its counter-proof. The source keeps `PO A. Maier, 2026-09-24` and adds "changed
2026-10-01". The rest of §3 is carried over byte for byte.

**Consequence for Agent M's own SPEC:** with the default, every one of its requirements constrains the
product, Agent M, and the rule holds without touching any other section. Agent M's own development process is
declared in `docs/process.md`, which cites SPEC rules but adds none.

**Not defined, and not invented here:** *how* a requirement states that it constrains the development
process — a line `*Constrains:*`, a word in the source field, a marker in the heading. UC-005 5b says a
candidate "is marked as such"; MOD-artifacts `parseRequirements` returns a field `constrains`; neither fixes
the syntax. It belongs to the implementation of ITM-009 or to a later SPEC change; the PO may want to fix it
here instead.

**Impact list** (every artifact naming `A REQUIREMENT NAMES WHAT IT CONSTRAINS`):
- UC-005 (realises; step 5 asks the participant whether a candidate constrains product or process; 5b marks a
  process candidate) — consistent with the default, unchanged.
- UC-020 (step 4 filter "constrains product or process"), UC-030 (step 2 shows it per requirement) — read the
  derived value, unchanged.
- MOD-artifacts (`parseRequirements` returns `constrains`) — reads *product* where nothing is stated; a
  one-phrase interface note for the implementation job, not changed in this commit.
- ITM-009 (realises it; `tests/test_requirement_fields.py`) — its acceptance criterion gains the counter-proof
  of the new check; the item is a register and changes with the next backlog refinement.
- Code and tests: none name it yet.

## The other half of the finding — registered sources: not proposed, needs the PO's decision

`A REQUIREMENT HAS A REGISTERED SOURCE` (§2) reads "Every requirement names at least one source linked to its
product". Agent M's own SPEC names its sources as `PO A. Maier`, `Vibe Coding, ch. …` and
`SOFTWARE_MAINTENANCE.md, …`; the instance has no `docs/sources/` and Agent M no `docs/sources.md`. Two
things are missing, and only one of them is a register entry:

1. **The register entries.** Their fields are defined (UC-004 step 3 and the table "Where things end up";
   MOD-source-library `parseSource`: kind, authority, licence, permitted processing places, versions with
   identifier or designation, date and the SHA-256 of every file read; a product's link: identifier,
   version, the version's hash, the part, UC-015 step 4). **Their file syntax is not**: neither ARC-006 nor
   MOD-source-library says whether these are front-matter keys, a table or headings, as ARC-019 does for
   process models. Writing the files now would invent the syntax ITM-046 has to implement. They are
   therefore **not** on this branch. What they would hold, read 2026-10-01:
   - `SRC-…` *PO A. Maier* — kind `person`, authority `normative`; content: the PO's decisions as recorded in
     this repository's queues and approval records, i.e. the repository `akmaier/agent-m` at a commit.
   - `SRC-…` *Vibe Coding* (Springer, `link.springer.com/book/9783032399069`) — kind
     `document`, authority `normative` for the requirements that cite it; licence restricted (publisher's
     copyright), so only the entry is public; the SHA-256 needs the PO's own copy of the file (UC-004 4a) —
     it cannot be filled in from here.
   - `SRC-…` *SOFTWARE_MAINTENANCE.md* of the process repository — kind `document`, authority `normative`;
     content: that repository at commit `7b6582ab55214c80c068558f033c23071e8d65c0`, the file's SHA-256
     `764c8fa36f5673eb63e441d79d625681922b802a49984710e862c59a4331348b` (2 110 lines); licence not stated
     there, so restricted until one is recorded (UC-004 4b) — the file also names persons and must not be
     copied into the public instance.
2. **The names in the source fields.** Even with the three entries registered and linked, the SPEC's source
   fields name `PO A. Maier`, not an identifier `SRC-…`; `EVERY ARTIFACT NAMES ITS ORIGIN` says "Each
   artifact names the identifiers of the artifacts it descends from: a requirement names its source".

**Options for the PO:**
- (a) Define the register syntax first (an architecture change of MOD-source-library, or ITM-046), then
  register the three sources with identifiers that the SPEC's citations can be read as, and change
  `A REQUIREMENT HAS A REGISTERED SOURCE` and `EVERY ARTIFACT NAMES ITS ORIGIN` so that a source may be named
  by the name its register entry gives it. Two rule changes, no change to the source fields of the SPEC.
- (b) Define the syntax, register the sources, and rewrite every source field of the SPEC to name `SRC-`
  identifiers — one queue entry per section, every section touched, every requirement's header changed.
- (c) Leave Agent M's own SPEC outside the rule: its sources are the PO, the book and the process repository,
  named in its source fields; the rule binds the products Agent M manages. This needs a sentence in the rule's
  occasion or a scope in its text, and is the smallest change — but it makes Agent M an exception to the
  rules it enforces.
