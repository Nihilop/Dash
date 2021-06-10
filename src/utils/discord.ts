// ***************************************
//  Connexion à discord par RPC - Nihilo.fr
//
//
//
// ***************************************
import log from 'electron-log'
import { Client } from 'discord-rpc';
import { win, userStatus } from '../background';
import { ipcMain, ipcRenderer } from 'electron'
import settings from 'electron-settings';
import { sendStatusToWindow, sendPlayedTime } from './updateSender'
import Timeout = NodeJS.Timeout;
const { ProcessListen } = require('active-window-listener')
const clientId = '847459425585201182'
let gameName_
let gameList_
let appStatus
let Statusdatas
let processID
let startTimestamp
let customStatus
let showPlaying
let refreshStatusTime
let startPlayed_
let endPlayed_
let listener
let appVersion = '0.0.5'

ipcMain.on('game_launch', function (event, data, startPlayed) {
  startPlayed_ = 0
  endPlayed_ = 0
  
  console.log('Game ' + data + ' launched et a commencer: ' + startPlayed)
  startPlayed_ = startPlayed
  startTimestamp = new Date();
  gameName_ = data
  
})
ipcMain.on('myGameList', (event, arg) => {
  if(gameList_ !== null && arg === gameList_) {
    return
  } else {
    gameList_ = arg
    listener = new ProcessListen(JSON.parse(gameList_))
    listenPID()
  }
})

// ipcMain.on('appVersion', (event, arg) => {
//   appVersion = arg.version
//   console.log(arg.version)
// })

function listenPID() {
  log.warn(JSON.stringify(listener.processArr))
  listener.changed((data) => {
    if(!data) {
      processID = null
      endPlayed_ = new Date().getTime()
      const total = endPlayed_ - startPlayed_
      return sendPlayedTime(win, total)
    }
    console.log("Active: ", data)
    return processID = data
  })
}

class DiscordHandler {
  private client: Client;
  private discordTimer!: Timeout;
  private gameTimer!: Timeout;

  constructor() {
    this.client = null;
    this.connectDiscord();
  }

  

  async connectDiscord() {
    //Client.register(clientId)
    
    if (!this.client) this.client = new Client({ transport: 'ipc' });
    this.client.login({ clientId }).catch((error: string) => {
        // console.error(error);
        console.debug('[RPC] Error: Make sure Discord client is available and you are connected to the Internet');
        delete this.client;
    });
    this.client.on('ready', () => {
        console.debug('Discord Client ready');
        this.setActivity();
        this.getStatus()
        this.discordTimer = setInterval(() => {
            this.setActivity().catch((e: string) => console.error(`Failed to update Discord status. ${e}`));
        }, 5e3);
    });
  }

  disconnectDiscord() {
    this.client.clearActivity();
    clearInterval(this.discordTimer);
    this.client.destroy();
    delete this.client;
  }

  async getStatus() { 
    showPlaying = await settings.get('parameters.showPlaying')
    customStatus = await settings.get('parameters.customStatus');
    refreshStatusTime = await settings.get('parameters.refreshStatusTime.time')
    log.warn(refreshStatusTime)
  }

  async updateStatusMessage () {

    if (userStatus === 'online') {
      appStatus = 'playing'
    } else if (userStatus === 'busy') {
      appStatus = 'playingbusy'
    } else if (userStatus === 'afk') {
      appStatus = 'playingafk'
    } else {
      appStatus = 'none'
    }

    this.getStatus()
    
    log.info(`%c${processID ? 'Jeu trouvé: ' + gameName_ + ' ' + processID.path : 'Aucun jeu identifié'}`,'color: green')
  
    if(processID && processID.path.includes(gameName_) && showPlaying) {      
      Statusdatas = { play : appStatus, message : `Joue à : ${gameName_}`, game: true}
    } else if(win.isVisible() && showPlaying) {
      Statusdatas = { play : "idle", message : "Ah, il veut jouer ?", game: false}
    } else if (processID && processID.path.includes("Code.exe") && showPlaying) {
      Statusdatas = { play : "coding", message : "Entrain de coder, bruh", game: false}
    } else if(customStatus) {
      Statusdatas = { play : "none", message : customStatus , game: false}
    } else {
      Statusdatas = { play : "none", game: false}
    }
  
    return Statusdatas
  }

  async setActivity () {
    if (!this.client || !win || this.client === null) {
      return
    }
    const StatusLol = await this.updateStatusMessage()
    log.error(StatusLol)
    if(StatusLol.game) {
      this.client.setActivity({
        state: StatusLol.message,
        startTimestamp,
        largeImageKey: 'dashou',
        largeImageText: 'Dash - Launcher',
        smallImageKey: StatusLol.play,
        instance: false
      })
    } else if(customStatus) {
      this.client.setActivity({
        details: `Beta - ${appVersion}`,
        state: StatusLol.message,
        largeImageKey: 'dashou',
        largeImageText: 'Dash - Launcher',
        smallImageKey: StatusLol.play,
        instance: false
      })

    } else {
      this.client.setActivity({
        details: `Beta - ${appVersion}`,
        largeImageKey: 'dashou',
        largeImageText: 'Dash - Launcher',
        smallImageKey: StatusLol.play,
        instance: false
      })
    }
  
  }
}

export { DiscordHandler }



  

  
    





