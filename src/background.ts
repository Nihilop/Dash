'use strict'
import { app, protocol, screen, ipcMain, globalShortcut, Menu, Tray, BrowserWindow, nativeImage, ipcRenderer } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as os from 'os'
import IpcRegister from './api/IpcRegister'
import path from 'path'
import { DiscordHandler } from './utils/discord'
import settings from 'electron-settings';
import {sendStatusToWindow, sendSpeedDownload, sendPercentageDownload} from './utils/updateSender'
const unhandled = require('electron-unhandled');
const log = require('electron-log')
const { setVibrancy } = require('electron-acrylic-window')
const acrylicWindow = require('electron-acrylic-window').BrowserWindow
const { autoUpdater } = require('electron-updater')

log.transports.console.useStyles = true
const isDevelopment = process.env.NODE_ENV !== 'production'
const isWindows10 = process.platform === 'win32' && os.release().split('.')[0] === '10'
protocol.registerSchemesAsPrivileged([ { scheme: 'app', privileges: { secure: true, standard: true } } ])

const singleInstance = app.requestSingleInstanceLock()
let win: BrowserWindow
let winSettings: BrowserWindow
let splash: BrowserWindow
let tray
const iconTray = nativeImage.createFromPath(path.join(__dirname, '/img/tray.png'))
let theme
let userStatus = 'online'
let iconStatus
iconStatus = {
  online: path.join(__dirname, '/img/status/online.png'),
  busy: path.join(__dirname, '/img/status/busy.png'),
  afk: path.join(__dirname, '/img/status/afk.png'),
  offline: path.join(__dirname, '/img/status/offline.png')
}

init()

async function init() {
  settings.configure({prettify: true});
  
  if(settings.file()) {
    log.warn(`%cRacine des options: %c${settings.file()} / OK`,'color: green', 'color:magenta')
    // await settings.set('parameters', {
    //   name: 'NA',
    //   trigger: 'CTRL+G',
    //   autostart: true,
    //   userStatus: 'Online',
    //   customStatus: "Je suis une licorne !",
    //   refreshStatusTime: { time: 5e3, value: "5s, Ok normal" },
    //   theme_selected: 'dark',
    //   boxed: false
    // });
  } else {
    await settings.set('parameters', {
      name: 'NA',
      trigger: 'Ctrl+G',
      autostart: true,
      userStatus: 'Online',
      customStatus: "Je suis une licorne !",
      refreshStatusTime: { time: 5e3, value: "5s, Ok normal" },
      boxed: true,
      windows_color: '#202425E6'
    });
  }
}

// acrylic / blur

// ------------------------------------------------------
// à delete soon soon
if (isDevelopment) {
  unhandled();
  iconStatus = {
    online: path.join(__dirname, '../public/img/status/online.png'),
    busy: path.join(__dirname, '../public/img/status/busy.png'),
    afk: path.join(__dirname, '../public/img/status/afk.png'),
    offline: path.join(__dirname, '../public/img/status/offline.png')
  }
} 
// ------------------------------------------------------



function createSplashWindow () {
  splash = new BrowserWindow({
    width: 350,
    height: 500,
    frame: false,
    hasShadow: true,
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
    createTray()
  })
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() })
  })

  return splash
}

