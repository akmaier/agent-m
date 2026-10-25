// The fixture product the pages of tests/site-usability.test.mjs are drawn over: a SPEC of two sections and five requirements, three use
// cases (one accepted and changed since, one open, one with a table, a diagram and a long line), an architecture decision and three modules (one accepted),
// a queue of two SPEC change entries, a group file, the process declaration of a product with two teams, a backlog of five items, the
// sprint of each team and three pull requests. Names and titles are as long as the repository's own, so that a page meets the widths
// it meets in use. It is test data; it holds no expected result.
//
// Module: MOD-site-frame
// Level: system

import { readFileSync } from "node:fs";
import { blobSha } from "../../src/text-tools/index.mjs";

const root = new URL("../..", import.meta.url).pathname;

const SPEC = `# Fixture product — Specification

## 1. Reading

**THE READER READS A FILE AT A PINNED COMMIT** *(PO A. Maier)*
The reader returns the exact text of one file at one pinned commit of the product's repository.
*Check:* \`tests/reader.test.mjs\`

**A MISSING FILE IS NAMED, NEVER GUESSED AT** *(PO A. Maier)*
A file that the pinned commit does not hold is reported by its path and never replaced by another file's text.
*Check:* \`tests/reader.test.mjs\`

**THE LIST OF FILES IS COMPLETE OR THE READER SAYS SO** *(PO A. Maier)*
A listing of the pinned commit's files holds every file or states that it was cut short.
*Check:* no automatic check; at review.

## 2. Writing

**A WRITE IS ONE COMMIT UNDER THE PERSON'S OWN ACCOUNT** *(PO A. Maier)*
Every write the page makes is one commit made with the token of the person who clicked.
*Check:* \`tests/writer.test.mjs\`

**NOTHING IS WRITTEN WITHOUT A CLICK** *(PO A. Maier)*
The page writes to the repository only as the direct result of a person's click.
*Check:* \`tests/writer.test.mjs\`
`;

const SOURCE_NAMES = ["THE READER READS A FILE AT A PINNED COMMIT", "A MISSING FILE IS NAMED, NEVER GUESSED AT"];

const useCase = (id, title, body = "") => `---
id: ${id}
title: ${title}
area: 1 reading
actors:
  - Reader
  - Repository server
realises:
  - ${SOURCE_NAMES[0]}
---
# ${id} ${title}

**Goal.** The reader sees the text of a file exactly as the pinned commit holds it.

## Actors

- **Reader** — a person with the page open.
- **Repository server** — answers the page's reads.

## Precondition

- A product is managed by the instance.

## Main flow

1. The reader opens a file's page.
2. The page reads the file at the pinned commit.
3. The page shows the text.
${body}
## Alternative flows

- **2a. The file is missing.** The page names its path.

## Postcondition

- The page shows the text of the file and nothing else.
`;

const TABLE = `
| Request | Path read | Batch | Answer when the file is missing | Answer when the commit is unknown | Counted as |
|---|---|---|---|---|---|
| \`readFile\` | \`docs/use-cases/UC-001-read-a-file-at-a-pinned-commit.md\` | one hundred files at most | the path, named | the commit, named | one request |
| \`listTree\` | the whole tree of the pinned commit | none | not applicable | the commit, named | one request |
`;

const DIAGRAM = `
\`\`\`mermaid
sequenceDiagram
    actor R as Reader
    participant P as Page
    participant S as Repository server
    R->>P: open a file
    P->>S: read the file at the pinned commit
    S-->>P: the text, or not found
    P-->>R: the text, or the path that is missing
\`\`\`

\`/repos/akmaier/agent-m/git/trees/0123456789abcdef0123456789abcdef01234567?recursive=1&per_page=100&page=1&format=json\`
`;

const decision = `---
id: ARC-001
title: The pages are a static client of the Git server's API
forced_by:
  - ${SOURCE_NAMES[0]}
  - UC-001
---
# ARC-001 The pages are a static client of the Git server's API

## Context

The product has no server of its own.

## Decision

The pages read and write through the Git server's API.

## Alternatives

- A small server of our own — rejected: it would have to be operated.

## Consequences

Every write is a commit made with the person's own token.
`;

const moduleFile = (id, title, uses = []) => `---
id: ${id}
title: ${title}
folder: src/${id.slice(4)}/
realises:
  - ${SOURCE_NAMES[0]}
follows:
  - ARC-001
uses:${uses.length ? `\n${uses.map((use) => `  - ${use}`).join("\n")}` : ""}
provides:
  - read
---
# ${id} ${title}

## Responsibility

${title}.

## Interfaces

- \`read(path) -> text | null\` — the exact text of one file at the pinned commit.
`;

