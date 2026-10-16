# The folded explanations

**REGISTER**

The texts behind *What is this?* on the pages of Agent M and in the Bridge's window, one section per topic: its heading
names the topic, a lower-case slug, and the Markdown below it, up to the next topic, is shown when the explanation is
unfolded. Each is written for someone new to what the step asks.

## process-model

A process model says how the product's team — people and agents — works: who does what, in which order, and where
someone has to approve before the work goes on. A product declares one before its implementation starts; its
requirements, use cases and architecture are worked out the same way whatever the model.

The model is not the rules the product has to meet:

| | The process model — chosen here | The rules to be met — not chosen here |
|---|---|---|
| answers | *how* the team works: roles, phases, order, gates | *what* has to hold: of the product, or of the way it is built |
| comes from | your decision, from the book's catalogue | requirement sources, as requirements |
| examples | V-model, Scrum, Kanban | "exports are PDF" (product); IEC 62304 class B: "unit verification is documented" (process) |
| effect | defines the workflow | a process requirement adds gates and artifacts to the workflow, never replaces it |

The catalogue holds the book's five models in two groups. The *plan-driven* ones — waterfall, V-model and
reuse-oriented — plan the work in advance and build the software along an implementation plan. The *agile* ones pull
their work from an ordered backlog: Scrum in sprints, Kanban as a steady flow with a limit on the work in progress. Each
model shows the risk it manages well, the risk it accepts and a project it suits. In the book *Vibe Coding*: chapter 6
for the plan-driven models, chapter 7 for the agile ones.

## roles-and-participants

A model names its roles. For each role it says whether a person, an agent or either may hold it, whether one participant
fills it or several may, and which capabilities its holder needs — for example *write to the repository* or *run code and
tests*. The process names the roles and no one: who holds them is set in the product's role assignment — one, or one per
team in a model that works in sprints — from this instance's participants: people, model endpoints, CI agents, CLI agents
and sandboxed agents. The page *Roles* offers for a role only participants with every capability it needs, each with the
place where it processes the data it is given; where no participant has them all, it names the missing capability and
links to the participants, where one who has it can be added.

In Scrum, for example: the *Product Owner* — a person or an agent — orders the backlog and decides what is released; the
*Scrum Master* — either — watches the process, removes obstacles and approves nothing; the *Developers* — either, able to
write to the repository and to run code and tests — turn items into a done increment.

A role that needs a person must have one before a role assignment can be saved. A participant that processes data at a
place a linked requirement source does not permit may still hold a role, but that source's content is never given to it.
In the book *Vibe Coding*: chapter 7, section 5, for the roles of Scrum.

## fill-the-roles

The process names roles and no one; the product's role assignment fills them with participants of this instance's list,
so who does the work can change without the process changing. A role is a defined responsibility in the process, such as
developer, reviewer, tester or product owner, and one participant may hold several roles in a small project.

Only Scrum has teams. A Scrum team — its Product Owner, Scrum Master and Developers — is one filling of Scrum's roles, and
plans and runs sprints of its own; several teams of one product, at work at the same time, are what the book calls
agility at scale. Kanban is one flow under a limit on the work in progress, and the V-model pairs each step down to the
code with the step that verifies it on the way back up; neither knows a team, so a product in either has one role
assignment, with as many developers, testers and reviewers as the work needs. In the book *Vibe Coding*: chapter 6, the
Geek Box *Artifacts, roles, and traceability*, for what a role is, and the V-model; chapter 7, Figure 7.4, for the Scrum
team, Kanban, and *Scaling Agility to Large Systems* for several teams.

## role-assignment

A role assignment, `docs/role-assignments/<name>.md` in the product's repository, gives each role of the process its
participants, and holds nothing else. In a model that works in sprints, each team has one, and a participant may serve
several teams; in any other model, the product has one. Beside it stand the findings of the role assignments read
together. A team is removed only while no sprint of it holds an item: an item stays held until its change reaches the
default branch.

## assign-participants

Name the role assignment — in a model that works in sprints, the team, such as `team1` — and tick who fills each role:
one participant for a role that one fills, as many as the work needs for a role that several may fill. *Save* commits
the role assignment to the product's repository as your own commit, and nothing else. It stays disabled while a role
that needs a person has none, or a role that one fills has more, and the role is named. Jobs already running keep their
participant.

## phases-and-gates

The phases are the stages the work passes through, in the model's order; a transition leads from one phase to the next,
or back to an earlier one. A verification pair names the phase that checks what another phase produced — in the V-model,
for example, *Testing* checks the *Design*, and *Validation & Verification* the *Requirements*. A gate stands between two
phases: it names the artifacts that must exist and the condition that must hold before the next phase opens, and who
decides it — a role, held by a person or an agent, or an automated check such as CI. A job that reaches a gate waits
there until its decider has decided, and no gate is passed by the decision of the participant whose work it checks. In
the book *Vibe Coding*: chapters 6 and 7.

