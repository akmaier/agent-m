// personHits of MOD-personal-data (ITM-549): every place in a text where one of a mail's people appears — names also by their parts,
// addresses also by their local part, phone numbers by their digits whatever the separators, accounts with or without `@` —
// regardless of case, as { kind, value, line, column } in the order of line, then column.
// Run: node --test tests/personal-data-person-hits.test.mjs
//
// Module: MOD-personal-data
// Guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
// Level: unit
//
// Each test names its input and states its expected values in its own text; none reads an expected result from the SPEC, a use case
// or an architecture file. Every person, text and number is constructed. Each test with a known positive has a known negative beside
// it (a name part inside a longer word, a phone number with other digits, an address local part inside a longer word, an account
// inside a longer word), so that a search that finds everything or nothing fails. A name the module does not export yet fails each
// test by itself. The counter-proofs (a planted fault in src/personal-data/ and the test's failing result) are recorded in the pull
// request.
//
// Readings the module file leaves open, which the tests state (the pull request names them and quotes the sentence each rests on):
//   - A match is case-insensitive and stands as a whole word: no letter or digit stands directly before or after it. `value` is the
//     text as it stands in `text`.
//   - The parts of a name are what blanks separate in it, each kept as written, a period included ("Dr." is a part).
//   - An address is matched whole and by its local part, the text before `@`; an account as given, with or without a leading `@`.
//   - A phone number is a run of digits that may start with `+` and be separated by blanks (space, tab), hyphens, slashes, dots or
//     parentheses, within one line; it is a hit where its digits equal the digits of one of `people.phones`.
//   - `line` and `column` count from 1; a line ends at "\n" or "\r\n"; the column counts the text's UTF-16 units from the line's start.
//   - A part found inside the whole it belongs to (a name part inside the whole name, a local part inside the whole address) is not
//     a hit of its own: the whole is the hit. Hits that are equal in kind, place and extent are given once.
//   - Hits at the same line and column are given in the order of the kinds in People: name, address, phone, account.

import test from "node:test";
import assert from "node:assert/strict";
import * as personal from "../src/personal-data/index.mjs";

const hit = (kind, value, line, column) => ({ kind, value, line, column });
const people = (given = {}) => ({ names: [], addresses: [], phones: [], accounts: [], ...given });
const hits = (text, given) => personal.personHits(text, people(given));

test("a whole name is found with its kind, its text as written, its line and its column; the same text without it gives none", () => {
  // "Mail from " is 10 characters, so the name begins at column 11 of line 1.
  assert.deepEqual(hits("Mail from Ada Example today.", { names: ["Ada Example"] }), [hit("name", "Ada Example", 1, 11)]);
  assert.deepEqual(hits("Mail from nobody today.", { names: ["Ada Example"] }), []);
});

test("a name is found whatever its case, and the hit holds the text as it stands", () => {
  // "WRITE TO " is 9 characters, so the name begins at column 10.
  assert.deepEqual(hits("WRITE TO ADA EXAMPLE", { names: ["Ada Example"] }), [hit("name", "ADA EXAMPLE", 1, 10)]);
  assert.deepEqual(hits("Herr müller kam", { names: ["Müller"] }), [hit("name", "müller", 1, 6)]);
});

test("a part of a name is found by itself: the last part at column 6, the first part at column 7", () => {
  assert.deepEqual(hits("Dear Example,", { names: ["Ada Example"] }), [hit("name", "Example", 1, 6)]);
  assert.deepEqual(hits("hello ADA!", { names: ["Ada Example"] }), [hit("name", "ADA", 1, 7)]);
});

test("a part of a name is kept as written, a period included: Dr. is a part of Dr. Ada Example", () => {
  // "Please ask " is 11 characters, so "Dr." begins at column 12; "Dr" without the period is no hit of that part.
  assert.deepEqual(hits("Please ask Dr. Smith", { names: ["Dr. Ada Example"] }), [hit("name", "Dr.", 1, 12)]);
  assert.deepEqual(hits("Please ask Dr Smith", { names: ["Dr. Ada Example"] }), []);
});

