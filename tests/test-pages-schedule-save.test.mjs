// The schedule page from Save on (ITM-759) — MOD-test-pages' route `schedule`, as docs/architecture/MOD-test-pages.md and UC-027 steps 5 to 7
// and 1a, 1b, 3a, 6a, 7a state it: Save opens one pull request through proposeSchedule; its CI result, and Merge once green through
// mergePullRequest, after which on a GitLab server applyPipelineSchedule sets the nightly pipeline schedule and the page links it; a red CI is
// not merged; a foreign or hand-edited configuration is shown against the schedule with configurationDrift; the last run per occasion from
// listCiRuns by its event, and a nightly run that has not run with its date beside the expected one and the workflow's page.
// Run: node --test tests/test-pages-schedule-save.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-027; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; GITLAB PRODUCTS ARE SUPPORTED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged. The product and the instance are hosts of this file, kept to
// MOD-repository-hosts' interface (repositoryInfo, readSnapshot, createBranch, commitFiles, openPullRequest, listCiRuns, mergePullRequest,
// setPipelineSchedule, ciRunLabels, webLinks); MOD-test-schedule runs as it is. No request leaves the process.
// Where the texts leave a reading open, the test states the reading it takes, and the pull request names it:
//   - The pull request, its CI and Merge are shown in the screen after Save (<div class="schedule-proposal">): the module keeps nothing but the
//     screen (MOD-test-pages, Data). Its CI is the runs listCiRuns gives for the pull request's head; *Check CI again* reads them anew.
//   - Green is: at least one run, and every run `success` or `skipped`. Red is: a run `failure` or `cancelled`; the page then says it is not
//     merged and links the server's runs of that commit (webLinks().commitRuns). Merge is one click, with no dialog (ONE CLICK PER DECISION).
//   - The runner chosen for a row in the table is written into that row's `runs on` by Save (ITM-758 left the writing to Save).
//   - The configuration that configurationDrift compares is the product's `.github/workflows/*.yml`, `.gitlab-ci.yml` and `.gitlab/*.yml`
//     files at the default branch; the drift is shown only where the product holds one of them. The target is the product's server, the instance
//     as the instance's snapshot names it (its path on GitHub, its web address on GitLab, where the pipeline clones it), and the commit of the
//     instance's default branch as `instanceCommit`.
//   - The last runs are read with listCiRuns({ workflow: "agent-m-tests.yml" }), the generated file's name (MOD-test-schedule, Data), only
//     where the default branch holds the generated file. The occasion of a run is told by its event: push → every commit; pull_request or
//     merge_request_event → pull request; schedule → nightly; workflow_dispatch or web → on demand. A release candidate's run is not told
//     apart by its event and is shown on the release panel. Of several runs of an occasion, the one started last is shown.
//   - A nightly run has not run when the schedule ticks a row for nightly and no run of the event schedule started on or after the date of the
//     last nightly time that has passed (UTC); the page shows the last run's date, or that there is none, beside that expected date, names on
//     GitHub that scheduled workflows of a public repository are disabled after a period without activity, and links webLinks().actions.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { until } from "./prompt-bar.d/until.mjs";

const { view } = await import("../src/test-pages/index.mjs");
const { ciConfiguration, scheduleSchema } = await import("../src/test-schedule/index.mjs");
const { readDocument } = await import("../src/documents/index.mjs");
const { participantSchema } = await import("../src/participant-list/index.mjs");
const { resourceSchema } = await import("../src/resource-list/index.mjs");

const route = () => view.routes.find((candidate) => candidate.name === "schedule");

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const buttonOf = (root, text) => descendants(root, (node) => node.localName === "button" && node.textContent === text).at(-1);
const saveOf = (root) => buttonOf(root, "Save");
const click = (button) => button.dispatchEvent(new Event("click"));
const day = (ms) => new Date(ms).toISOString().slice(0, 10);

