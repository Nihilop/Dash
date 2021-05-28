
import fnCreateNode from './fnCreateNode'
const { findSteamLibraries } = require('find-steam-app')
const fs = require('fs')
const path = require('path')

async function getSteamApps () {
  const steam_ = []
  try {
    var steamLib = await findSteamLibraries()
    steamLib.forEach((element, index) => {
      try {
        const stat = fs.statSync(element + path.sep)
        const fileInfo = {}
        fileInfo.rootDir = element
        fileInfo.fileName = path.sep
        fileInfo.isDir = stat.isDirectory()
        fileInfo.stat = stat
        // console.log(fileInfo)
        const node = fnCreateNode(fileInfo)
        steam_.push(node)
      } catch (error) {
      // remove from (bad/phantom) drive list
        steam_.splice(index, 1)
        console.error(error)
      }
    })
    // console.log(steam_)
  } catch (err) {
    console.log(err)
  }

  // var appID = findSteamAppById(570);
  // var appName = findSteamAppByName('Among us');
  // var steamDir = findSteam();

  // var appManifest = findSteamAppManifest(570);

  return steam_
}

// module.exports = getWindowsDrives
export default getSteamApps
