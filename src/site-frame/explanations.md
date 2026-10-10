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
