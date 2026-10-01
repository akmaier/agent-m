// Shows the status of every file.
//
// Module: MOD-view

export const showStatus = (files) => files.map((f) => `<li>${f}</li>`).join("");
