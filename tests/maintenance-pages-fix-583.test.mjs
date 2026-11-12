// A bug's fix is named with its pull request, and its issue is closed with links once the fix is merged (ITM-583) — MOD-maintenance-pages' route `issue/<number>`, as the accepted text of
// docs/architecture/MOD-maintenance-pages.md states it: "closing an issue with links once its pull request is merged", and (Uses) "an issue's fix: the newest `fix-bug` job whose `works_on` names the issue, and the pull
// request of its branch, which the job's trail gives"; UC-012 step 5 and its first postcondition. The fix itself is the work of the conversation Implement starts (tests/maintenance-pages-implement.test.mjs).
// Run: node --test tests/maintenance-pages-fix-583.test.mjs
//
// Module: MOD-maintenance-pages; MOD-issue-handling; MOD-job-catalogue; MOD-runtimes
// Guards: UC-012; AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: component
//
// The world is tests/maintenance-pages-world.mjs: its model endpoint ep1 offers the participant local-llm, its fake GitHub holds the issues of alice/product and takes git commits to the product; to its register this file adds the agent dev-cli, whose model the
// CLI session claude of the Bridge lab-pc-4 offers with write to the repository and run code and tests, at this machine, on the route bridge lab-pc-4 agent claude. The page, MOD-issue-handling, MOD-job-catalogue, MOD-job-runner, MOD-run-planner, MOD-runtimes and MOD-repository-hosts are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - Below Implement, <div class="issue-fix-trail"> names the newest job of the kind fix-bug whose works_on names the issue's address (<p class="fix-job">) and the pull request of the branch named after the job (<a class="fix-pull-request">, <p class="fix-pull"> with its state);
//     once it is merged, <button class="close-with-links"> "Close with links" — the person's click — closes the issue with closeWithLinks: the note "Closed with <the pull request's address>." and the state closed.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PRODUCT, PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { runStrategies } from "../src/run-planner/index.mjs";
import { resourceStrategies } from "../src/resource-list/index.mjs";
import { FIXER, FIXER_SESSIONS, LOCAL, buttonsOf, byClass, flush, one, restoreWorld, textOf, trusted, waitFor, world, routeNamed, pages } from "./maintenance-pages-world.mjs";

// The strategies the page's own view hands the frame, and those the prompt bar hands it on the dashboard (the recipes `implementation-inputs` and `resource-pins`), which the harness does not register.
for (const [at, strategies] of [...(pages.view?.strategies ?? []), runStrategies, resourceStrategies].entries()) {
  try { registerStrategies(`tests/maintenance-pages-fix-583.test.mjs#${at}`, strategies); } catch { /* registered by the page's own view */ }
}

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_HOME827PRODUCT0123456789abcdefg";
const ISSUE_BODY = "FIRST RULE is broken: the export is cut off after the second page.";
const issueRecord = (number, labels) => ({ number, title: `Export loses pages ${number}`, body: ISSUE_BODY, state: "open", labels, comments: [] });
const issuesOf = () => [issueRecord(5, []), issueRecord(6, ["defect"]), issueRecord(7, ["change"]), issueRecord(8, ["defect"])];
const ADDRESS = (number) => `${PRODUCT_URL}/issues/${number}`;

const WORKFLOW = { ".github/workflows/agent-m-jobs.yml": "name: agent-m-jobs\n" };
const moduleText = (id, folder) => ["---", `id: ${id}`, `title: ${id}`, `folder: ${folder}`, "realises: []", "follows:", "  - ARC-001", "uses: []", "provides: []", "---", `# ${id} ${id}`, "",
  "## Responsibility", "", "It stores.", "", "## Parts", "", "- index.mjs", "", "## Data", "", "Nothing.", "", "## Interfaces", "", "None.", "", "## Files", "", "None.", "", "## Uses", "", "None.", ""].join("\n");
const decision = ["---", "id: ARC-001", "title: The whole", "designs:", "  - MOD-store", "---", "# ARC-001 The whole", "", "## Context", "", "c", "", "## Decision", "", "d", "", "## Alternatives", "", "a", "", "## Consequences", "", "q", ""].join("\n");
const PRODUCT_FILES = { ...WORKFLOW, "docs/architecture/ARC-001-whole.md": decision, "docs/architecture/MOD-store.md": moduleText("MOD-store", "src/store/"), "src/store/read.mjs": "export const read = 1;\n" };
// The product's resource list naming a compute that only the Bridge lab-pc-5 reaches.
const GPU = ["# Resources", "", "What this is built with and runs on.", "", "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |", "|---|---|---|---|---|---|---|---|---|---|",
  "| gpu | compute | gpu.example.test | — | — | — | bridge lab-pc-5 | this machine | — | — |", ""].join("\n");
const PROPOSAL = { class: "bug", reasoning: "FIRST RULE holds, and the code breaks it: the export drops pages.", wrong: ["src/store/read.mjs", "tests/store.test.mjs"] };

