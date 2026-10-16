// Module: MOD-mail-protocols
// Level: unit
// Guards: UC-037; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// Real loopback IMAP/SMTP only. Fixture certificates and listeners are prepared before observation.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { constants } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { PASSWORD, assertModule, connection, withServers, runTest } from "./mail-protocols-fixture.mjs";

function writesOnOpen(flags) {
  return typeof flags === "number"
    ? Boolean(flags & (constants.O_WRONLY | constants.O_RDWR | constants.O_CREAT | constants.O_TRUNC | constants.O_APPEND))
    : /[wa+]/.test(flags ?? "r");
}

async function observeOperation(t, invoke) {
  const writes = [], output = [];
  for (const [owner, names] of [[fs, ["writeFile", "writeFileSync", "appendFile", "appendFileSync", "write", "writeSync", "writev", "writevSync", "createWriteStream", "open", "openSync", "truncate", "truncateSync", "ftruncate", "ftruncateSync", "copyFile", "copyFileSync", "cp", "cpSync", "rename", "renameSync", "mkdir", "mkdirSync", "mkdtemp", "mkdtempSync", "unlink", "unlinkSync", "rm", "rmSync"]],
    [fs.promises, ["writeFile", "appendFile", "open", "truncate", "copyFile", "cp", "rename", "mkdir", "mkdtemp", "unlink", "rm"]]]) {
    for (const name of names) {
      const original = owner[name];
      t.mock.method(owner, name, function (...args) {
        if (!/^open/.test(name) || writesOnOpen(args[1])) {
          if (/^writev?$/.test(name.replace(/Sync$/, "")) && [1, 2].includes(args[0])) {
            for (const chunk of Array.isArray(args[1]) ? args[1] : [args[1]]) output.push(String(chunk));
          } else writes.push(`${name} ${String(args[0])}`);
        }
        return original.apply(this, args);
      });
    }
  }
  for (const stream of [process.stdout, process.stderr]) {
    const original = stream.write;
    t.mock.method(stream, "write", function (chunk, ...rest) {
      output.push(String(chunk));
      return original.call(this, chunk, ...rest);
    });
  }
  syncBuiltinESMExports();
  let answer, error;
  try { answer = await invoke(); } catch (caught) { error = caught; }
  finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  return { answer, error, writes, output };
}

async function privacyCase(t, options = {}, code = null, folders) {
  assertModule();
  await withServers(async (imap, smtp) => {
    const observed = await observeOperation(t, () => runTest(connection(imap, smtp, folders)));
    if (code === null) {
      assert.ifError(observed.error);
      assert.deepEqual(observed.answer.counts, { INBOX: 2, Reports: 1 });
      assert.equal(observed.answer.sending, "works");
      assert.ok(imap.logs.logins.length > 0 && smtp.logs.auths.length > 0, "positive: real libraries authenticated at both fixtures");
    } else {
      assert.equal(observed.error?.code, code, "positive: the public handler reached the named fixture failure");
      assert.ok(imap.logs.commands.length > 0, "positive: a real IMAP conversation occurred");
    }
    assert.deepEqual(observed.writes, [], "mail operation writes no file, including on its failure path");
    assert.equal(observed.output.join("").includes(PASSWORD), false, "product/library stdout and stderr contain no marker password");
  }, options);
}

// TST-420101 · level: unit · module: MOD-mail-protocols
// guards: UC-037; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: prepared STARTTLS loopback IMAP/SMTP fixtures accepting the marker password; filesystem and product/library output observed only during the handler operation, not certificate setup or protocol-record collection
// input: public POST /v1/mail/test with INBOX and Reports
// expect: real successful 2/1 counts and SMTP verification; no filesystem write; no marker password in stdout/stderr
test("TST-420101: successful mailbox test writes no file and logs no password", async (t) => privacyCase(t));

// TST-420102 · level: unit · module: MOD-mail-protocols
// guards: UC-037; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: prepared loopback fixtures without STARTTLS, with operation-only filesystem/output observation and separate fixture protocol records
// input: public POST /v1/mail/test with the marker password
// expect: real no-encryption failure; no filesystem write and no marker password in product/library stdout/stderr
test("TST-420102: no-encryption failure writes no file and logs no password", async (t) => privacyCase(t,
  { imap: { advertiseStartTls: false }, smtp: { advertiseStartTls: false } }, "no-encryption"));

// TST-420103 · level: unit · module: MOD-mail-protocols
// guards: UC-037; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: prepared STARTTLS fixtures whose IMAP login refuses the marker password; only the operation's filesystem/product-library output is observed
// input: public POST /v1/mail/test with the marker password
// expect: real login-refused failure; no filesystem write and no marker password in stdout/stderr, independently of the fixture's private protocol records
test("TST-420103: refused login writes no file and logs no password", async (t) => privacyCase(t,
  { imap: { allowLogin: false } }, "login-refused"));

// TST-420104 · level: unit · module: MOD-mail-protocols
// guards: UC-037; THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
// given: prepared STARTTLS loopback fixtures with INBOX but no Missing folder; certificate setup is outside filesystem/output observation
// input: public POST /v1/mail/test with INBOX and Missing
// expect: real not-found failure; no filesystem write and no marker password in product/library stdout/stderr
test("TST-420104: missing folder writes no file and logs no password", async (t) => privacyCase(t,
  {}, "not-found", ["INBOX", "Missing"]));
