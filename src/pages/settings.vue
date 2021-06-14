<template>
  <div class="settings" :class="isDarkness ? 'dark' : 'light'">
    <header class="winbar" :class="isDarkness ? 'dark' : 'light'">
      <h1 class="windowTitle">
        Paramètres d'application
      </h1>
      <i
        class=" btnClose bi bi-x"
        @click="closeApp"
      />
    </header>
    <section class="contents scrollable">
      <n-form style="padding-bottom: 50px">
        <n-space item-style="display: flex;" vertical>
          <n-divider title-placement="left">
            <n-icon>
              <Apps />
            </n-icon>
            <p style="margin-left:5px">Paramètres globaux</p>
          </n-divider>
          <n-form-item label="Nom d'utilisateur" style="width:100%">
            <n-input v-model:value="nickname" type="input" size="large" placeholder="Pseudo..." >
              <template #prefix>
                <n-icon>
                  <person />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item label="Raccourci clavier" style="width:100%">
            <n-select v-model:value="shortcut" :options="shortcuts" size="large"/>
          </n-form-item>
          <n-form-item label="Theme" style="width:100%">
            <n-select v-model:value="windows_color" :options="themes" size="large"/>
          </n-form-item>
          <n-form-item label="Ou alors choisi ta couleur !">
            <n-color-picker v-model:value="windows_color" :modes="['hex']"/>
          </n-form-item>
          
          <n-checkbox
            v-model:checked="startup"
            label="Lancer l'application au démarrage de windows ?"
          />
          <n-checkbox
            v-model:checked="appBoxed"
            label="Ouvrir l'application en mode boite ? (Redémarrage de l'application nécessaire)"
          />
          <n-divider title-placement="left">
            <n-icon>
              <logo-discord />
            </n-icon> <p style="margin-left:5px">Paramètres Discord</p>
          </n-divider>
          
          <n-form-item label="Personnaliser le statut Discord" style="width:100%">
            <n-input v-model:value="customStatus" type="input" size="large" placeholder="Statut discord personnalisé...">
              <template #prefix>
                <n-icon>
                  <logo-discord />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-checkbox
            v-model:checked="playingGame"
            label="Montrer à quoi tu joues ?"
          />
        </n-space>
      </n-form>

      <div class="wrapperBtn">
        <div class="btnGroup">
          <n-space>
            <n-button type="success" @click="save">Sauvegarder</n-button>
            <n-button type="error" @click="closeApp">Annuler</n-button>
          </n-space>
        </div>
      </div>
    </section>
  </div>
  <n-modal
    v-model:show="panels.confirmation"
    :mask-closable="false"
    preset="confirm"
    title="Redémarrage nécessaire"
    content="Voulez-vous redémarrer?"
    positive-text="Confirmer"
    @positive-click="reboot"
    @negative-click="!panels.confirmation"
    negative-text="Annuler"
  />
</template>

