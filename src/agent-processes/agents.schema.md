# Supported coding-agent register

The supported local coding-agent CLIs. Every row supplies the exact invocation data used by this module; JSON cells keep
each command's argument vector, interpretation and final-answer rule in data rather than in vendor-specific code. A
Task's arguments never hold the prompt: the agent reads it on its standard input. A Session's arguments start the agent in its
interactive mode in a terminal, where `{workdir}` stands for its working folder; its `waiting` is the pattern of the screen line
that shows the agent waits for input after a message. Its Models says how the models the agent reports are read: `args`, the
command's arguments, or `file`, a pattern under the person's own home (`~/`, a `*` in its last part); `format`, `json` or `lines`;
and for `json` the path of the list (`list`), the fields an entry must have to be taken (`take`), and the paths of its model
(`model`) and its context (`context`).

```json
{
  "schema": "agent-processes",
  "shape": "document",
  "rule": "THE BRIDGE FINDS THE INSTALLED AGENTS",
  "path": "src/agent-processes/agents.md",
  "sections": [
    { "underTitle": true, "required": true, "table": { "columns": [
      { "name": "Agent", "value": { "type": "text", "required": true } },
      { "name": "Command", "value": { "type": "text", "required": true } },
      { "name": "Version", "value": { "type": "text", "required": true } },
      { "name": "Task", "value": { "type": "text", "required": true } },
      { "name": "Session", "value": { "type": "text", "required": true } },
      { "name": "Model", "value": { "type": "text" } },
      { "name": "Login check", "value": { "type": "text", "required": true } },
      { "name": "Chrome", "value": { "type": "text" } },
      { "name": "Models", "value": { "type": "text" } },
      { "name": "Key variable", "value": { "type": "text" } },
      { "name": "Endpoint", "value": { "type": "text" } },
      { "name": "Key holder", "value": { "type": "text" } },
      { "name": "Install macos", "value": { "type": "url", "required": true } },
      { "name": "Install windows", "value": { "type": "url", "required": true } },
      { "name": "Install linux", "value": { "type": "url", "required": true } }
    ] } }
  ]
}
```
