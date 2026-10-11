// A mailbox's route and its connection (ITM-423) — MOD-mail-routes' routeFor and providerLinks, as the accepted text of
// docs/architecture/MOD-mail-routes.md states them: routeFor "asks Microsoft's sign-in service, the provider's one origin the page
// names, whether the address's domain belongs to a Microsoft 365 organisation; a domain of a known provider presets the IMAP route
// with its servers from providers.json. Crosses the network; when Microsoft's service cannot be reached, it answers the IMAP route
// with the reason"; providerLinks "the addresses of Microsoft's page for registering the app (UC-037) and of its page on which the
// app's access is withdrawn". For UC-037 steps 1, 2 and 4.1 and the alternative flow 8a.
// Run: node --test tests/mail-routes-route.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-037; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// Level: unit
//
// Microsoft's sign-in service is a fake `fetch` of the tests' own, which records every request: it answers as the service does for a
// tenant (200 with its configuration, 400 `invalid_tenant` for a domain that has none), and fails as a network does. The module
// file does not say which address of the service it asks, in what shape `servers` stands, or what the reason says: this file
// reads the service's public tenant lookup `https://login.microsoftonline.com/<domain>/v2.0/.well-known/openid-configuration`, the
// servers as the connection's `imap` and `smtp` parts (`{ host, port, security }`), and a reason that names the domain or the
// failure. Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect).
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { routeFor, providerLinks } = mailRoutes;

const SERVICE = "https://login.microsoftonline.com";
const lookupOf = (domain) => `${SERVICE}/${domain}/v2.0/.well-known/openid-configuration`;
const GMAIL = { imap: { host: "imap.gmail.com", port: 993, security: "tls" }, smtp: { host: "smtp.gmail.com", port: 587, security: "starttls" } };

