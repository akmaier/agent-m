# Agent M — design

**PLAN**

This document explains the intended shape of Agent M and why it has that shape. It binds nothing.
A sentence from here becomes binding only once it has been moved into [`SPEC.md`](SPEC.md) through
the approval queue in [`docs/spec-freigaben/`](docs/spec-freigaben/).

Written 2026-09-23, after the Phase-1 decisions of the Product Owner recorded in §9.

---

## 1. What problem this solves

The *Vibe Coding* book argues, across seventeen chapters, that faster code generation does not
remove the need for requirements, models, architecture, tests, and a release discipline — it makes
them harder to skip, because more candidate changes now arrive per hour than a team can review.
Chapter 6 puts it plainly: process models are not the opposite of vibe coding, they are what keeps
vibe coding from collapsing into team-wide archaeology.

The book demonstrates this. It does not automate it. A reader who finishes chapter 17 knows what a
V-model gate is and can recognise a use-case diagram, but still has to assemble the workflow by
hand, in their own repository, with their own prompts.

Agent M is that workflow, assembled. It is deliberately a **companion**, not a platform: it adds
conventions and a small amount of machinery to a repository the reader already owns, and it can be
abandoned at any point without stranding the artifacts, because every artifact is Markdown and
Mermaid in that repository.

## 2. The spine: identity

Everything else in this design is downstream of one decision.

Each artifact carries a stable identifier, and each artifact names the identifiers it descends
from. A use case names the requirements it realises. An architecture decision names the use cases
that force it. A test names the requirement it guards. Nothing is generated that does not say what
justified it.

```
SRC-<slug>    a requirement source        (organisation, person, standard, regulation, document, system)
REQ-<NAME>    a requirement               (the name is the ID, in capitals, and it never changes)
UC-<nnn>      a use case
ARC-<nnn>     an architecture decision    (ADR form)
MOD-<slug>    an implementation module
TST-<nnn>     a test case
```

The traceability matrix is therefore **derived, never maintained**. A matrix that somebody keeps
up to date by hand is a document that is wrong most of the time; a matrix computed from the
artifacts is either right or visibly broken.

Two rules from the process repository carry over unchanged, because they were learned the
expensive way:

- **The name is the ID and it survives.** It travels with the requirement when the requirement
  moves to another section or another file. Withdrawn names are never reused. References name the
  requirement, never a section number — a cosmetic renumbering once broke references in fifteen
  files without a single rule having changed.
- **A pointer is a signpost, never load-bearing.** `[→ document §x]` means "there is more about
  this over there", never "the rule lives over there". A rule that is meant to hold is written
  where it binds.

## 3. Requirement sources are typed, and authority is declared

The Product Owner asked for this explicitly: organisations like CBO or RRZE are *examples*, the
mechanism must be generic. A source is therefore a record, not a name in prose:

```yaml
id: SRC-rrze-spec
name: RRZE Webteam plugin standard
kind: standard            # organisation | person | standard | regulation | document | system | measurement
authority: normative      # normative | advisory | informational
location: https://github.com/RRZE-Webteam/SPEC
retrieved: 2026-09-23
pinned: <commit sha>      # for a living source: the state that was actually read
contact: …
```

Two fields do real work here.

**`authority`** exists because linking a document does not make it binding. A normative source
produces requirements whose violation is a defect; an advisory source produces requirements that
have to be argued for. Without the field, every source silently becomes normative, which is how
projects acquire rules nobody ever agreed to.

**`pinned`** exists because living sources move. A standard that is maintained in a git repository
is read at a commit, and the product records *which* commit it built against. A dated file copy in
our own tree looks like provenance and is in fact a snapshot that drifts — the process repository
learned this on a standard that published three versions in eight days.

## 4. Requirements keep the five-field form

Agent M does not invent a requirement schema. It adopts the one already proven in the process
repository:

