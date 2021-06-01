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
      <form>
        {{ $router.path }}
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
        <button
          class="btn save"
          @click="save"
        >
          Sauvegarder
        </button>
        <button
          class="btn cancel"
          @click="closeApp"
        >
          Fermer
        </button>
      </div>
    </section>
  </div>
</template>

<script>

const electron = window.require ? window.require('electron') : null
import settings from 'electron-settings';
export default {
  name: 'Settings',
  data () {
    return {
      nickname: '',
      startup: false,
      shortcut: '',
      shortcuts: ['Ctrl+G', 'Ctrl+H']
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
    },
    async save () {
      await settings.set('parameters', {
        name: this.nickname,
        trigger: this.shortcut,
        autostart: this.startup
      });
      electron.ipcRenderer.sendSync('closeSettings', true)
    },
    closeApp () {
      electron.ipcRenderer.sendSync('closeSettings', true)
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
  margin-bottom: 45px;
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
    margin-bottom: 50px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
  }
}

.wrapperBtn {
  position: sticky;
  display: flex;
  bottom: 20px;
  width: 100%;
  height: 55px;
  justify-content: center;
  vertical-align: center;

  button.btn {
    width: 150px;
    height: 40px;
    border: none;
    outline: none;

    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: 0.4s all;
    cursor: pointer;
    border-radius: 3px;
    color: white;

    &.save {
      margin: auto 10px auto auto;
      background: rgba(46, 204, 113, 1);

      &:hover {
        background: lighten(rgba(46, 204, 113, 1), 10%)
      }
    }

    &.cancel {
      margin: auto 10px auto 0;
      background: rgba(243, 106, 99, 1);

      &:hover {
        background: lighten(rgba(243, 106, 99, 1), 10%)
      }
    }

    &:hover {
      animation: pulse 2.4s ease infinite;
      transition: 0.4s all;
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
