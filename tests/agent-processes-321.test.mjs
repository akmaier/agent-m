// Module: MOD-agent-processes
// Level: unit
// Guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A CANCELLED JOB WRITES NOTHING MORE; ONE DEFINITION, THREE DRIVERS; UC-010; UC-011

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after } from "node:test";
import { agentDriver } from "../src/agent-processes/index.mjs";

const node = process.execPath;
const fixture = () => mkdtempSync(join(tmpdir(), "agent-m-321-"));
const PARTICIPANT = {
  name: "fixture-cli-agent",
  type: "CLI agent",
  model: "fixture-model",
  context: 200000,
  price: null,
  capabilities: ["draft text"],
  place: "fixture",
  route: "bridge fixture agent claude",
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
const OPENCODE = {
  name: "opencode",
  installed: true,
  version: "1.19.0",
  loggedIn: true,
  install: {
    macos: "https://opencode.ai/docs/#install",
    windows: "https://opencode.ai/docs/#windows",
    linux: "https://opencode.ai/docs/#install",
  },
};
const FAULTS = {
  "TST-321001": [
    "return { text: helpers.answer(row.task, result.stdout), usage: helpers.usage(row.task, result.stdout) };",
    "return { text: \"\", usage: helpers.usage(row.task, result.stdout) };",
  ],
  "TST-321002": [
    "return ownLoginEnvironment();",
    "return process.env;",
  ],
  "TST-321003": [
    "process.kill(-child.pid, \"SIGTERM\");",
    "child.kill(\"SIGTERM\");",
  ],
  "TST-321004": [
    "throw failure(\"AgentNotLoggedIn\", \"the selected agent is not logged in\");",
    "throw failure(\"AgentMissing\", \"the selected agent is not logged in\");",
  ],
};

function executable(folder, name, program) {
  const script = join(folder, `${name}-fixture.mjs`);
  const command = join(folder, name);
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
// given: controlled Claude and OpenCode executables on PATH: Claude emits a text final answer without usage and OpenCode emits published raw JSON text and step-finish usage events.
// input: a DriverInput whose prompt has already been assembled and whose workdir is the fixture folder.
// expect: each send gives the agent the unchanged prompt in that workdir and streams output; Claude returns null for unreported usage and OpenCode maps its reported token counts while leaving undocumented currencyless cost null.
test("TST-321001: agent driver streams answers with reported or null usage", async () => {
  const folder = fixture();
  const record = join(folder, "record.json");
  try {
    executable(folder, "claude", `
      import { writeFileSync } from "node:fs";
      writeFileSync(${JSON.stringify(record)}, JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));
      process.stdout.write("final answer\\n");
    `);
    executable(folder, "opencode", `
      process.stdout.write(JSON.stringify({ type: "text", part: { text: "reported answer" } }) + "\\n");
      process.stdout.write(JSON.stringify({ type: "step_finish", part: { tokens: { input: 13, output: 5 } } }) + "\\n");
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
    assert.deepEqual(await withPath(folder, () => driver(OPENCODE, folder).send({ ...INPUT, workdir: folder })), {
      text: "reported answer",
      usage: { inputTokens: 13, outputTokens: 5, minutes: null, cost: null },
    });
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

// TST-321002
// level: unit
// module: MOD-agent-processes
// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-011
// given: a controlled Claude executable; a locally logged-in Agent; and an installed Agent that has no saved login but has a CI credential name.
// input: one local driver with no key variable and one CI driver for the installed-but-logged-out Agent, naming ANTHROPIC_API_KEY while the fixture environment supplies its value.
// expect: neither command contains a key; local invocation has no credential variable, while CI invocation still succeeds and receives the named CI variable without the module reading or placing its value in command arguments.
test("TST-321002: local and CI invocations keep credentials out of command arguments", async () => {
  const folder = fixture();
  const localRecord = join(folder, "local.json");
  const ciRecord = join(folder, "ci.json");
  try {
    executable(folder, "claude", `
      import { appendFileSync } from "node:fs";
      const target = process.env.CI === "true" ? ${JSON.stringify(ciRecord)} : ${JSON.stringify(localRecord)};
      appendFileSync(target, JSON.stringify({ argv: process.argv.slice(2), key: process.env.ANTHROPIC_API_KEY ?? null }) + "\\n");
      process.stdout.write("ok\\n");
    `);
    await withEnvironment({ CI: undefined, GITHUB_ACTIONS: undefined, ANTHROPIC_API_KEY: "local-parent-key" }, () =>
      withPath(folder, () => driver(CLAUDE, folder).send({ ...INPUT, workdir: folder })));
    await withEnvironment({ CI: "true", ANTHROPIC_API_KEY: "ci-secret-fixture" }, () =>
      withPath(folder, () => driver({ ...CLAUDE, loggedIn: false }, folder, "ANTHROPIC_API_KEY").send({ ...INPUT, workdir: folder })));

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
// given: a controlled Claude executable whose child first installs a SIGTERM handler that remains alive, signals readiness over IPC with no inherited stdio, then schedules a later marker.
// input: send a prepared DriverInput with an AbortSignal aborted after the announced output.
// expect: send throws Cancelled and stops the fixture and its child before the child can write the later marker.
test("TST-321003: abort stops the agent and its child before later output", async () => {
  const folder = fixture();
  const marker = join(folder, "later-marker");
  try {
    executable(folder, "claude", `
      import { spawn } from "node:child_process";
      const child = spawn(${JSON.stringify(node)}, ["-e", ${JSON.stringify(`
        process.on("SIGTERM", () => {});
        process.send("ready");
        setTimeout(() => require("node:fs").writeFileSync(${JSON.stringify(marker)}, "later"), 250);
        setInterval(() => {}, 1_000);
      `)}], { stdio: ["ignore", "ignore", "ignore", "ipc"] });
      child.once("message", (message) => {
        if (message === "ready") process.stdout.write("started\\n");
      });
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
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-011
// given: a missing agent, an installed but logged-out agent, a controlled Claude executable that exits 23 after output, and an already-aborted signal.
// input: construct a driver for each condition and call send with the same prepared DriverInput.
// expect: the four conditions throw AgentMissing, AgentNotLoggedIn, AgentFailed with its exitCode and lastOutput, and Cancelled.
test("TST-321004: agent driver names each accepted failure", async () => {
  const folder = fixture();
  try {
    executable(folder, "claude", "process.stdout.write('last output\\n'); process.exit(23);");
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

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_321_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-321-fault-"));
  const copied = join(temporary, "repo");
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  try {
    cpSync(process.cwd(), copied, {
      recursive: true,
      filter: (path) => !path.includes("/.git") && !path.includes("/node_modules"),
    });
    for (const [id, [needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, "src", "agent-processes", "processes.mjs");
      const original = readFileSync(source);
      const testPath = join(copied, "tests", "agent-processes-321.test.mjs");
      const argv = [process.execPath, "--test", "--test-name-pattern", id, "tests/agent-processes-321.test.mjs"];
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const invoke = () => {
        const env = { ...process.env, AGENT_M_321_FAULT_CHILD: "1" };
        delete env.NODE_TEST_CONTEXT;
        return spawnSync(argv[0], argv.slice(1), { cwd: copied, encoding: "utf8", timeout: 15_000, env });
      };
      const sourceHash = digest(original);
      const testHash = digest(readFileSync(testPath));
      const faultStarted = new Date().toISOString();
      let failed, passed, faultHash, restoredHash, faultEnded, restoreStarted, restoredEnded, positiveEnded;
      try {
        writeFileSync(source, original.toString().replace(needle, replacement));
        faultHash = digest(readFileSync(source));
        failed = invoke();
        faultEnded = new Date().toISOString();
      } finally {
        restoreStarted = new Date().toISOString();
        writeFileSync(source, original);
        restoredHash = digest(readFileSync(source));
        restoredEnded = new Date().toISOString();
      }
      passed = invoke();
      positiveEnded = new Date().toISOString();
      console.log("TST321-counterproof " + JSON.stringify({
        id,
        file: "src/agent-processes/processes.mjs",
        needle,
        replacement,
        sourceHash,
        testHash,
        faultHash,
        restoredHash,
        faultStarted,
        faultEnded,
        restoreStarted,
        restoredEnded,
        positiveEnded,
        argv,
        cwd: copied,
        childflag: "AGENT_M_321_FAULT_CHILD=1",
        failed: {
          status: failed.status,
          signal: failed.signal,
          error: failed.error?.message ?? null,
          stdout: failed.stdout,
          stderr: failed.stderr,
        },
        passed: {
          status: passed.status,
          signal: passed.signal,
          error: passed.error?.message ?? null,
          stdout: passed.stdout,
          stderr: passed.stderr,
        },
      }));
      assert.equal(failed.status, 1, id);
      assert.equal(failed.signal, null, id);
      assert.equal(failed.error, undefined, id);
      assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`));
      assert.equal(restoredHash, sourceHash, `${id}: exact restoration`);
      assert.equal(passed.status, 0, id);
      assert.equal(passed.signal, null, id);
      assert.equal(passed.error, undefined, id);
      assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
