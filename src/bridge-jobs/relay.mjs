// relay.mjs — the relay of a running job (MOD-bridge-jobs, Parts: relay.mjs; Data: Each push is forwarded at once, The relay, The merge, What the agent is told
// of the relay): the outbox looked at and its pushes forwarded, the agent's requests carried out and answered.
//
// Module: MOD-bridge-jobs
//
// NO MODEL READS A CREDENTIAL, A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT: the agent writes its requests into a folder of the job it may write; the Bridge,
// outside the enclosure, makes the calls — the fetch with its own git and the token it holds for the product, the others through the product's host with that
// token — and writes each answer into a folder only it writes. A request is read without following a link; an answer holds nothing of a request's file but the
// answer's fields, and no token the repository tokens' file holds. The Bridge runs no git in the outbox: it only fetches from it into its own clone.

import { constants } from "node:fs";
import { lstat, open as openFile, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { heldTokens } from "./tokens.mjs";
import { cloneOrFetch, forward, forwarding, originBranches, originOf } from "./workfolders.mjs";

const EVERY_MS = 2000;
const CALLS = ["fetch", "read", "open", "log", "merge"];
const REQUEST = /^[A-Za-z0-9_-]+\.json$/;
// The check of the product's CI in which the Definition of Done is checked (MOD-test-schedule), the one the merge waits for.
const DONE_CHECK = "agent-m done";
const TEXT = new URL("./relay.md", import.meta.url);

/**
 * relayText({ folders, branch, merges }) -> Promise<string> — relay.md with its named places filled: the two folders, the job's branch, and who merges — `you`,
 * or `a person` where the job's parameters say `merges: person`.
 */
export async function relayText({ folders, branch, merges }) {
  const values = { requests: folders.requests, answers: folders.answers, branch, merges: merges === "person" ? "a person" : "you" };
  return (await readFile(TEXT, "utf8")).replace(/\{\{(requests|answers|branch|merges)\}\}/g, (_, name) => values[name]).trimEnd();
}

// What a host's failure, or git's, says: its name and its words.
const said = (error) => (error?.name && error.name !== "Error" ? `${error.name}: ${error.message}` : String(error?.message ?? error));
const answerOf = (call, fields = {}) => ({ call, done: false, reason: null, state: null, log: null, branches: null, ...fields });
const refusal = (call, reason) => answerOf(call, { reason });
// A request's file as it stands, read without following a link: its text where it is a regular file with one link, null otherwise.
async function requestText(path) {
  const before = await lstat(path).catch(() => null);
  if (!before?.isFile() || before.nlink !== 1) return null;
  let handle;
  try {
    handle = await openFile(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const now = await handle.stat();
    if (!now.isFile() || now.nlink !== 1 || now.ino !== before.ino) return null;
    return await handle.readFile("utf8");
  } catch {
    return null;
  } finally {
    await handle?.close();
  }
}

/**
 * relayOf({ job, address, clone, outbox, folders, host, open, merges, gates, signal, every }) -> { state, look, during, last } — the relay of one running job: `clone`
 * the Bridge's clone of the product at `address`, `outbox` the job's outbox, `folders` its relay's folders, or null for a job without a relay, whose outbox is
 * forwarded alone; `host` the product's host through that clone; `open(branch)` the writer's call that opens the branch's pull request; `merges` the job's
 * parameter `merges`, `gates` its context's gates; `signal` the job's, after whose abort nothing is forwarded and no request carried out.
 *   - look() — one look: the outbox forwarded, then each request taken, carried out and answered.
 *   - during(work) — `work()`, with a look every `every` milliseconds while it runs (two seconds by default); its result.
 *   - last() — the forward after the agent's answer: a branch the origin still refuses throws, naming the branch and what git said.
 */
export function relayOf({ job, address, clone, outbox, folders, host, open, merges = null, gates = [], signal = null, every = EVERY_MS }) {
  const state = forwarding(outbox);
  const answered = new Set();
  const seen = new Map();
  const runs = new Set();
  const stopped = () => Boolean(signal?.aborted);
  const made = (branch) => typeof branch === "string" && state.outbox[branch] !== undefined && state.outbox[branch] !== state.base[branch];

  // The branch as the Bridge keeps it: what the outbox holds, what the origin holds, the forward the origin refused.
  const forwardingState = async (branch) => ({ branch, outbox: state.outbox[branch] ?? null, origin: await originOf(clone, branch), refused: state.refused[branch] ?? null,
    pullRequest: null, commits: null, checks: null, runs: null });

  // The branch as it stands, with its pull request — the one open, else the one merged — and its CI from the server; without a pull request the branch's runs.
  async function branchState(branch, kept) {
    const pulls = await host.listPullRequests({ branch, state: "all" });
    const pull = pulls.find((each) => each.state === "open") ?? pulls.find((each) => each.state === "merged") ?? null;
    if (!pull) return { ...kept, runs: await host.listCiRuns({ branch }) };
    const facts = await host.pullRequestFacts(pull.number);
    return { ...kept, pullRequest: facts.pullRequest ?? pull, commits: facts.commits.map(({ sha, message, ci }) => ({ sha, message, ci })), checks: facts.checks };
  }

  // Which of the merge's conditions does not hold, each in a sentence; none where the Bridge may merge.
  function notMergeable(branchNow) {
    const pull = branchNow.pullRequest;
    const failing = [];
    if (merges === "person") failing.push("the job's parameters say merges: person, so a person merges");
    if (!pull) failing.push("the branch has no pull request open");
    else if (pull.state !== "open" || pull.draft) failing.push(pull.draft ? "the branch's pull request is a draft" : `the branch's pull request is ${pull.state}, not open`);
    if (branchNow.outbox !== branchNow.origin) failing.push("the origin does not hold what the outbox holds of the branch: it waits to be forwarded");
    const waiting = gates.filter((gate) => gate.point === "before-merge" && !gate.passed);
    if (waiting.length) failing.push(`the gate ${waiting.map((gate) => gate.name).join(", ")} before the merge is not passed`);
    const check = (branchNow.checks ?? []).find((each) => each.name === DONE_CHECK);
    if (pull && check?.state !== "success") failing.push(`the check ${DONE_CHECK} of the product's CI has not succeeded on the pull request's head ${pull.head}`);
    return failing;
  }

  async function carriedOut(text) {
    let request;
    try { request = JSON.parse(text); } catch { return refusal(null, "the request is not JSON"); }
    if (!request || typeof request !== "object" || Array.isArray(request)) return refusal(null, "the request is no JSON object");
    const call = CALLS.includes(request.call) ? request.call : null;
    if (!call) return refusal(null, `the request's call is none of ${CALLS.join(", ")}`);
    if (call === "fetch") {
      try {
        await cloneOrFetch(address, clone);
        return answerOf(call, { done: true, branches: await originBranches(clone) });
      } catch (error) {
        return answerOf(call, { reason: said(error), branches: await originBranches(clone).catch(() => null) });
      }
    }
    if (call === "log") {
      if (typeof request.run !== "string" || !runs.has(request.run)) return refusal(call, "the request's run is no CI run a read answer of this job named");
      try { return answerOf(call, { done: true, log: await host.ciRunLog(request.run) }); } catch (error) { return refusal(call, said(error)); }
    }
    if (!made(request.branch)) return refusal(call, "the request's branch is no branch this job made or moved in the outbox");
    const { branch } = request;
    const kept = await forwardingState(branch);
    try {
      const before = await branchState(branch, kept);
      if (call === "read") {
        for (const run of before.runs ?? []) runs.add(run.id);
        return answerOf(call, { done: true, state: before });
      }
      if (call === "open") {
        await open(branch);
        return answerOf(call, { done: true, state: await branchState(branch, kept) });
      }
      const failing = notMergeable(before);
      if (failing.length) return answerOf(call, { reason: `not merged: ${failing.join("; ")}`, state: before });
      await host.mergePullRequest(before.pullRequest.number, before.pullRequest.head);
      return answerOf(call, { done: true, state: await branchState(branch, await forwardingState(branch)) });
    } catch (error) {
      return answerOf(call, { reason: said(error), state: kept });
    }
  }

  // The answer written beside and renamed into place, every token the tokens' file holds replaced by ***.
  async function written(name, answer) {
    let text = `${JSON.stringify(answer, null, 2)}\n`;
    for (const token of await heldTokens()) text = text.split(token).join("***");
    const beside = join(folders.answers, `.${name}.new`);
    await writeFile(beside, text, { encoding: "utf8", mode: 0o644 });
    await rename(beside, join(folders.answers, name));
  }

  async function answerRequests() {
    const names = (await readdir(folders.requests).catch(() => [])).filter((name) => REQUEST.test(name) && !answered.has(name)).sort();
    for (const name of names) {
      if (stopped()) return;
      const text = await requestText(join(folders.requests, name));
      if (text === null) { seen.delete(name); continue; }
      if (seen.get(name) !== text) { seen.set(name, text); continue; }
      seen.delete(name);
      answered.add(name);
      const answer = await carriedOut(text);
      if (stopped()) return;
      await written(name, answer);
    }
  }

  async function look() {
    if (stopped()) return;
    // A forward that fails here — git could not read the outbox — is tried again at the next look; the forward after the answer names it.
    await forward(state, { clone, job }).catch(() => {});
    if (folders && !stopped()) await answerRequests();
  }

  async function during(work) {
    let looking = null, ended = false;
    const timer = setInterval(() => {
      if (!looking && !ended) looking = look().catch(() => {}).finally(() => { looking = null; });
    }, every);
    timer.unref?.();
    try {
      return await work();
    } finally {
      ended = true;
      clearInterval(timer);
      await looking;
    }
  }

  async function last() {
    if (stopped()) return;
    await forward(state, { clone, job, again: true });
    const [branch, refused] = Object.entries(state.refused)[0] ?? [];
    if (branch) throw new Error(`the Bridge could not push the agent's branch ${branch}: ${refused.said}`);
  }

  return { state, look, during, last };
}
