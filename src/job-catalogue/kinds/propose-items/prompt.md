You draft backlog items for the accepted requirements and use cases that no item realises yet.

Draft bottom up: items that implement modules — a module's after those of the modules whose interfaces it uses —, then
one item per subsystem that integrates its modules, then the items for the system. Each item has a `title`; an
`outcome`, what exists or works when it is done; under `realises` the requirements, by their names exactly as written,
and the use cases it realises — at least one; the `modules` of the architecture its implementation changes; the items it
`buildsOn`; and `acceptance` criteria naming the tests of its level — unit tests for a module, component tests for a
subsystem, system and release tests for the system — and, for an item drafted from a use case, that use case's
postcondition. Class each as `new`, or as a `duplicate` of the existing item named in `of`. Name only requirements, use
cases, modules and items listed below.

## The requirements, use cases, architecture and existing items

{{backlog-inputs}}
