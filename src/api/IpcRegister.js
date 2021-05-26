/* eslint @typescript-eslint/no-var-requires: "off" */
import fnGetDrives from '@/lib/fnGetDrives'
import fnWalkFolders from '@/lib/fnWalkFolders'
import fnCreateNode from '@/lib/fnCreateNode'
import fnGetSteamApps from '@/lib/fnGetSteamApps'
import fnGetSteamAppsID from '@/lib/fnGetSteamAppsID'
import fnCreateBnetNode from '@/lib/fnCreateBnetNode'
import ld from 'lodash'
//import exifr from 'exifr'

const fs = require('fs')
const path = require('path')
//const sharp = require('sharp')
//const mm = require('music-metadata')

class IpcRegister {
  constructor (ipcMain) {
    this.ipcMain = ipcMain
    this.drives_ = []
    this.fileInfos_ = []
  }

  registerOn () {
    this.ipcMain.on('req_system', async (event, res) => {
      // console.log('ipcMain.on req_system : ')
      const fileInfos = await fnGetDrives()
      const drives = ld.orderBy(fileInfos, ['label'], ['asc'])
      // console.log('orderItems : ', orderItems)
      const folders = [{
        id: 'ROOT',
        name: 'MyPC',
        label: 'MyPC',
        nodeKey: 'ROOT',
        expandable: true,
        tickable: true,
        lazy: true,
        children: drives
      }]
      const pathSep = path.sep
      const resObj = { folders, drives, pathSep }

      // event.sender.send('res_system', JSON.stringify(resObj))
      event.returnValue = JSON.stringify(resObj)
    })

    this.ipcMain.on('req_folders', async (event, res) => {
      // console.log('ipcMain.on req_folders : ')
      const resObj = await this.getFolders(res)
      event.returnValue = JSON.stringify(resObj)
    })

    this.ipcMain.on('req_folderContents', async (event, res) => {
      // console.log('ipcMain.on req_folderContents : ')
      const resObj = await this.getFolderContents(res)
      event.returnValue = JSON.stringify(resObj)
    })

    // this.ipcMain.on('req_imageData', async (event, res) => {
    //   const resObj = await this.getImage(res)
    //   // console.log('ipcMain.on req_imageData : '+ resObj)
    //   event.returnValue = JSON.stringify(resObj)
    // })

    // this.ipcMain.on('req_audioData', async (event, res) => {
    //   // console.log('ipcMain.on req_audioData : ')
    //   const resObj = await this.getAudioImage(res)
    //   // console.log('ipcMain.on req_audioData res.channelName: ', res.channelName)
    //   // console.log('ipcMain.on req_audioData resObj: ', resObj)
    //   event.returnValue = JSON.stringify(resObj)
    // })

    // this.ipcMain.on('req_thumb_imageData', async (event, res) => {
    //   // console.log('ipcMain.on req_thumb_imageData : ')
    //   const resObj = await this.getImage(res)
    //   resObj.type = 'image'
    //   // console.log('ipcMain.on req_thumb_imageData res.channelName: ', res.channelName)
    //   // console.log('ipcMain.on req_thumb_imageData resObj: ', resObj)
    //   event.sender.send(res.channelName, JSON.stringify(resObj))
    // })

    // this.ipcMain.on('req_thumb_audioData', async (event, res) => {
    //   console.log('ipcMain.on req_thumb_audioData : ')
    //   const resObj = await this.getAudioImage(res)
    //   resObj.type = 'audio'
    //   // console.log('ipcMain.on req_thumb_audioData res.channelName: ', res.channelName)
    //   // console.log('ipcMain.on req_thumb_audioData resObj: ', resObj)
    //   event.sender.send(res.channelName, JSON.stringify(resObj))
    // })
    this.ipcMain.on('req_bnet', async (event, res) => {
      const resObj = await this.getBnetGames(res)
      event.returnValue = resObj
    })

    this.ipcMain.on('req_steamID', async (event, res) => {
      const resObj = await fnGetSteamAppsID(res)
      event.returnValue = resObj
    })

    this.ipcMain.on('req_steam', async (event) => {
      const resObj = await fnGetSteamApps()
      event.returnValue = resObj
    })
  }

