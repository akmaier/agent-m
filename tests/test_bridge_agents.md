# Bridge Agents Release Cases

## Some supported agents are installed: exactly those are listed with the version they report

### Case

```json
{
  "given": "A path holding fixture executables of Claude Code (version 2.1.300, logged in) and Codex (version 1.2.3, logged in); opencode is not on the path.",
  "input": {
    "kind": "discovery",
    "fixtures": {
      "claude": { "version": "2.1.300", "loggedIn": true },
      "codex": { "version": "codex 1.2.3", "loggedIn": true }
    }
  },
  "expected": [
    { "name": "claude", "installed": true, "version": "2.1.300", "loggedIn": true,
      "install": { "macos": "https://code.claude.com/docs/en/setup", "windows": "https://code.claude.com/docs/en/setup", "linux": "https://code.claude.com/docs/en/setup" } },
    { "name": "codex", "installed": true, "version": "1.2.3", "loggedIn": true,
      "install": { "macos": "https://learn.chatgpt.com/docs/codex/cli", "windows": "https://learn.chatgpt.com/docs/codex/cli", "linux": "https://learn.chatgpt.com/docs/codex/cli" } },
    { "name": "opencode", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://opencode.ai/docs/#install", "windows": "https://opencode.ai/docs/#windows", "linux": "https://opencode.ai/docs/#install" } }
  ]
}
```

## No supported agent is installed: each is listed as missing with its installation page

### Case

```json
{
  "given": "An empty path.",
  "input": { "kind": "discovery", "fixtures": {} },
  "expected": [
    { "name": "claude", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://code.claude.com/docs/en/setup", "windows": "https://code.claude.com/docs/en/setup", "linux": "https://code.claude.com/docs/en/setup" } },
    { "name": "codex", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://learn.chatgpt.com/docs/codex/cli", "windows": "https://learn.chatgpt.com/docs/codex/cli", "linux": "https://learn.chatgpt.com/docs/codex/cli" } },
    { "name": "opencode", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://opencode.ai/docs/#install", "windows": "https://opencode.ai/docs/#windows", "linux": "https://opencode.ai/docs/#install" } }
  ]
}
```

## An installed agent that is not logged in is marked so with the agent's own login step

### Case

```json
{
  "given": "A path holding a fixture executable of Claude Code (version 2.1.300) whose login check reports that nobody is logged in.",
  "input": {
    "kind": "discovery",
    "fixtures": { "claude": { "version": "2.1.300", "loggedIn": false } }
  },
  "expected": [
    { "name": "claude", "installed": true, "version": "2.1.300", "loggedIn": false, "login": "claude auth login",
      "install": { "macos": "https://code.claude.com/docs/en/setup", "windows": "https://code.claude.com/docs/en/setup", "linux": "https://code.claude.com/docs/en/setup" } },
    { "name": "codex", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://learn.chatgpt.com/docs/codex/cli", "windows": "https://learn.chatgpt.com/docs/codex/cli", "linux": "https://learn.chatgpt.com/docs/codex/cli" } },
    { "name": "opencode", "installed": false, "version": null, "loggedIn": null,
      "install": { "macos": "https://opencode.ai/docs/#install", "windows": "https://opencode.ai/docs/#windows", "linux": "https://opencode.ai/docs/#install" } }
  ]
}
```

## Outside CI the command the driver starts carries no key and its environment no key variable

### Case

```json
{
  "given": "Outside CI, a path holding a logged-in Claude Code fixture that records its arguments and environment; the process that runs the bridge has every key variable of the register set to a secret value.",
  "input": { "kind": "own-login", "agent": "claude", "keyVariable": null },
  "expected": {
    "answer": "ok",
    "keysSetInParent": true,
    "environmentRecorded": true,
    "keyValueInCommand": false,
    "keyVariableNameInCommand": false,
    "keyVariablesInEnvironment": []
  }
}
```
