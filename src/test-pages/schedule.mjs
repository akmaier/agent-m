// The route `schedule` — the schedule page (UC-027), as docs/architecture/MOD-test-pages.md states it. ITM-758 builds the part before Save: the table of
// levels by occasion with each row's number of tests, the book's default marked as such until one is saved, a folded "What is this?" per row and column
// naming the book's chapter, the cells that refuse with their reason, the form of the schedule's schema (the nightly time, the command, the levels) whose
// findings are those of scheduleFindings, the runner per row among the participants with "run code and tests", and the secrets needed by name with the
// server's secrets page — never a field for a value.
//
// ITM-850 adds UC-027 3b: for each row whose runner is a participant with the route `ci runner:<label>`, the server's runner page (webLinks().runners, which shows the command
// to run on the machine), the label, a folded explanation, and the default branch's runs in the state queued whose ciRunLabels hold the row's label (ITM-1081). The page reads no runner's state.
//
// ITM-759 adds Save and what follows it (UC-027 steps 5 to 7, 1a, 1b, 3a, 6a, 7a): Save writes the runner chosen per row into the schedule and opens one pull
// request through proposeSchedule; the pull request's CI, read with listCiRuns for its head, and Merge once it is green, through mergePullRequest at the head
// shown, after which applyPipelineSchedule sets the nightly pipeline schedule on a GitLab server and the page links it; a red CI is not merged. The pull
// request is kept only in the screen. Where the product holds a CI configuration, configurationDrift shows it against the schedule; where it holds the
// generated file, the last run per occasion, told by the run's event, and a nightly run that has not run, with its date beside the expected one.
//
// The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of the schedule, and it is the frame's file.
//
// Module: MOD-test-pages

import { schemaForm } from "../site-frame/index.mjs";
import { scheduleSchema, defaultSchedule, scheduleFindings, secretsNeeded, configurationDrift, occasionsOf, proposeSchedule, applyPipelineSchedule } from "../test-schedule/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { participantSchema, participantsOf, eligible } from "../participant-list/index.mjs";
import { resourceSchema } from "../resource-list/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { storedFacts } from "../progress-measures/index.mjs";

const SCHEDULE_PATH = "docs/tests/schedule.md";
const RESOURCES_PATH = "docs/resources.md";
const PARTICIPANTS_PATH = "docs/participants.md";
const ROWS = ["unit", "component", "system", "paid", "release", "user"];
const COLUMNS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];
const RELEASE_RULE = "A RELEASE RUNS EVERY TEST AT EVERY LEVEL";
const PAID_RULE = "COMMIT TESTS CALL NO PAID SERVICE";
// The CI configuration of a product, as configurationDrift compares it, and the file the schedule generates (MOD-test-schedule, Data).
const CONFIGURATION = /^(\.github\/workflows\/[^/]+\.ya?ml|\.gitlab-ci\.yml|\.gitlab\/[^/]+\.ya?ml)$/;
const GENERATED_WORKFLOW = "agent-m-tests.yml";
const GENERATED = { github: `.github/workflows/${GENERATED_WORKFLOW}`, gitlab: `.gitlab/${GENERATED_WORKFLOW}` };
// The occasion a run stands for, told by its event on GitHub or its pipeline source on GitLab; a release candidate's run is not told apart by its event.
const OCCASION_OF_EVENT = { push: "every commit", pull_request: "pull request", merge_request_event: "pull request", schedule: "nightly",
  workflow_dispatch: "on demand", web: "on demand" };
const RUN_OCCASIONS = ["every commit", "pull request", "nightly", "on demand"];
const DAY = 24 * 60 * 60 * 1000;

