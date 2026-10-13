// UC-011 system harness for handing a job to a local CLI session through the Agent M Bridge. The imported tests execute
// the browser-side bridge client, route selection, job queueing, Bridge job watcher, agent discovery, git-access probe
// and desktop composition paths. Socket-bound loopback and ssh2 tunnel suites are inspected as committed release
// evidence below instead of imported here, because this sandbox cannot bind local listeners.
// Run: node --test tests/system-uc-011-local-cli-session.test.mjs
//
// Module: system
// Guards: UC-011; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL; THE LOCAL BRIDGE REQUIRES A TOKEN; BROWSER REACHABILITY IS MEASURED, NOT ASSUMED; ONE DEFINITION, THREE DRIVERS; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; THE BRIDGE IS PAIRED ONCE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; THE BRIDGE OPENS ITS TUNNELS ITSELF; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; THE BRIDGE FINDS THE INSTALLED AGENTS
// Level: system

import "./bridge-client-tunnel-plans.test.mjs";
import "./bridge-client-bridges-by-name.test.mjs";
import "./runtimes-bridge.test.mjs";
import "./bridge-jobs-agents.test.mjs";
import "./bridge-jobs-watch.test.mjs";
import "./bridge-jobs-access.test.mjs";
import "./mod-desktop-shell-jobs-composition.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

const THIS_FILE = "tests/system-uc-011-local-cli-session.test.mjs";
const EXECUTED_EVIDENCE = [
  "tests/bridge-client-tunnel-plans.test.mjs",
  "tests/bridge-client-bridges-by-name.test.mjs",
  "tests/runtimes-bridge.test.mjs",
  "tests/bridge-jobs-agents.test.mjs",
  "tests/bridge-jobs-watch.test.mjs",
  "tests/bridge-jobs-access.test.mjs",
  "tests/mod-desktop-shell-jobs-composition.test.mjs",
];

const STATIC_EVIDENCE = [
  "tests/bridge-http.test.mjs",
  "tests/release-itm-286-tunnels-runtime.test.mjs",
  "tests/settings-pages-bridge-remote-sessions.test.mjs",
  "tests/runtimes-workflow.test.mjs",
  "tests/runtimes-routes.test.mjs",
  "tests/artifact-edits-open-files.test.mjs",
  "tests/repository-hosts-clone.test.mjs",
  "tests/site-frame-participant-explanations.test.mjs",
  "tests/agent-processes-320.test.mjs",
  "tests/tunnels-runtime.test.mjs",
];

const SOURCE_BY_FILE = new Map([...EXECUTED_EVIDENCE, ...STATIC_EVIDENCE, THIS_FILE].map((file) => [file, read(file)]));
const DECLARATIONS_BY_FILE = new Map(
  [...EXECUTED_EVIDENCE, ...STATIC_EVIDENCE].map((file) => [file, testDeclarations(file, SOURCE_BY_FILE.get(file))]),
);

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function declaration(file, id) {
  const found = (DECLARATIONS_BY_FILE.get(file) ?? []).find((candidate) => candidate.id === id);
  assert.ok(found, `${file} declares ${id}`);
  assert.ok(found.level, `${id} names a test level`);
  assert.ok(found.module, `${id} names a module`);
  assert.ok(found.given, `${id} states its precondition`);
  assert.ok(found.input, `${id} states its input`);
  assert.ok(found.expect, `${id} states its expected result`);
  return found;
}

function declarationText(item) {
  return [
    item.id,
    item.module,
    ...(item.guards ?? []),
    item.given,
    item.input,
    item.expect,
  ].filter(Boolean).join("\n");
}

function assertSourceMentions(file, phrase, note) {
  assert.match(SOURCE_BY_FILE.get(file), new RegExp(escapeRegExp(phrase)), note ?? `${file} mentions ${phrase}`);
}

