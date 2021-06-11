<template>
  <div class="settings">
    <header class="winbar">
      <h1 class="windowTitle">
        Paramètres d'application
      </h1>
      <i
        class=" btnClose bi bi-x"
        @click="closeApp"
      />
    </header>
    <section class="contents scrollable">
      <n-select v-model:value="shortcut" :options="shortcuts" />
      <form>
        <h1>Configuration de l'utilisateur</h1>
        <div class="group">
          <input
            v-model="nickname"
            class="inputed"
            name="one"
            type="text"
          >
          <label
            class="labeler"
            for="one"
            :class="nickname != '' ? 'notEmpty' : null"
          >Nom d'utilisateur</label>
        </div>
        <h1>Discord Rich presence</h1>
        <div class="group">
        <input
            v-model="playingGame"
            class="inputed"
            name="play"
            type="checkbox"
          >
          <label
            class="labeler"
            for="play"
          >Montrer le jeu que tu joues ? </label>
        </div>

        <p style="padding-bottom:0px ">L'actualisation du statut peut prendre un certain delais que je compte réduire à l'avenir, merci de votre compréhension</p>
        

        <div class="group">
          <input
            v-model="customStatus"
            class="inputed"
            name="one"
            type="text"
          >
          <label
            class="labeler"
            for="one"
            :class="customStatus != '' ? 'notEmpty' : null"
          >Définir un statut personnalisé, Ex : Je suis une licorne !</label>
        </div>
        <!-- <span>Timer actualisation du statut discord</span>
        <select
          v-model="refreshStatusTime"
          name="refreshStatusVal"
        >
          <option
            v-for="stc in refreshStatusVal"
            :key="stc.id"
            v-bind:value="{ time: stc.time, value: stc.value }"
          >
            {{ stc.value }}
          </option>
        </select> -->
        <h1>Configuration de l'application</h1>
        <div class="group">
          <input
            v-model="startup"
            class="inputed"
            name="two"
            type="checkbox"
          >
          <label
            class="labeler"
            for="two"
          >Démarrer l'application à l'ouverture de windows ? </label>
        </div>
        <span>Theme</span>
        <select
          v-model="theme"
          name="refreshStatusVal"
        >
          <option
            v-for="thm in themes"
            :key="thm.id"
            :value="thm"
          >
            {{ thm }}
          </option>
        </select>
        <span>Raccourcis clavier</span>
        <select
          v-model="shortcut"
          name="Shortcuts"
        >
          <option
            v-for="stc in shortcuts"
            :key="stc.id"
            :value="stc ? stc : ''"
          >
            {{ stc ? stc : 'Selectionner une option' }}
          </option>
        </select>
      </form>
      
      <div class="wrapperBtn">
        <div class="btnGroup">
          <button class="uk-button uk-button-primary save" @click="save">Sauvegarder</button>
          <button class="uk-button uk-button-danger" @click="closeApp">Annuler</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
const electron = window.require ? window.require('electron') : null
import { NSelect } from 'naive-ui'
import settings from 'electron-settings';
export default {
  name: 'Settings',
  components: {
    NSelect
  },
  data () {
    return {
      nickname: '',
      startup: false,
      playingGame: true,
      shortcut: '',
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
      themes: ['dark', 'light'],
      theme: '',
    }
  },
  mounted () {
    this.syncData()
  },
  methods: {
    async syncData () {
      this.nickname = await settings.get('parameters.name');
      this.shortcut = await settings.get('parameters.trigger');
      this.startup = await settings.get('parameters.autostart');
      this.customStatus = await settings.get('parameters.customStatus');
      this.refreshStatusTime = await settings.get('parameters.refreshStatusTime')
      this.theme = await settings.get('parameters.theme_selected')
      this.playingGame = await settings.get('parameters.showPlaying')
      console.log(this.playingGame)
    },
    async save () {
      settings.configure({prettify: true});
      
      await settings.set('parameters.name', this.nickname);
      await settings.set('parameters.trigger', this.shortcut);
      await settings.set('parameters.autostart', this.startup);
      await settings.set('parameters.customStatus', this.customStatus);
      //await settings.set('parameters.refreshStatusTime', this.refreshStatusTime);
      await settings.set('parameters.theme_selected', this.theme); 
      await settings.set('parameters.showPlaying', this.playingGame); 

      electron.ipcRenderer.send('themeChanged', this.theme === 'dark' ? true : false)
      electron.ipcRenderer.send('saveSettings')
    },
    closeApp () {
      electron.ipcRenderer.send('closeSettings')
    }
  }
}
</script>

<style lang="scss" >
@import '@/assets/style/global.scss';

.settings {
  color: white;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  overflow-x: hidden;
  background: #0d1117;
  font-family: 'Nunito', sans-serif;
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
  background: #0d1117;

  &:before {
    position: absolute;
    content: '';
    bottom: -20px;
    width: 100%;
    height: 20px;
    left: 0;
    background: linear-gradient(to bottom, rgba(13, 17, 23, .8), transparent);
  }

  .windowTitle {
    font-size: .8em;
    font-weight: 200;
    margin: auto auto auto 15px;
    text-transform: uppercase;
    font-family: 'Nunito', sans-serif;
    color: rgba(255, 255, 255, 0.2);
  }

  .btnClose {
    -webkit-app-region: no-drag;
    color: rgba(255, 255, 255, 0.5);
    font-size: 2em;
    margin: auto 20px auto auto;
    cursor: pointer;

    &:hover {
      color: white
    }
  }
}

.group {
  position: relative;
  margin: 45px auto;
  height: fit-content;
}

label.labeler {
  color: #999;
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 0;
  top: 50%;
  margin: 0 20px;
  transform: translateY(-50%);
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;

  &.notEmpty {
    top: -20px !important;
    font-size: 14px;
    color: white;
  }
}

input[type=text].inputed {
  display: block;
  background: linear-gradient(to right, rgba(61, 123, 146, 0.18) 0%, rgba(54, 110, 130, 0.42) 100%);
  border: none;
  outline: none;
  border-radius: 5px;
  width: 100%;
  font-size: 1.05em;
  padding: 15px 24px;
  box-sizing: border-box;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bolder;
  letter-spacing: 1.1px;

  &.active,
  &:focus {
    background: linear-gradient(to right, rgba(61, 123, 146, 0.18) 0%, rgba(54, 110, 130, 0.42) 100%);
    animation: GameTileBorderGlow 0.2s forwards;
    color: white;
  }

  &:focus~label {
    top: -20px;
    font-size: 14px;
    color: white;
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
    padding: 24px 10px;
    font-size: 1.5em;
    font-weight: 200;
    margin-bottom: 20px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
  }
  p {
    color: rgba(white, 10%);
    font-size: 13px;
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
  }
  button { 
    margin: auto 0 auto 10px;
    pointer-events: all;
    height: 100%;
    &.save {
      background:rgba(46, 204, 113, 1)
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
