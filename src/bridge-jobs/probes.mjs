// probes.mjs — the harmless requests of the probes that ask the computer itself (docs/architecture/MOD-bridge-jobs.md, Parts and Interfaces: `POST /v1/probes/{kind}`):
// the partitions of a cluster, through the scheduler's command on this computer.
//
// Module: MOD-bridge-jobs
// Private to the module: handlers.mjs uses it.

import { execFile } from "node:child_process";

const COMMAND = ["sinfo", "--noheader", "--format=%P|%a"];

/**
 * listPartitions() -> Promise<{ name: string, state: string }[]> — SLURM's `sinfo --noheader --format=%P|%a`, each line a partition's name and its state.
 * A computer without `sinfo`, or a command that fails, is rejected with the code `upstream-failed`, its message naming the command and the command's own message.
 */
export function listPartitions() {
  return new Promise((resolve, reject) => {
    execFile(COMMAND[0], COMMAND.slice(1), { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        const failure = new Error(`${COMMAND.join(" ")}: ${String(stderr).trim() || error.message}`);
        failure.code = "upstream-failed";
        reject(failure);
        return;
      }
      resolve(stdout.split("\n").filter((line) => line.trim() !== "").map((line) => {
        const [name, state = ""] = line.split("|");
        return { name: name.trim(), state: state.trim() };
      }));
    });
  });
}
