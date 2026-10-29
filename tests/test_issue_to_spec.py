# Module: MOD-issue-handling
# Guards: UC-012; EVOLUTION ENTERS THROUGH THE SPECIFICATION
# Level: release
"""SPEC section 14 - the check named tests/test_issue_to_spec.py, for the requirement EVOLUTION ENTERS THROUGH THE SPECIFICATION.

The cases live in tests/test_issue_to_spec.md. This file only loads them and asks node to open the real page of an issue (route `issue` of
MOD-maintenance-pages, over MOD-issue-handling, MOD-job-runner, MOD-spec-changes and MOD-repository-hosts) in the world of
tests/maintenance-pages-world.mjs: a fake GitHub holding the issues of the product alice/product and taking the git commits made to it, and a fake
model endpoint that answers with the candidates of the case. A case's steps are the person's clicks (`class`: the class of the issue; `draft`: a
participant, a name, Run, Save). The check then states what the product's repository holds and what the page offers: the writes made to the issue, the
paths committed to the product, the files of a queue and the issue it names, the kinds of the jobs that were started, and which sections of the page
are shown. A path committed outside docs/ is code or a test; a fault planted in the code the check reads (a draft written outside the queue, a Fix
offered for a change) is found by these needles.

Written for ITM-1152 by a participant who built none of the behaviour it checks (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
FIRST = "EVOLUTION ENTERS THROUGH THE SPECIFICATION - a change is written as a queue naming the issue"
SECOND = "EVOLUTION ENTERS THROUGH THE SPECIFICATION - the code is not changed by a change"

# The adapter. `input`: `issues` (the number and the labels of each issue of the product), `issue` (the number of the page opened), `steps` (`class`: a click on
# Change or Bug; `draft`: the participant drafts the change and the person saves it), `candidates` (what the participant answers). The value is what the case may state:
# `labels` (the labels of the issue at the end), `state` (its state), `issueWrites` (the writes made to the issue, sorted), `committed` (the paths committed to the product,
# sorted), `outsideDocs` (those that do not lie under docs/), `queueNames` (what each queue index under docs/spec-freigaben/ names as its issue), `queueHolds` (each of the
# case's `needles`: whether an entry of a queue holds it), `jobKinds` (the kind of each job record committed), `changeSection` and `fixSection` (whether the page shows the section that drafts the change
# and the one that fixes a bug).
WORLD = r"""
const url = (path) => `file://${ROOT}/${path}`;
await import(url("tests/site-frame-dom.mjs"));
const harness = await import(url("tests/main-page-home-harness.mjs"));
const worldOf = await import(url("tests/maintenance-pages-world.mjs"));
const hosts = await import(url("src/repository-hosts/index.mjs"));
const runner = await import(url("src/job-runner/index.mjs"));
const { byClass, one, buttonsOf, textOf, waitFor, flush, trusted, routeNamed, pages, restoreWorld } = worldOf;
for (const [at, strategies] of (pages.view?.strategies ?? []).entries()) {
  try { runner.registerStrategies(`tests/test_issue_to_spec.py#${at}`, strategies); } catch { /* registered by the page's own view */ }
}
const { readFileSync, readdirSync } = await import("node:fs");

