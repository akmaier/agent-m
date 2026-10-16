---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 56c188bd446d46a24a3a2907f8254e80761618b5
date: 2026-10-16T05:29:07.715Z
---
## Reason
ITM-489; https://github.com/akmaier/agent-m/pull/546; implementation job JOB-20261016-0507-7379, developer-sol-c (gpt-6.1-sol). Independent Product Owner po-sol (gpt-6.1-sol) authored none of the implementation or tests.

PASS for head 56c188bd446d46a24a3a2907f8254e80761618b5 into sprint/team2/63 at e3336c89915b3f15c35fe776b021c8ac280666cb ONLY, after this canonical record is published unchanged. No default-branch increment merge, release-phase completion, human artifact acceptance or wider UC-049 completion is authorized.

Read the complete final PR body, both commits and every changed file, the item, accepted MOD-agent-processes blob 3cc38860debc805210f3d19a713bc895d5d2d26c, and the applicable SPEC and PO gate rules. First commit 95bf327f821eefbf40b99ec1c5082e9820d7b65d contains only the new owned test file; exact-head CI38854611536 failed at node (2), with nine jobs successful. Final CI38855527409 has ten SUCCESS jobs on this head, longest 59 seconds. Its synthetic merge tests this unchanged sprint base.

All five changed files are in scope:
- src/agent-processes/agents.md: vendor Endpoint settings and unsupported Codex marker in the accepted register.
- src/agent-processes/agents.schema.md: the accepted Endpoint column.
- src/agent-processes/index.mjs: read the column through the existing register parser.
- src/agent-processes/processes.mjs: row-driven endpoint options, name-only credential references, child configuration, and refusal before spawn; omitted/null endpoint retains the old launch.
- tests/agent-processes-endpoint-489.test.mjs: owned unit declarations TST-489001/002/003 and production counter-proofs.
Existing unit320, unit321 and release320321 blobs are identical to the sprint base. No production outside this module, workflow, helper, architecture, SPEC or UC changes.

Call/data path: public agentDriver -> processDriver.send -> endpointOptions -> row-defined argv/environment -> started -> controlled agent. TST-489002 verifies the endpoint address/model/provider and {env:ITM489_FIXTURE_KEY}, one complete task, working folder and inherited constructed key, with no key value in options. TST-489003 starts the same fixture with endpoint omitted, then requires EndpointUnsupported and no additional process. Unsupported Codex/unknown kinds take the same configuration refusal before spawn. The module never reads or passes the credential value; the child and documented vendor configuration resolve the named environment input.

Personally decoded all three records from CI node (2), job116825997609, and read complete failed/restored TAP:
- TST-489001: production Claude Endpoint changed to unsupported dash; assertion line80 fails undefined versus string; exact restore passes.
- TST-489002: production baseUrl changed to wrong.fixture.invalid; both OpenAI-compatible and Anthropic subcases fail the endpoint assertion at line105 after actually starting the controlled executable; exact restore passes both.
- TST-489003: production extra spawn planted before refusal; EndpointUnsupported still occurs but assertion line143 fails 2 != 1; exact restore passes with one spawn.
These are test-body ERR_ASSERTION failures, not import/launcher failures. Each fault is unique and relevant. All source/test Git blobs and SHA-256 match the exact reviewed head; input hashes, fault hashes, ordered timestamps, byte-exact restoration and unchanged tests were independently checked. Every sequence has status1 -> restoration -> status0, no signal or launcher error. Executor: Node22.23.3 linux/x64, binary SHA-256 fde6a4bf8d0562f7751d1a2d6cb9b417c4cfe107bbcb0aa3e9a24e125e348f48.

Server evidence: https://github.com/akmaier/agent-m/actions/runs/38855527409/job/116825997609 . Full decoded receipt handoff /private/tmp/agent-m-itm489-job7379-counterproofs.json has SHA-256 edd9e49b0b8642ba1f6800c9a0de8a51de0fcc0436cdaa403e3ea0724c87da12.

Official vendor sources checked: Claude inline settings, apiKeyHelper and Anthropic routing at https://code.claude.com/docs/en/settings, https://code.claude.com/docs/en/authentication and https://code.claude.com/docs/en/llm-gateway-protocol; OpenCode inline config, environment references and provider configuration at https://opencode.ai/docs/config/ and https://opencode.ai/docs/providers/; Codex Responses-only wire protocol at https://learn.chatgpt.com/docs/config-file/config-reference. No unimplemented protocol translation or paid/live vendor execution is claimed.

No blocking condition found for this bounded Development -> Release testing gate. Changed head or target requires rechecking; no new process, Definition of Done or release-test obligation is introduced.
