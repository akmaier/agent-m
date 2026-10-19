// The prompt of the kind `converse` states Agent M's rules for what the participant drafts (ITM-1126), as the accepted text of docs/use-cases/UC-049-talk-to-an-agent-in-the-prompt-bar.md (blob 7c5b5c05a5b8ee46140ba571d51aa5c6f09dc5ab, step 3) states them:
// "It adds the system prompt from the repository's single definition: that context, Agent M's rules for what the participant drafts — everything is a proposal; a change of the SPEC is saved as a queue entry —, the chapters of the book *Vibe Coding* for the kind
// of work the page belongs to, and the tools the participant may use". The definition is MOD-job-catalogue's (`kinds/converse/prompt.md`, ONE DEFINITION, THREE DRIVERS).
// Run: node --test tests/job-catalogue-converse-rules.test.mjs
//
// Module: MOD-job-catalogue
// Guards: UC-049; A GENERATED ARTIFACT IS A PROPOSAL; A SPEC EDIT IS SAVED AS A PROPOSAL; ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// The catalogue is read as every caller reads it, through its index.mjs. The readings, named in the pull request: "the rules" are two sentences of the kind's prompt, in English like the rest of it; the test reads the words `proposal` and `queue entry`
// and the sentences that carry them. Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";

// TST-1126001 · level: unit · module: MOD-job-catalogue
// guards: UC-049 main flow (3); A GENERATED ARTIFACT IS A PROPOSAL; A SPEC EDIT IS SAVED AS A PROPOSAL
// given: the catalogue's definition of the kind converse
// input: kindOf("converse")
// expect: its prompt states, in one sentence, that everything the participant drafts — its answer and its edits — is a proposal that a person decides on, and, in another, that a change of the SPEC is saved as a queue entry, not written to the SPEC; the
//         places of its parts ({{page}}, {{conversation}}, {{instruction}}, {{chapters-for-page}}) and the rule that it changes nothing the person's message does not ask for are still there
// Planted fault: leaving the rules out, or stating only one of them, fails the sentence of the other; dropping a place of a part fails the last assertion.
test("the prompt of the kind converse states that everything drafted is a proposal and that a change of the SPEC is a queue entry", async () => {
  const { prompt } = await kindOf("converse");
  const sentences = prompt.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
  const proposal = sentences.find((sentence) => /everything/i.test(sentence) && /proposal/i.test(sentence));
  assert.ok(proposal, "a sentence says that everything drafted is a proposal");
  assert.match(proposal, /draft/i);
  const queued = sentences.find((sentence) => /SPEC/.test(sentence) && /queue entry/i.test(sentence));
  assert.ok(queued, "a sentence says that a change of the SPEC is saved as a queue entry");
  assert.match(queued, /change/i);
  for (const place of ["{{page}}", "{{conversation}}", "{{instruction}}", "{{chapters-for-page}}"]) assert.ok(prompt.includes(place), place);
  assert.match(prompt, /change nothing the person's message does not ask for/);
});
