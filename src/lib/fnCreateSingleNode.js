const path = require('path')
const mime = require('mime-types')

function fnCreateSingleNode (fileInfo) {
  let nodeKey = fileInfo.rootDir
  fileInfo.fileName = fileInfo.fileName.substring(0, fileInfo.fileName.length - 4);
  // get file mime type
  const mimeType = mime.lookup(nodeKey)
  // create object
  return {
    id: nodeKey,
    name: fileInfo.fileName,
    label: fileInfo.fileName,
    nodeKey: nodeKey,
    expandable: fileInfo.isDir,
    tickable: true,
    lazy: true,
    children: [],
    origin: 'local',
    data: {
      rootDir: fileInfo.rootDir,
      isDir: fileInfo.isDir,
      mimeType: mimeType,
      stat: fileInfo.stat
    }
  }
}

export default fnCreateSingleNode
// module.exports = createNode
