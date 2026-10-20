# Job Cost Release Cases

The cases of `tests/test_job_cost.py`, for the requirement NO COST IS GUESSED (SPEC.md: "A job shows a cost only when its runtime reports one, or when the runtime reports usage and the participant declares a price for it. In every other case the cost is shown as unknown."
*Check:* `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows "unknown", never zero.)

**How a case reads.** `given` is its precondition. `input` holds the route the participant is reached by (`route`: `endpoint`, a model endpoint called from the tab, or `bridge`, an agent on a Bridge),
`price` (the Price cell of the participant's row in the register: `<input> / <output> <currency> per million tokens`, or `—`), `usage` (what the runtime reports of tokens, or null) and `cost` (what a
Bridge's agent reports as the cost, or null). A job of the kind `converse` is run on the tab with the real job runner and runtime. `expected` names only what the case asserts, out of: `state` (the job's
state in the ledger), `cost` (the Cost of its row in the ledger), `endCost` (the `cost:` line of the End of its record), `jobPage` (the text under Cost on the page of the job) and `listCell` (its cost cell
in the list of every job).

## NO COST IS GUESSED - neither cost nor usage

### A model endpoint that reports nothing, with a declared price, shows unknown

```json
{
  "given": "A job run on the tab with a model endpoint whose answer carries no usage; the participant declares the price 3 / 15 USD per million tokens.",
  "input": {
    "route": "endpoint",
    "price": "3 / 15 USD per million tokens",
    "usage": null,
    "cost": null
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": false,
      "usage": null
    },
    "endCost": "{\"known\":false,\"usage\":null}",
    "jobPage": "unknown",
    "listCell": "unknown"
  }
}
```

### An agent on a Bridge that reports nothing, with a declared price, shows unknown

```json
{
  "given": "A job run with an agent on a Bridge whose answer carries neither usage nor cost; the participant declares the price 3 / 15 USD per million tokens.",
  "input": {
    "route": "bridge",
    "price": "3 / 15 USD per million tokens",
    "usage": null,
    "cost": null
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": false,
      "usage": null
    },
    "endCost": "{\"known\":false,\"usage\":null}",
    "jobPage": "unknown",
    "listCell": "unknown"
  }
}
```

### A model endpoint that reports nothing, with no price, shows unknown

```json
{
  "given": "A job run with a model endpoint whose answer carries no usage; the participant declares no price.",
  "input": {
    "route": "endpoint",
    "price": "—",
    "usage": null,
    "cost": null
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": false,
      "usage": null
    },
    "jobPage": "unknown",
    "listCell": "unknown"
  }
}
```

## NO COST IS GUESSED - usage without a price

### A model endpoint that reports tokens, with no declared price, shows the usage and an unknown price

```json
{
  "given": "A job run with a model endpoint that reports 10 input and 5 output tokens; the participant declares no price.",
  "input": {
    "route": "endpoint",
    "price": "—",
    "usage": {
      "inputTokens": 10,
      "outputTokens": 5
    },
    "cost": null
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": false,
      "usage": {
        "inputTokens": 10,
        "outputTokens": 5,
        "minutes": null,
        "cost": null
      }
    },
    "jobPage": "10 input tokens, 5 output tokens · price unknown",
    "listCell": "unknown"
  }
}
```

## NO COST IS GUESSED - reported

### A cost the agent reports is shown as reported, with no price declared

```json
{
  "given": "A job run with an agent on a Bridge that reports the cost 0.42 EUR; the participant declares no price.",
  "input": {
    "route": "bridge",
    "price": "—",
    "usage": null,
    "cost": {
      "amount": 0.42,
      "currency": "EUR"
    }
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": true,
      "amount": 0.42,
      "currency": "EUR",
      "basis": "reported"
    },
    "jobPage": "0.42 EUR (reported)",
    "listCell": "0.42 EUR"
  }
}
```

### A cost the agent reports is shown as reported, whatever the declared price and the tokens

```json
{
  "given": "A job run with an agent on a Bridge that reports 10 input and 5 output tokens and the cost 0.42 EUR; the participant declares the price 3 / 15 USD per million tokens.",
  "input": {
    "route": "bridge",
    "price": "3 / 15 USD per million tokens",
    "usage": {
      "inputTokens": 10,
      "outputTokens": 5
    },
    "cost": {
      "amount": 0.42,
      "currency": "EUR"
    }
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": true,
      "amount": 0.42,
      "currency": "EUR",
      "basis": "reported"
    },
    "jobPage": "0.42 EUR (reported)",
    "listCell": "0.42 EUR"
  }
}
```

## NO COST IS GUESSED - usage at a price

### 1 000 000 input and 2 000 000 output tokens at 3 / 15 USD per million tokens cost 33 USD

```json
{
  "given": "A job run with a model endpoint that reports 1000000 input and 2000000 output tokens; the participant declares the price 3 / 15 USD per million tokens, so the tokens cost 3 + 30 = 33 USD.",
  "input": {
    "route": "endpoint",
    "price": "3 / 15 USD per million tokens",
    "usage": {
      "inputTokens": 1000000,
      "outputTokens": 2000000
    },
    "cost": null
  },
  "expected": {
    "state": "done",
    "cost": {
      "known": true,
      "amount": 33,
      "currency": "USD",
      "basis": "usage at the declared price"
    },
    "jobPage": "33 USD (usage at the declared price)",
    "listCell": "33 USD"
  }
}
```
