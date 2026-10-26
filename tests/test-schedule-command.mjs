// Agent M's own test command — the `command` of Agent M's schedule, as docs/architecture/MOD-test-schedule.md names it
// (Parts, *Agent M's own `command` and `setup`*) and states it under *The command* and *The variables of a test job*.
// A test job runs it in the checkout's root with the files of its row as its arguments:
//
//   node tests/test-schedule-command.mjs <file>...
//
// It runs shard AGENT_M_SHARD of AGENT_M_SHARDS (from 1; both 1 where unset) of the files of Agent M's two suites among
// those it is given — the Python test files and the node test files that lie directly in tests/, which each suite's runner
// runs; a file below a folder of tests/ is a fixture or a part of a test file there and is named as not run. The share:
// the files sorted by path; each file that starts Electron (it names the mark stageElectron or native-fixture-lock: it
// stages Electron through tests/site-usability.d/browser.mjs or takes the lock of the one Electron fixture the node tests
// share) takes one of the first shards on its own, since two of them in one job wait on that lock past the job's time
// limit; every other file goes round-robin, in the sorted order, to the shards that are left. With no shard left for the
// other files it fails and names the files that start Electron. It writes the outcomes of both suites as one JUnit XML
// report to AGENT_M_REPORT and ends with a status other than 0 when a test failed. A Python case is named `TST-<nnn> <method>`
// where the declaration before its method names one (MOD-test-document's testDeclarations), so that MOD-result-records'
// parseOutcomes matches it to its declaration, and by its method where none does.
//
// Module: MOD-test-schedule
// Level: unit

import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { testDeclarations } from "../src/test-document/index.mjs";

const PYTHON_RUNNER = join(dirname(fileURLToPath(import.meta.url)), "test-schedule-command.d", "unittest_junit.py");
const STARTS_ELECTRON = /stageElectron|native-fixture-lock/;

// A whole number from 1 read from the variable `name`, `fallback` where it is unset or empty.
function wholeNumber(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  if (!/^[1-9][0-9]*$/.test(value)) throw new Error(`${name} is "${value}", not a whole number from 1`);
  return Number(value);
}

// The files of shard `shard` of `shards` (see the file's head); throws when no shard is left for the other files.
function shareOf(files, shard, shards) {
  const sorted = [...files].sort();
  const electron = sorted.filter((file) => STARTS_ELECTRON.test(readFileSync(file, "utf8")));
  const others = sorted.filter((file) => !electron.includes(file));
  if (electron.length && electron.length >= shards) {
    throw new Error(`${electron.length} test files start Electron for ${shards} shards, and each needs a shard of its own `
      + `beside one for the other files: ${electron.join(" ")}`);
  }
  if (shard <= electron.length) return [electron[shard - 1]];
  const left = shards - electron.length;
  return others.filter((_, index) => index % left === shard - electron.length - 1);
}

// The Python part of the report with each case named by its declaration's identifier and its method, where the declaration
// before the method in the case's file names one: the file is the case's module, tests/<module>.py among `files`.
function declaredPython(content, files) {
  const ids = new Map();
  for (const file of files) {
    const module = file.slice("tests/".length, -".py".length);
    for (const declaration of testDeclarations(file, readFileSync(file, "utf8"))) {
      if (declaration.title) ids.set(`${module} ${declaration.title}`, declaration.id);
    }
  }
  return content.replace(/<testcase name="([^"]*)" classname="([^".]*)\.[^"]*"/g, (whole, method, module) => {
    const id = ids.get(`${module} ${method}`);
    return id ? whole.replace(`name="${method}"`, `name="${id} ${method}"`) : whole;
  });
}

// Runs a program with its output going to this process's; resolves to its status.
function run(program, args) {
  return new Promise((resolve) => {
    const child = spawn(program, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", (error) => { console.error(`${program}: ${error.message}`); resolve(127); });
    child.on("close", (status, signal) => resolve(status ?? (signal ? 1 : 0)));
  });
}

// The elements inside the root of a suite's report; a test case that fails where the suite ended non-zero and wrote none.
function contentOf(path, suite, status) {
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const root = /<testsuites\b[^>]*>([\s\S]*)<\/testsuites>/.exec(text);
  if (root) return root[1].trim();
  const own = /<testsuite\b[\s\S]*<\/testsuite>|<testsuite\b[^>]*\/>/.exec(text);
  if (own) return own[0];
  if (status === 0) return "";
  return `<testcase name="the ${suite} suite" classname="${suite}"><error message="the ${suite} suite ended with status `
    + `${status} and wrote no report"/></testcase>`;
}

async function main() {
  const given = process.argv.slice(2);
  const report = process.env.AGENT_M_REPORT;
  if (!report) throw new Error("AGENT_M_REPORT names no path for the report");
  const shards = wholeNumber("AGENT_M_SHARDS", 1);
  const shard = wholeNumber("AGENT_M_SHARD", 1);
  if (shard > shards) throw new Error(`AGENT_M_SHARD ${shard} is beyond AGENT_M_SHARDS ${shards}`);

  const suites = given.filter((file) => dirname(file) === "tests");
  for (const file of given.filter((f) => !suites.includes(f))) {
    console.log(`not run: ${file} lies below a folder of tests/ and is no file of Agent M's two suites`);
  }
  const share = shareOf(suites, shard, shards);
  const python = share.filter((file) => file.endsWith(".py"));
  const node = share.filter((file) => !file.endsWith(".py"));
  console.log(`shard ${shard} of ${shards}: ${share.length ? share.join(" ") : "no test file"}`);

  const scratch = mkdtempSync(join(tmpdir(), "agent-m-report-"));
  try {
    const pythonReport = join(scratch, "python.xml"), nodeReport = join(scratch, "node.xml");
    const [pythonStatus, nodeStatus] = await Promise.all([
      python.length ? run("python3", [PYTHON_RUNNER, pythonReport, ...python]) : 0,
      node.length ? run(process.execPath, ["--test", "--test-reporter=spec", "--test-reporter-destination=stdout",
        "--test-reporter=junit", `--test-reporter-destination=${nodeReport}`, ...node]) : 0,
    ]);
    const content = [declaredPython(contentOf(pythonReport, "python", pythonStatus), python), contentOf(nodeReport, "node", nodeStatus)]
      .filter(Boolean).join("\n");
    mkdirSync(dirname(report), { recursive: true });
    writeFileSync(report, `<?xml version="1.0" encoding="utf-8"?>\n<testsuites>\n${content}\n</testsuites>\n`);
    return pythonStatus === 0 && nodeStatus === 0 ? 0 : 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

main().then((status) => { process.exitCode = status; }, (error) => {
  console.error(`test-schedule-command: ${error.message}`);
  process.exitCode = 2;
});