// ---------------------------------------------------------------- the fixtures

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const scheduleText = (rows, front = "nightly: 02:00") => `---\n${front}\n---\n## Levels\n\n${HEAD}\n${rows.join("\n")}\n`;
const SAVED = scheduleText(["| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | | | ✓ | ✓ | ✓ | |",
  "| paid | | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);
const NO_NIGHTLY = scheduleText(["| unit | ✓ | ✓ | | ✓ | ✓ | |", "| component | ✓ | ✓ | | ✓ | ✓ | |", "| system | ✓ | ✓ | | ✓ | ✓ | |",
  "| paid | | | | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);

const REGISTER = `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ci runner:lab secret LAB_KEY |
| writer | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |
`;
const participants = readDocument(participantSchema(), "docs/participants.md", REGISTER);
const RESOURCES = `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |\n`;
const resources = readDocument(resourceSchema(), "docs/resources.md", RESOURCES);

const INSTANCE = { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" };
const INSTANCE_COMMIT = "i".repeat(40);
const HEAD_COMMIT = "c".repeat(40);
const PR_HEAD = "p".repeat(40);
const MERGED = "m".repeat(40);

const SERVERS = {
  github: { address: { server: "github", origin: "https://github.com", path: "org/product", web: "https://github.com/org/product" },
    generated: ".github/workflows/agent-m-tests.yml", instance: INSTANCE.path, pipelineSchedules: null },
  gitlab: { address: { server: "gitlab", origin: "https://gitlab.example.org", path: "org/product", web: "https://gitlab.example.org/org/product" },
    generated: ".gitlab/agent-m-tests.yml", instance: INSTANCE.web, pipelineSchedules: "https://gitlab.example.org/org/product/-/pipeline_schedules" },
};

const ciRun = (id, event, state, started, server = "github") => ({ id, workflow: "agent-m-tests.yml", commit: "a".repeat(40), event, state,
  url: `${SERVERS[server].address.web}/runs/${id}`, started, ended: null });

// The product's host on a server: its default branch holds `files`; `runs.pr` are the runs of the pull request's head, `runs.last` those of the
// generated workflow. Every write is recorded in `calls`, in its order.
function productHost(server, files, runs = { pr: [], last: [] }) {
  const { address, pipelineSchedules } = SERVERS[server];
  const calls = [];
  const host = {
    calls, runs,
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
    readSnapshot: async (ref) => ({ repository: address, ref, commit: HEAD_COMMIT, paths: Object.keys(files), blob: () => "b".repeat(40),
      read: async (path) => files[path] ?? null, readMany: async () => {}, readOn: async () => null }),
    createBranch: async (name, from) => { calls.push(["createBranch", name, from]); },
    commitFiles: async (change) => { calls.push(["commitFiles", change]); return { commit: PR_HEAD, url: `${address.web}/commit/${PR_HEAD}` }; },
    openPullRequest: async (request) => {
      calls.push(["openPullRequest", request]);
      return { number: 7, title: request.title, branch: request.branch, base: request.base, head: PR_HEAD, mergeCommit: null, state: "open",
        draft: false, url: `${address.web}/pull/7`, opened: "2026-10-20T10:00:00Z", merged: null, closed: null, body: request.body };
    },
    listCiRuns: async (filter) => {
      calls.push(["listCiRuns", filter]);
      if (filter.commit === PR_HEAD) return host.runs.pr;
      if (filter.workflow === "agent-m-tests.yml") return host.runs.last;
      return [];
    },
    ciRunLabels: async () => [],
    mergePullRequest: async (number, expectedHead) => { calls.push(["mergePullRequest", number, expectedHead]); return { commit: MERGED }; },
    setPipelineSchedule: async (schedule) => {
      calls.push(["setPipelineSchedule", schedule]);
      if (server === "github") throw Object.assign(new Error("NotSupported"), { name: "NotSupported" });
      return { id: "1", url: pipelineSchedules };
    },
    webLinks: () => ({ secrets: `${address.web}/settings/secrets`, actions: `${address.web}/actions`, runners: `${address.web}/runners`,
      commitRuns: (commit) => `${address.web}/commit/${commit}/runs`, run: (id) => `${address.web}/runs/${id}`, pipelineSchedules }),
  };
  return host;
}
const instanceHost = () => ({
  repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
  readSnapshot: async () => ({ repository: INSTANCE, ref: "main", commit: INSTANCE_COMMIT, paths: ["docs/participants.md"], blob: () => "b".repeat(40),
    read: async (path) => (path === "docs/participants.md" ? REGISTER : null) }),
});

async function page(server, files, runs) {
  const host = productHost(server, files, runs);
  const context = { page: "main", instance: { repository: "alice/agent-m", host: instanceHost() }, store: null, go() {},
    product: { address: SERVERS[server].address.web, kind: server, host, tokenStored: true } };
  const target = document.createElement("div");
  document.body.append(target);
  await route().render(target, context, {});
  return { target, host };
}
const writes = (host, name) => host.calls.filter(([call]) => call === name);
const proposalOf = (target) => byClass(target, "schedule-proposal")[0];
async function saved(server, files = { "docs/tests/schedule.md": SAVED }, runs) {
  const shown = await page(server, files, runs);
  click(saveOf(shown.target));
  await until(() => proposalOf(shown.target) && byClass(proposalOf(shown.target), "ci-state").length, "the pull request and its CI shown");
  return shown;
}

// ================================================================== the tests

for (const server of ["github", "gitlab"]) {
  const { address, generated } = SERVERS[server];

  // TST-759001 · level: unit · module: MOD-test-pages
  // guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; UC-027
  // given: a product on the server (GitHub, then GitLab) with a saved schedule; nothing is written by rendering
  // input: one click on Save
  // expect: before the click no write; after it one branch from the head that was read, one commit holding docs/tests/schedule.md and the generated file (on GitLab also .gitlab-ci.yml), and one pull request into main; the page links the pull request's url; no merge and no pipeline schedule
  test(`schedule on ${server} — one click on Save opens one pull request`, async () => {
    const shown = await page(server, { "docs/tests/schedule.md": SAVED });
    assert.deepEqual(shown.host.calls.filter(([call]) => call !== "listCiRuns"), [], "rendering writes nothing");
    click(saveOf(shown.target));
    await until(() => proposalOf(shown.target), "the pull request shown");
    assert.deepEqual(writes(shown.host, "createBranch").map(([, , from]) => from), [HEAD_COMMIT]);
    const commits = writes(shown.host, "commitFiles");
    assert.equal(commits.length, 1);
    const paths = commits[0][1].files.map((file) => file.path).sort();
    assert.deepEqual(paths, ["docs/tests/schedule.md", generated, ...(server === "gitlab" ? [".gitlab-ci.yml"] : [])].sort());
    const opened = writes(shown.host, "openPullRequest");
    assert.equal(opened.length, 1);
    assert.equal(opened[0][1].base, "main");
    assert.deepEqual(byClass(proposalOf(shown.target), "pull-request").map((link) => link.getAttribute("href")), [`${address.web}/pull/7`]);
    assert.deepEqual(writes(shown.host, "mergePullRequest"), []);
    assert.deepEqual(writes(shown.host, "setPipelineSchedule"), []);
  });

  // TST-759002 · level: unit · module: MOD-test-pages
  // guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; UC-027
  // given: the pull request of a Save, whose CI is first running and then, after Check CI again, green
  // input: Save, then Check CI again
  // expect: while running, the CI state names it and no Merge button is shown; once green, a Merge button is shown; listCiRuns was asked for the pull request's head
  test(`schedule on ${server} — Merge is offered only once the CI is green`, async () => {
    const shown = await saved(server, undefined, { pr: [ciRun("1", "pull_request", "running", "2026-10-20T10:01:00Z", server)], last: [] });
    const proposal = proposalOf(shown.target);
    assert.match(byClass(proposal, "ci-state")[0].textContent, /running/i);
    assert.ok(buttonOf(proposal, "Merge") === undefined, "no Merge while running");
    assert.ok(writes(shown.host, "listCiRuns").some(([, filter]) => filter.commit === PR_HEAD));
    shown.host.runs.pr = [ciRun("1", "pull_request", "success", "2026-10-20T10:01:00Z", server)];
    click(buttonOf(proposal, "Check CI again"));
    await until(() => buttonOf(proposalOf(shown.target), "Merge"), "Merge offered once green");
    assert.match(byClass(proposalOf(shown.target), "ci-state")[0].textContent, /green/i);
  });

  // TST-759003 · level: unit · module: MOD-test-pages
  // guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; UC-027
  // given: the pull request of a Save whose CI has one run failed beside one that succeeded
  // input: Save
  // expect: no Merge button; the page says the CI is red and the pull request is not merged, with a link to the server's runs of the pull request's head; nothing is merged
  test(`schedule on ${server} — a red CI is not merged`, async () => {
    const shown = await saved(server, undefined, { pr: [ciRun("1", "pull_request", "success", null, server), ciRun("2", "pull_request", "failure", null, server)], last: [] });
    const proposal = proposalOf(shown.target);
    assert.ok(buttonOf(proposal, "Merge") === undefined, "no Merge on a red CI");
    assert.match(byClass(proposal, "ci-red")[0].textContent, /not merged/i);
    assert.deepEqual(byClass(proposal, "failing-runs").map((link) => link.getAttribute("href")), [`${address.web}/commit/${PR_HEAD}/runs`]);
    assert.deepEqual(writes(shown.host, "mergePullRequest"), []);
  });

  // TST-759004 · level: unit · module: MOD-test-pages
  // guards: GITLAB PRODUCTS ARE SUPPORTED; ONE CLICK PER DECISION; UC-027
  // given: the pull request of a Save whose CI is green
  // input: one click on Merge
  // expect: the pull request is merged once, at the head it was shown with; on GitLab the pipeline schedule is set once, after the merge, and the page links the project's pipeline schedules; on GitHub no pipeline schedule is set and no such link is shown; the page says it is merged
  test(`schedule on ${server} — Merge merges at the head shown, and the pipeline schedule is set after it on GitLab only`, async () => {
    const shown = await saved(server, undefined, { pr: [ciRun("1", "pull_request", "success", null, server)], last: [] });
    click(buttonOf(proposalOf(shown.target), "Merge"));
    await until(() => byClass(shown.target, "merged").length, "the merge shown");
    assert.deepEqual(writes(shown.host, "mergePullRequest").map(([, number, head]) => [number, head]), [[7, PR_HEAD]]);
    const order = shown.host.calls.map(([call]) => call).filter((call) => call === "mergePullRequest" || call === "setPipelineSchedule");
    const links = byClass(shown.target, "pipeline-schedules").map((link) => link.getAttribute("href"));
    if (server === "gitlab") {
      assert.deepEqual(order, ["mergePullRequest", "setPipelineSchedule"]);
      assert.deepEqual(links, [SERVERS.gitlab.pipelineSchedules]);
    } else {
      assert.deepEqual(order, ["mergePullRequest"]);
      assert.deepEqual(links, []);
    }
  });

  // TST-759005 · level: unit · module: MOD-test-pages
  // guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
  // given: a product with a saved schedule whose generated file holds one line edited by hand (on GitLab also a .gitlab-ci.yml without the include entry)
  // input: the route schedule rendered
  // expect: the page lists the configuration against the schedule, with an entry for the generated file (and on GitLab for .gitlab-ci.yml)
  test(`schedule on ${server} — a configuration edited by hand is shown against the schedule`, async () => {
    const files = { "docs/tests/schedule.md": SAVED, "docs/resources.md": RESOURCES, [generated]: "name: edited by hand\n",
      ...(server === "gitlab" ? { ".gitlab-ci.yml": "stages: [test]\n" } : {}) };
    const { target } = await page(server, files);
    const listed = byTag(byClass(target, "drift")[0], "li").map((item) => item.getAttribute("data-path"));
    assert.ok(listed.includes(generated), `the generated file is listed: ${listed}`);
    if (server === "gitlab") assert.ok(listed.includes(".gitlab-ci.yml"), "the include entry is missing");
  });

  // TST-759006 · level: unit · module: MOD-test-pages
  // guards: UC-027
  // given: a product with a saved schedule and the generated file; the generated workflow's runs: push twice (the later one started last), pull request, schedule (started now) and on demand
  // input: the route schedule rendered
  // expect: the last runs list every commit, pull request, nightly and on demand, each linking its run — for every commit the one started last; no note of a missed nightly run
  test(`schedule on ${server} — the last run per occasion is shown`, async () => {
    const now = new Date().toISOString();
    const events = server === "github" ? { pr: "pull_request", demand: "workflow_dispatch" } : { pr: "merge_request_event", demand: "web" };
    const last = [ciRun("10", "push", "success", "2026-10-01T10:00:00Z", server), ciRun("11", "push", "failure", "2026-10-02T10:00:00Z", server),
      ciRun("12", events.pr, "success", "2026-10-02T11:00:00Z", server), ciRun("13", "schedule", "success", now, server),
      ciRun("14", events.demand, "success", "2026-10-03T09:00:00Z", server)];
    const { target, host } = await page(server, { "docs/tests/schedule.md": SAVED, [generated]: "x\n" }, { pr: [], last });
    assert.ok(writes(host, "listCiRuns").some(([, filter]) => filter.workflow === "agent-m-tests.yml"));
    const table = byClass(target, "last-runs")[0];
    const linkOf = (occasion) => byTag(descendants(table, (node) => node.getAttribute?.("data-occasion") === occasion)[0], "a").map((link) => link.getAttribute("href"));
    assert.deepEqual(linkOf("every commit"), [`${address.web}/runs/11`]);
    assert.deepEqual(linkOf("pull request"), [`${address.web}/runs/12`]);
    assert.deepEqual(linkOf("nightly"), [`${address.web}/runs/13`]);
    assert.deepEqual(linkOf("on demand"), [`${address.web}/runs/14`]);
    assert.equal(byClass(target, "nightly-missed").length, 0);
  });

  // TST-759007 · level: unit · module: MOD-test-pages
  // guards: UC-027
  // given: a product with a saved schedule that ticks rows for nightly at 02:00, the generated file, and a last nightly run started three days ago
  // input: the route schedule rendered
  // expect: the page names the missed nightly run with the last run's date beside the expected date (today or yesterday, UTC), and links the workflow's page; on GitHub it names that scheduled workflows of a public repository are disabled after a period without activity
  test(`schedule on ${server} — a nightly run that has not run is named`, async () => {
    const before = Date.now() - 3 * 24 * 3600 * 1000;
    const { target } = await page(server, { "docs/tests/schedule.md": SAVED, [generated]: "x\n" },
      { pr: [], last: [ciRun("13", "schedule", "success", new Date(before).toISOString(), server)] });
    const missed = byClass(target, "nightly-missed")[0];
    assert.ok(missed, "the missed nightly run is named");
    assert.ok(missed.textContent.includes(day(before)), "the last run's date");
    const now = Date.now();
    assert.ok(missed.textContent.includes(day(now)) || missed.textContent.includes(day(now - 24 * 3600 * 1000)), "the expected date");
    assert.deepEqual(byTag(missed, "a").map((link) => link.getAttribute("href")), [`${address.web}/actions`]);
    if (server === "github") assert.match(missed.textContent, /disabled/);
  });
}

// TST-759008 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: a product with the generated file and no run of the event schedule; once with a schedule that ticks nightly, once with one that ticks no row for nightly
// input: the route schedule rendered
// expect: with nightly ticked, the missed nightly run is named, saying there has been none; with none ticked, nothing is named
test("schedule — a nightly run that never ran is named only where the schedule ticks one", async () => {
  const ticked = await page("github", { "docs/tests/schedule.md": SAVED, [SERVERS.github.generated]: "x\n" }, { pr: [], last: [] });
  assert.match(byClass(ticked.target, "nightly-missed")[0].textContent, /no nightly run/i);
  const none = await page("github", { "docs/tests/schedule.md": NO_NIGHTLY, [SERVERS.github.generated]: "x\n" }, { pr: [], last: [] });
  assert.equal(byClass(none.target, "nightly-missed").length, 0);
});

// TST-759009 · level: unit · module: MOD-test-pages
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: a GitHub product whose generated file is exactly what ciConfiguration generates from its schedule for the instance alice/agent-m at the instance's commit, beside a foreign workflow ci.yml with a push trigger
// input: the route schedule rendered
// expect: the drift lists the foreign workflow and not the generated file
test("schedule — a foreign workflow is listed beside a generated file that agrees", async () => {
  const schedule = readDocument(scheduleSchema, "docs/tests/schedule.md", SAVED);
  const { files } = ciConfiguration(schedule, { server: "github", instance: INSTANCE.path, instanceCommit: INSTANCE_COMMIT }, resources, participants);
  const { target } = await page("github", { "docs/tests/schedule.md": SAVED, "docs/resources.md": RESOURCES, ...files,
    ".github/workflows/ci.yml": "on:\n  push:\njobs:\n  t:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n" });
  const listed = byTag(byClass(target, "drift")[0], "li").map((item) => item.getAttribute("data-path"));
  assert.deepEqual(listed, [".github/workflows/ci.yml"]);
});

// TST-759010 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: a product with no saved schedule and no CI configuration; beside it, the same product holding the generated file
// input: the route schedule rendered for each
// expect: without the configuration no drift and no last runs are shown, and no run is read; with it, both are shown
test("schedule — drift and last runs are shown only where the product holds a configuration", async () => {
  const { target, host } = await page("github", {});
  assert.equal(byClass(target, "drift").length, 0);
  assert.equal(byClass(target, "last-runs").length, 0);
  assert.deepEqual(writes(host, "listCiRuns"), []);
  const held = await page("github", { [SERVERS.github.generated]: "x\n" }, { pr: [], last: [] });
  assert.equal(byClass(held.target, "drift").length, 1, "known positive: the drift is shown");
  assert.equal(byClass(held.target, "last-runs").length, 1, "known positive: the last runs are shown");
});

// TST-759011 · level: unit · module: MOD-test-pages
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a saved schedule whose row system runs on no participant; the table offers lab-runner, which can run tests on the runner lab
// input: lab-runner chosen for the row system, then Save
// expect: the committed schedule file's row system runs on lab-runner
test("schedule — the runner chosen in the table is written by Save", async () => {
  const shown = await page("github", { "docs/tests/schedule.md": SAVED });
  const choice = byTag(descendants(shown.target, (node) => node.localName === "tr" && node.getAttribute("data-row") === "system")[0], "select")[0];
  choice.value = "lab-runner";
  choice.dispatchEvent(new Event("change"));
  click(saveOf(shown.target));
  await until(() => writes(shown.host, "commitFiles").length, "the commit made");
  const text = writes(shown.host, "commitFiles")[0][1].files.find((file) => file.path === "docs/tests/schedule.md").text;
  assert.match(text, /\| system \|[^\n]*\| lab-runner \|/);
});

// TST-1223006 · level: unit · module: MOD-test-pages
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; ONE CLICK PER DECISION; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-027
// given: a saved schedule whose row unit runs on every commit and whose row system does not
// input: in the table of levels, the box every commit of the row unit unticked and that of the row system ticked (each a change event), then the one Save
// expect: one commit; its docs/tests/schedule.md holds the row unit without a tick under every commit and the row system with one, the other cells of both rows as before, and the nightly time 02:00
test("TST-1223006 — schedule: the table of levels is edited in place and written by the one Save", async () => {
  const shown = await page("github", { "docs/tests/schedule.md": SAVED });
  const boxOf = (row) => byTag(descendants(shown.target, (node) => node.localName === "tr" && node.getAttribute("data-row") === row)[0], "input")
    .find((input) => input.getAttribute("type") === "checkbox" && input.parentNode.getAttribute("data-column") === "every commit");
  const unit = boxOf("unit"), system = boxOf("system");
  assert.ok(unit && system, "known positive: the boxes are drawn");
  unit.checked = false;
  unit.dispatchEvent(new Event("change"));
  system.checked = true;
  system.dispatchEvent(new Event("change"));
  assert.equal(descendants(shown.target, (node) => node.localName === "button" && node.textContent === "Save").length, 1, "one Save");
  click(saveOf(shown.target));
  await until(() => writes(shown.host, "commitFiles").length, "the commit made");
  assert.equal(writes(shown.host, "commitFiles").length, 1);
  const text = writes(shown.host, "commitFiles")[0][1].files.find((file) => file.path === "docs/tests/schedule.md").text;
  const saved = readDocument(scheduleSchema, "docs/tests/schedule.md", text);
  const cells = (row) => saved.sections.find((section) => section.heading === "## Levels").rows.find((each) => each.cells.Row === row).cells;
  const ticked = (row) => ["every commit", "pull request", "nightly", "release candidate", "on demand"].filter((column) => cells(row)[column] === "✓");
  assert.deepEqual(ticked("unit"), ["pull request", "nightly", "release candidate", "on demand"]);
  assert.deepEqual(ticked("system"), ["every commit", "nightly", "release candidate", "on demand"]);
  assert.equal(saved.fields.nightly, "02:00");
});

// TST-1223011 · level: unit · module: MOD-test-pages
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a saved schedule whose front matter names the cache paths node_modules and .cache, as schedule.schema.md describes them, one path per line
// input: the route schedule rendered; then the field cache given the three lines "node_modules", "~/.npm, a path with a comma" and ".cache", then the one Save
// expect: the field cache shows "node_modules" and ".cache" on two lines; the committed schedule's cache is the three paths, the second with its comma kept
test("TST-1223011 — schedule: the field cache holds one path per line, as the schedule's schema describes it", async () => {
  const text = SAVED.replace("nightly: 02:00", "nightly: 02:00\ncache:\n  - node_modules\n  - .cache");
  const shown = await page("github", { "docs/tests/schedule.md": text });
  const field = byTag(descendants(shown.target, (node) => node.getAttribute?.("data-key") === "cache")[0], "textarea")[0];
  assert.ok(field, "known positive: the field cache is drawn");
  assert.equal(field.value, "node_modules\n.cache");
  field.value = "node_modules\n~/.npm, a path with a comma\n.cache\n";
  field.dispatchEvent(new Event("input"));
  click(saveOf(shown.target));
  await until(() => writes(shown.host, "commitFiles").length, "the commit made");
  const written = writes(shown.host, "commitFiles")[0][1].files.find((file) => file.path === "docs/tests/schedule.md").text;
  assert.deepEqual(readDocument(scheduleSchema, "docs/tests/schedule.md", written).fields.cache, ["node_modules", "~/.npm, a path with a comma", ".cache"]);
});
