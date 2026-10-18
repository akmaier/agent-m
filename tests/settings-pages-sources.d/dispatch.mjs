// The workflow runs and the dispatch of a workflow, for the tests of MOD-settings-pages' route `library` over tests/settings-pages-sources.d/github.mjs: a fetch that answers the instance's runs of fetch-sources.yml
// (none, or one failed run whose log is given), their jobs and logs, and the dispatch of the workflow — recording its body, answering 204 or the status given — and hands everything else to the world's fetch. It is code
// only; it holds no expected result.
//
// Module: MOD-settings-pages
// Level: unit

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// withRuns(world, repository, { log?, dispatchStatus? }) -> { fetch, dispatched } — `log` makes one failed run of fetch-sources.yml whose log is that text; `dispatched` lists the bodies of the dispatches.
export function withRuns(world, repository, { log, dispatchStatus = 204 } = {}) {
  const dispatched = [];
  const base = `/repos/${repository}/actions`;
  async function fetch(input, init = {}) {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    if (method === "GET" && url.pathname === `${base}/workflows/fetch-sources.yml/runs`) {
      return json({ workflow_runs: log === undefined ? [] : [{ id: 1, path: ".github/workflows/fetch-sources.yml", head_sha: "h".repeat(40), event: "push", status: "completed",
        conclusion: "failure", html_url: `https://github.com/${repository}/actions/runs/1`, run_started_at: "2026-10-14T10:00:00Z", updated_at: "2026-10-14T10:01:00Z" }] });
    }
    if (method === "GET" && url.pathname === `${base}/runs/1/jobs`) return json({ jobs: [{ id: 11, name: "fetch" }] });
    if (method === "GET" && url.pathname === `${base}/jobs/11/logs`) return new Response(log, { status: 200 });
    if (method === "POST" && url.pathname === `${base}/workflows/fetch-sources.yml/dispatches`) {
      dispatched.push(JSON.parse(init.body));
      return dispatchStatus === 204 ? new Response(null, { status: 204 }) : json({ message: "Unexpected inputs provided" }, dispatchStatus);
    }
    return world.fetch(input, init);
  }
  return { fetch, dispatched };
}
