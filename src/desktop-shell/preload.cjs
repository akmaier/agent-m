const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("bridge", { state: () => ipcRenderer.invoke("bridge-state"), copy: (text) => ipcRenderer.invoke("copy", text), pairAnew: () => ipcRenderer.invoke("pair-anew") });
