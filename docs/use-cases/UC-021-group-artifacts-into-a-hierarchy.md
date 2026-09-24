---
id: UC-021
title: Group artifacts into a hierarchy
stage: 2 requirements
actors:
  - Author
  - GitHub
realises:
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - A REGROUPING IS COMMITTED DIRECTLY
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
  - THE NAME IS THE ID AND IT SURVIVES
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - STATUS IS DERIVED FROM THE RECORDS
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - ARTIFACTS ARE MARKDOWN
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
---
# UC-021 Group artifacts into a hierarchy

**Goal.** The author arranges a product's requirements, use cases, architecture elements, modules
and tests into nested groups, so that a hundred items read as a few chapters. The book asks for
exactly this twice: requirements at different levels of detail for different readers (Vibe Coding,
ch. 8 §1.1), and a backlog with "more structure than a pile of wishes" (ch. 8 §3.2). Grouping only
arranges; it never renames, renumbers or reopens anything.

Every kind has a group file of its own in the product repository; saving a regrouping commits
that file directly and changes nothing else — not the SPEC, not an artifact file, no approval.

| Kind | Group file |
|---|---|
| Requirements | `docs/groups/requirements.md` |
| Use cases | `docs/groups/use-cases.md` |
| Architecture decisions | `docs/groups/architecture.md` |
| Modules | `docs/groups/modules.md` |
| Tests | `docs/groups/tests.md` |

The SPEC's own section headings stay as they are: they order the document for its readers. The
requirement hierarchy in the browser comes from `docs/groups/requirements.md`, so tidying it up never
sends the SPEC back to review.

## Actors

- **Author** — decides how the product's artifacts are arranged.
- **GitHub** — hosts the product repository (a GitLab server for a GitLab product).

## Precondition

- The product is managed by the instance (UC-001) and has artifacts of the kind to be arranged.
- A token that can write to the product repository is stored in this browser (otherwise 5c).

## Main flow

1. In the specification browser (UC-020), or in the list of use cases, architecture elements,
   modules or tests, the author presses **Arrange**. The list turns into the hierarchy of that kind:
   its groups, nested, with every item under exactly one of them or at the top level.
2. The author shapes the hierarchy:
   - **+ Group** creates a group with a title, inside the selected group or at the top;
   - an item or a group is moved by dragging it, or with **Move to …** (keyboard and screen reader
     reachable);
   - a group is renamed in place.
3. Agent M lists the pending changes beside the tree — *moved UC-007 from "Review" to "Approval"*,
   *new group "Derivation" under "Requirements"* — and keeps each rule of the hierarchy: a group
   holds one kind of artifact, an item has one place.
4. The author presses **Save arrangement** — one click.
5. Agent M checks that the group file of this kind still has the blob SHA it read in step 1, and
   commits the new version to the default branch under the author's own account. The file is
   Markdown: groups as a nested list, each member by its identifier — for requirements, by name. No
   other file is touched — neither the SPEC nor any use-case, architecture, module or test file — so
   every status and every approval stays as it was.
6. The dashboard shows the commit as a link and the new hierarchy.

A folded **What is this?** explains that a group is only a heading: it has no identifier, nothing
realises or tests it, and moving an item never changes the item.

```mermaid
sequenceDiagram
    actor A as Author
    participant D as Dashboard
    participant G as Product repository
    A->>D: Arrange (requirements, use cases, ARC, MOD or TST)
    D->>G: read docs/groups/<kind>.md, note SHA
    D-->>A: hierarchy with every item in one place
    A->>D: create, move, rename groups and items
    D-->>A: list of pending changes
    A->>D: Save arrangement
    D->>G: compare SHA
    D->>G: commit docs/groups/<kind>.md only
    D-->>A: commit link, new hierarchy
```

## Alternative flows

- **1a. The product has no group file of this kind yet.** Every item is shown at the top level; the first
  *Save arrangement* creates the file.
- **1b. The author asks a participant to propose an arrangement** (**Propose groups**). As in UC-019:
  the author chooses a participant, sees what is sent — titles and identifiers of the items, with
  their text for requirements — and presses *Run*. The proposal arrives as a list of pending changes
  in step 3, where the author edits it before saving.
- **2a. The author tries to put an item into a group of another kind** — a use case into a
  requirement group. The move is refused and the reason shown; relations across kinds are
  traceability (UC-009, UC-020), not grouping.
- **2b. The author deletes a group.** Only an empty group can be deleted; otherwise the author first
  moves its content, or chooses *move content up one level*. Grouping never deletes an item.
- **2c. The author renames a group.** Only its title changes; no artifact refers to it, so nothing
  else has to change.
- **3a. The group file names an identifier that no longer exists.** The tree shows it as *unknown
  member*, with the note that it was withdrawn, if it was; the author removes it or leaves it.
- **3b. An item appears in no group** — for example, a use case just written by UC-007. It is shown
  at the top level, marked *not yet placed*.
- **3c. The group file names an item twice.** The tree shows both places and asks the author to
  keep one; nothing is saved until the item has one place.
- **5a. The group file changed since step 1.** Nothing is written. The dashboard
  shows the newer hierarchy with the author's pending changes applied where they still apply, and
  names those that no longer apply; the author saves again.
- **5b. A requirement in the group file is withdrawn by an accepted SPEC change later.** The
  group file is not changed by that acceptance; the tree shows the name as in 3a.
- **5c. No token is stored (GitHub).** *Save arrangement* puts the new group file on the clipboard and opens GitHub's editor at its path, as in UC-018 4a. On a GitLab
  product without a token, there is no save.

## Postcondition

- Every item of the arranged kind has exactly one place in its hierarchy; no identifier, no artifact
  file and no approval status has changed.
- `docs/groups/<kind>.md` holds the new arrangement; the SPEC and every artifact file are
  byte-identical to before.
