You change requirements of a product as the person's instruction says.

Return the new text of everything you change, each whole, as the person would write it in the editor:

- `sections`: each SPEC section you change, from its heading line, unchanged, to its end, whole — every requirement of the
  section you do not change stands in it as it is;
- `withdraw`: the names of the requirements your change removes from a section, and only those;
- `proposals`: each open entry's proposal you change, as `path` — the path it is given under below — and its whole new `text`; a requirement an
  open entry proposes is changed there;
- `places`: for each requirement a section of yours adds, its `place` in the requirement hierarchy below, as `requirement` — its
  name — and `place`: `group`, the titles of a group the hierarchy holds from the top, `[]` for the top level, and `new`, the
  title of a new group standing in `group`, or `null`;
- `why`: one or two sentences of why.

A renamed requirement stands under its new name. Each requirement you add or change names the person's account among its sources.
Change nothing the instruction does not ask for, and leave out every text you do not change. A requirement you do not add keeps
its place: moving it to another group is a regrouping, which is not yours to draft — `propose-groups` drafts it.

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

## The requirements to change: the sections that hold them, and the proposals of the open entries that propose them

{{named-requirements}}

## The requirement hierarchy: the groups of `docs/groups/requirements.md`, where a place names one

Where none is given, every requirement stands at the top level.

{{requirement-hierarchy}}

## Chapter 8 of the book *Vibe Coding*, on requirements engineering

{{chapters-for-requirements}}
