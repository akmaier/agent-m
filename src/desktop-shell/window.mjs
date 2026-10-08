// Module: MOD-desktop-shell
const target = document.querySelector("#bridge");
const render = async () => {
  const state = await window.bridge.state();
  target.replaceChildren();
  const title = document.createElement("h1"); title.textContent = "Agent M Bridge pairing";
  const address = document.createElement("code"); address.textContent = state.address;
  const token = document.createElement("code"); token.textContent = state.token;
  const copy = document.createElement("button"); copy.textContent = "Copy"; copy.onclick = () => window.bridge.copy(state.token);
  const rotate = document.createElement("button"); rotate.textContent = "Pair anew";
  rotate.onclick = async () => { if (window.confirm("Every paired browser must pair again.")) { await window.bridge.pairAnew(); render(); } };
  target.append(title, address, token, copy, rotate);
};
render();
