# Bridge Settings Cases

The cases of tests/test_bridge_settings.py: SPEC.md's check of THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT. Each case states what is given, what is done and what is expected.

## Settings set in the window

### Case

```json
{
  "given": "The Bridge's app running with its window on a computer that has Claude Code installed (a fixture executable) and no other agent; the Bridge was paired with a first token; its settings file holds the name before, the first port, no jump host and no agent.",
  "input": {
    "kind": "set-in-the-window",
    "name": "lab-pc",
    "products": [
      "https://github.com/alice/product-a",
      "https://github.com/alice/product-b"
    ],
    "every": 120,
    "jumpHost": {
      "hostname": "jump.example.org",
      "user": "alice",
      "sshPort": 2222
    },
    "agentFolder": "/home/alice/agent-m-work/claude"
  },
  "expected": {
    "afterSettings": {
      "agent-m-bridge-settings": 1,
      "name": "lab-pc",
      "port": "the port set",
      "agents": [],
      "products": [
        "https://github.com/alice/product-a",
        "https://github.com/alice/product-b"
      ],
      "every": 120,
      "paused": true,
      "jumpHost": null,
      "tunnels": []
    },
    "portSetIsServed": 200,
    "oldPortIsFree": "refused",
    "tokenKeptByASettingsSave": true,
    "jumpHost": {
      "hostname": "jump.example.org",
      "user": "alice",
      "sshPort": 2222
    },
    "agents": [
      {
        "name": "claude",
        "folder": "/home/alice/agent-m-work/claude"
      }
    ],
    "pairedAnew": {
      "differs": true,
      "oldToken": 401,
      "newToken": 200,
      "shownInWindow": true
    },
    "final": {
      "name": "lab-pc",
      "port": "the port set",
      "products": [
        "https://github.com/alice/product-a",
        "https://github.com/alice/product-b"
      ],
      "every": 120,
      "jumpHost": {
        "hostname": "jump.example.org",
        "user": "alice",
        "sshPort": 2222
      },
      "agents": [
        {
          "name": "claude",
          "folder": "/home/alice/agent-m-work/claude"
        }
      ]
    }
  }
}
```

## An export through the jump host, for the Bridge named gpu-box

### Case

```json
{
  "given": "A Bridge whose name, products and interval were set in the window, and a plain settings export of this instance written by the dashboard's own writer: two products, a jump host with a web login, the Bridges gpu-box (port 40111, token token-of-gpu-box) and lab-pc, and secrets (a repository token, an endpoint key, a mailbox password).",
  "input": {
    "kind": "imported",
    "export": "plain",
    "instance": "carol/product-x",
    "bridge": "gpu-box"
  },
  "expected": {
    "before": {
      "name": "set-in-the-window",
      "products": [
        "https://github.com/alice/set-in-the-window"
      ],
      "every": 77
    },
    "refused": null,
    "settings": {
      "name": "gpu-box",
      "products": [
        "https://github.com/alice/from-the-export-a",
        "https://github.com/alice/from-the-export-b"
      ],
      "every": 77,
      "jumpHost": {
        "hostname": "jump.from-export.example",
        "user": "exportuser",
        "sshPort": 2200
      },
      "tunnels": [
        {
          "direction": "reverse",
          "jumpHost": "jump.from-export.example",
          "user": "exportuser",
          "sshPort": 2200,
          "remotePort": 40111,
          "bind": "127.0.0.1",
          "bridgePortIsItsOwn": true
        }
      ]
    },
    "ownPortKept": true,
    "pairingToken": "token-of-gpu-box",
    "oldTokenStillAnswers": 401,
    "newTokenAnswers": 200,
    "nothingElseKept": true,
    "settingsKeys": [
      "agent-m-bridge-settings",
      "agents",
      "every",
      "jumpHost",
      "name",
      "paused",
      "port",
      "products",
      "tunnels"
    ]
  }
}
```

## A locked export for the person's own computer

### Case

```json
{
  "given": "The same Bridge, and the same export locked with the passphrase correct horse.",
  "input": {
    "kind": "imported",
    "export": "locked",
    "instance": "carol/product-x",
    "passphrase": "correct horse",
    "ownComputer": true
  },
  "expected": {
    "before": {
      "name": "set-in-the-window",
      "products": [
        "https://github.com/alice/set-in-the-window"
      ],
      "every": 77
    },
    "refused": null,
    "settings": {
      "name": "set-in-the-window",
      "products": [
        "https://github.com/alice/from-the-export-a",
        "https://github.com/alice/from-the-export-b"
      ],
      "every": 77,
      "jumpHost": {
        "hostname": "jump.from-export.example",
        "user": "exportuser",
        "sshPort": 2200
      },
      "tunnels": [
        {
          "direction": "forward",
          "jumpHost": "jump.from-export.example",
          "user": "exportuser",
          "sshPort": 2200,
          "remotePort": 40111,
          "bind": "127.0.0.1",
          "bridgePortIsItsOwn": true
        },
        {
          "direction": "forward",
          "jumpHost": "jump.from-export.example",
          "user": "exportuser",
          "sshPort": 2200,
          "remotePort": 40112,
          "bind": "127.0.0.1",
          "bridgePortIsItsOwn": true
        }
      ]
    },
    "ownPortKept": true,
    "pairingToken": "kept",
    "oldTokenStillAnswers": 200,
    "newTokenAnswers": 200,
    "nothingElseKept": true,
    "settingsKeys": [
      "agent-m-bridge-settings",
      "agents",
      "every",
      "jumpHost",
      "name",
      "paused",
      "port",
      "products",
      "tunnels"
    ]
  }
}
```

## A locked export with a wrong passphrase

### Case

```json
{
  "given": "The same Bridge, and the same export locked with correct horse, imported with the passphrase wrong.",
  "input": {
    "kind": "imported",
    "export": "locked",
    "instance": "carol/product-x",
    "passphrase": "wrong",
    "bridge": "gpu-box"
  },
  "expected": {
    "before": {
      "name": "set-in-the-window",
      "products": [
        "https://github.com/alice/set-in-the-window"
      ],
      "every": 77
    },
    "refused": "Import refused: The passphrase is wrong or this locked export cannot be read.",
    "settingsFileUnchanged": true,
    "nothingElseKept": true,
    "settingsKeys": [
      "agent-m-bridge-settings",
      "agents",
      "every",
      "jumpHost",
      "name",
      "paused",
      "port",
      "products",
      "tunnels"
    ]
  }
}
```

## An export of another instance

### Case

```json
{
  "given": "The same Bridge, and an export written for another instance.",
  "input": {
    "kind": "imported",
    "export": "plain",
    "instance": "dave/other-product",
    "bridge": "gpu-box"
  },
  "expected": {
    "before": {
      "name": "set-in-the-window",
      "products": [
        "https://github.com/alice/set-in-the-window"
      ],
      "every": 77
    },
    "refused": "Import refused: This settings export belongs to another Agent M instance.",
    "settingsFileUnchanged": true,
    "nothingElseKept": true,
    "settingsKeys": [
      "agent-m-bridge-settings",
      "agents",
      "every",
      "jumpHost",
      "name",
      "paused",
      "port",
      "products",
      "tunnels"
    ]
  }
}
```
