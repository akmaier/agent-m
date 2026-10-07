---
id: MOD-settings-pages
title: The pages of settings
folder: src/settings-pages/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.instanceOf
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.runPanel
  - MOD-site-frame.confirmDecision
  - MOD-site-frame.schemaForm
  - MOD-markdown-render.renderArtifact
  - MOD-browser-store.openStore
  - MOD-browser-store.readSetting
  - MOD-browser-store.writeSetting
  - MOD-browser-store.clearSetting
  - MOD-browser-store.clearEverything
  - MOD-browser-store.listSettings
  - MOD-browser-store.exportSettings
  - MOD-browser-store.importSettings
  - MOD-browser-store.expiringSoon
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.commitFiles
  - MOD-repository-hosts.startWorkflow
  - MOD-repository-hosts.listReleaseAssets
  - MOD-repository-hosts.webLinks
  - MOD-bridge-client.bridgeAt
  - MOD-bridge-client.pair
  - MOD-bridge-client.testBridge
  - MOD-bridge-client.probe
  - MOD-bridge-client.allocatePort
  - MOD-bridge-client.tunnelCommands
  - MOD-bridge-client.proxyConfiguration
  - MOD-endpoint-calls.testEndpoint
  - MOD-endpoint-calls.diagnoseEndpoint
  - MOD-mail-routes.routeFor
  - MOD-mail-routes.signIn
  - MOD-mail-routes.mailbox
  - MOD-mail-routes.providerLinks
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-documents.writeDocument
  - MOD-artifact-edits.saveFile
  - MOD-artifact-edits.reviewLayoutCommit
  - MOD-participant-list.participantSchema
  - MOD-product-process.declarationSchema
  - MOD-source-register.sourceSchemas
  - MOD-source-register.registrationCommits
  - MOD-source-register.versionCommits
  - MOD-source-register.linkedVersion
  - MOD-source-register.affectedRequirements
  - MOD-source-register.changedPassages
  - MOD-source-register.recogniseLegalText
  - MOD-source-register.permittedPlaces
  - MOD-resource-list.resourceSchema
  - MOD-resource-list.resourceFindings
  - MOD-resource-list.readPin
  - MOD-resource-list.checkPlan
  - MOD-resource-list.newerState
  - MOD-resource-list.resourceStrategies
  - MOD-reuse-facts.registryFacts
  - MOD-reuse-facts.hubFacts
  - MOD-personal-data.settingsSchemas
  - MOD-personal-data.pseudonymisationOf
  - MOD-personal-data.namedPersonFindings
  - MOD-job-runner.prepareJob
  - MOD-job-ledger.newJobId
  - MOD-runtimes.routesFor
  - MOD-runtimes.queueJob
  - MOD-runtimes.jobWorkflowFiles
  - MOD-notifications.NotificationState
  - MOD-notifications.notificationState
  - MOD-notifications.switchOn
  - MOD-notifications.testNotification
  - MOD-notifications.switchOff
provides:
  - view
---
# MOD-settings-pages The pages of settings

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the menu entry Settings: every setting Agent M uses on one
page — what this browser keeps, what the instance repository keeps, what each product's repository keeps
(`EVERY SETTING IS REACHED FROM ONE PAGE`) — and the guided pages that first set them up: getting one's own Agent M and
finishing its setup, adding a product, model endpoints, participants, the source library and a product's links to it,
resources, the mailbox, and the Agent M Bridge with the jump host and remote sessions. Every register is edited in a
form built from its owner's schema; every notice a setting needs stands before the setting is stored.

It serves UC-001, UC-003, UC-004, UC-011, UC-014, UC-015, UC-016, UC-017, UC-037, UC-040, UC-042, UC-044 and UC-047.

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame. The one job it starts is the check of a
resource on its runner, queued to that runner's route; for its run panel it hands the frame `resourceStrategies`.

## Parts

- `index.mjs` — the interface: `view`.
- `settings.mjs` — the one page of every setting, its tests, clears, export and import.
- `setup.mjs` — getting one's own Agent M and finishing its setup.
- `products.mjs` — adding a product.
- `endpoints.mjs`, `participants.mjs`, `library.mjs`, `resources.mjs`, `mailbox.mjs`, `bridge.mjs` — the guided pages.

## Data

It keeps nothing but the screen and an unsaved form. Its formats are those of the modules it uses.

## Interfaces

