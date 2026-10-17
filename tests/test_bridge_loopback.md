# Bridge Loopback Release Cases

## Loopback address 127.0.0.1 is accepted

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host 127.0.0.1.",
  "input": { "host": "127.0.0.1" },
  "expected": { "outcome": "started", "addressIsLoopback": true, "answersPairWithToken": true }
}
```

## Loopback address ::1 is accepted

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host ::1.",
  "input": { "host": "::1" },
  "expected": { "outcome": "started", "addressIsLoopback": true, "answersPairWithToken": true }
}
```

## The name localhost is accepted

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host localhost.",
  "input": { "host": "localhost" },
  "expected": { "outcome": "started", "addressIsLoopback": true, "answersPairWithToken": true }
}
```

## The wildcard address 0.0.0.0 is refused

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host 0.0.0.0, which listens on every interface.",
  "input": { "host": "0.0.0.0" },
  "expected": { "outcome": "BindRefused" }
}
```

## The empty host is refused

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and an empty host, which the system would bind on every interface.",
  "input": { "host": "" },
  "expected": { "outcome": "BindRefused" }
}
```

## A non-loopback address is refused

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host 192.168.1.20, an address of a local network.",
  "input": { "host": "192.168.1.20" },
  "expected": { "outcome": "BindRefused" }
}
```

## The IPv6 wildcard :: is refused

### Case

```json
{
  "given": "A temporary data folder, a port the system picks, and the host ::, which listens on every interface.",
  "input": { "host": "::" },
  "expected": { "outcome": "BindRefused" }
}
```
