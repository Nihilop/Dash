<template>
  <div>
    <div v-hotkey="keymap">
      <div class="microNav">
        <button
          class="addGames"
          @click="manualAdd = !manualAdd"
        >
          <i class="bi bi-plus" />
        </button>
        <button
          class="refreshGames"
          @click="refreshGames"
        >
          <i class="bi bi-arrow-counterclockwise" />
        </button>
      </div>
      <header class="searchAndFilter">
        <div class="formGroup">
          <i class="bi bi-search" />
          <input
            v-model="SearchGame"
            type="search"
            placeholder="Chercher un jeu..."
          >
        </div>
        <div class="tags">
          <ul>
            <li
              v-for="cat in category"
              :key="cat.id"
              :class="SelectedCat === cat ? 'active' : null"
              @click="setCat(cat)"
            >
              {{ cat }}
            </li>
          </ul>
        </div>
      </header>
      <div
        v-if="gamesLoaded"
        class="games_container"
      >
        <transition-group
          tag="main"
          name="card"
        >
          <article
            v-for="(game, index) in filterComponents"
            :key="index"
            v-contextmenu:[game.name]
            class="card"
          >
            <div class="image">
              <!-- <img v-if="image['#text'] !== ''" :src="image['#text']" :alt="album.name" v-on:load="isLoaded()" v-bind:class="{ active: isActive }"> -->
              <img
                v-if="game.game"
                :src="game.game.cover"
                :alt="game.name"
                :class="{ active: isActive }"
                @click.prevent="game.origin === 'steam' || 'bnet' ? openDetail(game) : launchApp (game.nodeKey)"
                @load="isLoaded()"
              >
              <img
                v-else
                src="/img/bg2.jpg"
                :alt="game.name"
                :class="{ active: isActive }"
                @click.prevent="game.origin === 'steam' || 'bnet' ? openDetail(game) : launchApp (game.nodeKey)"
                @load="isLoaded()"
              >
              <div
                v-if="game.origin === 'local'"
                class="iconApp"
              >
                <Promised
                  v-if="game.data.mimeType == 'application/x-ms-shortcut'"
                  :promise="$getIco(game.nodeKey)"
                >
                  <template #default="data">
                    <img
                      class="iconCover"
                      :src="data"
                      :class="{ active: isActive }"
                      @load="isLoaded()"
                    >
                  </template>
                </Promised>
                <Promised
                  v-else-if="game.data.mimeType === 'application/x-msdos-program'"
                  :promise="$getExeIcon(game.nodeKey)"
                >
                  <template #default="data">
                    <img
                      class="iconCover"
                      :src="data"
                      :class="{ active: isActive }"
                      @load="isLoaded()"
                    >
                  </template>
                </Promised>
              </div>

              <button
                v-if="game.origin === 'steam' || 'bnet'"
                class="launchBtn"
                @click="game.origin === &quot;bnet&quot; ? openBnetGame(game) : openSteamGame(game)"
              >
                <i class="bi bi-play-fill" />
              </button>
            </div>
            <div
              class="description"
              @click="game.origin === 'steam' ? openDetail(game) : launchApp (game.nodeKey)"
            >
              <h3 class="title">
                {{ game.name }}
              </h3>
              <p class="origin">
                {{ game.origin ? game.origin : 'External' }}
              </p>
            </div>
            <v-contextmenu :ref="game.name">
              <v-contextmenu-item
                class="rightClickDelete"
                @click="removeToLauncher(game)"
              >
                <i
                  class="bi bi-trash"
                  style="margin-right:5px"
                />Supprimer
              </v-contextmenu-item>
            </v-contextmenu>
          </article>
          <h1
            v-if="filterComponents.length <= 0"
            key="noRst"
            class="noResults"
          >
            Aucun résultat(s) trouvé(s)
          </h1>
        </transition-group>
      </div>
    </div>
    <game-details
      v-if="gameDetails"
      v-model="gameDetails"
      width="900px"
    >
      <template #header>
        <div
          v-if="gameData.game.background"
          class="headerBG"
          :style="gameData.game.background"
        >
          <video
            autoplay
            muted
            loop
            class="videoCover"
          >
            <source
              :src="gameData.game.video"
              type="video/mp4"
            >
            Your browser does not support HTML5 video.
          </video>
          <div class="coverGame">
            <div class="gameInfos">
              <img :src="gameData.game.cover">
              <p>{{ gameData.game.app_name }}</p>
              <button
                class="shortLaunch"
                @click="gameDetails.origin === &quot;bnet&quot; ? openBnetGame(gameData) : openSteamGame(gameData), (gameDetails = false)"
              >
                <i class="bi bi-play-fill" />
                <span>Lancer !</span>
              </button>
            </div>
            <div class="meta">
              <ul class="metacat">
                <li
                  v-for="item in gameData.game.categories.slice(0, 4)"
                  :key="item.index"
                >
                  {{ item }}
                </li>
                <li v-if="gameData.game.categories.length > 5">
                  + {{ gameData.game.categories.length - 4 }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          v-else
          class="headerBG"
          :style="'background: url('+gameData.game.cover+'); background-size:cover; background-repeat:no-repeat;'"
        >
          <div class="coverGame">
            <div class="gameInfos">
              <img :src="gameData.game.cover">
              <p>{{ gameData.label }}</p>
              <button
                class="shortLaunch"
                @click="gameDetails.origin === &quot;bnet&quot; ? openBnetGame(gameData) : openSteamGame(gameData), (gameDetails = false)"
              >
                <i class="bi bi-play-fill" />
                <span>Lancer !</span>
              </button>
            </div>
            <div class="meta">
              <ul class="metacat">
                <li>
                  Metas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
      <template #body>
        <div v-if="gameData.game.description" v-html="gameData.game.description" />
      </template>
    </game-details>
    
    <modal
      v-model="manualAdd"
      :close-btn="false"
    >
      <template #header>
        Ajouter au launcher manuellement
      </template>
      <template #body>
        <p> Add</p>
        <input
          type="file"
          placeholder="Ajouter"
        >
      </template>
      <template #actions>
        <button
          type="primary"
          @click="manualAdd = false"
        >
          Ajouter
        </button>
      </template>
    </modal>

    <modal
      v-model="steamModal"
      :close-btn="false"
    >
      <template #header>
        Metadonnées
      </template>
      <template #body>
        <progress :value="SteamLoading" />
        <p>{{ loadMessage }}</p>
      </template>
    </modal>
  </div>
</template>

<script>
// Imports global
import { openDB } from 'idb'
import modal from '@/widgets/Dialog.widget'
import gameDetails from '@/widgets/Details.widget.vue'
import { Promised } from 'vue-promised'
import path from 'path'

// Impots libs
const scraper = require('@/lib/steamScraper')
const fs = require('fs')
const electron = window.require ? window.require('electron') : null
const { shell, Notification  } = require('electron')

/* eslint-disable no-alert, no-console */
function getValues (obj, key) {
  var objects = []
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue
    if (typeof obj[i] === 'object') {
      objects = objects.concat(getValues(obj[i], key))
    } else if (i === key) {
      objects.push(obj[i])
    }
  }
  return objects
}
/* eslint-enable no-alert, no-console */