- `view: View` — its routes, and the strategies of `resourceStrategies`:
  - `settings` — three sections — this browser, the instance, each product —, one line per setting with its state:
    works, with the date of the last successful test; expires on, from fourteen days before a token's recorded expiry;
    refused; not set. A browser setting has *Test*, *Change* and *Clear*, a secret hidden until *Show*. The line
    *Notifications* of this browser's section (UC-047) shows the state `notificationState` gives: *off*, or switched on
    without this browser's permission yet, with *Switch on*, whose click asks the browser's permission; *on*, with how
    many files were notified, *Test* and *Switch off*, which is its clear; *blocked*, when the person or the browser
    refused, with where the browser's own site settings allow notifications for this site; on an iPhone or iPad not
    opened from the Home Screen, that Safari shows notifications only for a site added to the Home Screen, and how to add
    it; after *Switch off*, that the browser keeps its permission until the person takes it back in its settings. A
    repository setting has a summary and *Edit*, opening its form here or the page where it is kept — the product's
    process on the implementation pages, its schedule on the test pages. A product's section holds its pseudonymisation —
    switching it off states first what follows —, its collaborators who agreed to be named, and whether Agent M's job
    workflow is installed, with *Install*. At the bottom *Export settings*, after the statement of every secret it holds
    and what each grants, optionally locked with a passphrase; *Import settings*, which keeps what this browser has and
    adds the rest, listing both; *Clear everything in this browser*. Each section and line has its folded explanation,
    among them that every Pages site of the same owner can read this browser's store, and, for *Notifications*, what is
    checked and how often, that the checks go to the repository servers with this browser's tokens and nowhere else, and
    that nothing is checked while no page of the dashboard is open.
  - `get-your-own`, `setup` — the fork, Pages and Actions steps with their direct links once the owner is known; then
    *Finish setting up*: the prefilled token page, *Only select repositories* and the instance named, the shared-origin
    notice with its tick, the token and its expiry, *Store and check*, and *Import settings* beside it.
  - `add-product` — the address recognised as GitHub or GitLab; the token's step for that server with the names filled
    in, or the GitLab project access token; *Check*; *Add product*, which writes the missing review layout and adds the
    address to this browser's list; each step with its explanation.
  - `endpoints` — address, model and key of a model endpoint, a local model server named as reached through a Bridge; the
    test request, and the reason and the routes that would work when a browser may not call it; *Clear*.
  - `participants` — the instance's participants in a form from the participant schema: type, model, context and price,
    capabilities, processing place, route; for a CLI or sandboxed agent, the agents the paired Bridge reports and *Test*;
    a self-hosted runner refused for a repository the server reports as public; a change to a participant that products
    use, with those products and roles named.
  - `library`, `library/<source>`, `sources` — the instance's register of sources and a source's versions; *+ Register
    source* by route — EU legal text, standard, documents, repository — with the files hashed in the browser and what
    becomes public stated before *Save*, which commits the entry and its content where its licence allows — the instance,
    or the repository the person names; *+ New version*, refused when its bytes equal an existing version's, the
    products on older versions, *Move* with the requirements affected and the passages changed; *Fetch again* for a
    legal text whose fetch failed; for the chosen product, the linked sources with version and part, and removing a link
    with the requirements that name the source listed first.
  - `resources`, `resources/instance` — a product's or the instance's resources in a form from the resource schema; the
    pin, licence and maintainer read where they can be; the route; the secret by name only; the processing place;
    *Check* through the Bridge, or as a check job on its runner with its run panel; a newer state upstream with *Move*;
    *Copy from the instance*.
  - `mailbox` — the route recognised from the address; for Microsoft 365 the app registration's steps and the sign-in
    with its permissions named before the provider's window opens; for every other mailbox the servers and ports, the
    notice before the password field, and an app password explained; the folders; the processing places the mail may go
    to, a place outside the EU stated as not compliant before saving; *Store and test*; *Disconnect*.
  - `bridge` — the release's file for this computer's system with its size and the SHA-256 the server reports for it, or,
    where the server reports none, a link to the release's checksum file; pairing with the token the Bridge's window
    shows; the jump host and its port range, HTTPS address and web-server login; *+ Remote session* with its port, and the
    two tunnel commands for a computer without a Bridge; the jump host's web-server configuration; *Test* of the HTTPS
    address, a certificate the browser does not trust named as a possible cause.

## Files

