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
