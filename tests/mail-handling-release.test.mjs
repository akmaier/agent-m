// ITM-1109: repliesDue names the release that contains what solved an issue, through the host's listTags, listPullRequests and containsCommit,
// over a fake host. The accepted text (docs/architecture/MOD-mail-handling.md): `Due` is `{ ..., closedBy: string | null, release: string | null, ... }`;
// Uses: "`MOD-repository-hosts.listPullRequests`, `MOD-repository-hosts.listTags` — what solved an issue, and the release that contains it"; the recipe
// reply-inputs: "the closing pull request or commit, and the release that contains it, where known".
// Readings, named in the pull request: the commit a pull request names to the host is its `head`, which the release contains when the pull request was
// merged with a merge commit; a commit address names its commit; "the earliest such tag" is the tag whose commit the other containing tags contain;
// a pull request that is not merged, a commit no tag contains and an issue not closed with an address give null.
// Run: node --test tests/mail-handling-release.test.mjs
//
// Module: MOD-mail-handling
// Guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { mailId } from "../src/mail-records/index.mjs";

// The public entry exists; only its answer is tested.
const handling = await import("../src/mail-handling/index.mjs");

const PRODUCT = "https://github.com/example/thesis-tool";
const A = { id: "MAIL-ca171c6d1e8e76f0", messageId: "<sample@example.invalid>" };
const HEAD = "1111111111111111111111111111111111111111";
const OLD = "2222222222222222222222222222222222222222";
const V12 = "3333333333333333333333333333333333333333";
const V13 = "4444444444444444444444444444444444444444";
const V10 = "5555555555555555555555555555555555555555";

const mailbox = { read: async () => [], find: async () => null, drafts: async () => [], sent: async () => [] };
const issue = (number, comments, state = "closed") => ({ number, title: `Issue ${number}`, body: `Export fails.\n\nMails: \`${A.id}\``, labels: [], state, url: `https://example.invalid/${number}`,
  comments: comments.map((body) => ({ author: "agent-m", body, date: "2026-10-12T09:00:00Z" })) });
const pull = (number, head, state = "merged") => ({ number, title: "Fix", branch: "fix", base: "main", head, state, draft: false, url: `${PRODUCT}/pull/${number}`, opened: "2026-10-01", merged: state === "merged" ? "2026-10-02" : null, closed: "2026-10-02", body: "" });

// A fake host. `tags` is listed in the order given; `holds` maps a tag name to the commits its history holds (its own commit too).
function fakeHost({ issues, pulls = [], tags = [], holds = {} }) {
  const calls = [];
  return { calls,
    listIssues: async () => issues,
    commentOnIssue: async () => {},
    listPullRequests: async (filter) => { calls.push(["listPullRequests", filter]); return pulls.filter((each) => !filter?.state || filter.state === "all" || each.state === filter.state); },
    listTags: async (pattern) => { calls.push(["listTags", pattern]); return tags; },
    containsCommit: async (branch, commit) => { calls.push(["containsCommit", branch, commit]); return (holds[branch] ?? []).includes(commit); } };
}
const TAGS = [{ name: "v1.3.0", commit: V13 }, { name: "v1.2.0", commit: V12 }, { name: "v1.0.0", commit: V10 }];
const HOLDS = { "v1.3.0": [V13, V12, V10, HEAD, OLD], "v1.2.0": [V12, V10, HEAD, OLD], "v1.0.0": [V10, OLD] };
const releaseOf = async (host) => (await handling.repliesDue(mailbox, [{ address: PRODUCT, host }])).toAnswer[0]?.release;

assert.equal(await mailId({ messageId: A.messageId, bytes: null }), A.id);

// TST-1109001 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: issue 8 closed with the pull request 31, merged, whose head is HEAD; the tags v1.3.0, v1.2.0 and v1.0.0 are listed in that order; v1.2.0 and v1.3.0 hold HEAD, v1.3.0 holds v1.2.0's commit, v1.0.0 holds neither
// input: repliesDue
// expect: the Due of issue 8 has closedBy the pull request's address and release "v1.2.0", the earliest tag that contains it, though v1.3.0 is listed first
// Planted fault: release null always fails; taking the first containing tag in the listing gives "v1.3.0".
test("TST-1109001 an issue closed by a merged pull request names the earliest tag that contains it", async () => {
  const host = fakeHost({ issues: [issue(8, [`Closed with ${PRODUCT}/pull/31; item \`ITM-123\`.`])], pulls: [pull(31, HEAD)], tags: TAGS, holds: HOLDS });
  const [due] = (await handling.repliesDue(mailbox, [{ address: PRODUCT, host }])).toAnswer;
  assert.equal(due.closedBy, `${PRODUCT}/pull/31`);
  assert.equal(due.release, "v1.2.0");
});

