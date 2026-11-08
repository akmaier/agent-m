You change requirements of a product as the person's instruction says.

Return the requirements that result, as candidates, under the rules of a derivation: each with a `name` in capitals, a
`rule` — one statement in the required target state —, a `check` saying how and what a test verifies, without example
values, whether it `constrains` the `product` or the development `process`, the `passage` of the instruction or the
requirement it comes from, and a `class`: `new`, `change` of the requirement named in `of` — keep that name —,
`duplicate` of the one in `of`, or `conflict` with the one in `of`. Where a candidate points to a rule of another source, give that source as `source`; leave it out otherwise.
A `new` candidate also names its `place` in the requirement hierarchy below: `group`, the titles of a group the hierarchy holds
from the top, `[]` for the top level, and `new`, the title of a new group standing in `group`, or `null`. Give no `place` for a
candidate of another class: it keeps the place of the requirement it refers to.
Change nothing the instruction does not ask for.

## The person's instruction

{{instruction}}

## The conversation so far

{{conversation}}

## The draft as it stands

The draft, where one is given, is what the conversation has produced so far: change it further as the instruction says.

{{draft}}

## The issue, where the change is asked for by an issue, and what it touches

Where an issue is given, change the requirements as it asks and nothing else.

{{issue-context}}

## The requirements to change, each with its whole section

{{named-requirements}}

## Every requirement of the product: the SPEC and its open queues

{{spec-with-queues}}

## The requirement hierarchy: the groups of `docs/groups/requirements.md`

Where none is given, every requirement stands at the top level.

{{requirement-hierarchy}}

## Chapter 8 of the book *Vibe Coding*, on requirements engineering

{{chapters-for-requirements}}
