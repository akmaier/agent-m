# Module: MOD-runtimes
# Guards: AGENT M WORKS WITHOUT A LOCAL INSTALLATION; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
# Guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
# Level: release
"""SPEC section 14 - the check named tests/test_runtime_levels.py, for the three requirements whose Check line gives it:
AGENT M WORKS WITHOUT A LOCAL INSTALLATION ("every job kind whose definition names no local resource is runnable on the hosted-CI route;
counter-proof: a job needing a compute resource is not offered there"), A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET ("the generated
job workflow reads the key only from the named secret; counter-proof: a workflow with the key written into it fails") and A HOSTED JOB WRITES WITH
THE PERSON'S TOKEN FROM A CI SECRET ("the generated job workflow authenticates its pushes and pull requests with the named secret;
counter-proof: a workflow that uses GITHUB_TOKEN for them fails").

The cases live in tests/test_runtime_levels.md. This file only loads them and asks node to run the real code of src/runtimes/ and
src/job-catalogue/: routesFor over the participants and needs of a case, that sweep over every kind of the catalogue whose definition says
`resources: none`, and jobWorkflowFiles for GitHub and for GitLab. A workflow "fails" a check where the checks below, which are this
file's, find a line in the generated text: a key named anywhere but as the secret it reads or in the list of key names, and a use of the
workflow's own token (GITHUB_TOKEN, github.token, CI_JOB_TOKEN) or a push token that is not the named secret. The counter-proofs plant what
the SPEC describes into the generated text - the key written into it, the built-in token used - and the same checks must then find it.

Written for ITM-1134 by a participant who built none of MOD-runtimes' behaviour (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
LOCAL = "AGENT M WORKS WITHOUT A LOCAL INSTALLATION"
KEY = "A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET"
TOKEN = "A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET"

# The adapter. `input` is the case's input; the value is what the case may state: `available` (routes), `kinds` and `unavailable` (kinds),
# `findings`, `flagged` and `files` (workflow; the key check for the requirement about the agent's key, the token check for the one about the person's token).
WORLD = r"""
const participantOf = (route) => ({ name: "ci-agent", type: "CI agent", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "GitHub Actions", route });
const hostedOffer = (offers) => offers.find((offer) => offer.route.kind === "ci");
const INSTANCE = { repository: "alice/agent-m", commit: "c0ffee0000000000000000000000000000000000" };

// The checks of the generated text. A comment line says what a file does and names no value.
const codeLines = (text) => text.split("\n").filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));
function keyFindings(text, keys) {
  const found = [];
  for (const line of codeLines(text)) for (const key of keys) {
    if (!line.includes(key)) continue;
    const reads = line.trim() === key + ": ${{ secrets." + key + " }}";
    const names = /AGENT_M_KEY_NAMES/.test(line);
    if (!reads && !names) found.push("key " + key + " is not read from the secret of that name: " + line.trim());
  }
  for (const line of codeLines(text)) if (/\bsk-[A-Za-z0-9-]{8,}/.test(line)) found.push("a key value is written into the workflow: " + line.trim());
  return found;
}
function tokenFindings(text, server, token) {
  const found = [];
  for (const line of codeLines(text)) if (/secrets\.GITHUB_TOKEN|github\.token|\bGITHUB_TOKEN\b|CI_JOB_TOKEN/.test(line)) found.push("the workflow's own token is used: " + line.trim());
  const lines = codeLines(text).map((line) => line.trim());
  if (server === "github") {
    const checkouts = lines.filter((line) => line.startsWith("token:"));
    if (checkouts.length < 2) found.push("fewer than two checkouts carry a token");
    for (const line of checkouts) if (line !== "token: ${{ secrets." + token + " }}") found.push("a checkout does not authenticate with the named secret: " + line);
    if (!lines.includes("AGENT_M_TOKEN: ${{ secrets." + token + " }}")) found.push("the entry is not given the named secret as its token");
  } else {
    if (!lines.some((line) => line.includes('printenv "$AGENT_M_TOKEN_NAME"'))) found.push("the token is not read from the variable the job names");
    if (!lines.some((line) => line.includes("AGENT_M_TOKEN_NAME") && line.includes('"' + token + '"'))) found.push("the job does not name the token variable");
    if (!lines.some((line) => line.includes("Bearer $AGENT_M_TOKEN"))) found.push("the clone does not authenticate with the token");
  }
  return found;
}

