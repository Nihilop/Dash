
import fnCreateSteamNode from './fnCreateSteamNode'
import log from 'electron-log'
import fnWalkFolders from './fnWalkFolders'
const { findSteamAppById } = require('find-steam-app')
const fs = require('fs')
const path = require('path')

async function fnGetSteamAppsID (id) {
  const appId = await findSteamAppById(id.app.AppState.appid ? id.app.AppState.appid : id)
  const key = appId + path.sep
  const files = fs.readdirSync(key)
  
  let ExecFiles = files.filter(word => word.includes('.exe'))
  let ExecFilesMatched = ""
  let ExecFilesNotMatched = ""
  let parseName = id.app.AppState.name.replace(/\W|\s/g, '')
  ExecFiles.forEach(elem => {
    let removeLasts = elem.substring(0, elem.length - 4);
    let rst = removeLasts.replace(/\W|\s/g, '')
    console.log(rst + ' work with ' + parseName)
    let final = parseName.includes(rst)
    if(final) { ExecFilesMatched = elem } 
    else { ExecFilesNotMatched = elem }
  })
  log.info(`%c${ExecFilesMatched}`, 'color:green')
  log.info(`%c${ExecFilesNotMatched}`, 'color:red')


  if (id.app.AppState.appid === 228980) {

  } else {
    let node
    try {      
      const stat = fs.statSync(appId + path.sep)
      const fileInfo = {}
      if(ExecFilesMatched) {
        fileInfo.rootDir = appId + path.sep + ExecFilesMatched
      } else {
        fileInfo.rootDir = appId
      }
      fileInfo.fileName = id.app.AppState.name
      fileInfo.isDir = stat.isDirectory()
      if(ExecFilesMatched) {
        fileInfo.process = ExecFilesMatched
      } else {
        fileInfo.process = id.app.AppState.name + '.exe'
      }
      fileInfo.stat = stat
      fileInfo.meta = id.meta
      fileInfo.origine = 'steam'
      fileInfo.appID = id.app.AppState.appid
      // console.log(fileInfo)
      const node = fnCreateSteamNode(fileInfo)
      return node
    } catch (error) {
      console.error(error)
    }

    // const walky = await fnWalkFolders(node)
    console.log(node)

    return node
  }
}

export default fnGetSteamAppsID