<script>
import { defineComponent, ref } from 'vue'
const electron = window.require ? window.require('electron') : null
import { NForm, NSelect, NSpace, NCheckbox, NButton, NFormItem, NInput, NColorPicker, NDivider, NIcon, NModal  } from 'naive-ui'
import { LogoDiscord, Person, Apps } from '@vicons/ionicons5'
import settings from 'electron-settings';
export default defineComponent({
  name: 'Settings',
  components: {
    NForm,
    NSelect,
    NSpace,
    NCheckbox,
    NButton,
    NFormItem,
    NInput,
    NColorPicker,
    NDivider,
    NIcon,
    LogoDiscord,
    Person,
    Apps,
    NModal
  },
  data () {
    return {
      panels: {
        confirmation: false,
      },
      isDarkness: null,
      nickname: '',
      startup: false,
      playingGame: true,
      shortcut: '',
      appBoxed: null,
      oldAppBoxed: null,
      windows_color: "#202425E6",
      shortcuts: [
        {
          label: "Ctrl+G",
          value: 'Ctrl+G',
          disabled: false
        },
        {
          label: "Ctrl+H",
          value: 'Ctrl+H',
          disabled: false
        }],
      customStatus: '',
      refreshStatusTime: { time: null, value: "" },
      refreshStatusVal: [
        { time: 4e3, value: "4s, wow t'es un ouf" },
        { time: 5e3, value: "5s, Ok normal" },
        { time: 10e3, value: "10s, Toi, t'es pas pressé.." },
      ],
      themes: [
        {
          label: "Sombre",
          value: '#202425E6',
          disabled: false
        },
        {
          label: "Clair",
          value: '#EEEEEE44',
          disabled: false
        }],
    }
  },
  mounted () {
    this.syncData()
    
  },
  methods: {
    deriveTheme(color) {
      var c = color.substring(1).slice(0, -2);      // strip #
      var rgb = parseInt(c , 16);   // convert rrggbb to decimal
      var r = (rgb >> 16) & 0xff;  // extract red
      var g = (rgb >>  8) & 0xff;  // extract green
      var b = (rgb >>  0) & 0xff;  // extract blue

      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      if (luma < 40) {
        this.isDarkness = true
      } else {
        this.isDarkness = false
      }
    },
    async syncData () {
      this.nickname = await settings.get('parameters.name');
      this.shortcut = await settings.get('parameters.trigger');
      this.startup = await settings.get('parameters.autostart');
      this.appBoxed = await settings.get('parameters.boxed')
      this.oldAppBoxed = await settings.get('parameters.boxed')
      this.customStatus = await settings.get('parameters.customStatus');
      this.refreshStatusTime = await settings.get('parameters.refreshStatusTime')
      this.themeDarkess = await settings.get('parameters.themeDark')
      this.playingGame = await settings.get('parameters.showPlaying')
      this.windows_color = await settings.get('parameters.windows_color')
      this.deriveTheme(this.windows_color)
      console.log(this.playingGame)
    },
    async save () {
      settings.configure({prettify: true});
      
      await settings.set('parameters.name', this.nickname);
      await settings.set('parameters.trigger', this.shortcut);
      await settings.set('parameters.autostart', this.startup);
      await settings.set('parameters.customStatus', this.customStatus);
      
      //await settings.set('parameters.refreshStatusTime', this.refreshStatusTime);
      await settings.set('parameters.showPlaying', this.playingGame); 
      await settings.set('parameters.windows_color', this.windows_color)
      console.log('i edit: ' + this.windows_color)
      this.$store.dispatch('SET_THEME', this.windows_color)
      if(this.oldAppBoxed != this.appBoxed) {
        this.panels.confirmation = true
      } else {
        setTimeout(() => {
          electron.ipcRenderer.send('saveSettings', {theme: this.windows_color})
        }, 200)
      }
      
    },
    async reboot() {
      await settings.set('parameters.boxed', this.appBoxed)
      electron.ipcRenderer.send('saveSettingsWithReboot', {theme: this.windows_color})
    },
    closeApp () {
      electron.ipcRenderer.send('closeSettings')
    }
  }
})
</script>

<style lang="scss" >
@import '@/assets/style/global.scss';


.n-divider__title {
  opacity: 0.5;
  text-transform: uppercase;
  font-weight: bold;
  font-size:0.7em;
}
.n-form-item .n-form-item-label {
  opacity: 0.5;
}
.settings {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  overflow-x: hidden;
  font-family: 'Nunito', sans-serif;
}

.settings.dark {
  background: #0d1117;
}
.settings.light {
  background: #dddddd;
}

header.winbar {
  -webkit-app-region: drag;
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 0.5rem);
  height: 55px;
  display: flex;
  vertical-align: middle;
  z-index: 999999;
  cursor: move;
  &.dark {
    background: #0d1117;
  }
  &.light {
    background: #dddddd;
  }

  &:before {
    position: absolute;
    content: '';
    bottom: -20px;
    width: 100%;
    height: 20px;
    left: 0;
  }
  // Ajoute une ombre à l'header (pas sûr que ce soit réellement jouli en fait compte...)
  // &.light:before {
  //   background: linear-gradient(to bottom, rgba(197, 197, 197, 0.3), transparent);
  // }
  // &.dark:before {
  //   background: linear-gradient(to bottom, rgba(13, 17, 23, .3), transparent);
  // }

  .windowTitle {
    font-size: .8em;
    font-weight: 100;
    margin: auto auto auto 15px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
    color: rgb(28, 37, 48);
  }

  .btnClose {
    -webkit-app-region: no-drag;
    opacity: 0.5;
    font-size: 2em;
    margin: auto 20px auto auto;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}

/* Track */
::-webkit-scrollbar-track {
  border-radius: 0.5rem;
  background: #0d1117;
}

/* Handle */
::-webkit-scrollbar-thumb {
  -webkit-border-radius: 0.5rem;
  border-radius: 0.5rem;
  width: 0.5rem;
  background: rgba(173, 184, 194, 0.2);
}

::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(127, 137, 146, 0);
}

.contents {
  position: relative;
  display: block;
  width: 100%;
  margin-top: 60px;
  height: auto;
  text-align: initial;
  padding: 0 24px;

  box-sizing: border-box;

  h1 {
    padding: 12px 10px;
    font-size: 1.1em;
    font-weight: 200;
    margin-bottom: 0px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
  }
}

.wrapperBtn {
  position: sticky;
  display: flex;
  bottom: 20px;
  width:100%;
  margin:0; 
  right:0;
  pointer-events: none;
  .btnGroup {
    display: flex;
    margin: auto 0 auto auto;
    width:fit-content;
    button {
      pointer-events: all;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1.02);
  }

  50% {
    transform: scale(0.99);
  }

  100% {
    transform: scale(1.02);
  }
}

</style>
