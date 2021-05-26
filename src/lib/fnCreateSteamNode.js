/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path')
const mime = require('mime-types')

function fnCreateSteamNode (fileInfo) {
  let nodeKey = fileInfo.rootDir
  if (nodeKey.charAt(nodeKey.length - 1) !== path.sep) {
    nodeKey += path.sep
  }
  if (fileInfo.fileName === path.sep) {
    fileInfo.fileName = nodeKey
  } else {
    nodeKey += fileInfo.fileName
  }
  // get file mime type
  const mimeType = mime.lookup(nodeKey)
  // create object
  return {
    id: nodeKey,
    appid: fileInfo.appID,
    origin: fileInfo.origine,
    game: fileInfo.meta,
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

export default fnCreateSteamNode
// module.exports = createNode
