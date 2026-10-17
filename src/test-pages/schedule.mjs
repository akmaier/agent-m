// The route `schedule` — the schedule page up to Save (UC-027 steps 1 to 4), as docs/architecture/MOD-test-pages.md states it and ITM-758 builds it: the table of
// levels by occasion with each row's number of tests, the book's default marked as such until one is saved, a folded "What is this?" per row and column
// naming the book's chapter, the cells that refuse with their reason, the form of the schedule's schema (the nightly time, the command, the levels) whose
// findings are those of scheduleFindings, the runner per row among the participants with "run code and tests", and the secrets needed by name with the
// server's secrets page — never a field for a value.
//
// Not part of this item: Save and what follows it (ITM-759), and the state of a chosen self-hosted runner, the server's runner registration page and the
// command to run on that machine (UC-027 3b, ITM-850). The form's Save therefore hands the document to nothing yet; the runner choice shows the
// declared runner and offers the eligible participants, and writing a choice into the schedule is the Save's.
//
// The folded explanations are built here, not by the frame's `explain`: explanations.md holds no topic of the schedule, and it is the frame's file.
//
// Module: MOD-test-pages

import { schemaForm } from "../site-frame/index.mjs";
import { scheduleSchema, defaultSchedule, scheduleFindings, secretsNeeded } from "../test-schedule/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { participantSchema, participantsOf, eligible } from "../participant-list/index.mjs";
import { resourceSchema } from "../resource-list/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";

const SCHEDULE_PATH = "docs/tests/schedule.md";
const RESOURCES_PATH = "docs/resources.md";
const PARTICIPANTS_PATH = "docs/participants.md";
const ROWS = ["unit", "component", "system", "paid", "release", "user"];
const COLUMNS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];
const RELEASE_RULE = "A RELEASE RUNS EVERY TEST AT EVERY LEVEL";
const PAID_RULE = "COMMIT TESTS CALL NO PAID SERVICE";

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

// A folded "What is this?" with the given text.
function fold(text) {
  const summary = el("summary", null, "What is this?");
  return el("details", "explain", summary, el("p", null, text));
}

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
  const files = await Promise.all(snapshot.paths.filter(isTestFile).map(async (path) => testDeclarations(path, (await snapshot.read(path)) ?? "")));
  for (const declaration of files.flat()) {
    if (declaration.level in counts) counts[declaration.level] += 1;
    if (declaration.paid) counts.paid += 1;
  }
  return counts;
}

const read = async (host, path) => (await host.readSnapshot((await host.repositoryInfo()).defaultBranch)).read(path);

function runnerChoice(offered, current) {
  const choice = el("select", "runner", ...["hosted", ...offered].map((name) => {
    const option = el("option", null, name);
    option.setAttribute("value", name);
    return option;
  }));
  choice.value = current;
  return choice;
}

function levelsTable(schedule, counts, offered) {
  const cells = (row) => schedule.sections.find((section) => section.heading === "## Levels")?.rows?.find((candidate) => candidate.cells.Row === row)?.cells ?? {};
  const head = el("tr", null, el("th", null, "Level"), el("th", null, "tests"),
    ...COLUMNS.map((column) => {
      const th = el("th", null, column, fold(COLUMN_TEXT[column]));
      th.setAttribute("data-column", column);
      return th;
    }), el("th", null, "runs on"));
  const body = ROWS.map((row) => {
    const tr = el("tr", null, el("th", null, row, fold(ROW_TEXT[row])), el("td", "tests", String(counts[row])),
      ...COLUMNS.map((column) => {
        const reason = refusal(row, column);
        const td = el("td", reason ? "refused" : null, el("span", "mark", cells(row)[column] === "✓" ? "✓" : ""));
        if (reason) td.append(" ", el("span", "reason", reason));
        td.setAttribute("data-column", column);
        return td;
      }), el("td", null, runnerChoice(offered, cells(row)["runs on"] || "hosted")));
    tr.setAttribute("data-row", row);
    return tr;
  });
  return el("table", "levels", el("thead", null, head), el("tbody", null, ...body));
}

function secretsBlock(names, secretsPage) {
  const link = el("a", "secrets-page", "Open the server's secrets page");
  link.setAttribute("href", secretsPage);
  return el("div", "secrets", el("h3", null, "Secrets needed"),
    el("ul", null, ...names.map(({ name, for: service }) => el("li", null, `${name} (for ${service})`))),
    el("p", null, link, " Agent M never asks for a secret's value."), fold(SECRETS_TEXT));
}

async function render(target, context) {
  if (!context.product) {
    target.replaceChildren(el("p", null, "Choose a product to see its test schedule."));
    return;
  }
  const { host } = context.product;
  const snapshot = await host.readSnapshot((await host.repositoryInfo()).defaultBranch);
  const [saved, resourcesText, participantsText, counts] = await Promise.all([snapshot.read(SCHEDULE_PATH), snapshot.read(RESOURCES_PATH),
    read(context.instance.host, PARTICIPANTS_PATH), testCounts(snapshot)]);
  const schedule = saved === null || saved === undefined ? defaultSchedule() : readDocument(scheduleSchema, SCHEDULE_PATH, saved);
  const participants = readDocument(participantSchema(), PARTICIPANTS_PATH, participantsText);
  const offered = eligible(participantsOf(participants), { capabilities: ["run code and tests"] }).eligible.map(({ name }) => name);
  const findings = el("ul", "schedule-findings");
  const form = schemaForm(scheduleSchema, schedule, {
    onSave: async () => {},
    extraChecks: (document) => {
      const found = scheduleFindings(document, participants);
      findings.replaceChildren(...found.map((finding) => el("li", finding.kind, `${finding.what} — ${finding.fix} [${finding.rule}]`)));
      return found;
    },
  });
  const secrets = resourcesText ? secretsNeeded(schedule, readDocument(resourceSchema(), RESOURCES_PATH, resourcesText)) : [];
  target.replaceChildren(
    ...(schedule.default ? [el("p", "default-schedule", "This is the book's default schedule, not yet saved for this product.")] : []),
    levelsTable(schedule, counts, offered), findings, form, secretsBlock(secrets, host.webLinks().secrets));
}

export const route = { name: "schedule", entry: "tests", title: "Schedule", render };
