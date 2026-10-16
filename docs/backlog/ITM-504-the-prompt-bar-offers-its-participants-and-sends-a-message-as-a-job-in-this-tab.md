---
id: ITM-504
title: The prompt bar offers its participants and sends a message as a job in this tab
level: module
realises:
  - UC-049
  - UC-019
  - THE PAGE NAMES WHERE IT SENDS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - NO SERVER
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-482
  - ITM-483
  - ITM-484
  - ITM-485
  - ITM-493
  - ITM-503
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-prompt-bar, Parts: bar.mjs, offer.mjs, send.mjs; Interfaces: Subject, Message, ConversationDraft, startPromptBar, latestDraft, currentJob
---
# ITM-504 The prompt bar offers its participants and sends a message as a job in this tab

**REGISTER**

## Outcome

`startPromptBar` draws the bar: it offers the participants its module file names, each with its processing place —
none drawn without one (UC-049 1a), a subagent never offered (1b) —; holds the conversation in the tab; on *Send* asks the
subject for the kind and parameters, adds `instruction`, `conversation` and the subject's `entry` as `entry`, prepares the job with `prepareJob` in a
`tabContext`, sends nothing while it does not fit or a finding keeps it, names every destination before it sends, appends
to the conversation record first where recording is on, runs the job with `runOnTab` without a record, and shows the
answer — for a draft, *Review the draft*, which keeps the `ConversationDraft` and goes to the subject's draft route;
*Stop* aborts it. `latestDraft` and `currentJob` give the draft and the running message. A hand-over is ITM-505.

It builds against MOD-prompt-bar's file as accepted at `4345829a`. There, the bar also passes the subject's `refuses`
as `refuses`, and makes each Bridge with `settingsOf` and then `bridgeAt`.

What the module file leaves unstated, and what is built:
- **The participants.** The instance's `docs/participants.md`, read through the instance's host with `participantSchema`,
  `readRegister` and `participantsOf`.
- **Which participants are offered.** A model endpoint, a CLI agent or a sandboxed agent for which `reachedThrough` is
  `null`, and whose route this browser reaches:
  - an endpoint `endpoint <name>` whose setting `endpoint:<name>` the store keeps — and, where that setting names a
    Bridge, whose `bridge:<bridge>` the store keeps;
  - an agent `bridge <bridge> agent <agent>` whose `bridge:<bridge>` the store keeps.
- **The connections handed to `runOnTab`.** They are built as the review pages build them
  (`src/review-pages/jobs.mjs`, `connectionsOf`):
  - an endpoint's configuration `{ name, kind, baseUrl: url, model, key }` and its `bridge` from its setting;
  - each Bridge as `bridgeAt(settingsOf({ name, ...stored }, readSetting(store, "jump-host")))`.
- **The context.** `tabContext` with:
  - the product of `setup.product()`, or the instance when it gives `null`;
  - `places` `{ sources: {}, mailbox: null, contents: [] }`, `gates` `[]` and `jobId` `null`;
  - `person` the name of the token the store keeps for the page's repository, `null` without one;
  - `agentM` `{ version, commit }`, both the instance snapshot's commit, as the review pages give it.
- **What the tab keeps.** The conversation under the tab value `prompt-bar:conversation`, a list of `Message`s. The
  latest draft under `prompt-bar:draft`. `latestDraft(store, subject)` gives that draft when its `subject` is the one
  asked for, and `null` otherwise.
- **The answer shown.** The text through `renderArtifact`, the number of rounds, and each finding the loop left in
  MOD-text-tools' form. For a draft, a button *Review the draft* that keeps it and calls `go` with the subject's
  `draftRoute`.
- **What waits for ITM-505.** A hand-over the participant proposes is shown with its kind, what it works on and its task,
  without *Hand over*.

No existing test's expected result changes, release tests included. The tests of MOD-prompt-bar (ITM-503's record and
switch) read `record.mjs`, which this item does not change. `tests/test_no_backend.py` permits MOD-prompt-bar one channel
for its own data files, and the bar reaches the network only through the hosts and the Bridge client.

## Acceptance

- In a small DOM with fixture participants, store and host: the selector, *Send*, a refused send naming why, the
  destinations named, the answer shown, a draft kept and led to its route, *Stop*, and the record appended only with
  recording on.
- With recording off, no request writes anything; a counter-proof plants a write and the test sees it.
