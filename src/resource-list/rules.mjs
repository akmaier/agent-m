// rules.mjs — the checks a schema cannot express (MOD-resource-list, Parts: rules.mjs; Interfaces: resourceFindings).
//
// Module: MOD-resource-list
//
// Pure: no request is made. Every finding is made with MOD-text-tools' finding, names the requirement it applies, and is about the list docs/resources.md; its
// line is the entry's position in the list, from 1. A finding never repeats a secret's value.

import { finding } from "../text-tools/index.mjs";

const ARTIFACT = "docs/resources.md";
const PINNED = "A RESOURCE IS PINNED TO AN EXACT STATE", LICENCE = "A RESOURCE DECLARES ITS LICENCE", MAINTAINER = "A RESOURCE NAMES ITS MAINTAINER";
const PLACE = "A RESOURCE DECLARES WHERE IT PROCESSES DATA", PAID = "COMMIT TESTS CALL NO PAID SERVICE", SECRET = "A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE";
const COMPUTE = "A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER", DEVELOPS = "A RESOURCE IS USED, A PARTICIPANT DEVELOPS";

// The kinds each column is required for (MOD-resource-list, Data).
const NEEDS = {
  pin: ["repository", "data", "model", "endpoint", "agent"], licence: ["repository", "data", "model"], maintainer: ["repository", "data", "model", "agent"],
  place: ["compute", "endpoint", "agent"], paid: ["endpoint", "agent"],
};
const COLUMN = { pin: ["Pin", PINNED], licence: ["Licence", LICENCE], maintainer: ["Maintainer", MAINTAINER], place: ["Processing place", PLACE], paid: ["Paid", PAID] };

const COMMIT = /^[0-9a-f]{40}$/;
const COMPUTE_ROUTE = /^(?:bridge \S+|runner:\S+)$/;
const SECRET_NAME = /^(?:ci:[A-Za-z_][A-Za-z0-9_]*|browser)$/;
// One account, `@name`, or one `person <name>`: a maintainer the project depends on alone.
const SINGLE_PERSON = /^(?:@[^\s,]+|person\s+\S.*)$/;

const left = (value) => value === null || value === undefined || value === "" || value === "—" || (Array.isArray(value) && value.length === 0);

/**
 * resourceFindings(resources: Resource[]) -> Finding[] — what the schema cannot express: the pin's form for the kind — a full commit for a repository, not a
 * branch name such as `main` —, the columns its kind requires, a compute route other than `bridge <name>` or `runner:<label>`, an endpoint or agent
 * without its Paid mark, an entry that carries a participant's capabilities or role, a secret's value where its name belongs, and, as a warning, a
 * maintainer who is a single person. In the list's order, each entry's findings in the order of the columns.
 * @param {Array<object>} resources
 */
export function resourceFindings(resources) {
  const found = [];
  resources.forEach((resource, at) => {
    const line = at + 1, name = resource.name;
    const add = (kind, rule, what, fix) => found.push(finding({ artifact: ARTIFACT, line, kind, rule, what: `${name}: ${what}`, fix }));
    for (const [column, kinds] of Object.entries(NEEDS)) {
      const value = column === "paid" ? (typeof resource.paid === "boolean" ? resource.paid : null) : resource[column];
      if (kinds.includes(resource.kind) && left(value)) {
        const [title, rule] = COLUMN[column];
        add("error", rule, `a ${resource.kind} needs its ${title}, and it is left out`, `fill in the ${title} column`);
      }
    }
    if (resource.kind === "repository" && !left(resource.pin) && !COMMIT.test(String(resource.pin))) {
      add("error", PINNED, `a repository is pinned to a full commit of 40 hexadecimal digits, not to ${JSON.stringify(String(resource.pin))}`, "pin it to the commit it was last checked at");
    }
    if (resource.kind === "compute" && !left(resource.route) && !COMPUTE_ROUTE.test(resource.route)) {
      add("error", COMPUTE, `a compute resource is reached by \`bridge <name>\` or \`runner:<label>\`, not by ${JSON.stringify(resource.route)}`, "name the Bridge or the self-hosted runner that reaches it");
    }
    if (!left(resource.capabilities) || !left(resource.role)) {
      add("error", DEVELOPS, "an entry holds no capabilities and no role; whatever works on the product is a participant", "move them to a participant of the instance's register");
    }
    if (!left(resource.secret) && !SECRET_NAME.test(resource.secret)) {
      add("error", SECRET, "the Secret column holds a value, not the name of a secret", "write `ci:<NAME>` or `browser`, and keep the value in the CI secret or the browser");
    }
    if (typeof resource.maintainer === "string" && SINGLE_PERSON.test(resource.maintainer)) {
      add("warning", MAINTAINER, "its maintainer is a single person", "name a second maintainer, or the organisation behind it");
    }
  });
  return found;
}