const approval = async (kind, file, text) => {
  const blob = await blobSha(text);
  return [`docs/approvals/${file.split("/").pop().replace(/\.md$/, "").split("-").slice(0, 2).join("-")}-${blob.slice(0, 12)}.md`, `kind: ${kind}\nfile: ${file}\nblob: ${blob}\n`];
};

const QUEUE = "docs/spec-freigaben/2026-10-18_sample";
const queueIndex = ["# SPEC approvals — queue 2026-10-18_sample · sample queue", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
  "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
  "| 1 | `SPEC.md` | ## 1. Reading | ## 2. Writing | — |", "| 2 | `SPEC.md` | ## 2. Writing | — | — |", ""].join("\n");
const entryOne = SPEC.slice(SPEC.indexOf("## 1. Reading"), SPEC.indexOf("## 2. Writing")).replace("exact text of one file", "exact text of exactly one file");
const entryTwo = SPEC.slice(SPEC.indexOf("## 2. Writing")) + "\n**A WRITE NAMES THE COMMIT IT MADE** *(PO A. Maier)*\nThe page shows the commit a write made as a link.\n*Check:* `tests/writer.test.mjs`\n";

const DECLARATION = ["---", "model: scrum-wip", "model_file: docs/process-models/scrum-wip.md", `model_version: ${"c0ffee".padEnd(40, "0")}`, "---",
  "# How the fixture product is developed", "", "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|",
  "| Sprint | `sprint/<team>/<nn>` |", "", "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const assignment = (team, owner, builder) => `# ${team}\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | ${owner} |\n| Builders | ${builder} |\n| Checker | ${builder} |\n`;
const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemText = (n, title, modules, buildsOn = []) => ["---", `id: ${id(n)}`, `title: ${title}`, "level: module", "realises:", `  - ${SOURCE_NAMES[0]}`, "modules:",
  ...modules.map((module) => `  - ${module}`), ...(buildsOn.length ? ["builds_on:", ...buildsOn.map((each) => `  - ${each}`)] : ["builds_on: []"]), "tests:", "  - unit",
  "origin:", `  - ${SOURCE_NAMES[0]}`, "---", `# ${id(n)} ${title}`, "", "## Outcome", "", `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.", ""].join("\n");
const ITEMS = [
  [1, "Show each team's running sprint with the state of every item it holds", ["MOD-pages", "MOD-progress-measures"]],
  [2, "Read the product's pull requests once per page load and derive their merge times", ["MOD-reader"]],
  [3, "Draw the burn-down of a closed sprint from its start through each merge to its end", ["MOD-pages"]],
  [4, "Name the module a held item changes beside every item it keeps from another team", ["MOD-pages"], ["ITM-003"]],
  [5, "Count the items of a sprint left at its start, after each merge of one of them, and now", ["MOD-progress-measures"]],
];

// The text of use case UC-001 when it was accepted: its goal said less. The file at the default branch is the changed one, so that its page and
// Review all draw the difference to the last accepted text.
const ACCEPTED_FIRST = () => useCase("UC-001", "Read a file at a pinned commit", TABLE + DIAGRAM).replace("exactly as the pinned commit holds it", "as the pinned commit holds it");

// history() -> string[] — the texts of the earlier commits that the fixture's approval records name and its default branch no longer holds.
export const history = async () => [ACCEPTED_FIRST()];

// files() -> Promise<{ path: text }> — the fixture product's repository at its default branch.
export async function files() {
  const first = useCase("UC-001", "Read a file at a pinned commit", TABLE + DIAGRAM);
  const second = useCase("UC-002", "Name a file the commit does not hold");
  const third = useCase("UC-003", "List every file of the pinned commit");
  const pages = moduleFile("MOD-pages", "The pages every reader sees", ["MOD-reader.read"]);
  const reader = moduleFile("MOD-reader", "Reads files at a pinned commit");
  const progress = moduleFile("MOD-progress-measures", "Derives the progress of a product", ["MOD-reader.read"]);
  const records = [await approval("use-case", "docs/use-cases/UC-001-read-a-file-at-a-pinned-commit.md", ACCEPTED_FIRST()),
    await approval("decision", "docs/architecture/ARC-001-static-client.md", decision), await approval("module", "docs/architecture/MOD-reader.md", reader)];
  return {
    "SPEC.md": SPEC,
    "docs/use-cases/UC-001-read-a-file-at-a-pinned-commit.md": first,
    "docs/use-cases/UC-002-name-a-file-the-commit-does-not-hold.md": second,
    "docs/use-cases/UC-003-list-every-file-of-the-pinned-commit.md": third,
    "docs/architecture/ARC-001-static-client.md": decision,
    "docs/architecture/MOD-pages.md": pages,
    "docs/architecture/MOD-reader.md": reader,
    "docs/architecture/MOD-progress-measures.md": progress,
    ...Object.fromEntries(records),
    "docs/groups/requirements.md": "# Requirements — groups\n\n- Reading\n  - THE READER READS A FILE AT A PINNED COMMIT\n  - A MISSING FILE IS NAMED, NEVER GUESSED AT\n- Writing\n  - A WRITE IS ONE COMMIT UNDER THE PERSON'S OWN ACCOUNT\n",
    [`${QUEUE}/index.md`]: queueIndex,
    [`${QUEUE}/01-reading.md`]: entryOne,
    [`${QUEUE}/01-reading.begruendung.md`]: "# Why\n\nThe text names that exactly one file is read.\n",
    [`${QUEUE}/02-writing.md`]: entryTwo,
    [`${QUEUE}/02-writing.begruendung.md`]: "# Why\n\nA write must name the commit it made.\n",
    [`${QUEUE}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n",
    "docs/process.md": DECLARATION,
    "docs/process-models/scrum-wip.md": readFileSync(`${root}docs/process-models/scrum-wip.md`, "utf8"),
    "docs/role-assignments/team1.md": assignment("team1", "alice", "developer-with-a-long-account-name"),
    "docs/role-assignments/team2.md": assignment("team2", "bob", "developer-b"),
    ...Object.fromEntries(ITEMS.map(([n, title, modules, buildsOn]) => [`docs/backlog/${id(n)}-item-${n}.md`, itemText(n, title, modules, buildsOn)])),
    "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Show the running sprints and how far each has come\nstart: 2026-09-14\nend:\ncloser: alice\nbranch: sprint/team1/01\nselection:\n  - ITM-001\n  - ITM-002\n  - ITM-005\n---\n# team1 Sprint 01\n",
    "docs/backlog/sprints/team2/01.md": "---\nsprint: 1\ngoal: Mail\nstart: 2026-09-01\nend: 2026-09-07\ncloser: bob\nbranch:\nselection:\n  - ITM-003\n---\n# team2 Sprint 01\n\n## Review\n\nNo item is done.\n\n## Unfinished items\n\nto the backlog: ITM-003\ninto the next sprint:\n\nITM-003 waits for the mail server.\n\n## Retrospective\n\n- change: smaller items.\n",
  };
}

