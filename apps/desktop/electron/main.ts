import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import meterService from './services.ts'
import db from './db.ts'
import { loadConfig, saveConfig, getSafeConfig } from './config.ts'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  // Initialize database
  db.initialize()

  createWindow()

  // Meter service handlers
  ipcMain.handle('meter:processText', async (event, text) => {
    return meterService.processText(text)
  })

  ipcMain.handle('meter:countLine', async (event, line) => {
    return meterService.countLineMetrics(line)
  })

  // Config handlers
  ipcMain.handle('config:get', async () => {
    const config = loadConfig()
    return getSafeConfig(config)
  })

  ipcMain.handle('config:save', async (event, newConfig) => {
    return saveConfig(newConfig)
  })

  // Styles handlers
  ipcMain.handle('styles:getAll', async () => {
    return db.getAll('styles')
  })

  ipcMain.handle('styles:getById', async (event, id) => {
    return db.getById('styles', id)
  })

  ipcMain.handle('styles:create', async (event, style) => {
    return db.create('styles', style)
  })

  ipcMain.handle('styles:update', async (event, id, updates) => {
    return db.update('styles', id, updates)
  })

  ipcMain.handle('styles:delete', async (event, id) => {
    return db.delete('styles', id)
  })
})
