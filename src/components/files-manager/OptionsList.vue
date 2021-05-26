<template>
  <div class="scrollableNav">
    <ul class="item-content">
      <label @click="driveShowed = !driveShowed">
        <h1>Disques durs</h1>
        <i :class="driveShowed ? 'bi bi-chevron-down' : 'bi bi-chevron-right'" />
      </label>

      <li
        v-for="item in $store.state.drives"
        v-show="driveShowed"
        :key="item.id"
        :params="item"
        class="item"
        :class="item.nodeKey === $store.state.selectedFolder ? 'active' : null"
        @click="onUpdateActiveFolder(item)"
      >
        <p class="title">
          <Promised
            v-if="item.data.mimeType == 'application/x-ms-shortcut'"
            :promise="$getIco(item.nodeKey)"
          >
            <template #default="data">
              <img
                class="sidebarIcon"
                :src="data"
                :class="{ active: isActive }"
                @load="isLoaded()"
              >
            </template>
          </Promised>
          <Promised
            v-else-if="item.data.mimeType === 'application/x-msdos-program'"
            :promise="$getExeIcon(item.nodeKey)"
          >
            <template #default="data">
              <img
                class="sidebarIcon"
                :src="data"
                :class="{ active: isActive }"
                @load="isLoaded()"
              >
            </template>
          </Promised>

          <img
            v-else
            class="sidebarIcon"
            :src="$getFileIcon(item.data)"
            :class="{ active: isActive }"
            @load="isLoaded()"
          >
          {{ item.name }}
        </p>
      </li>

      <label @click="favShowed = !favShowed">
        <h1>FAVORIS : {{ $store.state.favList.length }}</h1>
        <i :class="favShowed ? 'bi bi-chevron-down' : 'bi bi-chevron-right'" />
      </label>

      <li
        v-for="item in $store.state.favList"
        v-show="favShowed"
        :key="item.id"
        v-contextmenu:[item.name]
        :params="item"
        class="item"
        :class="item.nodeKey === $store.state.selectedFolder ? 'active' : null"
        @click="onUpdateActiveFolder(item)"
      >
        <v-contextmenu :ref="item.name">
          <v-contextmenu-item @click="handleSaveFav(item)">
            {{ $store.state.favKeys.includes(item.data.stat.ino) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
          </v-contextmenu-item>
          <v-contextmenu-item @click="launchApp(item.nodeKey)">
            Ouvrir dans l'explorateur de fichier
          </v-contextmenu-item>
        </v-contextmenu>
        <p class="title">
          <Promised
            v-if="item.data.mimeType == 'application/x-ms-shortcut'"
            :promise="$getIco(item.nodeKey)"
          >
            <template #default="data">
              <img
                class="sidebarIcon"
                :src="data"
                :class="{ active: isActive }"
                @load="isLoaded()"
              >
            </template>
          </Promised>
          <Promised
            v-else-if="item.data.mimeType === 'application/x-msdos-program'"
            :promise="$getExeIcon(item.nodeKey)"
          >
            <template #default="data">
              <img
                class="sidebarIcon"
                :src="data"
                :class="{ active: isActive }"
                @load="isLoaded()"
              >
            </template>
          </Promised>

          <img
            v-else
            class="sidebarIcon"
            :src="$getFileIcon(item.data)"
            :class="{ active: isActive }"
            @load="isLoaded()"
          >
          {{ item.name }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { shell } from 'electron'
import { Promised } from 'vue-promised'
import { openDB } from 'idb'
const electron = window.require ? window.require('electron') : null
export default defineComponent({
  name: 'OptionList',
  components: {
    Promised
  },
  props: {
    params: Object
  },
  setup () {
    const isActive = ref(null)

    function isLoaded () {
      isActive.value = true
    }

    return {
      isLoaded,
      isActive
    }
  },
  data () {
    return {
      driveShowed: false,
      favShowed: true,
      indexDb: null,
      dbName: 'finder',
      dbTbName: 'fav'
    }
  },
  async created () {
    setTimeout(() => {
      this.initialize()
      this.initSystem()
    }, 200)
  },
  methods: {
    async initSystem () {
      // console.log('window.ipcRenderer : ', window.ipcRenderer)
      const res = electron.ipcRenderer.sendSync('req_system')
      // console.log('window.ipcRenderer res : ', res)
      const resObj = JSON.parse(res)
      this.$store.dispatch('DRIVES', resObj.drives)
      this.$store.dispatch('FOLDERS', resObj.folders)
    },
    async initialize () {
      this.initIndexDb()
      this.indexDb = await this.initIndexDb()
      this.setFavList()
    },
    async initIndexDb  () {
      return await openDB(this.dbName, 1, {
        upgrade: db => {
          db.createObjectStore(this.dbTbName)
        }
      })
    },
    async handleSaveFav (item) {
      const allKeys = await this.indexDb.getAllKeys(this.dbTbName)
      console.log('handleSaveFav allKeys : ', allKeys)
      if (allKeys.includes(item.data.stat.ino) === false) {
        await this.indexDb.add(this.dbTbName, JSON.parse(JSON.stringify(item)), item.data.stat.ino)
      } else {
        const transaction = this.indexDb.transaction([this.dbTbName], 'readwrite')
        await transaction.objectStore(this.dbTbName).delete(item.data.stat.ino)
      }
      this.setFavList()
    },
    async setFavList () {
      const allItems = await this.indexDb.getAll(this.dbTbName)
      const allKeys = await this.indexDb.getAllKeys(this.dbTbName)

      this.$store.dispatch('FAV_LIST', allItems)
      this.$store.dispatch('FAV_KEYS', allKeys)
    },
    launchApp (items) {
      shell.openPath(items)
      electron.ipcRenderer.send('close', true)
      console.log('open ?')
    },
    onUpdateActiveFolder (item) {
      if (!item.expandable) {
        shell.openPath(item.nodeKey)
        electron.ipcRenderer.send('close', true)
        console.log('open ?')
      } else {
        console.log('onUpdateActiveFolder item : ', item)
        this.$store.dispatch('SELECTED_FOLDER', item.nodeKey)
        this.$store.dispatch('CURRENT_FOLDER', item.nodeKey)
        const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
        const resParse = JSON.parse(res)
        const newContents = resParse.contents
        // const folders = resParse.folders
        // this.$store.dispatch('FOLDER_CHILD', { item: this.$store.state.selectedFolder, folders })
        this.$store.dispatch('FOLDER_CONTENTS', newContents)
      }
    }
  }
})
</script>
<style lang="scss" scoped>

@import '@/assets/style/global.scss';
.scrollableNav {
  height: auto;
  overflow-y: scroll;
}
.item-content {
  position:relative;
  box-sizing: border-box;
  padding: 3rem 1.1rem;
  width: 100%;
  display: block;
  label {
    display: flex;
    font-weight: 200;
    color: rgba(white, 100%);
    padding: 15px 0;
    cursor:default;
    text-transform: uppercase;

    font-size: 1.1em;
    h1 {
      display: block;
      overflow:hidden;
      word-wrap: break-word;
      text-overflow: ellipsis;
      width: 100%;
    }
    i {
      margin: auto 0 auto auto
    }
  }
  li.item {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    opacity: 0.1;
    cursor: pointer;
    transition: all 0.5s;
    //pointer-events:auto;
    &.active {
      background: rgba(white, 5%);
      opacity: 1;
    }
    &.active.ListBorders {
      animation: GameTileBorderGlow 0.2s forwards;
    }
    &:hover {
      opacity: .9;
    }
  }
  .title {
    float: left;
    font-weight: 400;
    width: 100%;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $white;}
}

.v-contextmenu-item {
  padding: 5px 15px;
}
.sidebarIcon {
  max-width: 24px;
  margin: auto 5px ;
}
.title {
  display: flex;
  vertical-align: middle;
}
</style>
