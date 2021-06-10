const path = require('path')
const mime = require('mime-types')

function fnCreateSteamNode (fileInfo) {
  let nodeKey = fileInfo.rootDir
  // get file mime type
  const mimeType = mime.lookup(nodeKey)
  // create object
  return {
    id: nodeKey,
    appid: fileInfo.appID,
    origin: fileInfo.origine,
    game: fileInfo.meta,
    analytic: {
      played: 0,
      stat: [],
      launched: 0
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
      process: fileInfo.process,
      mimeType: mimeType,
      stat: fileInfo.stat
    }
  }
}

export default fnCreateSteamNode
// module.exports = createNode
