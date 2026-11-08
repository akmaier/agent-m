// The setup of a product's GitHub Actions as the pages of settings run and show it (docs/architecture/MOD-settings-pages.md, Interfaces: the line of Agent M's job workflow
// of `settings`, and Step C of `add-product`; UC-010, Precondition; UC-001 step 5): MOD-runtimes' actionsSetup for the product, with the host the page reads it with and the
// key MOD-site-frame's tokenKeyOf gives for its token, and the sentences both pages show of it — the commit and the secrets setUp stored, never a value, and each secret this
// browser keeps no value for, which the person adds on the repository's secrets page. The one copy both pages use.
//
// Module: MOD-settings-pages

import { actionsSetup } from "../runtimes/index.mjs";
import { connect } from "../repository-hosts/index.mjs";
import { tokenKeyOf } from "../site-frame/index.mjs";

// productActionsSetup({ address: Address, host: Host, instanceHost: Host, store: Store }) -> what MOD-runtimes' actionsSetup gives for the product at `address`, read through
// `host`, its token under the key tokenKeyOf gives. Fails as actionsSetup fails.
export const productActionsSetup = ({ address, host, instanceHost, store }) =>
  actionsSetup({ product: { address: address.web, host, tokenKey: tokenKeyOf(address) }, instance: { host: instanceHost }, store });

// The repository's page of Actions secrets, where the person adds a secret this browser keeps no value for.
export const secretsPageOf = (address) => connect(address, {}).webLinks().secrets;

// What setUp did: the commit it made, or that every workflow file stands already, and the names of the secrets it stored — never a value.
export const setUpText = ({ commit, stored }) =>
  `${commit ? `Committed ${commit}.` : "Every workflow file stands already."}${stored.length ? ` Stored the secrets ${stored.join(", ")}.` : ""}`;

// The secrets this browser keeps no value for (actionsSetup's `unknown`), named; "" when there is none.
export const unknownText = (unknown) =>
  unknown.length ? `This browser keeps no value for ${unknown.join(", ")}: add ${unknown.length > 1 ? "them" : "it"} on the repository's secrets page.` : "";