function createTray() {
  createWindow()
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
  })
  ipcMain.on('saveSettings', (event, arg) => {
    console.log('save clicked')
    winSettings.close()
    setVibrancy(win, arg)
    setAutoStart()
    createShortcut()
    win.reload()
    //app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) }) 
    //app.exit(0)
  })
  ipcMain.on('saveSettingsWithReboot', (event, arg) => {
    console.log('save clicked')
    
    setVibrancy(win, arg)
    setAutoStart()
    createShortcut()
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) }) 
    app.exit(0)
  })
  return winSettings
}
async function createWindow () {
  // Create the browser window.
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const getBoxed = await settings.get('parameters.boxed')


  if(isWindows10) {
    theme = {
      theme: await settings.get('parameters.windows_color') || '#202425E6',
      effect: 'acrylic',
      useCustomWindowRefreshMethod: true,
      disableOnBlur: true,
      debug: true 
    }
  } else {
    theme = 'light'
  }

  win = new acrylicWindow({
    frame: false,
    hasShadow: true,
    show: false,
    alwaysOnTop: true,
    fullscreen: getBoxed ? false : true,
    transparent: getBoxed ? false : true,
    useContentSize: true,
    skipTaskbar: true,
    resizable: false,
    thickFrame: false,
    vibrancy:theme,
    webPreferences: {
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false,
    }
  })


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

  // Ajouter des conditions d'ouverture pour prevent les bug sur l'axe X ?
  if(getBoxed) {
    win.setBounds({width: width / 1.2, height: height - 200 })
    const winSize = win.getSize()
    let calculSpace = Math.round(width - winSize[0])  / 2
    
    win.setPosition(calculSpace, +winSize[1] - 100)
  
    win.on('hide', () => {
      setTimeout(() => {
        win.setPosition(calculSpace, +winSize[1] - 100)
      },200)
      
    })
    win.on('show', () => {
      const winSize = win.getSize()
      const winPos = win.getPosition()
      log.warn(winSize, winPos)
      animate(winPos[1], 190, (offsetY) => {
        win.setPosition(winPos[0], offsetY)
      })
    })
  } else {
    const winSize = win.getSize()
    win.setPosition(0, -winSize[1] + (winSize[1] - 200))
  
    win.on('hide', () => {
      setTimeout(() => {
        win.setPosition(0, -winSize[1] + (winSize[1] - 200))
      },200)
      
    })
    win.on('show', () => {
      const winSize = win.getSize()
      const winPos = win.getPosition()
      log.warn(winSize, winPos)
      animate(winPos[1], 0, (offsetY) => {
        win.setPosition(winPos[0], offsetY)
      })
    })

  }
  

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

function animate (start, end, fn) {
  // console.time('animate')
  return new Promise((resolve, reject) => {
    let timer 
    let offset = end - start
    let t = 0
    let maxT = 500 / 10
    timer = setInterval(() => {
      t++
      if (t >= maxT) {
        clearInterval(timer)
        resolve(timer)
      }
      let offsetY = parseInt(cubicEaseOut(t, start, offset, maxT))
      /* eslint-disable no-compare-neg-zero */
      if (offsetY === -0) {
        offsetY = 0
      }
      fn && fn(offsetY)
    }, 10)
  })
}

function cubicEaseOut (t, b, c, d) {
  return -c * ((t = t / d - 1) * t * t * t - 1) + b
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
    new DiscordHandler()
    //ipcRenderer.send('appVersion', app.getVersion())
    const ipcRegister = new IpcRegister(ipcMain)
    ipcRegister.registerOn()

    
  }).then(() => {
    if (splash.isVisible()) {
      setTimeout(() => {
        // Check la différence entre checkForUpdates & AndNotify (Apparemment, AndNotify throw a notification windows)
        if(isDevelopment){ autoUpdater.checkForUpdates() } 
        else { autoUpdater.checkForUpdatesAndNotify() }
      }, 3000)
      autoUpdater.on('checking-for-update', () => {
        sendStatusToWindow(splash, 'Chargement...')
      }).on('update-available', (info) => {
        sendStatusToWindow(splash, 'Mise à jour trouvée.')
        setTimeout(() => {
          sendStatusToWindow(splash, 'Analyse des données.')
          splash.webContents.send('updateFound', true)
        }, 1000)
      }).on('update-not-available', (info) => {
        sendStatusToWindow(splash, 'Préparez-vous au lancement !')
        createTray()
        setTimeout(() => {
          splash.close()
        }, 1000)
      }).on('error', (err) => {
        sendStatusToWindow(splash, err)
        splash.webContents.send('UpdaterError', true)
      }).on('download-progress', (progressObj) => {
        // Debug - show in console (Electron) the progression
        let log_message = 'Download speed: ' + progressObj.bytesPerSecond
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
        log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
        log.warn(log_message)

        sendStatusToWindow(splash, 'Téléchargement en cours...')
        sendSpeedDownload(splash, progressObj.bytesPerSecond)
        sendPercentageDownload(splash, progressObj.percent)
      }).on('update-downloaded', (info) => {
        console.log('Téléchargement terminé')
        sendStatusToWindow(splash, 'Téléchargement terminé')
        setTimeout(() => {
          sendStatusToWindow(splash, "L'application redémarrera tout seul.")
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

export { win, userStatus }