const FLOW_EVIDENCE = [
  {
    flow: "main flow step 1: pair the Bridge once",
    evidence: [
      {
        file: "tests/bridge-client-bridges-by-name.test.mjs",
        id: "TST-472066",
        guards: ["UC-011", "THE BRIDGE IS PAIRED ONCE"],
        phrases: ["settings to store under it"],
      },
      {
        file: "tests/bridge-http.test.mjs",
        id: "TST-261005",
        guards: ["THE BRIDGE IS PAIRED ONCE", "THE LOCAL BRIDGE REQUIRES A TOKEN"],
        phrases: ["the token still pairs the person"],
      },
    ],
  },
  {
    flow: "main flow step 2: commit the start record before hand-over",
    evidence: [
      {
        file: "tests/runtimes-bridge.test.mjs",
        id: "TST-472695",
        guards: ["A JOB IS RECORDED IN ITS PRODUCT REPOSITORY", "UC-011 step 2"],
        phrases: ["POST /v1/jobs", "start record alone"],
      },
    ],
  },
  {
    flow: "main flow steps 3 to 5: run the local agent and end the job",
    evidence: [
      {
        file: "tests/bridge-jobs-watch.test.mjs",
        id: "TST-472096",
        guards: ["UC-011 (steps 3 to 5)", "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY", "A LOCAL AGENT USES THE PERSON'S OWN LOGIN"],
        phrases: ["the record is taken by `lab-pc` once", "ends `done`", "the agent was started once"],
      },
      {
        file: "tests/repository-hosts-clone.test.mjs",
        id: "TST-472532",
        guards: ["A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN", "UC-011"],
        phrases: ["one commit on the origin's `main`"],
      },
    ],
  },
  {
    flow: "alternative 1a: another computer is reached through a forward",
    evidence: [
      {
        file: "tests/bridge-client-bridges-by-name.test.mjs",
        id: "TST-472061",
        guards: ["UC-011"],
        phrases: ["SSH forward's address", "no login"],
      },
      {
        file: "tests/bridge-client-bridges-by-name.test.mjs",
        id: "TST-472063",
        guards: ["UC-011"],
        phrases: ["http://localhost:<port>"],
      },
    ],
  },
  {
    flow: "alternative 1c: NAT, reverse tunnel and HTTPS route",
    evidence: [
      {
        file: "tests/bridge-client-tunnel-plans.test.mjs",
        id: "TST-282002",
        guards: ["THE DASHBOARD WRITES THE TUNNEL COMMANDS", "A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK"],
        phrases: ["reverse and forward commands", "loopback-only ends"],
      },
      {
        file: "tests/settings-pages-bridge-remote-sessions.test.mjs",
        id: "TST-287001",
        guards: ["EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE", "THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS"],
        phrases: ["lowest free port 40101"],
      },
      {
        file: "tests/bridge-client-tunnel-plans.test.mjs",
        id: "TST-282003",
        guards: ["THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN", "A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST"],
        phrases: ["require TLS/login before proxying"],
      },
      {
        file: "tests/release-itm-286-tunnels-runtime.test.mjs",
        id: "TST-286903",
        guards: ["THE BRIDGE OPENS ITS TUNNELS ITSELF", "A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK", "UC-011"],
        phrases: ["forward bytes round-trip"],
      },
      {
        file: "tests/runtimes-routes.test.mjs",
        id: "TST-472707",
        guards: ["A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY"],
        phrases: ["repository is not private"],
      },
    ],
  },
  {
    flow: "alternative 1d: several Bridges",
    evidence: [
      {
        file: "tests/runtimes-bridge.test.mjs",
        id: "TST-472700",
        guards: ["UC-011", "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY"],
        phrases: ["chosen by its name among connections.bridges"],
      },
      {
        file: "tests/bridge-jobs-watch.test.mjs",
        id: "TST-472097",
        guards: ["UC-011 (step 3)", "A LOCAL AGENT USES THE PERSON'S OWN LOGIN"],
        phrases: ["a job of another Bridge", "is left alone"],
      },
    ],
  },
  {
    flow: "alternative 1b: pair anew rotates the token",
    evidence: [
      {
        file: "tests/bridge-http.test.mjs",
        id: "TST-261004",
        guards: ["THE BRIDGE IS PAIRED ONCE", "THE LOCAL BRIDGE REQUIRES A TOKEN"],
        phrases: ["the old token is refused", "the current token is accepted"],
      },
    ],
  },
  {
    flow: "alternative 3a: missing or wrong token is refused",
    evidence: [
      {
        file: "tests/bridge-http.test.mjs",
        id: "TST-261007",
        guards: ["THE LOCAL BRIDGE REQUIRES A TOKEN"],
        phrases: ["a missing token", "before any handler invocation"],
      },
      {
        file: "tests/runtimes-bridge.test.mjs",
        id: "TST-472696",
        guards: ["A JOB IS RECORDED IN ITS PRODUCT REPOSITORY", "UC-011 step 2a"],
        phrases: ["TokenRefused", "the start stays committed"],
      },
    ],
  },
  {
    flow: "alternative 3b: agent not offered or missing working folder",
    evidence: [
      {
        file: "tests/bridge-jobs-watch.test.mjs",
        id: "TST-472098",
        guards: ["UC-011 (3b)"],
        phrases: ["invalid-request naming no agent started"],
      },
      {
        file: "tests/bridge-jobs-agents.test.mjs",
        id: "TST-472082",
        guards: ["THE BRIDGE FINDS THE INSTALLED AGENTS", "UC-011 (step 3)"],
        phrases: ["agent not offered", "without a working folder"],
      },
    ],
  },
  {
    flow: "alternative 3c: local git login cannot reach a repository",
    evidence: [
      {
        file: "tests/bridge-jobs-access.test.mjs",
        id: "TST-472075",
        guards: ["A LOCAL AGENT USES THE PERSON'S OWN LOGIN", "UC-011 3c"],
        phrases: ["does not appear to be a git repository"],
      },
    ],
  },
  {
    flow: "alternative 2a: the browser blocks the bridge call",
    evidence: [
      {
        file: "tests/runtimes-bridge.test.mjs",
        id: "TST-472696",
        guards: ["A JOB IS RECORDED IN ITS PRODUCT REPOSITORY", "UC-011 step 2a"],
        phrases: ["NoAnswer", "the start stays committed"],
      },
      {
        file: "tests/site-frame-participant-explanations.test.mjs",
        id: "TST-472836",
        guards: ["UC-011"],
        phrases: ["some browsers", "block the call to the Bridge's local address", "as Safari does"],
      },
    ],
  },
  {
    flow: "postcondition: the Bridge never needs a non-loopback bind",
    evidence: [
      {
        file: "tests/bridge-http.test.mjs",
        id: "TST-261002",
        guards: ["THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY"],
        phrases: ["BindRefused is named and no server starts"],
      },
      {
        file: "tests/bridge-http.test.mjs",
        id: "TST-261003",
        guards: ["THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY"],
        phrases: ["each bind succeeds and no non-loopback address is needed"],
      },
      {
        file: "tests/tunnels-runtime.test.mjs",
        id: "TST-286002",
        guards: ["A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK", "UC-011"],
        phrases: ["NotLoopback is reported before any connection"],
      },
    ],
  },
];

