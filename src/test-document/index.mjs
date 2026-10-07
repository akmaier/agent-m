// MOD-test-document — the declaration of a test case (docs/architecture/MOD-test-document.md): its interface. Of it,
// ITM-248 builds TestDeclaration and testDeclarations, the form in which a test case declares itself inside a test file
// of any language, read without running it (A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS). testFindings, the checks
// of a declaration, is not part of this item.
//
// Module: MOD-test-document

/**
 * A test declaration, as testDeclarations reads it from a test file: its identifier; its one level; the module it
 * exercises, or the word "system" for a test that exercises the whole product; what it guards, by name or by use case
 * identifier; its precondition, input and expected result; its runs, phrasings and paid service; and where it stands —
 * its file's path and the line of its first line (the identifier). A key its lines do not carry reads as null —
 * `guards` included, since the module file exempts no key from that rule; testFindings (not part of this item) is what
 * names a missing or unknown level, module or guard as a finding.
 * @typedef {{ id: string, level: string | null, module: string | null, guards: string[] | null, given: string | null,
 *   input: string | null, expect: string | null, runs: number | null, phrasings: number | null, paid: string | null,
 *   path: string, line: number }} TestDeclaration
 */

export { testDeclarations } from "./declarations.mjs";
