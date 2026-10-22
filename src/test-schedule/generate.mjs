// The CI configuration generated from a schedule (MOD-test-schedule, Interfaces: ciConfiguration): a GitHub Actions
// workflow or a GitLab CI file with one job per ticked row and occasion, from the fixed parts in templates/.
//
// Module: MOD-test-schedule

import { participantsOf } from "../participant-list/index.mjs";
import { formatFinding } from "../text-tools/index.mjs";
import { scheduleFindings } from "./rules.mjs";
import { OCCASIONS, nightlyCron, nightlyRows, occasionsOf, rowsOf, secretsNeeded } from "./occasions.mjs";
import { ownText } from "./own-file.mjs";

const NAMES = ["github-head", "github-job", "github-done", "gitlab-head", "gitlab-job", "gitlab-done"];
const TEMPLATES = Object.fromEntries(await Promise.all(
  NAMES.map(async (name) => [name, await ownText(`templates/${name}.yml`)])));

const GITHUB_FILE = ".github/workflows/agent-m-tests.yml";
const GITLAB_FILE = ".gitlab/agent-m-tests.yml";
const INCLUDE_ENTRY = `- local: ${GITLAB_FILE}`;
const DEFAULT_COMMAND = "node --test --test-reporter=junit --test-reporter-destination=";
const DEFAULT_REPORT = "agent-m-report.xml";

// What starts a job of each occasion, on GitHub (an `if:` expression) and on GitLab (a rule's `if` expression).
const GITHUB_IF = {
  "every commit": () => "github.event_name == 'push' && !startsWith(github.ref, 'refs/tags/')",
  "pull request": () => "github.event_name == 'pull_request'",
  nightly: () => "github.event_name == 'schedule'",
  "release candidate": () => "github.event_name == 'push' && startsWith(github.ref, 'refs/tags/')",
  "on demand": (row) => `github.event_name == 'workflow_dispatch' && contains(format(',{0},', inputs.rows), ',${row},')`,
};
const GITLAB_IF = {
  "every commit": () => '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_TAG == null',
  "pull request": () => '$CI_PIPELINE_SOURCE == "merge_request_event"',
  nightly: () => '$CI_PIPELINE_SOURCE == "schedule"',
  "release candidate": () => "$CI_COMMIT_TAG =~ /^v.*-rc\\..*$/",
  "on demand": (row) => `$CI_PIPELINE_SOURCE == "web" && $ROWS =~ /(^|,)${row}(,|$)/`,
};
// A push that changes only job records or conversation records starts no GitLab commit job. GitLab's `rules:changes` takes
// globs of Ruby's File.fnmatch, which have no negation of a directory but do have `[!x]` and braces: the paths below are
// every path that does not lie under one of the ignored directories.
const IGNORED = ["docs/jobs", "docs/conversations"];

// The names that are not one of `names`, as brace alternatives: at each position a character other than those the names
// continue with, a proper prefix of a name, and a name continued by at least one more character.
function otherThan(names, prefix = "") {
  const next = [...new Set(names.filter((n) => n.length > prefix.length && n.startsWith(prefix)).map((n) => n[prefix.length]))];
  const alternatives = next.length ? [`${prefix}[!${next.join("")}]*`] : [];
  if (prefix && !names.includes(prefix)) alternatives.push(prefix);
  if (names.includes(prefix)) alternatives.push(`${prefix}?*`);
  for (const c of next) alternatives.push(...otherThan(names, prefix + c));
  return alternatives;
}
const braces = (names) => `{${otherThan(names).join(",")}}`;
const below = IGNORED.map((d) => d.split("/")).reduce((m, [top, sub]) => m.set(top, [...(m.get(top) ?? []), sub]), new Map());
const GITLAB_CHANGES = ["*", ...[...below].flatMap(([top, subs]) => [`${top}/*`, `${top}/${braces(subs)}/**/*`]),
  `${braces([...below.keys()])}/**/*`];

const quoted = (text) => `'${text.replaceAll("'", "''")}'`;
const lines = (indent, items) => items.map((item) => indent + item).join("\n");

// Fills the {{name}} marks of a template; a mark that stands alone on its line takes its value's lines, or leaves the line out.
function fill(template, values) {
  return template.replace(/^\{\{(\w+)\}\}(?:\n|$)|\{\{(\w+)\}\}/gm, (all, alone, inline) => {
    const value = values[alone ?? inline];
    if (alone) return value ? `${value}\n` : "";
    return value;
  });
}

// Where a row runs: the runner label of the participant its `runs on` names, or null for the server's own runners.
function runnerOf(cells, participants) {
  const named = cells["runs on"];
  if (!named || named === "hosted") return null;
  return /runner:(\S+)/.exec(participantsOf(participants).find((p) => p.name === named)?.route ?? "")?.[1] ?? null;
}