// The instance, as its register holds the book (the recipe chapters-for-tests of the kind reads chapter 13), read from this repository.
const BOOK_FOLDER = "docs/sources/SRC-vibe-coding/2026-10-05/";
const onDisk = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const BOOK = { "docs/sources/SRC-vibe-coding.md": onDisk("docs/sources/SRC-vibe-coding.md"),
  ...Object.fromEntries(readdirSync(new URL(`../${BOOK_FOLDER}`, import.meta.url)).map((name) => [BOOK_FOLDER + name, onDisk(BOOK_FOLDER + name)])) };

/** The world with the product chosen. */
function start({ product = PRODUCT_FILES, rows = [LOCAL, FIXER], ...over } = {}) {
  const w = world({ mails: [], issues: issuesOf(), rows, answer: () => ({ draft: PROPOSAL, answers: [] }), product, instance: BOOK, sessions: FIXER_SESSIONS, ...over });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  return w;
}
const open = (w, number) => {
  assert.ok(routeNamed("issue"), `the route issue: ${pages.error?.message}`);
  return draw(routeNamed("issue"), w.context, { number: String(number) });
};
const fixOf = (detail) => byClass(detail, "issue-fix")[0];
const issueOf = (w, number) => w.kept.issues.find((each) => each.number === number);
/** The files the git requests of the product wrote, taken once by their path and text. */
const writtenFiles = (w) => [...new Map(w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/git/trees")).flatMap((request) => JSON.parse(request.body).tree ?? [])
  .filter((entry) => typeof entry.content === "string").map((entry) => [`${entry.path}\n${entry.content}`, entry])).values()];
const jobFiles = (w) => writtenFiles(w).filter((entry) => entry.path.startsWith("docs/jobs/"));

/** The issue opened, its fix section drawn, a participant and a name given, and the run panel drawn. */
async function ready(w, number = 6, { participant = "dev-cli", requirement = "" } = {}) {
  const detail = await open(w, number);
  await waitFor(() => byClass(detail, "issue-analysis").length > 0 && fixOf(detail) !== undefined);
  assert.ok(fixOf(detail), `issue ${number} shows the section to fix it`);
  const radio = byClass(fixOf(detail), "fix-participant").find((each) => each.value === participant);
  radio.checked = true;
  one(fixOf(detail), "fix-person").value = "Reviewer Rae";
  if (requirement) one(fixOf(detail), "fix-requirement").value = requirement;
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(fixOf(detail), "run-panel").length > 0 || byClass(fixOf(detail), "issue-problem").length > 0);
  return detail;
}

// ---------------------------------------------------------------- the fix's trail and the issue closed with links

const FIX_JOB = "JOB-20261028-0900-a1b2";
const DECLARES = { context: 100000, capabilities: FIXER_SESSIONS.claude.capabilities };
const FIX_RECORD = startRecord({ id: FIX_JOB, kind: "fix-bug", worksOn: [ADDRESS(6)], participant: "dev-cli", model: "fixture-llm", route: "bridge lab-pc-4 agent claude", declares: DECLARES, run: null, retries: null, startedBy: "alice", start: new Date("2026-10-28T09:00:00Z"),
  agentM: { version: "unreleased", commit: "f".repeat(40) }, inputs: [], limit: 2, destinations: [{ participant: "dev-cli", place: "this machine", parts: [] }], params: { issue: 6 } });
const OTHER_RECORD = startRecord({ id: "JOB-20261028-0800-0000", kind: "fix-bug", worksOn: [ADDRESS(7)], participant: "dev-cli", model: "fixture-llm", route: "bridge lab-pc-4 agent claude", declares: DECLARES, run: null, retries: null, startedBy: "alice", start: new Date("2026-10-28T08:00:00Z"),
  agentM: { version: "unreleased", commit: "f".repeat(40) }, inputs: [], limit: 2, destinations: [{ participant: "dev-cli", place: "this machine", parts: [] }], params: { issue: 7 } });
const WITH_FIX = { ...PRODUCT_FILES, [FIX_RECORD.path]: FIX_RECORD.text, [OTHER_RECORD.path]: OTHER_RECORD.text };

