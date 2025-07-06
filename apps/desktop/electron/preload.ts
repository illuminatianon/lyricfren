import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

contextBridge.exposeInMainWorld('api', {
  // Meter service
  processText: (text) => ipcRenderer.invoke('meter:processText', text),
  countLine: (line) => ipcRenderer.invoke('meter:countLine', line),

  // Config service
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),

  // Styles service
  getAllStyles: () => ipcRenderer.invoke('styles:getAll'),
  getStyleById: (id) => ipcRenderer.invoke('styles:getById', id),
  createStyle: (style) => ipcRenderer.invoke('styles:create', style),
  updateStyle: (id, updates) => ipcRenderer.invoke('styles:update', id, updates),
  deleteStyle: (id) => ipcRenderer.invoke('styles:delete', id),
})
