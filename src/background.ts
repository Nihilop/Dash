'use strict'
import { app, protocol, screen, ipcMain, globalShortcut, Menu, Tray, BrowserWindow, nativeImage } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as os from 'os'
import IpcRegister from './api/IpcRegister'
import fs from 'fs'
import path from 'path'
import DiscordRPC from 'discord-rpc'
import settings from 'electron-settings';
const unhandled = require('electron-unhandled');
const { ProcessListen, getWindows } = require('active-window-listener')
const log = require('electron-log')
const { setVibrancy } = require('electron-acrylic-window')
const { autoUpdater } = require('electron-updater')


log.transports.console.useStyles = true
const isDevelopment = process.env.NODE_ENV !== 'production'
const isWindows10 = process.platform === 'win32' && os.release().split('.')[0] === '10'
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const singleInstance = app.requestSingleInstanceLock()
let win: BrowserWindow
let winSettings: BrowserWindow
let splash: BrowserWindow
let tray
const iconTray = nativeImage.createFromPath(path.join(__dirname, '/img/tray.png'))
let vibrancyOp
let userStatus = 'online'
let iconStatus
init()

async function init() {
  if(settings.file()) {
    log.warn('Tout semble être ok')
  } else {
    await settings.set('parameters', {
      name: 'NA',
      trigger: 'CTRL+G',
      autostart: true
    });
  }
  log.error(settings.file())
}

if (isDevelopment) {
  unhandled();
  iconStatus = {
    online: path.join(__dirname, '../public/img/status/online.png'),
    busy: path.join(__dirname, '../public/img/status/busy.png'),
    afk: path.join(__dirname, '../public/img/status/afk.png'),
    offline: path.join(__dirname, '../public/img/status/offline.png')
  }
} else {
  iconStatus = {
    online: path.join(__dirname, '/img/status/online.png'),
    busy: path.join(__dirname, '/img/status/busy.png'),
    afk: path.join(__dirname, '/img/status/afk.png'),
    offline: path.join(__dirname, '/img/status/offline.png')
  }
}

function sendStatusToWindow (text) {
  log.info(text)
  splash.webContents.send('message', text)
}
function sendSpeedDownload (text) {
  log.info(text)
  splash.webContents.send('speed', text)
}
function sendPercentageDownload (text) {
  log.info(text)
  splash.webContents.send('percentage', text)
}

function createSplashWindow () {
  splash = new BrowserWindow({
    width: 350,
    height: 500,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  
  const splashScreen = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/#updater' : `file://${__dirname}/index.html#updater`
  createProtocol('app')
  splash.loadURL(splashScreen)
  splash.focus()
  ipcMain.on('cancelUpdate', () => {
    splash.close()
    createWindow()
  })
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() })
  })

  return splash
}
function createWindowSettings () {
  const settingsPath = process.env.NODE_ENV === 'development' ? 'http://localhost:8080/#settings' : `file://${__dirname}/index.html#settings`

  winSettings = new BrowserWindow({
    width: 1000,
    height: 700,
    transparent: false,
    hasShadow: true,
    frame: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  winSettings.loadURL(settingsPath)

  ipcMain.on('closeSettings', () => {
    console.log('close clicked')
    winSettings.close()
    setAutoStart()
    createShortcut()
    //app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) }) 
    //app.exit(0)
  })

  return winSettings
}
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
      webSecurity: false,
      contextIsolation: false,
    }
  })
  setVibrancy(win, vibrancyOp)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools({ mode: 'detach' })
  } else {
    // Load the index.html when not in development
    
    win.loadURL('app://./index.html')
  }

  setAutoStart()
  createShortcut()
  
  win.on('blur', () => {
    win.hide()
  })
  ipcMain.on('openSettings', () => {
    createWindowSettings()
  })
  ipcMain.on('close', () => {
    win.hide()
  })
  ipcMain.on('openLauncherWhenSelected', () => {
    win.show()
  })
  
  return win
}


