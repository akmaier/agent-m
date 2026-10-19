---
id: ITM-1102
title: An issue names when it was opened and closed, so that a sprint's facts find every issue of its time box
level: module
realises:
  - UC-041
modules:
  - MOD-repository-hosts
  - MOD-work-plans
builds_on:
  - ITM-618
tests:
  - unit
origin:
  - the gate of #1129 (ITM-618), sprint team2/97, on main at c2b96957
---
# ITM-1102 An issue names when it was opened and closed, so that a sprint's facts find every issue of its time box

**REGISTER**

## Outcome

MOD-work-plans' recipe `sprint-facts` gives "the product's issues opened or closed during the sprint". MOD-repository-hosts'
`Issue` (MOD-repository-hosts.md:138-139) has no date of its opening or closing. So ITM-618 reads an issue as the sprint's
when one of its comments is dated within the time box, and misses an issue opened and closed without a comment.

## Not ready: a draft for akmaier

The draft gives `Issue` the dates `opened` and `closed` (null while open), which both servers report. `sprint-facts` then
takes the issues whose dates fall within the time box.

## Acceptance

- Once the draft is accepted: an issue opened and closed within the sprint without a comment is among its facts; one
  opened before and still open is not. Each over the two adapters' fixtures.