// The fake service. tenants: the domains that belong to a Microsoft 365 organisation. broken: what a request fails with instead of an
// answer — an Error, or a status number the service answers with. Every request is recorded.
function fakeService({ tenants = [], broken = null } = {}) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), init });
    if (broken instanceof Error) throw broken;
    if (typeof broken === "number") return new Response("{}", { status: broken });
    const domain = String(address).slice(SERVICE.length + 1).split("/")[0];
    return tenants.includes(domain)
      ? new Response(JSON.stringify({ issuer: `${SERVICE}/tenant-of-${domain}/v2.0` }), { status: 200 })
      : new Response(JSON.stringify({ error: "invalid_tenant", error_description: `AADSTS90002: Tenant '${domain}' not found.` }), { status: 400 });
  };
  return requests;
}

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: Microsoft's service, which knows the domain contoso.example as a Microsoft 365 organisation
// input: routeFor("reports@contoso.example")
// expect: the route "graph", no servers, a reason that names the domain; one request, to the service's lookup of contoso.example
test("routeFor — a Microsoft 365 address is answered with the Microsoft route", async () => {
  assert.ok(routeFor, `routeFor: ${mailRoutes.error?.message}`);
  const requests = fakeService({ tenants: ["contoso.example"] });
  const answer = await routeFor("reports@contoso.example");
  assert.equal(answer.route, "graph");
  assert.equal(answer.servers, null);
  assert.match(answer.reason, /contoso\.example/);
  assert.deepEqual(requests.map((request) => request.address), [lookupOf("contoso.example")]);
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: Microsoft's service, which answers for gmail.com as it does for a domain it holds a tenant for (it does: Gmail's domain is
//        no Microsoft 365 organisation, and a lookup of it still answers)
// input: routeFor("someone@gmail.com")
// expect: the route "imap" with Gmail's servers — imap.gmail.com 993 with TLS, smtp.gmail.com 587 with STARTTLS —, a reason that names Gmail
test("routeFor — a Gmail address is answered with the IMAP route and Gmail's servers", async () => {
  assert.ok(routeFor, `routeFor: ${mailRoutes.error?.message}`);
  fakeService({ tenants: ["gmail.com"] });
  const answer = await routeFor("someone@gmail.com");
  assert.equal(answer.route, "imap");
  assert.deepEqual(answer.servers, GMAIL);
  assert.match(answer.reason, /Gmail/);
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: Microsoft's service, which knows no tenant for the domain mail.example.org
// input: routeFor("reports@Mail.Example.org") — the domain in capitals, as a person may type it
// expect: the route "imap" with no servers and a reason that names the domain; one request, for the domain in lower case
test("routeFor — another domain is answered with the IMAP route and no servers", async () => {
  assert.ok(routeFor, `routeFor: ${mailRoutes.error?.message}`);
  const requests = fakeService({ tenants: ["contoso.example"] });
  const answer = await routeFor("reports@Mail.Example.org");
  assert.equal(answer.route, "imap");
  assert.equal(answer.servers, null);
  assert.match(answer.reason, /mail\.example\.org/);
  assert.deepEqual(requests.map((request) => request.address), [lookupOf("mail.example.org")]);
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: Microsoft's service cannot be reached — once the network fails, once the service answers 503
// input: routeFor("reports@contoso.example") for each
// expect: the route "imap", no servers, and a reason that says Microsoft's service could not be reached and what failed ("offline" /
//         503); nothing thrown, so that the person may change the route
test("routeFor — an unreachable service is answered with the IMAP route and the reason", async () => {
  assert.ok(routeFor, `routeFor: ${mailRoutes.error?.message}`);
  fakeService({ broken: new TypeError("offline") });
  const offline = await routeFor("reports@contoso.example");
  assert.equal(offline.route, "imap");
  assert.equal(offline.servers, null);
  assert.match(offline.reason, /could not be reached/);
  assert.match(offline.reason, /offline/);
  fakeService({ broken: 503 });
  const refused = await routeFor("reports@contoso.example");
  assert.equal(refused.route, "imap");
  assert.match(refused.reason, /could not be reached/);
  assert.match(refused.reason, /503/);
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: —
// input: providerLinks()
// expect: the address of Microsoft's page for registering an app (Microsoft Entra) and that of the page on which a person reviews and
//         removes the applications that have access to their data (My Apps); no request
test("providerLinks — the addresses of Microsoft's pages for registering the app and for withdrawing its access", () => {
  assert.ok(providerLinks, `providerLinks: ${mailRoutes.error?.message}`);
  const requests = fakeService();
  assert.deepEqual(providerLinks(), { appRegistration: "https://entra.microsoft.com", accessWithdrawal: "https://myapps.microsoft.com" });
  assert.equal(requests.length, 0, "no request");
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-037
// given: the fake service; a Microsoft 365 address, a Gmail address, another domain, an unreachable service, and a text that is no address
// input: routeFor of each; providerLinks()
// expect: every request goes to Microsoft's sign-in service, at most one for each address, none with credentials or a body; a text that is no
//         address is refused with a TypeError and asks nothing
test("routeFor — no request but the one to Microsoft's service", async () => {
  assert.ok(routeFor, `routeFor: ${mailRoutes.error?.message}`);
  for (const [address, options] of [["a@contoso.example", { tenants: ["contoso.example"] }], ["a@gmail.com", {}], ["a@mail.example.org", {}],
    ["a@contoso.example", { broken: new TypeError("offline") }]]) {
    const requests = fakeService(options);
    await routeFor(address);
    assert.ok(requests.length <= 1, `${address}: at most one request`);
    for (const request of requests) {
      assert.equal(new URL(request.address).origin, SERVICE, "to Microsoft's sign-in service");
      assert.ok(!request.init.body && !request.init.headers?.Authorization && request.init.credentials !== "include", "no body, no credentials");
    }
  }
  const requests = fakeService();
  await assert.rejects(routeFor("not an address"), TypeError);
  assert.equal(requests.length, 0, "nothing asked for a text that is no address");
});
