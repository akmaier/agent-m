// peopleIn of MOD-personal-data (ITM-550): the people of a mail — every address and display name of its headers, and every name, address,
// phone number and account handle its text and signature give — as { names, addresses, phones, accounts }, each person once.
// Run: node --test tests/personal-data-people-in.test.mjs
//
// Module: MOD-personal-data
// Guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
// Level: unit
//
// Each test names its input and states its expected values in its own text; none reads an expected result from the SPEC, a use case
// or an architecture file. Every person, text and number is constructed. Each form has known positives and, beside them, known negatives
// (a six-digit number is no phone number, an @ inside an address is no handle, a greeting inside a longer word or not at the start of a
// line gives no name, and so on), so that a search that finds everything or nothing fails. A name the module does not export yet fails
// each test by itself. The counter-proofs (a planted fault in src/personal-data/ and the test's failing result) are recorded in the pull
// request.
//
// Readings the module file leaves open, which the tests state (the pull request names them and quotes the sentence each rests on):
//   - A mail address is `local@domain`: a local part of letters, digits and `_ % + -` joined by single dots, `@`, and a domain of labels of
//     letters, digits and `-` joined by single dots (a dot at the end of a sentence is not part of it). Header addresses are kept as given.
//   - A phone number is a run of digits that may start with `+` and be separated by blanks (space, tab), hyphens, slashes, dots or
//     parentheses, within one line, which no letter or digit touches; it counts when its digits are seven or more. It is listed as written.
//   - An account handle is `@` and letters, digits and `_`, which single `.` or `-` may join; it is listed with its `@`. An `@` inside a
//     mail address starts no handle.
//   - A greeting is one of the listed words at the start of a line (column 1), whatever its case, followed by a blank; the optional title
//     (Mr, Ms, Herr, Frau, Dr) may carry a period; the name is what follows up to the first comma or the end of the line, without a
//     closing period, `!`, `?`, `:` or `;`. Nothing after the greeting but a comma gives no name.
//   - A closing is a line that is one of the listed words and nothing else (a comma, period or `!` may close it), whatever its case; the line
//     that follows is the next line, and a blank line gives no name. The signature starts after the first line that is `-- ` (two hyphens
//     and a blank); its first line is the next line. A text that holds no letter is no name.
//   - A person found twice (a name, address or account regardless of case, a phone number by its digits) is listed once, as first found;
//     the headers come first, then the text in the order of its lines.

import test from "node:test";
import assert from "node:assert/strict";
import * as personal from "../src/personal-data/index.mjs";

const mail = (text, addresses = []) => ({ addresses, text });
const from = (name, address) => ({ name, address });
const people = (given = {}) => ({ names: [], addresses: [], phones: [], accounts: [], ...given });
const found = (text, addresses) => personal.peopleIn(mail(text, addresses));

test("a mail with every form gives each person under its kind, once each, the headers first", () => {
  const given = mail(
    [
      "Dear Carla Roth,",
      "please call +49 911 123456 or write to dora@site.test.",
      "Ping @dora_x about it.",
      "Thanks!",
      "Eve Long",
      "-- ",
      "Frank Moss",
      "Phone 0911/7654321",
    ].join("\n"),
    [from("Ada Example", "ada.example@mail.test"), from(null, "bob@lab.test"), from("Bob Stone", "BOB@lab.test")],
  );
  assert.deepEqual(personal.peopleIn(given), {
    names: ["Ada Example", "Bob Stone", "Carla Roth", "Eve Long", "Frank Moss"],
    addresses: ["ada.example@mail.test", "bob@lab.test", "dora@site.test"],
    phones: ["+49 911 123456", "0911/7654321"],
    accounts: ["@dora_x"],
  });
});

test("counter-proof: a mail whose text names no one gives only the people of its headers; a mail with neither gives nothing", () => {
  const text = "The build failed with exit code 2 on version 4.7.1.\nSee the log below.";
  assert.deepEqual(found(text, [from("Ada Example", "ada.example@mail.test")]), people({ names: ["Ada Example"], addresses: ["ada.example@mail.test"] }));
  assert.deepEqual(found(text, [from(null, "ada.example@mail.test")]), people({ addresses: ["ada.example@mail.test"] }));
  assert.deepEqual(found(text, []), people());
  assert.deepEqual(found("", []), people());
});

test("the headers give every address and every display name that is given: a null or blank name gives none, an address is kept as given", () => {
  const given = [from("Ada Example", "Ada.Example@Mail.test"), from(null, "bob@lab.test"), from("", "carla@lab.test"), from("  ", "dora@lab.test")];
  assert.deepEqual(found("nothing", given), people({
    names: ["Ada Example"],
    addresses: ["Ada.Example@Mail.test", "bob@lab.test", "carla@lab.test", "dora@lab.test"],
  }));
});

