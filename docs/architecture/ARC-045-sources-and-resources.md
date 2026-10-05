---
id: ARC-045
title: Sources and resources
refines: ARC-037
forced_by:
  - THE SOURCE MODEL IS GENERIC
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - A SOURCE DECLARES ITS AUTHORITY
  - A LIVING SOURCE IS PINNED
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - A PRODUCT LINKS THE SOURCES THAT APPLY
  - A LINK NAMES THE PART THAT APPLIES
  - A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY
  - A SOURCE DECLARES ITS LICENCE
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A SOURCE VERSION IS NEVER OVERWRITTEN
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
  - ONE SYSTEM IN TWO ROLES IS TWO ENTRIES
  - A RESOURCE'S TERMS ENTER AS A SOURCE
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A COMPUTE ENVIRONMENT IS PINNED IN THE JOB'S OWN FILES
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - A RESOURCE DECLARES ITS LICENCE
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A RESOURCE NAMES ITS MAINTAINER
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE DECLARES WHERE IT PROCESSES DATA
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
  - THE INSTANCE DECLARES ITS OWN RESOURCES
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A PRODUCT DECLARES ITS LICENCE
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-004
  - UC-015
  - UC-016
  - UC-022
  - UC-040
designs:
  - MOD-source-register
  - MOD-resource-list
  - MOD-reuse-facts
---
# ARC-045 Sources and resources

## Context

A product depends on things outside itself in two different ways (UC-015, UC-040): it must **meet** the rules of its
requirement sources — a law, a standard, a set of documents, a repository —, and it **uses** resources — repositories,
data, models, compute, endpoints, agents. Both must be pinned to the exact state that counts: a source version by its
identifier and the SHA-256 of every file read, a resource by its commit, revision, hashes or served model. Restricted
content stays out of the public instance and goes only to participants at places its licence permits. And when the
architecture adopts a library, the facts about it and its alternatives are read from their registries, never recalled
(`DUE DILIGENCE IS FETCHED, NOT RECALLED`).

## Decision

Sources and resources is one service of ARC-037, the lowest among them: **registers in Markdown, kept where their rules
say — sources in the instance, links and resources in each product —, and facts read from registries with their address
and date**. Its registers are documents of the common shape: each module defines its formats as schemas, which the
artifact model's MOD-documents reads and writes (ARC-048). What jobs need from it — the excerpt of a linked source
version, the due diligence of a draft's reuse candidates — it offers as strategies to the job runner (ARC-046). It uses
only Participants and jobs' types, Access and the artifact model.

### Responsibility within the system

Keeping the instance's register of requirement sources with their versions and content, and each product's links to
the versions that apply; giving a source version's content only with its hashes checked, and naming the places it may
go; keeping the resource lists of a product and of the instance, pinned, with how each is reached and checked; reading
due-diligence facts and judging a licence against the product's.

### The interface it offers

| Module | Functions other subsystems use |
|---|---|
| MOD-source-register | `sourceSchemas`, `registrationCommits`, `versionCommits`, `linkedVersion`, `affectedRequirements`, `sourceFindings`, `changedPassages`, `recogniseLegalText`, `fetchLegalText`, `permittedPlaces`, `sourceStrategies` |
| MOD-resource-list | `Resource`, `resourceSchema`, `resourceFindings`, `readPin`, `checkPlan`, `newerState`, `paidServices`, `reachableBy`, `resourceStrategies` |
| MOD-reuse-facts | `Candidate`, `DueDiligence`, `registryFacts`, `hubFacts`, `reuseStrategies` |

### Its modules

| Module | Folder | Responsibility |
|---|---|---|
| MOD-source-register | `src/source-register/` | the schemas of `docs/sources/SRC-<slug>.md` of the instance, with each version's identifier, date and file hashes, and of a product's `docs/sources.md`; the content in the instance where its licence permits republishing and otherwise in a repository the person names; a version's content read only with its hashes checked; recognising an EU legal text by its CELEX number or ELI and fetching it from the EU's publication repository in the instance's workflow (ARC-039); the recipe that gives a job a linked version's excerpt |
| MOD-resource-list | `src/resource-list/` | the schema of `docs/resources.md` of a product and of the instance, independent of each other: the closed set of kinds, the pin, licence, maintainer, route, processing place and the name of a secret; the checks a schema cannot express; how a resource is checked; whether a newer state exists upstream; which routes reach it; the recipe of a check job on a runner |
| MOD-reuse-facts | `src/reuse-facts/` | the facts of a reuse candidate from its package registry (npm, PyPI, crates.io, Maven Central) and its source repository, and of a model or dataset from the Hugging Face Hub, each with the address it was read from and the date; whether a candidate's licence is known to be compatible with the product's; the step that adds the due diligence to a drafted architecture's reuse decisions |

The three modules do not use each other. Reading a pin of a resource on a repository server or the Hub is done by
MOD-resource-list through Access or MOD-reuse-facts' reading of the Hub, handed in by the caller.

### The formats it owns

The schemas of a source's register entry and of a product's links file, and the layout of a source's content
(MOD-source-register); the schema of the resource list (MOD-resource-list); the due-diligence fact with its address and
date (MOD-reuse-facts).

## Alternatives

- **Sources and resources in one list.** Rejected: they relate to the product differently — a rule to meet against a
  thing used — and a resource's terms enter as a source (`A RESOURCE'S TERMS ENTER AS A SOURCE`).
- **Copies of sources in every product.** Rejected: the instance keeps the register once (`THE INSTANCE KEEPS THE SOURCE
  REGISTER`); a product links the version it uses.
- **Due diligence written by the drafting participant.** Rejected: `DUE DILIGENCE IS FETCHED, NOT RECALLED`; a model can
  invent a package.
- **Fetching EU legal texts in the browser.** Rejected: the official repository's text belongs into the instance with its
  retrieval date and version, written by the instance's workflow (`AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL
  REPOSITORY`).

## Consequences

- A source's content is hashed in the browser before anything is stored; a changed file is caught before derivation.
- Registries that do not answer a browser make due diligence depend on a participant that can reach the web (UC-022).
- Two lists of resources mean that a resource used by both the instance and a product is entered twice, by copy.
