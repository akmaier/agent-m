// ITM-631: mailId only, through the accepted MOD-mail-records public entry.
// Module: MOD-mail-records
// Guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// Level: unit
// Run: node --test tests/mail-records-identifier.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { sha256 } from "../src/text-tools/index.mjs";

const entry = new URL("../src/mail-records/index.mjs", import.meta.url);
// Only this not-yet-built public entry is tolerated. Broken transitive imports and other loader errors still throw.
const records = await import(entry.href).catch((error) => {
  if (error.code !== "ERR_MODULE_NOT_FOUND" || error.url !== entry.href) throw error;
  return {};
});

// All identifiers below are literal fixtures, independently checked before execution, not computed by sha256 or mailId.

// TST-631001
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: the public hash accepts known UTF-8 text and bytes; the mail has both a bracketed Message-ID and different bytes
// input: mailId({ messageId: "<sample@example.invalid>", bytes: Uint8Array([97, 98, 99]) })
// expect: MAIL-ca171c6d1e8e76f0 from the value inside the brackets, not the supplied bytes; no request or browser-setting write
test("TST-631001 Message-ID takes precedence and names no person", async (t) => {
  assert.equal(await sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await sha256(new Uint8Array([97, 98, 99])), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  t.diagnostic("Known-positive public sha256 text and byte controls passed before mailId.");
  const requests = [];
  const settings = [];
  const fetch = globalThis.fetch;
  const storage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  t.after(() => {
    globalThis.fetch = fetch;
    if (storage) Object.defineProperty(globalThis, "localStorage", storage);
    else delete globalThis.localStorage;
  });
  globalThis.fetch = async (...args) => { requests.push(args); throw new Error("No network in mailId"); };
  Object.defineProperty(globalThis, "localStorage", { configurable: true,
    value: { setItem: (...args) => settings.push(args), removeItem: (...args) => settings.push(args), clear: () => settings.push("clear") } });
  const identifier = await records.mailId?.({ messageId: "<sample@example.invalid>", bytes: new Uint8Array([97, 98, 99]) });
  assert.equal(identifier, "MAIL-ca171c6d1e8e76f0");
  assert.match(identifier, /^MAIL-[0-9a-f]{16}$/);
  assert.ok(!identifier.includes("sample") && !identifier.includes("@") && !identifier.includes("<"));
  assert.deepEqual(requests, []);
  assert.deepEqual(settings, []);
});

// TST-631002
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: two readings of sample@example.invalid, then a different stated Message-ID; bytes are not needed
// input: mailId of <sample@example.invalid>, its independent second reading, and <other@example.invalid>, each with bytes null
// expect: exactly [MAIL-ca171c6d1e8e76f0, MAIL-ca171c6d1e8e76f0, MAIL-f9f8e80f54bb5fa3]
test("TST-631002 repeated readings are stable and different Message-IDs have their literal identifiers", async () => {
  const first = await records.mailId?.({ messageId: "<sample@example.invalid>", bytes: null });
  const again = await records.mailId?.({ messageId: "<sample@example.invalid>", bytes: null });
  const other = await records.mailId?.({ messageId: "<other@example.invalid>", bytes: null });
  assert.deepEqual([first, again, other], ["MAIL-ca171c6d1e8e76f0", "MAIL-ca171c6d1e8e76f0", "MAIL-f9f8e80f54bb5fa3"]);
});

// TST-631003
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: a Message-ID containing non-ASCII characters, with no fallback bytes
// input: mailId({ messageId: "<Gr\u00fc\u00dfe@example.invalid>", bytes: null })
// expect: MAIL-938c0f08237a1e99, the SHA-256 prefix of the bracket contents encoded as UTF-8
test("TST-631003 Message-ID contents are encoded as UTF-8", async () => {
  assert.equal(await records.mailId?.({ messageId: "<Gr\u00fc\u00dfe@example.invalid>", bytes: null }), "MAIL-938c0f08237a1e99");
});

// TST-631004
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: no Message-ID; the complete supplied mail bytes include zero, invalid UTF-8, CRLF and a trailing byte
// input: mailId({ messageId: null, bytes: Uint8Array([0, 255, 13, 10, 65, 128, 66]) }) twice
// expect: MAIL-4399f5efdcdebaee both times, derived from all supplied bytes without text decoding
test("TST-631004 absent Message-ID falls back to the complete unchanged bytes", async () => {
  const first = await records.mailId?.({ messageId: null, bytes: new Uint8Array([0, 255, 13, 10, 65, 128, 66]) });
  const again = await records.mailId?.({ messageId: null, bytes: new Uint8Array([0, 255, 13, 10, 65, 128, 66]) });
  assert.deepEqual([first, again], ["MAIL-4399f5efdcdebaee", "MAIL-4399f5efdcdebaee"]);
});

// TST-631005
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: no Message-ID and a supplied zero-length Uint8Array, which is present rather than missing
// input: mailId({ messageId: null, bytes: Uint8Array([]) })
// expect: MAIL-e3b0c44298fc1c14, not NothingToName
test("TST-631005 empty supplied bytes are nameable", async () => {
  assert.equal(await records.mailId?.({ messageId: null, bytes: new Uint8Array([]) }), "MAIL-e3b0c44298fc1c14");
});

// TST-631006
// level: unit
// module: MOD-mail-records
// guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; UC-038
// given: a usable Message-ID succeeds before the same public API is called with neither input
// input: mailId({ messageId: "<abc>", bytes: null }), then mailId({ messageId: null, bytes: null })
// expect: MAIL-ba7816bf8f01cfea first, then an error named NothingToName; its message and subclass are not prescribed
test("TST-631006 NothingToName when both inputs are missing, after a usable-input control", async () => {
  assert.equal(await records.mailId?.({ messageId: "<abc>", bytes: null }), "MAIL-ba7816bf8f01cfea");
  await assert.rejects(async () => records.mailId?.({ messageId: null, bytes: null }), { name: "NothingToName" });
});
