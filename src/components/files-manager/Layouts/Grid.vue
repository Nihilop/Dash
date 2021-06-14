<template>
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
      <div class="scrollable">
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
        <transition-group
          class="flexbox"
          tag="grid"
          name="fade"
          @load="isLoaded()"
        >
          <article
            v-for="(params, index) in $store.state.folderContents"
            :id="index + 1"
            :key="index"
            class="flexbox--item"
            :class="currentItem === params.id ? 'active-item' : null"
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

            <div @dblclick="onDbClickItem(params)">
              <div
                v-contextmenu:[params.name]
                class="image"
              >
                <div v-if="!params.data.isDir && params.data.mimeType && ((params.data.mimeType).startsWith('image') || (params.data.mimeType).startsWith('audio'))">
                  <thumbnailPic :item_="params" />
                </div>
                <Promised
                  v-if="params.data.mimeType == 'application/x-ms-shortcut'"
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
                <!-- <i v-else :class="'icon bi bi-' + $getFileIcon(params.data)" @load="isLoaded()"></i> -->
              </div>
              <div
                class="description"
                :class="{'titleVisible': titleShowed}"
              >
                <h3 class="title">
                  <p>{{ params.label }}</p>
                  <img
                    v-if="$store.state.favKeys.includes(params.data.stat.ino)"
                    class="favIcon"
                    src="/img/fav.png"
                  >
                </h3>
                <p class="sid">
                  {{ params.size ? '/ Taille :' + params.size : null }}
                </p>
              </div>
            </div>
            <h1
              v-if="titleShowed"
              :class="{&quot;active-item--title&quot;: currentItem === params.id}"
              class="titleifVisible active-item--title"
            >
              <Promised
                v-if="params.data.mimeType == 'application/x-ms-shortcut'"
                :promise="$getIco(params.nodeKey)"
              >
                <template #default="data">
                  <img
                    class="iconInTitle"
                    :src="data"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                  >
                </template>
              </Promised>
              <p>{{ params.label }}</p>
              <img
                v-if="$store.state.favKeys.includes(params.data.stat.ino)"
                class="favIcon"
                src="/img/fav.png"
              >
            </h1>
          </article>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { shell } from 'electron'
import thumbnailPic from '@/components/files-manager/thumbnailPic.vue'
import HeaderBar from './Header'
import clickoutside from '@/directives/clickOutside'
import { openDB } from 'idb'
const electron = window.require ? window.require('electron') : null
import { Promised } from 'vue-promised'
export default defineComponent({
  name: 'Grid',
  directives: { clickoutside },
  components: {
    thumbnailPic,
    HeaderBar,
    Promised,
  },
  props: {
    titleShowed: { type: Boolean, default: true },
    currentItem: Number,
    root: String
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
      this.$store.dispatch('LIST_TYPE', type)
      this.isOpenListType = false
    },
    niceBytes (x) {
      const units = ['Octe', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']
      let l = 0; let n = parseInt(x, 10) || 0
      while (n >= 1024 && ++l) {
        n = n / 1024
      }
      return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l])
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
    async DeleteFile (item) {
      // fs.unlinkSync(item);
      console.log('faire un prop de confirmation')
      this.refreshAction()
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

.scrollable {
  height: calc(100vh - 80px);
  overflow: scroll;
}

.favIcon {
  max-width: 18px;
  margin:auto 10px;
}
.flexbox {
  padding: 0 50px;
  box-sizing: border-box;
  margin: 24px auto 150px auto;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: stretch;
  transition: all 0.5s;
  user-select: none;

  .flexbox--item {
    position: relative;
    width: 22%;
    height: calc(#{$heightCard} + 34px);
    margin: 25px 15px;
    font-weight: bold;
    font-size: 3em;
    border-radius: 5px;
    text-align: center;
    transition: all 0.5s;
    .image {
      position: relative;
      display: flex;
      width: 100%;
      height: $heightCard;
      overflow: hidden;
      border-radius: 5px;
      justify-content: center;
      vertical-align: middle;
      background:rgba(173, 184, 194, 0.1);
      &:after {
        // This forces the image container to be a square
        content: '';
        display: block;
        box-sizing: border-box;
        padding-bottom: 100%;
      }
      img {
        position: absolute;
        height: 80px;
        margin: 42.5px auto;
        z-index: 10;
        opacity: 0;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        &.active {
            animation: imageFadeIn 0.5s ease-in forwards;
            animation-delay: 0.5s;
        }
      }
    }
    .description {
      display: none;
      padding-bottom: 10px;
      opacity: 0;
      max-width: 100%;
      transition: opacity 0.8s;
      text-align: left;
      .title {
        display: flex;
        vertical-align: middle;
        > p {
          margin:auto 10px;
        }
      }
      h3 {
        padding: 0 10px;
        font-size:0.2em;
        opacity: 0.8;
        font-weight: bold;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
    }
    &:hover {

      position: relative;

      .image {
        box-sizing: border-box;

        animation: Bordered 0.5s ease-in forwards;
        transform: scale(1.1);
        transition:all 0.5s;
        &:before {
          animation: Glowed 10s infinite;
        }
        img {

          filter: blur(0);
        }

      }
      .description {
        position: absolute;
        display: block;
        bottom: 10%;
        width: 100%;
        left: 0;
        height: fit-content;
        z-index: 99;
        animation: textShowFadein 0.3s 0.2s ease-in forwards !important;
        overflow: hidden;
        text-align: center;

      }
      .active-item--title {
        animation: imageFadeOut 0.2s ease-in forwards;
      }
    }
  }
  .titleifVisible {
    padding-top: 10px;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    vertical-align: middle;
    font-size:0.3em;
    p {
      margin: auto 5px;
    }
  }
  .iconInTitle {
    position: relative;
    display: block;
    max-height: 24px;
    margin-right: 10px;
  }
  .titleVisible {
    animation: textShowFadein 0.3s 0.2s ease-in forwards !important;
  }
}

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
  opacity: 0.3;
  font-weight: 800;
  margin-left: 24px;
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

.btn {
  background:none;
  border: none;
  outline: none;
  opacity: 0.2;
  margin: auto 0px auto 10px;
  font-size: 1.5em;
  cursor: pointer;
  user-select: none;
  &:hover {
    opacity: 1;
  }
}
.NoResults {
  width:100%;
  height: 70vh;
  display: flex;
  vertical-align: middle;
  justify-content: center;
  div {
    margin: auto;
    h1 {
      padding: 15px 0;
    }
  }
}

</style>
