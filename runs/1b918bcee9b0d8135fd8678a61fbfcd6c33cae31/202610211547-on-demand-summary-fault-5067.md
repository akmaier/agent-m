---
commit: 1b918bcee9b0d8135fd8678a61fbfcd6c33cae31
levels:
  - system
occasion: on-demand
participant: developer-terra-b
date: 2026-10-21 15:47 UTC
uncommitted: true
---
## Outcomes

| Test | Level | Outcome | Runs |
|---|---|---|---|
| TST-922001 | system | failed | |

## Failures

| Test | Expected | Observed | Log |
|---|---|---|---|
| TST-922001 | the bounded Frame menu, accepted badge and explanation summary findings are absent | #use-case/id=UC-002/edit=1 at a phone's width violates + actual - expected + [ + 'target-size (1: summary)' + ] - [] | Recording time 2026-10-21 15:47 UTC; execution start/end boundaries were not retained. Uncommitted temporary source fault: changed Frame explanation summary min-height from 24px to 0. Raw retained JUnit: /private/tmp/itm922-summary-fault.junit.xml. [Error [ERR_TEST_FAILURE]: #use-case/id=UC-002/edit=1 at a phone's width violates + actual - expected + [ + 'target-size (1: summary)' + ] - [] ] { code: 'ERR_TEST_FAILURE', failureType: 'testCodeFailure', cause: AssertionError [ERR_ASSERTION]: #use-case/id=UC-002/edit=1 at a phone's width violates + actual - expected + [ + 'target-size (1: summary)' + ] - [] at TestContext.<anonymous> (file:///Users/maier/Documents/code/software-processes/products/agent-m/.agent/worktrees/agent-team1-106-terra-b/tests/site-accessibility.test.mjs:154:14) at Test.runInAsyncScope (node:async_hooks:226:14) at Test.run (node:internal/test_runner/test:1201:25) at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) { generatedMessage: false, code: 'ERR_ASSERTION', actual: [ 'target-size (1: summary)' ], expected: [], operator: 'deepStrictEqual', diff: 'simple' } } |