/**
 * ciConfiguration(schedule, target, resources, participants) -> { files, include, pipelineSchedule } — the configuration
 * generated from the schedule: on GitHub `.github/workflows/agent-m-tests.yml`; on GitLab `.gitlab/agent-m-tests.yml`, the
 * entry the product's `.gitlab-ci.yml` must include it by, and the pipeline schedule of the nightly run. Throws
 * `InvalidSchedule` (with `findings`) for a schedule with an error finding.
 */
export function ciConfiguration(schedule, target, resources, participants) {
  const findings = scheduleFindings(schedule, participants).filter((f) => f.kind === "error");
  if (findings.length) {
    throw Object.assign(new Error(`InvalidSchedule: ${findings.map(formatFinding).join("; ")}`),
      { name: "InvalidSchedule", findings });
  }
  const github = target.server === "github";
  const secrets = secretsNeeded(schedule, resources).map((s) => s.name);
  const fm = schedule.fields;
  const command = fm.command || null;
  const report = fm.report || DEFAULT_REPORT;
  const rows = rowsOf(schedule);
  const jobs = rows.flatMap(({ cells }) => OCCASIONS.filter((o) => occasionsOf(cells.Row, schedule).includes(o)).map((occasion) => {
    const row = cells.Row;
    const key = `${row}-${occasion.replaceAll(" ", "-")}`;
    const runner = runnerOf(cells, participants);
    const names = row === "paid" ? secrets : [];
    const run = command ?? `${DEFAULT_COMMAND}${report}`;
    if (github) {
      return fill(TEMPLATES["github-job"], {
        key, row, condition: GITHUB_IF[occasion](row), runsOn: runner ? `[self-hosted, ${runner}]` : "ubuntu-latest",
        secrets: lines("      ", names.map((n) => `${n}: \${{ secrets.${n} }}`)),
        instance: target.instance, commit: target.instanceCommit, command: run, report,
      });
    }
    const clone = quoted(`git clone ${target.instance} .agent-m && git -C .agent-m checkout ${target.instanceCommit}`);
    return fill(TEMPLATES["gitlab-job"], {
      key, row, tags: runner ? `  tags: [${runner}]` : "", rule: quoted(GITLAB_IF[occasion](row)),
      secrets: names.length ? `  # Secrets, read from the CI variables: ${names.join(", ")}` : "",
      changes: occasion === "every commit" ? `      changes:\n${lines("        ", GITLAB_CHANGES.map((c) => `- "${c}"`))}` : "",
      clone, command: quoted(run),
      handOn: quoted(`if [ -f ${report} ]; then AGENT_M_REPORT=${report} AGENT_M_INSTANCE_COMMIT=${target.instanceCommit} `
        + "node .agent-m/src/workflow-entries/main.mjs onTestsFinished; fi"),
    });
  }));
  const nightly = nightlyRows(schedule);
  const instance = { instance: target.instance, commit: target.instanceCommit };
  if (github) {
    const head = fill(TEMPLATES["github-head"], {
      nightly: nightly.length ? `  schedule:\n    - cron: "${nightlyCron(schedule)}"` : "",
    });
    const done = fill(TEMPLATES["github-done"], instance);
    return { files: { [GITHUB_FILE]: head + [...jobs, done].join("") }, include: null, pipelineSchedule: null };
  }
  const done = fill(TEMPLATES["gitlab-done"], { clone: quoted(`git clone ${target.instance} .agent-m && git -C .agent-m checkout ${target.instanceCommit}`), commit: target.instanceCommit });
  return {
    files: { [GITLAB_FILE]: TEMPLATES["gitlab-head"] + [...jobs, done].join("\n") },
    include: { file: ".gitlab-ci.yml", entry: INCLUDE_ENTRY },
    pipelineSchedule: nightly.length ? { cron: nightlyCron(schedule), rows: nightly } : null,
  };
}

// ---------------------------------------------------------------------------------------- the comparison with a committed one

// The runs of committed lines that differ from the generated lines, as { at, found, expected }: `at` is the 0-based line of the
// committed text where the run begins, `found` its lines there and `expected` the generated lines that stand in their place — either
// may be empty, for a line that is missing or one that is added. A line left out or put in changes the runs at its own place only.
function hunks(committed, generated) {
  let start = 0;
  while (start < committed.length && start < generated.length && committed[start] === generated[start]) start += 1;
  let endCommitted = committed.length;
  let endGenerated = generated.length;
  while (endCommitted > start && endGenerated > start && committed[endCommitted - 1] === generated[endGenerated - 1]) {
    endCommitted -= 1;
    endGenerated -= 1;
  }
  const a = committed.slice(start, endCommitted);
  const b = generated.slice(start, endGenerated);
  // table[i][j]: the length of the longest common run of lines of a[i..] and b[j..].
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const runs = [];
  let current = null;
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      current = null;
      i += 1;
      j += 1;
      continue;
    }
    if (!current) runs.push(current = { at: start + i, found: [], expected: [] });
    if (i < a.length && (j === b.length || table[i + 1][j] >= table[i][j + 1])) current.found.push(a[i++]);
    else current.expected.push(b[j++]);
  }
  return runs;
}

