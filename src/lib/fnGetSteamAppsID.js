
import fnCreateSteamNode from './fnCreateSteamNode'
import fnWalkFolders from './fnWalkFolders'
const { findSteamAppById } = require('find-steam-app')
const fs = require('fs')
const path = require('path')

async function fnGetSteamAppsID (id) {
  const appId = await findSteamAppById(id.app.AppState.appid)
  const key = appId + path.sep
  const files = fs.readdirSync(key)
  
  let finalPath = files.filter(word => word.includes('.exe'))
  console.log(finalPath, id.app.AppState.name)
  //let matching = finalPath.includes(id.app.AppState.name)
  //console.log(matching)

  if (id.app.AppState.appid === 228980) {

  } else {
    let node
    try {      
      const stat = fs.statSync(appId + path.sep)
      const fileInfo = {}
      fileInfo.rootDir = appId
      fileInfo.fileName = id.app.AppState.name
      fileInfo.isDir = stat.isDirectory()
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
