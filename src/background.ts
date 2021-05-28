/* eslint @typescript-eslint/no-var-requires: "off" */
'use strict'
import { app, protocol, screen, ipcMain, globalShortcut, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as os from 'os'
import IpcRegister from './api/IpcRegister'
import fs from "fs"
import path from 'path'
const { setVibrancy } = require('electron-acrylic-window')
const storage = require('electron-json-storage')
const defaultDataPath = storage.getDefaultDataPath()
storage.setDataPath(defaultDataPath + '/config')
const dataPath = storage.getDataPath();
//const unhandled = require('electron-unhandled');
import DiscordRPC from 'discord-rpc'
import { autoUpdater } from "electron-updater"
// unhandled();


const isDevelopment = process.env.NODE_ENV !== 'production'
const isWindows10 = process.platform === 'win32' && os.release().split('.')[0] === '10'
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const singleInstance = app.requestSingleInstanceLock()
let win: BrowserWindow
let winSettings: BrowserWindow
let tray
const iconTray = nativeImage.createFromPath(path.join(__dirname, '/img/tray.png'))
let vibrancyOp

initParams()

async function createWindow () {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  if (isWindows10) {
    vibrancyOp = {
      theme: '#8034495E',
      effect: 'acrylic',
      useCustomWindowRefreshMethod: false,
      disableOnBlur: true,
      debug: false
    }
  } else vibrancyOp = 'dark'

  win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    hasShadow: false,
    show: false,
    alwaysOnTop: true,
    fullscreen: true,
    useContentSize: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      enableRemoteModule: true,
      webSecurity: false
    }
  })

  setVibrancy(win, vibrancyOp)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools({ mode: 'detach' })
  } else {
    createProtocol('app')
    // Load the index.html when not in development

    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }

  const ipcRegister = new IpcRegister(ipcMain)
  ipcRegister.registerOn()

  win.on('blur', () => {
    win.hide()
  })

  ipcMain.on('close', () => {
    win.hide()
  })

  ipcMain.on('reloadMainWindow', () => {
    globalShortcut.unregisterAll()
    win.reload()
    createShortcut()
  })
  ipcMain.on('openSettings', () => {
    winSettings.show()
  })
  
  

  return win
}

function createWindowSettings () {
  const settingsPath = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/#settings' : `file://${__dirname}/index.html#settings`

  winSettings = new BrowserWindow({
    width: 1000,
    height: 700,
    transparent: false,
    hasShadow: true,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  winSettings.loadURL(settingsPath)

  ipcMain.on('closeSettings', () => {
    console.log('close clicked')
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) }) 
    app.exit(0)
  })

  return winSettings
}

function initParams() {
  const InitOptions = { parameters: { trigger: "Ctrl+G", nickname: "Non renseigner", autostart: true }}
  const jsonString = JSON.stringify(InitOptions)
  fs.writeFile(dataPath + '\\preferences.json', jsonString,{ flag: 'wx' }, (err) => {
      if (err) {
        console.log('Le fichier preferences existe déjà')
        return 
      };
      console.log("ok!");
  });  
}

function setAutoStart() {
  storage.get('preferences', function (error, settings) {
    if (error) throw error
    let autostart = settings.parameters.autostart
    app.setLoginItemSettings({
      name:"Dash",
      openAtLogin: autostart
    })
  })
}
function createShortcut () {
  storage.get('preferences', function (error, settings) {
    if (error) throw error
    let shortcut = settings.parameters.trigger
    globalShortcut.register(shortcut, () => {
      if (win.isVisible()) {
        win.hide()
        console.log('pressed and hide')
      } else {
        win.show()
        win.focus()
        console.log('pressed and open')
      }
    })
    console.log(shortcut)
  })
}

if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    win.show()
    win.focus()
  })

  // Create windows, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindowSettings()
    setAutoStart()
    createShortcut()
    tray = new Tray(iconTray.resize({ width: 32, height: 32 }))
    const contextMenu = Menu.buildFromTemplate([
      { label: "Ouvrir l'application", click () { win.show() } },
      { label: 'Options', click () { winSettings.show() } },
      { label: 'Quitter', click () { app.quit() } }
    ])
    tray.setContextMenu(contextMenu)
  }).then(createWindow)
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// Set this to your Client ID.
const clientId = '847459425585201182';

function updateStatusMessage() {
  if(win.isVisible()) {
    const data = { play : "inopen", message : "Ah, il veut jouer ?"}
    return data
  } else {
    const data = { play : "notPlaying", message : "Dans aucun jeu. lol"}
    return data
  }
}

DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

async function setActivity() {
  if (!rpc || !win) {
    return;
  }
  const StatusLol = await updateStatusMessage()
  rpc.setActivity({
    state: StatusLol.message,
    largeImageKey: 'dashou',
    largeImageText: 'Dash - Launcher',
    smallImageKey: StatusLol.play,
    instance: false,
  });
}

rpc.on('ready', () => {
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 2000);
});

rpc.login({ clientId }).catch(console.error);