## branch-of-its-own

A phase, or a sprint, may have a branch of its own. The work done in it is then merged into that branch instead of the
default branch, and merging that branch into the default branch is the gate at its end — in Scrum decided by the Product
Owner after the review of the sprint's increment. The work of the phase or sprint reaches the default branch only through
that gate. Preset is *none*: the work of every job is merged into the default branch. In the book *Vibe Coding*: chapter
12, section 10, on a branch merged back through a reviewed pull request.

## practices

A practice is added to the declared model and never replaces it: DevOps, prototyping, incremental delivery or a scaling
layer. Each says what it adds and which models it fits — DevOps and the scaling layers fit Scrum and Kanban; prototyping
and incremental delivery fit every model of the catalogue. A product may add none, one or several. In the book *Vibe
Coding*: DevOps and the scaling layers in chapter 7, prototyping and incremental delivery in chapter 14.

## process-requirements

Some requirements constrain how the product is built rather than what it does — for example IEC 62304 class B, which asks
that unit verification is documented. They come from a registered requirement source, like every requirement, and they
add gates and artifacts to the workflow of the chosen model, each marked with the requirement and the source it comes
from; they never replace the model. Where such a requirement needs a gate the model does not have — documented
verification before a release, say, in a Kanban flow without a release gate —, the gate is added and its place shown, and
the model stays what it is. A product without process requirements shows none here; once requirements from a standard are
accepted, their additions appear without the model changing.

## definition-of-done

The Definition of Done names the conditions a pull request must meet before it is merged. It is preset to the rules every
implementation job already follows: CI is green; the job's first commit held only failing tests — for a refactoring job,
CI was green on every commit and no expected result changed —; only the job's modules changed; and every gate before the
merge is recorded. You may add conditions, for example a review by a second developer, a CI check of its own, or a gate.
In Scrum, the Developers meet the Definition of Done, whoever presses merge. In the book *Vibe Coding*: chapter 7,
section 5, after the Scrum Guide.

## process-declaration

*Save* writes the declaration — the model, the holders of its roles, the practices, the branches and the Definition of
Done — to `docs/process.md` in the product's repository, as one commit under your own account: what you decide here is
your own input, and needs no further acceptance. The model's version is the commit of this instance its catalogue was read
at; the product keeps that version until its declaration is saved again. Choosing another model later deletes nothing:
the page lists the artifacts the new model no longer requires.

## repository

A *repository* is the folder on GitHub — or on a GitLab server — that holds a project's files and their whole history of
changes. Paste the product repository's address exactly as your browser shows it when that repository is open, for
example `https://github.com/alice/thesis-tool` or, for a project on a GitLab server, that project's address with every
group it sits under, for example `https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool`. Agent M reads the
address alone to tell whether the repository is on GitHub or on a GitLab server. The product's requirements, use cases
and architecture will live in that repository; this dashboard only reviews them there — it keeps none of that content
itself.

## product-key

The product gets a key of its own, separate from the key this Agent M instance itself uses: a key that reaches only this
one product cannot write anywhere else, and GitHub limits a key to the repositories of one owner, so the instance's own
key could not also reach a product of another owner. GitHub has no way to preselect a repository through a link, but
Agent M opens the page for a new key with the product's owner, a name and a description already filled in from the
product's address, and every permission the product needs already checked — on that page you only choose the product's
repository, press *Generate token* and copy it. On a GitLab server the equivalent is a project access token, created on
that project's own Access tokens page and scoped to that project alone. Either way, the key is kept in this browser for
this product only and sent only to that product's own server, in the requests for this product; Settings shows it,
tests it and can clear it.

## review-layout-commit

Pressing *Add product* writes one commit into the product repository's default branch: a short `README.md` in each of
the folders Agent M uses that does not hold one yet (`docs/use-cases/`, `docs/architecture/`, `docs/approvals/`,
`docs/spec-freigaben/`), a `SPEC.md` skeleton that says what a requirement is and holds none yet, and a `CHANGELOG.md`
with its title — only whatever of this is missing; nothing already there is overwritten. The product's address is then
added to this browser's own list; nothing is written anywhere else.

## reverting-the-commit

The commit that adds the missing layout is an ordinary commit on the product repository: you can open it on GitHub — or
on GitLab — like any other, and revert it from there if you no longer want it; nothing about it is special to Agent M.
If the product repository already has the complete layout, nothing is committed in the first place, so there is then
nothing to undo.

## the-product-list

