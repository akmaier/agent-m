---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - f275401075b675fce28bf0404a074f884a35f206
  - https://github.com/akmaier/agent-m/pull/1212
date: 2026-10-20 13:31 UTC
---
# Development → Release testing: ITM-1129, rejected — a hand-over from a draft writes the participant's answer into its job record

**REGISTER**

## Reason

ITM-1129 (MOD-prompt-bar), pull request #1212 into `sprint/team1/98`, is rejected on `f2754010`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-d`.
- **The red,** run 39429976960 on `efe45241`: exactly TST-1129001 and TST-1129002.
- CI passes 23 of 23 checks on the head (run 39430472616).
- The code does what the accepted text at MOD-prompt-bar.md:200-203 says: for the subject's own kind, the hand-over's
  job takes the parameters the subject's `paramsFor` gives.

**What fails: `A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON`** (SPEC.md:1762-1764). The data
path:
- `src/prompt-bar/bar.mjs` (`proposeHandOver`): `given = handOver.kind === subject.kind ? subject.paramsFor(participant)
  : {}`.
- `src/prompt-bar/hand-over.mjs` (`queue`): `params = { ...given, ...paramsOf(worksOn, …) }`, handed to `prepareJob`
  and to the job's record.
- `src/job-ledger/index.mjs:169-170, :260` writes every parameter into the record's `## Parameters`.
- On the route `draft`, the subject's `paramsFor` is `{ ...draft.params, draft: draft.result }`
  (`src/review-pages/conversation-draft.mjs:135`). `draft.result` is the participant's answer in the conversation.
- So a hand-over of the draft's own kind, proposed on that page with recording off, writes the participant's answer into
  a job record of the repository. On the frame's default subject, `page`, the text the page shows, goes there as well
  (`src/site-frame/subject.mjs:30-34`).

The accepted text causes this. Its way (a), "the parameters the subject's `paramsFor` gives", came from the Product
Owner's ruling (`docs/backlog/sprints/team1/97.md`) and gives the job more than the source it needs. That is the Product
Owner's error, not the implementer's.

**What passes on the next head.**
- The item needs a draft that corrects MOD-prompt-bar.md:200-203. For the subject's own kind, the hand-over's job takes
  only the `source` that the subject's `paramsFor` gives, beside what the hand-over works on.
  - *KISS:* the source is what the job lacked.
  - No message and no page text travel.
- developer-sonnet-d writes it. The item waits for its acceptance.
- The next head then takes only `source`. A test shows that a hand-over from the draft route writes no `draft` and no
  `page` into the record, with a counter-proof.
