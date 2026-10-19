// The pull request of a schedule and the nightly pipeline schedule on GitLab (MOD-test-schedule, Interfaces: proposeSchedule,
// applyPipelineSchedule).
//
// Module: MOD-test-schedule

import { writeDocument } from "../documents/index.mjs";
import { ciConfiguration } from "./generate.mjs";
import { nightlyCron, nightlyRows } from "./occasions.mjs";
import { scheduleSchema } from "./index.mjs";

const SCHEDULE_FILE = "docs/tests/schedule.md";
const GITLAB_CI = ".gitlab-ci.yml";
const OWN_WORKFLOW = /^\.github\/workflows\/agent-m-[^/]*\.ya?ml$/;
const WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/;
const TITLE = "Agent M: the test schedule and its CI configuration";
const PIPELINE_DESCRIPTION = "Agent M nightly tests";
const isBlank = (line) => /^\s*(#.*)?$/.test(line);
const indentOf = (line) => /^ */.exec(line)[0].length;

// withInclude(text, entry) -> string — the product's .gitlab-ci.yml with the entry (`- local: <file>`) under include:, where it is
// missing and no other line touched; `text` itself where the file is named already. An include: written as a string or a map means a
// list of that one entry, and is rewritten as that list with the entry added after it.
function withInclude(text, entry) {
  const file = entry.replace(/^- local:\s*/, "");
  const lines = text === "" ? [] : text.replace(/\n$/, "").split("\n");
  const at = lines.findIndex((line) => /^include:/.test(line));
  const done = () => `${lines.join("\n")}\n`;
  if (at === -1) return `${[...lines, "include:", `  ${entry}`].join("\n")}\n`;
  const rest = lines[at].slice("include:".length).trim();
  if (rest !== "" && !rest.startsWith("#")) {
    const unquoted = rest.replace(/^(['"])(.*)\1$/, "$2");
    if (unquoted === file || new RegExp(`^\\{.*\\blocal:\\s*['"]?${escape(file)}['"]?\\s*[,}]`).test(rest)) return text;
    if (rest.startsWith("[") && rest.endsWith("]")) {
      if (rest.includes(file)) return text;
      lines[at] = `include: ${rest.slice(0, -1).trimEnd()}${rest === "[]" ? "" : ", "}{ local: ${file} }]`;
      return done();
    }
    lines.splice(at, 1, "include:", `  - ${rest}`, `  ${entry}`);
    return done();
  }
  let first = null, last = at;
  for (let i = at + 1; i < lines.length; i += 1) {
    if (isBlank(lines[i])) continue;
    if (indentOf(lines[i]) === 0 && !/^-\s/.test(lines[i])) break;
    first ??= i;
    last = i;
  }
  const pad = " ".repeat(first === null ? 2 : indentOf(lines[first]));
  if (first !== null && !/^\s*-\s/.test(lines[first])) {
    // A map: it is the one entry of a list.
    if (lines.slice(first, last + 1).some((line) => line.trim().replace(/['"]/g, "") === `local: ${file}`)) return text;
    for (let i = last; i >= first; i -= 1) if (!isBlank(lines[i])) lines[i] = i === first ? `${pad}- ${lines[i].trimStart()}` : `  ${lines[i]}`;
  } else if (lines.slice(at + 1, last + 1).some((line) => line.trim() === entry)) return text;
  lines.splice(last + 1, 0, `${pad}${entry}`);
  return done();
}
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The configuration at the head that Agent M did not generate: GitHub workflows other than Agent M's own, GitLab's .gitlab-ci.yml.
const foreignConfiguration = (server, paths) => server === "github"
  ? paths.filter((path) => WORKFLOW.test(path) && !OWN_WORKFLOW.test(path))
  : paths.filter((path) => path === GITLAB_CI);

/**
 * proposeSchedule(host, schedule, context) -> Promise<{ pullRequest, branch }> — one branch from the head that was read, one
 * commit of the schedule file, the generated file and, on GitLab, `.gitlab-ci.yml` with the include entry, and one pull request
 * into the default branch that holds them; it says when a configuration Agent M did not generate stays beside Agent M's. A
 * schedule with an error finding (InvalidSchedule) or an include: that is no list (GitlabCiNotList) writes nothing; the host's
 * failures are passed on.
 */
export async function proposeSchedule(host, schedule, context) {
  const { server, instance, instanceCommit, resources, participants, head, trailers = [] } = context;
  const generated = ciConfiguration(schedule, { server, instance, instanceCommit }, resources, participants);
  const snapshot = await host.readSnapshot(head);
  const files = [{ path: SCHEDULE_FILE, text: writeDocument(scheduleSchema, schedule) },
    ...Object.entries(generated.files).map(([path, text]) => ({ path, text }))];
  if (generated.include) {
    const old = await snapshot.read(generated.include.file);
    const text = withInclude(old ?? "", generated.include.entry);
    if (text !== old) files.push({ path: generated.include.file, text });
  }
  const { defaultBranch } = await host.repositoryInfo();
  const branch = `agent-m/schedule-${head.slice(0, 12)}`;
  await host.createBranch(branch, head);
  const message = [TITLE, ...(trailers.length ? ["", trailers.join("\n")] : [])].join("\n");
  await host.commitFiles({ branch, expectedHead: head, files, message });
  const foreign = foreignConfiguration(server, snapshot.paths);
  const body = [`This pull request holds the test schedule (${SCHEDULE_FILE}) and the CI configuration generated from it: ${Object.keys(generated.files).join(", ")}.`,
    ...(foreign.length ? ["", `Agent M's file stands beside the configuration this repository already has, which stays as it is: ${foreign.join(", ")}.`] : [])].join("\n");
  const pullRequest = await host.openPullRequest({ branch, base: defaultBranch, title: TITLE, body });
  return { pullRequest, branch };
}

/**
 * applyPipelineSchedule(host, schedule) -> Promise<{ url } | null> — on a GitLab server, the project's pipeline schedule of the
 * nightly run, created or updated (one description, so a second call adds none), at the declared time in UTC on the default
 * branch, with the rows the schedule ticks for nightly in the variable ROWS, inactive where none is; the address of the project's
 * pipeline schedules. `null` on GitHub, whose web links have no such page.
 */
export async function applyPipelineSchedule(host, schedule) {
  const url = host.webLinks().pipelineSchedules;
  if (!url) return null;
  const rows = nightlyRows(schedule);
  const { defaultBranch } = await host.repositoryInfo();
  await host.setPipelineSchedule({ description: PIPELINE_DESCRIPTION, cron: nightlyCron(schedule), timezone: "UTC", ref: defaultBranch,
    active: rows.length > 0, variables: { ROWS: rows.join(",") } });
  return { url };
}
