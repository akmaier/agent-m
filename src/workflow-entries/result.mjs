// result.mjs — the run's result between the two machines of a product's job workflow, on GitHub and on GitLab (MOD-workflow-entries, Parts): on the agent's machine, the
// repository the checkout's pushes land in, the writes that need the server kept for later, and the result packed; on the writing machine, the result read,
// checked and written.
//
// Module: MOD-workflow-entries
//
// A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET. The agent's machine holds no token that
// may write: its checkout pushes, through MOD-repository-hosts' local clone as everywhere else, to a bare repository in the result folder (the checkout's push
// address, `remote.origin.pushurl`), whose new commits travel as a git bundle, so that every commit keeps its identifier. What needs the server — opening a
// pull request — and the end of each job's record, which names the pull request, are kept in `deferred.json` and done on the writing machine. Node only.

const builtin = (name) => globalThis.process.getBuiltinModule(`node:${name}`);

// The files a result may not change: the repository's workflow files, on GitHub and on GitLab.
const WORKFLOW_FILE = /^(\.github\/workflows\/|\.gitlab-ci\.yml$|\.gitlab\/)/;
// The address a pull request kept for later stands under in what the agent's machine wrote, until the writing machine has opened it.
const PENDING = "pending-pull-request:";
export const pendingPullRequest = (branch) => `${PENDING}${branch}`;

const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

