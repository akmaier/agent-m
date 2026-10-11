// ITM-343 — MOD-markdown-render's editor marks, drafts and leaving contract.
//
// Module: MOD-markdown-render
// Guards: EDITS ARE PREPARED ON THE DASHBOARD; A FINDING READS LIKE A COMPILER MESSAGE; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; A REFUSED SAVE KEEPS THE EDIT
// Level: unit
//
// The established renderer battery owns the browser-compatible small DOM. These cases add only
// the Editor members ITM-343 makes public; its existing expected results remain unchanged.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FAULTS = {
  "TST-343001": ["src/markdown-render/editor.mjs", "button.disabled = false;", "button.disabled = true;"],
  "TST-343002": ["src/markdown-render/editor.mjs", "difference(against, draft)", "difference(draft, against)"],
  "TST-343003": ["src/markdown-render/editor.mjs", "confirm(\"Discard unsaved changes?\")", "false"],
  "TST-343004": ["src/markdown-render/editor.mjs", "lastSaved = area.value;", "lastSaved = \"\";"],
};

await import("./markdown-render.test.mjs");
const { openEditor } = await import("../src/markdown-render/index.mjs");

const byTag = (root, name) => {
  const found = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) {
    if (child.localName === name) found.push(child);
    walk(child);
  } })(root);
  return found;
};
const byClass = (root, name) => {
  const found = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) {
    if (child.className.split(" ").includes(name)) found.push(child);
    walk(child);
  } })(root);
  return found;
};
const type = (area, text) => { area.value = text; area.dispatchEvent(new Event("input")); };
const clickSave = async (target) => {
  byTag(target, "button").find((button) => button.textContent === "Save").dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
};
const saved = async () => ({ kind: "saved", link: "https://example.test/commit/343" });

// TST-343001
// guards: EDITS ARE PREPARED ON THE DASHBOARD; A FINDING READS LIKE A COMPILER MESSAGE
// given: an editor opened with no marks and a warning for line 2 supplied after it opened
// input: editor.setMarks([warning])
// expect: line 2 shows the finding in its compiler form, the other line remains unmarked, and Save stays offered
test("TST-343001 setMarks shows later findings beside their lines without blocking Save", () => {
  const target = document.createElement("div");
  const editor = openEditor(target, "first\nsecond", { marks: () => [], save: saved });
  const finding = { artifact: "UC-019", line: 2, kind: "warning", rule: "A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT",
    what: "the participant kept an unclear line", fix: "make the change concrete" };

  editor.setMarks([finding]);

  const rows = byClass(target, "marks")[0].children;
  assert.deepEqual(rows.map((row) => row.textContent), ["", "UC-019:2: warning: the participant kept an unclear line "
    + "[A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT] — make the change concrete."]);
  assert.equal(byTag(target, "button").find((button) => button.textContent === "Save").disabled, false);
});

// TST-343002
// guards: A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT; EDITS ARE PREPARED ON THE DASHBOARD
// given: an editor on CURRENT and a participant's DRAFT that replaces its second line and adds one line
// input: editor.showDraft(DRAFT, CURRENT)
// expect: the editor and its live preview hold DRAFT, while the difference marks DRAFT's lines added and CURRENT's replaced line removed
test("TST-343002 showDraft keeps the draft in the editor beside its difference from the current text", () => {
  const CURRENT = "Rule one.\nRule two.\n";
  const DRAFT = "Rule one.\nRule two, made checkable.\nRule three.\n";
  const target = document.createElement("div");
  const editor = openEditor(target, CURRENT, { marks: () => [], save: saved });

  editor.showDraft(DRAFT, CURRENT);

  assert.equal(byTag(target, "textarea")[0].value, DRAFT);
  assert.equal(editor.text(), DRAFT);
  assert.deepEqual(byClass(target, "diff")[0].children.map((row) => [row.className, row.textContent]), [
    ["dctx", "  Rule one."],
    ["dadd", "+ Rule two, made checkable."],
    ["ddel", "- Rule two."],
    ["dadd", "+ Rule three."],
  ]);
});

