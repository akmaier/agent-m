// MOD-test-document — the declaration of a test case (docs/architecture/MOD-test-document.md): its interface. Of it,
// ITM-248 builds TestDeclaration and testDeclarations; testFindings is not part of it.
//
// Module: MOD-test-document
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps no state, performs no
// input or output.

/**
 * One test declaration, as MOD-test-document's Data states it: a block of comment lines directly before a test case, in
 * the comment marker of the file's language, or, for a manual test of level `user`, the same lines under a heading
 * `### TST-<nnn> <title>` of a Markdown file. A missing key reads `null`.
 * @typedef {{
 *   id: string,
 *   level: "unit" | "component" | "system" | "release" | "user" | null,
 *   module: string | null,
 *   guards: string[] | null,
 *   given: string | null,
 *   input: string | null,
 *   expect: string | null,
 *   runs: number | null,
 *   phrasings: number | null,
 *   paid: string | null,
 *   path: string,
 *   line: number,
 * }} TestDeclaration
 */

export { testDeclarations } from "./declarations.mjs";