test("a mail address in the text is found whole; a sentence's closing period is not part of it; text that is no address is not found", () => {
  assert.deepEqual(found("write to ada.example@mail.test, or bob+x@lab.example.org. Thanks").addresses, ["ada.example@mail.test", "bob+x@lab.example.org"]);
  assert.deepEqual(found("<carla@site.test>").addresses, ["carla@site.test"]);
  assert.deepEqual(found("visit example.com or ada at mail.test, or mail ada@ now").addresses, []);
});

test("an address given in the headers and found again in the text, in another case, is listed once as the header gave it", () => {
  assert.deepEqual(found("reply to ADA.EXAMPLE@MAIL.TEST", [from(null, "ada.example@mail.test")]).addresses, ["ada.example@mail.test"]);
});

test("a run of seven digits or more is a phone number, with the separators it was written with and a leading +", () => {
  assert.deepEqual(found("Tel: +49-911/123456.").phones, ["+49-911/123456"]);
  assert.deepEqual(found("phone +49 (911) 123.456 please").phones, ["+49 (911) 123.456"]);
  assert.deepEqual(found("call 0911/1234567 or 09111234567").phones, ["0911/1234567", "09111234567"]);
  assert.deepEqual(found("exactly seven: 1234567").phones, ["1234567"]);
});

test("a run of six digits is no phone number, nor are several short runs a blank or a line break apart, nor a run that a letter touches", () => {
  assert.deepEqual(found("exactly six: 123456").phones, []);
  assert.deepEqual(found("12 34 56").phones, []);
  assert.deepEqual(found("49 911\n123456").phones, []);
  assert.deepEqual(found("id49911123456 and 49911123456x").phones, []);
  assert.deepEqual(found("version 4.7.1 of build 2").phones, []);
});

test("the same phone number written two ways is listed once, as first found", () => {
  assert.deepEqual(found("+49 911 123456 and +49-911-123456").phones, ["+49 911 123456"]);
});

test("an @ followed by letters, digits, _, - or . is an account handle, listed with its @ and without a closing period", () => {
  assert.deepEqual(found("ping @ada_x and @bob.smith-2, or @carla.").accounts, ["@ada_x", "@bob.smith-2", "@carla"]);
  assert.deepEqual(found("ping @Ada_x and @ada_x").accounts, ["@Ada_x"]);
});

test("an @ inside a mail address starts no handle; a lone @ and an @ before a blank are no handle", () => {
  assert.deepEqual(found("write to ada@mail.test").accounts, []);
  assert.deepEqual(found("write to ada@mail.test or @ada").accounts, ["@ada"]);
  assert.deepEqual(found("email me @ 5pm, or @, or @!").accounts, []);
});

test("the words after a greeting at the start of a line, up to the first comma or the end of the line, are a name", () => {
  assert.deepEqual(found("Dear Ada Example, thanks").names, ["Ada Example"]);
  assert.deepEqual(found("Hello Bob Stone").names, ["Bob Stone"]);
  assert.deepEqual(found("x\nHi Carla!").names, ["Carla"]);
  assert.deepEqual(found("Hallo Dieter,").names, ["Dieter"]);
  assert.deepEqual(found("Liebe Eva\nLieber Frank,").names, ["Eva", "Frank"]);
  assert.deepEqual(found("Sehr geehrte Frau Müller,\nSehr geehrter Herr Weiß").names, ["Müller", "Weiß"]);
});

test("an optional title after the greeting is not part of the name: Mr, Ms, Herr, Frau and Dr, with or without a period", () => {
  assert.deepEqual(found("Dear Mr. Smith,").names, ["Smith"]);
  assert.deepEqual(found("Dear Ms Jones,").names, ["Jones"]);
  assert.deepEqual(found("Hello Dr. Ada Example,").names, ["Ada Example"]);
  assert.deepEqual(found("Lieber Herr Weiß,").names, ["Weiß"]);
});

test("a greeting's case does not matter", () => {
  assert.deepEqual(found("hi dora").names, ["dora"]);
  assert.deepEqual(found("HELLO ERIK,").names, ["ERIK"]);
});

test("no name is given by a greeting that is not at the start of a line, one inside a longer word, or one with nothing but a comma after it", () => {
  assert.deepEqual(found("Please say hello to Bob Stone, thanks").names, []);
  assert.deepEqual(found("Hiking with Bob is fun\nDearest Ada,\nHistory repeats").names, []);
  assert.deepEqual(found("Hi,\nHello, team\nDear").names, []);
  assert.deepEqual(found("Hi\n Hello Bob").names, []);
});

