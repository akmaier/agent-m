// The CI configuration generated from a schedule (MOD-test-schedule, Interfaces: ciConfiguration): a GitHub Actions
// workflow or a GitLab CI file with one job per ticked row and occasion, from the fixed parts in templates/.
//
// Module: MOD-test-schedule

import { participantsOf } from "../participant-list/index.mjs";
import { formatFinding } from "../text-tools/index.mjs";
import { scheduleFindings } from "./rules.mjs";
import { OCCASIONS, occasionsOf, rowsOf, secretsNeeded } from "./occasions.mjs";
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

const nightlyCron = (schedule) => {
  const [hour, minute] = schedule.fields.nightly.split(":").map(Number);
  return `${minute} ${hour} * * *`;
};

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
  const nightlyRows = rows.map(({ cells }) => cells.Row).filter((row) => occasionsOf(row, schedule).includes("nightly"));
  const instance = { instance: target.instance, commit: target.instanceCommit };
  if (github) {
    const head = fill(TEMPLATES["github-head"], {
      nightly: nightlyRows.length ? `  schedule:\n    - cron: "${nightlyCron(schedule)}"` : "",
    });
    const done = fill(TEMPLATES["github-done"], instance);
    return { files: { [GITHUB_FILE]: head + [...jobs, done].join("") }, include: null, pipelineSchedule: null };
  }
  const done = fill(TEMPLATES["gitlab-done"], { clone: quoted(`git clone ${target.instance} .agent-m && git -C .agent-m checkout ${target.instanceCommit}`), commit: target.instanceCommit });
  return {
    files: { [GITLAB_FILE]: TEMPLATES["gitlab-head"] + [...jobs, done].join("\n") },
    include: { file: ".gitlab-ci.yml", entry: INCLUDE_ENTRY },
    pipelineSchedule: nightlyRows.length ? { cron: nightlyCron(schedule), rows: nightlyRows } : null,
  };
}

// The occasion each trigger of a GitHub workflow starts.
const TRIGGER_OCCASION = { push: "every commit", pull_request: "pull request", schedule: "nightly", workflow_dispatch: "on demand" };
const WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/;

// The triggers under the `on:` key of a workflow: a scalar, a flow list, or the keys of the block below it.
function triggersOf(text) {
  const all = text.split("\n");
  const at = all.findIndex((line) => /^on:/.test(line));
  if (at < 0) return [];
  const inline = all[at].slice(3).replace(/#.*/, "").replace(/[[\]\s]/g, "");
  if (inline) return inline.split(",");
  const block = all.slice(at + 1).findIndex((line) => /^\S/.test(line));
  return all.slice(at + 1, block < 0 ? undefined : at + 1 + block).flatMap((line) => /^ {2}(\w+):/.exec(line)?.slice(1) ?? []);
}

// The resources and participants the committed generated file records, as documents ciConfiguration reads: one endpoint per
// secret name it lists, and for each row the schedule runs on a participant the runner label of that row's first job.
function recorded(files, schedule, target) {
  const text = files[target.server === "github" ? GITHUB_FILE : GITLAB_FILE] ?? "";
  const listed = target.server === "github"
    ? [...text.matchAll(/^ {6}(\w+): \$\{\{ secrets\.\1 \}\}$/gm)].map((m) => m[1])
    : (/# Secrets, read from the CI variables: (.*)$/m.exec(text)?.[1].split(", ") ?? []);
  const names = [...new Set(listed)];
  const resources = { sections: [{ rows: names.map((name) => ({ cells: { Name: name, Kind: "endpoint", Secret: `ci:${name}` } })) }] };
  const rows = [];
  for (const { cells } of rowsOf(schedule)) {
    const named = cells["runs on"];
    if (!named || named === "hosted") continue;
    const start = text.search(new RegExp(`^ {0,2}${cells.Row}-[\\w-]+:$`, "m"));
    const job = start < 0 ? "" : text.slice(start).split(/\n(?= {0,2}[\w-]+:$)/)[0];
    const label = /runs-on: \[self-hosted, (\S+)\]|tags: \[(\S+)\]/.exec(job);
    rows.push({ cells: { Name: named, Type: "CI agent", Capabilities: "run code and tests", Route: `ci runner:${label?.[1] ?? label?.[2] ?? "unknown"}` } });
  }
  return { resources, participants: { sections: [{ rows }] } };
}

/**
 * configurationDrift(files, schedule, target) -> Array<{ path, difference }> — where the committed configuration differs
 * from the one the schedule generates: a generated file missing or with a line other than the generated one (one difference
 * per such line), and on GitLab a `.gitlab-ci.yml` without the include entry. A GitHub workflow Agent M did not generate
 * gives its triggers, the occasions they start and the rows the schedule runs on those occasions. The resources and the
 * participants of the generation are those the committed generated file records: its secret names and its runner labels.
 */
export function configurationDrift(files, schedule, target) {
  const { resources, participants } = recorded(files, schedule, target);
  const { files: generated, include } = ciConfiguration(schedule, target, resources, participants);
  const found = [];
  for (const [path, text] of Object.entries(generated)) {
    if (!(path in files)) {
      found.push({ path, difference: "the generated file is missing" });
      continue;
    }
    const want = text.split("\n");
    const have = files[path].split("\n");
    for (let i = 0; i < Math.max(want.length, have.length); i++) {
      if (want[i] !== have[i]) {
        found.push({ path, difference: `line ${i + 1}: expected ${JSON.stringify(want[i] ?? null)}, found ${JSON.stringify(have[i] ?? null)}` });
      }
    }
  }
  if (include && include.file in files && !files[include.file].split("\n").some((line) => line.trim() === include.entry)) {
    found.push({ path: include.file, difference: `lacks the include entry ${include.entry}` });
  }
  for (const [path, text] of Object.entries(files)) {
    if (!WORKFLOW.test(path) || path in generated) continue;
    const triggers = triggersOf(text);
    const occasions = [...new Set(triggers.flatMap((t) => TRIGGER_OCCASION[t] ?? []))];
    const rows = rowsOf(schedule).map(({ cells }) => cells.Row).filter((row) => occasions.some((o) => occasionsOf(row, schedule).includes(o)));
    found.push({ path, difference: `not generated by Agent M; triggers: ${triggers.join(", ")}; occasions: ${occasions.join(", ")}; `
      + `rows the schedule runs on them: ${rows.join(", ")}` });
  }
  return found;
}
