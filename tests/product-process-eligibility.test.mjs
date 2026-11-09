// A holder's capabilities and place among a role assignment's findings (ITM-231, moved with the holders from the
// declaration to the role assignments, UC-048): a warning naming an agent holder no connection of whose model has a
// capability its role needs (UC-048 3b), and a warning naming a connection of a holder's model at a processing place a
// linked source does not permit (UC-048 3c). Both go through MOD-participant-list's eligible, over the participants
// MOD-participant-list's participantsOf joins with the connections given. A person runs on no connection and is judged by
// neither.
// Run: node --test tests/product-process-eligibility.test.mjs
//
// Module: MOD-product-process
// Guards: UC-048; A ROLE NAMES THE CAPABILITIES IT NEEDS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// The fixture product declares the same instance model as tests/product-process.test.mjs, docs/process-models/team-scrum.md
// (team-scrum: Scrum adapted so that its Product Owner is a person), at the commit VERSION. Its role assignment fills Product
// Owner and Scrum Master with alice, a person, and Developers with dev-a alone, an agent whose model one connection of this
// browser offers, a Bridge's coding agent at "this machine" — so only that connection's capabilities and place are ever in
// question; alice is never judged. Nothing reaches the network. Each test states
// its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { catalogue } from "../src/model-catalogue/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import { declarationSchema, roleAssignmentFindings, roleAssignmentSchema, workflowOf } from "../src/product-process/index.mjs";

const CAPABILITY = "A ROLE NAMES THE CAPABILITIES IT NEEDS";
const PERMITTED = "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS";

const DECLARATION_PATH = "docs/process.md";
const MODEL_PATH = "docs/process-models/team-scrum.md";

// The commit of the instance snapshot the fixture declaration names as its model's version.
const VERSION = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

// ---------------------------------------------------------------- texts and their lines

const linesOf = (text) => text.split("\n");

// The 1-based line of the first line of `text` that starts with `prefix`; so a fixture's row lines are found from its own
// text, never counted by hand.
const lineOf = (text, prefix) => linesOf(text).findIndex((line) => line.startsWith(prefix)) + 1;

// ---------------------------------------------------------------- the fixture instance's model

// team-scrum, as tests/product-process.test.mjs holds it at VERSION: Product Owner (person; read, write), Scrum Master
// (either; read), Developers (agent; read, write, run code and tests) — without a finding of its own.
const MODEL = [
  "---",
  "name: team-scrum",
  "kind: pulled",
  "adapted_from: scrum",
  "measure: remaining items per time box",
  "---",
  "# Scrum with a person as Product Owner",
  "",
  "The shipped Scrum model, adapted by the instance: its Product Owner is a person, its Developers are agents.",
  "",
  "## Phases",
  "",
  "| Name | Role | Produces |",
  "|---|---|---|",
  "| Sprint Planning | Product Owner | ITM |",
  "| Development | Developers | MOD, TST |",
  "| Sprint Review | Product Owner | sprint record |",
  "| Sprint Retrospective | Scrum Master | sprint record |",
  "",
  "## Transitions",
  "",
  "| From | To | Kind |",
  "|---|---|---|",
  "| Sprint Planning | Development | sequence |",
  "| Development | Sprint Review | sequence |",
  "| Sprint Review | Sprint Retrospective | sequence |",
  "| Sprint Retrospective | Sprint Planning | back |",
  "",
  "## Verification pairs",
  "",
  "| Phase | Checked by |",
  "|---|---|",
  "| Development | Sprint Review |",
  "",
  "## Gates",
  "",
  "| Between | Artifacts | Condition | Decider |",
  "|---|---|---|---|",
  "| Development → Sprint Review | the increment: the MOD and TST of the selected ITM | every selected item meets its "
    + "acceptance criteria | Product Owner |",
  "| Sprint Retrospective → Sprint Planning | the sprint record of the review and the retrospective | the retrospective "
    + "names how the team will improve | Product Owner |",
  "",
  "## Roles",
  "",
  "| Name | Filled by | How many | Capabilities |",
  "|---|---|---|---|",
  "| Product Owner | person | one | read the repository, write to the repository |",
  "| Scrum Master | either | one | read the repository |",
  "| Developers | agent | several | read the repository, write to the repository, run code and tests |",
  "",
  "## Flow control",
  "",
  "| Kind | Value |",
  "|---|---|",
  "| WIP limit | — |",
  "| Time box | 1 week |",
  "| Sprints | yes |",
  "",
].join("\n");

