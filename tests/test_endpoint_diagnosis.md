# Endpoint Diagnosis Release Cases

The cases of `tests/test_endpoint_diagnosis.py`, for the requirement the SPEC gives that file as its Check: **AN UNSUPPORTED ENDPOINT SAYS SO**: "When a configured endpoint cannot be called from the browser, Agent M names the reason and the runtimes that would work instead; it does not report a generic failure." The SPEC's Check line names the file and no more, so each case below is read from that sentence and from the accepted `Diagnosis` of MOD-endpoint-calls (the reasons and the routes `ci` and `bridge`); the file's header says so.

**How a case reads.** `given` is its precondition. `input` holds `where` (`browser`: a page, where `window` exists; `node`: the Bridge or a runner), the endpoint `config` (kind, baseUrl, key, model, name), `fetch` (what the fake network does: `rejects` with a TypeError of that message, or answers `status` with `body`), and `entries`, the three calls that report a diagnosis, each run with the same fetch: `test` (testEndpoint), `models` (listModels) and `exchange` (endpointExchange, which throws EndpointFailed). `expected` names only what the case asserts, out of `reason` and `routes` of the Diagnosis, `named` (the reason is not the generic `endpoint error` and the message is not empty) and `messageHas` (the endpoint's own words are kept in the message).

## AN UNSUPPORTED ENDPOINT SAYS SO

### Cross-origin refused: the browser says the endpoint sends no permission for this origin

```json
{
  "given": "A configured endpoint of the kind openai-compatible, called from the browser, whose server sends no cross-origin permission: the browser's own message names the cross-origin refusal.",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "browser",
    "config": {
      "kind": "openai-compatible",
      "baseUrl": "https://llm.example.test/v1",
      "key": null,
      "model": "model-a",
      "name": "ep1"
    },
    "fetch": {
      "rejects": "Failed to fetch: blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource"
    }
  },
  "expected": {
    "reason": "cross-origin refused",
    "routes": [
      "ci",
      "bridge"
    ],
    "named": true
  }
}
```

### Blocked by the browser: the browser gives no more than that the call was refused

```json
{
  "given": "The same endpoint called from the browser, where the browser's only words are 'Failed to fetch' (what a browser says of a refused cross-origin call).",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "browser",
    "config": {
      "kind": "openai-compatible",
      "baseUrl": "https://llm.example.test/v1",
      "key": null,
      "model": "model-a",
      "name": "ep1"
    },
    "fetch": {
      "rejects": "Failed to fetch"
    }
  },
  "expected": {
    "reason": "blocked by the browser",
    "routes": [
      "ci",
      "bridge"
    ],
    "named": true
  }
}
```

### Opt-in header missing: the provider requires the opt-in header for calls from a browser

```json
{
  "given": "A configured endpoint of the kind anthropic, called from the browser, which refuses a call that does not carry the provider's opt-in header for direct browser access.",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "browser",
    "config": {
      "kind": "anthropic",
      "baseUrl": "https://api.anthropic.example/v1",
      "key": "sk-ant-FIXTURE",
      "model": "model-b",
      "name": "ep2"
    },
    "fetch": {
      "rejects": "Failed to fetch: the request needs the header anthropic-dangerous-direct-browser-access to be called from a browser"
    }
  },
  "expected": {
    "reason": "opt-in header missing",
    "routes": [
      "ci",
      "bridge"
    ],
    "named": true
  }
}
```

## AN UNSUPPORTED ENDPOINT SAYS SO: counter-proofs

### Counter-proof: an endpoint that answers with a refused key is named by that, and no other runtime is offered

```json
{
  "given": "The endpoint is reached from the browser and answers 401 with its own message: the obstacle is not the browser.",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "browser",
    "config": {
      "kind": "openai-compatible",
      "baseUrl": "https://llm.example.test/v1",
      "key": null,
      "model": "model-a",
      "name": "ep1"
    },
    "fetch": {
      "status": 401,
      "body": "Incorrect API key provided"
    }
  },
  "expected": {
    "reason": "key refused",
    "routes": [],
    "named": true
  }
}
```

### Counter-proof: a failure outside a browser offers no runtime

```json
{
  "given": "The same refused call made from node (the Bridge or a CI runner, where no browser stands in the way): the reason is the address, and no runtime is offered as the way round.",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "node",
    "config": {
      "kind": "openai-compatible",
      "baseUrl": "https://llm.example.test/v1",
      "key": null,
      "model": "model-a",
      "name": "ep1"
    },
    "fetch": {
      "rejects": "fetch failed: getaddrinfo ENOTFOUND llm.example.test"
    }
  },
  "expected": {
    "reason": "not reachable",
    "routes": [],
    "named": true
  }
}
```

### Counter-proof: an unknown error of the endpoint is the only generic failure

```json
{
  "given": "The endpoint is reached from the browser and answers 500 with a message the diagnosis has no name for: only then is the failure the generic one, with the endpoint's words kept.",
  "input": {
    "entries": [
      "test",
      "models",
      "exchange"
    ],
    "where": "browser",
    "config": {
      "kind": "openai-compatible",
      "baseUrl": "https://llm.example.test/v1",
      "key": null,
      "model": "model-a",
      "name": "ep1"
    },
    "fetch": {
      "status": 500,
      "body": "upstream exploded"
    }
  },
  "expected": {
    "reason": "endpoint error",
    "routes": [],
    "named": false,
    "messageHas": "upstream exploded"
  }
}
```
