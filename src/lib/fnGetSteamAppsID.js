
import fnCreateSteamNode from './fnCreateSteamNode'
const { findSteamAppById } = require('find-steam-app')
const fs = require('fs')
const path = require('path')

async function fnGetSteamAppsID (id) {
  const appId = await findSteamAppById(id.app.AppState.appid)
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
