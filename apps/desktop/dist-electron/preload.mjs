"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("api", {
  // Meter service
  processText: (text) => electron.ipcRenderer.invoke("meter:processText", text),
  countLine: (line) => electron.ipcRenderer.invoke("meter:countLine", line),
  // Config service
  getConfig: () => electron.ipcRenderer.invoke("config:get"),
  saveConfig: (config) => electron.ipcRenderer.invoke("config:save", config),
  // Styles service
  getAllStyles: () => electron.ipcRenderer.invoke("styles:getAll"),
  getStyleById: (id) => electron.ipcRenderer.invoke("styles:getById", id),
  createStyle: (style) => electron.ipcRenderer.invoke("styles:create", style),
  updateStyle: (id, updates) => electron.ipcRenderer.invoke("styles:update", id, updates),
  deleteStyle: (id) => electron.ipcRenderer.invoke("styles:delete", id)
});
