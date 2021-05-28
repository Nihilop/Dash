import ConstIconType from '@/lib/ConstIconType.js'
import moment from 'moment'
import { shell } from 'electron'
var electron = require('electron')

function getFileIcon (itemData) {
  let vIco = ConstIconType[itemData.mimeType]
  if (itemData.isDir) vIco = '/img/ico/flat/Home.png'
  if (vIco === undefined) {
    vIco = '/img/ico/flat/Home.png'

    // console.log(' getFileIcon undefined : ', itemData.mimeType)
  }
  return vIco
}

function getExeIcon (path) {
  try {
    const ico = electron.remote.app.getFileIcon(path, { size: 'large' }).then(ico => ico.toDataURL())
    return ico
  } catch (err) {
    console.log(err)
  }
}

function getIco (itemData) {
  // let ico = electron.remote.app.getFileIcon(itemData, { size: 'large' }).then(ico => ico.toDataURL())
  // let thumb = electron.remote.nativeImage.createThumbnailFromPath(itemData).then(thumb => thumb.toDataURL())
  // console.log(shell.readShortcutLink(itemData))

  try {
    const parsed = shell.readShortcutLink(itemData)
    const icn = electron.remote.app.getFileIcon(parsed.icon, { size: 'large' }).then(ico => ico.toDataURL())
    return icn
  } catch (err) {
    console.log(err)
  }
}

function getFileSizeIEC (a, b, c, d, e) {
  b = Math
  c = b.log
  d = 1024
  e = c(a) / c(d) | 0
  return (a / b.pow(d, e)).toFixed(1) + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')
}

function getFileType (mimeType) {
  return mimeType.split('.').pop()
}

function getFileTime (time) {
  const returnValue = moment(time).format('YYYY-MM-DD HH:mm')
  return returnValue
}

function generateUUID () {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export { getFileIcon, getFileSizeIEC, getFileType, getFileTime, generateUUID, getIco, getExeIcon }
