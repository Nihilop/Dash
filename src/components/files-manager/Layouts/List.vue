<template>
  <!-- <indicator :referenceTo="scrollContainer"/> -->
  <div class="noSelect">
    <div
      v-if="$store.state.folderContents <= 0"
      class="NoResults"
    >
      <div>
        <h1>Sélectionner un item du menu à gauche</h1>
        <button
          class="btn"
          @click="backBtn()"
        >
          <i class="bi bi-caret-left" /> ou Retour à l'accueil
        </button>
      </div>
    </div>
    <div v-else>
      <header-bar />

      <div
        ref="scrollContainer"
        class="scrollable"
      >
        <div class="breadAndBack">
          <button
            v-if="$store.state.selectedFolder !== root"
            class="btn"
            @click="backBtn()"
          >
            <i class="bi bi-caret-left" /> Retour
          </button>
          <p class="breadcrumbs">
            {{ $store.state.selectedFolder }}
          </p>
        </div>
        <transition
          name="fade"
          @load="isLoaded()"
        >
          <table class="listMode">
            <thead class="headerBlock">
              <tr>
                <th>Fav.</th>
                <th>Icon</th>
                <th class="name">
                  Nom.
                </th>
                <th class="size">
                  Taille.
                </th>
                <th class="pathName">
                  Chemin
                </th>
              </tr>
            </thead>
            <tbody class="bodyBlock">
              <tr
                v-for="(params, index) in $store.state.folderContents"
                :key="index.id"
                v-contextmenu:[params.name]
                class="item_row"
                @dblclick="onDbClickItem(params)"
                @click="onSelectListType(params.data.mimeType)"
              >
                <v-contextmenu :ref="params.name">
                  <v-contextmenu-item
                    v-if="!params.data.isDir && params.data.mimeType === 'application/x-ms-shortcut' || params.data.mimeType === 'application/x-msdos-program'"
                    @click="addToLauncher(params)"
                  >
                    <i
                      class="bi "
                      :class=" $store.state.gameKeys.includes(params.data.stat.ino) ? 'bi-x' : 'bi-plus'"
                      :style=" $store.state.gameKeys.includes(params.data.stat.ino) ? 'color:red' : 'color:green'"
                      style="margin-right:5px"
                    />{{ $store.state.gameKeys.includes(params.data.stat.ino) ? 'Retirer du Launcher' : 'Ajouter au Launcher' }}
                  </v-contextmenu-item>
                  <v-contextmenu-divider v-if="!params.data.isDir && params.data.mimeType === 'application/x-ms-shortcut' || params.data.mimeType === 'application/x-msdos-program'" />
                  <v-contextmenu-item @click="handleSaveFav(params)">
                    <i
                      :class="$store.state.favKeys.includes(params.data.stat.ino) ? 'bi bi-star-fill' : 'bi bi-star' "
                      :style="$store.state.favKeys.includes(params.data.stat.ino) ? 'color:orange' : null"
                      style="margin-right:5px"
                    />
                    {{ $store.state.favKeys.includes(params.data.stat.ino) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                  </v-contextmenu-item>
                  <v-contextmenu-item @click="launchApp(params.nodeKey)">
                    <i
                      class="bi bi-folder2-open"
                      style="margin-right:5px"
                    />Ouvrir dans Windows
                  </v-contextmenu-item>
                  <v-contextmenu-divider v-if="params.expandable" />
                  <v-contextmenu-item
                    v-if="params.expandable"
                    @click="setAsRoot(params.nodeKey)"
                  >
                    <i
                      class="bi bi-house"
                      style="margin-right:5px"
                    />Attribuer comme accueil
                  </v-contextmenu-item>
                  <v-contextmenu-item @click="DeleteFile(params.nodeKey)">
                    <i
                      class="bi bi-trash"
                      style="margin-right:5px"
                    />Supprimer
                  </v-contextmenu-item>
                </v-contextmenu>

                <th class="Fav">
                  <img
                    class="favIcon"
                    :class="$store.state.favKeys.includes(params.data.stat.ino) ? 'isFav' : null"
                    src="/img/fav.png"
                    @click="handleSaveFav(params)"
                  >
                </th>
                <th class="icon">
                  <div v-if="!params.data.isDir && params.data.mimeType && ((params.data.mimeType).startsWith('image') || (params.data.mimeType).startsWith('audio'))">
                    <thumbnailPic :item_="params" />
                  </div>
                  <Promised
                    v-if="params.data.mimeType === 'application/x-ms-shortcut'"
                    :promise="$getIco(params.nodeKey)"
                  >
                    <template #default="data">
                      <img
                        :src="data"
                        :class="{ active: isActive }"
                        @load="isLoaded()"
                      >
                    </template>
                  </Promised>

                  <Promised
                    v-else-if="params.data.mimeType === 'application/x-msdos-program'"
                    :promise="$getExeIcon(params.nodeKey)"
                  >
                    <template #default="data">
                      <img
                        :src="data"
                        :class="{ active: isActive }"
                        @load="isLoaded()"
                      >
                    </template>
                  </Promised>

                  <img
                    v-else
                    :src="$getFileIcon(params.data)"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                  >
                </th>
                <td class="title">
                  {{ params.label }}
                </td>
                <td class="size">
                  <p>{{ params.data.stat.size != 0 ? niceBytes(params.data.stat.size) : null }}</p>
                </td>
                <td class="path">
                  {{ params.nodeKey }}
                </td>
              </tr>
            </tbody>
          </table>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { shell } from 'electron'
import thumbnailPic from '@/components/files-manager/thumbnailPic.vue'
import clickoutside from '@/directives/clickOutside'
import HeaderBar from './Header'
import { openDB } from 'idb'
import { Promised } from 'vue-promised'
const electron = window.require ? window.require('electron') : null
export default defineComponent({
  name: 'Grid',
  directives: { clickoutside },
  components: {
    Promised,
    thumbnailPic,
    HeaderBar
  },
  props: {
    titleShowed: { type: Boolean, default: true },
    currentItem: Number,
    root: String
  },
  setup () {
    const isActive = ref(null)
    const scrollContainer = ref(null)
    function isLoaded () {
      isActive.value = true
    }

    return {
      isLoaded,
      isActive,
      scrollContainer
    }
  },
  data () {
    return {
      indexDb: null,
      indexDbGame: null,
      dbName: 'finder',
      dbName2: 'games',
      dbTbName: 'fav',
      dbGmName: 'games'
    }
  },
  watch: {
    keys: function () {
      this.keys = this.$store.state.favKeys
    },
    '$store.state.folderContents': function () {
      if (this.$store.state.folderContents <= 0) {
        this.$store.dispatch('SHOW_SIDEBAR', true)
      } else {
        this.$store.dispatch('SHOW_SIDEBAR', false)
      }
    }

  },
  async created () {
    setTimeout(() => {
      this.initialize()
    }, 200)
  },
  methods: {
    async initialize () {
      this.initIndexDb()
      this.initIndexDbGame()
      this.indexDb = await this.initIndexDb()
      this.indexDbGame = await this.initIndexDbGame()
      console.log('initialize indexDb : ', this.indexDb)
      console.log('initialize indexDb : ', this.indexDbGame)
      this.setFavList()
    },
    async initIndexDb  () {
      return await openDB(this.dbName, 1, {
        upgrade: db => {
          db.createObjectStore(this.dbTbName)
        }
      })
    },
    async initIndexDbGame  () {
      return await openDB(this.dbName2, 2, {
        upgrade: db => {
          db.createObjectStore(this.dbGmName)
        }
      })
    },
    async DeleteFile (item) {
      // fs.unlinkSync(item);
      console.log('faire un prop de confirmation')
      this.refreshAction()
    },
    async addToLauncher (item) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      console.log('Games allKeys : ', allKeys)
      if (allKeys.includes(item.data.stat.ino) === false) {
        await this.indexDbGame.add(this.dbGmName, JSON.parse(JSON.stringify(item)), item.data.stat.ino)
      } else {
        const transaction = this.indexDbGame.transaction([this.dbGmName], 'readwrite')
        await transaction.objectStore(this.dbGmName).delete(item.data.stat.ino)
      }
      this.setGameList()
    },
    async setGameList () {
      const allItems = await this.indexDbGame.getAll(this.dbGmName)
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)

      this.$store.dispatch('GAME_LIST', allItems)
      this.$store.dispatch('GAME_KEYS', allKeys)
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
    setAsRoot (value) {
      localStorage.rootdir = value
    },
    onSelectListType (type) {
      console.log(type)
    },
    niceBytes (x) {
      const units = ['O', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']
      let l = 0; let n = parseInt(x, 10) || 0
      while (n >= 1024 && ++l) {
        n = n / 1024
      }
      return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + units[l])
    },
    showSidebar () {
      if (this.$store.state.sidebar) {
        this.$store.dispatch('SHOW_SIDEBAR', false)
      } else {
        this.$store.dispatch('SHOW_SIDEBAR', true)
      }
    },
    backBtn () {
      if (this.$store.state.selectedFolder === localStorage.rootdir) {

      } else {
        var str = this.$store.state.selectedFolder
        const getLastItem = thePath => thePath.substring(0, thePath.lastIndexOf('\\'))

        console.log('onUpdateActiveFolder item : ', getLastItem(str))
        this.$store.dispatch('SELECTED_FOLDER', getLastItem(str))
        this.$store.dispatch('CURRENT_FOLDER', getLastItem(str))
        const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
        const resParse = JSON.parse(res)
        const newContents = resParse.contents
        // const folders = resParse.folders
        // this.$store.dispatch('FOLDER_CHILD', { item: this.$store.state.selectedFolder, folders })
        this.$store.dispatch('FOLDER_CONTENTS', newContents)
      }
    },

    onDbClickItem (item) {
      if (item.expandable) {
        try {
          console.log('onUpdateActiveFolder item : ', item)
          this.$store.dispatch('SELECTED_FOLDER', item.nodeKey)
          this.$store.dispatch('CURRENT_FOLDER', item.nodeKey)
          const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
          const resParse = JSON.parse(res)
          const newContents = resParse.contents
          // const folders = resParse.folders
          // this.$store.dispatch('FOLDER_CHILD', { item: this.$store.state.selectedFolder, folders })
          this.$store.dispatch('FOLDER_CONTENTS', newContents)
        } catch (err) {
          console.log(err)
        }
      } else {
        this.launchApp(item.nodeKey)
      }
    },
    refreshAction () {
      console.log('onUpdateActiveFolder item : ', this.$store.state.selectedFolder)
      this.$store.dispatch('SELECTED_FOLDER', this.$store.state.selectedFolder)
      this.$store.dispatch('CURRENT_FOLDER', this.$store.state.selectedFolder)
      const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
      const resParse = JSON.parse(res)
      const newContents = resParse.contents
      // const folders = resParse.folders
      // this.$store.dispatch('FOLDER_CHILD', { item: this.$store.state.selectedFolder, folders })
      this.$store.dispatch('FOLDER_CONTENTS', newContents)
    },
    launchApp (items) {
      shell.openPath(items)
      electron.ipcRenderer.send('close', true)
      console.log('open ?')
    }
  }
})
</script>
<style lang="scss" scoped>
$heightCard: 170px;
$selectColor: hsl(204, 70%, 53%); // hsla(24, 99%, 59%, 1)
$background: hsla(191, 40%, 8%, 1);
$muted: hsla(120, 24%, 94%, 1);
$white: hsla(180, 14%, 97%, 1);
$principal: $selectColor;
$secondary: hsla(219, 8%, 53%, 1);
$accept : #27ae60;

.Fav {
  display: flex;
  vertical-align: middle;
  .favIcon {
    max-width: 18px;
    margin:auto 20px;
    filter:grayscale(100%);
    opacity:0.1;
    &:hover {
      filter: none;
      opacity:1;
      cursor: pointer;
    }
  }
  .isFav {
    filter: none;
    opacity:1;
  }
}

.scrollable {
  height: calc(100vh - 80px);
  overflow: scroll;
}

.listMode {
  position:relative;
  width: 100%;
  display: block;
  user-select: none;
  margin-bottom: 50px;
  .headerBlock {

    display: block;
    padding: 0 50px;
    height: 50px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(white,5%);
    tr {
      display: flex;
      justify-content: left;
      vertical-align: middle;
      text-align: left;
      height: 100%;
      color: rgba(white, 20%);

      th {
        display: block;
        margin:auto;
        padding: 5px 15px;
        box-sizing: border-box;
        border-right: 1px solid rgba(white,5%);

        &:last-child {
          border: none;
        }
        &.name {
          width: 100%;
        }
        &.pathName {
          width: 50%;
        }
      }
    }
  }
  .bodyBlock {
    display: block;
    padding: 24px 50px;
    box-sizing: border-box;
    th {
      height: 45px;
    }
  }
  .item_row {
    position:relative;
    width: 100%;
    display: flex;
    justify-content: left;
    color:white;
    transition: all 0.2s;
    overflow: hidden;
    &:hover {
      background:rgba(white,5%);
      border-radius: 5px;
      cursor:pointer;
    }
    .icon {
      padding: 5px 15px;
      margin: auto;
      img {
        max-height: 34px;
      }
    }
    .title {
      width:100%;
      margin: auto;
    }
    .path {
      width: 50%;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      margin: auto;
    }
    .size {
      width:10%;
      box-sizing: border-box;
      text-align: center;
      color:rgba(white, 20%);
      display:flex;
      margin: auto;
      > p {
        display: flex;
      }
    }
  }
}

@keyframes Glowed {
  0% {
    box-shadow: 0 0 0 1rem rgba(255, 255, 255, 0), 0 0 5rem -2rem $principal; }
  49% {
    box-shadow: 0 0 0 1rem rgba(255, 255, 255, 0), 0 0 3rem -2rem $principal; }
  100% {
    box-shadow: 0 0 0 1rem rgba(255, 255, 255, 0), 0 0 5rem -2rem $principal; } }
@keyframes Bordered {
  0% {
    box-shadow: 0 0 0 0rem rgba($principal, 0%); }
  50% {
    box-shadow: 0 0 0 0.1rem rgba($principal, 10%); }
  100% {
    box-shadow: 0 0 0 0.2rem rgba($principal, 100%); } }

.breadAndBack {
  display: block;
  padding: 50px 150px;
  box-sizing: border-box;
  > .btn, .breadcrumbs {
    margin: auto;
  }
}

.breadcrumbs {
  font-size: 2em;
  color: rgba(white, 30%);
  font-weight: 800;
  margin-left: 24px;
}

.btn {
  background:none;
  border: none;
  outline: none;
  color: rgba(255,255,255,0.2);
  margin: auto 0px auto 10px;
  font-size: 1.5em;
  cursor: pointer;
  user-select: none;
  &:hover {
    color:white;
  }
}

.NoResults {
  width:100%;
  height: 70vh;
  display: flex;
  vertical-align: middle;
  justify-content: center;
  color:white;
  div {
    margin: auto;
    h1 {
      padding: 15px 0;
    }
  }
}

</style>