> **NAME** *(source, date)*
> One rule, stated in the indicative, testable.
> *Occasion:* one or two sentences on why. Longer measurements get their own file, linked.
> *Check:* which test guards it.

The value is in the constraints, not the fields. **One statement per requirement** — an "and" or an
"additionally" in the rule means there are two, and two rules in one entry cannot be approved,
changed or withdrawn separately. **The rule must be checkable** — "Poppler wins on conflict" is
checkable, "Docling is the expensive part" is a measurement and belongs in the occasion. And
**state does not belong in a specification**: "Poppler is not installed on the server" was true for
one day; state belongs in a check that establishes it, never in a document that asserts it.

This is the part of Agent M most likely to be useful to readers who use nothing else from it. Most
requirement tooling will happily accept a paragraph.

## 5. Use cases and models

Format is settled by the book rather than by preference. Chapter 9 §6 makes the argument: current
tooling works better when a model is represented twice — once visually for people and once
textually for machines — and text-first diagramming is what makes a diagram versionable,
diffable, and reviewable in a pull request. Mermaid in Markdown renders directly on GitHub.

The output shape is already demonstrated publicly at
[`akmaier/dvd_database/tree/main/docs/requirements`](https://github.com/akmaier/dvd_database/tree/main/docs/requirements):
a requirements specification, a use-case document with diagram and descriptions, sequence diagrams,
and structural diagrams. Agent M produces that set, with identifiers added.

An honest limitation to carry openly: **Mermaid has no UML use-case diagram.** The actor/ellipse
notation is approximated with a flowchart, as the reference project does. Where the semantics
matter, the prose description is authoritative and the diagram is the overview — not the other way
round.

## 6. Process models are data, profiles are overlays

> **Superseded on 2026-09-24 in part.** The table below mixed process models, practices and a
> standard. By the book's own classification there are five process models (waterfall, V-model,
> reuse-oriented, Scrum, Kanban); DevOps, prototyping, incremental delivery and the scaling layers
> are practices; IEC 62304 is a requirement source whose process rules add to the model. See SPEC
> §5 and queue `docs/spec-freigaben/2026-09-24c_modell-und-quelle`. The text below is kept as the
> design history.

The book's catalogue becomes a set of declarative model definitions:

| Model | Manages well | Accepts |
|---|---|---|
| Waterfall | early cost certainty, clear milestones | late discovery is expensive |
| V-model | traceable verification, regulated evidence | long feedback loops |
| Reuse-oriented | build-versus-buy, dependency due diligence | requirements bend to what exists |
| Incremental / prototyping | learning under uncertainty | weaker long-range predictability |
| Agile | intent drift, short correction cycles | scaling beyond one small team |
| Kanban | flow, work-in-progress limits, bottleneck visibility | little help with fixed deadlines |
| Scrum | rhythm, role separation, inspect-and-adapt | ceremony cost in very small teams |
| DevOps | the gap between built and running | needs real automation to pay off |
| Disciplined agile at scale | multi-team coordination, contracts | overhead for a single team |

A model declares its stages, which stages pair with which (the horizontal arrows of the V), what
each stage must produce, and where the gates sit. A **profile** — IEC 62304 class A, B or C;
ISO 14971 risk management; an internal review policy — is an overlay that *adds* required
artifacts and evidence to whatever model is underneath. Keeping these separate follows the book's
own framing: choosing a process is risk balancing, not a methodology war, and a regulated project
does not stop being agile, it acquires obligations.

## 7. Three runtimes, one definition

The Product Owner chose all three. That only stays sane under one condition: **the prompts, the
schemas and the stage definitions are data files in the repository, and the three runtimes are
drivers over them.** The process repository has the scar that justifies this rule — three
independently maintained copies of one detector, each knowing phrases the others lacked, which was
the root cause of an entire measurement complex. One definition, or this design fails quietly.

