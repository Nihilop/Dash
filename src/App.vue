<template>
  <n-config-provider :theme="isDarkness ? darkTheme : null">
    
    <n-global-style />
    <!-- <n-space> isDarkness ? darkTheme : null
      <n-button @click="theme = darkTheme">Dark</n-button>
      <n-button @click="theme = null">Light</n-button>
    </n-space> -->
    <router-view />
  </n-config-provider>
</template>
<script>
import { onMounted, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { darkTheme, NConfigProvider, NSpace, NButton, NGlobalStyle } from 'naive-ui'
import settings from 'electron-settings';
const electron = window.require ? window.require('electron') : null
export default {
  components: {
    NConfigProvider,
    NSpace,
    NButton,
    NGlobalStyle
  },
  setup () {
    
    const store = useStore()
    const isDarkness = ref(null)
    const theme_color = computed(() => {
      return store.state.theme_dark
    })
    onMounted(() => {
      init()
    })
    async function init() {
      var initColor = await settings.get('parameters.windows_color')
      store.dispatch('SET_THEME', initColor)
      deriveTheme(theme_color.value) 
      
      store.watch(() => store.state.theme_dark, () => {
        console.log(store.state.theme_dark)
        deriveTheme(theme_color.value) 
      })
    };
    function deriveTheme(color) {
      var c = color.substring(1).slice(0, -2);
      var rgb = parseInt(c , 16); 
      var r = (rgb >> 16) & 0xff; 
      var g = (rgb >>  8) & 0xff;
      var b = (rgb >>  0) & 0xff; 

      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; 
      if (luma < 40) {
        isDarkness.value = true
      } else {
        isDarkness.value = false
      }
    };

    return {
      darkTheme,
      isDarkness,
      theme_color
    }
  },
}
</script>
<style lang="scss">
#app {
  position:relative;
  display: block;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  border: none !important;
  outline: none !important;
  margin: 0;
  padding: 0;
}
.n-config-provider {
  width: 100%;
  height:100vh;
}
</style>
