# 5. Process models and practices: the participant list holds the team, a connection declares how an agent is reached

**The change.**
- `A PARTICIPANT HAS ONE OF FIVE TYPES` is withdrawn, and `A PARTICIPANT IS A PERSON OR AN AGENT` is added in its place.
- `A PARTICIPANT DECLARES ITS CAPABILITIES` is withdrawn, and `A CONNECTION DECLARES ITS CAPABILITIES` is added.
- `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA` is withdrawn, and `A CONNECTION DECLARES WHERE IT PROCESSES DATA` is
  added.
- `A CONNECTION NAMES THE MODELS IT OFFERS` is added: a connection is a model endpoint or a coding agent a Bridge offers,
  as the browser's settings keep it, and names each model it offers with its context.
- `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL` keeps its name: an agent names the model it works with; the
  list of five types leaves its rule and its check.
- `A ROLE NAMES THE CAPABILITIES IT NEEDS` keeps its name: a job of the role runs only on a connection that has every
  capability the role names, where before only a participant with all of them could be assigned. Its check adds the case.
- `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE` keeps its name and its check: what such a
  connection declares moves to the three connection requirements, and what remains is the rule that a connection the bar
  offers, with the model the person chooses, counts as a participant, except that it is not listed and holds no role.
- `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`: the content is given only to connections whose place the
  source permits, where before it named participants.

The order of the section changes: the connection requirements stand after the model requirement, and the requirement on
a role's capabilities after the one on a connection's. The places file puts the four added requirements into the group
`5. Process models and practices`, where the requirements they replace stand. Every other byte of the section is carried
over.

**Why.** akmaier agreed to this design on 2026-11-09:

> 1. The participant list `docs/participants.md` holds only the team: each row a name, *person* or *agent*, and for an
>    agent its **model**. The person selects the model per member from the models the connections offer. Role
>    assignments (`docs/role-assignments/<team>.md`) stay as they are, so models are chosen per role holder. Place,
>    capabilities, context, price and route leave the list.
> 2. Connections stay where they already are, in the browser's settings (MOD-browser-store: `endpoint:<name>`,
>    `session:<bridge>:<agent>`, CI endpoints with their secret): endpoints, the Bridge's CLI agents, CI. Each declares
>    its processing place, its capabilities and the models it offers with their context (and price where declared): an
>    endpoint offers one model, a CLI agent lists the several it can run. The prompt bar, the mail pages and the mailbox's
>    processing-place list all read this one list.
> 3. A member's job runs on a connection that offers the member's model, and the agent is started with that model. The
>    model-comparison rules (NO REVIEWER IS THE DRAFTER, A REWRITTEN TEXT IS CHECKED BY THREE LLMS, NO CHECKER IS THE
>    REWRITER) stay and compare the members'/connections' models, which now are what actually runs.
>
> Explicitly NOT part of it: a subagent sentence, renaming job-internal roles, choosing a model per job.

Today the same facts are kept twice. A participant of `docs/participants.md` declares its place, its capabilities, its
context and its route, and the endpoint or CLI session that route reaches declares them again in the browser's settings
(`THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`). The register's 41 rows are mostly the same
Claude Code or Codex on the same Mac, once per name and model. With the technical declarations at the connection
alone, each fact stands once (*Nothing twice*): the list says who is on the team and with which model, the connection
says how that model is reached and where its data goes (*One responsibility per file, rule and use case*). A new member
is a row of a name and a model and changes no connection; a new connection changes no member (*Adding one of a kind
changes nothing of another kind*).

A participant's place and capabilities are now those of the connection its job runs on, which
`A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`, in the queue of section 13, makes binding. A
requirement that names a participant's place therefore names the connection instead
(`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`, and in their own queues `THE PAGE NAMES WHERE IT SENDS`,
`THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`, `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`), since a member whose
model two connections offer has no one place of its own. A role's capabilities can no longer be checked when a holder is
assigned, since the list knows none; they are checked where they matter, when a job of the role is sent to a connection.

`THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE` is changed, not withdrawn. Its binding part —
a connection the bar offers counts as a participant — is what makes the rules written of a participant hold for the bar's
drafter: `THE PERSON WHO PROMPTS IS A SOURCE`, `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`,
`A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT`, `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`.
Withdrawn, those rules would no longer bind a conversation in the bar; and the exception — not listed, no role — keeps
`A JOB GOES ONLY TO A HOLDER OF ITS ROLE` from forbidding a conversation. What it declared moves to the connection
requirements, which bind every connection, the bar's included (*No special first case*). Its check stays: it names
endpoints and CLI sessions, which are the two kinds of connection.

No subagent sentence is added: a member started by another agent today, such as `po-opus-c`, is a row with its model like
every other, and its job runs on a connection that offers that model. The route `through <participant>` leaves with
every other route.

`NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`, `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY` and `NOTHING IS LEFT
OUT OF AN ARCHITECTURE PROMPT SILENTLY` read a participant's context, `NO COST IS GUESSED` its price, `A HOSTED JOB
AUTHENTICATES ITS AGENT WITH A CI SECRET` its key, and `THE BRIDGE FINDS THE INSTALLED AGENTS` offers agents as
participants; each moves to the connection in the queue of its own section. The model-comparison rules `NO REVIEWER IS
THE DRAFTER` and `NO CHECKER IS THE REWRITER` are unchanged: they compare participants and their models, and the model a
participant names is the one its job runs with.

**Impact list.**
- `A PARTICIPANT HAS ONE OF FIVE TYPES`: withdrawn; no other requirement names it. Named by UC-017 (`realises`), ARC-046,
  MOD-participant-list, MOD-documents, `docs/groups/requirements.md`, the backlog item ITM-029, the schema
  `src/participant-list/participants.schema.md`, and the headers of `tests/test_participants.py`,
  `tests/participant-list.test.mjs`, `tests/documents-findings.test.mjs`, `tests/settings-pages-participants.test.mjs`,
  `tests/site-frame-schema-form-rows.test.mjs`, `tests/release-uc-017-configure-participants.test.mjs`,
  `tests/system-uc-017-configure-participants.test.mjs` and `tests/system-uc-017-participants-through-the-frame.test.mjs`.
- `A PARTICIPANT DECLARES ITS CAPABILITIES`: withdrawn; no other requirement names it. Named by UC-012, UC-017, UC-019,
  UC-024, UC-048 and UC-049 (`realises`), ARC-046, MOD-participant-list, MOD-job-catalogue, the group file, ITM-029,
  `src/participant-list/participants.schema.md`, and the headers of the tests that name it, among them `tests/test_participants.py`,
  `tests/participant-list*.test.mjs`, `tests/prompt-bar*.test.mjs`, `tests/job-runner-*.test.mjs` and the release and
  system tests of UC-012, UC-017, UC-019, UC-024, UC-048 and UC-049.
- `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA`: withdrawn; no other requirement names it. Named by UC-017, UC-019,
  UC-024, UC-038, UC-048 and UC-049 (`realises`), ARC-046, MOD-participant-list, the group file, ITM-029, the schema, and
  the headers of the tests that name it, among them `tests/test_participants.py`, `tests/prompt-bar-endpoints.test.mjs` and
  `tests/prompt-bar-offer.test.mjs`.
- `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`, changed: named by UC-017, ARC-046, MOD-participant-list,
  MOD-documents, ITM-029, the schema, and `tests/test_participants.py`, `tests/participant-list*.test.mjs`,
  `tests/prompt-bar-endpoints.test.mjs` and the UC-017 tests.
- `A ROLE NAMES THE CAPABILITIES IT NEEDS`, changed: named by UC-002, UC-012, UC-026, UC-028, UC-031, UC-034 and UC-048,
  ARC-042, MOD-product-process, ITM-029, `src/product-process/assignments.mjs`, and `tests/test_model_roles.py`,
  `tests/product-process*.test.mjs`, `tests/dashboard-roles.test.mjs` and the release and system tests of UC-048;
  `tests/test_job_assignment.py` gains the case its check names.
- `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`, changed: named by UC-049, MOD-job-ledger,
  and the headers of `tests/prompt-bar-endpoints.test.mjs`, `tests/prompt-bar-offer.test.mjs`,
  `tests/prompt-bar-hand-over.test.mjs`, `tests/browser-store-session-*.test.mjs`, `tests/settings-pages-bridge-sessions.test.mjs`,
  `tests/settings-pages-endpoints-actions.test.mjs`, `tests/workflow-entries-hand-over.test.mjs` and the release tests of
  ITM-1185, ITM-1186, ITM-1187 and UC-049.
- `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`, changed: named by UC-017, UC-022, UC-024, UC-034, UC-048 and
  UC-049, ARC-045, ARC-046, MOD-checkout-tools, MOD-job-runner, MOD-participant-list, MOD-product-process,
  MOD-source-register, MOD-workflow-entries, ITM-025, and the headers of the tests of those modules and use cases.
- `A PARTICIPANT IS A PERSON OR AN AGENT`, `A CONNECTION NAMES THE MODELS IT OFFERS`, `A CONNECTION DECLARES ITS
  CAPABILITIES`, `A CONNECTION DECLARES WHERE IT PROCESSES DATA`: new.
- Drafted beside this entry: UC-003, UC-011, UC-012, UC-017, UC-019, UC-022, UC-024, UC-034, UC-038, UC-040, UC-042,
  UC-044, UC-048, UC-049; ARC-046, MOD-participant-list, MOD-browser-store, MOD-prompt-bar, MOD-settings-pages,
  MOD-agent-processes, MOD-runtimes; and the register `docs/participants.md`. Once the entries are accepted, the group
  file drops the withdrawn names, and the tests and the code follow in the modules' implementation jobs. Backlog items
  are records of done work and stay as they are.
- This entry defines the connection that the entries `requirements/01`, `runtimes/01`, `configuration-and-secrets/02`,
  `review-on-github-pages/03`, `architecture-and-implementation/01`, `process-execution-and-jobs/02` and
  `issues-mail-and-personal-data/01` name; they are accepted together with it or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.
