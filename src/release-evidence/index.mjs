// MOD-release-evidence — versions, release candidates, the release test report, the release and its audit
// (docs/architecture/MOD-release-evidence.md): its interface. Of it, ITM-254 builds nextVersion, startReleaseCandidate,
// releaseReport and acceptAndRelease, as its file states them: the next version of a product's own line; the release
// candidate tagged and its complete run queued; the release test report of a candidate whose run has ended; and, on the
// person's one click, the report, its approval record and the changelog entry in one commit, then the tag on the
// tested commit. Running the queued run on its route is UC-010's and UC-011's, reportsAwaitingAcceptance is ITM-239's,
// and the audit of a release (auditRows, auditDocument) is UC-030's; none of the three is part of this item, and none
// is built yet.
//
// Module: MOD-release-evidence
//
// It belongs to Tests and releases (ARC-043). It uses MOD-result-records, MOD-test-schedule, MOD-approvals,
// MOD-runtimes, MOD-job-ledger, MOD-repository-hosts, MOD-documents, MOD-spec-document, MOD-test-document and
// MOD-trace-graph only through their index.mjs. Every other file of this folder is private to it.

export { nextVersion } from "./version.mjs";
export { startReleaseCandidate } from "./candidate.mjs";
export { releaseReport, acceptAndRelease, reportsAwaitingAcceptance } from "./report.mjs";
export { ReleaseEvidenceError } from "./errors.mjs";