| Runtime | Key lives in | Good for | Cost |
|---|---|---|---|
| Browser → endpoint | `localStorage` | interactive work, zero setup | endpoint must permit browser calls |
| GitHub Actions | repository secret | long runs, review by others, native PRs | key leaves the machine |
| Local CLI bridge | nowhere — the CLI is already authenticated | handing coding tasks to a running agent | needs a local process |

### Three feasibility questions, stated as open rather than assumed

These shape the architecture, so they are named now and will be **measured** before anything is
built on them. None of them is currently verified.

1. **Browser calls to model endpoints.** Anthropic's API rejects direct browser calls unless an
   explicit opt-in header is sent; OpenAI-compatible endpoints differ in their CORS behaviour, and
   self-hosted gateways are configured locally. *Endpoint compatibility is therefore a requirement
   of the product, not an implementation detail* — the configuration screen must be able to say
   which endpoints are known to work and why one fails.
2. **Local bridge reachability.** A page served over HTTPS that calls `http://127.0.0.1` is not
   blocked as mixed content — loopback counts as a trustworthy origin — but Chrome additionally
   applies Private Network Access rules, which require a CORS preflight carrying
   `Access-Control-Request-Private-Network` and a bridge that answers
   `Access-Control-Allow-Private-Network: true`. Whether current Chrome and Safari behave as
   documented is a measurement, and it belongs in `docs/measurements/` before a line of bridge code.
3. **Cross-repository writes from a static page.** Each managed product is its own repository, so
   the page needs a GitHub token with write access to it. Scope minimisation, token storage, and
   what happens when the token is absent are design questions, not afterthoughts.

### Why the key is not in a cookie

The Product Owner's requirement was that no API key is exposed to the repository, with the
configuration stored in the browser "as cookie". A cookie set on `akmaier.github.io` is attached
to every request to that origin and therefore **travels to GitHub's servers on each page load** —
exactly the exposure the requirement exists to prevent. `localStorage` is read only by script on
the page and never transmitted. Same convenience, strictly better on the property that motivated
the requirement.

## 8. Storage: one product, one repository

Agent M holds the engine and the Pages site. Each managed product is a separate GitHub repository
that Agent M reads and writes through the API. One instance manages several in parallel; each
keeps its own version line.

This matches the argument the book makes for diagrams-as-code: the requirements of a product
belong beside the code they describe, so that a pull request shows the requirement change and the
code change together. The price is that Agent M needs cross-repository credentials, which is the
third open question in §7.

## 9. Scope of 2026.1.0

Decided by the Product Owner on 2026-09-23: **the front of the chain, deep** — stages 1 to 3, done
properly, rather than a thin pass over all nine.

In scope: the source register with its type and authority model · requirements in the five-field
form with generated traceability · use cases and Mermaid diagrams naming their requirements · the
review dashboard for exactly these three stages · the Pages configuration surface · all three
runtimes · the process-model catalogue as data, with the gates that stages 1 to 3 actually need.

Out of scope for 2026.1.0, and deliberately so: architecture generation, code generation, test
generation, the release pipeline, and the generated manual. Everything downstream hangs on the
identifiers minted in stages 1 to 3; fixing that model by accident while rushing through nine
stages is the failure this scope decision avoids.

## 10. Open decisions

| # | Decision | Why it is open |
|---|---|---|
| 1 | Licence | A public repository without a `LICENSE` is all-rights-reserved. For a book companion meant to be reused by readers, that is probably wrong — but the choice is the author's, and it is easier to add a licence than to retract one. |
| 2 | Does Agent M dogfood itself? | The recommendation is yes: Agent M's own requirements should live in Agent M's format, so that the tool is demonstrated by its own repository. The cost is that the tool must work before it can manage itself, so the first pass is manual. |
| 3 | Relationship to the book's editions | The book exists in English, Chinese, Korean and Spanish. Whether Agent M's interface and generated artifacts follow is a scope question, not a technical one. |
