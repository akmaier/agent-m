// The classes of an issue and the person's one click on the class (MOD-issue-handling, Parts: classes.mjs; Interfaces: IssueClass, confirmClass).
// Of it, ITM-582 builds IssueClass and confirmClass; closing with links is another item's.
//
// Module: MOD-issue-handling
//
// The class of an issue is recorded only as one of MOD-mail-records' labels on it (Data): bug as `defect`, change as `change`, not
// reproducible as `not-reproducible`. Where the module file leaves a reading open, this file states the one it takes:
//   - A rejection comments the reason, trimmed and nothing else, and then closes the issue, so that a refused comment leaves the issue open;
//     it touches no label (UC-012 4a: nothing else changes).
//   - A rejection without a reason, a class outside the four and an issue that is no positive integer are a TypeError before the host is called.
//   - The host's failures — Access's TokenRefused, MissingPermission, RateLimited, Unreachable — pass unchanged.

import { issueLabels } from "../mail-records/index.mjs";

/**
 * IssueClass — the four classes of an issue. *Bug*: the SPEC is right, code or a test is wrong; *change*: the SPEC is wrong, incomplete or silent for the
 * case — a missing requirement is a change, not a bug (UC-012); *not reproducible*; *rejected*: the issue is closed with its reason and nothing else changes.
 */
export const IssueClass = Object.freeze({ bug: "bug", change: "change", notReproducible: "not-reproducible", rejected: "rejected" });

const LABEL_OF = new Map([[IssueClass.bug, issueLabels.defect], [IssueClass.change, issueLabels.change], [IssueClass.notReproducible, issueLabels.notReproducible]]);

/**
 * confirmClass(host, issue, cls, reason) -> Promise<void> — the person's one click on the class: sets the label of a class and removes the other two;
 * for *rejected*, comments the reason and closes the issue. Crosses the network to the product's tracker.
 */
export async function confirmClass(host, issue, cls, reason) {
  if (!Number.isInteger(issue) || issue < 1) throw new TypeError(`confirmClass: ${issue} is no issue number`);
  if (!Object.values(IssueClass).includes(cls)) throw new TypeError(`confirmClass: ${cls} is no class of an issue`);
  if (cls === IssueClass.rejected) {
    if (typeof reason !== "string" || reason.trim() === "") throw new TypeError("confirmClass: a rejected issue is closed with a reason");
    await host.commentOnIssue(issue, reason.trim());
    await host.setIssueState(issue, "closed");
    return;
  }
  const label = LABEL_OF.get(cls);
  await host.setIssueLabels(issue, { add: [label], remove: [...LABEL_OF.values()].filter((other) => other !== label) });
}