const shown = (lines) => (lines.length ? `\`${lines.map((line) => line.trim()).join(" | ")}\`` : "nothing");

// The include entry as a line of the product's `.gitlab-ci.yml` may write it: with or without quotes, and with a comment.
const plainEntry = (line) => line.trim().replace(/\s+#.*$/, "").replace(/["']/g, "");

// What a workflow's `on:` names, as far as its text shows: `on: push`, `on: [push, pull_request]`, `on: { push: ... }`, or the
// block whose keys (or list items) stand one level below `on:`.
function triggersOf(text) {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => /^["']?on["']?\s*:/.test(line));
  if (at < 0) return [];
  const inline = lines[at].replace(/^["']?on["']?\s*:\s*/, "").replace(/\s+#.*$/, "").trim();
  if (inline) {
    let flat = inline.replace(/^[[{]|[\]}]$/g, "");
    for (let before = ""; before !== flat;) {
      before = flat;
      flat = flat.replace(/[[{][^[\]{}]*[\]}]/g, "");
    }
    return flat.split(",").map((item) => /^[\w-]+/.exec(item.trim())?.[0]).filter(Boolean);
  }
  const body = [];
  for (const line of lines.slice(at + 1)) {
    if (/^\s*(#.*)?$/.test(line)) continue;
    if (!/^\s/.test(line)) break;
    body.push(line);
  }
  const indent = (line) => line.length - line.trimStart().length;
  const base = Math.min(...body.map(indent));
  return body.filter((line) => indent(line) === base).map((line) => /^\s*(?:-\s+)?([\w-]+)/.exec(line)?.[1]).filter(Boolean);
}

// The occasion each event of a workflow stands for.
const EVENT_OCCASION = { push: "every commit", pull_request: "pull request", pull_request_target: "pull request", schedule: "nightly", workflow_dispatch: "on demand" };

// What is said of a configuration Agent M did not generate: its triggers, and the rows the schedule ticks for the occasions they stand for.
function foreignReading(text, schedule) {
  const triggers = [...new Set(triggersOf(text))];
  const occasions = [...new Set(triggers.flatMap((trigger) => EVENT_OCCASION[trigger] ?? []))];
  const rows = rowsOf(schedule).map(({ cells }) => cells.Row).filter((row) => occasions.some((o) => occasionsOf(row, schedule).includes(o)));
  return `not generated by Agent M; triggers: ${triggers.join(", ") || "none that could be read"}; the schedule runs`
    + ` ${rows.join(", ") || "no row"} on the occasions they stand for (${occasions.join(", ") || "none"})`;
}

/**
 * configurationDrift(files, schedule, target, resources, participants) -> Array<{ path, difference }> — where the committed
 * configuration differs from the one `ciConfiguration` generates from the same schedule, target, resources and participants: for
 * each generated file, each run of lines that differs (or the file, where it is missing), with the number of its first line and
 * the lines found and generated; on GitLab also the product's `.gitlab-ci.yml` where it lacks the include entry; and, for each
 * GitHub workflow Agent M did not generate, its triggers and the rows they run. Empty where the configuration agrees. Throws
 * `InvalidSchedule`, as `ciConfiguration` does. Nothing of the committed files is used to generate the text they are compared with.
 */
export function configurationDrift(files, schedule, target, resources, participants) {
  const generated = ciConfiguration(schedule, target, resources, participants);
  const found = [];
  for (const [path, text] of Object.entries(generated.files)) {
    if (files[path] === undefined) {
      found.push({ path, difference: "the file is missing; the schedule generates it" });
      continue;
    }
    for (const run of hunks(files[path].split("\n"), text.split("\n"))) {
      found.push({ path, difference: `line ${run.at + 1}: found ${shown(run.found)}; the schedule generates ${shown(run.expected)}` });
    }
  }
  if (generated.include) {
    const { file, entry } = generated.include;
    if (files[file] === undefined) found.push({ path: file, difference: `the file is missing; it must include ${entry}` });
    else if (!files[file].split("\n").some((line) => plainEntry(line) === plainEntry(entry))) {
      found.push({ path: file, difference: `no line holds the include entry ${entry}` });
    }
  }
  if (target.server === "github") {
    for (const path of Object.keys(files)) {
      if (/^\.github\/workflows\/(?!agent-m-)[^/]+\.ya?ml$/.test(path)) found.push({ path, difference: foreignReading(files[path], schedule) });
    }
  }
  return found;
}
