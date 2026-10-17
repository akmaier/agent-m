---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4700bb247388d8cefb11928de4379512913e7426
  - https://github.com/akmaier/agent-m/pull/674
date: 2026-10-17 02:21 UTC
---
# Development → Release testing: ITM-577, A derivation's candidates stand beside the requirement's current text, marked when they constrain the process

**REGISTER**

## Reason

ITM-577, pull request #674 into `sprint/team1/61`, at head `4700bb24`. developer-sonnet-d wrote it.

1. **The tests-only commit is red.** `42c16de9` was pushed alone, and run 38994030019 failed on it. The Scrum Master read
   the saved log: node (1) shows `# fail 4`, `# todo 0`, which are TST-577001 to 577004. They fail on behaviour, with the
   current requirement, the mark and the message absent.
2. **CI is green on the head**: run 38994367539 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `candidates.mjs` and `jobs.mjs` of MOD-review-pages, and one new test
   file.
   - `showCurrent` and `sourceText` are each one function, called by both pages.
   - The "Beside <name>." line is gone. The grep found it in no test, and its known positive is `jobs.mjs:358`.
   - The UC-019 table is the same on the base and on the head. The related tests pass, release tests included, and
     ITM-018 passes.
4. **Each of the six planted faults is caught.**
5. **The Acceptance holds.**
   - Each candidate shows the current text of the requirement it refers to, from the SPEC of the panel's snapshot read
     with `parseSpec`.
   - A candidate with `constrains: "process"` is marked "Constrains the process.". The answer schema's enum is
     `product` or `process`.
   - When every candidate is a duplicate, the panel says that writing only adds sources.

**The readings are taken.**
- **The mark and the message are on UC-005's panel only.** UC-019's page draws no derivation of requirements from a
  source, and the item's "both pages call it" names the rendering of the current requirement alone.
- **UC-005 7b's "The panel says so" follows the classes the panel shows.** A person's change of a class is what the
  panel then says. With no candidate, it says nothing.

**For the sprint's feedback.** The developer read AGENTS.md from its prompt's context, not from the file. AGENTS.md §1
asks for originals.
