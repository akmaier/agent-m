---
id: ITM-1151
title: The cost an endpoint's answer reports is kept in its usage
level: module
realises:
  - NO COST IS GUESSED
modules:
  - MOD-endpoint-calls
builds_on:
  - ITM-1148
tests:
  - unit
origin:
  - developer-sonnet-f's ITM-1148 (pull request #1187), which names it, and po-opus-b's second gate of #1187
---
# ITM-1151 The cost an endpoint's answer reports is kept in its usage

**REGISTER**

## Outcome

MOD-job-runner.md:200-201 defines `Usage` as "`{ inputTokens, outputTokens, minutes, cost: { amount, currency } | null }`:
exactly what a runtime reported; nothing is estimated". MOD-endpoint-calls builds the usage of an answer in `usageOf`
(`src/endpoint-calls/index.mjs:114-119`) and sums an exchange's answers in `addUsage` (`:153-158`). Both set
`cost: null` always. ITM-1148 carries a reported cost from the exchanges to the job's record. So a cost an endpoint
reports in its answer is lost before it gets there.

**First task:** read which of the endpoint kinds MOD-endpoint-calls serves report a cost in their answer, and in what
field and currency. Read the kinds' own documentation, not memory (AGENTS.md §6a). If none does, the item closes with
that reading. If one does, its cost is kept in `usageOf`, and `addUsage` sums it as ITM-1148's `usageOf` sums the tab's:
only when every answer reports one, in one currency.

## Acceptance

- For a kind that reports a cost, a fixture answer with a cost gives it in the usage, and two answers sum it.
  Counter-proof: an answer without a cost leaves `cost` null, and so does a mix.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
