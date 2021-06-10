import log from 'electron-log'

export function sendStatusToWindow (window, text) {
  log.info(text)
  window.webContents.send('message', text)
}

export function sendSpeedDownload (window, text) {
  window.webContents.send('speed', text)
}
export function sendPercentageDownload (window, text) {
  window.webContents.send('percentage', text)
}
export function sendPlayedTime (window, text) {
  window.webContents.send('stopPlayed', text)
}
