<template>
  <div id="filesManager">
    <transition name="fade-left">
      <Sidebar key="sidebar" />
    </transition>

    <transition name="fade-right">
      <main
        id="view"
        ref="MainView"
        key="main"
      >
        <div class="home">
          <Grid
            v-if="$store.state.listType === 'GridView'"
            :root="rootdir"
          />
          <List
            v-if="$store.state.listType === 'ListView'"
            :root="rootdir"
          />
        </div>
      </main>
    </transition>

    <Modal v-model="addModal">
      <template #header>
        Titre
      </template>
      <template #body>
        <p>Modal body. You can put here whatever you want: forms, images, text</p>
      </template>
      <template #actions>
        <button
          type="primary"
          @click="addModal = false"
        >
          Ajouter
        </button>
        <button
          type="primary"
          class="closed"
          @click="addModal = false"
        >
          Fermer
        </button>
      </template>
    </Modal>
    <Modal
      v-model="newUserModal"
      :close-btn="false"
    >
      <template #header>
        Configuration
      </template>
      <template #body>
        <p style="margin: 34px 0">
          Merci de selectionner le chemin principal ou vous voulez que l'application démarre
        </p>
        <span style="color:red; display:block; width: 100%; padding: 15px 0">{{ errorMessage }}</span>
        <input
          v-model="rootdir"
          class="addRoute"
          type="text"
          placeholder="C://exemple..."
        >
      </template>
      <template #actions>
        <button
          type="primary"
          @click="closeAndGo"
        >
          Ajouter
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Grid from '@/components/files-manager/Layouts/Grid.vue'
import List from '@/components/files-manager/Layouts/List.vue'
import Sidebar from '@/components/files-manager/Layouts/Sidebar.vue'
import Modal from '@/widgets/Dialog.widget.vue'
const electron = window.require ? window.require('electron') : null
const { shell } = require('electron')
const homeDir = require('os').homedir()
export default {
  name: 'Home',
  components: {
    Grid,
    List,
    Modal,
    Sidebar
  },
  data () {
    return {
      rootdir: '',
      trigger: '',
      addModal: false,
      nickname: '',
      errorMessage: '',
      newUserModal: false,
      showed: true
    }
  },
  watch: {
    rootdir (newRoot) {
      localStorage.rootdir = newRoot
      if (localStorage.rootdir === 0) {
        this.newUserModal = true
      }
    }
  },
  async created () {
    this.initFolder()
    // console.log('this.$store.state.favKeys : ', this.$store.state.favKeys)
  },
  mounted () {
    if (localStorage.rootdir) {
      this.rootdir = localStorage.rootdir
    } else {
      this.newUserModal = true
    }
  },
  methods: {
    async initSystem () {
      // console.log('electron.ipcRenderer : ', electron.ipcRenderer)
      const res = electron.ipcRenderer.sendSync('req_system')
      // console.log('electron.ipcRenderer res : ', res)
      const resObj = JSON.parse(res)
      this.$store.dispatch('DRIVES', resObj.drives)
      this.$store.dispatch('FOLDERS', resObj.folders)
      this.category = resObj
      this.initFolder()
      
    },
    closeAndGo () {
      if (this.rootdir !== 0) {
        this.newUserModal = !this.newUserModal
        this.initFolder()
      }
    },
    async initFolder () {
      console.log('onUpdateActiveFolder item : ', localStorage.rootdir)
      this.$store.dispatch('SELECTED_FOLDER', localStorage.rootdir)
      this.$store.dispatch('CURRENT_FOLDER', localStorage.rootdir)
      setTimeout(() => {
        const res = electron.ipcRenderer.sendSync('req_folderContents', this.$store.state.selectedFolder)
        const resParse = JSON.parse(res)
        const newContents = resParse.contents
        this.$store.dispatch('FOLDER_CONTENTS', newContents)
        if (newContents === 0) {
          this.errorMessage = "Nous ne parvernons pas à trouver vos données, il semblerait que votre racine soit vide ou n'existe pas."
          this.newUserModal = true
        }
      }, 500)
     
      
    },
    openDocument (value) {
      const Dir = `${homeDir}/${value}`
      console.log(Dir)
      shell.openPath(Dir)
      // shell.openExternal(value)
    },
    openSettings () {
      electron.ipcRenderer.send('openSettings')
    },
    backTo () {
      console.log('close')
      electron.ipcRenderer.send('close')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/global.scss';
#filesManager {
  position: relative;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  z-index: 1;
}
.addRoute {
  padding: 15px 24px;
  border-radius: 5px;
  background:transparent;
  border: 2px solid $principal;
  outline: none;
  color:white;
  width:100%;
}
#view {
  display: block;
  width: 100%;
  height: auto;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  //overflow: auto; // TODO : Afficher un scroll factice pour scroll dans la navigation , eventListener scroll souris pour scroll normal
}
</style>