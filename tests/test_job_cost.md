# Job Cost Release Cases

The cases of `tests/test_job_cost.py`, for the requirement NO COST IS GUESSED (SPEC.md §13: a job's cost is the one its runtime reports; in every other
case the cost is shown as unknown. *Check:* `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows "unknown", never zero.)

**How a case reads.** `given` is its precondition. `input` holds the connection the participant runs on (`route`: `endpoint`, a model endpoint called from
the tab, or `bridge`, an agent on a Bridge), `usage` (what the runtime reports of tokens, or null) and `cost` (what a Bridge's agent reports as the cost, or
null). The participant is the agent `worker` of the register, of the model `model-t`, joined with the one connection of that model this browser offers. A job
of the kind `converse` is run on the tab with the real job runner and runtime. `expected` names only what the case asserts, out of: `state` (the job's state
in the ledger), `cost` (the Cost of its row in the ledger), `endCost` (the `cost:` line of the End of its record), `jobPage` (the text under Cost on the page
of the job) and `listCell` (its cost cell in the list of every job).

## NO COST IS GUESSED - neither cost nor usage

### A model endpoint that reports nothing shows unknown

```json
{
  "given": "A job run on the tab with a model endpoint whose answer carries no usage.",
  "input": {
    "route": "endpoint",
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

### An agent on a Bridge that reports nothing shows unknown

```json
{
  "given": "A job run with an agent on a Bridge whose answer carries neither usage nor cost.",
  "input": {
    "route": "bridge",
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

## NO COST IS GUESSED - usage without a cost

### A model endpoint that reports tokens and no cost shows the usage and an unknown price

```json
{
  "given": "A job run with a model endpoint that reports 10 input and 5 output tokens and no cost.",
  "input": {
    "route": "endpoint",
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

### A cost the agent reports is shown as reported

```json
{
  "given": "A job run with an agent on a Bridge that reports the cost 0.42 EUR.",
  "input": {
    "route": "bridge",
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

### A cost the agent reports is shown as reported, whatever the tokens

```json
{
  "given": "A job run with an agent on a Bridge that reports 10 input and 5 output tokens and the cost 0.42 EUR.",
  "input": {
    "route": "bridge",
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
