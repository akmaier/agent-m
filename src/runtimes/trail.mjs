// trail.mjs — what a job left in its product (docs/architecture/MOD-runtimes.md, Interfaces: jobTrail; UC-036). ITM-1022 builds jobTrail; ITM-1023 adds what liveState reports as written after a cancel (writtenAfterCancel) and revertAfterCancel.
//
// Module: MOD-runtimes
//
// It only reads, through the product's host. Where the text leaves a reading open, this file takes the one it names:
//   - The branch named after the job is named by the job's identifier.
//   - The commits of the job are those of the branch's history dated at or after the record's `start`, as liveState dates what a job wrote after its cancel; the history is asked with `changes: false`, at most 100 commits.
//   - The pull request is the newest one of the branch, in any state; the CI runs are those of the branch whose commit is one of the job's commits.
//   - A branch the host does not hold (NotFound) gives no commits and no runs; its pull request, if the host lists one, stays. Every other failure of the host is passed on.
//   - A commit is written after a cancel when its date is later than the `at` of the record's end of state `cancelled`; they are listed newest first, as the history gives them. revertAfterCancel takes "from before the first of them" as the parent
//     of the oldest given commit, writes a file that did not exist there as deleted, and accepts only a non-empty list of commits that writtenAfterCancel reports now.

const HISTORY = 100;

/**
 * jobTrail(record, product) -> Promise<{ branch, commits, pullRequest, runs }> — the commits of the branch named after the job since its start (readHistory, changes: false), the pull request of that branch
 * (listPullRequests) and the CI runs of its commits (listCiRuns). Crosses the network; fails as the host fails.
 */
export async function jobTrail(record, product) {
  const { host } = product;
  const branch = record.id;
  const since = record.start instanceof Date ? record.start.getTime() : Date.parse(record.start);
  let commits = [];
  try {
    commits = (await host.readHistory(null, { ref: branch, limit: HISTORY, changes: false })).filter((entry) => Date.parse(entry.date) >= since);
  } catch (failure) {
    if (failure?.name !== "NotFound") throw failure;
  }
  const pulls = await host.listPullRequests({ state: "all", branch });
  const pullRequest = pulls.reduce((newest, each) => (newest === null || each.number > newest.number ? each : newest), null);
  const own = new Set(commits.map((entry) => entry.commit));
  const runs = own.size === 0 ? [] : (await host.listCiRuns({ branch })).filter((each) => own.has(each.commit));
  return { branch, commits, pullRequest, runs };
}

/**
 * writtenAfterCancel(record, host) -> Promise<string[]> — the commits of the branch named after the job (readHistory, changes: false) dated after the record's end, for a record whose end is `cancelled`; none for any other record.
 * A branch the host does not hold gives none; every other failure of the host is passed on.
 */
export async function writtenAfterCancel(record, host) {
  if (record.end?.state !== "cancelled") return [];
  const cancelled = record.end.at instanceof Date ? record.end.at.getTime() : Date.parse(record.end.at);
  try {
    return (await host.readHistory(null, { ref: record.id, limit: HISTORY, changes: false })).filter((entry) => Date.parse(entry.date) > cancelled).map((entry) => entry.commit);
  } catch (failure) {
    if (failure?.name === "NotFound") return [];
    throw failure;
  }
}

/**
 * revertAfterCancel(record, product, commits, head) -> Promise<{ commit: string }> — one commit on the job's branch, on the head that was read: every file the given commits changed gets back its text from before the first of them
 * (readFileAt), and a file they added is removed. Only commits writtenAfterCancel reports are accepted; any other, and an empty list, is a TypeError. Fails as commitFiles fails, `Moved` among them.
 */
export async function revertAfterCancel(record, product, commits, head) {
  const { host } = product;
  const reported = new Set(await writtenAfterCancel(record, host));
  if (!Array.isArray(commits) || commits.length === 0 || commits.some((commit) => !reported.has(commit))) {
    throw new TypeError("revertAfterCancel takes commits that were written after the cancel, as liveState reports them");
  }
  const given = (await host.readHistory(null, { ref: record.id, limit: HISTORY, changes: true })).filter((entry) => commits.includes(entry.commit));
  const parent = given.at(-1)?.parents?.[0];
  const paths = [...new Set(given.flatMap((entry) => entry.changes.flatMap((change) => [change.path, ...(change.from ? [change.from] : [])])))];
  const files = [];
  for (const path of paths) {
    const before = parent === undefined ? null : (await host.readFileAt(path, [parent])).get(parent) ?? null;
    files.push(before === null ? { path, delete: true } : { path, text: before });
  }
  const { commit } = await host.commitFiles({ branch: record.id, expectedHead: head, files, message: `Revert ${commits.length} commit${commits.length === 1 ? "" : "s"} written after the cancel of ${record.id}` });
  return { commit };
}