const ROW_TEXT = {
  unit: "Tests of one function or class in isolation, fast and without external services. Book: ch. 13, Unit Testing.",
  component: "Tests of the interface between modules. Book: ch. 13, Component Testing.",
  system: "Tests that walk a use case end to end, with recorded responses in place of paid services. Book: ch. 13, System Testing and ch. 13 on mocking.",
  paid: "Tests that call a paid service or a model, which cut across the levels; they run nightly, not on every commit. Book: ch. 13 on mocking and the nightly integration test.",
  release: "Tests written by a participant other than the implementer, for each requirement. Book: ch. 13, Release Testing.",
  user: "Manual tests whose outcome the people assigned enter. Book: ch. 13, User Testing and Acceptance Decisions.",
};
const COLUMN_TEXT = {
  "every commit": "Runs on each push to the default branch, so a break shows at once. Book: ch. 12, Test Automation and Continuous Integration.",
  "pull request": "Runs on each pull request before its merge. Book: ch. 12, Test Automation and Continuous Integration.",
  nightly: "Runs once a night, for what is too slow or too costly for every commit, such as the integration test against real services. Book: ch. 13 on mocking and the nightly integration test.",
  "release candidate": "Runs on a release candidate, and must run every test at every level; it cannot be cleared. Book: ch. 13, Release Testing.",
  "on demand": "Runs when a person starts it, naming the rows to run. Book: ch. 12, Test Automation and Continuous Integration.",
};
const SECRETS_TEXT = "The tests that call a paid service or a model read their key from the CI's secrets. Open the server's secrets page for this product, add a secret there under the name shown, and paste its value into the server's form, never into Agent M. Book: ch. 13 on mocking and the nightly integration test.";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function link(className, text, href) {
  const node = el("a", className, text);
  node.setAttribute("href", href);
  return node;
}

// A folded "What is this?" with the given text.
function fold(text) {
  const summary = el("summary", null, "What is this?");
  return el("details", "explain", summary, el("p", null, text));
}

// What a failure says to the person: the host's reason where it names one, else its message.
const said = (error) => error?.reason ?? error?.message ?? String(error);

// The reason a cell refuses, or null: the release candidate column of every row, and the every commit and pull request cells of the row paid.
function refusal(row, column) {
  if (column === "release candidate") return `cannot be cleared: ${RELEASE_RULE}.`;
  if (row === "paid" && (column === "every commit" || column === "pull request")) {
    return `cannot be ticked: ${PAID_RULE}; use recorded responses on a commit or a pull request.`;
  }
  return null;
}

// How many tests each row holds: the row of a level counts the declarations of that level, the row paid those that name a paid service, so a paid test counts under both.
async function testCounts(snapshot) {
  const counts = Object.fromEntries(ROWS.map((row) => [row, 0]));
  // The declarations stored for the commit (MOD-progress-measures' storedFacts) are counted when there are any; otherwise the test files are told to the snapshot first, to be read in batches, and counted.
  const stored = await storedFacts(snapshot);
  let declared;
  if (stored) {
    declared = stored.tests;
  } else {
    const paths = snapshot.paths.filter(isTestFile);
    await snapshot.readMany?.(paths);
    declared = (await Promise.all(paths.map(async (path) => testDeclarations(path, (await snapshot.read(path)) ?? "")))).flat();
  }
  for (const declaration of declared) {
    if (declaration.level in counts) counts[declaration.level] += 1;
    if (declaration.paid) counts.paid += 1;
  }
  return counts;
}

function runnerChoice(offered, current) {
  const choice = el("select", "runner", ...["hosted", ...offered].map((name) => {
    const option = el("option", null, name);
    option.setAttribute("value", name);
    return option;
  }));
  choice.value = current;
  return choice;
}

const levelsOf = (schedule) => schedule.sections.find((section) => section.heading === "## Levels")?.rows ?? [];

// The table; `choices` receives, per row, its runner field and the runner it was shown with, which Save compares.
function levelsTable(schedule, counts, offered, choices) {
  const cells = (row) => levelsOf(schedule).find((candidate) => candidate.cells.Row === row)?.cells ?? {};
  const head = el("tr", null, el("th", null, "Level"), el("th", null, "tests"),
    ...COLUMNS.map((column) => {
      const th = el("th", null, column, fold(COLUMN_TEXT[column]));
      th.setAttribute("data-column", column);
      return th;
    }), el("th", null, "runs on"));
  const body = ROWS.map((row) => {
    const select = runnerChoice(offered, cells(row)["runs on"] || "hosted");
    choices.set(row, { select, shown: select.value });
    const tr = el("tr", null, el("th", null, row, fold(ROW_TEXT[row])), el("td", "tests", String(counts[row])),
      ...COLUMNS.map((column) => {
        const reason = refusal(row, column);
        const td = el("td", reason ? "refused" : null, el("span", "mark", cells(row)[column] === "✓" ? "✓" : ""));
        if (reason) td.append(" ", el("span", "reason", reason));
        td.setAttribute("data-column", column);
        return td;
      }), el("td", null, select));
    tr.setAttribute("data-row", row);
    return tr;
  });
  return el("table", "levels", el("thead", null, head), el("tbody", null, ...body));
}

