# Module: MOD-job-ledger
# Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A JOB IDENTIFIER IS NEVER REUSED; A RUN IS A JOB THAT NAMES ITS JOBS
# Level: release
"""SPEC sections 14 and 12 - the check named tests/test_job_record.py, for the three requirements whose Check sentence names it.

The cases live in tests/test_job_record.md. This file only loads them and asks node to run the real MOD-runtimes (queueJob, runOnTab, retryJob), MOD-job-ledger (newJobId,
startRecord, appendToRecord, listJobs) and MOD-run-planner (runOf) over an in-memory repository host, a fake `fetch` for the participant's model endpoint and for a Bridge, and, for a
conversation held in a browser tab, the real prompt bar of tests/test_conversation_not_recorded.py (its adapter is reused as it stands). The fakes only hold files and answer requests; every
record is written by the code under test and read back by listJobs. A case's `expected` names what it asserts.

Readings the SPEC's wording leaves, which the pull request names: a job "leaves its record" when its route commits the record's start - inputs, participant, runtime and start - to the
product's repository (the tab, CI and the Bridge each have their route in queueJob), and the End is appended by the runtime that runs it (the tab's is run here); a conversation held
in the tab is the prompt bar's messages, which make a record only when the person hands the task over.

Written for ITM-1132 by a participant who built none of the code it checks (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js
import test_conversation_not_recorded as bar

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]
RECORDED = "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY"
NEVER_REUSED = "A JOB IDENTIFIER IS NEVER REUSED"
RUN = "A RUN IS A JOB THAT NAMES ITS JOBS"

# The adapter. `input.kind` is one of: "routes" (a job queued on each route of `routes` - "tab", "ci hosted", "bridge lab" - and, on the tab, run), "ids" (the identifiers of jobs), "run"
# (a run's record and the records of the jobs it started, read back). The value is what the case may state.
WORLD = r"""
const url = (path) => `file://${ROOT}/${path}`;
const jobRunner = await import(url("src/job-runner/index.mjs")), runtimes = await import(url("src/runtimes/index.mjs")), ledger = await import(url("src/job-ledger/index.mjs"));
const participantList = await import(url("src/participant-list/index.mjs")), documents = await import(url("src/documents/index.mjs")), catalogue = await import(url("src/job-catalogue/index.mjs"));
const bridgeClient = await import(url("src/bridge-client/index.mjs")), runPlanner = await import(url("src/run-planner/index.mjs")), workflowFiles = runtimes;
jobRunner.registerStrategies("tests/test_job_record.py", { recipes: { "chapters-for-page": async () => [] } });

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
const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const handedOver = [];
globalThis.fetch = async (address, init = {}) => {
  const where = new URL(String(address));
  if (where.origin === "http://127.0.0.1:4711" && where.pathname === "/v1/jobs" && init.method === "POST") { handedOver.push(JSON.parse(init.body)); return json({}); }
  if (where.origin === "https://models.example") return json({ choices: [{ message: { content: JSON.stringify({ draft: { answer: "Done." }, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
  throw new Error("no request leaves the fixtures: " + where.href);
};
const REGISTER = "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n"
  + "| worker | model endpoint | model-t | 200000 | — | draft text | this machine | endpoint ep1 |\n";
const participants = participantList.participantsOf(documents.readDocument(participantList.participantSchema(), "docs/participants.md", REGISTER));
const connections = { endpoints: { ep1: { config: { name: "ep1", kind: "openai-compatible", baseUrl: "https://models.example/v1", model: "model-t", key: "k" }, bridge: null } }, bridges: {} };
const agentM = { version: "2026.10.0", commit: "c0ffee" };
const JOB_PATH = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
const recordsIn = (repo) => Object.keys(repo.files()).filter((path) => JOB_PATH.test(path));
const startOf = (id, over = {}) => ({ id, kind: "converse", worksOn: ["A LOAN HAS A DUE DATE"], participant: "worker", model: "model-t", route: "tab", run: null, retries: null, startedBy: "alice", start: new Date("2026-10-20T10:00:00Z"),
  agentM, inputs: ["docs/notes.md"], limit: 5, destinations: [], params: { page: "The page.", instruction: "Say that you are done." }, ...over });
const rowsOf = async (repo) => ledger.listJobs([{ address: WEB, snapshot: await repo.host.readSnapshot() }], new Map());

async function routes(input) {
  const workflow = Object.fromEntries(workflowFiles.jobWorkflowFiles("github", { repository: "alice/agent-m", commit: "a".repeat(40) }, { token: "AGENT_M_TOKEN", keys: [] }, []).map((file) => [file.path, file.text]));
  const out = {};
  for (const route of input.routes) {
    const repo = repoOf({ "README.md": "# Thesis tool\n", "docs/notes.md": "# Notes\n", ...workflow });
    const instance = repoOf({ "README.md": "# Instance\n" });
    const head = await repo.host.readSnapshot();
    const id = ledger.newJobId(new Date("2026-10-20T10:00:00Z"), new Set());
    const kindName = "converse";
    const where = route === "tab" ? { kind: "tab" } : route === "bridge lab" ? { kind: "bridge", bridge: "lab" } : { kind: "ci", runner: "hosted" };
    const handle = where.kind === "bridge" ? bridgeClient.bridgeAt(bridgeClient.settingsOf({ name: "lab", address: "http://127.0.0.1:4711", token: "pairing-token" }, null)) : undefined;
    const start = startOf(id, { route });
    const queued = await runtimes.queueJob(repo.host, start, where, head.commit, handle);
    if (route === "tab") {
      const context = { kind: await catalogue.kindOf(kindName), params: start.params, product: { address: WEB, snapshot: head, host: repo.host }, instance: { snapshot: head, host: repo.host, checkout: null }, connect: async () => repo.host,
        participants, places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: start.start, agentM, jobId: id };
      const prepared = await jobRunner.prepareJob(kindName, context, { drafter: participants[0], reviewers: [] });
      await runtimes.runOnTab(prepared, context, connections, { host: repo.host, record: { ...start, path: queued.path } });
    }
    const rows = await rowsOf(repo);
    const row = rows[0];
    out[route] = { productRecords: recordsIn(repo).length, instanceRecords: recordsIn(instance).length, path: recordsIn(repo)[0] === `docs/jobs/${id}.md`, rows: rows.length,
      id: row?.record.id === id, kind: row?.record.kind, participant: row?.record.participant, route: row?.record.route, inputs: row?.record.inputs, worksOn: row?.record.worksOn,
      started: Boolean(row?.record.start), endState: row?.record.end?.state ?? null, results: row?.record.end?.results ?? null, handedOver: handedOver.length };
    handedOver.length = 0;
  }
  return out;
}

async function ids(input) {
  const out = {};
  // newJobId when every identifier of the minute but one is taken: the free one, however often it is asked.
  const now = new Date("2026-10-20T10:00:00Z");
  const all = []; for (let n = 0; n < 65536; n += 1) all.push(`JOB-20261020-1000-${n.toString(16).padStart(4, "0")}`);
  const free = all[12345];
  const taken = new Set(all.filter((each) => each !== free));
  out.freeOnly = [1, 2, 3].map(() => ledger.newJobId(now, taken)).every((each) => each === free);
  // retried jobs: a failed job queued again gets an identifier no record of docs/jobs holds, and names the one it retries.
  const repo = repoOf({ "README.md": "# Thesis tool\n", "docs/notes.md": "# Notes\n", ".github/workflows/agent-m-jobs.yml": "name: agent-m-jobs\n" });
  const first = ledger.newJobId(now, new Set());
  await runtimes.queueJob(repo.host, startOf(first), { kind: "tab" }, (await repo.host.readSnapshot()).commit);
  const failed = (await rowsOf(repo))[0].record;
  const seen = new Set([first]);
  let retried = failed;
  for (let n = 0; n < (input.retries ?? 3); n += 1) {
    const head = await repo.host.readSnapshot();
    const queued = await runtimes.retryJob(retried, { participant: participants[0], route: { kind: "tab" } }, repo.host, head.commit);
    const id = /JOB-[^/]+(?=\.md)/.exec(queued.path)[0];
    out["retry" + n] = { new: !seen.has(id), retries: (await rowsOf(repo)).find((row) => row.record.id === id)?.record.retries === retried.id };
    seen.add(id);
    retried = (await rowsOf(repo)).find((row) => row.record.id === id).record;
  }
  const rows = await rowsOf(repo);
  out.records = rows.length;
  out.distinct = new Set(rows.map((row) => row.record.id)).size;
  return out;
}

async function run(input) {
  const repo = repoOf({ "README.md": "# Thesis tool\n", "docs/notes.md": "# Notes\n" });
  const runId = "JOB-20261020-0900-aaaa";
  const jobIds = input.jobs.map((_, n) => `JOB-20261020-0910-b00${n}`);
  let { path, text } = ledger.startRecord(startOf(runId, { kind: "run", participant: null, model: null, route: "tab", worksOn: ["A LOAN HAS A DUE DATE"], inputs: [], params: { jobsAtOnce: 2, cost: null, rounds: 5 } }));
  const files = [];
  for (const [n, jobId] of jobIds.entries()) {
    if (!input.omitPart || input.omitPart !== n) text = ledger.appendToRecord(text, { part: "job started", at: new Date("2026-10-20T09:10:00Z"), job: jobId, kind: input.jobs[n], worksOn: ["A LOAN HAS A DUE DATE"] });
    files.push(ledger.startRecord(startOf(jobId, { kind: input.jobs[n], run: input.unnamed === n ? null : runId })));
  }
  await repo.host.commitFiles({ branch: "trunk", expectedHead: (await repo.host.readSnapshot()).commit, files: [{ path, text }, ...files] });
  const rows = await rowsOf(repo);
  const runRow = rows.find((row) => row.record.id === runId);
  const read = runPlanner.runOf(runRow.record, rows.filter((row) => row.record.id !== runId));
  const jobRows = rows.filter((row) => row.record.id !== runId);
  return { kind: runRow.record.kind, listed: read.jobs.map((each) => each.job).sort(), started: jobIds.length,
    allListed: jobIds.every((id) => read.jobs.some((each) => each.job === id)), allNameTheRun: jobRows.every((row) => row.record.run === runId) };
}

const KINDS = { routes, ids, run };
return await KINDS[input.kind](input);
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
    if argument.get("kind") == "conversation":
        return bar.run_world(argument["bar"])
    return js(f"const input = {json.dumps(argument)}; const ROOT = {json.dumps(str(ROOT))};\n{WORLD}")


def check(test: unittest.TestCase, section: str) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run_world(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got.get(key) for key in wanted}, wanted)


class TestJobRecord(unittest.TestCase):
    # TST-1132001 · level: release · module: MOD-job-ledger
    # guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
    # given: the cases under that requirement: a job queued for the tab (and run there), for CI (hosted) and for a Bridge (handed over to it), each over a product's repository
    # input: queueJob on each route, runOnTab for the tab; the product's docs/jobs/ read by listJobs
    # expect: each leaves one record docs/jobs/<its id>.md in the product's repository and none in another, naming its kind, inputs, participant, runtime (route) and start; the tab's, once ended, its end state and results
    def test_a_job_in_the_tab_in_ci_and_on_a_bridge_each_leaves_its_record(self):
        check(self, RECORDED)

    # TST-1132002 · level: release · module: MOD-job-ledger
    # guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
    # given: the cases under "A conversation held in the tab": the real prompt bar with recording off; a conversation of two messages, and one that hands its task over
    # input: the messages sent, and the person's click on Hand over
    # expect: the conversation leaves no record under docs/jobs/ and starts no workflow; the same conversation with its task handed over leaves exactly one record in the product
    def test_a_conversation_held_in_the_tab_leaves_no_record(self):
        for loaded in bar.cases(RECORDED + " - a conversation in the tab", DATA):
            with self.subTest(case=loaded["name"]):
                got = bar.run_world(loaded["case"]["input"])
                wanted = loaded["case"]["expected"]
                self.assertEqual({key: got[key] for key in wanted}, wanted)

    # TST-1132003 · level: release · module: MOD-job-ledger
    # guards: A JOB IDENTIFIER IS NEVER REUSED
    # given: the cases under that requirement: a minute in which every identifier but one is taken; a failed job retried three times in a row
    # input: newJobId over the taken identifiers; retryJob on the failed job and on each retry
    # expect: the identifier given is the one free identifier, however often it is asked; each retry has an identifier no record held, names the job it retries, and the product ends with as many distinct records as jobs
    def test_no_two_jobs_of_a_product_share_an_identifier_a_retried_job_included(self):
        check(self, NEVER_REUSED)

    # TST-1132004 · level: release · module: MOD-run-planner
    # guards: A RUN IS A JOB THAT NAMES ITS JOBS
    # given: the cases under that requirement: a run whose record lists two jobs that name it; the same with one job missing from the run's list; the same with a job that does not name the run
    # input: the records written with MOD-job-ledger's startRecord and appendToRecord, read by listJobs and runOf
    # expect: the run is read as a job of kind run whose list holds every job it started and every one of those jobs names the run; the counter-proofs are told apart. What is checked is the record and its reader: nothing in the repository
    # starts a run yet (MOD-run-planner's nextActions and finishRun are not built), so that a run's jobs are recorded as the run starts them cannot be checked as worded - the pull request names it.
    def test_a_runs_record_lists_every_job_it_started_and_each_names_the_run(self):
        check(self, RUN)


if __name__ == "__main__":
    unittest.main()