test("a name is matched as text, not as a pattern: C++ is found as C++, and A.B is not found in AxB", () => {
  assert.deepEqual(hits("C++ rocks", { names: ["C++ Cook"] }), [hit("name", "C++", 1, 1)]);
  assert.deepEqual(hits("AxB", { names: ["A.B"] }), []);
  assert.deepEqual(hits("A.B", { names: ["A.B"] }), [hit("name", "A.B", 1, 1)]);
});

test("where a part and the whole name are both found at the same place, the whole name is the one hit", () => {
  assert.deepEqual(hits("Ada Example wrote", { names: ["Ada Example"] }), [hit("name", "Ada Example", 1, 1)]);
  assert.deepEqual(hits("Ada Example wrote", { names: ["Ada", "Ada Example"] }), [hit("name", "Ada Example", 1, 1)]);
});

test("a person listed twice is one hit", () => {
  assert.deepEqual(hits("Ada Example wrote", { names: ["Ada Example", "ada example"] }), [hit("name", "Ada Example", 1, 1)]);
});

test("a word that only contains a name part is no hit: Annabel, Hanna and Anna2 for Anna, and Müllerstraße for Müller", () => {
  // Positive beside the negatives: the lone "Anna" after "Annabel and " (12 characters) begins at column 13.
  assert.deepEqual(hits("Annabel and Anna", { names: ["Anna"] }), [hit("name", "Anna", 1, 13)]);
  assert.deepEqual(hits("Annabel and Hanna and Anna2", { names: ["Anna"] }), []);
  assert.deepEqual(hits("Müllerstraße", { names: ["Müller"] }), []);
});

test("an address is found whole, whatever its case, with its kind, line and column", () => {
  const given = { addresses: ["ada.example@mail.test"] };
  // "write to " is 9 characters, so the address begins at column 10.
  assert.deepEqual(hits("write to ada.example@mail.test now", given), [hit("address", "ada.example@mail.test", 1, 10)]);
  assert.deepEqual(hits("WRITE TO ADA.EXAMPLE@MAIL.TEST", given), [hit("address", "ADA.EXAMPLE@MAIL.TEST", 1, 10)]);
  assert.deepEqual(hits("write to bob.example@mail.test now", given), []);
});

test("the local part of an address is found by itself; a longer word with it inside is no hit", () => {
  const given = { addresses: ["ada.example@mail.test"] };
  // "ask " is 4 characters, so the local part begins at column 5.
  assert.deepEqual(hits("ask ada.example about it", given), [hit("address", "ada.example", 1, 5)]);
  assert.deepEqual(hits("ask ada.examples about it", given), []);
  assert.deepEqual(hits("ask xada.example about it", given), []);
});

test("a local part inside the whole address is not a hit of its own: the address is the one hit", () => {
  assert.deepEqual(hits("<adx@mail.test>", { addresses: ["adx@mail.test"] }), [hit("address", "adx@mail.test", 1, 2)]);
});

test("a phone number is found by its digits whatever the separators: hyphens and a slash, or blanks, parentheses and a dot", () => {
  const given = { phones: ["+49 911 123456"] };
  // The digits are 49911123456 in each. "Tel: " is 5 characters, "phone " 6; the closing full stop belongs to the sentence.
  assert.deepEqual(hits("Tel: +49-911/123456.", given), [hit("phone", "+49-911/123456", 1, 6)]);
  assert.deepEqual(hits("phone +49 (911) 123.456 please", given), [hit("phone", "+49 (911) 123.456", 1, 7)]);
  assert.deepEqual(hits("Tel: 49911123456", given), [hit("phone", "49911123456", 1, 6)]);
});

test("a phone number with other digits is no hit, nor a run that a letter touches, nor a run that a line break splits", () => {
  const given = { phones: ["+49 911 123456"] };
  assert.deepEqual(hits("Tel: +49 911 123457", given), []);
  assert.deepEqual(hits("Tel: +49 911 12345", given), []);
  assert.deepEqual(hits("id49911123456", given), []);
  assert.deepEqual(hits("49 911\n123456", given), []);
});

