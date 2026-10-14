// MOD-job-runner -- serializing the structured input at a driver's sending boundary.

import { formatFinding } from "../text-tools/index.mjs";

/**
 * @param {DriverInput} input
 * @returns {string} The prepared prompt and transient correction context, without repeating parts or schema.
 */
export function driverPrompt(input) {
  const sections = [input.prompt];
  if (input.previous !== null && input.previous !== undefined) sections.push(`## Current draft to change\n\n${input.previous}`);
  if (input.findings?.length) sections.push(`## Findings to fix or answer\n\n${input.findings.map(formatFinding).join("\n")}`);
  return sections.join("\n\n");
}
