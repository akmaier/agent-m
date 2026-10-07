// A holder's capabilities and place among a declaration's findings (ITM-231) — the two findings ITM-218 left out of
// MOD-product-process' declarationFindings (tests/product-process.test.mjs says so, and leaves them to this file): an
// error naming a holder that lacks a capability its role needs, and a warning naming a holder at a processing place a
// linked source does not permit. Both go through MOD-participant-list's eligible, over the participants
// MOD-participant-list's participantsOf gives (ITM-230). A person is judged by capabilities alone: a place is judged
// only for a holder that declares one.
// Run: node --test tests/product-process-eligibility.test.mjs
//
// Module: MOD-product-process
// Guards: UC-002 (4b, 4c); A ROLE NAMES THE CAPABILITIES IT NEEDS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// The fixture product declares the same instance model as tests/product-process.test.mjs, docs/process-models/team-scrum.md
// (team-scrum: Scrum adapted so that its Product Owner is a person), at the commit VERSION. Its declaration holds Product
// Owner and Scrum Master by alice, a person, and Developers by dev-a alone, a CLI agent at "this machine" — so only dev-a's
// capabilities and place are ever in question; alice's place is never judged. Nothing reaches the network. Each test states
// its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { catalogue } from "../src/model-catalogue/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";
import { declarationFindings, declarationSchema } from "../src/product-process/index.mjs";

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
  "| Name | Filled by | Capabilities |",
  "|---|---|---|",
  "| Product Owner | person | read the repository, write to the repository |",
  "| Scrum Master | either | read the repository |",
  "| Developers | agent | read the repository, write to the repository, run code and tests |",
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

// Product Owner and Scrum Master held by alice, a person (her place is never judged); Developers held by dev-a alone, a CLI
// agent at "this machine" (both its capabilities and its place are judged).
const DECLARATION = [
  "---",
  "model: team-scrum",
  `model_file: ${MODEL_PATH}`,
  `model_version: ${VERSION}`,
  "sprint_close: alice",
  "---",
  "# How the fixture product is developed",
  "",
  "The fixture product's process, as its Author declared it.",
  "",
  "## Roles",
  "",
  "| Role | Participants |",
  "|---|---|",
  "| Product Owner | alice |",
  "| Scrum Master | alice |",
  "| Developers | dev-a |",
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

// The row of ## Roles that assigns Developers to dev-a alone — found in the text itself, never counted by hand.
const DEVELOPERS_LINE = lineOf(DECLARATION, "| Developers |");

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

// alice, a person (capabilities only, no place); dev-a, a CLI agent at "this machine" with the given capabilities.
// The title line is "# Participants of this instance" verbatim: participants.schema.md names it as the heading of the
// table's section, the register having no heading of its own (MOD-participant-list, Data).
const registerWith = (devACapabilities) => readDocument(participantSchema(), "docs/participants.md", [
  "# Participants of this instance",
  "",
  "**REGISTER**",
  "",
  "The people and agents who work on the products of the fixture instance, one row per participant.",
  "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | draft text, read the repository, write to the repository | — | account github.com/alice |",
  `| dev-a | CLI agent | example-model | 200000 | — | ${devACapabilities} | this machine | bridge lab-pc agent claude |`,
  "",
].join("\n"));

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

// ---------------------------------------------------------------- declarationFindings

const brief = (found) => found.map((f) => [f.line, f.kind, f.rule]);

// guards: UC-002 4b; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: the fixture declaration — Developers held by dev-a alone; team-scrum at VERSION, without a finding of its own;
//        the fixture register with (a) dev-a having every capability Developers needs, (b) dev-a without "run code and
//        tests", which Developers needs; no linked source
// input: declarationFindings(declaration, that catalogue, that register, [], the instance's SPEC)
// expect: (a) no finding; (b) one error, on the row of Developers, naming A ROLE NAMES THE CAPABILITIES IT NEEDS; its
//         text names the holder dev-a, the role Developers and the capability run code and tests
test("declarationFindings — a holder that lacks a capability its role needs is an error, naming the holder, the role and the capability", async () => {
  const cat = await catalogueAt({ [MODEL_PATH]: MODEL });
  assert.deepEqual(cat.findings[MODEL_PATH], [], "team-scrum has no finding at VERSION");
  const declaration = declarationOf(DECLARATION);

  const full = declarationFindings(declaration, cat, registerWith(FULL_CAPABILITIES), [], INSTANCE_SPEC);
  assert.deepEqual(brief(full), [], "dev-a has every capability Developers needs");

  const short = "draft text, read the repository, write to the repository";
  const found = declarationFindings(declaration, cat, registerWith(short), [], INSTANCE_SPEC);
  assert.deepEqual(brief(found), [[DEVELOPERS_LINE, "error", CAPABILITY]]);
  assert.ok(found[0].what.includes("dev-a") && found[0].what.includes("Developers")
    && found[0].what.includes("run code and tests"), found[0].what);
});

// guards: UC-002 4c; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the fixture declaration — Developers held by dev-a alone, at "this machine"; Product Owner and Scrum Master both
//        held by alice, a person; team-scrum at VERSION; the restricted source, which permits only NHR@FAU, Erlangen,
//        linked; dev-a with every capability Developers needs, so only the place is in question
// input: declarationFindings(declaration, that catalogue, the register, [the restricted source], the instance's SPEC)
// expect: one warning, on the row of Developers, naming RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; its text
//         names the holder dev-a, the role Developers and the source SRC-restricted-test. No finding names alice, who
//         holds two roles while the same source is linked: a person is judged by capabilities alone
test("declarationFindings — a holder at a place a linked source does not permit is a warning naming the holder, the role and the source; a person holding a role is not warned of it", async () => {
  const cat = await catalogueAt({ [MODEL_PATH]: MODEL });
  const declaration = declarationOf(DECLARATION);

  const found = declarationFindings(declaration, cat, registerWith(FULL_CAPABILITIES), [RESTRICTED_SOURCE], INSTANCE_SPEC);
  assert.deepEqual(brief(found), [[DEVELOPERS_LINE, "warning", PERMITTED]]);
  assert.ok(found[0].what.includes("dev-a") && found[0].what.includes("Developers")
    && found[0].what.includes("SRC-restricted-test"), found[0].what);
  assert.ok(!found.some((f) => f.what.includes("alice")), "alice, a person holding two roles, is judged by capabilities alone");
});
