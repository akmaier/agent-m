// The kind `draft-replies` drafts a question to a reporter (ITM-1026) — MOD-job-catalogue.md:107 (blob ae7763b761da): "`draft-replies` | UC-039 | draft text | | `reply-inputs` | ... | one reply per mail of a closed issue; or, with the parameter `question` —
// the person's point to ask —, one question to the reporter of a listed mail of an open issue (UC-039 1a)". A kind's definition has no key for a job's parameter, so the parameter is read from the kind's purpose, its one free text (as tests/job-catalogue-kinds-data.test.mjs
// reads `source`).
// Run: node --test tests/job-catalogue-draft-question.test.mjs
//
// Module: MOD-job-catalogue
// Guards: UC-039; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";

// TST-1026001 · level: unit · module: MOD-job-catalogue
// guards: UC-039 (1a)
// given: the kind draft-replies as its definition file gives it, and the kind propose-issues beside it
// input: kindOf of each
// expect: the purpose of draft-replies names the parameter `question` as the person's point to ask, one question to the reporter of a listed mail of an open issue, and still one reply per mail of a closed issue; the other kind's purpose names no such parameter;
//         the kind still needs "draft text", names the recipe reply-inputs and the writer mail-drafts, and sends nothing
test("the purpose of draft-replies names the parameter question, the person's point to ask, for an open issue", async () => {
  const kind = await kindOf("draft-replies");
  assert.match(kind.purpose, /parameter `question`/);
  assert.match(kind.purpose, /person's point to ask/);
  assert.match(kind.purpose, /open issue/);
  assert.match(kind.purpose, /reply per mail/);
  assert.match(kind.purpose, /closed issue/);
  assert.deepEqual([kind.needs, kind.recipes.map((recipe) => recipe.name), kind.writer], [["draft text"], ["reply-inputs"], "mail-drafts"]);
  assert.doesNotMatch((await kindOf("propose-issues")).purpose, /parameter `question`/);
});
