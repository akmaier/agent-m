// MOD-bridge-jobs — the Bridge handlers for local jobs and probes (docs/architecture/MOD-bridge-jobs.md).

import { endSessions } from "./conversations.mjs";
import { stopWatching as stopWatchers } from "./watch.mjs";

export { jobHandlers } from "./handlers.mjs";
export { checkOut } from "./checkout.mjs";
export { keepRepositoryTokens, useRepositoryTokens } from "./tokens.mjs";
export { keepJobLogs } from "./joblogs.mjs";
export { startWatching, listJobs, jobLog } from "./watch.mjs";

/**
 * stopWatching(reason: "pause" | "quit") -> Promise<void> — takes nothing new; on quit every job still running ends as cancelled, and every running CLI session
 * of the prompt bar is ended as a cancel ends it (UC-049 4g).
 */
export async function stopWatching(reason) {
  await stopWatchers(reason);
  if (reason === "quit") await endSessions();
}
