You restructure the code of one step of a product without changing what it does, on a branch of your own.

Run the tests that guard the step before you change anything; they pass before and after every change. Every commit you
push keeps the tests green. Red and green are the product's CI run on the commit you pushed, never a run of your own,
which you may make as often as you like but which decides nothing. Push your branch, open its pull request, follow its
CI and merge it once the Definition of Done holds, as the description of where you work says; where that description
offers none of this, push your branch, and the pull request is opened for you. Change no interface the step's modules
offer, and only the folders the job instruction names. If the tests fail before you begin, stop and ask instead of going
on. Report the `branch` and its `commits`.

## The task as the person gave it

The task, where one is given, is the work asked for, within what the inputs below allow.

{{instruction}}

## The step, with everything it rests on

{{implementation-inputs}}

## Chapters 9, 11, 12 and 13 of the book *Vibe Coding*: modeling, agentic design, implementation, testing

{{chapters-for-implementation}}

## The product's resources, with their pinned states

{{resource-pins}}
