// bridge.mjs — the Bridge route (docs/architecture/MOD-runtimes.md, Parts: "bridge.mjs — the Bridge route through the Bridge client, and the driver of an agent or an endpoint on a
// Bridge"). Of it, ITM-325 builds queueJob's Bridge route (queueOnBridge) and bridgeDriver. Resuming, live state, the log and cancel on a Bridge, and a job of a run, are not built yet.
//
// Module: MOD-runtimes
//
// It uses MOD-bridge-client only through its index.mjs. The Bridge's failures are the client's own, by name, and are not changed; a hand-over that fails after the start was committed
// carries what was queued as `queued` ({ path, commit }), so that a caller can say that the job waits for the Bridge to take it when it next reads the repository. The input of an ask is the
// driver's canonical prompt: MOD-job-runner adds the transient context without repeating the prepared parts.

import { ask, handOver } from "../bridge-client/index.mjs";
import { startRecord } from "../job-ledger/index.mjs";
import { driverPrompt } from "../job-runner/index.mjs";

/**
 * queueOnBridge(host, start, head, bridge?) -> Promise<{ path, commit }> — MOD-runtimes' queueJob for the Bridge route: the job's start record committed on the head that was read, as the
 * person's commit, on the branch the host's repositoryInfo names; then, when `bridge` — the handle of the Bridge the participant's route names — is given, the job handed over to it with the
 * product's address, the record's path and that commit. Without a handle the Bridge takes the job when it next reads the repository. Fails as the host fails, before anything is written; a
 * hand-over that fails after the commit is thrown as the Bridge client's error, to which `queued` is added, and the start stays committed. With `task` — a conversation's
 * hand-over (hand-over.mjs) — the task travels in the hand-over, beside the product, the record and the commit, and in no file.
 */
export async function queueOnBridge(host, start, head, bridge, task) {
  const [{ defaultBranch }, snapshot] = await Promise.all([host.repositoryInfo(), host.readSnapshot(head)]);
  const { path, text } = startRecord(start);
  const { commit } = await host.commitFiles({ branch: defaultBranch, expectedHead: head, files: [{ path, text }], message: `Queue job ${start.id}: ${start.kind}` });
  if (bridge) {
    try {
      await handOver(bridge, { product: snapshot.repository.web, record: path, commit, ...(task === undefined ? {} : { task }) });
    } catch (error) {
      error.queued = { path, commit };
      throw error;
    }
  }
  return { path, commit };
}

/**
 * bridgeDriver(bridge, target, participant) -> Driver — a driver whose `send` hands driverPrompt(input) to the named agent on the Bridge (`{ agent }`), or to the model endpoint the Bridge calls
 * (`{ endpoint }`, the endpoint's configuration), through the client's `ask`, and returns the answer's text and the usage reported. Fails with what the client names. The abort signal is not passed
 * on: `ask` takes none.
 */
export function bridgeDriver(bridge, target, participant) {
  return { participant, async send(input) {
    const { text, usage } = await ask(bridge, target, driverPrompt(input));
    return { text, usage };
  } };
}