// TST-343003
// guards: EDITS ARE PREPARED ON THE DASHBOARD
// given: an editor whose text a person changed after opening, and a confirmation that first declines then accepts discard
// input: editor.close() twice
// expect: the first close asks and keeps the editor; the accepted second close asks and removes it
test("TST-343003 close asks before discarding an unsaved edit", () => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "confirm");
  const answers = [false, true], asked = [];
  Object.defineProperty(globalThis, "confirm", { configurable: true, value: (message) => { asked.push(message); return answers.shift(); } });
  try {
    const target = document.createElement("div");
    const editor = openEditor(target, "current\n", { marks: () => [], save: saved });
    type(byTag(target, "textarea")[0], "changed\n");

    editor.close();
    assert.equal(byClass(target, "editor").length, 1, "declining discard keeps the editor");
    editor.close();
    assert.equal(byClass(target, "editor").length, 0, "accepting discard closes the editor");
    assert.deepEqual(asked, ["Discard unsaved changes?", "Discard unsaved changes?"]);
  } finally {
    if (prior) Object.defineProperty(globalThis, "confirm", prior); else delete globalThis.confirm;
  }
});

// TST-343004
// guards: EDITS ARE PREPARED ON THE DASHBOARD
// given: one editor never changed, and another changed then saved successfully
// input: close each editor
// expect: neither close asks; both editors are removed
test("TST-343004 close does not ask without an edit or after a successful save", async () => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "confirm");
  const asked = [];
  Object.defineProperty(globalThis, "confirm", { configurable: true, value: (message) => { asked.push(message); return true; } });
  try {
    const untouched = document.createElement("div");
    const unopenedEdit = openEditor(untouched, "current\n", { marks: () => [], save: saved });
    unopenedEdit.close();
    assert.equal(byClass(untouched, "editor").length, 0);

    const savedTarget = document.createElement("div");
    const editor = openEditor(savedTarget, "current\n", { marks: () => [], save: saved });
    type(byTag(savedTarget, "textarea")[0], "saved\n");
    await clickSave(savedTarget);
    editor.close();
    assert.equal(byClass(savedTarget, "editor").length, 0);
    assert.deepEqual(asked, []);
  } finally {
    if (prior) Object.defineProperty(globalThis, "confirm", prior); else delete globalThis.confirm;
  }
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_343_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-343-fault-")), copied = join(temporary, "repo");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [file, needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, file), original = readFileSync(source), count = original.toString().split(needle).length - 1;
      assert.equal(count, 1, `${id}: unique fault target`);
      const digest = (value) => createHash("sha256").update(value).digest("hex");
      const invoke = () => {
        const env = { ...process.env, AGENT_M_343_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT;
        return spawnSync(process.execPath, ["--test", "--test-name-pattern", id, "tests/markdown-render-343.test.mjs"],
          { cwd: copied, encoding: "utf8", timeout: 15_000, env });
      };
      const originalHash = digest(original), testHash = digest(readFileSync(join(copied, "tests/markdown-render-343.test.mjs")));
      let faultHash, failed, faultEnded, restoreStarted, restoredHash, passed, restoredEnded;
      const faultStarted = new Date().toISOString();
      try {
        writeFileSync(source, original.toString().replace(needle, replacement));
        faultHash = digest(readFileSync(source));
        failed = invoke();
        faultEnded = new Date().toISOString();
      } finally {
        restoreStarted = new Date().toISOString();
        writeFileSync(source, original);
        restoredHash = digest(readFileSync(source));
        restoredEnded = new Date().toISOString();
      }
      passed = invoke();
      console.log("TST343-counterproof " + JSON.stringify({ id, file, needle, replacement, testHash, originalHash, faultHash,
        restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded,
        argv: [process.execPath, "--test", "--test-name-pattern", id, "tests/markdown-render-343.test.mjs"], cwd: copied,
        childflag: "AGENT_M_343_FAULT_CHILD=1", failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null,
          stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null,
          stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`));
      assert.equal(restoredHash, originalHash, `${id}: exact restoration`); assert.equal(passed.status, 0, id);
      assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