  // async getAudioImage (node) {
  //   const { common } = await mm.parseFile(node.nodeKey)
  //   const cover = mm.selectCover(common.picture)

  //   const returnObj = { cover, metadata: common }
  //   if (cover !== null && cover.data !== null) {
  //     const sharpBuffer = await sharp(cover.data)
  //       .resize({ width: 500 })
  //       .png()
  //       .toBuffer()
  //     const base64 = sharpBuffer.toString('base64')
  //     // console.log('base64 : ', base64)
  //     returnObj.base64 = base64
  //   }

  //   return returnObj
  // }

  // async getImage (node) {
  //   const fileBuffer = fs.readFileSync(node.nodeKey)
  //   const sharpBuffer = await sharp(fileBuffer)
  //     .resize({ width: 500 })
  //     .png()
  //     .toBuffer()
  //   const base64 = sharpBuffer.toString('base64')
  //   const exifrInfo = await exifr.parse(fileBuffer)
  //   const returnObj = { base64, exifrInfo }
  //   console.log('getImage base64 : ', base64)
  //   return returnObj
  // }

  getFolders (node) {
    const key = node.nodeKey + path.sep
    const folders = []
    try {
      // if (node.children.length) {
      //   node.children.splice(0, node.children.length)
      // }
      for (const fileInfo of fnWalkFolders(key, 0)) {
        if (!fileInfo.isDir) {
          continue
        }
        const n = fnCreateNode(fileInfo)
        folders.push(n)
        // node.children.push(n)
      }
      // console.log('loadChildren node : ', ld.cloneDeep(node))
      return folders
    } catch (err) {
      console.error('Error: ', err)
      return []
    }
  }

  getBnetGames (folder) {
    const returnValue = {
      contents: [],
      folders: []
    }

    if (!folder || typeof folder !== 'string') {
      return returnValue
    }
    folder = folder + path.sep
    console.log(folder)
    let newFolders = []
    let newFiles = []
    for (const fileInfo of fnWalkFolders(folder, 0)) {
      if ('error' in fileInfo) {
        // console.error(`Error: ${fileInfo.rootDir} - ${fileInfo.error}`)
        continue
      }
      const node = fnCreateBnetNode(fileInfo)
      if (node.data.isDir) newFolders.push(node)
      if (!node.data.isDir) newFiles.push(node)
    }
    newFolders = ld.orderBy(newFolders, ['label'], ['asc'])
    newFiles = ld.orderBy(newFiles, ['label'], ['asc'])
    returnValue.folders = newFolders
    returnValue.contents.push(...newFolders, ...newFiles)
    return returnValue
  }

  getFolderContents (folder) {
    const returnValue = {
      contents: [],
      folders: []
    }

    if (!folder || typeof folder !== 'string') {
      return returnValue
    }
    folder = folder + path.sep
    let newFolders = []
    let newFiles = []
    for (const fileInfo of fnWalkFolders(folder, 0)) {
      if ('error' in fileInfo) {
        // console.error(`Error: ${fileInfo.rootDir} - ${fileInfo.error}`)
        continue
      }
      const node = fnCreateNode(fileInfo)
      if (node.data.isDir) newFolders.push(node)
      if (!node.data.isDir) newFiles.push(node)
    }
    newFolders = ld.orderBy(newFolders, ['label'], ['asc'])
    newFiles = ld.orderBy(newFiles, ['label'], ['asc'])
    returnValue.folders = newFolders
    returnValue.contents.push(...newFolders, ...newFiles)
    return returnValue
  }
}

export default IpcRegister
