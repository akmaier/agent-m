// The line difference of two texts (MOD-text-tools, Interfaces: lineDiff and DiffLine).
//
// Module: MOD-text-tools
//
// By the longest common subsequence of the two texts' lines, so that as few lines are added and removed as the two texts
// allow. Where a change leaves the order open, its added lines come before its removed ones, as the dashboard's difference
// shows them today: the walk is the one of lineDiff in docs/assets/review-core.mjs. A line is a line of the text without its
// line ending, LF or CR LF, so a text that changed only its line endings shows no difference; an empty text has no line.

// The lines of a text, each without its line ending.
function linesOf(text) {
  const t = typeof text === "string" ? text : String(text ?? "");
  if (t === "") return [];
  return t.replace(/\r?\n$/, "").split("\n").map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));
}

// lineDiff(before: string, after: string) -> DiffLine[] — the lines of two texts as a difference: every line of both, in
// order, each `same`, `added` or `removed`, with its line in the text before and in the text after where it has one (from 1),
// and as few `added` and `removed` lines as the two texts allow. A caller that must know whether two texts are byte-identical
// compares their blobSha.
export function lineDiff(before, after) {
  const x = linesOf(before), y = linesOf(after);
  const out = [];
  // The lines both texts begin with are the same, as the walk below would find them, and need no table.
  let p = 0;
  while (p < x.length && p < y.length && x[p] === y[p]) {
    out.push({ op: "same", text: x[p], before: p + 1, after: p + 1 });
    p += 1;
  }
  // L[i][j]: the length of the longest common subsequence of the lines from x[p + i] and from y[p + j] on.
  const n = x.length - p, m = y.length - p;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = x[p + i] === y[p + j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[p + i] === y[p + j]) {
      out.push({ op: "same", text: x[p + i], before: p + i + 1, after: p + j + 1 });
      i += 1;
      j += 1;
    } else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) {
      out.push({ op: "added", text: y[p + j], before: null, after: p + j + 1 });
      j += 1;
    } else {
      out.push({ op: "removed", text: x[p + i], before: p + i + 1, after: null });
      i += 1;
    }
  }
  return out;
}
