import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueHotkey from 'v-hotkey'
import Helpers from '@/plugins/helpers.ts'
import contextmenu from 'v-contextmenu'
import 'v-contextmenu/dist/themes/default.css'

createApp(App)
  .use(router)
  .use(store)
  .use(Helpers)
  .use(contextmenu)
  .directive('hotkey', {
    beforeMount: VueHotkey.directive.bind,
    updated: VueHotkey.directive.componentUpdated,
    unmounted: VueHotkey.directive.unbind
  })
  .mount('#app')
