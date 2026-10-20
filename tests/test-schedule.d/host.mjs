// A fake of MOD-repository-hosts' Host for the tests of MOD-test-schedule: it records every call it receives. It is test code and
// holds no expected result.
//
// Module: MOD-test-schedule
// Level: unit

export const COMMIT = "c".repeat(40);
export const SCHEDULES_PAGE = "https://git.example.org/acme/product/-/pipeline_schedules";

// A host that records its calls. `files` is the product at the head; the pipeline schedules are kept by description, so that a
// second save of the same description replaces the first, as the real host's setPipelineSchedule does.
export function fakeHost({ server = "github", files = {}, defaultBranch = "trunk", failCommit = null } = {}) {
  const calls = [], pipelineSchedules = new Map();
  const record = (name, ...args) => calls.push({ name, args });
  return {
    calls, pipelineSchedules,
    of: (name) => calls.filter((c) => c.name === name),
    async repositoryInfo() { record("repositoryInfo"); return { defaultBranch, visibility: "private", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) {
      record("readSnapshot", ref);
      return { ref, commit: ref, paths: Object.keys(files), read: async (path) => files[path] ?? null, blob: (path) => (path in files ? "blob" : null) };
    },
    async createBranch(name, from) { record("createBranch", name, from); },
    async commitFiles(change) {
      record("commitFiles", change);
      if (failCommit) throw failCommit;
      return { commit: COMMIT, url: "https://example.org/commit" };
    },
    async openPullRequest(request) { record("openPullRequest", request); return { number: 7, url: "https://example.org/pull/7", head: COMMIT, ...request }; },
    async setPipelineSchedule(schedule) { record("setPipelineSchedule", schedule); pipelineSchedules.set(schedule.description, schedule); return { id: 1, url: SCHEDULES_PAGE }; },
    webLinks: () => ({ pipelineSchedules: server === "gitlab" ? SCHEDULES_PAGE : null }),
  };
}
