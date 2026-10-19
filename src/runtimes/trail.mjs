// trail.mjs — what a job left in its product (docs/architecture/MOD-runtimes.md, Interfaces: jobTrail; UC-036). ITM-1022 builds jobTrail.
//
// Module: MOD-runtimes
//
// It only reads, through the product's host. Where the text leaves a reading open, this file takes the one it names:
//   - The branch named after the job is named by the job's identifier.
//   - The commits of the job are those of the branch's history dated at or after the record's `start`, as liveState dates what a job wrote after its cancel; the history is asked with `changes: false`, at most 100 commits.
//   - The pull request is the newest one of the branch, in any state; the CI runs are those of the branch whose commit is one of the job's commits.
//   - A branch the host does not hold (NotFound) gives no commits and no runs; its pull request, if the host lists one, stays. Every other failure of the host is passed on.

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