test("the line after a closing is a name, for each listed closing, whatever its case", () => {
  assert.deepEqual(found("Regards\nAda Example").names, ["Ada Example"]);
  assert.deepEqual(found("Best regards,\nBob Stone").names, ["Bob Stone"]);
  assert.deepEqual(found("Kind regards,\nCarla Roth").names, ["Carla Roth"]);
  assert.deepEqual(found("Best\nDora Lund").names, ["Dora Lund"]);
  assert.deepEqual(found("Thanks!\nEve Long").names, ["Eve Long"]);
  assert.deepEqual(found("Cheers\nFrank Moss").names, ["Frank Moss"]);
  assert.deepEqual(found("Viele Grüße\nGerda Voss").names, ["Gerda Voss"]);
  assert.deepEqual(found("Beste Grüße,\nHans Roth").names, ["Hans Roth"]);
  assert.deepEqual(found("Mit freundlichen Grüßen,\nIda Berg").names, ["Ida Berg"]);
  assert.deepEqual(found("Gruß\nJan Koch").names, ["Jan Koch"]);
  assert.deepEqual(found("Grüße\nKai Lang").names, ["Kai Lang"]);
  assert.deepEqual(found("best REGARDS,\r\nLena Roth\r\n").names, ["Lena Roth"]);
});

test("no name is given by a line that only starts like a closing, a closing with no line after it, a blank line after it, or a line with no letter", () => {
  assert.deepEqual(found("Thanks for the quick help\nthe build log is attached").names, []);
  assert.deepEqual(found("Best of luck\nwith the release").names, []);
  assert.deepEqual(found("see you\nRegards").names, []);
  assert.deepEqual(found("Regards,\n\nAda Example").names, []);
  assert.deepEqual(found("Regards,\n12345\n").names, []);
});

test("the first line of the signature, after a line of two hyphens and a blank, is a name; its other lines are not", () => {
  assert.deepEqual(found("see log\n-- \nAda Example\nCEO, Acme Corp\nacme.test").names, ["Ada Example"]);
  assert.deepEqual(found("see log\r\n-- \r\nBob Stone\r\n").names, ["Bob Stone"]);
  assert.deepEqual(found("Thanks\n-- \nEve Long").names, ["Eve Long"]);
});

test("no name is given by two hyphens without the blank, three hyphens, a signature line inside a line, or nothing after the line", () => {
  assert.deepEqual(found("see log\n--\nAda Example").names, []);
  assert.deepEqual(found("see log\n---\nAda Example").names, []);
  assert.deepEqual(found("see log -- \nAda Example").names, []);
  assert.deepEqual(found("see log\n-- ").names, []);
  assert.deepEqual(found("see log\n-- \n\nAda Example").names, []);
});

test("a name found in the headers and again by a greeting, a closing and a signature, in other cases, is listed once as first found", () => {
  const given = mail("Dear ada example,\nRegards\nADA EXAMPLE\n-- \nAda Example", [from("Ada Example", "ada.example@mail.test")]);
  assert.deepEqual(personal.peopleIn(given).names, ["Ada Example"]);
});

test("peopleIn and personHits together: the text of a mail's sender names the sender, and the same text without the people passes", () => {
  const given = mail("Dear Carla Roth,\ncall +49 911 123456\nRegards\nEve Long", [from("Ada Example", "ada.example@mail.test")]);
  const issue = "The export fails when Eve Long uploads a file.";
  const clean = "The export fails when a user uploads a file.";
  const mailPeople = personal.peopleIn(given);
  assert.deepEqual(personal.personHits(issue, mailPeople), [{ kind: "name", value: "Eve Long", line: 1, column: 23 }]);
  assert.deepEqual(personal.personHits(clean, mailPeople), []);
});

test("it is pure: the same result twice, the mail unchanged, and no request sent", () => {
  const given = mail("Dear Carla Roth,\ncall +49 911 123456 or @dora_x or dora@site.test\nRegards\nEve Long", [from("Ada Example", "ada.example@mail.test")]);
  const copy = structuredClone(given);
  const loadedFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; throw new Error("peopleIn sent a request"); };
  let first;
  let second;
  try {
    first = personal.peopleIn(given);
    second = personal.peopleIn(given);
  } finally { globalThis.fetch = loadedFetch; }
  assert.deepEqual(first, {
    names: ["Ada Example", "Carla Roth", "Eve Long"],
    addresses: ["ada.example@mail.test", "dora@site.test"],
    phones: ["+49 911 123456"],
    accounts: ["@dora_x"],
  });
  assert.deepEqual(second, first);
  assert.equal(requests, 0);
  assert.deepEqual(given, copy);
});
