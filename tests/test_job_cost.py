# Module: MOD-job-ledger
# Guards: NO COST IS GUESSED
# Level: release
"""SPEC section 14 - the check named tests/test_job_cost.py, for the requirement NO COST IS GUESSED.

The cases live in tests/test_job_cost.md. This file only loads them and asks node to run a job of the kind converse on the tab with the real job runner and
the real tab runtime (runOnTab), over a fake repository host that keeps the job's record and a fake `fetch` for the participant's runtime: a model endpoint
that answers with the usage of the case, or, for a runtime that reports a cost, an agent on a Bridge that answers with usage and cost. The participant's price
is the Price cell of a register row, read by MOD-participant-list. The record the runtime wrote is then read as the dashboard reads it - listJobs of
MOD-job-ledger, the page of the route job and the list of the route jobs of MOD-main-page, drawn over the same record - and the check states what the
ledger holds (`cost`) and what the pages show (`jobPage`, `listCell`).

Written for ITM-1136 by a participant who built none of the code it checks (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
GUESSED = "NO COST IS GUESSED"

# The adapter. `input`: `route` ("endpoint": a model endpoint reached from the tab; "bridge": an agent on a Bridge), `price` (the Price cell of the participant's row of the register),
# `usage` (what the runtime reports of tokens, or null), `cost` (what a Bridge's agent reports as the cost, or null). The value is what the case may state: `state` (the job's state in
# the ledger), `cost` (the Cost of the job's row), `jobPage` (the text of the page of the job under Cost), `listCell` (the cost cell of the job in the list of every job) and `endCost`
# (the cost line of the record's End).
WORLD = r"""
const url = (path) => `file://${ROOT}/${path}`;
const jobRunner = await import(url("src/job-runner/index.mjs")), runtimes = await import(url("src/runtimes/index.mjs")), ledger = await import(url("src/job-ledger/index.mjs"));
const participantList = await import(url("src/participant-list/index.mjs")), documents = await import(url("src/documents/index.mjs")), catalogue = await import(url("src/job-catalogue/index.mjs"));
const bridgeClient = await import(url("src/bridge-client/index.mjs"));
jobRunner.registerStrategies("tests/test_job_cost.py", { recipes: { "chapters-for-page": async () => [] } });

// ---------------------------------------------------------------- the product's repository, in memory
const WEB = "https://github.com/alice/thesis-tool";
function repoOf(files) {
  const commits = new Map();
  let made = 0;
  const commitOf = (tree) => { const id = String(++made).padStart(40, "0"); commits.set(id, tree); return id; };
  let head = commitOf(new Map(Object.entries(files)));
  const repository = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: WEB };
  const snapshotAt = (id) => { const tree = commits.get(id); return { repository, ref: id, commit: id, paths: [...tree.keys()].sort(), blob: () => null, read: async (path) => (tree.has(path) ? tree.get(path) : null) }; };
  return { files: () => Object.fromEntries(commits.get(head)), host: {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshotAt(head); },
    async listPullRequests() { return []; },
    async commitFiles(change) {
      if (change.expectedHead !== head) throw Object.assign(new Error("Moved"), { name: "Moved" });
      head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
      return { commit: head };
    },
  } };
}

// ---------------------------------------------------------------- the participant, its price and its runtime
const bridge = input.route === "bridge";
const REGISTER = "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n"
  + (bridge ? `| worker | CLI agent | model-t | 200000 | ${input.price} | draft text | this machine | bridge lab agent claude |\n`
            : `| worker | model endpoint | model-t | 200000 | ${input.price} | draft text | this machine | endpoint ep1 |\n`);