// TST-1109002 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: issue 8 closed with the pull request 31 whose head no tag holds yet
// input: repliesDue
// expect: release null, and closedBy still the address
// Planted fault: naming the latest tag, or any tag, when none contains the commit gives a name.
test("TST-1109002 an issue whose fix no tag contains yet has no release", async () => {
  const host = fakeHost({ issues: [issue(8, [`Closed with ${PRODUCT}/pull/31.`])], pulls: [pull(31, HEAD)], tags: TAGS, holds: { "v1.3.0": [V13, V12, V10], "v1.2.0": [V12, V10], "v1.0.0": [V10] } });
  const [due] = (await handling.repliesDue(mailbox, [{ address: PRODUCT, host }])).toAnswer;
  assert.equal(due.closedBy, `${PRODUCT}/pull/31`);
  assert.equal(due.release, null);
});

// TST-1109003 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: issue 8 closed with a commit address (GitHub's /commit/<sha>), then issue 9 with a GitLab commit address (/-/commit/<sha>); the commit OLD is held by v1.0.0, v1.2.0 and v1.3.0
// input: repliesDue
// expect: both name "v1.0.0"; the commit is looked for in the tags directly, no pull request is listed
// Planted fault: asking for a pull request of a commit address lists pull requests.
test("TST-1109003 an issue closed by a commit names the earliest tag that holds the commit", async () => {
  const host = fakeHost({ issues: [issue(8, [`Closed with ${PRODUCT}/commit/${OLD}.`]), issue(9, [`Closed with ${PRODUCT}/-/commit/${OLD}.`])], tags: TAGS, holds: HOLDS });
  const due = (await handling.repliesDue(mailbox, [{ address: PRODUCT, host }])).toAnswer;
  assert.deepEqual(due.map((each) => each.release), ["v1.0.0", "v1.0.0"]);
  assert.ok(!host.calls.some(([name]) => name === "listPullRequests"));
});

// TST-1109004 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: issue 8 closed elsewhere (no closed-with note); issue 9 closed with a pull request that is not merged (closed); issue 10 closed with a pull request the host does not list; issue 11 open
// input: repliesDue
// expect: release null for all four; for issue 8 and issue 11 the host's tags are not asked
// Planted fault: matching a pull request by position, or by any state, names a release for issue 9 or 10.
test("TST-1109004 no address, a pull request not merged or unknown, and an open issue give no release", async () => {
  const host = fakeHost({ issues: [issue(8, []), issue(9, [`Closed with ${PRODUCT}/pull/32.`]), issue(10, [`Closed with ${PRODUCT}/pull/99.`]), issue(11, [], "open")],
    pulls: [pull(32, HEAD, "closed")], tags: TAGS, holds: HOLDS });
  const result = await handling.repliesDue(mailbox, [{ address: PRODUCT, host }]);
  assert.deepEqual([...result.toAnswer, ...result.open].map((each) => [each.issue, each.release]), [[8, null], [9, null], [10, null], [11, null]]);
  const quiet = fakeHost({ issues: [issue(8, []), issue(11, [], "open")], tags: TAGS, holds: HOLDS });
  await handling.repliesDue(mailbox, [{ address: PRODUCT, host: quiet }]);
  assert.deepEqual(quiet.calls, []);
});

// TST-1109005 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: three issues closed by three pull requests of one product, one tag list
// input: repliesDue
// expect: the product's tags are listed once and its merged pull requests once
// Planted fault: listing per issue lists three times.
test("TST-1109005 a product's tags and pull requests are read once, however many issues it has", async () => {
  const host = fakeHost({ issues: [8, 9, 10].map((n) => issue(n, [`Closed with ${PRODUCT}/pull/${n + 20}.`])), pulls: [28, 29, 30].map((n) => pull(n, HEAD)), tags: TAGS, holds: HOLDS });
  const due = (await handling.repliesDue(mailbox, [{ address: PRODUCT, host }])).toAnswer;
  assert.deepEqual(due.map((each) => each.release), ["v1.2.0", "v1.2.0", "v1.2.0"]);
  assert.equal(host.calls.filter(([name]) => name === "listTags").length, 1);
  assert.equal(host.calls.filter(([name]) => name === "listPullRequests").length, 1);
});
