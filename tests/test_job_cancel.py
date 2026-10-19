# Module: MOD-job-runner
# Guards: A CANCELLED JOB WRITES NOTHING MORE
# Level: unit
"""SPEC section 6 - the check named tests/test_job_cancel.py, for A CANCELLED JOB WRITES NOTHING MORE.

The cases live in tests/test_job_cancel.md. This file only loads them and asks node to run the real runJob of MOD-job-runner on the catalogue's kind `implement`
(prepared by the real prepareJob) with a fixture drafter and a fixture writer over two fake repositories, the product's and the instance's. The drafter is the
agent of a job: it makes a test commit on the job's branch, waits for the person's cancel or the end of the case, and then makes the implementation commit; the writer
is the kind's `branch-and-pull-request`, which commits the result. A case says when the person cancels (`cancelAt`) and expects the commits of each repository, how
often the writer was called and the failure runJob ended with. The strategies other modules offer the kind are stand-ins that give no part and find nothing.

Written for ITM-1135 by a participant who implemented none of ITM-253, 319, 325, 535, 545, 973 or 1022 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")

# The adapter. `input` is the case's input; the value is what the case may state in `expected`.
WORLD = r"""
const failure = (name, message) => Object.assign(new Error(message), { name });
const product = { commits: [] }, instance = { commits: [] };
let writerCalls = 0;
const stages = { cancelAt: input.cancelAt };
const controller = new AbortController();

const stand = (name) => ({ name, text: `the text of ${name}`, size: 0, sources: [], required: true });
const standIns = {
  preconditions: { "rests-on-accepted": async () => null },
  // A step of the kind that does nothing but let the person cancel while the job is past its last exchange: the cancel arrives after the runner's last look at the signal before the writer.
  steps: { "cancel-here": async (draft) => { if (stages.cancelAt === "during the last step") controller.abort(); return { draft, findings: [] }; } },
  recipes: Object.fromEntries(["implementation-inputs", "chapters-for-implementation", "resource-pins"].map((name) => [name, async () => [stand(name)]])),
  // The kind's writer: the pull request of the job, which it commits to the job's branch.
  writers: { "branch-and-pull-request": async () => { writerCalls += 1; product.commits.push("pull request"); return { commits: ["pull request"], files: [], pullRequest: "7", shown: null, notes: [] }; } },
};
for (const [category, strategies] of Object.entries(standIns)) jobRunner.registerStrategies("tests/test_job_cancel.py", { [category]: strategies });

const DRAFTER = { name: "dev-agent", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests"], place: "this machine", route: "bridge lab-pc agent claude" };
const context = { kind: null, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null }, instance: { snapshot: null, host: null },
  connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null, contents: [] }, gates: [], person: "alice", now: new Date("2026-10-20T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: "JOB-20261020-0800-abcd" };

// The agent of the job, as a driver: its exchange makes the test commit, lets the person act, and goes on to the implementation commit unless the job was cancelled; a driver
// throws a cancel by name (MOD-job-runner, Driver).
const agent = {
  participant: DRAFTER,
  async send(_input, options = {}) {
    const { signal } = options;
    // This driver looks at the signal only while it waits: a job cancelled before it is asked must not reach it, and the runner is what sees to that.
    product.commits.push("tests");
    if (stages.cancelAt === "between the commits") controller.abort();
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (signal?.aborted) throw failure("Cancelled", "the job was cancelled");
    product.commits.push("implementation");
    if (stages.cancelAt === "after the answer") controller.abort();
    return { text: JSON.stringify({ draft: { branch: "job/JOB-20261020-0800-abcd", commits: ["tests", "implementation"], pullRequest: "7" }, answers: [] }), usage: null };
  },
};

if (stages.cancelAt === "before the first exchange") controller.abort();
const base = await jobRunner.prepareJob("implement", context, { drafter: DRAFTER, reviewers: [] });
// The kind implement has no step of its own; the case that cancels during a step gives it this one, and the kind is otherwise the catalogue's.
const prepared = stages.cancelAt === "during the last step" ? { ...base, kind: { ...base.kind, steps: ["cancel-here"] } } : base;
let ended = null;
try {
  await jobRunner.runJob(prepared, { drafter: agent, reviewers: [] }, { attended: false, context, signal: controller.signal });
} catch (error) {
  ended = error.name;
}
return { product: product.commits, instance: instance.commits, writerCalls, ended, branchAt: product.commits.at(-1) ?? null };
"""


def cases(data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", text, re.M | re.S)]
    if not found:
        raise AssertionError("no cases loaded")
    return found


def run_world(argument: dict) -> dict:
    return js(f"const input = {json.dumps(argument)};\n{WORLD}")


class TestJobCancel(unittest.TestCase):
    # TST-1135001 · level: unit · module: MOD-job-runner
    # guards: A CANCELLED JOB WRITES NOTHING MORE
    # given: the cases in the Markdown file beside this one: a job of the kind implement whose agent commits its tests, waits, and commits its implementation; the person cancels at the moment a case names - between the two commits, after the answer, during the kind's last step, before the first exchange - or never
    # input: runJob of the prepared job, nobody attending, with the cancel of the case
    # expect: a job cancelled between its test commit and its implementation commit leaves the branch at the test commit; one cancelled after its answer or during its last step writes nothing more, and one cancelled before its first exchange nothing at all, the writer never called and nothing committed to the instance; the same job, never cancelled, commits both and the writer's result (the counter-proof)
    def test_a_job_cancelled_between_its_commits_leaves_the_branch_at_the_test_commit(self):
        for loaded in cases():
            with self.subTest(case=loaded["name"]):
                got = run_world(loaded["case"]["input"])
                wanted = loaded["case"]["expected"]
                self.assertEqual({key: got.get(key) for key in wanted}, wanted)


if __name__ == "__main__":
    unittest.main()
