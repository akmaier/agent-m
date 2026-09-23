# Why three runtimes need more discipline than one

The Product Owner chose all three: browser, GitHub Actions, and a bridge to a local CLI session.
That is the right answer for a book companion — readers arrive with very different setups, and the
three cover the realistic cases — but it triples the surface on which the same logic can drift
apart.

**`ONE DEFINITION, THREE DRIVERS` is therefore the load-bearing rule of this section.** The
process repository has the scar that justifies it: one refusal detector existed as three
independently maintained substring lists, each of which knew formulations the other two lacked.
The measured overlap was 34 caught only by the first, 154 only by the second, 479 by both. Nobody
had duplicated it on purpose; each copy was added at a moment when reaching for the existing one
seemed awkward. The conclusion recorded there was blunt — there is exactly one implementation, and
whoever adds a formulation adds it once.

Applied here: the prompt that turns a source into requirements is a file. The browser reads it,
the workflow reads it, the bridge reads it. If that stops being true, the three runtimes will
quietly produce different requirements from the same source, and the reader will have no way to
know which one to believe.

**`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` is the rule that admits what is not known.**
Two mechanisms are involved and neither has been verified for this project:

- Model endpoints differ in whether they permit direct browser calls at all. At least one major
  provider rejects them unless an explicit opt-in header is present; others vary; self-hosted
  gateways depend on how the operator configured them.
- A page served over HTTPS calling `http://127.0.0.1` is not blocked as mixed content, because
  loopback counts as a trustworthy origin — but Chrome applies Private Network Access rules on top,
  which call for a preflight carrying `Access-Control-Request-Private-Network` and a bridge that
  answers `Access-Control-Allow-Private-Network: true`.

Both are documented behaviours. Documented is not measured, and the process repository's rule
about negative results cuts both ways: a mechanism is not confirmed until it has been exercised
against a case that must work. Writing the measurement obligation into the specification is
cheaper than discovering a wrong assumption after the UI is built on it.

**`AN UNSUPPORTED ENDPOINT SAYS SO` follows directly from the first point.** If endpoint
compatibility is genuinely uneven, then explaining the unevenness is a product feature, not error
handling. The reader who configures a provider that blocks browser calls should be told that this
provider blocks browser calls and that the Actions runtime will work — not shown a failed request.

**`THE LOCAL BRIDGE REQUIRES A TOKEN` closes a gap that loopback alone leaves open.** The process
repository's remote-access design treats the loopback bind as the protection and then adds
authentication the moment the service becomes reachable from anywhere else. The bridge is a
slightly different case: it stays on loopback, but loopback is not a boundary between programs on
one machine — any local process, and any web page the reader happens to have open, can address the
port. The token costs one line and removes the class.