const participants = participantList.participantsOf(documents.readDocument(participantList.participantSchema(), "docs/participants.md", REGISTER));
const answer = JSON.stringify({ draft: { answer: "Done." }, answers: [] });
const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const asks = [];
globalThis.fetch = async (address, init = {}) => {
  const where = new URL(String(address));
  if (where.origin === "http://127.0.0.1:4711" && where.pathname === "/v1/ask" && init.method === "POST") { asks.push(JSON.parse(init.body)); return json({ ask: "ask-1" }); }
  if (where.origin === "http://127.0.0.1:4711" && where.pathname === "/v1/ask/ask-1") {
    return json({ state: "done", text: answer, usage: input.usage || input.cost ? { inputTokens: input.usage?.inputTokens ?? null, outputTokens: input.usage?.outputTokens ?? null, minutes: null, cost: input.cost ?? null } : null });
  }
  if (where.origin === "https://models.example") {
    return json({ choices: [{ message: { content: answer } }], ...(input.usage ? { usage: { prompt_tokens: input.usage.inputTokens, completion_tokens: input.usage.outputTokens } } : {}) });
  }
  throw new Error("no request leaves the fixtures: " + where.href);
};
const connections = bridge
  ? { endpoints: {}, bridges: { lab: bridgeClient.bridgeAt(bridgeClient.settingsOf({ name: "lab", address: "http://127.0.0.1:4711", token: "pairing-token" }, null)) } }
  : { endpoints: { ep1: { config: { name: "ep1", kind: "openai-compatible", baseUrl: "https://models.example/v1", model: "model-t", key: "k" }, bridge: null } }, bridges: {} };

// ---------------------------------------------------------------- a job of the kind converse, run on the tab
const repo = repoOf({ "README.md": "# Thesis tool\n" });
const head = await repo.host.readSnapshot();
const now = new Date("2026-10-20T10:00:00Z");
const id = ledger.newJobId(now, new Set());
const kind = await catalogue.kindOf("converse");
const context = { kind, params: { page: "The page of the thesis tool.", instruction: "Say that you are done." }, product: { address: WEB, snapshot: head, host: repo.host },
  instance: { snapshot: head, host: repo.host, checkout: null }, connect: async () => repo.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: "alice", now,
  agentM: { version: "2026.10.0", commit: "c0ffee" }, jobId: id };
const prepared = await jobRunner.prepareJob("converse", context, { drafter: participants[0], reviewers: [] });
if (prepared.blocking.length) throw new Error("the job is not startable: " + prepared.blocking.map((found) => found.what).join("; "));
const record = { id, kind: "converse", worksOn: ["A LOAN HAS A DUE DATE"], participant: "worker", model: "model-t", route: "tab", run: null, retries: null, startedBy: "alice", start: now,
  agentM: context.agentM, inputs: [], limit: 5, destinations: [], params: {} };
const { path } = await runtimes.queueJob(repo.host, record, { kind: "tab" }, head.commit);
await runtimes.runOnTab(prepared, context, connections, { host: repo.host, record: { ...record, path } });

// ---------------------------------------------------------------- what the ledger holds and what the pages show
const after = await repo.host.readSnapshot();
const row = (await ledger.listJobs([{ address: WEB, snapshot: after }], new Map()))[0];
const recordText = await after.read(path);
await import(url("tests/site-frame-dom.mjs"));
const harness = await import(url("tests/main-page-home-harness.mjs"));
const mainPage = await import(url("src/main-page/index.mjs"));
const world = harness.network({ [harness.PRODUCT]: harness.smallProduct({ jobs: [{ path, text: recordText }] }), [harness.INSTANCE]: { "SPEC.md": "# Instance\n", "docs/participants.md": REGISTER } }, { bridgeLists: null });
world.install();
const browser = harness.browser();
const routeOf = (name) => mainPage.view.routes.find((candidate) => candidate.name === name);
const jobPage = await harness.draw(routeOf("job"), browser, { id });
const jobList = await harness.draw(routeOf("jobs"), browser, {});
const shown = (root, name) => harness.byClass(root, name).map((node) => node.textContent);
const out = {
  state: row.state,
  cost: row.cost,
  endCost: /^cost: (.*)$/m.exec(recordText)?.[1] ?? null,
  jobPage: shown(jobPage, "job-cost")[0] ?? null,
  listCell: shown(jobList, "cost")[0] ?? null,
  asked: asks.length,
};
world.restore();
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


