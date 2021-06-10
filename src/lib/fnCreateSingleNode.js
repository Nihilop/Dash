const path = require('path')
const mime = require('mime-types')

function fnCreateSingleNode (fileInfo) {
  let nodeKey = fileInfo.rootDir
  fileInfo.fileName = fileInfo.fileName.substring(0, fileInfo.fileName.length - 4);
  // get file mime type
  const mimeType = mime.lookup(nodeKey)
  const meta = {
    app_name: "",
    background: "background-image: url('')",
    categories: [],
    cover:"",
    description: "",      
    tags: [],
    video:"",
  }
  // create object
  return {
    id: nodeKey,
    origin: 'local',
    exec: fileInfo.fileName,
    game: meta,
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
      mimeType: mimeType,
      stat: fileInfo.stat
    }
  }
}

export default fnCreateSingleNode
// module.exports = createNode