// A blob for each path of a fixture snapshot: 40 hexadecimal digits, another for every path.
const blobOf = (path) => createHash("sha1").update(path).digest("hex");

// The snapshot of the instance repository at VERSION holding these files, as MOD-repository-hosts' Snapshot gives it.
function snapshotAt(files) {
  const texts = new Map(Object.entries(files));
  return {
    repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" },
    ref: "main",
    commit: VERSION,
    paths: [...texts.keys()],
    read: async (path) => texts.get(path) ?? null,
    blob: (path) => (texts.has(path) ? blobOf(path) : null),
  };
}

// The Catalogue at the commit the declaration names, as MOD-model-catalogue's catalogue gives it over the instance's
// snapshot at that commit.
const catalogueAt = (files) => catalogue(snapshotAt(files));

// ---------------------------------------------------------------- the fixture product's declaration

// Product Owner and Scrum Master held by alice, a person (never judged on a connection); Developers held by dev-a alone, an
// agent on a connection at "this machine" (both the connection's capabilities and its place are judged).
const DECLARATION = [
  "---",
  "model: team-scrum",
  `model_file: ${MODEL_PATH}`,
  `model_version: ${VERSION}`,
  "---",
  "# How the fixture product is developed",
  "",
  "The fixture product's process, as its Author declared it.",
  "",
  "## Practices",
  "",
  "- none",
  "",
  "## Branches",
  "",
  "| Phase or time box | Branch |",
  "|---|---|",
  "",
  "## Definition of Done",
  "",
  "The job rules hold for every pull request; no condition is added.",
  "",
].join("\n");

const declarationOf = (text) => readDocument(declarationSchema, DECLARATION_PATH, text);

// The product's one role assignment: Product Owner and Scrum Master filled with alice, Developers with dev-a alone.
const ASSIGNMENT_PATH = "docs/role-assignments/team.md";
const ASSIGNMENT = [
  "# Team",
  "",
  "## Roles",
  "",
  "| Role | Participants |",
  "|---|---|",
  "| Product Owner | alice |",
  "| Scrum Master | alice |",
  "| Developers | dev-a |",
  "",
].join("\n");
const assignmentOf = (text) => readDocument(roleAssignmentSchema, ASSIGNMENT_PATH, text);

// The row of ## Roles that fills Developers with dev-a alone — found in the text itself, never counted by hand.
const DEVELOPERS_LINE = lineOf(ASSIGNMENT, "| Developers |");

// The instance's own SPEC: no process requirement, so the declaration adds no row under ## Gates added by requirements.
const INSTANCE_SPEC = [
  "# Fixture instance — Specification",
  "",
  "The instance's own requirements; those on the development process are the process requirements of its products.",
  "",
  "## 1. Process",
  "",
].join("\n");

// ---------------------------------------------------------------- the fixture register of participants

// alice, a person; dev-a, an agent of the model example-model. The title line is "# Participants of this instance" verbatim:
// participants.schema.md names it as the heading of the table's section, the register having no heading of its own
// (MOD-participant-list, Data).
const REGISTER = readDocument(participantSchema(), "docs/participants.md", [
  "# Participants of this instance",
  "",
  "**REGISTER**",
  "",
  "The people and agents who work on the products of the fixture instance, one row per participant.",
  "",
  "| Name | Type | Model |",
  "|---|---|---|",
  "| alice | person | — |",
  "| dev-a | agent | example-model |",
  "",
].join("\n"));

// This browser's one connection that offers example-model, as MOD-prompt-bar's sessionsOffered gives it: the coding agent
// claude of the Bridge lab-pc, at "this machine", with the given capabilities.
const connectionsWith = (capabilities) => [{ name: "lab-pc:claude", type: "CLI agent", model: "example-model",
  context: 200000, capabilities: capabilities.split(", "), place: "this machine", route: "bridge lab-pc agent claude" }];

// Every capability Developers needs (and one more, draft text) — dev-a with this capability list lacks none of them.
const FULL_CAPABILITIES = "draft text, read the repository, write to the repository, run code and tests";

// ---------------------------------------------------------------- the fixture's linked source

