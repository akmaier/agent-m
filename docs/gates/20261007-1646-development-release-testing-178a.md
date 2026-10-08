---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 37f9c190e76b738c741ca712cf02e674cafd25db
  - https://github.com/akmaier/agent-m/pull/178
date: 2026-10-07 16:46 UTC
---
# Development → Release testing: ITM-260 The short endpoint test and its diagnosis

**REGISTER**

## Reason

Read original ITM-260, UC-003 and its named requirements, accepted MOD-endpoint-calls, full PR commits/diff,
all source and tests, and the current live PR body and checks. Developer-terra-c authored the implementation;
po-sol authored none of it. Team 2's process_team2.md/participants_team2.md resolve the roles.

- First commit 290c0288df8766d527884b56f340bd0c011f85c5 contains only the new tests. Actual CI
  run37646507471 completed failure; the new module import fails with ERR_MODULE_NOT_FOUND before implementation.
- Exact final head has node112903422376 and python112903422132 completed SUCCESS in run37653731650.
  Approved between-job network-check baseline #180 is inherited, rather than altering an existing check in this item.
- Item diff changes only src/endpoint-calls/index.mjs and new tests/endpoint-calls.test.mjs. The module supplies
  EndpointConfig, Diagnosis, testEndpoint and diagnoseEndpoint. One invocation makes one configured-endpoint request,
  asks for one word, returns works/model on success, and never retries, writes storage or writes a repository.
- OpenAI-compatible and Anthropic formats place optional credentials only in their provider's authorisation header.
  Current official OpenAI Chat API and Anthropic Messages API references verify POST paths and bodies; Anthropic's
  official TypeScript SDK client also verifies the direct-browser opt-in header and version. References checked on
  2026-10-07: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create,
  https://platform.claude.com/docs/en/api/messages/create,
  https://raw.githubusercontent.com/anthropics/anthropic-sdk-typescript/main/src/client.ts.
- Constructed responses cover both kinds, key present/absent, success, refused key, unknown model, rate limit,
  other provider error and network failure. Provider/browser wording is preserved. Observable cross-origin and
  opt-in errors name their reason and offer CI/Bridge; opaque browser failures remain generic and offer those routes.
- All ten new tests name their module, guards, level and individual precondition/input/result. The current PR body
  records ten separately run planted-fault results: cases 001/002 detect a changed one-word prompt; cases 003–007
  and 010 detect replaced provider/network/browser wording; 008/009 detect changed observable browser diagnosis.
  Each named case has its actual failing assertion output recorded, with restoration before commit and 10/10 restored.
  Tests use constructed responses and make no paid calls; existing test expectations are unchanged.

Acceptance holds as far as reading the code, tests, evidence and green CI shows. This decides only the short direct
endpoint test and diagnosis; endpointDriver, jobs, correction loops, endpoint UI wiring and runnable Bridge composition
remain outside this item. Full UC-003 delivery and Sprint 09 closure are not claimed.

Decision: merge exact head 37f9c190e76b738c741ca712cf02e674cafd25db into sprint/09, po-sol (Product Owner).
scrum-master-session alone performs the merge. Sprint 09 remains open.