// TST-374001
// level: system
// module: system
// guards: UC-011; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL; THE LOCAL BRIDGE REQUIRES A TOKEN; THE BRIDGE IS PAIRED ONCE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; THE BRIDGE FINDS THE INSTALLED AGENTS
// given: the executable Bridge, runtime, job watcher, agent-discovery and desktop-composition tests imported by this file, plus the committed socket-bound Bridge and tunnel test declarations
// input: inspect the declared evidence for UC-011's main flow, alternatives 1a, 1b, 1c, 1d, 2a, 3a, 3b and 3c, and its loopback postcondition
// expect: every UC-011 flow has a declared evidence path with its guard text and public expected behaviour; because this file imports the socket-free evidence, those flows fail this system run if their executable path regresses
test("TST-374001: UC-011 system evidence covers the main flow and alternatives", () => {
  for (const flow of FLOW_EVIDENCE) {
    assert.ok(flow.evidence.length > 0, `${flow.flow} has evidence`);
    for (const item of flow.evidence) {
      const found = declaration(item.file, item.id);
      const text = declarationText(found);
      for (const guard of item.guards) assert.match(text, new RegExp(escapeRegExp(guard)), `${flow.flow}: ${item.id} names ${guard}`);
      for (const phrase of item.phrases) assertSourceMentions(item.file, phrase, `${flow.flow}: ${item.file} contains ${phrase}`);
    }
  }
});

// TST-374002
// level: system
// module: system
// guards: UC-011; BROWSER REACHABILITY IS MEASURED, NOT ASSUMED; ONE DEFINITION, THREE DRIVERS; THE BRIDGE OPENS ITS TUNNELS ITSELF; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
// given: this system harness source, its imported socket-free suites and the committed socket-bound suites kept as release evidence
// input: inspect the imports and the evidence corpus for UC-011 boundary requirements that are not all exercised by this sandbox
// expect: every safe fixture suite is imported, listener-bound suites are kept out of the import list, and the static corpus still names browser reachability measurement, one-definition drivers, self-hosted runner privacy and tunnel runtime evidence
test("TST-374002: the UC-011 system harness executes safe suites and keeps socket-bound evidence explicit", () => {
  const source = SOURCE_BY_FILE.get(THIS_FILE);
  for (const file of EXECUTED_EVIDENCE) {
    const importPath = `./${file.replace(/^tests\//, "")}`;
    assert.ok(source.includes(`import "${importPath}";`), `${file} is imported by the system harness`);
  }

  for (const file of ["tests/bridge-http.test.mjs", "tests/release-itm-286-tunnels-runtime.test.mjs", "tests/tunnels-runtime.test.mjs"]) {
    const importPath = `./${file.replace(/^tests\//, "")}`;
    assert.ok(!source.includes(`import "${importPath}";`), `${file} is not imported in the socket-restricted system harness`);
  }

  for (const item of [
    { file: "tests/mod-desktop-shell-jobs-composition.test.mjs", phrase: "ONE DEFINITION, THREE DRIVERS" },
    { file: "tests/runtimes-workflow.test.mjs", phrase: "A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY" },
    { file: "tests/release-itm-286-tunnels-runtime.test.mjs", phrase: "THE BRIDGE OPENS ITS TUNNELS ITSELF" },
    { file: "tests/site-frame-participant-explanations.test.mjs", phrase: "block the call to the Bridge's local address" },
  ]) {
    assertSourceMentions(item.file, item.phrase);
  }
});
