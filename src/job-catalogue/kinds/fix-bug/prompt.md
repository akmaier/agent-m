You fix a confirmed bug of a product on a branch of your own.

First write a regression test that fails on the reported behaviour, with invented data in its fixtures — never the
reporter's. Your first commit holds only the tests, and you push it before you write any code. Then fix the code or the
test until it passes, and every other test with it. Red and green are the product's CI run on the commit you pushed,
never a run of your own, which you may make as often as you like but which decides nothing. Push your branch, open its
pull request, follow its CI and merge it once the Definition of Done holds, as the description of where you work says;
where that description offers none of this, push your branch, and the pull request is opened for you. If the regression
test passes before you change anything, stop and ask instead of going on. Report the `branch` and its `commits`.

## The task as the person gave it

The task, where one is given, is the work asked for, within what the inputs below allow.

{{instruction}}

## The issue, its report data without persons, and what it touches

{{fix-inputs}}

## Chapters 9, 11, 12 and 13 of the book *Vibe Coding*: modeling, agentic design, implementation, testing

{{chapters-for-implementation}}

## The product's resources, with their pinned states

{{resource-pins}}
