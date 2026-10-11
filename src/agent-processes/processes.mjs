// MOD-agent-processes — process-backed Driver construction (ITM-321).

import { spawn } from "node:child_process";

function failure(name, message, details = {}) {
  return Object.assign(new Error(message), { name, ...details });
}

function isCi() {
  return process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

function hasCiKey(keyVariable) {
  return isCi() && typeof keyVariable === "string";
}

function environmentFor(keyVariable, ownLoginEnvironment) {
  if (hasCiKey(keyVariable)) return undefined;
  return ownLoginEnvironment();
}

function stop(child) {
  if (!child.pid) return Promise.resolve();
  if (process.platform !== "win32") {
    try {
      process.kill(-child.pid, "SIGKILL");
      return Promise.resolve();
    } catch (error) {
      if (error?.code === "ESRCH") return Promise.resolve();
      return Promise.reject(error);
    }
  }
  return new Promise((resolve, reject) => {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    killer.once("error", reject);
    killer.once("close", (status) => {
      if (status === 0) resolve();
      else reject(Object.assign(new Error(`taskkill exited ${status}`), { exitCode: status }));
    });
  });
}

function started(command, args, workdir, keyVariable, options, ownLoginEnvironment) {
  return new Promise((resolve) => {
    const environment = environmentFor(keyVariable, ownLoginEnvironment);
    const child = spawn(command, args, {
      cwd: workdir,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
      ...(environment ? { env: environment } : {}),
    });
    let stdout = "", stderr = "", aborted = options.signal?.aborted === true, settled = false, stopping = null, stopError = null;
    const cancel = () => {
      aborted = true;
      stopping ??= stop(child).catch((error) => { stopError = error; });
    };
    const finish = async (result) => {
      if (settled) return;
      settled = true;
      options.signal?.removeEventListener("abort", cancel);
      await stopping;
      resolve({ ...result, stopError });
    };
    options.signal?.addEventListener("abort", cancel, { once: true });
    if (aborted) cancel();
    child.stdout.on("data", (chunk) => {
      const text = String(chunk);
      stdout += text;
      if (!aborted) options.onOutput?.(text);
    });
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", (error) => finish({ status: null, stdout, stderr, error, aborted }));
    child.on("close", (status) => finish({ status, stdout, stderr, error: null, aborted }));
  });
}

/**
 * agentDriver(agent, options, participant) -> Driver — runs one supported Agent in the working folder of a prepared
 * DriverInput. The register supplies command, task and output interpretation; local runs omit every declared credential
 * name before values are copied, while CI inherits its named secret without this module reading its value.
 */
export function processDriver(agent, { workdir, keyVariable }, participant, helpers) {
  return {
    participant,
    async send(input, options = {}) {
      if (options.signal?.aborted) throw failure("Cancelled", "the job was cancelled");
      if (!agent?.installed) throw failure("AgentMissing", "the selected agent is not installed");
      if (!agent.loggedIn && !hasCiKey(keyVariable)) throw failure("AgentNotLoggedIn", "the selected agent is not logged in");
      const row = helpers.configuration(agent.name);
      if (!row) throw failure("AgentMissing", "the selected agent is not supported");
      const result = await started(row.command, row.task.args.map((arg) => arg === "{prompt}" ? input.prompt : arg),
        input.workdir ?? workdir, keyVariable, options, helpers.ownLoginEnvironment);
      if (result.stopError) {
        throw failure("AgentFailed", "the agent process could not be stopped", {
          exitCode: result.stopError.exitCode ?? result.status,
          lastOutput: result.stopError.message,
        });
      }
      if (result.aborted) throw failure("Cancelled", "the job was cancelled");
      if (result.error || result.status !== 0) {
        const lastOutput = (result.stderr || result.stdout).trim();
        throw failure("AgentFailed", "the agent process failed", { exitCode: result.status, lastOutput });
      }
      try {
        return { text: helpers.answer(row.task, result.stdout), usage: helpers.usage(row.task, result.stdout) };
      } catch (error) {
        throw failure("AgentFailed", "the agent output cannot be read", {
          exitCode: result.status,
          lastOutput: error instanceof Error ? error.message : String(error),
        });
      }
    },
  };
}
