// Module: MOD-agent-processes
// Level: unit
// Guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A CANCELLED JOB WRITES NOTHING MORE; ONE DEFINITION, THREE DRIVERS; UC-010; UC-011

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { agentDriver } from "../src/agent-processes/index.mjs";

const node = process.execPath;
const fixture = () => mkdtempSync(join(tmpdir(), "agent-m-321-"));
const PARTICIPANT = {
  name: "fixture agent",
  type: "coding agent",
  model: null,
  context: null,
  price: null,
  capabilities: ["draft text"],
  place: "fixture",
  route: null,
};
const INPUT = {
  prompt: "The prepared prompt stays unchanged.",
  parts: [],
  output: null,
  findings: [],
  previous: null,
  workdir: null,
};
const CLAUDE = {
  name: "claude",
  installed: true,
  version: "2.1.300",
  loggedIn: true,
  install: {
    macos: "https://code.claude.com/docs/en/setup",
    windows: "https://code.claude.com/docs/en/setup",
    linux: "https://code.claude.com/docs/en/setup",
  },
};

function executable(folder, program) {
  const script = join(folder, "claude-fixture.mjs");
  const command = join(folder, "claude");
  writeFileSync(script, program);
  writeFileSync(command, `#!/bin/sh\nexec '${node}' '${script}' \"$@\"\n`, { mode: 0o755 });
}

async function withPath(folder, work) {
  const previous = process.env.PATH;
  process.env.PATH = folder;
  try {
    return await work();
  } finally {
    process.env.PATH = previous;
  }
}

async function withEnvironment(values, work) {
  const prior = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    return await work();
  } finally {
    for (const [name, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

function driver(agent, workdir, keyVariable = null) {
  return agentDriver(agent, { workdir, keyVariable }, PARTICIPANT);
}

// TST-321001
// level: unit
// module: MOD-agent-processes
// guards: ONE DEFINITION, THREE DRIVERS; UC-010; UC-011
// given: a controlled Claude executable on PATH that emits its final answer as output.
// input: a DriverInput whose prompt has already been assembled and whose workdir is the fixture folder.
// expect: send gives the agent the unchanged prompt in that workdir, streams the output through onOutput, and returns the final answer with null unreported usage.
test("TST-321001: agent driver streams an answer and null unreported usage", async () => {
  const folder = fixture();
  const record = join(folder, "record.json");
  try {
    executable(folder, `
      import { writeFileSync } from "node:fs";
      writeFileSync(${JSON.stringify(record)}, JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));
      process.stdout.write("final answer\\n");
    `);
    const output = [];
    const result = await withPath(folder, () => driver(CLAUDE, folder).send(
      { ...INPUT, workdir: folder },
      { onOutput: (chunk) => output.push(chunk) },
    ));

    assert.deepEqual(result, { text: "final answer", usage: null });
    assert.deepEqual(JSON.parse(readFileSync(record, "utf8")), {
      argv: ["-p", INPUT.prompt],
      cwd: folder,
    });
    assert.equal(output.join(""), "final answer\n");
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

// TST-321002
// level: unit
// module: MOD-agent-processes
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-011
// given: a controlled Claude executable that records its arguments and whether the CI-provided credential variable reaches it.
// input: one local driver with no key variable and one CI driver that names ANTHROPIC_API_KEY while the fixture environment supplies its value.
// expect: neither command contains a key; local invocation has no credential variable, while CI invocation receives the named CI variable without the module reading or placing its value in command arguments.
test("TST-321002: local and CI invocations keep credentials out of command arguments", async () => {
  const folder = fixture();
  const localRecord = join(folder, "local.json");
  const ciRecord = join(folder, "ci.json");
  try {
    executable(folder, `
      import { appendFileSync } from "node:fs";
      const target = process.env.CI === "true" ? ${JSON.stringify(ciRecord)} : ${JSON.stringify(localRecord)};
      appendFileSync(target, JSON.stringify({ argv: process.argv.slice(2), key: process.env.ANTHROPIC_API_KEY ?? null }) + "\\n");
      process.stdout.write("ok\\n");
    `);
    await withEnvironment({ CI: undefined, ANTHROPIC_API_KEY: "local-parent-key" }, () =>
      withPath(folder, () => driver(CLAUDE, folder).send({ ...INPUT, workdir: folder })));
    await withEnvironment({ CI: "true", ANTHROPIC_API_KEY: "ci-secret-fixture" }, () =>
      withPath(folder, () => driver(CLAUDE, folder, "ANTHROPIC_API_KEY").send({ ...INPUT, workdir: folder })));

    assert.deepEqual(JSON.parse(readFileSync(localRecord, "utf8")), {
      argv: ["-p", INPUT.prompt],
      key: null,
    });
    assert.deepEqual(JSON.parse(readFileSync(ciRecord, "utf8")), {
      argv: ["-p", INPUT.prompt],
      key: "ci-secret-fixture",
    });
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

// TST-321003
// level: unit
// module: MOD-agent-processes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-010
// given: a controlled Claude executable that starts a child scheduled to write a later marker and announces that it started.
// input: send a prepared DriverInput with an AbortSignal aborted after the announced output.
// expect: send throws Cancelled and stops the fixture and its child before the child can write the later marker.
test("TST-321003: abort stops the agent and its child before later output", async () => {
  const folder = fixture();
  const marker = join(folder, "later-marker");
  try {
    executable(folder, `
      import { spawn } from "node:child_process";
      import { writeFileSync } from "node:fs";
      const child = spawn(${JSON.stringify(node)}, ["-e", ${JSON.stringify(`setTimeout(() => require("node:fs").writeFileSync(${JSON.stringify(marker)}, "later"), 250)`)}]);
      child.unref();
      process.stdout.write("started\\n");
      setInterval(() => {}, 1_000);
    `);
    const controller = new AbortController();
    const sent = withPath(folder, () => driver(CLAUDE, folder).send(
      { ...INPUT, workdir: folder },
      { signal: controller.signal, onOutput: () => controller.abort() },
    ));
    await assert.rejects(sent, { name: "Cancelled" });
    await new Promise((resolve) => setTimeout(resolve, 350));
    assert.throws(() => readFileSync(marker, "utf8"), { code: "ENOENT" }, "child marker is not written after cancellation");
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

// TST-321004
// level: unit
// module: MOD-agent-processes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011; UC-017
// given: a missing agent, an installed but logged-out agent, a controlled Claude executable that exits 23 after output, and an already-aborted signal.
// input: construct a driver for each condition and call send with the same prepared DriverInput.
// expect: the four conditions throw AgentMissing, AgentNotLoggedIn, AgentFailed with its exitCode and lastOutput, and Cancelled.
test("TST-321004: agent driver names each accepted failure", async () => {
  const folder = fixture();
  try {
    executable(folder, "process.stdout.write('last output\\n'); process.exit(23);");
    await assert.rejects(driver({ ...CLAUDE, installed: false }, folder).send({ ...INPUT, workdir: folder }), { name: "AgentMissing" });
    await assert.rejects(driver({ ...CLAUDE, loggedIn: false }, folder).send({ ...INPUT, workdir: folder }), { name: "AgentNotLoggedIn" });
    await withPath(folder, async () => {
      await assert.rejects(driver(CLAUDE, folder).send({ ...INPUT, workdir: folder }), (error) =>
        error?.name === "AgentFailed" && error.exitCode === 23 && error.lastOutput === "last output");
    });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(driver(CLAUDE, folder).send({ ...INPUT, workdir: folder }, { signal: controller.signal }), { name: "Cancelled" });
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
