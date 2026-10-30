# Module: MOD-job-runner
# Guards: NO REVIEWER IS THE DRAFTER
# Level: component
"""SPEC NO REVIEWER IS THE DRAFTER: a reviewer that is the drafter, or uses its model, is refused before anything is sent;
counter-proof: another participant with another model is accepted, and so is the drafter of a change described in the prompt
bar.

A job of the catalogue's kind derive-architecture, reviewed by one participant of review-architecture, is prepared with
MOD-job-runner's prepareJob — which sends nothing — for one drafter and three reviewers in turn: the drafter itself, another
participant with the drafter's model, and another participant with another model; and once more with the drafter as its own
reviewer and `selfReview` set, as MOD-prompt-bar prepares a change described in the prompt bar. The strategies the kind names come from
modules that do not offer them yet, so stand-ins that give one small part each are registered first; a name a module already
registered keeps its own. Asked through node (tests/jsrun.py).
"""
import unittest

from jsrun import js

PREPARE = """
const standIn = { recipes: { "whole-spec": async () => [{ name: "SPEC.md", text: "the SPEC", sources: [], required: true, size: 0 }],
    "accepted-use-cases": async () => [], "chapters-for-architecture": async () => [] },
  preconditions: { "architecture-ready": async () => null },
  checks: { "document-schema": () => [], "graph-checks": () => [], "candidate-classes": () => [] },
  steps: { "due-diligence": async (draft) => ({ draft, findings: [] }) },
  writers: { "open-files": async () => ({ commits: [], files: [], pullRequest: null, shown: null }) } };
for (const [category, strategies] of Object.entries(standIn)) for (const [name, strategy] of Object.entries(strategies)) {
  try { jobRunner.registerStrategies("tests/test_architecture_review.py", { [category]: { [name]: strategy } }); }
  catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
}
const participant = (name, model) => ({ name, type: "CLI agent", model, context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" });
const drafter = participant("drafter-a", "example-model");
const reviewers = { itself: drafter, sameModel: participant("reviewer-s", "example-model"),
  otherModel: participant("reviewer-c", "other-model") };
const kind = await jobCatalogue.kindOf("derive-architecture");
const context = { kind, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [drafter, ...Object.values(reviewers)],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date(), agentM: { version: "unreleased",
  commit: "0".repeat(40) }, jobId: null };
const out = {};
for (const [which, reviewer] of Object.entries(reviewers)) {
  const job = await jobRunner.prepareJob("derive-architecture", context, { drafter, reviewers: [reviewer] });
  out[which] = job.blocking.map((f) => [f.kind, f.rule, f.what.includes(reviewer.name)]);
}
const own = await jobRunner.prepareJob("derive-architecture", context, { drafter, reviewers: [drafter], selfReview: true });
out.selfReview = own.blocking.map((f) => [f.kind, f.rule, f.what.includes(drafter.name)]);
return out;
"""


class ArchitectureReview(unittest.TestCase):
    # TST-475001 · level: component · module: MOD-job-runner
    # guards: NO REVIEWER IS THE DRAFTER
    # given: a derive-architecture job reviewed by one participant, prepared with prepareJob (sends nothing), for a drafter and three reviewers
    # input: reviewer is the drafter itself; another participant with the drafter's model; another participant with another model
    # expect: the drafter itself and the same-model reviewer each give one blocking error NO REVIEWER IS THE DRAFTER naming the reviewer; the other-model reviewer gives none (counter-proof)
    def test_a_reviewer_that_is_the_drafter_or_uses_its_model_is_refused_before_anything_is_sent(self):
        blocking = js(PREPARE)
        self.assertEqual(blocking["otherModel"], [], "counter-proof: another participant with another model is accepted")
        refused = ["error", "NO REVIEWER IS THE DRAFTER", True]
        self.assertEqual(blocking["itself"], [refused])
        self.assertEqual(blocking["sameModel"], [refused])

    # TST-1320005 · level: component · module: MOD-job-runner
    # guards: NO REVIEWER IS THE DRAFTER
    # given: the derive-architecture job of TST-475001, prepared with prepareJob (sends nothing); known positive: the drafter as its own reviewer without selfReview gives one blocking error
    # input: the drafter as its own one reviewer, with selfReview set, as the prompt bar prepares a change described in it
    # expect: no blocking error (the counter-proof: the drafter of a change described in the prompt bar is accepted)
    def test_the_drafter_of_a_change_described_in_the_prompt_bar_is_accepted_as_its_reviewer(self):
        blocking = js(PREPARE)
        self.assertEqual(blocking["itself"], [["error", "NO REVIEWER IS THE DRAFTER", True]], "known positive")
        self.assertEqual(blocking["selfReview"], [], "the drafter of a change described in the prompt bar is accepted")


if __name__ == "__main__":
    unittest.main()