const PRODUCT_TOKEN = "github_pat_HOME827PRODUCT0123456789abcdefg";
const ISSUE_BODY = "FIRST RULE says nothing about page counts: the export is cut off after the second page.";
const lines = (...rows) => `${rows.join("\n")}\n`;
const SOURCE = "SRC-alice";
const LINKS = lines("# Requirement sources of the product", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${SOURCE} | 2026-10-13 | ${"0".repeat(64)} | prompt |`);
const PERSON_SOURCE = lines("---", `id: ${SOURCE}`, "title: Alice", "kind: person", "identifier: github.com/alice", "authority: informative", "licence: may be republished - fixture", "---", `# ${SOURCE} Alice`, "",
  "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
const BOOK_FOLDER = "docs/sources/SRC-vibe-coding/2026-10-05/";
const onDisk = (path) => readFileSync(`${ROOT}/${path}`, "utf8");
const BOOK = { "docs/sources/SRC-vibe-coding.md": onDisk("docs/sources/SRC-vibe-coding.md"),
  ...Object.fromEntries(readdirSync(`${ROOT}/${BOOK_FOLDER}`).map((name) => [BOOK_FOLDER + name, onDisk(BOOK_FOLDER + name)])) };

const issues = input.issues.map(({ number, labels }) => ({ number, title: `Export loses pages ${number}`, body: ISSUE_BODY, state: "open", labels, comments: [] }));
const w = worldOf.world({ mails: [], issues, answer: () => ({ draft: { candidates: input.candidates }, answers: [] }),
  product: { "docs/sources.md": LINKS }, instance: { ...BOOK, [`docs/sources/${SOURCE}.md`]: PERSON_SOURCE } });
w.context.product = { address: harness.PRODUCT_URL, kind: "github", host: hosts.connect(hosts.parseAddress(harness.PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };

const detail = await harness.draw(routeNamed("issue"), w.context, { number: String(input.issue) });
await waitFor(() => byClass(detail, "issue-analysis").length > 0);
const shown = (name) => byClass(detail, name)[0];

for (const step of input.steps) {
  if (step.class) {
    await trusted(byClass(detail, "set-class").find((node) => node.getAttribute("data-class") === step.class));
    await waitFor(() => byClass(detail, "issue-classified").length > 0);
  } else if (step.draft) {
    const change = shown("issue-change");
    const radio = byClass(change, "change-participant").find((each) => each.value === "local-llm");
    radio.checked = true;
    one(change, "change-person").value = "Reviewer Rae";
    radio.dispatchEvent(new Event("change"));
    await waitFor(() => byClass(change, "run-panel").length > 0 || byClass(change, "issue-problem").length > 0);
    await trusted(buttonsOf(one(change, "run-panel"), "Run")[0]);
    await waitFor(() => byClass(change, "candidate").length > 0 || byClass(change, "issue-problem").length > 0);
    await trusted(buttonsOf(change, "Save")[0]);
    await waitFor(() => byClass(change, "change-saved").length > 0 || byClass(change, "issue-problem").length > 0);
    if (byClass(change, "issue-problem").length) throw new Error("the change could not be drafted: " + textOf(change));
  }
}
await flush();

const trees = w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/git/trees")).flatMap((request) => JSON.parse(request.body).tree ?? []).filter((entry) => typeof entry.content === "string");
const files = [...new Map(trees.map((entry) => [entry.path, entry])).values()];
const committed = files.map((entry) => entry.path).sort();
const issue = w.kept.issues.find((each) => each.number === input.issue);
const queueIndexes = files.filter((entry) => /^docs\/spec-freigaben\/[^/]+\/index\.md$/.test(entry.path));
const out = {
  labels: issue.labels,
  state: issue.state,
  issueWrites: w.kept.github.filter((request) => request.method !== "GET" && request.path.includes("/issues/")).map((request) => `${request.method} ${request.path.replace("/repos/alice/product", "")}`).sort(),
  committed,
  outsideDocs: committed.filter((path) => !path.startsWith("docs/")),
  queueNames: queueIndexes.map((entry) => /^\*\*Issue:\*\* (.*)$/m.exec(entry.content)?.[1] ?? null),
  queueHolds: Object.fromEntries((input.needles ?? []).map((needle) => [needle, files.some((entry) => /^docs\/spec-freigaben\/[^/]+\/\d+-.*\.md$/.test(entry.path) && entry.content.includes(needle))])),
  jobKinds: files.filter((entry) => /^docs\/jobs\/JOB-.*\.md$/.test(entry.path)).map((entry) => /^kind: (.*)$/m.exec(entry.content)?.[1] ?? null),
  changeSection: byClass(detail, "issue-change").length > 0,
  fixSection: byClass(detail, "issue-fix").length + byClass(detail, "issue-no-fixer").length > 0,
};
restoreWorld();
return out;
"""


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def run_world(argument: dict) -> dict:
    return js(f"const input = {json.dumps(argument)}; const ROOT = {json.dumps(str(ROOT))};\n{WORLD}")


def check(test: unittest.TestCase, section: str) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run_world(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got.get(key) for key in wanted}, wanted)


class TestIssueToSpec(unittest.TestCase):
    # TST-115201 · level: release · module: MOD-issue-handling
    # guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
    # given: the cases under "a change is written as a queue naming the issue" in the Markdown file beside this one: an issue classed as a change, with a participant that answers a new requirement and a conflict, and a person who saves the draft
    # input: each case's steps, carried out on the real page of the issue over the fake GitHub and the fake endpoint
    # expect: the class is only a label on the issue; the saved draft is a queue under docs/spec-freigaben/ whose index names the issue and the product, and holds the new requirement and not the conflict; the issue stays open
    def test_a_change_is_written_as_a_queue_naming_the_issue(self):
        check(self, FIRST)

    # TST-115202 · level: release · module: MOD-issue-handling
    # guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
    # given: the cases under "the code is not changed by a change": the issue classed as a change, classed and drafted, and an issue classed as a bug as the known positive
    # input: each case's steps, carried out on the real page of the issue
    # expect: for a change nothing is committed outside docs/, no job of the kind fix-bug is started and the page offers the section that drafts the change and not the one that fixes; for a bug the page offers the fix and not the change
    def test_the_code_is_not_changed_by_a_change(self):
        check(self, SECOND)


if __name__ == "__main__":
    unittest.main()
