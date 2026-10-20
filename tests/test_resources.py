# Module: MOD-resource-list
# Guards: A PRODUCT DECLARES ITS RESOURCES; A RESOURCE IS USED, A PARTICIPANT DEVELOPS; THE RESOURCE KIND IS ONE OF A CLOSED SET; A RESOURCE IS PINNED TO AN EXACT STATE
# Guards: A RESOURCE DECLARES ITS LICENCE; A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED; A RESOURCE NAMES ITS MAINTAINER
# Guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER; A RESOURCE DECLARES WHERE IT PROCESSES DATA; A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
# Guards: THE INSTANCE DECLARES ITS OWN RESOURCES; INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
# Level: unit
"""SPEC section 8 - the check named tests/test_resources.py, for the twelve requirements whose Check sentence names it.

The cases live in tests/test_resources.md, one section per requirement, each case with what is given, what is done and what is expected. This file only
loads them and asks node to run them against the real MOD-resource-list (resourceSchema, resourceFindings, reachableBy and the recipes of resourceStrategies),
read through MOD-documents as every caller reads a list; against MOD-runtimes' routesFor for the requirement about where a job is offered; and, for the
requirement about restricted content, against the Resources page of MOD-settings-pages saving a list through the frame, since the module itself writes
nothing and the commit is the page's. A case that states a fault in its input (`plant`) is a counter-proof of the checker itself.

Written for ITM-1130 by a participant who built none of the resource items (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
ROOT = Path(__file__).resolve().parents[1]

# The adapter. `input` is the case's input; the value is what the case may state in `expected`.
WORLD = r"""
const COLUMNS = ["Name", "Kind", "Address", "Pin", "Licence", "Maintainer", "Route", "Processing place", "Paid", "Secret"];
const LIST = "docs/resources.md";
const listOf = (title, rows, extra = []) => {
  const columns = [...COLUMNS, ...extra];
  return [`# Resources of ${title}`, "", `| ${columns.join(" | ")} |`, `|${columns.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${columns.map((column) => row[column] ?? "—").join(" | ")} |`), ""].join("\n");
};
const resourceOf = ({ cells: c }) => ({ name: c.Name, kind: c.Kind, address: c.Address, pin: c.Pin ?? null, licence: c.Licence ?? null, maintainer: c.Maintainer ?? null,
  route: c.Route ?? "", place: c["Processing place"] ?? null, paid: c.Paid === "yes" ? true : c.Paid === "no" ? false : null, secret: c.Secret ?? null });
const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });
const failureOf = async (run) => { try { return { value: await run() }; } catch (error) { return { error: error.name }; } };

// A list is read as every caller reads it, and judged by the schema and by what the schema cannot say; the errors' rules are what the list is refused for.
function judged(input) {
  const schema = resourceList.resourceSchema();
  const text = listOf(input.title ?? "this product", input.rows, input.extraColumns ?? []);
  const read = documents.readRegister(schema, LIST, text);
  const errors = [...documents.documentFindings(schema, read.document), ...resourceList.resourceFindings(read.rows.map(resourceOf))].filter((found) => found.kind === "error");
  const rules = [...new Set(errors.map((found) => found.rule))];
  return { rejected: errors.length > 0, rules, refusedFor: input.rule ? rules.includes(input.rule) : undefined };
}

// A Resource of the type the module states, judged by resourceFindings alone: what the module says of an entry that carries a participant's capabilities or role.
function findings(input) {
  const errors = resourceList.resourceFindings([input.resource]).filter((found) => found.kind === "error");
  const rules = [...new Set(errors.map((found) => found.rule))];
  return { rejected: errors.length > 0, rules, refusedFor: input.rule ? rules.includes(input.rule) : undefined };
}