if (input.check === "routes") {
  const me = participantOf(input.participantRoute);
  const offer = hostedOrRunner(runtimes.routesFor(me, [me], input.product, input.needs));
  return { available: offer.available };
}
if (input.check === "kinds") {
  const me = participantOf(input.participantRoute);
  const names = await jobCatalogue.kindNames();
  const unavailable = [];
  let seen = 0;
  for (const name of names) {
    const kind = await jobCatalogue.kindOf(name);
    if (kind.resources !== "none") continue;
    seen += 1;
    if (!hostedOrRunner(runtimes.routesFor(me, [me], input.product, [])).available) unavailable.push(name);
  }
  return { kinds: seen > 0, unavailable };
}
const files = runtimes.jobWorkflowFiles(input.server, INSTANCE, { token: input.token, keys: input.keys }, input.runners);
let text = files.map((file) => file.text).join("\n");
if (input.plant === "key-literal") {
  const key = input.keys[0];
  text = input.server === "github" ? text.replace("      " + key + ": ${{ secrets." + key + " }}", "      " + key + ": sk-ant-LITERAL-0123456789") : text.replace("  variables:\n", "  variables:\n    " + key + ": sk-ant-LITERAL-0123456789\n");
}
if (input.plant === "builtin-token") {
  text = input.server === "github" ? text.replace("token: ${{ secrets." + input.token + " }}", "token: ${{ secrets.GITHUB_TOKEN }}") : text.replace("Bearer $AGENT_M_TOKEN", "Bearer $CI_JOB_TOKEN");
}
const findings = input.rule === "key" ? keyFindings(text, input.keys) : tokenFindings(text, input.server, input.token);
return { findings, flagged: findings.length > 0, files: files.length };

function hostedOrRunner(offers) { return offers[0]; }
"""


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def run_world(argument: dict) -> dict:
    return js(f"const input = {json.dumps(argument)};\n{WORLD}")


def check(test: unittest.TestCase, section: str, rule: str | None = None) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run_world({**loaded["case"]["input"], "rule": rule})
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got[key] for key in wanted}, wanted)


class TestRuntimeLevels(unittest.TestCase):
    # TST-1134001 · level: release · module: MOD-runtimes
    # guards: AGENT M WORKS WITHOUT A LOCAL INSTALLATION
    # given: the cases under that requirement in the Markdown file beside this one: a CI agent on the server's own runners and a product with the job workflow, with every kind of the catalogue whose definition names no local resource, and with a job whose resources need neither a Bridge nor a runner
    # input: routesFor for the agent, with no needs
    # expect: the hosted-CI route is offered for every such kind (the sweep read kinds and none is unavailable) and for the job that needs no Bridge and no runner
    def test_every_job_without_a_local_resource_is_runnable_on_the_hosted_ci_route(self):
        check(self, LOCAL)

    # TST-1134002 · level: release · module: MOD-runtimes
    # guards: AGENT M WORKS WITHOUT A LOCAL INSTALLATION; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
    # given: the counter-proofs: a job needing a compute resource reached by a Bridge, and one reached by a self-hosted runner, for the same agent and product; the agent on that runner
    # input: routesFor with the need
    # expect: the hosted-CI route is not offered for either; the runner that reaches the resource is offered
    def test_a_job_needing_a_compute_resource_is_not_offered_on_the_hosted_ci_route(self):
        check(self, LOCAL + ": counter-proofs")

    # TST-1134003 · level: release · module: MOD-runtimes
    # guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
    # given: the cases under that requirement: the generated job workflow for GitHub and for GitLab, with the agent keys KEY_A and KEY_B named as CI secrets
    # input: jobWorkflowFiles for each server
    # expect: the check of this file finds no line that names a key other than as the secret it reads or in the list of key names, and no key value
    def test_the_generated_workflow_reads_the_agent_key_only_from_the_named_secret(self):
        check(self, KEY, "key")

    # TST-1134004 · level: release · module: MOD-runtimes
    # guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
    # given: the counter-proofs: the generated workflow in which a key value is written in place of the secret, for GitHub and for GitLab
    # input: the same check over the changed text
    # expect: the check finds it (flagged)
    def test_a_workflow_with_the_key_written_into_it_fails(self):
        check(self, KEY + ": counter-proofs", "key")

    # TST-1134005 · level: release · module: MOD-runtimes
    # guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
    # given: the cases under that requirement: the generated workflow for GitHub and for GitLab, with the token secret AGENT_M_TOKEN
    # input: jobWorkflowFiles for each server
    # expect: every checkout of the GitHub workflow takes the named secret and the entry is given it; the GitLab job reads the named variable and clones with it; neither uses the workflow's own token (GITHUB_TOKEN, github.token, CI_JOB_TOKEN)
    def test_the_generated_workflow_authenticates_with_the_named_token_secret(self):
        check(self, TOKEN, "token")

    # TST-1134006 · level: release · module: MOD-runtimes
    # guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
    # given: the counter-proofs: the generated GitHub workflow in which a checkout takes GITHUB_TOKEN, and the GitLab job in which the clone takes CI_JOB_TOKEN
    # input: the same check over the changed text
    # expect: the check finds it (flagged)
    def test_a_workflow_that_uses_the_built_in_token_fails(self):
        check(self, TOKEN + ": counter-proofs", "token")


if __name__ == "__main__":
    unittest.main()
