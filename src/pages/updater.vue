<template>
  <div class="wrapper">
    <div class="container">
      <span class="title">D</span>
      <span class="title">A</span>
      <span class="title">S</span>
      <span class="title">H</span>
    </div>
    <div class="loading">
      <img class="logo" src="img/iconSplash.png" />
      <p id="version">V. {{appVersion}}</p>
      <div class="content">
        <div class="loginfo" id="messages">{{message}}</div>
        <div id="quitAndInstall" class="btn-group updatePrompt">
          <!-- <button id="accept" class="accept" @click="quitAndInstall">Installer</button> -->
          <button id="cancel" class="cancel" @click="cancelUpdate">Annuler</button>
        </div>
        <progress  id="downloadProgress" class="updateAvalaible"></progress>
        <p id="speed" class="dlSpeed updateAvalaible"></p>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer} from 'electron'

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes /s', 'KB /s', 'MB /s', 'GB /s', 'TB /s', 'PB /s', 'EB /s', 'ZB /s', 'YB /s'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default {
  name: "updater",
  data() {
    return {
      appVersion: null,
      message: "Chargement...",
      progressValue: 0,
      dlSpeed: null,
      updateAvailable: false,
      updateDownloaded: false
    }
  },
  created() {
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      this.appVersion = arg.version;
      console.log(arg.version)
    });
  },
  mounted() {
    this.$nextTick(function () {
      const progress = document.getElementById("downloadProgress")
      const buttonInstall = document.getElementById("quitAndInstall")
      const message = document.getElementById('messages');
      const speed = document.getElementById("speed")
      const promptUpdate = document.getElementById("updateBtn")

      ipcRenderer.on('message', function(event, text) {
        console.log(text)
        message.innerHTML = text;
      })

      ipcRenderer.on('updateFound', function(event) {
        promptUpdate.style.display = "block"
      })

      ipcRenderer.on('speed', function(event, text) {
        console.log(text)
        speed.innerHTML = formatBytes(text)
      })

      ipcRenderer.on('UpdaterError', function(event) {
        buttonInstall.style.display = "block"
      })

      ipcRenderer.on('percentage', function(event, text) {
        console.log(text / 1000)
        progress.style.display = "block"
        progress.value = text / 100;
      })
      ipcRenderer.on('downloadFinish', function(event) {
        console.log(event)
        progress.style.display = "none"
        //buttonInstall.style.display = "block"
        speed.style.display = "none"
      })
    });
    
  },
  methods: {
    quitAndInstall() {
      ipcRenderer.send('launchInstall')
    },
    acceptUpdate() {
      ipcRenderer.send('acceptUpdate')
    },
    cancelUpdate() {
      ipcRenderer.send('cancelUpdate')
    },
  }
}
</script>
<style lang="scss" scroped>
    @import url('https://fonts.googleapis.com/css2?family=Paytone+One&display=swap');
    :root {
      --background: #4285f4;
      --primary-color: #000;
    }

    body, html {
      background: transparent;
      overflow: hidden;
      
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      position: relative;
      overflow: hidden;
      border-radius: 5px;
      background: linear-gradient( 135deg ,  rgb(14, 22, 26) 0%,  rgb(38, 59, 66) 100%);
      
      width: 100%;
      height: 100%;
    }
    .updatePrompt {
      display: none;
      button{
        border:none;
        color: white;
        font-family: "Paytone One", sans-serif;
        font-size: 18px;
        padding: 12px 18px 15px 18px;
        border-radius: 5px;
        margin: 15px 5px;
        cursor: pointer;
        transition: all 0.5s;
        text-transform: uppercase;
        -webkit-app-region: no-drag;
        &.accept {
          background: linear-gradient(to right, rgba(#2ecc71, 50%) 0%, rgba(#27ae60, 100%) 100%);
        }
        &.cancel {
          background: linear-gradient(to right, rgba(#fd1d55, 50%) 0%, rgba(#c91743, 100%) 100%);
        }
        &:hover{ 
          transform: scale(1.1);
        }
      }
    }

    #downloadProgress {
      display: none;
    }
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      border-radius: 5px;
      color: #fff;
      font-family: "Paytone One", sans-serif;
      -webkit-app-region: drag;
    }
    .content {
      position: absolute;
      bottom: 5%;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      opacity: 0;
      animation: opacityShow 0.8s ease-in-out;
      animation-delay: 1.8s;
      animation-fill-mode: forwards;
    }
    .logo {
      width: 100px;
      margin-bottom: 50px;
      opacity: 0;
      animation: opacityShow 0.8s ease-in-out;
      animation-delay: 2s;
      animation-fill-mode: forwards;
    }
    .loginfo {
      font-size: 18px;
    }

    progress {
      -webkit-appearance: none;
      height: 6px;
      margin-top: 25px;
      width: 80%;
      border-radius: 6px;
    }
    #progress, #speed {
      opacity: 0;
      
    }
    .updateAvalaible {
      animation: opacityShow 0.8s ease-in-out;
      animation-fill-mode: forwards;
    }

    ::-webkit-progress-value {
      background-color: white;
    }

    ::-webkit-progress-bar {
      background-color: rgba(24,24,24, .3);
      border-radius: 2px;
      overflow: hidden;
    }
    .dlSpeed {
      width: 80%;
      text-align: right;
    }

    .container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      height: 100vh;
      width: 100vw;
      animation: lift 0.8s ease-in-out;
      animation-delay: 1.6s;
      animation-fill-mode: forwards;
      border-radius: 5px;
    }

    .title {
      font-size: 81px;
      color: #fff;
      text-align: center;
      font-family: "Paytone One", sans-serif;
      animation: wave 0.4s, jump 1s;
      position: relative;
      top: 0;
      padding: 4px;
      opacity: 0;
      z-index: 3;
      animation-fill-mode: forwards;
    }

    span:nth-of-type(1) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.05s;
    }

    span:nth-of-type(2) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.1s;
    }

    span:nth-of-type(3) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.15s;
    }

    span:nth-of-type(4) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.2s;
    }

    /* span:nth-of-type(5) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.25s;
    }

    span:nth-of-type(6) {
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.3s;
    } */

    /* span:nth-of-type(7) {
      //left: 4.8rem;
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.35s;
    }

    span:nth-of-type(8) {
      //left: 5.6rem;
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.4s;
    }

    span:nth-of-type(9) {
      //left: 6.4rem;
      animation: wave 0.4s, jump 1.1s ease-in-out alternate 0.45s;
    } */

    @keyframes opacityShow {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes wave {
      0% {
        top: 0%;
      }
      100% {
        top: 100%;
      }
    }
    @keyframes jump {
      0% {
        transform: translate3d(0, 0, 0);
        opacity: 0;
      }
      90% {
        transform: translate3d(0, -16%, 0);
        opacity: 1;
      }
      100% {
        transform: translate3d(0, -32%, 0);
        opacity: 1;
      }
    }
    @keyframes lift {
      0% {
        transform: translate3d(0, 0, 0);
        opacity: 1;
        visibility: visible;
      }
      100% {
        transform: translate3d(0, -100%, 0);
        opacity: 1;
        visibility: hidden;
      }
    }
    @keyframes appear {
      0% {
        visibility: hidden;
      }
      100% {
        visibility: visible;
      }
    }
  </style>