// The schedule to save: the form's document with the runner chosen in the table for each row whose choice the person changed.
function withRunners(schedule, choices) {
  const chosen = structuredClone(schedule);
  for (const row of levelsOf(chosen)) {
    const choice = choices.get(row.cells.Row);
    if (choice && choice.select.value !== choice.shown) row.cells["runs on"] = choice.select.value;
  }
  return chosen;
}

const RUNNER_TEXT = "A row on a self-hosted runner waits until a machine of yours is registered to this repository with the label shown. Open the server's runner page: it shows the command to run on that machine, with a short-lived token of its own, which Agent M never sees. Until a runner with the label is online, the runs of the row stay queued. Book: ch. 12, Test Automation and Continuous Integration.";

// The label a CI agent's route `ci runner:<label> ...` names, or null.
const runnerLabel = (route) => /^ci runner:(\S+)/.exec(route ?? "")?.[1] ?? null;

// The rows whose chosen runner is a self-hosted runner of the register, each with its label.
function selfHostedRows(schedule, participants) {
  return levelsOf(schedule).flatMap((row) => {
    const label = runnerLabel(participantsOf(participants).find((each) => each.name === row.cells["runs on"])?.route);
    return label === null ? [] : [{ row: row.cells.Row, label }];
  });
}

// The runs of the default branch that wait, each with the runner labels it asks for: unreadable runs or labels are said so, the registration stays.
async function queuedRuns(host) {
  try {
    const { defaultBranch } = await host.repositoryInfo();
    const queued = (await host.listCiRuns({ branch: defaultBranch })).filter((run) => run.state === "queued");
    return await Promise.all(queued.map(async (run) => ({ run, labels: await host.ciRunLabels(run.id) })));
  } catch {
    return null;
  }
}

function runnerBlocks(rows, runnersPage, asked) {
  return rows.map(({ row, label }) => {
    const queued = asked === null ? null : asked.filter(({ labels }) => labels.includes(label)).map(({ run }) => run);
    const waiting = queued === null ? el("p", "runs-unreadable", "The runs of this repository cannot be read, so the queued ones are not shown.")
      : queued.length === 0 ? el("p", "no-queued", "No run waits for a runner.")
        : el("ul", "queued-runs", ...queued.map((run) => el("li", null, link(null, `${run.workflow} ${run.commit.slice(0, 7)} (queued)`, run.url))));
    const block = el("div", "runner-registration", el("h3", null, `Row ${row}: a self-hosted runner`),
      el("p", null, "The runner must carry the label ", el("span", "runner-label", label), ". ", link("runner-page", "Open the server's runner page", runnersPage)), waiting, fold(RUNNER_TEXT));
    block.setAttribute("data-row", row);
    return block;
  });
}

function secretsBlock(names, secretsPage) {
  return el("div", "secrets", el("h3", null, "Secrets needed"),
    el("ul", null, ...names.map(({ name, for: service }) => el("li", null, `${name} (for ${service})`))),
    el("p", null, link("secrets-page", "Open the server's secrets page", secretsPage), " Agent M never asks for a secret's value."), fold(SECRETS_TEXT));
}

// ---------------------------------------------------------------- the configuration against the schedule (UC-027 1a, 1b)

function driftBlock(files, schedule, target, resources, participants) {
  const block = el("div", "drift", el("h3", null, "The configuration against the schedule"));
  let found;
  try {
    found = configurationDrift(files, schedule, target, resources, participants);
  } catch (error) {
    block.append(el("p", "drift-unknown", `The configuration cannot be compared with the schedule: ${said(error)}`));
    return block;
  }
  if (found.length === 0) {
    block.append(el("p", "drift-none", "The committed configuration agrees with the schedule."));
    return block;
  }
  block.append(el("ul", null, ...found.map(({ path, difference }) => {
    const item = el("li", null, el("code", null, path), ` — ${difference}`);
    item.setAttribute("data-path", path);
    return item;
  })), el("p", null, "Save generates Agent M's file from the schedule again. A configuration Agent M did not generate stays beside it; removing it is your decision in that pull request."));
  return block;
}

// ---------------------------------------------------------------- the last runs (UC-027 step 7, 7a)

// The run of an occasion started last, or null.
function lastRun(runs, occasion) {
  return runs.filter((run) => OCCASION_OF_EVENT[run.event] === occasion)
    .reduce((last, run) => (last === null || (run.started ?? "") > (last.started ?? "") ? run : last), null);
}

const dateOf = (iso) => (iso ?? "").slice(0, 10);

