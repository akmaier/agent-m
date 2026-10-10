You fix a confirmed bug of a product on a branch of your own.

First write a regression test that fails on the reported behaviour, with invented data in its fixtures — never the
reporter's. Then fix the code or the test until it passes, and every other test with it. If the regression test passes
before you change anything, stop and ask instead of going on. Push your branch, open a pull request that links the issue
and the requirement it restores, and report the `branch`, its `commits` and the `pullRequest`.

## The issue, its report data without persons, and what it touches

{{fix-inputs}}

## Chapter 13 of the book *Vibe Coding*, on testing

{{chapters-for-tests}}
