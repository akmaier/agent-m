// Approval records for the tests' fixture products, as MOD-approvals' schema writes them (docs/architecture/MOD-approvals.md, Data):
// the text of a record, from its fields, by MOD-documents' writeDocument and MOD-approvals' approvalSchema, and the path it stands
// at, docs/approvals/<ID>-<blob12>.md. It holds no test and no expected result. Nothing reaches the network.
//
// Module: MOD-approvals
// Level: unit

import { writeDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";

// recordText(fields) -> the record's text, one `key: value` line per field in the schema's order.
export const recordText = (fields) => writeDocument(approvalSchema, { fields });

// approvalPath(id, blob) -> docs/approvals/<id>-<the first twelve hex digits of blob>.md.
export const approvalPath = (id, blob) => `docs/approvals/${id}-${blob.slice(0, 12)}.md`;

// reviewedRecord(path, blob) -> the fields of the record of a reviewed file — a use case, an architecture decision or a module
// file —, its kind from its folder and name.
export const reviewedRecord = (path, blob) => ({
  kind: path.startsWith("docs/use-cases/") ? "use-case" : /^docs\/architecture\/MOD-/.test(path) ? "module" : "architecture-decision",
  file: path, blob,
});