class TestJobCost(unittest.TestCase):
    # TST-1136001 · level: release · module: MOD-job-ledger
    # guards: NO COST IS GUESSED
    # given: the cases under "A job whose runtime reports neither cost nor usage" in the Markdown file beside this one: a model endpoint and an agent on a Bridge that report nothing, each with a declared price
    # input: a job of the kind converse run on the tab; its record read by the ledger and drawn by the pages of the job and of every job
    # expect: the job's cost is unknown with no usage, the End of its record says so, and both pages show "unknown" - never zero, whatever the declared price
    def test_a_job_whose_runtime_reports_neither_cost_nor_usage_shows_unknown_never_zero(self):
        check(self, GUESSED + " - neither cost nor usage")

    # TST-1136002 · level: release · module: MOD-job-ledger
    # guards: NO COST IS GUESSED
    # given: the cases under "A job whose runtime reports usage and whose participant declares no price": a model endpoint that reports tokens, a participant whose Price is left out
    # input: the same
    # expect: the cost is unknown with the usage kept; the page of the job shows the usage and says the price is unknown; the list shows "unknown"; no amount appears
    def test_usage_without_a_declared_price_is_shown_as_usage_with_the_price_unknown(self):
        check(self, GUESSED + " - usage without a price")

    # TST-1136003 · level: release · module: MOD-job-ledger
    # guards: NO COST IS GUESSED
    # given: the cases under "A job whose runtime reports a cost": an agent on a Bridge that reports a cost of 0.42 EUR, once with no declared price and once with a price and tokens
    # input: the same
    # expect: the cost is the one reported, with the basis "reported", in the ledger and on both pages; the declared price changes nothing
    # FINDING P2: the tab drops it. The agent's answer reaches the tab with its usage, cost included (bridgeDriver returns what `ask` gives), but the tab sums the usage of a job's exchanges with `cost: null`
    # (src/runtimes/tab.mjs:97, usageOf), so jobCost (src/job-ledger/cost.mjs:13) never sees a reported cost: a job with no price is shown as unknown, one with tokens and a price as the tokens at the price.
    # The CI route keeps it (src/workflow-entries/product.mjs, usageOf takes `reported.find((each) => each.cost)?.cost`). No driver of this repository reports a cost yet (src/agent-processes/index.mjs:93,
    # src/bridge-jobs/watch.mjs:40 give null), so the fault is not yet seen on a page, but the requirement is met only where the runtime's cost reaches the record.
    @unittest.expectedFailure
    def test_a_cost_the_runtime_reports_is_shown_as_reported(self):
        check(self, GUESSED + " - reported")

    # TST-1136004 · level: release · module: MOD-job-ledger
    # guards: NO COST IS GUESSED
    # given: the cases under "A job whose runtime reports usage and whose participant declares a price": 10 input and 5 output tokens at the price `3 / 15 USD per million tokens` of the register
    # input: the same
    # expect: the cost is known, with the basis "usage at the declared price", and its amount is the tokens at the price per million: 0.000105 USD, on the ledger and on both pages.
    # FINDING P1: the amount is 105 USD, a million times too much. jobCost (src/job-ledger/cost.mjs:19) multiplies the tokens by the price as the register states it, and MOD-participant-list's priceOf
    # (src/participant-list/index.mjs:105) gives the register's numbers - a price per million tokens - unchanged; the unit test of jobCost (tests/job-ledger.test.mjs) hands it a price per token. The cost
    # shown for a priced participant is wrong by 10^6, which is a cost guessed wrong rather than unknown.
    def test_usage_at_the_declared_price_per_million_tokens_is_priced_per_million(self):
        check(self, GUESSED + " - usage at a price")


if __name__ == "__main__":
    unittest.main()
