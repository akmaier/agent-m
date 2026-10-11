// The difference of two texts, line by line (MOD-markdown-render, Parts: difference.mjs), shown as diffHtml of
// docs/assets/dashboard-app.mjs shows it: each line with "+" when only the text after has it, "-" when only the text before
// has it, and " " when both have it.
//
// Module: MOD-markdown-render

import { lineDiff } from "../text-tools/index.mjs";

const SIGN = { same: " ", added: "+", removed: "-" };
const CLASS = { same: "dctx", added: "dadd", removed: "ddel" };

// difference(before: string, after: string) -> Element — every line of both texts, in order, each with its sign.
export function difference(before, after) {
  const shown = document.createElement("pre");
  shown.className = "diff";
  for (const line of lineDiff(before, after)) {
    const row = document.createElement("span");
    row.className = CLASS[line.op];
    row.textContent = `${SIGN[line.op]} ${line.text}`;
    shown.append(row, "\n");
  }
  return shown;
}
export function showDifference(before, after, { context = 3 } = {}) {
  const lines = lineDiff(before, after);
  const keep = new Set();
  lines.forEach((line, index) => {
    if (line.op === "same") return;
    for (let nearby = Math.max(0, index - context); nearby <= Math.min(lines.length - 1, index + context); nearby++) {
      keep.add(nearby);
    }
  });
  const shown = document.createElement("pre");
  shown.className = "diff";
  lines.forEach((line, index) => {
    if (!keep.has(index)) return;
    const row = document.createElement("span");
    row.className = CLASS[line.op];
    row.textContent = `${SIGN[line.op]} ${line.text}`;
    shown.append(row, "\n");
  });
  return shown;
}
