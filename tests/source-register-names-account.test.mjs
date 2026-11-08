// Whether an item of a requirement's source names an account — MOD-source-register's namesAccount, as docs/architecture/MOD-source-register.md states it:
// "namesAccount(item: string) -> boolean — whether an item of a requirement's source names an account, as Data states under *How a requirement names an
// account*: the one reading `sourceFindings` applies too. Pure." Data: "An item of a requirement's source names an account when it is, alone or followed by
// `, ` and the part it draws on, `<server>/<account>` … such as `github.com/akmaier` or `gitlab.example.org:8443/akmaier, issue 12`."
// Run: node --test tests/source-register-names-account.test.mjs
//
// Module: MOD-source-register
// Guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
// Level: unit
//
// "The one reading sourceFindings applies too" is checked by asking sourceFindings of each item as well: an item namesAccount accepts is one sourceFindings
// passes without a link, and one it refuses one sourceFindings names. Each test states its input and its expected result before it runs (given / input /
// expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { parseSpec } from "../src/spec-document/index.mjs";
import { namesAccount, sourceFindings, sourceSchemas } from "../src/source-register/index.mjs";

const ACCOUNTS = ["github.com/akmaier", "gitlab.example.org:8443/akmaier, issue 12", "github.com/a.b-c_d"];
const OTHERS = ["SRC-eu-ai-act", "Vibe Coding, ch. 9", "PO A. Maier", "akmaier", "github.com/akmaier/agent-m", "https://github.com/akmaier", ""];
const NO_LINKS = "# Requirement sources\n\n| Source | Version | Hash | Part |\n|---|---|---|---|\n";
const passesSourceCheck = (item) => sourceFindings([...parseSpec(`# P — Specification\n\n## 1. One\n\n**A RULE** *(${item})*\nA rule.\n*Check:* \`tests/a.test.mjs\`\n`)
  .requirements.values()], readDocument(sourceSchemas().links, "docs/sources.md", NO_LINKS), []).length === 0;

// TST-1792030 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
// given: three items that are accounts — alone, with a port and a part, with dots, hyphens and an underscore —, and seven that are not: a register
//   identifier, a title with a part, a person's name, an account without its server, a repository's path, a web address, the empty item
// input: namesAccount(each); and sourceFindings of a requirement naming each, over a product that links no source
// expect: true for the three, which sourceFindings passes; false for the seven, each of which sourceFindings names
test("namesAccount — an item that is <server>/<account>, alone or with its part, and nothing else", () => {
  for (const item of ACCOUNTS) {
    assert.equal(namesAccount(item), true, item);
    assert.equal(passesSourceCheck(item), true, `sourceFindings reads ${item} the same`);
  }
  for (const item of OTHERS) {
    assert.equal(namesAccount(item), false, item);
    if (item) assert.equal(passesSourceCheck(item), false, `sourceFindings reads ${item} the same`);
  }
});