async function recipe(input) {
  const files = (list) => snapshotOf(list ?? {});
  const context = { product: { snapshot: files(input.product) }, instance: { snapshot: files(input.instance) } };
  const run = resourceList.resourceStrategies.recipes[input.recipe];
  const outcome = await failureOf(() => run(context, input.params));
  if (outcome.error) return { error: outcome.error };
  const parts = outcome.value;
  return { parts: parts.map((part) => part.name), lines: parts.flatMap((part) => part.text.split("\n").filter((line) => line.startsWith("- "))), mentions: parts.map((part) => part.text) };
}

async function routes(input) {
  const read = documents.readRegister(resourceList.resourceSchema(), LIST, listOf("this product", input.rows));
  const needs = resourceList.reachableBy(read.rows.map(resourceOf));
  const participants = input.participants;
  const offered = {};
  for (const participant of participants) {
    const offers = runtimes.routesFor(participant, participants, { visibility: input.visibility, jobWorkflow: true }, needs);
    offered[participant.name] = offers.map((offer) => offer.available);
  }
  return { needs, offered };
}

// What a commit holds is checked against the requirement: declaring a restricted resource commits docs/resources.md and nothing else, and no text of the resource.
const violations = (commits, content) => commits.flatMap((commit) => [
  ...Object.keys(commit.files).filter((path) => path !== LIST).map((path) => `adds ${path}`),
  ...Object.entries(commit.files).filter(([, text]) => String(text).includes(content)).map(([path]) => `${path} holds the resource's content`),
]);

