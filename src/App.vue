<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  data () {
    return {
      //
    }
  }
})
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
</style>