async function setAutoStart () {
  const autostart = await settings.get('parameters.autostart')
  try {
    app.setLoginItemSettings({
      name: 'Dash - Launcher',
      openAtLogin: JSON.parse(JSON.stringify(autostart))
    })
  } catch(err) {
    console.log(err)
  }
}
async function createShortcut () {
  globalShortcut.unregisterAll()
  const shortcut = await settings.get('parameters.trigger')
  console.log(shortcut)
  globalShortcut.register(JSON.parse(JSON.stringify(shortcut)), () => {
    if (win.isVisible()) {
      win.hide()
      console.log('pressed and hide')
    } else {
      win.show()
      win.focus()
      console.log('pressed and open')
    }
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
    createSplashWindow()
    
    connectDiscord()
    const ipcRegister = new IpcRegister(ipcMain)
    ipcRegister.registerOn()

    tray = new Tray(iconTray.resize({ width: 32, height: 32 }))
    const contextMenu = Menu.buildFromTemplate([
      { label: 'En ligne', click () { userStatus = 'online' }, icon: iconStatus.online },
      { label: 'Ne pas déranger', click () { userStatus = 'busy' }, icon: iconStatus.busy },
      { label: 'Inactif', click () { userStatus = 'afk' }, icon: iconStatus.afk },
      { label: 'Hors ligne', click () { userStatus = 'offline' }, icon: iconStatus.offline },
      { type: 'separator' },
      { label: "Ouvrir l'application", click () { win.show() } },
      { label: 'Options', click () { createWindowSettings() } },
      { label: 'Quitter', click () { app.quit() } }
    ])
    tray.on('double-click', function () {
      win.show()
    })
    tray.setContextMenu(contextMenu)
  }).then(() => {
    if (splash.isVisible()) {
      setTimeout(() => {
        if(isDevelopment){
          autoUpdater.checkForUpdates()
        } else {
          autoUpdater.checkForUpdatesAndNotify()
        }
      }, 3000)

      autoUpdater.on('checking-for-update', () => {
        sendStatusToWindow('Chargement...')
      }).on('update-available', (info) => {
        
        sendStatusToWindow('Mise à jour trouvée.')
        setTimeout(() => {
          sendStatusToWindow('Analyse des données.')
          splash.webContents.send('updateFound', true)
        }, 1000)
      }).on('update-not-available', (info) => {
        sendStatusToWindow('Préparez-vous au lancement !')
        createWindow()
        
        setTimeout(() => {
          splash.close()
        }, 1000)
      }).on('error', (err) => {
        sendStatusToWindow(err)
        splash.webContents.send('UpdaterError', true)
        // setTimeout(() => {
        //   splash.close()
        // }, 2000)
      }).on('download-progress', (progressObj) => {
        let log_message = 'Download speed: ' + progressObj.bytesPerSecond
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
        log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
        sendStatusToWindow('Téléchargement en cours...')
        sendSpeedDownload(progressObj.bytesPerSecond)
        sendPercentageDownload(progressObj.percent)
      }).on('update-downloaded', (info) => {
        console.log('Téléchargement terminé')
        sendStatusToWindow('Téléchargement terminé')
        setTimeout(() => {
          sendStatusToWindow("L'application redémarrera tout seul.")
          setTimeout(() => {
            autoUpdater.quitAndInstall(true, true)
          }, 2000)
        }, 1000)
        splash.webContents.send('downloadFinish', true)
      })
    }
  })
}

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  disconnectDiscord()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

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

const clientId = '847459425585201182'
const scopes = ['rpc']
let discordTimer
let discordConnextionTimer
let rpc = null
let gameName_
let tryToConnect = 0
DiscordRPC.register(clientId)

function connectDiscord () {
  if (!rpc || rpc === null) rpc = new DiscordRPC.Client({ transport: 'ipc' })
  rpc.login({ clientId }).catch((error: string) => {
    console.error(error)
    console.debug('[RPC] Error: Make sure Discord client is available and you are connected to the Internet')
    rpc = null
    if (tryToConnect <= 5) {
      clearInterval(discordConnextionTimer)
    }
    discordConnextionTimer = setInterval(() => {
      tryToConnect++
      connectDiscord()
    }, 15e3)
  })
  rpc.on('ready', () => {
    console.debug('Discord Client ready')
    clearInterval(discordConnextionTimer)
    setActivity()
    discordTimer = setInterval(() => {
      setActivity().catch((e: string) => console.error(`Failed to update Discord status. ${e}`))
    }, 5e3)
  })
}

function disconnectDiscord () {
  rpc.clearActivity()
  clearInterval(discordTimer)
  rpc.destroy()
  rpc = null
}

// Get current window active
let gameList_
let Statusdatas
let processID;

ipcMain.on('myGameList', (event, arg) => {
  gameList_ = arg
  const listener = new ProcessListen(JSON.parse(gameList_))
  log.error(listener)
  listener.changed(data => {
    console.log("Active: ", data)
    return processID = data
  })
})
  

async function updateStatusMessage () {

  //log.warn(processID)
  let appStatus = 'none'
  if (userStatus === 'online') {
    appStatus = 'playing'
  } else if (userStatus === 'busy') {
    appStatus = 'playingbusy'
  } else if (userStatus === 'afk') {
    appStatus = 'playingafk'
  } else {
    appStatus = 'none'
  }
  

    


  log.info(`%c${processID}`,'color: green')

  if(processID && processID.path.includes(gameName_)) {
    const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('\\') + 1)
    const name = getLastItem(processID.path)
    let GName = name.substring(0, name.length - 4);
    
    Statusdatas = { play : appStatus, message : `Joue à : ${GName}`, game: true}
  } else if(win.isVisible()) {
    Statusdatas = { play : "idle", message : "Ah, il veut jouer ?", game: false}
  } else if (processID && processID.path.includes("Code.exe")) {
    Statusdatas = { play : "coding", message : "Entrain de coder, bruh", game: false}
  } else {
    Statusdatas = { play : "none", message : `Joue a la Licorne`, game: false}
  }




  return Statusdatas
}

let startTimestamp

ipcMain.on('game_launch', function (event, data) {
  console.log('Game ' + data + ' launched')
  startTimestamp = new Date();
  gameName_ = data
  updateStatusMessage()
})

async function setActivity () {
  if (!rpc || !win || rpc === null) {
    return
  }
  const StatusLol = await updateStatusMessage()
  log.error(StatusLol)
  if(StatusLol.game) {
    log.warn(startTimestamp)
    rpc.setActivity({
      details: StatusLol.message,
      startTimestamp,
      largeImageKey: 'dashou',
      largeImageText: 'Dash - Launcher',
      smallImageKey: StatusLol.play,
      instance: false
    })
  } else {
    rpc.setActivity({
      details: StatusLol.message,
      largeImageKey: 'dashou',
      largeImageText: 'Dash - Launcher',
      smallImageKey: StatusLol.play,
      instance: false
    })
  }

}
