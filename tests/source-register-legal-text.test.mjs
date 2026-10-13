// An EU legal text recognised by its address (ITM-313) — MOD-source-register's recogniseLegalText(address), as the accepted text of
// docs/architecture/MOD-source-register.md states it (Interfaces: `-> { celex: string } | { eli: string } | null`, "the CELEX number
// or ELI an EUR-Lex or ELI address names"), for UC-004 step 4: an author pastes the EUR-Lex or ELI address of an EU legal text, and
// Agent M recognises its CELEX number — for the AI Act, `32024R1689` — or its ELI and fills in the identifier. An address of another
// site, or of a page of EUR-Lex that names no text, gives null. Fetching the text (fetchLegalText) and the instance's fetch workflow
// are not part of this item; the library page that calls it (ITM-350) neither.
// Run: node --test tests/source-register-legal-text.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
// Level: unit
//
// recogniseLegalText is pure: it reads an address and makes no request. The module file does not say in what form an ELI is returned:
// this file takes the ELI as the URI the EU's publication office gives it, `http://data.europa.eu/eli/reg/2024/1689/oj` — type, year
// and number, and `/oj` where the address names it —, whichever of the two servers' addresses it was read from and without the
// language an address ends in. It takes the CELEX number from the `uri` parameter of an EUR-Lex address, `CELEX:` followed by the
// number, written with a colon or with `%3A`. The servers are `eur-lex.europa.eu` and, for an ELI, `data.europa.eu`. Each test states
// its input and its expected result before it runs (given / input / expect). A name the module does not provide yet is undefined
// here, so that each test fails by itself. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as sourceRegister from "../src/source-register/index.mjs";

const { recogniseLegalText } = sourceRegister;

const AI_ACT_CELEX = { celex: "32024R1689" };
const AI_ACT_ELI = { eli: "http://data.europa.eu/eli/reg/2024/1689/oj" };

// TST-472907 · level: unit · module: MOD-source-register
// guards: AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; UC-004
// given: the AI Act's EUR-Lex addresses as a browser shows them — the HTML text and the document page, in English and in German, with the colon written plain and as %3A, with a language parameter after it —, the address of the General Data Protection Regulation and that of its consolidated text of 4 May 2016
// input: recogniseLegalText(address) for each
// expect: { celex: "32024R1689" } for each of the AI Act's, and { celex: "32016R0679" } for the other, and the consolidated text's number with its date for the third, and the Commission's proposal of the AI Act, whose kind of act has two letters: the one key celex and no eli
test("recogniseLegalText — an EUR-Lex address yields the CELEX number it names", () => {
  for (const address of [
    "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32024R1689",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689&from=EN",
    "  https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\n",
  ]) assert.deepEqual(recogniseLegalText(address), AI_ACT_CELEX, address);

  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679"), { celex: "32016R0679" });
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02016R0679-20160504"),
    { celex: "02016R0679-20160504" });
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206"), { celex: "52021PC0206" });
});

// TST-472908 · level: unit · module: MOD-source-register
// guards: AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; UC-004
// given: the AI Act's ELI addresses — on EUR-Lex and on data.europa.eu, with http and https, with the language and a closing slash — and another regulation's
// input: recogniseLegalText(address) for each
// expect: { eli: "http://data.europa.eu/eli/reg/2024/1689/oj" } for each of the AI Act's, and { eli: "http://data.europa.eu/eli/reg/2016/679/oj" } for the other, the same without /oj, a directive's and an implementing regulation's: the one key eli and no celex
test("recogniseLegalText — an ELI address yields the ELI it names", () => {
  for (const address of [
    "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/",
    "http://data.europa.eu/eli/reg/2024/1689/oj",
    "https://data.europa.eu/eli/reg/2024/1689/oj",
    "https://data.europa.eu/eli/reg/2024/1689/oj/eng",
  ]) assert.deepEqual(recogniseLegalText(address), AI_ACT_ELI, address);

  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/eli/reg/2016/679/oj"), { eli: "http://data.europa.eu/eli/reg/2016/679/oj" });
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/eli/reg/2016/679"), { eli: "http://data.europa.eu/eli/reg/2016/679" });
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/eli/dir/2019/790/oj"), { eli: "http://data.europa.eu/eli/dir/2019/790/oj" });
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/eli/reg_impl/2023/2138/oj"), { eli: "http://data.europa.eu/eli/reg_impl/2023/2138/oj" });
});

// TST-472909 · level: unit · module: MOD-source-register
// guards: AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY; UC-004
// given: addresses that name no text of the EU — the AI Act's path and query on another site, on a host that only begins or ends like EUR-Lex's, a CELEX number on the other server (CELEX numbers are read from EUR-Lex's addresses), EUR-Lex's home page and a page without a CELEX number, a CELEX number of no form, an ELI of no form (a year of two digits, a number of letters, a type with a digit, a path that has more before /eli/), an address of no scheme the web uses, a bare CELEX number, a bare ELI path, no address at all — and, as the known positive, the AI Act's EUR-Lex address
// input: recogniseLegalText(address) for each
// expect: the AI Act's CELEX number for the known positive; null for every other
test("recogniseLegalText — an address of another site, or of no text, gives null", () => {
  assert.deepEqual(recogniseLegalText("https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689"), AI_ACT_CELEX, "known positive");

  for (const address of [
    "https://example.org/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "https://example.org/eli/reg/2024/1689/oj",
    "https://eur-lex.europa.eu.example.org/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "https://example.org/eur-lex.europa.eu/eli/reg/2024/1689/oj",
    "https://not-eur-lex.europa.eu/eli/reg/2024/1689/oj",
    "https://eur-lex.europa.eu/homepage.html",
    "https://data.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:ABC",
    "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689x",
    "https://eur-lex.europa.eu/eli/reg/2024",
    "https://eur-lex.europa.eu/eli/reg/24/1689/oj",
    "https://eur-lex.europa.eu/eli/reg/2024/abc/oj",
    "https://eur-lex.europa.eu/eli/re9/2024/1689/oj",
    "https://eur-lex.europa.eu/other/eli/reg/2024/1689/oj",
    "https://data.europa.eu/data/datasets/ai-act",
    "ftp://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    "32024R1689",
    "/eli/reg/2024/1689/oj",
    "",
    "not an address",
  ]) assert.equal(recogniseLegalText(address), null, JSON.stringify(address));
  for (const address of [undefined, null, 32024, {}]) assert.equal(recogniseLegalText(address), null, String(address));
});
