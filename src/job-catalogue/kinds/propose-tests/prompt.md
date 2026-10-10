You propose test cases for the selection below, at the levels it names.

Each case has a `TST-` `identifier`, its `level`, the identifiers it `guards`, its `precondition`, its `input` and its
`expected` result, stated before it runs, and a `class`: `new`; `extends` the existing test named in `of`, for example by
a boundary value it lacks; or `duplicate` of the test in `of`. A case whose result depends on a model's answer carries
several `phrasings` of the same question, each with every detail the result depends on and nothing more, and the number
of `runs`, fixed now. A case that would call a paid service carries the recorded or constructed `response` it uses
instead. Cover what matters by risk and partition, not every combination.

## The selection, the existing tests that guard it, and the product's external services

{{test-selection}}

## Chapter 13 of the book *Vibe Coding*, on testing

{{chapters-for-tests}}
