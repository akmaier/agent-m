# Job assignment cases

The data of tests/test_job_assignment.py. The product is the fixture of the parallel sprints (tests/fixtures/parallel-sprints/): the model works in sprints, two teams, team1 and team2, each with a role assignment of its own under docs/role-assignments/ — team1 gives the role Developers to dev-a, team2 to dev-b, and both give the Product Owner to alice —; team1's running sprint holds ITM-001, ITM-003 and ITM-005, team2's holds ITM-007 and ITM-008. The participants alice, dev-a and dev-b are the instance's; dev-a and dev-b have what the role Developers needs, alice has not.

- `jobs` are the jobs handed out: for each, the `team` whose running sprint holds the `item`.
- `assignments` replaces the text of a team's role assignment (`team1`, `team2`) where a case gives one.
- `expected` is, for each job in the order of `jobs`, the participants to which the job may go: those for which MOD-work-plans' `startable` admits the item under the job's own role assignment, the participants asked one at a time.

The cases of the groups `model`, `capability` and `capability-removed` hand a job of a role to an agent and follow it to the connection it is sent to and the model its coding agent is started with:

- `register` is the instance's docs/participants.md, each row `[Name, Type, Model]`.
- `settings` are this browser's settings (MOD-browser-store), from which MOD-prompt-bar's `endpointsOffered` and `sessionsOffered` give the connections; `bridgeAgents` the coding agents the fixture Bridge at `http://127.0.0.1:9418` lists ready, each a name, listed without a declaration, or `{ name, place, capabilities, models }`, listed with the declaration the Bridge keeps for it (MOD-bridge-http, GET /v1/agents).
- `role` is the role of the fixture's process (tests/fixtures/parallel-sprints/product.md, `## Roles`) whose capabilities the job needs; `jobs` names, for each job, the agent it is handed to.
- `expected` is, for each job: `connections`, the routes of the connections MOD-participant-list's `eligible` sends it to; `startedWith`, the model after `--model` with which MOD-agent-processes' `agentDriver` starts a fixture `claude` on the first of them, or null where there is none; `reasons`, every reason `eligible` names for each connection, or agent, left out.

## each team's job goes to the holder of the role in that team's assignment

### Case

```json
{
  "group": "teams",
  "jobs": [{ "team": "team1", "item": "ITM-005" }, { "team": "team2", "item": "ITM-008" }],
  "assignments": {},
  "expected": [["dev-a"], ["dev-b"]]
}
```

## a role held by two participants of one team goes to either of them, and the other team's job still goes to its own holder

### Case

```json
{
  "group": "several",
  "jobs": [{ "team": "team1", "item": "ITM-005" }, { "team": "team2", "item": "ITM-008" }],
  "assignments": { "team1": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | dev-a, dev-b |\n" },
  "expected": [["dev-a", "dev-b"], ["dev-b"]]
}
```

## a participant that holds the role only in the other team receives no job of this team

### Case

```json
{
  "group": "other",
  "jobs": [{ "team": "team1", "item": "ITM-001" }, { "team": "team1", "item": "ITM-003" }, { "team": "team2", "item": "ITM-007" }],
  "assignments": { "team2": "# team2\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | dev-b |\n" },
  "expected": [["dev-a"], ["dev-a"], ["dev-b"]]
}
```

## a role assignment that gives the role to a participant without what the role needs hands the job to no one

### Case

```json
{
  "group": "capable",
  "jobs": [{ "team": "team1", "item": "ITM-005" }, { "team": "team2", "item": "ITM-008" }],
  "assignments": { "team1": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | alice |\n" },
  "expected": [[], ["dev-b"]]
}
```

## the same assignments with the participants swapped hand each job to the other participant

### Case

```json
{
  "group": "swapped",
  "jobs": [{ "team": "team1", "item": "ITM-005" }, { "team": "team2", "item": "ITM-008" }],
  "assignments": {
    "team1": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | dev-b |\n",
    "team2": "# team2\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | dev-a |\n"
  },
  "expected": [["dev-b"], ["dev-a"]]
}
```

## a job runs on a connection that offers its agent's model, with that model; the job of an agent whose model no connection offers is sent nowhere

### Case

```json
{
  "group": "model",
  "register": [["alice", "person", "—"], ["dev-a", "agent", "model-x"], ["dev-b", "agent", "model-y"]],
  "settings": {
    "bridge:lab": { "address": "http://127.0.0.1:9418", "token": "pairing-token" }
  },
  "bridgeAgents": [{ "name": "claude", "place": "this machine", "capabilities": ["read the repository", "write to the repository", "run code and tests", "use tools"], "models": [{ "model": "model-x", "context": 200000 }] }],
  "role": "Developers",
  "jobs": ["dev-a", "dev-b"],
  "expected": [
    { "connections": ["bridge lab agent claude"], "startedWith": "model-x", "reasons": [] },
    { "connections": [], "startedWith": null, "reasons": ["no connection offers its model model-y"] }
  ]
}
```

## a job of a role that needs run code and tests goes only to the connection of its agent's model that declares that capability

### Case

```json
{
  "group": "capability",
  "register": [["dev-c", "agent", "model-z"]],
  "settings": {
    "endpoint:ep1": { "kind": "openai-compatible", "url": "https://models.example/v1", "model": "model-z", "key": "k", "place": "this machine", "context": 200000 },
    "bridge:lab": { "address": "http://127.0.0.1:9418", "token": "pairing-token" }
  },
  "bridgeAgents": [{ "name": "claude", "place": "this machine", "capabilities": ["read the repository", "write to the repository", "run code and tests", "use tools"], "models": [{ "model": "model-z", "context": 200000 }] }],
  "role": "Developers",
  "jobs": ["dev-c"],
  "expected": [
    { "connections": ["bridge lab agent claude"], "startedWith": "model-z", "reasons": ["lacks the capability \"write to the repository\"", "lacks the capability \"run code and tests\""] }
  ]
}
```

## counter-proof: without the connection that declares the capability, the job is sent nowhere and the missing capability is named

### Case

```json
{
  "group": "capability-removed",
  "register": [["dev-c", "agent", "model-z"]],
  "settings": {
    "endpoint:ep1": { "kind": "openai-compatible", "url": "https://models.example/v1", "model": "model-z", "key": "k", "place": "this machine", "context": 200000 },
    "bridge:lab": { "address": "http://127.0.0.1:9418", "token": "pairing-token" }
  },
  "bridgeAgents": ["claude"],
  "role": "Developers",
  "jobs": ["dev-c"],
  "expected": [
    { "connections": [], "startedWith": null, "reasons": ["lacks the capability \"write to the repository\"", "lacks the capability \"run code and tests\""] }
  ]
}
```
