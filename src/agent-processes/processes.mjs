// MOD-agent-processes — process-backed Driver construction (ITM-321).

import { spawn } from "node:child_process";
import { agentConfiguration, answerFor, ownLoginEnvironment, usageFor } from "./index.mjs";

function failure(name, message, details = {}) {
  return Object.assign(new Error(message), { name, ...details });
}

function isCi() {
  return process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

function environmentFor(keyVariable) {
  if (isCi() && typeof keyVariable === "string") return undefined;
  return ownLoginEnvironment();
}

function stop(child) {
  if (!child.pid) return;
  if (process.platform === "win32") child.kill("SIGTERM");
  else process.kill(-child.pid, "SIGTERM");
}

function started(command, args, workdir, keyVariable, options) {
  return new Promise((resolve) => {
    const environment = environmentFor(keyVariable);
    const child = spawn(command, args, {
      cwd: workdir,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
      ...(environment ? { env: environment } : {}),
    });
    let stdout = "", stderr = "", aborted = options.signal?.aborted === true, settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      options.signal?.removeEventListener("abort", cancel);
      resolve(result);
    };
    const cancel = () => {
      aborted = true;
      try { stop(child); } catch { /* the child already ended */ }
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
export function agentDriver(agent, { workdir, keyVariable }, participant) {
  return {
    participant,
    async send(input, options = {}) {
      if (options.signal?.aborted) throw failure("Cancelled", "the job was cancelled");
      if (!agent?.installed) throw failure("AgentMissing", "the selected agent is not installed");
      if (!agent.loggedIn) throw failure("AgentNotLoggedIn", "the selected agent is not logged in");
      const row = agentConfiguration(agent.name);
      if (!row) throw failure("AgentMissing", "the selected agent is not supported");
      const result = await started(row.command, row.task.args.map((arg) => arg === "{prompt}" ? input.prompt : arg),
        input.workdir ?? workdir, keyVariable, options);
      if (result.aborted) throw failure("Cancelled", "the job was cancelled");
      if (result.error || result.status !== 0) {
        const lastOutput = (result.stderr || result.stdout).trim();
        throw failure("AgentFailed", "the agent process failed", { exitCode: result.status, lastOutput });
      }
      try {
        return { text: answerFor(row.task, result.stdout), usage: usageFor(row.task, result.stdout) };
      } catch (error) {
        throw failure("AgentFailed", "the agent output cannot be read", {
          exitCode: result.status,
          lastOutput: error instanceof Error ? error.message : String(error),
        });
      }
    },
  };
}