The product's address is kept only in this browser's own storage, beside its key — nothing is written into the
instance repository, and no product is named there. So a fork of Agent M never shows which products you work on, and it
can be kept in sync with upstream without conflict. Another browser, or another computer, starts with an empty list:
add the product there again with *+ Add product* — for one that already has its layout, that is its key in Step A,
*Check* and *Add product*. *Clear everything* in Settings removes the list together with its keys.

## release-test-levels

*Start release candidate* runs the product's complete test suite, at every level, on exactly the commit marked as the
release candidate: *unit* and *component* tests, fast and with paid external services mocked; *system* tests, which
walk each use case end to end; *integration* tests against the real external services, the run that otherwise happens
only nightly; and *release* tests, one or more for each requirement, written by a participant other than the one who
implemented the behaviour they check. The release panel then shows every level with its result, each model-dependent
check as a rate against the version currently running, and every requirement beside the evidence that guards it.

## independent-release-tests

Release tests are written by a participant other than the one who implemented the behaviour they check — never by its
own author. Someone who built a piece of behaviour tends to test what they already thought of while building it; a
different participant reads the requirement itself and is more likely to find what the behaviour still gets wrong. If
only the implementing participant is available, Agent M says so and asks you to assign a second participant, or to run
the release tests yourself.

## version-not-rewritten

Once a version is tagged, that tag is never moved to a later commit, and the release it names is never changed
afterwards: the tagged commit is exactly the one the complete test suite ran on, at every level, so the tag always
points to a state that can be recovered, compared and relied on later. If the tag for a version already exists, the
release stops instead of moving it; a correction becomes the next version rather than a silent change to one already
released.

## endpoint-url

The endpoint URL is the web address of the model service that will answer the short test request. Paste the address the
service gives for its API, including its `https://` at the start when the service provides one. Agent M uses this URL only
for the endpoint you configure here; it does not put the address or a key into a link, a browser cookie or a repository.

## endpoint-kind

Choose whether this endpoint speaks the OpenAI-compatible or Anthropic API. The choice tells Agent M which request shape
the endpoint understands; it does not select a model or send a request by itself. A provider's documentation names which
kind its endpoint accepts.

## endpoint-model

The model is the name the chosen endpoint expects in a request, for example the name shown in its own model list. It is
not a download and does not make Agent M call the model until you press *Test*. If the endpoint says that name is not
available, change it to a model the endpoint offers.

## endpoint-key

Some endpoints need a key and others do not, so this field is optional. When there is a key, Agent M keeps it in this
browser's localStorage with this endpoint configuration and sends it only in the authorisation header of a request to
that endpoint. It is never placed in a URL, a cookie or a repository. A refused key stays stored until you replace it or
clear the configuration.

## endpoint-route

For an endpoint that the browser can reach, choose the direct route. For a model server on this computer, choose the
Bridge route instead: the paired Bridge calls the local model and the browser talks only to the Bridge. The Bridge's
pairing and HTTPS handoff are configured in UC-044; the local model does not need browser CORS permission. Until that
Bridge setup is present, Agent M keeps this choice and names the setup that is still needed instead of testing the model
directly.

## endpoint-test

Press *Test* after saving the URL, kind, model and optional key. Agent M stores that configuration in this browser first;
one short test request is sent only to the endpoint you named, and an optional key travels only in that endpoint's
authorisation header. The request does not go to a repository, another web page or a cookie. If the endpoint refuses a
browser request because it lacks a cross-origin permission or opt-in header, use GitHub Actions or the local Bridge;
Agent M shows the reason rather than treating the configuration as working.

## endpoint-clear

*Clear* removes this endpoint configuration and its key from localStorage, not only from the form on screen. Agent M then
confirms that nothing is stored for the endpoint in this browser. Add the URL, kind and model again before a later test.

## bridge-pairing

The token shown by the Bridge pairs this dashboard with this Bridge. Copy it only into the dashboard that belongs to this
instance; it authorises that dashboard to ask this local app to reach services on this computer. It is not a model key and
is never put into a repository, a link or a cookie.

## accepting

Accepting is a commit made under your own account, so Git records who accepted and when; a commit is one saved change to the
repository. The commit adds an *approval record*, a small file under `docs/approvals/` that names the file you accepted and the
blob SHA of exactly the text you were shown. Several files can be accepted at once: one commit then holds one approval record
per file, each naming the text you were shown, and a file that changed after it was shown is left out and named. Accepting a
change to the SPEC also replaces the SPEC section with the proposal, byte for byte, and adds the decision to the queue. In the
book *Vibe Coding*: chapter 12, section 10.

## blob-sha

A blob SHA is the number Git computes from the content of a file: the same text always gives the same SHA, and any change to
the text, even one character, gives another. An approval record names the file and the blob SHA of the text you saw, so it is
about that text and no other. The editor notes the SHA of the text it opened, and *Save* compares it with the file on the
branch: if that has another SHA, nothing is written.

