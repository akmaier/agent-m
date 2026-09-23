## 6. Runtimes

**ONE DEFINITION, THREE DRIVERS** *(PO A. Maier, 2026-09-23)*
The prompts, schemas and stage definitions exist exactly once, as data in the repository; the
browser, the GitHub Actions workflow and the local bridge are drivers over that one definition.
*Occasion:* three independently maintained copies of one rule were the root cause of an entire
measurement complex in the process repository — each copy knew phrases the others lacked, and
nobody could say which was right. Three runtimes make that failure three times as likely.
*Check:* `tests/test_single_definition.py` — no prompt or schema text appears in more than one
place.

**A RUNTIME IS INTERCHANGEABLE** *(PO A. Maier, 2026-09-23)*
The same stage, given the same inputs, produces the same kind of artifact in all three runtimes.
*Occasion:* if runtimes differ in what they produce, the choice of runtime becomes a hidden
product decision and a reader cannot move between them.
*Check:* `tests/test_runtime_parity.py`

**THE LOCAL BRIDGE BINDS CAN BE TUNNELED OR FORWARDED TO ALLOW REMOTE WORK ** 
The local bridge accepts a bind address of `127.0.0.1`, `::1` or `localhost`. In order to allow remote 
access, safe tunnels, e.g. via ssh are possible.
*Occasion:* the bridge hands work to a CLI session that is already authenticated on the machine.
Its protection is the loopback bind; a tool that can be started on a LAN address has none. Tunnels
can provide a safe alternative.
*Check:* `tests/test_bridge_loopback.py`

**THE LOCAL BRIDGE REQUIRES A TOKEN** 
The bridge rejects any request that does not carry the session token it printed at startup.
*Occasion:* loopback is not a permission boundary between programs on the same machine. Any local
process, including a page from an unrelated site, can reach a loopback port.
*Check:* `tests/test_bridge_token.py`

**AN UNSUPPORTED ENDPOINT SAYS SO** *(PO A. Maier, 2026-09-23)*
When a configured endpoint cannot be called from the browser, Agent M names the reason and the
runtimes that would work instead; it does not report a generic failure.
*Occasion:* browser access to model endpoints is not uniform — some providers reject cross-origin
calls outright, others require an explicit opt-in header, and self-hosted gateways depend on local
configuration. A reader facing an opaque error will conclude the tool is broken.
*Check:* `tests/test_endpoint_diagnosis.py`

**BROWSER REACHABILITY IS MEASURED, NOT ASSUMED** *(PO A. Maier, 2026-09-23)*
Before a runtime is released, the browser behaviour it depends on is measured on current browsers
and the result is recorded in `docs/measurements/`.
*Occasion:* the two mechanisms this design rests on — cross-origin calls to model endpoints, and
Private Network Access preflights or SSH for the local bridge — are documented and neither is
verified here. A design built on an unverified mechanism fails late and expensively.
*Check:* `tests/test_measurement_present.py` — a released runtime has a dated measurement file.