// One git command in `dir` -> its standard output (a Buffer where `buffer`); a failure -> { failed: what git says } where `tolerate`, else an Error.
function git(dir, args, { buffer = false, tolerate = false, input } = {}) {
  const run = builtin("child_process").spawnSync("git", args, { cwd: dir, input, maxBuffer: 1 << 28, encoding: buffer ? "buffer" : "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  if (run.status === 0) return buffer ? run.stdout : run.stdout.trim();
  const said = String(run.stderr ?? "").trim() || `git ${args[0]} exited with ${run.status}`;
  if (tolerate) return { failed: said };
  throw failure("GitFailed", `git ${args[0]}: ${said}`, { reason: said });
}

// The branches of a repository: { "refs/heads/<name>": commit }.
function branchesOf(dir) {
  const listed = git(dir, ["for-each-ref", "--format=%(refname) %(objectname)", "refs/heads"]);
  return Object.fromEntries(listed.split("\n").filter(Boolean).map((line) => line.split(" ")));
}

const readJson = (file) => JSON.parse(builtin("fs").readFileSync(file, "utf8"));
const writeJson = (file, value) => builtin("fs").writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/**
 * prepareResult(productDir: string, resultDir: string, branch: string) -> { pullRequest(request) -> string, end(path, part, trailers) -> void } — on the agent's
 * machine: makes, once, the bare repository `<resultDir>/result.git` as a clone of the product's checkout, notes its branches as the result's base, and sets it as
 * the checkout's push address, so that every commit the job makes in the checkout lands there; then returns what keeps the writes for later in
 * `<resultDir>/deferred.json`: `pullRequest` keeps a request to open a pull request and returns the address it stands under until it is opened, and `end` keeps
 * the end of a job's record — the part, with its time, and the provenance lines of its commit. Fails as git fails.
 */
export function prepareResult(productDir, resultDir, branch) {
  const fs = builtin("fs"), path = builtin("path");
  const bare = path.resolve(resultDir, "result.git"), deferredFile = path.join(resultDir, "deferred.json");
  if (!fs.existsSync(deferredFile)) {
    fs.mkdirSync(resultDir, { recursive: true });
    git(resultDir, ["clone", "--bare", "--quiet", path.resolve(productDir), bare]);
    writeJson(path.join(resultDir, "base.json"), { branch, refs: branchesOf(bare) });
    git(productDir, ["remote", "set-url", "--push", "origin", bare]);
    writeJson(deferredFile, { pullRequests: [], ends: [] });
  }
  const keep = (field, entry) => {
    const deferred = readJson(deferredFile);
    deferred[field].push(entry);
    writeJson(deferredFile, deferred);
  };
  return {
    pullRequest(request) {
      keep("pullRequests", { branch: request.branch, base: request.base, title: request.title, body: request.body });
      return pendingPullRequest(request.branch);
    },
    end(recordPath, part, trailers) {
      keep("ends", { path: recordPath, part: { ...part, part: { ...part.part, at: new Date(part.part.at).toISOString() } }, trailers });
    },
  };
}

/**
 * packResult(resultDir: string) -> { refs: { ref, commit }[], ends: number, pullRequests: number } | null — on the agent's machine, after the job: the result in
 * `<resultDir>/out`: `result.json` — the default branch, the base, every branch of the bare repository that is new or moved, and what was kept for later — and,
 * where a branch moved, `result.bundle`, a git bundle of those branches without the base's commits. Null where prepareResult was not called. Fails as git fails.
 */
export function packResult(resultDir) {
  const fs = builtin("fs"), path = builtin("path");
  if (!fs.existsSync(path.join(resultDir, "deferred.json"))) return null;
  const bare = path.join(resultDir, "result.git"), out = path.join(resultDir, "out");
  const base = readJson(path.join(resultDir, "base.json")), deferred = readJson(path.join(resultDir, "deferred.json"));
  const refs = Object.entries(branchesOf(bare)).filter(([ref, commit]) => base.refs[ref] !== commit).map(([ref, commit]) => ({ ref, commit }));
  fs.mkdirSync(out, { recursive: true });
  if (refs.length > 0) {
    const exclude = [...new Set(Object.values(base.refs))];
    git(bare, ["bundle", "create", path.resolve(out, "result.bundle"), ...refs.map((each) => each.ref), ...(exclude.length ? ["--not", ...exclude] : [])]);
  }
  writeJson(path.join(out, "result.json"), { branch: base.branch, base: base.refs, refs, pullRequests: deferred.pullRequests, ends: deferred.ends });
  return { refs, ends: deferred.ends.length, pullRequests: deferred.pullRequests.length };
}

/**
 * readResult(productDir: string, outDir: string) -> { result, commits: { commit, message, paths, texts }[] } | null — on the writing machine: the result the agent's
 * machine left in `outDir`, its bundle fetched into the product's checkout under `refs/agent-m-result/`, and each of its commits that the base does not hold, with
 * its message, the paths it changes — against each parent of a merge — and the bytes of each of those files as the commit holds them. Null where the folder holds
 * no result. Throws ResultUnreadable where the bundle does not apply to the checkout or names other branches than the result.
 */
export function readResult(productDir, outDir) {
  const fs = builtin("fs"), path = builtin("path");
  const file = path.join(outDir, "result.json");
  if (!fs.existsSync(file)) return null;
  const result = readJson(file);
  if (result.refs.length === 0) return { result, commits: [] };
  const bundle = path.resolve(outDir, "result.bundle");
  // The bundle needs the base's commits; a checkout of a later head, or a shallow one, fetches each it lacks from the origin.
  for (const commit of new Set(Object.values(result.base))) {
    if (typeof git(productDir, ["cat-file", "-e", `${commit}^{commit}`], { tolerate: true }) !== "string") git(productDir, ["fetch", "--quiet", "--depth=1", "origin", commit], { tolerate: true });
  }
  const fetched = git(productDir, ["fetch", "--quiet", bundle, "+refs/heads/*:refs/agent-m-result/*"], { tolerate: true });
  if (typeof fetched !== "string") throw failure("ResultUnreadable", `the result's bundle does not apply to the checkout: ${fetched.failed}`);
  for (const { ref, commit } of result.refs) {
    const got = git(productDir, ["rev-parse", "--verify", "--quiet", `refs/agent-m-result/${ref.slice("refs/heads/".length)}`], { tolerate: true });
    if (got !== commit) throw failure("ResultUnreadable", `the result's bundle does not hold ${ref} at ${commit}`);
  }
  const exclude = [...new Set(Object.values(result.base))];
  const listed = git(productDir, ["rev-list", ...result.refs.map((each) => each.commit), ...(exclude.length ? ["--not", ...exclude] : [])]);
  const commits = listed.split("\n").filter(Boolean).map((commit) => {
    const paths = [...new Set(git(productDir, ["diff-tree", "-m", "-r", "--root", "--no-commit-id", "--name-only", commit]).split("\n").filter(Boolean))];
    // A path the commit removes has no bytes there: null.
    const texts = paths.map((each) => {
      const bytes = git(productDir, ["cat-file", "blob", `${commit}:${each}`], { buffer: true, tolerate: true });
      return Buffer.isBuffer(bytes) ? bytes : null;
    });
    return { commit, message: git(productDir, ["log", "-1", "--format=%B", commit]), paths, texts };
  });
  return { result, commits };
}

/**
 * checkResult(read: { result, commits }, secrets: string[], task: string | null) -> string | null — why the result is refused, or null: a commit that changes a
 * workflow file of the repository (`.github/workflows/`, `.gitlab-ci.yml`, `.gitlab/`); the value of a secret of the run in a commit's message, in a file a commit
 * changes, in a branch's name, or in what was kept for later; and, for a run a hand-over started, the task's words in a commit's message or in a pull request's title
 * or description. The reason names the commit and the file, never a secret's value or the task. Pure.
 */
export function checkResult(read, secrets, task) {
  const short = (commit) => commit.slice(0, 12);
  for (const { commit, paths } of read.commits) {
    const changed = paths.find((each) => WORKFLOW_FILE.test(each));
    if (changed) return `the commit ${short(commit)} changes the workflow file ${changed}, which a job's result may not change`;
  }
  // What was kept for later names only a job's record as the file of an end, and only a branch of the result as the branch of a pull request.
  const odd = read.result.ends.find((each) => !/^docs\/jobs\/[^/]+\.md$/.test(each.path));
  if (odd) return `an end kept for later names ${odd.path}, which is no job's record`;
  const strange = read.result.pullRequests.find((each) => !read.result.refs.some(({ ref }) => ref === `refs/heads/${each.branch}`));
  if (strange) return `a pull request kept for later names the branch ${strange.branch}, which the result does not hold`;
  const kept = JSON.stringify({ pullRequests: read.result.pullRequests, ends: read.result.ends });
  for (const secret of secrets.filter((each) => typeof each === "string" && each.length > 0)) {
    for (const { commit, message, paths, texts } of read.commits) {
      if (message.includes(secret)) return `the commit ${short(commit)} holds a key of the run in its message`;
      const at = texts.findIndex((bytes) => bytes !== null && bytes.includes(secret));
      if (at !== -1) return `the commit ${short(commit)} holds a key of the run in ${paths[at]}`;
    }
    if (read.result.refs.some(({ ref }) => ref.includes(secret))) return "a branch of the result holds a key of the run in its name";
    if (kept.includes(secret)) return "what the agent's machine kept for later holds a key of the run";
  }
  const words = typeof task === "string" ? task.trim() : "";
  if (words) {
    for (const { commit, message } of read.commits) if (message.includes(words)) return `the commit ${short(commit)} holds the task of the hand-over in its message`;
    for (const request of read.result.pullRequests) {
      if (`${request.title}\n${request.body}`.includes(words)) return `the pull request of the branch ${request.branch} holds the task of the hand-over`;
    }
  }
  return null;
}

/**
 * writeBranches(productDir: string, result) -> Map<string, string> — on the writing machine, after checkResult: pushes the result's branches to the checkout's
 * origin, with the credentials of the checkout, never forced. The default branch first: where the origin's branch stands at the result's base, its commits as they
 * are; where it has moved on, each of them picked onto it in their order, and pushed again where it moved meanwhile, up to five times; the checkout then stands at
 * what was pushed. Then every other branch as it is. Returns each commit picked anew by its old identifier. Throws ResultNotApplied where a commit does not apply
 * on the branch as it stands now, or a push is refused or fails.
 */
export function writeBranches(productDir, result) {
  const renamed = new Map();
  const local = (ref) => `refs/agent-m-result/${ref.slice("refs/heads/".length)}`;
  const main = `refs/heads/${result.branch}`;
  const own = result.refs.find((each) => each.ref === main);
  if (own) {
    const base = result.base[main];
    for (let attempt = 1; ; attempt++) {
      const fetched = git(productDir, ["fetch", "--quiet", "origin", main], { tolerate: true });
      if (typeof fetched !== "string") throw failure("ResultNotApplied", `the branch ${result.branch} could not be read: ${fetched.failed}`);
      const head = git(productDir, ["rev-parse", "FETCH_HEAD"]);
      let target = own.commit;
      renamed.clear();
      if (head !== base) {
        git(productDir, ["checkout", "--quiet", "--detach", head]);
        const picks = git(productDir, ["rev-list", "--reverse", "--topo-order", "--parents", local(main), ...(base ? ["--not", base] : [])]).split("\n").filter(Boolean);
        for (const line of picks) {
          const [commit, ...parents] = line.split(" ");
          if (parents.length > 1) throw failure("ResultNotApplied", `the merge ${commit.slice(0, 12)} on ${result.branch} cannot be picked onto the branch as it stands now`);
          const picked = git(productDir, ["cherry-pick", "--allow-empty", commit], { tolerate: true });
          if (typeof picked !== "string") {
            git(productDir, ["cherry-pick", "--abort"], { tolerate: true });
            throw failure("ResultNotApplied", `the commit ${commit.slice(0, 12)} does not apply on ${result.branch} as it stands now`);
          }
          renamed.set(commit, git(productDir, ["rev-parse", "HEAD"]));
        }
        target = git(productDir, ["rev-parse", "HEAD"]);
      }
      const pushed = git(productDir, ["push", "--quiet", "origin", `${target}:${main}`], { tolerate: true });
      if (typeof pushed === "string") {
        git(productDir, ["checkout", "--quiet", "--detach", target]);
        break;
      }
      if (!/rejected|non-fast-forward|fetch first|stale info/i.test(pushed.failed) || attempt >= 5) {
        throw failure("ResultNotApplied", `the branch ${result.branch} could not be pushed: ${pushed.failed}`);
      }
    }
  }
  for (const { ref, commit } of result.refs.filter((each) => each.ref !== main)) {
    const pushed = git(productDir, ["push", "--quiet", "origin", `${commit}:${ref}`], { tolerate: true });
    if (typeof pushed !== "string") throw failure("ResultNotApplied", `the branch ${ref.slice("refs/heads/".length)} could not be pushed: ${pushed.failed}`);
  }
  return renamed;
}