## edit-after-acceptance

An approval record names the accepted text by its blob SHA. When the file is edited afterwards, by you in the editor or by
anyone else, the new text has another blob SHA, and no approval record names it. So the dashboard shows the file as *changed
since acceptance*, and nobody has to reset a status: whether a file counts as accepted is worked out every time from the
records, and a record can only vouch for the text it names. Above the text, the dashboard shows the difference to the text the
most recent record for this file names, so that you read only what changed and can accept the new text as before. In the book
*Vibe Coding*: chapter 12, section 10.

## spec-edit-waits-for-approval

The SPEC is what the use cases, the architecture, the tests and the releases are checked against, so a change to it is a
decision, and the dashboard never writes it straight into SPEC.md. Saving an edited requirement writes a proposal into a change
queue under `docs/spec-freigaben/`. A reviewer sees the proposal beside the current text and accepts it, and only then is it
written into the SPEC. A use case is different: it is a draft to be read and corrected, so its file is saved at once. It is
open, not accepted, until an approval record names the saved text, so nothing relies on it before someone has accepted exactly
that text. In the book *Vibe Coding*: chapter 8, section 6.

## change-queue

A change queue is a folder under `docs/spec-freigaben/` that holds proposed changes to the SPEC. Each *entry* is one SPEC
section as it is proposed; the queue's `index.md` lists the entries in order, and `entscheidungen.md` records each decision as
it is taken. An entry is open until someone accepts it. The edits you save on the dashboard collect in your newest queue of the
day that has no accepted entry yet. Entries of one queue that are accepted together are written in the order of the queue's
index, in one commit; an entry whose heading another entry creates is offered only together with or after that entry, and the
dashboard names the entry it waits for. In the book *Vibe Coding*: chapter 8, section 6.

## github-page-without-token

With a token, a key you create on GitHub and store in this browser, the dashboard makes the commit for you, under your
account. Without a token it cannot, so it opens GitHub's own page instead, prepared as far as GitHub allows: to accept,
GitHub's page for a new file with the approval record filled in; to edit, GitHub's editor, with your edited text on the
clipboard. The link carries at most the file's path and the record, never the text you reviewed. You press *Commit changes*
there, and the commit is yours as before; then reload the dashboard. Without write access to the repository, GitHub makes your
commit a pull request, a proposal for the maintainers to review, and the change counts once a maintainer merges it. If the
record does not arrive filled in, the dashboard shows it with a copy button and the exact path of the file. On a GitLab server
there is no such page, so the dashboard needs the project's own token there. In the book *Vibe Coding*: chapter 12, section 10.

## requirements-to-cover

The requirements to cover are the requirements the drafted use cases should realise. By default they are all the requirements
that no use case realises yet, so a first run covers what is still uncovered; you can change the selection to cover fewer
requirements, or other ones.

## drafting-participant

The participant is the model or agent that writes the draft. The dashboard offers only participants from this instance's list
that are declared able to draft text, and next to each it shows where it processes data, because whatever is sent goes to that
place. Choose one whose place you are content with; nothing is sent until you press *Run*.

## run-panel

The run panel appears before anything is sent. It names every participant that will receive something, where it processes
data, and exactly what it receives, part by part, with the size of each part against how much the participant's context can
hold: the requirements to cover, every existing use case, a chapter of the book on requirements engineering, and the prompt.
If the whole does not fit, nothing is sent, the panel says how much there is and how much fits, and you can choose a
participant with a larger context; nothing is left out silently. *Run* is the one click that sends.

## correction-loop

Before you see a draft, Agent M checks it without a model: each use case needs its five parts, a diagram, and realised names
that match real requirements. Every finding is sent back to the participant as one line, like a message from a compiler, naming
the file and line, whether it is an *error* or a *warning*, the rule and the correction expected. An error must be fixed; a
warning is fixed or kept with a one-line reason. This repeats until the draft passes, until the limit of rounds shown on the
run panel is reached, or until a round changes nothing. The number of rounds is counted and shown with the draft, and any
finding left over is shown beside it for you to deal with.

## drafted-use-cases

Drafted use cases are written as one file each in `docs/use-cases/`, on the default branch, and each is *open*: a proposal,
not yet accepted. Nothing relies on a use case until you accept it. You review and accept each use case on its own, in the
review of use cases, which writes an approval record for exactly the text you read.

## change-instruction

The instruction is one sentence that says what should change; the participant drafts the change from it, with the use case or
requirement and everything related in front of it. Examples: split a requirement into two; make a rule checkable; add an
alternative flow to a use case; align a use case with a requirement that has changed. Say what you want changed and leave the
rest alone: what the instruction does not ask for should come back unchanged.

