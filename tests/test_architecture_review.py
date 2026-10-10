# Module: MOD-job-runner
# Guards: NO REVIEWER IS THE DRAFTER
# Level: component
"""SPEC NO REVIEWER IS THE DRAFTER: a reviewer that is the drafter, or uses its model, is refused before anything is sent;
counter-proof: another participant with another model is accepted.

A job of the catalogue's kind derive-architecture, reviewed by one participant of review-architecture, is prepared with
MOD-job-runner's prepareJob — which sends nothing — for one drafter and three reviewers in turn: the drafter itself, another
participant with the drafter's model, and another participant with another model. The strategies the kind names come from
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
return out;
"""


class ArchitectureReview(unittest.TestCase):
    def test_a_reviewer_that_is_the_drafter_or_uses_its_model_is_refused_before_anything_is_sent(self):
        blocking = js(PREPARE)
        self.assertEqual(blocking["otherModel"], [], "counter-proof: another participant with another model is accepted")
        refused = ["error", "NO REVIEWER IS THE DRAFTER", True]
        self.assertEqual(blocking["itself"], [refused])
        self.assertEqual(blocking["sameModel"], [refused])


if __name__ == "__main__":
    unittest.main()
