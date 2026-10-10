# Module: MOD-job-runner
# Guards: A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING; A TEST JOB RECEIVES THE CHAPTER ON TESTING;
#         AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION; AN IMPLEMENTATION
#         JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
# Level: component
"""SPEC: a job receives the chapters of the book *Vibe Coding* for its work, in full.

Builds the input of each kind of job from its job definition and compares it with the book's chapter files. For every kind
of MOD-job-catalogue, MOD-job-runner's prepareJob — which sends nothing — builds the parts of its input from the kind's
recipes: the four chapter recipes MOD-source-register offers, reading this instance's register entry SRC-vibe-coding, and,
for every other strategy a kind names, a stand-in that gives no part. Each part that carries
SRC-vibe-coding is compared, by its SHA-256, with the chapter file of the entry's newest version it names.

The kinds of each work, as their purposes in the catalogue state them: on requirements or use cases derive-requirements,
change-requirements, derive-use-cases and change-use-case; on tests propose-tests, write-tests, and fix-bug, which writes a
regression test before it fixes anything; on the architecture derive-architecture, change-architecture and
review-architecture; implementation implement. Asked through node (tests/jsrun.py).
"""
import hashlib
import json
import re
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parent.parent
ENTRY = ROOT / "docs" / "sources" / "SRC-vibe-coding.md"

WORK = {
    "requirements or use cases": (["derive-requirements", "change-requirements", "derive-use-cases", "change-use-case"], [8]),
    "tests": (["propose-tests", "write-tests", "fix-bug"], [13]),
    "the architecture": (["derive-architecture", "change-architecture", "review-architecture"], [9, 10, 11, 12]),
    "implementation": (["implement"], [9, 11, 12, 13]),
}

BUILD = """
const fs = process.getBuiltinModule("node:fs");
const root = %s;
const read = async (path) => { try { return fs.readFileSync(root + path, "utf8"); } catch { return null; } };
const snapshot = { repository: { server: "github", origin: "https://github.com", path: "akmaier/agent-m",
  web: "https://github.com/akmaier/agent-m" }, ref: "main", commit: null, paths: [], read, blob: () => null };
jobRunner.registerStrategies("MOD-source-register", { recipes: Object.fromEntries(
  Object.entries(sourceRegister.sourceStrategies.recipes).filter(([name]) => name.startsWith("chapters-for-"))) });
const empty = { recipes: async () => [], preconditions: async () => null, checks: () => [],
  steps: async (draft) => ({ draft, findings: [] }), writers: async () => ({ commits: [], files: [], pullRequest: null, shown: null }) };
const named = (kind) => ({ preconditions: kind.preconditions, recipes: kind.recipes.map((recipe) => recipe.name),
  checks: kind.checks, steps: kind.steps, writers: [kind.writer] });
const names = await jobCatalogue.kindNames();
for (const name of names) {
  const kind = await jobCatalogue.kindOf(name);
  for (const [category, list] of Object.entries(named(kind))) for (const strategy of list) {
    try { jobRunner.registerStrategies("tests/test_job_reading.py", { [category]: { [strategy]: empty[category] } }); }
    catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
  }
}
const drafter = { name: "reader", type: "CLI agent", model: "a-model", context: 10000000, price: null,
  capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"], place: "this machine", route: "bridge lab-pc agent claude" };
const out = {};
for (const name of names) {
  const kind = await jobCatalogue.kindOf(name);
  const context = { kind, params: {}, product: { address: "https://github.com/akmaier/agent-m", snapshot, host: null },
    instance: { snapshot, host: null }, connect: async () => null, participants: [drafter],
    places: { sources: {}, mailbox: null }, gates: [], person: null, now: new Date(),
    agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null };
  const job = await jobRunner.prepareJob(name, context, { drafter: kind.participant === "one" ? drafter : null, reviewers: [] });
  out[name] = await Promise.all(job.parts.filter((part) => part.sources.includes("SRC-vibe-coding")).map(async (part) =>
    [part.name, await textTools.sha256(part.text)]));
}
return out;
"""


def newest_version_files():
    """The chapter files of the newest version of SRC-vibe-coding: the last row of its ## Versions, its folder."""
    rows = re.findall(r"^\| `([^`]+)` \| \d{4}-\d{2}-\d{2} \|", ENTRY.read_text(encoding="utf-8"), re.MULTILINE)
    folder = ENTRY.parent / "SRC-vibe-coding" / rows[-1]
    return {int(f.name[:2]): f for f in sorted(folder.iterdir()) if re.match(r"\d\d_", f.name)}


class JobReading(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parts = js(BUILD % json.dumps(str(ROOT) + "/"))
        cls.chapters = newest_version_files()

    def received(self, kind):
        """{ chapter number: SHA-256 } of the chapter parts the kind's input holds, by the file each part names."""
        found = {}
        for name, digest in self.parts[kind]:
            numbers = [n for n, f in self.chapters.items() if f.name in name]
            self.assertEqual(len(numbers), 1, f"{kind}: the part {name} names one chapter file")
            found[numbers[0]] = digest
        return found

    def check(self, work):
        kinds, chapters = WORK[work]
        for kind in kinds:
            with self.subTest(kind):
                received = self.received(kind)
                for chapter in chapters:
                    expected = hashlib.sha256(self.chapters[chapter].read_bytes()).hexdigest()
                    self.assertEqual(received.get(chapter), expected, f"{kind} receives chapter {chapter} complete")

    def test_known_positive_every_kind_is_built_and_the_book_has_its_chapters(self):
        self.assertGreater(len(self.parts), 20)
        self.assertTrue({8, 9, 10, 11, 12, 13} <= set(self.chapters))

    def test_a_job_on_requirements_or_use_cases_receives_chapter_8_complete(self):
        self.check("requirements or use cases")

    def test_a_job_on_tests_receives_chapter_13_complete(self):
        self.check("tests")

    def test_a_job_on_the_architecture_receives_chapters_9_to_12_complete(self):
        self.check("the architecture")

    def test_an_implementation_job_receives_chapters_9_11_12_and_13_complete(self):
        self.check("implementation")


if __name__ == "__main__":
    unittest.main()