## draft-difference

The difference shows the draft against the current text, line by line: lines removed on one side, lines added on the other, so
that you read only what changed. A name dropped from the list of realised requirements shows up in it too; that is not an
error, it may be what you wanted. You can edit the draft freely, or give a follow-up instruction to refine it, before you save.

## save-use-case

*Save* is one click. For a use case it commits the file to the default branch as *open*, not accepted, so the saved text is
the draft you edited. The commit records the instruction, the participant, its model, the Agent M version, the date and how many
correction rounds the draft needed. If the file changed while the participant was drafting, nothing is written and your draft
stays in the editor beside the newer version.

## ci-agent-draft

A CI agent is a participant that runs in a GitHub Actions workflow, so nobody is waiting at the dashboard while it drafts. The
workflow runs the same correction loop, then commits the draft to the default branch: a use case as *open*, and a change to
requirements as an entry in a new change queue, leaving the SPEC itself untouched. You review it afterwards on the dashboard,
a use case in the review of use cases and a queue entry beside the current SPEC section. Nothing counts before you accept it.

## participant-person

A person is a colleague, reached through their GitHub or GitLab account and through the dashboard. They can do everything, and
only a person takes the decisions that need one. Nothing is billed for a person and nothing is sent to a model, but a person
works at the speed of a person; you control the work by doing it yourself.

## participant-model-endpoint

A model endpoint is a language model that you reach over the network, for example the NHR hub, an OpenAI or Anthropic
endpoint, or a model server such as Ollama that you run yourself. It drafts text and nothing else: it cannot read or change a
repository. It answers quickly, and a hosted endpoint is billed per use by its provider, while a model you run yourself costs
you the machine. You control which model answers and, for a hosted one, where your data is processed. The browser reaches it
directly, or through a Bridge the configuration names.

## participant-ci-agent

A CI agent is an agent that runs inside a GitHub Actions or GitLab CI job, so it is reached through a workflow. It can read
and write the repository and run code and tests. On GitHub's machines it needs nothing installed, but each call is billed per
use by the agent's provider and a job takes the time of a workflow run. On a self-hosted runner, a program you install on a
machine you control, it runs on your own machine and you control more of it.

## participant-cli-agent

A CLI agent is a coding agent such as Claude Code or Codex that runs on a computer of yours, reached through the Bridge on that
computer. It can read and write the repository, run code and tests, and use tools. It signs in with its own login on that
computer, so the work uses your subscription instead of a key billed per call, and it starts at once. You control it the most:
the work happens on your machine, in a working folder of its own.

## participant-sandboxed-agent

A sandboxed agent is a CLI agent inside a virtual machine or a container, reached through the Bridge in it, over a tunnel. It
can do what a CLI agent does, but isolated: it sees only what the sandbox holds. You control it by what you put in the sandbox,
so it is the choice when the agent should not touch the rest of your computer.

## capabilities-and-place

Capabilities say what a participant can do: draft text, read the repository, write to the repository, run code and tests, use
tools, reach the web. The dashboard presets the ones typical for the type and you adjust them. A role can only be held by a
participant that has every capability the role needs. The processing place says where the data given to the participant is
processed, for example *this machine* for a CLI agent. It matters because a linked source may permit its content only at
certain places: a participant elsewhere can still be saved, but is never given that source's content.

## ci-agent-runner

A workflow runs on its runner, on GitHub's machines or on a machine you installed a runner on, and not in this browser. So
nothing stored in this browser, neither a token nor an SSH key, reaches it; its key is an Actions secret that you set on
GitHub. To let a workflow use an agent on your own machine, install a self-hosted runner on that agent's machine. The workflow's
job then runs there and reaches the agent locally, with no inbound SSH and no key stored on GitHub, and it also works for a
machine behind NAT, because the runner only connects out. A self-hosted runner serves private repositories only: on a public
repository a pull request from any fork could run its own code on your machine, so the dashboard refuses a public one and says
why. Since a participant may serve every product of the instance, this holds for each product that would use it.

## ci-ssh-alternative

If you do not want a self-hosted runner, a workflow can reach an agent behind SSH instead. That costs two things: the SSH key
has to be stored as an Actions secret on GitHub, and the machine has to be reachable from the internet by GitHub's machines.
The runner is the recommended way, because it needs neither.

## agent-test

The test sends a harmless request through the Bridge the participant names and shows what answered, so that you know the
connection works before you save. If the Bridge does not answer, the dashboard names the reason, such as the Bridge not running,
a wrong address or a missing token, and saves nothing until you decide to save it untested.

## job-workflow

