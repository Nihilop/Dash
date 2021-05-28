const path = require('path')
const mime = require('mime-types')

function fnCreateBnetNode (fileInfo) {
  let nodeKey = fileInfo.rootDir
  let appid
  let appCover
  let exec
  if (nodeKey.charAt(nodeKey.length - 1) !== path.sep) {
    nodeKey += path.sep
  }
  if (fileInfo.fileName === path.sep) {
    fileInfo.fileName = nodeKey
  } else {
    nodeKey += fileInfo.fileName
  }

  if (fileInfo.fileName === 'Call of Duty: Black Ops 4') {
    appid = 'VIPR'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Call of Duty Black Ops Cold War') {
    appid = 'codbocw'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Call of Duty Modern Warfare') {
    appid = 'codmw2019'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Call of Duty Modern Warfare 2 Campaign Remastered') {
    appid = 'codmw2crm'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Crash Bandicoot 4: It’s About Time') {
    appid = 'cb4'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Diablo III') {
    appid = 'D3'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Diablo III Public Test Realm') {
    appid = 'd3ptr'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Heartstone') {
    appid = 'WTCG'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Heroes of the Storm') {
    appid = 'Hero'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Overwatch') {
    appid = 'Pro'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Overwatch Public Test Realm') {
    appid = 'owptr'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Starcraft Remastered') {
    appid = 'scr'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'StarCraft II') {
    appid = 'S2'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'Warcraft III') {
    appid = 'W3'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'World of Warcraft') {
    appid = 'WoW'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'World of Warcraft Classic') {
    appid = 'wowclassic'
    appCover = `/img/bnet/${appid}.jpg`
  } else if (fileInfo.fileName === 'World of Warcraft Public Test Real') {
    appid = 'wowptr'
    appCover = `/img/bnet/${appid}.jpg`
  }
  // get file mime type
  // console.log(fileInfo)
  const mimeType = mime.lookup(nodeKey)
  // create object
  return {
    id: nodeKey,
    appid: appid,
    origin: 'bnet',
    exe: exec,
    game: {
      cover: appCover
    },
    name: fileInfo.fileName,
    label: fileInfo.fileName,
    nodeKey: nodeKey,
    expandable: fileInfo.isDir,
    tickable: true,
    lazy: true,
    children: [],
    data: {
      rootDir: fileInfo.rootDir,
      isDir: fileInfo.isDir,
      mimeType: mimeType,
      stat: fileInfo.stat
    }
  }
}

export default fnCreateBnetNode