// Vue Instance
export default {
  components: {
    modal,
    gameDetails,
    Promised
  },
  data () {
    return {
      isActive: false,
      indexDbGame: null,
      dbName2: 'games',
      dbGmName: 'games',
      datas: [],
      loading: false,
      steamModal: false,
      gameDetails: false,
      manualAdd: false,
      gameData: {},
      SteamLoading: 0,
      loadMessage: '',
      gamesLoaded: false,
      apiKey: '882842ac059a4013ad679486b1e64eca',
      SearchGame: '',
      category: ['All', 'steam', 'bnet', 'local'],
      SelectedCat: 'All',

      steamPath: [],
      bnetPath: [],
      originPath: [],
      epicPath: []
    }
  },
  computed: {
    keymap () {
      return {
        esc: this.escp
      }
    },
    filterComponents () {
      console.log(this.SelectedCat)
      if (this.SearchGame !== '') {
        return this.$store.state.gameList.filter(item => {
          return item.label.toLowerCase().includes(this.SearchGame.toLowerCase()) || item.origin.toLowerCase().includes(this.SearchGame.toLowerCase())
        })
      } if (this.SelectedCat !== '' && this.SelectedCat !== 'All') {
        return this.$store.state.gameList.filter(item => {
          return item.origin.includes(this.SelectedCat)
        })
      }

      return this.$store.state.gameList
    }

  },
  async created () {
    this.getBnetPath()
    this.initialize()
  },
  methods: {
    setCat (item) {
      this.SelectedCat = item
    },
    isLoaded: function () {
      this.isActive = true
    },
    // Open and Init DB
    async initialize () {
      this.initIndexDbGame()
      this.indexDbGame = await this.initIndexDbGame()
      console.log('initialize indexDb : ', this.indexDbGame)
      this.setGameList()
    },
    async initIndexDbGame () {
      return await openDB(this.dbName2, 2, {
        upgrade: db => {
          db.createObjectStore(this.dbGmName)
        }
      })
    },
    refreshGames () {
      this.steamModal = true
      setTimeout(() => {
        this.WalkSteamDir()
        this.WalkBnetDir()
      }, 500)
    },
    // BattleNET Games
    getBnetPath() {
      const process = require('process')
      const battleNetModuleConfig = '%appdata%/Battle.net/Battle.net.config'
      const configFilePath = path.resolve(battleNetModuleConfig.replace('%appdata%', process.env.APPDATA))
      this.loading = true
      this.bnetPath = configFilePath
      console.log(`battleNet trouvé, informations ici : ${this.bnetPath}. Nous allons envoyer la sauce !`);
    },
    async WalkBnetDir () { 
      let timer
      if(this.bnetPath.length >= 0) {
        //Progress bar 1/2
        timer = setInterval(() => {
          this.SteamLoading += 0.01
          if (this.SteamLoading === 0.5) {
            this.loading = false
            clearInterval(timer)
          }
        }, 10)
        const config = await fs.readFileSync(this.bnetPath)
        const parsed = JSON.parse(config)
        const clientRoot = parsed.Client.Install.DefaultInstallPath.toString()
        const Launcherpath = await getValues(parsed, 'Path')
        localStorage.bnetRoot = Launcherpath[0] + '\\Battle.net.exe'

        const bnetGamesfolders = electron.ipcRenderer.sendSync('req_bnet', clientRoot)
        const bnetContents = bnetGamesfolders.contents
        console.log(bnetContents)

        if(bnetContents.length > 0) {
          bnetContents.forEach(elem => {
            this.addToLauncher(elem)
          })
        } 

      } else {
        this.steamModal = false
        console.log("Il semblerait qu'une erreur innatendue soit arrivée !")
      }
    },


    // -------------------------------------------
    //   A REFAIRE PROPREMENT
    // -------------------------------------------
    async WalkSteamDir () {
      
      let origins = []
      // Résultats
      const resultPath_ = []
      let acfFiles = []
      let results
      let resObj = null
      const appIds_ = []
      let timer

      // Origins call req_steam (Chemins configurer avec Steam ou tu installes tes jeux)
      origins = await electron.ipcRenderer.sendSync('req_steam')

      // Boucles logiques
      origins.forEach(FoldersPath => {
        const res = electron.ipcRenderer.sendSync('req_folderContents', FoldersPath.id)
        const resParse = JSON.parse(res)
        const newContents = resParse.contents
        resultPath_.push(newContents)
        this.loadMessage = 'Recherche des racines Steam'
        

        // check les perfs
        if (resultPath_.length >= 2) {
          acfFiles = [].concat.apply([], resultPath_).filter(word => word.nodeKey.includes('.acf'))
        }
      })

      // Only ACF Files
      acfFiles.forEach(read => {
        const parsedACF = this.AppManifestParser(read.nodeKey)
        appIds_.push(parsedACF)
      })

      // Parcours les ID et les maps en item utilisable
      appIds_.forEach(res => {
        results = []
        scraper.getData(res.AppState.appid, function (err, data) {
          if (err) console.log(err)
          const result = { app: res, meta: data }
          const response = electron.ipcRenderer.sendSync('req_steamID', result)
          resObj = JSON.parse(JSON.stringify(response))
          console.log(resObj)
          results.push(resObj)
        })

        setTimeout(() => {
          timer = setInterval(() => {
            this.SteamLoading += 0.01
            if (this.SteamLoading === 0.6) {
              clearInterval(timer)
            }
          }, 100)
          this.loadMessage = 'Application des metadonnées par ID steam'
          setTimeout(() => {
            timer = setInterval(() => {
              this.SteamLoading += 0.01
              if (this.SteamLoading === 1) {
                clearInterval(timer)
              }
            }, 100)
            this.loadMessage = 'Création de la base de données interne'
          }, 1000)
        }, 500)
      })


      setTimeout(() => {
        this.addScanToFav(results)
      }, 1000)
      
    },
    async addScanToFav (value) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      await value.forEach(fav => {
        if (allKeys.includes(fav.data.stat.ino)) {
          console.log(fav.data.stat.ino + ': déjà présent.')
        } else {
          this.addToLauncher(fav)
          console.log(fav + ': added')
        }
      })
    },
    // -------------------------------------------
    //   A REFAIRE PROPREMENT
    // -------------------------------------------


    // AddToDB
    async addToLauncher (item) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)

      if (allKeys.includes(item.data.stat.ino) === false) {
        await this.indexDbGame.add(this.dbGmName, JSON.parse(JSON.stringify(item)), item.data.stat.ino)
        setTimeout(() => {
          this.SteamLoading = 1
          this.loadMessage = 'Ajouts terminés'
          this.setGameList()
          setTimeout(() => {
            this.steamModal = false
          }, 1000)
        }, 1000)
        
      } else {
        setTimeout(() => {
          this.SteamLoading = 1
          this.loadMessage = 'Aucun élément ajouter'
          this.setGameList()
          setTimeout(() => {
            this.steamModal = false
          }, 1000)
        }, 1000)
      }
    },
    // RemoveToDB
    async removeToLauncher (item) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      console.log('Games allKeys : ', allKeys)
      const transaction = this.indexDbGame.transaction([this.dbGmName], 'readwrite')
      await transaction.objectStore(this.dbGmName).delete(item.data.stat.ino)
      this.setGameList()
    },
    // Set vuex from DB
    async setGameList () {
      const allItems = await this.indexDbGame.getAll(this.dbGmName)
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      this.$store.dispatch('GAME_LIST', allItems)
      this.$store.dispatch('GAME_KEYS', allKeys)
      this.gamesLoaded = true
    },
    // Return un ACF file parsé
    isNumeric (n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },
    recInt (obj) {
      for (var p in obj) {
        if (typeof obj[p] === 'object') obj[p] = this.recInt(obj[p])
        else if (typeof obj[p] === 'string' && this.isNumeric(obj[p])) obj[p] = parseInt(obj[p], 10)
      }
      return obj
    },
    AppManifestParser (file) {
      let c = fs.readFileSync(file).toString()
      c = c.split('\n').filter(e => !!e).map(line => line.replace(/^\t*/g, '').replace(/\t\t/g, ':')).map(line => {
        if (line.indexOf('}') !== -1 || line.indexOf('{') !== -1) return line
        if (line.indexOf(':') !== -1) return line + ','
        else return line + ':'
      })
      c = '{' + c.join('').replace(/,\}/g, '}').replace(/\}"/g, '},"') + '}'
      return this.recInt(JSON.parse(c))
    },
    // Details modal function
    openDetail (item) {
      if (item.game) {
        this.gameDetails = true
        this.gameData = item
      } else {
        console.log('La fenêtre modal doit être configué, demander au dev de se bouger le cul.')
      }
    },
    // Open apps
    openSteamGame (id) {
      shell.openExternal(`steam://run/${id.appid}`)
      electron.ipcRenderer.send('close')
      const data = id.name
      console.log(data)
      electron.ipcRenderer.send('game_launch', data.toString())
      console.log("Ouverture de l'application " + id.name)
    },
    openBnetGame (id) {
      const { exec } = require('child_process')
      exec(`"${localStorage.bnetRoot}" --exec="launch ${id.appid}"`)
      electron.ipcRenderer.send('close')
      electron.ipcRenderer.send('game_launch', id.name)
      console.log(id.appid)
    },
    launchApp (items) {
      shell.openPath(items)
      electron.ipcRenderer.send('close', true)
      console.log("Ouverture de l'application")
    },
    async escp () {
      console.log('Esc pressedS')
      setTimeout(() => {
        this.SelectedCat = 'All'
        this.SearchGame = ''
      }, 200)
      if (this.steamModal || this.gameDetails) {
        setTimeout(() => {
          this.steamModal = false
          this.gameDetails = false
        }, 200)
      }
      if (await this.steamModal === false && await this.gameDetails === false && await this.SelectedCat === 'All' && await this.SearchGame === '') {
        console.log(this.steamModal,
          this.gameDetails,
          this.SelectedCat,
          this.SearchGame)
        electron.ipcRenderer.send('close', true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/global.scss';

$background: #222129;
$card: rgba(white, 5%);
$spotify-green: rgb(30, 215, 96);
$spotify-black: rgb(25, 20, 20);
$grid-items: 5;
$grid-min: 175px;
$grid-gap: 30px;

a {
    color: white;
    text-decoration: none;
}

h1 {
    font-size: 25px;
    color: white;
}

h3 {
    font-size: 14px;
    margin-bottom: 5px;
}

h4 {
    font-size: 14px;
    margin-bottom: 10px;
    font-weight: 700;
}

p {
    margin-bottom: 16px;
    line-height: 1.5em;
}

.searchAndFilter {
  min-height: 150px;
  border-bottom: 1px solid rgba(white,5%);
  display: flex;
  flex-direction: column;
  .formGroup{
    position:relative;
    margin:auto auto 0 auto;
    width: fit-content;
    display: flex;
    vertical-align: middle;
    color: rgba(white, 10%);
    &:focus-within {
      input {
        outline: none;
        color: rgba(white, 100%);
        border-color: rgba($principal, 100%);
      }
      i {
        color: rgba(white, 100%);
      }
    }
    input {
      margin:auto 0;
      border: none;
      background:transparent;
      min-width: 700px;
      padding: 15px 18px 15px 50px;
      box-sizing: border-box;
      font-size: 1.2em;
      color: rgba(white, 10%);
      border-radius: 8px;
      border: 2px solid rgba($principal, 10%);
      transition: all 0.5s;

    }
    i {
      position:absolute;
      margin:auto;
      left: 18px;
      top:50%;
      transform: translateY(-50%);
    }
  }
  .tags {
    width: auto;
    margin: 20px auto auto auto;
    display: block;
    color: rgba(white,10%);
    ul {
      display: flex;
      vertical-align: middle;
      li {
        margin: auto 10px;
        font-size: 1.1em;
        text-transform: uppercase;
        font-weight: normal;
        transition: all 0.5s;
        &:hover {
          color: rgba(white,100%);
          cursor: pointer;
          transform: scale(1.1);
        }
        &.active {
          color: rgba(white,100%);
          font-weight: 600;
          transform: scale(1.1);
        }
      }
    }
  }
}

.noResults {
  position:absolute;
  top:50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  text-align: center;
}

.microNav {
  position:absolute;
  bottom:50px;
  right: 50px;
  height: 50px;
  width:auto;
  display: flex;
  vertical-align: middle;
  justify-content: center;
  z-index: 999;
  .addGames {
    width: 50px;
    height: 50px;
    background:none;
    border: 2.5px solid white;
    border-radius: 50%;
    color:white;
    font-size: 1.1em;
    display: flex;
    vertical-align: middle;
    justify-content: center;
    opacity: 0.3;
    cursor: pointer;
    margin: auto 5px;
    transition:all 0.5s;
    &:hover {
      opacity: 1;
      > i {
        color: #2ecc71;
        transform: scale(2);
      }
    }
    &:active, &:focus {
      //border: none;
      outline: none;
    }
    > i {
      margin:auto;
      padding-top: 2.5px;
      transition:all 0.5s;
    }
  }
  .refreshGames {
    width: 50px;
    height: 50px;
    background:none;
    border: 2.5px solid white;
    border-radius: 50%;
    color:white;
    font-size: 1.1em;
    display: flex;
    vertical-align: middle;
    justify-content: center;
    opacity: 0.3;
    cursor: pointer;
    margin: auto 5px;
    transition:all 0.5s;
    &:hover {
      opacity: 1;
      > i {
        transform: rotate(-90deg);
      }
    }
    &:active, &:focus {
      //border: none;
      outline: none;
    }
    > i {
      margin:auto;
      padding-top: 2.5px;
      transition:all 0.5s;
    }
  }
}

.rightClickDelete {
  padding:8px 15px;
}
// modal Details game

.launchBtn {
  position:absolute;
  bottom: 15px;
  right:15px;
  border:2px solid white;
  background:rgba(24,24,24,0.5);
  color: white;
  font-size: 24px;
  padding: 8px 12px;
  border-radius: 5px;
  margin: 0 5px;
  z-index: 999;
  opacity: 0.2;
  cursor: pointer;
  &:focus, &:active {
    outline: none;
    border: none;
  }
  &:hover {
    opacity: 1;
  }
}

.games_container {
  position: relative;
  height: calc(100vh - 149px);
  width: 100%;
  overflow-y:auto;
}

.iconApp {
  margin:auto;
  .iconCover {
    top:50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 80px;
    height: auto;
  }
}

main {
  display: grid;
  grid-template-columns: repeat($grid-items, minmax($grid-min, 1fr));
  grid-gap: $grid-gap;
  counter-reset: rank;
  margin: 4%;
  article {
    counter-increment: rank;
    position: relative;
    overflow: hidden;
    animation: mouseOut 0.3s ease-in;
    color: white;
    text-decoration: none;

    .image {
      position: relative;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      vertical-align: middle;
      justify-content: center;
      background: $card;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
      &:after {
        // This forces the image container to be a square
        content: '';
        display: block;
        padding-bottom: 50%;
      }

      &:before {
        content: '•••';
        font-size: 24px;
        position: absolute;
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        color: rgba(white, 0.1);
        z-index: 0;
      }

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height:100%;
        z-index: 10;
        opacity: 0;

        &.active {
          animation: imageFadeIn 0.5s ease-in forwards;
          animation-delay: 0.5s;
        }
      }
    }

    .description {
      padding: 10px 0;

      h3,
      p {
        padding: 0 10px;
      }
      h3.title {
        font-size:18px;
      }
      p.origin {
        color: #666;
        text-transform: uppercase;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 0;

        &:before {
          content: '';
          display: block;
          width: 25px;
          height: 2px;
          margin-bottom: 4px;
          background: $card;
        }
      }
    }

    // &:before {
    //   content: '#'counter(rank);
    //   display: block;
    //   width: 25px;
    //   height: 20px;
    //   line-height: 20px;
    //   background: rgba($background, 0.75);
    //   color: white;
    //   position: absolute;
    //   z-index: 20;
    //   right: 0px;
    //   top: 0px;
    //   text-align: center;
    //   font-weight: 500;
    //   font-size: 12px;
    // }
  }

  article:hover {
    animation: mouseOver 0.3s ease-in forwards;
    .launchBtn {
      opacity: 0.8;
    }
  }
}

// ANIMATIONS
@keyframes mouseOver {
  0% {
    top: 0;
  }

  100% {
    top: -5px;
  }
}

@keyframes mouseOut {
  0% {
    top: -5px;
  }

  100% {
    top: 0;
  }
}

@keyframes imageFadeIn {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.1;
  }

  100% {
    opacity: 1;
  }
}

// VUE TRANSITIONS: CARD FADEIN
.card-enter, .card-leave-to {
  opacity: 0;
}

.card-enter-to {
  opacity: 1;
}

.card-enter-active {
  transition: opacity 0.3s ease-in;

}

.card-leave-active {
  transition: opacity 0s ease-out;
  position: absolute;
    z-index: 0;
}

progress {
  -webkit-appearance: none;
  height: 2px;
  margin: 25px 0;
  width: 100%;
}

::-webkit-progress-value {
  background-color: $principal;
}

::-webkit-progress-bar {
  background-color: rgba(white, 5%);
  border-radius: 2px;
  overflow: hidden;
}
</style>
