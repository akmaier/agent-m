// version.mjs — the next version of a product's own line (MOD-release-evidence, Parts: "version.mjs — the next version
// and the tags of a product's line"). Of it, ITM-254 builds nextVersion, as the module file states it: a minor step by
// default, a patch step, YYYY.1.0 in a new year, from the product's own tags only.
//
// Module: MOD-release-evidence

// A release tag of a product's own line: v<YYYY>.<MINOR>.<PATCH> — never a candidate's v<version>-rc.<N> (MOD-release-
// evidence.md, Data: "Tags of a product's line").
const RELEASE_TAG = /^v(\d{4})\.(\d+)\.(\d+)$/;

// The greatest of two release versions read from RELEASE_TAG, by year, then minor, then patch.
function laterOf(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.year !== b.year) return a.year > b.year ? a : b;
  if (a.minor !== b.minor) return a.minor > b.minor ? a : b;
  return a.patch > b.patch ? a : b;
}

// nextVersion(tags: string[], step: "minor" | "patch", today: string) -> string — the next version of the product's
// own line (MOD-release-evidence, Interfaces): a minor step by default (anything but "patch"); in a new calendar year
// YYYY.1.0, whatever step is asked — also the first version a product with no release tag yet gets, since it stands in
// no year at all; otherwise a minor step resets the patch to 0, a patch step keeps the minor. Considers: tags of other
// products are never given — nextVersion reads only RELEASE_TAG among `tags`, never a candidate's `-rc.` tag.
export function nextVersion(tags, step, today) {
  const year = Number(String(today).slice(0, 4));
  let latest = null;
  for (const tag of tags ?? []) {
    const m = RELEASE_TAG.exec(tag);
    if (!m) continue;
    latest = laterOf(latest, { year: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) });
  }
  if (!latest || latest.year !== year) return `${year}.1.0`;
  return step === "patch" ? `${year}.${latest.minor}.${latest.patch + 1}` : `${year}.${latest.minor + 1}.0`;
}
