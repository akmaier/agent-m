// Module: MOD-test-schedule
// Level: unit
//
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
// parseOutcomes matches it to its declaration, and by its method where none does. A node case is named `TST-<nnn> <name>`
// the same way, against the declarations of its own file only: each node file runs in a node test runner of its own,
// writing a report of its own, since node's JUnit reporter in the release the generated configuration provides names no
// file. A case whose name starts with a TST-<nnn> its file declares keeps its name. Any other takes the declaration whose
// title is that of a test it is a subtest of — node's reporter writes such a test as a <testsuite> around the case, the
// innermost first —, or else whose title is the case's own name; a template title matches as a pattern, `${…}` any text,
// and a title that is a template alone matches no case. Tags are read with their quoted values whole, since the reporter
// leaves a > in a value unescaped.

import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
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

const ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
const decoded = (text) => text.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|(lt|gt|amp|quot|apos));/g,
  (_, dec, hex, name) => (name ? ENTITIES[name] : String.fromCodePoint(dec ? Number(dec) : parseInt(hex, 16))));
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TEMPLATE_PART = /\$\{[^}]*\}/g;
// A declaration's title as a pattern of the case names it gives: a template title's `${…}` stands for any text.
const titlePattern = (title) => new RegExp(`^${title.split(TEMPLATE_PART).map(escaped).join("[\\s\\S]*")}$`);
// A tag of a report, read with its quoted values whole: a value may hold a > the reporter leaves unescaped.
const TAG = /<testsuite\b(?:[^>"]|"[^"]*")*?(\/?)>|<\/testsuite\s*>|<testcase\b(?:[^>"]|"[^"]*")*>/g;

// The report of the node file `file` with each case named by its file's declaration (see the file's head).
function declaredNode(content, file) {
  const declarations = testDeclarations(file, readFileSync(file, "utf8"));
  const own = new Set(declarations.map((d) => d.id));
  const titled = declarations.filter((d) => d.title && d.title.replace(TEMPLATE_PART, "").trim() !== "")
    .map((d) => ({ id: d.id, pattern: titlePattern(d.title) }));
  const suites = []; // the names of the <testsuite> elements around the current place, innermost last
  return content.replace(TAG, (tag, selfClosing) => {
    const attribute = (key) => { const m = new RegExp(`\\s${key}="([^"]*)"`).exec(tag); return m ? decoded(m[1]) : null; };
    if (tag.startsWith("</")) { suites.pop(); return tag; }
    if (tag.startsWith("<testsuite")) { if (!selfClosing) suites.push(attribute("name") ?? ""); return tag; }
    const name = attribute("name");
    if (name === null || own.has(/^TST-\d+/.exec(name)?.[0])) return tag;
    const found = [...[...suites].reverse(), name].map((title) => titled.find((d) => d.pattern.test(title))).find(Boolean);
    return found ? tag.replace(/\sname="/, ` name="${found.id} `) : tag;
  });
}

// Runs a program; resolves to its status. Its output goes to this process's, each line after `prefix` where one is given.
function run(program, args, prefix = "") {
  return new Promise((resolve) => {
    const child = spawn(program, args, { stdio: ["ignore", prefix ? "pipe" : "inherit", prefix ? "pipe" : "inherit"] });
    if (prefix) {
      for (const [from, to] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
        createInterface({ input: from, crlfDelay: Infinity }).on("line", (line) => to.write(`${prefix}${line}\n`));
      }
    }
    child.on("error", (error) => { console.error(`${program}: ${error.message}`); resolve(127); });
    child.on("close", (status, signal) => resolve(status ?? (signal ? 1 : 0)));
  });
}

// The statuses of the node files, each run by a node test runner of its own into the report reportOf(file), at most as
// many at once as node's test runner runs files at once.
async function runNodeFiles(files, reportOf) {
  const statuses = new Array(files.length);
  let next = 0;
  const worker = async () => {
    while (next < files.length) {
      const index = next++;
      statuses[index] = await run(process.execPath, ["--test", "--test-reporter=spec", "--test-reporter-destination=stdout",
        "--test-reporter=junit", `--test-reporter-destination=${reportOf(files[index])}`, files[index]], `${files[index]}: `);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, availableParallelism() - 1) }, worker));
  return statuses;
}

// The elements inside the root of a report; a test case that fails where its run, named `label`, ended non-zero and
// wrote none.
function contentOf(path, label, status) {
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const root = /<testsuites\b[^>]*>([\s\S]*)<\/testsuites>/.exec(text);
  if (root) return root[1].trim();
  const own = /<testsuite\b[\s\S]*<\/testsuite>|<testsuite\b[^>]*\/>/.exec(text);
  if (own) return own[0];
  if (status === 0) return "";
  const quoted = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<testcase name="${quoted}" classname="${quoted}"><error message="${quoted} ended with status `
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
    const pythonReport = join(scratch, "python.xml");
    const nodeReport = (file) => join(scratch, `node-${node.indexOf(file)}.xml`);
    const [pythonStatus, nodeStatuses] = await Promise.all([
      python.length ? run("python3", [PYTHON_RUNNER, pythonReport, ...python]) : 0,
      runNodeFiles(node, nodeReport),
    ]);
    const content = [declaredPython(contentOf(pythonReport, "the python suite", pythonStatus), python),
      ...node.map((file, index) => declaredNode(contentOf(nodeReport(file), `the node test file ${file}`, nodeStatuses[index]), file))]
      .filter(Boolean).join("\n");
    mkdirSync(dirname(report), { recursive: true });
    writeFileSync(report, `<?xml version="1.0" encoding="utf-8"?>\n<testsuites>\n${content}\n</testsuites>\n`);
    return pythonStatus === 0 && nodeStatuses.every((status) => status === 0) ? 0 : 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

main().then((status) => { process.exitCode = status; }, (error) => {
  console.error(`test-schedule-command: ${error.message}`);
  process.exitCode = 2;
});