// The date of the last nightly time, `HH:MM` in UTC, that has passed by `now`.
function expectedNightly(time, now) {
  const [hours, minutes] = String(time ?? "").split(":").map(Number);
  const today = new Date(now);
  const at = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hours || 0, minutes || 0);
  return new Date(at <= now ? at : at - DAY).toISOString().slice(0, 10);
}

function lastRunsBlock(runs, schedule, server, links) {
  const block = el("div", "last-runs-block", el("h3", null, "The last run per occasion"));
  if (runs === null) {
    block.append(el("p", "runs-unreadable", "The runs of this repository cannot be read, so the last runs are not shown."));
    return block;
  }
  block.append(el("table", "last-runs", el("tbody", null, ...RUN_OCCASIONS.map((occasion) => {
    const run = lastRun(runs, occasion);
    const tr = el("tr", null, el("th", null, occasion),
      el("td", null, run ? link(null, `${run.state}, ${dateOf(run.started) || "not started"}`, run.url) : "no run yet"));
    tr.setAttribute("data-occasion", occasion);
    return tr;
  }))), el("p", null, "A release candidate's run is shown on the release panel."));
  const nightly = ROWS.some((row) => occasionsOf(row, schedule).includes("nightly"));
  if (nightly) {
    const expected = expectedNightly(schedule.fields?.nightly, Date.now());
    const last = lastRun(runs, "nightly");
    if (!last || dateOf(last.started) < expected) {
      const missed = el("p", "nightly-missed", "The nightly run has not run: ",
        last ? `its last run was on ${dateOf(last.started) || "a date the server does not name"}` : "there has been no nightly run", `, expected on ${expected}. `);
      if (server === "github") missed.append("On GitHub, the scheduled workflows of a public repository are disabled after a period without activity; the workflow's page shows whether it is, and enables it again. ");
      missed.append(link("workflow-page", "Open the workflow's page", links.actions));
      block.append(missed);
    }
  }
  return block;
}

// ---------------------------------------------------------------- the pull request, its CI and its merge (UC-027 steps 5, 6, 3a, 6a)

// green, red, running or none, from the runs of the pull request's head.
function verdict(runs) {
  if (runs.length === 0) return "none";
  if (runs.some((run) => run.state === "failure" || run.state === "cancelled")) return "red";
  if (runs.every((run) => run.state === "success" || run.state === "skipped") && runs.some((run) => run.state === "success")) return "green";
  return "running";
}
const VERDICT_TEXT = { green: "The CI is green.", red: "The CI is red.", running: "The CI is running.", none: "No CI run has started for the pull request yet." };

async function drawProposal(place, host, pullRequest, schedule) {
  const box = el("div", "schedule-proposal", el("h3", null, "The schedule's pull request"),
    el("p", null, link("pull-request", `Pull request #${pullRequest.number}: ${pullRequest.title}`, pullRequest.url)));
  let runs = null;
  try {
    runs = await host.listCiRuns({ commit: pullRequest.head });
  } catch (error) {
    box.append(el("p", "ci-state", `The CI of the pull request cannot be read: ${said(error)}`));
  }
  if (runs !== null) {
    const state = verdict(runs);
    box.append(el("p", "ci-state", VERDICT_TEXT[state]),
      el("ul", "ci-runs", ...runs.map((run) => el("li", null, link(null, `${run.workflow}: ${run.state}`, run.url)))));
    if (state === "red") {
      box.append(el("p", "ci-red", "The pull request is not merged while its CI is red. Fix the tests or the schedule first; ",
        link("failing-runs", "the runs of the pull request", host.webLinks().commitRuns(pullRequest.head)), "."));
    }
    if (state === "green") {
      const merge = el("button", "merge", "Merge");
      merge.setAttribute("type", "button");
      merge.addEventListener("click", () => mergeAndSchedule(box, merge, host, pullRequest, schedule));
      box.append(merge);
    }
  }
  const again = el("button", "refresh", "Check CI again");
  again.setAttribute("type", "button");
  again.addEventListener("click", () => drawProposal(place, host, pullRequest, schedule));
  box.append(again);
  place.replaceChildren(box);
}