/** The world with the fix job of issue 6 and the pull requests the server lists for the branches: `pulls` maps a branch to the pull request as GitHub gives it, or to nothing. */
function withPulls(pulls) {
  const w = start({ product: WITH_FIX });
  const inner = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/pulls`) {
      const branch = decodeURIComponent(url.searchParams.get("head") ?? "").split(":")[1];
      const found = url.searchParams.get("page") === "1" || url.searchParams.get("page") === null ? pulls[branch] ?? [] : [];
      return new Response(JSON.stringify(found), { status: 200, headers: { "content-type": "application/json" } });
    }
    // The facts of a listed pull request (pullRequestFacts): the request itself, with no commit, no changed file, no review and no check.
    const facts = new RegExp(`^/repos/${PRODUCT}/(?:pulls/(\\d+)(?:/(commits|files|reviews))?|commits/[0-9a-f]{40}/(check-runs|statuses))$`).exec(url.pathname);
    if (url.host === "api.github.com" && facts) {
      const [, number, list, check] = facts;
      const found = Object.values(pulls).flat().find((each) => String(each.number) === number);
      if (number && !found) return new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify(number && !list ? found : check === "check-runs" ? { check_runs: [] } : []), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/commits` && url.searchParams.get("sha") === FIX_JOB) return new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { "content-type": "application/json" } });
    return inner(input, init);
  };
  return w;
}
const pull = (state, merged) => ({ number: 9, title: `${FIX_JOB}: fix-bug`, body: `Job: ${FIX_JOB}`, state, draft: false, html_url: `${PRODUCT_URL}/pull/9`, created_at: "2026-10-28T09:10:00Z",
  merged_at: merged ? "2026-10-28T09:50:00Z" : null, closed_at: state === "closed" ? "2026-10-28T09:50:00Z" : null, merge_commit_sha: merged ? "3".repeat(40) : null, head: { ref: FIX_JOB, sha: "2".repeat(40) }, base: { ref: "main", sha: "b".repeat(40) } });

// TST-583206 · level: component · module: MOD-maintenance-pages, MOD-issue-handling
// guards: UC-012; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: known positive first — the fix job of the issue 6 (and another fix job, of the issue 7) is in the product's records, and the server lists no pull request for its branch; then the server lists the merged pull request #9 for the branch JOB-20261028-0900-a1b2
// input: the route issue 6; then, with the merged pull request, the route issue 6 again; Close with links by a script and then by a person
// expect: without a pull request the trail names the job and says that it has opened none, with no Close button; with the merged pull request it names the job and links the pull request as merged and offers Close with links; the script's click writes nothing; the person's adds the comment "Closed with https://github.com/alice/product/pull/9." to the issue 6 and closes it, and the page says so; the issue 7 is untouched
test("issue — the fix's pull request is named, and once it is merged Close with links closes the issue with a note naming it", async () => {
  const waiting = withPulls({});
  const first = await open(waiting, 6);
  await waitFor(() => byClass(first, "issue-fix-trail").length > 0);
  assert.match(textOf(one(first, "fix-job")), new RegExp(FIX_JOB));
  assert.equal(byClass(first, "fix-no-pull-request").length, 1);
  assert.deepEqual(buttonsOf(first, "Close with links"), []);
  restoreWorld();

  const w = withPulls({ [FIX_JOB]: [pull("closed", true)] });
  const detail = await open(w, 6);
  await waitFor(() => buttonsOf(detail, "Close with links").length > 0 || byClass(detail, "issue-problem").length > 0);
  assert.equal(byClass(detail, "issue-problem").length, 0, textOf(one(detail, "issue-problem") ?? detail));
  assert.match(textOf(one(detail, "fix-job")), new RegExp(FIX_JOB));
  assert.equal(one(detail, "fix-pull-request").getAttribute("href"), `${PRODUCT_URL}/pull/9`);
  assert.match(textOf(one(detail, "fix-pull")), /pull request #9 is merged/);
  const close = buttonsOf(detail, "Close with links")[0];
  close.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(issueOf(w, 6).comments, [], "a click by a script writes nothing");
  await trusted(close);
  await waitFor(() => byClass(detail, "fix-closed").some((node) => textOf(node) !== ""));
  assert.deepEqual(issueOf(w, 6).comments, [`Closed with ${PRODUCT_URL}/pull/9.`]);
  assert.equal(issueOf(w, 6).state, "closed");
  assert.match(textOf(one(detail, "fix-closed")), /closed with/);
  assert.deepEqual(issueOf(w, 7).comments, []);
  assert.equal(issueOf(w, 7).state, "open");
});

// TST-583207 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the fix job of the issue 6 and an open pull request #9 for its branch, which the fake host gives its facts (the request, and no commit, changed file, review or check); and the server's merged pull request of TST-583206 as known positive
// input: the route issue 6
// expect: the trail links the pull request as open, draws no issue-problem, and offers no Close with links; the issue is not closed
test("issue — a fix whose pull request is not merged yet is not closed", async () => {
  const w = withPulls({ [FIX_JOB]: [pull("open", false)] });
  const detail = await open(w, 6);
  await waitFor(() => byClass(detail, "fix-no-expectation").length > 0 || byClass(detail, "issue-problem").length > 0);
  assert.match(textOf(one(detail, "fix-pull")), /pull request #9 is open/);
  assert.deepEqual(buttonsOf(detail, "Close with links"), []);
  assert.equal(byClass(detail, "issue-problem").length, 0, textOf(one(detail, "issue-problem") ?? detail));
  assert.equal(issueOf(w, 6).state, "open");
});
