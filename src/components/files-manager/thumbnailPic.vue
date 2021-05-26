<template>
  <div
    v-if="srcData"
    style="position: relative; padding:5px;"
  >
    <img
      :src="srcData"
      style="max-width: 120px; height: auto; border: 1px solid #ccc;"
    >
  </div>
  <div v-else>
    <i
      :class="'icon bi bi-' + $getFileIcon(item.data)"
      @load="isLoaded()"
    />
  </div>
</template>

<script>

const electron = window.require ? window.require('electron') : null
export default {
  props: {
    item_: Object // node
  },
  data () {
    return {
      item: null,
      channelName: 'req_thumb-' + this.$generateUUID(),
      srcData: null
    }
  },
  created () {
    this.item = this.item_
    // this.actionsUpdateInfo(this.item_)
    // console.log('thumbnailPic created : this.channelName ', this.channelName)
    // console.log('thumbnailPic created : item.srcData ', this.item.srcData)
    // electron.ipcRenderer.on(this.channelName, (event, res) => {
    //   // console.log('thumbnailPic created ipcRenderer: res ', res)
    //   const resParse = JSON.parse(res)
    //   if (resParse.type === 'image') {
    //     this.srcData = `data:${this.item.data.mimeType};base64, ${resParse.base64}`
    //   } else if (resParse.type === 'audio') {
    //     if (resParse.cover && resParse.base64) {
    //       this.srcData = `data:${resParse.cover.format};base64, ${resParse.base64}`
    //     }
    //   }
    // })
  },
  methods: {
    actionsUpdateInfo (item) {
      // const channelName = this.$generateUUID
      item.channelName = this.channelName
      if (item.data.isDir === true) {
        console.log('Hmmm.')
      } else if ((item.data.mimeType).startsWith('image')) {
        electron.ipcRenderer.send('req_thumb_imageData', item)
      } else if ((item.data.mimeType).startsWith('audio')) {
        electron.ipcRenderer.send('req_thumb_audioData', item)
      }
      this.item = item
    }
  }
}
</script>

<style>

</style>
