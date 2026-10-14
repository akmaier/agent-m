// Module: MOD-workflow-entries
// The result entry composes the public declaration parser, JUnit parser and append-only writer.
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readDocument } from "../documents/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { appendResult, parseOutcomes, resultSchema } from "../result-records/index.mjs";
import { composeProduct } from "./compose.mjs";

const exec = promisify(execFile);
const cell = (value) => String(value ?? "").replace(/\r?\n/g, "\\n");

/** onTestsFinished(env: CiEnvironment) -> Promise<EntryStatus>. A failed append never reports done. */
export async function onTestsFinished(env) {
  if (!env.job.personToken) return { outcome: "not run", summary: `${env.job.tokenName} is missing. Nothing was written.`, findings: [] };
  if (!env.tests.report) return { outcome: "failed", summary: "The JUnit report path is missing. Nothing was written.", findings: [] };
  const { product } = composeProduct(env);
  const snapshot = await product.host.readSnapshot(env.tests.commit);
  const declarations = [];
  for (const path of snapshot.paths.filter(isTestFile)) {
    declarations.push(...testDeclarations(path, await snapshot.read(path) ?? "").filter((test) => env.tests.levels.includes(test.level)));
  }
  let outcomes;
  try {
    outcomes = parseOutcomes(await readFile(env.tests.report, "utf8"), declarations);
  } catch (error) {
    throw new Error(`The JUnit report ${env.tests.report} could not be read: ${error.message}`, { cause: error });
  }
  const { stdout } = await exec("git", ["status", "--porcelain"], { cwd: env.job.productDir, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  const iso = env.now.toISOString();
  const date = `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
  const stamp = iso.slice(0, 16).replace(/[-:T]/g, "").replace(/^(\d{8})(\d{4})$/, "$1-$2");
  const path = `runs/${env.tests.commit}/${stamp}-${env.tests.occasion}-${randomBytes(2).toString("hex")}.md`;
  const record = readDocument(resultSchema.run, path, "");
  record.fields = { commit: env.tests.commit, levels: env.tests.levels, occasion: env.tests.occasion,
    participant: env.tests.participant, date, ...(env.job.runUrl ? { run: env.job.runUrl } : {}), ...(stdout ? { uncommitted: "true" } : {}) };
  record.sections = [{ heading: "## Outcomes", text: "", rows: outcomes.map((outcome) => ({ cells: {
    Test: cell(outcome.test), Level: outcome.level, Outcome: outcome.outcome, Runs: outcome.runs,
  } })) }];
  const failures = outcomes.filter((outcome) => outcome.failure);
  if (failures.length) record.sections.push({ heading: "## Failures", text: "", rows: failures.map((outcome) => ({ cells: {
    Test: cell(outcome.test), Expected: cell(outcome.failure.expected), Observed: cell(outcome.failure.observed), Log: cell(outcome.failure.log),
  } })) });
  for (let attempt = 1; ; attempt++) {
    try {
      const made = await appendResult(product.host, record);
      return { outcome: "done", summary: `Recorded tests of ${env.tests.commit}: ${made.path}.`, findings: [] };
    } catch (error) {
      if (error?.name !== "Moved" || attempt >= 5) throw error;
    }
  }
}
