<template>
  <div
    v-if="$store.state.folderContents"
    class="viewNav"
    :class="{scrollColor: scrollPosition > 50}"
  >
    <button
      class="btn home"
      @click="backToHome()"
    >
      <i class="bi bi-house" />
    </button>
    <button
      class="btn home"
      @click="refreshAction()"
    >
      <i class="bi bi-arrow-repeat" />
    </button>
    <div>
      <button
        class="btn"
        @click="showSidebar()"
      >
        <i class="bi bi-gear-fill" />
      </button>
      <button
        v-if="$store.state.listType == 'ListView'"
        class="btn"
        @click="onSelectListType('GridView')"
      >
        <i class="bi bi-grid" />
      </button>
      <button
        v-if="$store.state.listType == 'GridView'"
        class="btn"
        @click="onSelectListType('ListView')"
      >
        <i class="bi bi-list-ul" />
      </button>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
const electron = window.require ? window.require('electron') : null

export default defineComponent({
  name: 'Header',
  data () {
    return {
      scrollPosition: null
    }
  },
  methods: {
    updateScroll () {
      const container = document.querySelector('#content')
      this.scrollPosition = window.scrollY
    },
    backToHome () {
      this.$store.dispatch('SELECTED_FOLDER', localStorage.rootdir)
      this.$store.dispatch('CURRENT_FOLDER', localStorage.rootdir)
      const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
      const resParse = JSON.parse(res)
      const newContents = resParse.contents
      // const folders = resParse.folders
      // this.$store.dispatch('FOLDER_CHILD', { item: this.$store.state.selectedFolder, folders })
      this.$store.dispatch('FOLDER_CONTENTS', newContents)
    },
    onSelectListType (type) {
      console.log(type)
      this.$store.dispatch('LIST_TYPE', type)
      this.isOpenListType = false
    },
    showSidebar () {
      if (this.$store.state.sidebar) {
        this.$store.dispatch('SHOW_SIDEBAR', false)
      } else {
        this.$store.dispatch('SHOW_SIDEBAR', true)
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
    }
  }
})
</script>
<style lang="scss" scoped>
.viewNav {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  display: flex;
  vertical-align: middle;
  width: 100%;
  height: 100px;
  border-bottom: 1px solid rgba(white, 5%);
  z-index: 999;
  div {
    margin: auto 3% auto auto;
  }
}

.scrollColor {
  background:rgba(255, 255, 255,0.1);
  backdrop-filter: blur(35px) saturate(125%);
}

.btn {
  background:none;
  border: none;
  outline: none;
  opacity: 0.2;
  margin: auto auto auto 10px;
  font-size: 1.5em;
  cursor: pointer;
  &.home {
    margin: auto 0 auto 10px;
    &:first-child {
      margin: auto 0 auto 3%;
    }
  }
  &:hover {
    opacity: 1;
  }
}
</style>