Agent M's job workflow is the workflow in the product repository that runs a job on GitHub's machines. It reads two secrets
that you set on GitHub as Actions secrets: the key of the agent or endpoint, and your Agent M token. The dashboard names each
secret and opens the repository's secrets page for it, but never asks for the value. The token is there so that the job's
pushes and pull requests start CI like your own; the workflow's built-in token would not. The agent's calls are billed per use
by the agent's provider. In the book *Vibe Coding*: chapter 10, section 6, on API tokens.

## bridge-own-login

A job handed to a Bridge runs on your computer with the agent's own login and with the computer's own git login. No key is
stored for it on GitHub; the job uses your subscription. The computer's git login must reach the
instance and the product, and the Bridge refuses the job and names the repository when it does not.

## bridge-https-route

Some browsers block the call to the Bridge's local address, `http://127.0.0.1`, as Safari does. The site then says why and points
to the other route: the Bridge reached over HTTPS through the jump host. Use that route when your browser blocks the local
address. The same route reaches a machine behind NAT.

## source-kinds

A source is where rules come from, and the library keeps four kinds of them. An *EU legal text* is a law or regulation of the
European Union, for example the AI Act: you paste its EUR-Lex or ELI address and Agent M recognises the number in it. A
*standard* is a norm published by a standards body, for example IEC 62304: you enter its full designation. *Documents* are
files you have, PDF, Word or Markdown files or a zip file holding them, for example a customer's requirements specification.
A *repository* is a repository on GitHub or GitLab, public or private, for example a project's guidelines kept in Git. Choose
the kind that matches what you have; the rest of the form follows from it.

## source-name

The name is how the library and the products that link the source call it, for example *AI Act* or *IEC 62304*. Choose a name
you would recognise in a list, since it is shown wherever the source is linked. If the source is already in the library, do not
register it again: add a new version of the existing one.

## source-authority

Authority says how much the source binds. *Normative* means its rules must be followed, for example a law or a standard you must
comply with. *Advisory* means they are recommended, for example a guideline. *Informational* means they are background that
helps you understand, for example a handbook. A normative source does not win automatically when it contradicts something in a
product: a person still decides, because the product may be out of that source's scope.

## source-licence

The licence says whether the source's content may be republished. *May be republished* is for texts such as EU law or openly
licensed guides: their content is stored in the public instance beside the register entry. *Restricted* is for content such as a
bought norm or internal documents: it is kept in a repository you name, never in the public instance. If you do not know the
licence, the source is treated as restricted until someone records it.

## standard-designation

A standard is registered by its full designation, and that includes the edition and its amendments, for example
`IEC 62304:2006+AMD1:2015`. You find it on the norm's cover page, next to the title: the number, the year of the edition after the
colon, and any amendments added with a plus sign. The amendment matters because an amendment changes the text of the norm, so a
requirement taken from the edition alone may differ from the one the amended norm states; the full designation says exactly
which version was used. The licence of a standard is preset to restricted.

## file-only-hashed

If you only have a printed or local copy of a norm and do not want to upload it, select the file anyway. Your browser computes the
file's SHA-256, a fingerprint of its exact content, without sending the file anywhere. Only the designation and that hash are
recorded, with a note where your copy is kept, so the text itself is not stored. Anyone holding the same copy can compute the
hash and check that it is the version that was used.

## source-public

Before you save, Agent M states what becomes public, because the instance is a public fork. The register entry always becomes
public: the name, kind, authority, licence, versions, identifiers and hashes. The content becomes public only if its licence
says it may be republished; restricted content goes to the repository you name, and it is public only as far as that repository
is.

## mailbox-routes

There are two ways to connect a mailbox, and your mail provider decides which one you use. The *web API* route is for Microsoft
365 and goes directly from the dashboard: you sign in with the provider's own sign-in, so Agent M never sees your password, and
you register an app with Microsoft once, whose return address is this dashboard. It works because Microsoft allows web pages to
call its mail API. The *IMAP and SMTP* route is for every other mail server, for example Gmail, FAU's Exchange, a university's
IMAP server or a small provider. You give the mailbox password, which is stored in this browser after a notice, and you need a
Bridge running and paired with this browser. It needs the Bridge because browsers let no web page open an IMAP or SMTP
connection. Agent M proposes the route from your mail address, and you can change it.

## mailbox-app-registration

To sign in with Microsoft, you register an app with Microsoft once. The dashboard opens Microsoft's page for a new app
registration and shows what to enter there: the name `Agent M`, the kind *single-page application*, and the return address of this
dashboard, with a copy button. Then you copy the app's client ID back into the dashboard. Many institutions allow this only to
their administrators. If Microsoft refuses the registration, ask the administrator of your institution's Microsoft account, and
tell them what you need: a single-page application with this return address and the three mail permissions. Until it is
registered, the IMAP route can serve in the meantime if your provider also offers IMAP.

## mail-server-settings