async function declare(input) {
  const url = (path) => `file://${ROOT}/tests/${path}`;
  const harness = await import(url("settings-pages-harness.mjs"));
  harness.installDocument();
  const frame = await import(url("settings-pages-sources.d/frame.mjs"));
  const github = await import(url("settings-pages-sources.d/github.mjs"));
  const cleanups = [];
  const t = { after: (fn) => cleanups.push(fn) };
  const CONTENT = "TEXT-OF-A-FILE-OF-THE-RESOURCE";
  const PRODUCT = "https://github.com/alice/thesis-tool", REPO = "alice/thesis-tool";
  const page = await frame.visit(t, `#resources/product=${encodeURIComponent(PRODUCT)}`, {
    repositories: { "akmaer/agent-m": { files: { "docs/resources.md": listOf("agent-m", []) } }, [REPO]: { files: { "docs/resources.md": listOf("thesis-tool", []) } },
      "alice/dlls": { files: { "README.md": CONTENT, "docs/notes.md": CONTENT } } },
    settings: { "github-token": { value: "github_pat_INSTANCE0123456789abcdefghij", name: "A", expires: "2027-01-01" }, products: [PRODUCT],
      [`github-token:${REPO}`]: { value: "github_pat_PRODUCT0123456789abcdefghijk", name: "B", expires: "2027-01-01" } },
  });
  const main = page.main();
  const adding = harness.byTag(main, "div").find((node) => node.className.split(" ").includes("resources-adding"));
  harness.byTag(adding, "select")[0].value = "repository";
  const [name, address] = harness.byTag(adding, "input");
  name.value = "dlls"; address.value = "https://github.com/alice/dlls";
  await frame.click(harness.byTag(adding, "button").find((button) => button.textContent === "+ Add resource"));
  const area = harness.byTag(main, "textarea")[0];
  area.value = area.value.replace(/\| dlls \| repository \| ([^|]+) \| ([0-9a-f]{40}) \| — \| — \|/, `| dlls | repository | $1 | $2 | ${input.licence} | the Acme organisation |`);
  area.dispatchEvent(new Event("input"));
  await frame.settle();
  await frame.click(harness.byTag(main, "button").filter((button) => button.textContent === "Save").at(-1));
  const commits = page.world.commits(REPO);
  const shown = commits.map((commit) => ({ sha: commit.sha, files: { ...commit.files } }));
  if (input.plant) shown[0].files[input.plant] = CONTENT;
  for (const clean of cleanups) clean();
  return { commits: shown.length, committedFiles: shown.flatMap((commit) => Object.keys(commit.files)), violations: violations(shown, CONTENT),
    contentRead: page.world.requests.filter((request) => request.repository === "alice/dlls" && /\/contents\//.test(request.url.pathname)).length };
}

const KINDS = { judged, findings, recipe, routes, declare };
return await KINDS[input.kind](input);
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
    return js(f"const input = {json.dumps(argument)}; const ROOT = {json.dumps(str(ROOT))};\n{WORLD}")


def check(test: unittest.TestCase, section: str) -> None:
    for loaded in cases(section):
        with test.subTest(case=loaded["name"]):
            got = run_world(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got.get(key) for key in wanted}, wanted)


class TestResources(unittest.TestCase):
    # TST-1130001 · level: unit · module: MOD-resource-list
    # guards: A PRODUCT DECLARES ITS RESOURCES
    # given: the cases under that requirement in the Markdown file beside this one: a product whose docs/resources.md holds a compute resource, and the same entry written in another file of the product
    # input: the recipe resource-check named for the resource, over the product's snapshot
    # expect: the declared resource is found; the entry written anywhere else is not found (ResourceNotFound)
    def test_a_declared_resource_is_found_in_docs_resources_md_and_not_elsewhere(self):
        check(self, "A PRODUCT DECLARES ITS RESOURCES")

    # TST-1130002 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS
    # given: the cases under that requirement: a resource of the type the module states carrying capabilities or a role, the same without, and a list whose table has the columns Capabilities and Role
    # input: resourceFindings on the resource; the list read with the schema and judged
    # expect: the entry that carries participant fields is rejected under this requirement and the same entry without them is accepted
    def test_an_entry_that_carries_a_participants_fields_is_rejected(self):
        check(self, "A RESOURCE IS USED, A PARTICIPANT DEVELOPS")

    # TST-1130013 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS
    # given: a docs/resources.md whose table has, besides its ten columns, the columns Capabilities and Role, and an agent entry that fills them
    # input: the list read with the schema and judged
    # expect: the entry is rejected under this requirement
    # FINDING R1: the list is accepted. documentFindings reports nothing for the two columns, and the readers of a list (resourceOf in src/resource-list/strategies.mjs:29, in
    # src/settings-pages/resources.mjs) build a Resource from the ten named columns only, so capabilities and role never reach resourceFindings, which refuses an entry that carries them
    # (rules.mjs) - the rule can be met only by a Resource object that no reader makes.
    def test_a_list_whose_entry_carries_participant_columns_is_rejected(self):
        check(self, "A RESOURCE IS USED, A PARTICIPANT DEVELOPS - a list's columns")

    # TST-1130003 · level: unit · module: MOD-resource-list
    # guards: THE RESOURCE KIND IS ONE OF A CLOSED SET
    # given: lists of one entry of an unknown kind, and of each of the six kinds with all its kind requires
    # input: the list read with the schema and judged
    # expect: the unknown kind is rejected under this requirement; each of the six is accepted
    def test_an_unknown_kind_is_rejected_and_each_of_the_six_is_accepted(self):
        check(self, "THE RESOURCE KIND IS ONE OF A CLOSED SET")

    # TST-1130004 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE IS PINNED TO AN EXACT STATE
    # given: lists with a model without revision or hash, a model pinned to a branch name, the same model with a 40-hex revision, and a compute entry without a pin
    # input: the list read with the schema and judged
    # expect: the model without an exact state fails under this requirement; the 40-hex revision passes and so does the compute entry without a pin
    def test_a_model_without_an_exact_state_fails_and_a_compute_entry_needs_none(self):
        check(self, "A RESOURCE IS PINNED TO AN EXACT STATE")

    # TST-1130005 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE DECLARES ITS LICENCE
    # given: lists with a repository, a data and a model entry without a licence, and the same entries with MIT
    # input: the list read with the schema and judged
    # expect: each entry without a licence fails under this requirement; with MIT each passes
    def test_an_entry_without_a_licence_fails_and_with_mit_passes(self):
        check(self, "A RESOURCE DECLARES ITS LICENCE")

    # TST-1130006 · level: unit · module: MOD-resource-list
    # guards: A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
    # given: the Resources page of a product that reads the repository alice/dlls, which holds files whose text is a sentinel; the licence the person records is unknown or restricted
    # input: add the resource, record the licence and the maintainer, press Save; and, as the counter-proof, the same commit with a file of the resource added to it
    # expect: one commit that holds only docs/resources.md and none of the resource's text, and no file of the resource read; with a file added the check names it
    def test_declaring_a_restricted_resource_commits_only_docs_resources_md(self):
        check(self, "A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED")

    # TST-1130007 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE NAMES ITS MAINTAINER
    # given: lists with a repository, a data, a model and an agent entry with no maintainer, and the same with `unknown`
    # input: the list read with the schema and judged
    # expect: an entry with neither a maintainer nor unknown fails under this requirement; unknown passes
    def test_an_entry_with_neither_a_maintainer_nor_unknown_fails(self):
        check(self, "A RESOURCE NAMES ITS MAINTAINER")

    # TST-1130008 · level: unit · module: MOD-resource-list
    # guards: A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
    # given: fixture compute entries whose route is `bridge hpc`, `runner:gpu`, none, and `ssh alex`
    # input: the list read with the schema and judged
    # expect: bridge <name> and runner:<label> are accepted; an entry without a route and one with another route are rejected
    def test_a_compute_route_is_a_bridge_or_a_runner(self):
        check(self, "A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER")

    # TST-1130009 · level: unit · module: MOD-resource-list
    # guards: A RESOURCE DECLARES WHERE IT PROCESSES DATA
    # given: lists with a compute, an endpoint and an agent entry without a processing place, and the same with `NHR@FAU, Erlangen`
    # input: the list read with the schema and judged
    # expect: each entry without a place fails under this requirement; with NHR@FAU, Erlangen each passes
    def test_an_entry_without_a_processing_place_fails(self):
        check(self, "A RESOURCE DECLARES WHERE IT PROCESSES DATA")

    # TST-1130010 · level: unit · module: MOD-resource-list, MOD-runtimes
    # guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
    # given: a private product with Agent M's job workflow, a list with the compute resource cluster on runner:gpu, a CI agent on GitHub's hosted runner and one on the runner with label gpu
    # input: reachableBy over the list, and routesFor for each agent with the needs it gives
    # expect: the job is not offered on the hosted runner; it is offered on the runner with label gpu
    def test_a_job_needing_a_runner_resource_is_offered_only_on_that_runner(self):
        check(self, "A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE")

    # TST-1130011 · level: unit · module: MOD-resource-list
    # guards: THE INSTANCE DECLARES ITS OWN RESOURCES
    # given: an instance whose docs/resources.md holds a cluster and a product whose list holds none; and the same list judged under the instance's path
    # input: the recipe resource-check named for the cluster; the list judged by the schema as for a product
    # expect: the instance's resource is found in its own list; the list of the instance is read and judged by the same schema
    def test_the_instance_declares_its_own_resources_in_its_own_list(self):
        check(self, "THE INSTANCE DECLARES ITS OWN RESOURCES")

    # TST-1130012 · level: unit · module: MOD-resource-list
    # guards: INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
    # given: an instance and a product whose lists each hold an entry the other lacks, and one name that both hold with another route
    # input: the recipe resource-pins on the product's side, with the instance's list changed
    # expect: the product's list does not inherit the instance's entry and its entry of the shared name is its own; a change of the instance's list changes nothing on the product's side
    def test_a_product_list_neither_inherits_from_nor_is_inherited_by_the_instances(self):
        check(self, "INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT")


if __name__ == "__main__":
    unittest.main()