// A restricted source whose content may be given only at NHR@FAU, Erlangen — never at "this machine", dev-a's place.
const RESTRICTED_SOURCE_PATH = "docs/sources/SRC-restricted-test.md";
const RESTRICTED_SOURCE = readDocument(sourceSchemas().entry, RESTRICTED_SOURCE_PATH, [
  "---",
  "id: SRC-restricted-test",
  "title: Restricted test source",
  "kind: document",
  "authority: informational",
  "licence: restricted — test fixture only",
  "places:",
  "  - NHR@FAU, Erlangen",
  "---",
  "# SRC-restricted-test Restricted test source",
  "",
  "A fixture source whose content may be given only at NHR@FAU, Erlangen.",
  "",
  "## Versions",
  "",
  "| Version | Date | Edition | Read from | Files |",
  "|---|---|---|---|---|",
  "| `2026-10-01` | 2026-10-01 | fixture | fixture only | none |",
  "",
].join("\n"));

// ---------------------------------------------------------------- roleAssignmentFindings

const brief = (found) => found.map((f) => [f.line, f.kind, f.rule]);

// The product's workflow from its declaration and team-scrum, as the Catalogue at VERSION gives it.
async function workflowAt(cat) {
  return workflowOf(declarationOf(DECLARATION), cat.models.find((model) => model.path === MODEL_PATH), [], INSTANCE_SPEC);
}

// TST-472429 · level: unit · module: MOD-product-process
// guards: UC-048; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: the fixture role assignment — Developers held by dev-a alone; team-scrum at VERSION, without a finding of its own; the fixture register; the one connection of dev-a's model (a) with every capability Developers needs, (b) without "run code and tests", which Developers needs; no linked source
// input: roleAssignmentFindings([the role assignment], the workflow, the register, that connection, [])
// expect: (a) no finding; (b) one warning — the assignment stays possible (UC-048 3b) —, on the row of Developers, naming A ROLE NAMES THE CAPABILITIES IT NEEDS; its text names the holder dev-a, the role Developers and the capability run code and tests
test("roleAssignmentFindings — an agent holder no connection of whose model has a capability its role needs is a warning, naming the holder, the role and the capability", async () => {
  const cat = await catalogueAt({ [MODEL_PATH]: MODEL });
  assert.deepEqual(cat.findings[MODEL_PATH], [], "team-scrum has no finding at VERSION");
  const workflow = await workflowAt(cat);
  const assignment = assignmentOf(ASSIGNMENT);

  const full = roleAssignmentFindings([assignment], workflow, REGISTER, connectionsWith(FULL_CAPABILITIES), []);
  assert.deepEqual(brief(full), [], "dev-a's connection has every capability Developers needs");

  const short = "draft text, read the repository, write to the repository";
  const found = roleAssignmentFindings([assignment], workflow, REGISTER, connectionsWith(short), []);
  assert.deepEqual(brief(found), [[DEVELOPERS_LINE, "warning", CAPABILITY]]);
  assert.ok(found[0].what.includes("dev-a") && found[0].what.includes("Developers")
    && found[0].what.includes("run code and tests"), found[0].what);
});

// TST-472430 · level: unit · module: MOD-product-process
// guards: UC-048; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the fixture role assignment — Developers held by dev-a alone, on its one connection at "this machine"; Product Owner and Scrum Master both held by alice, a person; team-scrum at VERSION; the restricted source, which permits only NHR@FAU, Erlangen, linked; the connection with every capability Developers needs, so only the place is in question
// input: roleAssignmentFindings([the role assignment], the workflow, the register, that connection, [the restricted source])
// expect: one warning, on the row of Developers, naming RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; its text names the holder dev-a, the role Developers, the connection by its route bridge lab-pc agent claude and the source SRC-restricted-test. No finding names alice, who holds two roles while the same source is linked: a person runs on no connection
test("roleAssignmentFindings — a connection of a holder's model at a place a linked source does not permit is a warning naming the holder, the role, the connection and the source; a person holding a role is not warned of it", async () => {
  const cat = await catalogueAt({ [MODEL_PATH]: MODEL });
  const workflow = await workflowAt(cat);

  const found = roleAssignmentFindings([assignmentOf(ASSIGNMENT)], workflow, REGISTER,
    connectionsWith(FULL_CAPABILITIES), [RESTRICTED_SOURCE]);
  assert.deepEqual(brief(found), [[DEVELOPERS_LINE, "warning", PERMITTED]]);
  assert.ok(found[0].what.includes("dev-a") && found[0].what.includes("Developers")
    && found[0].what.includes("bridge lab-pc agent claude") && found[0].what.includes("SRC-restricted-test"), found[0].what);
  assert.ok(!found.some((f) => f.what.includes("alice")), "alice, a person holding two roles, runs on no connection");
});