For the IMAP route you enter the IMAP server and the SMTP server with their ports. A mail provider usually lists these settings in
its help pages, or in the mail settings of your account, under a heading such as *IMAP* or *server settings*. The dashboard presets
the usual encryption for each port: port 993 with implicit TLS for IMAP, and port 587 with STARTTLS or port 465 with implicit TLS
for SMTP. It also presets the account name as your address. Correct whatever differs for your provider.

## gmail-app-password

Gmail refuses your account password over IMAP. It accepts an *app password* instead: a password that Google creates for one
program. An app password needs 2-Step Verification to be switched on for your Google account, so switch that on first, then create
the app password in your account's security settings, on Google's page
[Create and manage your app passwords](https://myaccount.google.com/apppasswords), and enter it as the mailbox password. Work or school accounts may not offer
app passwords; then the organisation's administrator decides whether you can connect. The same applies when a mail server refuses
the login although the password is right: some providers require an app password instead of the account password when two-factor
login is on.

## mailbox-processing-places

Processing places are the places where the participants of this instance process the data they are given, for example *this
machine*, *FAU data centre (EU)* or *US cloud provider*. You tick the places to which this mailbox's mails may be given. Nothing is
ticked at first: until you tick a place, mails are only read and never handed to a participant. If you tick a place outside the
European Union, Agent M tells you before saving that processing personal data there does not comply with the EU's rules, the GDPR
for transferring personal data and the EU AI Act. You can still allow it, and this connection records that you did. You can change
the places later under Settings, Mailbox, Processing places; a mail already handed to a participant is not recalled.

## what-is-an-architecture

An architecture is the fundamental organization of a system: its components, their relationships to each other and to the
environment, and the principles guiding its design and evolution. Agent M derives it from all the requirements and use cases at
once, so a product's first architecture is drafted in one piece, with no selection. It describes the system down to its modules and
their interfaces, and leaves to the implementation what only an implementation can answer. The *system* is decomposed into
*subsystems*, each with one responsibility, and each subsystem into *modules*. The architecture is written in four kinds of file:
the decision that states the system, with its patterns, subsystems, views and one scenario for every use case; one decision for
each subsystem; further decisions, one for each significant choice such as a format or a library; and one file for each module.
It is described in four views: the *logical* view of the subsystems and their abstractions, the *process* view of how they
interact at runtime, the *development* view of the modules and their folders, and the *physical* view of where each part runs,
tied together by the scenarios. It combines *patterns* from three families: structuring patterns, adaptable-system patterns and
distributed-system patterns. And it follows design principles: divide and conquer, design to test, KISS, YAGNI, DRY, the principle
of least astonishment, the open-closed principle, and developing against interfaces. In the book *Vibe Coding*: chapter 10.

## architecture-reviewer

Before you see the draft, a second participant, the *reviewing participant*, checks it as a whole against the whole SPEC. It is a
participant other than the deriving one and uses another model.
It checks level by level: every use case against the system, whether its scenario is possible with the subsystems and their
interfaces; every subsystem against the system, whether it fulfils the responsibility and offers the interface the system's
decision gives it; and every module against its subsystem. It does not check the modules against the use cases. Each finding
names the file and line, the requirement it concerns and what does not fit, and counts as a warning. A reviewer can be wrong, so
the deriving participant weighs each finding: it corrects what holds and answers what does not hold with the reason. The corrected
draft is checked again, and each repetition is a *round*. Rounds go on until no finding is left, until the round limit is
reached, or until a round leaves the findings unchanged. Findings left over are shown to you with the rounds, each finding beside
the correction or the answer it got, and a finding that only you can decide is shown to you and not sent back. No test and no CI
run checks the draft.

## due-diligence

Before you accept a library, Agent M does a *due diligence*: it looks up the facts about every reuse candidate and every
alternative in the package registry and the source repository. It reads whether the package exists, its licence, the dates of its
releases, its open and closed issues, and its adoption, which is the number of dependents or downloads. Each fact is stored with the
address it was read from and the date, so you can check it. A candidate that is not found in its registry is not proposed: the
name may be invented. If the registry cannot be read from the browser, a participant that can reach the web fetches the facts, and
until then the reuse decision is shown without due diligence and cannot be written. Next to each candidate's licence stands your
product's own. A package with no maintenance and unclear ownership should make you hesitate even if it is widely used. In the
book *Vibe Coding*: chapter 6, section 5, on reuse.

## licence-permits

A licence is the permission under which you may use someone else's software; the licence says what you may do with it and what you
must do in return. Without a licence you have no permission: code is under exclusive copyright by default, and being able to see
or fork it on a code host does not allow you to use it. A *permissive* licence such as MIT or Apache-2.0 lets you use, change and
distribute the software, even commercially, and mainly asks you to keep the copyright and licence notices. A *copyleft* licence such
as the GPL also lets you do that, but asks you to make the source code available, under the same licence, for larger works that use
it. So a licence can restrict how your own product may be distributed. Agent M reads each candidate's licence and your product's
own, from its `LICENSE` file, and marks a candidate whose licence is not known to be compatible; if the licence is missing,
unknown or restrictive, the table says so in its row and you decide. Without a `LICENSE` file in the product, every candidate's
licence is marked *not checked*, and the product's own licence decides which libraries it may reuse.

## linked-version

You choose one of the product's linked sources and, if you like, the part of it to work on. Agent M reads exactly the version that
is linked to the product, never a newer one, and checks the file's hash: the SHA-256, a fingerprint of its exact content, against
the one recorded when that version was registered. If the hash differs, the content changed since it was registered; nothing is
sent, Agent M says so, and a new version of the source must be registered first.

## existing-requirements

Candidates are drafted against the requirements the product already has, not beside them. So Agent M collects every existing
requirement of the product, those in its SPEC and those in its open change queues, and sends them with the excerpt of the source,
chapter 8 of the book *Vibe Coding* and the requirement prompt. The participant has to hold all of it: if the excerpt, the
requirements and the chapter do not fit into its context, nothing is sent, Agent M says how many requirements there are and how
much fits, and you can choose a participant with a larger context or a smaller part of the source. No requirement is dropped
silently.

## derivation-run-panel

The run panel appears before anything is sent. It names the destination, the participant that will receive the request and where it
processes data, and says exactly what is sent: the excerpt of the source and the existing requirements, with the chapter of the
book, and how many requirements are included. It also states the limit of correction rounds. *Run* is the one click that sends;
if you do not press it, nothing is sent.

## candidate-classes

The participant returns candidates, and each has a class that says how it relates to the requirements the product already has.
*New*: nothing existing covers it. *Change*: it alters a named existing requirement. *Duplicate*: it restates a named existing
requirement. *Conflict*: it contradicts a named existing requirement. A candidate whose name or normalised rule equals an existing
requirement's is classified as a duplicate by Agent M without a model, whatever the model said. The review panel groups the
candidates by class, each beside the requirement it refers to, and you can move a candidate to another class, for example from
*new* to *duplicate* of a requirement.

## candidate-correction

Before you see the candidates, Agent M checks them without a model and sends what it finds back to the participant, one line each,
like messages from a compiler. A candidate that lacks one of the four fields of a requirement, its name, its source, its rule or
its check, is an error and must be fixed; a rule that contains a conjunction is a warning: split it, or give a reason. The participant corrects them, up to the limit of rounds the
run panel states. Conflicts are never sent back, because a person decides them. What is left after the last round is shown flagged,
and the rounds are counted and shown with the candidates.

## conflict-and-normative-source

A conflict is a candidate that contradicts a named existing requirement. Agent M never settles one: it is not sent back to the
participant, and you decide how each is resolved. When a conflict involves a normative source, the panel says which side is
normative, but a normative source does not win automatically, because the product may be out of that source's scope. A conflict
you have not decided stays in the panel and is not written.

## write-proposals

*Write proposals* is one click. Agent M writes a new queue under `docs/spec-freigaben/`, whose entries are open until someone
accepts them: for a new candidate, an entry that adds the requirement to its section; for a change, an entry for the section that
holds the requirement, changing it under its name, with the current text beside it and its impact list; for a duplicate, an entry
that adds the new source to the existing requirement; for a conflict, an entry only as you resolved it. Every entry records the
Agent M version, the participant, the model and the date. The SPEC itself is unchanged until you accept entries.

## prompt-bar

The prompt bar is where you talk to a participant about the page you are looking at: you write what you want, and the
participant is given the page as it is shown. Each message goes only to the participant named above the input, at the place
where that participant processes data, and that place is named with it before you press *Send*. The conversation stays in this
browser tab; it is written to a repository only while recording conversations is switched on in the instance's settings. A draft
or an edit the participant proposes changes nothing until you save it. Work this tab cannot do is handed over only when you click *Hand over*; that is
work such as running code or tests, changing code or reaching the web.

## recording-conversations

*Recording conversations* decides whether the conversations of the prompt bar are written to git. It is off unless you switch it on.

While it is on, every message of a conversation, yours and the participant's, is committed under `docs/conversations/` of the repository of the page the conversation is held on: the instance's own repository for a page of the instance, the product's for a page of a product.

A repository that its server reports as public publishes what is committed to it, so the conversations held on its pages are published too. Before you switch it on, the page names each repository it reports as public; for a repository whose visibility it cannot read, it says *visibility not known*.

Switching it off is saved at once. Records already written stay in the history of the repositories; switching off writes no more and removes none.
