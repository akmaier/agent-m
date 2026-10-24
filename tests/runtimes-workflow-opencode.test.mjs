// The job workflow on GitHub installs opencode for a run a hand-over starts with a model endpoint — MOD-runtimes' jobWorkflowFiles and its template
// workflow/github.yml, as docs/architecture/MOD-runtimes.md states it (routesFor: "on the server's runners too, where opencode works with that endpoint";
// Data: Agent M's job workflow in a product). A runner of GitHub's has no opencode; the entry onDispatch runs one (MOD-workflow-entries), so the step that
// installs it, at a pinned version, comes before the entries, and only on a dispatch that names an endpoint.
// Run: node --test tests/runtimes-workflow-opencode.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-010; UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; NO SECRET IN THE REPOSITORY
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { jobWorkflowFiles } from "../src/runtimes/index.mjs";

const INSTANCE = { repository: "akmaier/agent-m", commit: "c0ffee0000000000000000000000000000000000" };

// TST-1200301 · level: unit · module: MOD-runtimes
// guards: UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; NO SECRET IN THE REPOSITORY
// given: the GitHub job workflow for the keys NVIDIA_API_KEY and HOSTED_KEY
// input: jobWorkflowFiles("github", INSTANCE, { token: "AGENT_M_TOKEN", keys: ["NVIDIA_API_KEY", "HOSTED_KEY"] }, [])
// expect: in each agent's job — and in no other job — one step, `if: github.event_name == 'workflow_dispatch' && inputs.endpoint != ''`, runs `npm install --global opencode-ai@1.19.0`, after setup-node and before the step of onDispatch; NVIDIA_API_KEY is read only as `NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}`, in the agent's job of that key and in the job that writes, and listed in AGENT_M_KEY_NAMES; no other line names it
test("the GitHub job workflow installs opencode, at a pinned version, only for a dispatch that names an endpoint, and reads NVIDIA_API_KEY only from its secret", () => {
  const [file] = jobWorkflowFiles("github", INSTANCE, { token: "AGENT_M_TOKEN", keys: ["NVIDIA_API_KEY", "HOSTED_KEY"] }, []);
  const jobs = file.text.slice(file.text.indexOf("\njobs:\n") + 7).split(/\n(?=  [A-Za-z0-9_-]+:\n)/);
  for (const job of jobs) {
    const id = /^\s*([A-Za-z0-9_-]+):/.exec(job)[1];
    const lines = job.split("\n");
    const installs = lines.filter((line) => line.includes("opencode"));
    if (!/-agent-\d+$/.test(id)) { assert.deepEqual(installs, [], id); continue; }
    const install = lines.findIndex((line) => line.trim() === "run: npm install --global opencode-ai@1.19.0");
    assert.ok(install > 0, `${id}: the install step`);
    assert.equal(installs.length, 1, `${id}: one line installs it, and nothing else names it`);
    assert.equal(lines[install - 1].trim(), "- if: github.event_name == 'workflow_dispatch' && inputs.endpoint != ''");
    assert.ok(lines.findIndex((line) => line.includes("actions/setup-node")) < install);
    assert.ok(lines.findIndex((line) => line.includes("main.mjs onDispatch")) > install);
  }
  const naming = file.text.split("\n").filter((line) => line.includes("NVIDIA_API_KEY")).map((line) => line.trim());
  assert.deepEqual([...new Set(naming)], ['AGENT_M_KEY_NAMES: "NVIDIA_API_KEY HOSTED_KEY"', "NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}"]);
  assert.equal(naming.filter((line) => line.startsWith("NVIDIA_API_KEY:")).length, 2);
});
