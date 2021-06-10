<template>
  <aside id="sidebar">
    <div class="WelcomeMessage">
      Bonjour, {{ nickname }}
    </div>
    <Fav />
  </aside>
</template>
<script>
import Fav from '@/components/files-manager/OptionsList'
import { defineComponent, onMounted, ref } from 'vue'
const electron = window.require ? window.require('electron') : null
import settings from 'electron-settings';
export default defineComponent({
  components: {
    Fav
  },
  setup () {
    const nickname = ref(null)
    const isActive = ref(null)
    const currentList = ref(null)
    function isLoaded () {
      isActive.value = true
    }
    onMounted(async () => { 
      nickname.value = await settings.get('parameters.name');
    })
    return {
      nickname,
      currentList,
      isLoaded,
      isActive
    }
  },
  methods: {
    onUpdateActiveFolder () {
      this.$store.dispatch('SELECTED_FOLDER', localStorage.rootdir)
      this.$store.dispatch('CURRENT_FOLDER', localStorage.rootdir)
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
@import '@/assets/style/global.scss';
#sidebar {
  position: sticky;
  top:0;
  left: 0;
  display: block;
  box-sizing: border-box;
  height: 100vh;
  width: 350px;
  color: $muted;
  background:rgba(13, 13, 13,0.3);
  backdrop-filter: blur(35px) saturate(125%);
  z-index: 9999999;
  border-right: 1px solid rgba(white, 5%);
  overflow: hidden;
  user-select: none;
  &:hover {
    overflow-y: auto;
  }
}
.viewbar {
  position:relative;
  display: block;
  height: auto;
  overflow-y:scroll;
}
// sidebar
.WelcomeMessage {
  padding: 9% 10px 10px 0 ;
  font-size: 2em;
  font-weight: 300;
  text-align: center;
}
</style>