test("an account is found with and without the leading @, whichever way it is given; a longer word with it inside is no hit", () => {
  // "ping " is 5 characters: "@ada_x" fills columns 6 to 11, " and " columns 12 to 16, so the bare "ada_x" begins at column 17.
  const expected = [hit("account", "@ada_x", 1, 6), hit("account", "ada_x", 1, 17)];
  assert.deepEqual(hits("ping @ada_x and ada_x", { accounts: ["ada_x"] }), expected);
  assert.deepEqual(hits("ping @ada_x and ada_x", { accounts: ["@ada_x"] }), expected);
  assert.deepEqual(hits("ping @ada_xy and ada_xy", { accounts: ["ada_x"] }), []);
});

test("line and column count from 1: the second line's hit, after a line feed and after a carriage return with a line feed", () => {
  // "second " is 7 characters, so "Ada Example" begins at column 8 of line 2; "Bob " is 4, so "Ada" begins at column 5.
  assert.deepEqual(hits("first line\nsecond Ada Example\n", { names: ["Ada Example"] }), [hit("name", "Ada Example", 2, 8)]);
  assert.deepEqual(hits("x\r\nBob Ada", { names: ["Ada"] }), [hit("name", "Ada", 2, 5)]);
  assert.deepEqual(hits("Ada", { names: ["Ada"] }), [hit("name", "Ada", 1, 1)]);
});

test("hits are given by line, then column, whatever the order in which the people are listed", () => {
  const given = { accounts: ["@adax"], addresses: ["adx@mail.test"], names: ["Ada Example"], phones: ["+49 911 123456"] };
  // Line 1: "Hi " is 3 characters, so "@adax" begins at column 4; "@adax, call " ends at column 15, so the phone begins at column 16.
  // Line 2: the name begins at column 1; "Ada Example <" is 13 characters, so the address begins at column 14.
  const text = "Hi @adax, call +49 911 123456\nAda Example <adx@mail.test>";
  assert.deepEqual(hits(text, given), [
    hit("account", "@adax", 1, 4),
    hit("phone", "+49 911 123456", 1, 16),
    hit("name", "Ada Example", 2, 1),
    hit("address", "adx@mail.test", 2, 14),
  ]);
});

test("hits at the same place are given in the order name, address, phone, account", () => {
  // The name part "adx" and the address local part "adx" are both found at line 1, column 1 of "adx"; the address's whole is not in the text.
  assert.deepEqual(hits("adx", { accounts: ["adx"], addresses: ["adx@mail.test"], names: ["Adx Example"] }), [
    hit("name", "adx", 1, 1),
    hit("address", "adx", 1, 1),
    hit("account", "adx", 1, 1),
  ]);
});

test("a text that names none of the people gives an empty list, and so do no people, an empty text and empty entries", () => {
  const all = { names: ["Ada Example"], addresses: ["ada.example@mail.test"], phones: ["+49 911 123456"], accounts: ["@ada_x"] };
  assert.deepEqual(hits("The build failed with exit code 2 on version 4.7.", all), []);
  assert.deepEqual(hits("Ada Example, ada.example@mail.test, +49 911 123456, @ada_x", {}), []);
  assert.deepEqual(hits("", all), []);
  assert.deepEqual(hits("anything at all 123", { names: ["", " "], addresses: [""], phones: ["", "-"], accounts: ["", "@"] }), []);
});

test("it is pure: the same result twice, the people unchanged, and no request sent", () => {
  const given = people({ names: ["Ada Example"], addresses: ["adx@mail.test"], phones: ["+49 911 123456"], accounts: ["@adax"] });
  const copy = structuredClone(given);
  const loadedFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; throw new Error("personHits sent a request"); };
  try {
    const first = personal.personHits("Ada Example wrote from adx@mail.test, +49 911 123456, @adax", given);
    const second = personal.personHits("Ada Example wrote from adx@mail.test, +49 911 123456, @adax", given);
    assert.equal(first.length, 4);
    assert.deepEqual(second, first);
  } finally { globalThis.fetch = loadedFetch; }
  assert.equal(requests, 0);
  assert.deepEqual(given, copy);
});
