---
id: MOD-reuse-facts
title: Due-diligence facts read from registries
folder: src/reuse-facts/
realises:
follows:
  - ARC-045
uses:
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.issueCounts
  - MOD-documents.loadSchema
  - MOD-documents.readRegister
  - MOD-documents.appendSection
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
provides:
  - Candidate
  - Fact
  - DueDiligence
  - registryFacts
  - hubFacts
  - licenceVerdict
  - reuseStrategies
---
# MOD-reuse-facts Due-diligence facts read from registries

## Responsibility

It belongs to Sources and resources (ARC-045). It reads the facts that decide whether to reuse something — a library,
service or API a drafted architecture adopts, and its alternatives (`A REUSE DECISION RECORDS ITS DUE DILIGENCE`) —
from the candidate's package registry and source repository, and the facts of a model or dataset from the Hugging Face
Hub; every fact names the address it was read from and the date (`DUE DILIGENCE IS FETCHED, NOT RECALLED`). It judges a
candidate's licence against the product's (`A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S`), and offers the step that
adds the due diligence to a drafted architecture's reuse decisions. It runs in a browser and in Node; a registry that
does not answer a browser is named, and the job is offered to a participant that can reach the web (UC-022).

## Parts

- `index.mjs` — the interface.
- `registries.md` — for npm, PyPI, crates.io, Maven Central and the Hugging Face Hub, the public addresses read for each
  fact, as data.
- `licences.md` — for each product licence, the candidate licences known to be compatible with it, as data.
- `strategies.mjs` — the step `due-diligence`.

## Data

**A fact** is one value read from one address on one date:

```json
{ "candidate": "example-lib", "ecosystem": "npm", "what": "latest release", "value": "4.2.0 on <date>",
  "address": "<the address read>", "read": "<date read>" }
```

The facts of a candidate: whether it exists; its licence; its first release, its latest release with its date and the
number of releases; its open and closed issues and where its issues are filed; its adoption — downloads in a period, or
what its registry reports. A candidate not found is a fact too: `not found — the name may be invented`, with the address
queried.

**The due-diligence section** the step adds to a reuse decision, after its alternatives:

```markdown
## Due diligence

| Candidate | Licence | Compatible with the product's licence | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| example-lib (npm) | MIT | yes | … | … | … | … / … | … per month | <addresses> | <date> |
```

A candidate whose licence is not known to be compatible with the product's is marked so in its row; with no `LICENSE` in
the product, every row says *not checked*, and the section says that the product's licence decides what it may reuse.

**The mark of a decision without its due diligence.** When the registry of a candidate of a reuse decision could not be
read — refused by the browser, or not reachable —, the step adds no section to that decision and returns, beside the
draft, one finding made with MOD-text-tools' `finding`: kind `error`; rule `A REUSE DECISION RECORDS ITS DUE DILIGENCE`;
artifact the decision's path in the draft; line the line that names the candidate; `what` naming the registry, the
address that could not be read and the reason; `fix` saying that a participant that can reach the web fetches the facts
(UC-022). This finding is the mark: the runner hands it to the writer with the result (MOD-job-runner's `stepFindings`),
and MOD-artifact-edits' writer `open-files` recognises it by its kind, rule and artifact and refuses to write
(`DueDiligenceMissing`).

```text
docs/architecture/ARC-<nnn>-<slug>.md:14: error: the registry npm could not be read at https://registry.npmjs.org/example-lib: blocked by the browser [A REUSE DECISION RECORDS ITS DUE DILIGENCE] — fetch the facts through a participant that can reach the web.
```

A candidate its registry does not know is no mark: its row says `not found — the name may be invented`, it is not
proposed, and the step returns a finding of kind `warning`, rule `DUE DILIGENCE IS FETCHED, NOT RECALLED`, naming the
candidate and the address queried (UC-022).

## Interfaces

- `Candidate` — `{ name: string, ecosystem: "npm" | "pypi" | "crates" | "maven", repository: string | null }`.
- `Fact` — `{ candidate: string, ecosystem: string, what: "exists" | "licence" | "first release" | "latest release" |
  "releases" | "open issues" | "closed issues" | "issues filed at" | "adoption", value: string, address: string, read:
  string }`.
- `DueDiligence` — `{ candidate: Candidate, facts: Fact[], licence: "compatible" | "not known to be compatible" | "not
  checked", found: boolean, blocked: string | null }`.
- `registryFacts(candidate: Candidate, productLicence: string | null) -> Promise<DueDiligence>` — reads the candidate's
  package registry at the addresses of `registries.md`, across the network, and its source repository through Access's
  repository host, without a token; every fact carries its address and the date. A candidate the registry does not know
  is returned with `found: false` and the address queried. A registry that refuses a browser's call is returned with
  `blocked` naming it and the reason, and with no facts; a network failure likewise. It never fills in a fact it did not
  read.
- `hubFacts(id: string) -> Promise<Fact[]>` — a model's or dataset's revision, licence and whether it is gated or private,
  read from the Hugging Face Hub, across the network, each with its address and date; a Hub that does not answer a browser
  is named in the failure `HubBlocked { reason }`, and `NotFound { address }` for an unknown identifier.
- `licenceVerdict(candidate: string | null, product: string | null) -> "compatible" | "not known to be compatible" | "not
  checked"` — from `licences.md`: `not checked` without a product licence, `not known to be compatible` for a licence the
  file does not list for the product's, or an unknown one.
- `reuseStrategies` — `Partial<Strategies>` with the step `due-diligence`: for every reuse decision of a drafted
  architecture — a decision that names a chosen candidate and its alternatives by name and ecosystem —, reads the facts of
  each with `registryFacts`, against the licence of the product's `LICENSE` file, and adds the due-diligence section to the
  decision's text. A candidate not found leaves the warning defined under Data; a registry that could not be read leaves
  the decision without its section and with the mark defined under Data, so that it is not written (UC-022).

## Files

It reads its own data files and, through the context of a job, the product's `LICENSE`. It writes nothing: the step
returns the decisions with their sections, and the job's writer writes them.

## Uses

- `MOD-repository-hosts.connect`, `MOD-repository-hosts.repositoryInfo`, `MOD-repository-hosts.issueCounts` — the facts
  of a candidate's source repository, its open and closed issues counted without listing them, read without a token.
- `MOD-documents.loadSchema`, `MOD-documents.readRegister` — its data files.
- `MOD-documents.appendSection` — the due-diligence section added to a decision.
- `MOD-text-tools.finding`, `MOD-text-tools.Finding` — the findings the step leaves.
- `MOD-job-runner.Strategies`, `MOD-job-runner.JobContext` — the step it offers.