// The person's Merge: the pull request merged at the head shown, then, on a GitLab server, the nightly pipeline schedule set and linked.
async function mergeAndSchedule(box, button, host, pullRequest, schedule) {
  button.disabled = true;
  let commit;
  try {
    ({ commit } = await host.mergePullRequest(pullRequest.number, pullRequest.head));
  } catch (error) {
    const text = error?.name === "Moved" ? "The pull request moved since its CI was shown; check its CI again." : `The pull request was not merged: ${said(error)}`;
    box.append(el("p", "merge-failed", text));
    button.disabled = false;
    return;
  }
  const merged = el("p", "merged", `Merged as ${commit.slice(0, 7)}.`);
  box.append(merged);
  try {
    const pipeline = await applyPipelineSchedule(host, schedule);
    if (pipeline) merged.append(" The nightly run is set as the project's pipeline schedule: ", link("pipeline-schedules", "the project's pipeline schedules", pipeline.url), ".");
  } catch (error) {
    merged.append(` The nightly pipeline schedule could not be set: ${said(error)}`);
  }
}

// ---------------------------------------------------------------- the route

async function render(target, context) {
  if (!context.product) {
    target.replaceChildren(el("p", null, "Choose a product to see its test schedule."));
    return;
  }
  const { host, kind: server } = context.product;
  const instanceHost = context.instance.host;
  const [snapshot, instance] = await Promise.all([host.readSnapshot((await host.repositoryInfo()).defaultBranch),
    instanceHost.readSnapshot((await instanceHost.repositoryInfo()).defaultBranch)]);
  const [saved, resourcesText, participantsText, counts] = await Promise.all([snapshot.read(SCHEDULE_PATH), snapshot.read(RESOURCES_PATH),
    instance.read(PARTICIPANTS_PATH), testCounts(snapshot)]);
  const schedule = saved === null || saved === undefined ? defaultSchedule() : readDocument(scheduleSchema, SCHEDULE_PATH, saved);
  const participants = readDocument(participantSchema(), PARTICIPANTS_PATH, participantsText);
  const resources = readDocument(resourceSchema(), RESOURCES_PATH, resourcesText ?? "");
  // The target of the generated configuration: the product's server, the instance as its snapshot names it — its path on GitHub, its address on GitLab,
  // where the pipeline clones it — and the commit of the instance's default branch.
  const targetOf = () => ({ server, instance: server === "github" ? instance.repository.path : instance.repository.web, instanceCommit: instance.commit });
  const offered = eligible(participantsOf(participants), { capabilities: ["run code and tests"] }).eligible.map(({ name }) => name);
  const findings = el("ul", "schedule-findings");
  const proposal = el("div", "proposal-place");
  const choices = new Map();
  const table = levelsTable(schedule, counts, offered, choices);
  const form = schemaForm(scheduleSchema, schedule, {
    onSave: async (document) => {
      const chosen = withRunners(document, choices);
      try {
        const { pullRequest } = await proposeSchedule(host, chosen, { ...targetOf(), resources, participants, head: snapshot.commit, trailers: [] });
        await drawProposal(proposal, host, pullRequest, chosen);
      } catch (error) {
        proposal.replaceChildren(el("p", "save-failed", `Nothing was saved: ${said(error)}`));
      }
    },
    extraChecks: (document) => {
      const found = scheduleFindings(document, participants);
      findings.replaceChildren(...found.map((finding) => el("li", finding.kind, `${finding.what} — ${finding.fix} [${finding.rule}]`)));
      return found;
    },
  });
  const secrets = resourcesText ? secretsNeeded(schedule, resources) : [];
  const selfHosted = selfHostedRows(schedule, participants);
  const links = host.webLinks();
  const runners = selfHosted.length ? runnerBlocks(selfHosted, links.runners, await queuedRuns(host)) : [];
  const configuration = snapshot.paths.filter((path) => CONFIGURATION.test(path));
  const configured = [];
  if (configuration.length) {
    const files = Object.fromEntries(await Promise.all(configuration.map(async (path) => [path, (await snapshot.read(path)) ?? ""])));
    configured.push(driftBlock(files, schedule, targetOf(), resources, participants));
  }
  if (snapshot.paths.includes(GENERATED[server])) {
    let runs = null;
    try { runs = await host.listCiRuns({ workflow: GENERATED_WORKFLOW }); } catch { runs = null; }
    configured.push(lastRunsBlock(runs, schedule, server, links));
  }
  target.replaceChildren(
    ...(schedule.default ? [el("p", "default-schedule", "This is the book's default schedule, not yet saved for this product.")] : []),
    table, ...runners, findings, form, proposal, secretsBlock(secrets, links.secrets), ...configured);
}

export const route = { name: "schedule", entry: "tests", title: "Schedule", render };
