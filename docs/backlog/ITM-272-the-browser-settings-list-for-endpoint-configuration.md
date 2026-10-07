---
id: ITM-272
title: The browser settings list for endpoint configuration
level: module
realises:
  - UC-003
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
modules:
  - MOD-browser-store
builds_on:
  - ITM-259
tests:
  - unit
origin:
  - UC-003
---
# ITM-272 The browser settings list for endpoint configuration

**REGISTER**

## Outcome

Implement the accepted MOD-browser-store.listSettings(store) -> SettingInfo[] for the catalogue already implemented
by ITM-204 and ITM-259, so Settings can discover named endpoints through the public interface. Return each implemented
literal setting, set or not, and the stored instances of implemented key families, with the accepted SettingInfo fields:
key, label, secret, grants, setUpIn, expires and lastTest. Metadata describes the setting; it never includes a stored
secret value. Read expiry and last-test metadata in their accepted formats, using null when absent. Endpoint setup
points to the endpoints route, with the nonsecret key identifying the setting. Enumerating this module's own instance
storage is its responsibility, not the caller's. Do not add catalogue families, export/import, clearEverything,
expiringSoon, secretValues or mailbox sign-in behaviour that has not been implemented. No setting is written or cleared
by listing. This item completes only this accepted interface over the implemented catalogue, not the whole module.

## Acceptance

- New unit tests through the public listSettings interface cover implemented literal settings set and unset, stored
  endpoint names and other implemented dynamic keys, and every accepted SettingInfo field. Unknown storage entries
  are not listed as settings; another instance's entries do not appear.
- Two differently named endpoints survive reopening the store and are discoverable without caller knowledge of their
  names. Their metadata enables Settings Test/Change/Clear via the endpoint name and contains no endpoint credential.
  Listing after clear no longer includes the removed dynamic endpoint. No fixed default name substitutes for discovery.
- Secret metadata identifies secret settings and what they grant without returning their token/key or configuration
  value. Recorded expiry and last-test information are returned; absent metadata is null. Listing changes no storage,
  cookie, URL or repository and performs no network request.
- Only src/browser-store/ and new tests naming MOD-browser-store change. Existing store tests and expected results
  remain unchanged; settings-page implementation and unowned migration files are outside this item.
- First commit contains only tests and has actual red CI before implementation. Final-head CI is green; every new
  test names its unique TST identifier, guarded requirement/use case, module, unit level, precondition, input and
  expected result and records its actual planted-fault failure followed by restoration. No paid service is called.