const pull = ({ number, item, base, created, merged = null }) => ({ number, title: `${item}: the work of ${item}`, head: { ref: `team/${item}`, sha: "b".repeat(40) },
  base: { ref: base }, state: merged ? "closed" : "open", created_at: created, merged_at: merged, merge_commit_sha: merged ? "f".repeat(40) : null,
  body: "developer-a · fixture-model\n\nWhat the pull request does." });
const PULLS = [pull({ number: 1, item: "ITM-001", base: "sprint/team1/01", created: "2026-09-14T08:00:00Z", merged: "2026-09-14T09:30:00Z" }),
  pull({ number: 2, item: "ITM-002", base: "sprint/team1/01", created: "2026-09-14T08:10:00Z" }),
  pull({ number: 5, item: "ITM-005", base: "sprint/team1/01", created: "2026-09-14T08:20:00Z", merged: "2026-09-14T11:45:00Z" })];

// tagsHandler(repository) -> (url, init) -> Response | undefined — GitHub's list of the release tags: the fixture product has none yet.
export const tagsHandler = (repository) => async (url, init) => {
  if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${repository}/tags` || init.method !== "GET") return undefined;
  return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
};

// pullsHandler(repository) -> (url, init) -> Response | undefined — GitHub's list of the pull requests, as repoServer's handlers are.
export const pullsHandler = (repository) => async (url, init) => {
  if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${repository}/pulls` || init.method !== "GET") return undefined;
  const state = url.searchParams.get("state") ?? "open", per = Number(url.searchParams.get("per_page") ?? 30), page = Number(url.searchParams.get("page") ?? 1);
  const list = PULLS.filter((each) => state === "all" || each.state === state).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return new Response(JSON.stringify(list.slice((page - 1) * per, page * per)), { status: 200, headers: { "Content-Type": "application/json" } });
};