It writes, on a person's click and as that person's commit: the instance's `docs/participants.md` and
`docs/resources.md`, and a product's `docs/sources.md`, `docs/resources.md`, `docs/settings.md` and
`docs/collaborators.md`, with `saveFile`; the source register's entries and content under `docs/sources/` of the instance,
and restricted content in the repository the person names, as the commit plans of MOD-source-register say; a product's
review layout when it is added; Agent M's job workflow files of a product; a resource's check job's start record through
MOD-runtimes. It writes this browser's settings through MOD-browser-store, the switch of the notifications through
MOD-notifications. It reads the instance's and the products' snapshots, the Bridge's releases, and what each test
reaches.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.instanceOf, MOD-site-frame.explain,
  MOD-site-frame.notice, MOD-site-frame.runPanel, MOD-site-frame.confirmDecision, MOD-site-frame.schemaForm — the frame's
  parts, the notices before a setting is stored, a check job's run panel, and the forms of every register.
- MOD-markdown-render.renderArtifact — a source's or resource's entry as it will be written.
- MOD-browser-store.openStore, MOD-browser-store.readSetting, MOD-browser-store.writeSetting,
  MOD-browser-store.clearSetting, MOD-browser-store.clearEverything, MOD-browser-store.listSettings,
  MOD-browser-store.exportSettings, MOD-browser-store.importSettings, MOD-browser-store.expiringSoon — every browser
  setting, its export and import.
- MOD-repository-hosts.parseAddress, MOD-repository-hosts.connect, MOD-repository-hosts.readSnapshot,
  MOD-repository-hosts.repositoryInfo — products and the instance, a token's test, a repository's visibility;
  MOD-repository-hosts.commitFiles — the commit plans of a source's registration or new version, and the job workflow
  files; MOD-repository-hosts.startWorkflow — *Fetch again*; MOD-repository-hosts.listReleaseAssets — the Bridge's files
  with their sizes and SHA-256; MOD-repository-hosts.webLinks — the server's token, fork, Pages, Actions, secrets and
  access-token pages.
- MOD-bridge-client.bridgeAt, MOD-bridge-client.pair, MOD-bridge-client.testBridge, MOD-bridge-client.probe — pairing,
  tests, the agents a Bridge reports, a resource's check; MOD-bridge-client.allocatePort,
  MOD-bridge-client.tunnelCommands, MOD-bridge-client.proxyConfiguration — remote sessions and the jump host.
- MOD-endpoint-calls.testEndpoint, MOD-endpoint-calls.diagnoseEndpoint — an endpoint's test and why a browser may not
  call it.
- MOD-mail-routes.routeFor, MOD-mail-routes.signIn, MOD-mail-routes.mailbox, MOD-mail-routes.providerLinks — the
  mailbox's route, sign-in and test, and Microsoft's pages for the app registration and for withdrawing its access.
- MOD-documents.readDocument, MOD-documents.readRegister, MOD-documents.writeDocument — registers of the common shape and
  the text a save writes; MOD-artifact-edits.saveFile — a person's edit of one register, only on the blob it was opened
  on; MOD-artifact-edits.reviewLayoutCommit — the review layout of a new product.
- MOD-participant-list.participantSchema — the participant register; MOD-product-process.declarationSchema — the
  products and roles that use a participant.
- MOD-source-register.sourceSchemas, MOD-source-register.registrationCommits, MOD-source-register.versionCommits,
  MOD-source-register.linkedVersion, MOD-source-register.affectedRequirements, MOD-source-register.changedPassages,
  MOD-source-register.recogniseLegalText, MOD-source-register.permittedPlaces — the source library and a product's links.
- MOD-resource-list.resourceSchema, MOD-resource-list.resourceFindings, MOD-resource-list.readPin,
  MOD-resource-list.checkPlan, MOD-resource-list.newerState — resources; MOD-resource-list.resourceStrategies — the
  recipe of a check job, handed to the frame; MOD-reuse-facts.registryFacts, MOD-reuse-facts.hubFacts — what a
  repository or the Hugging Face Hub says about a resource.
- MOD-personal-data.settingsSchemas, MOD-personal-data.pseudonymisationOf, MOD-personal-data.namedPersonFindings — a
  product's pseudonymisation and collaborators, and the files that still name a collaborator who withdrew.
- MOD-job-runner.prepareJob, MOD-job-ledger.newJobId, MOD-runtimes.routesFor, MOD-runtimes.queueJob — a resource's check
  job on its runner; MOD-runtimes.jobWorkflowFiles — the job workflow a product needs.
- MOD-notifications.NotificationState, MOD-notifications.notificationState, MOD-notifications.switchOn,
  MOD-notifications.testNotification, MOD-notifications.switchOff — the line *Notifications*: its state, *Switch on* in
  the person's click, *Test* and *Switch off*.
