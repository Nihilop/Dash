<template>
  <div>
    <div v-hotkey="keymap">
      <div class="material theme-dark" :class="panels.microNav ? 'active':null" >
        <ul>
          <li @click="panels.manualAdd = !panels.manualAdd">
            <span class="iconMico"><i class="bi bi-plus" /> </span>
            <span>Ajouter un jeu</span>
          </li>
          <li @click="refreshGames">
            <span class="iconMico"><i class="bi bi-arrow-counterclockwise" /> </span>
            <span>Actualiser la liste des jeux</span>
          </li>
          <li v-if="$store.state.gameList.length > 0" @click="panels.dbCleanModal = !panels.dbCleanModal">
            <span class="iconMico"><i class="bi bi-trash" /> </span>
            <span>Supprimer la base de donnée</span>
          </li>
          <li @click="panels.headShow = !panels.headShow">
            <span style="width:100%">Afficher la recherche : {{panels.headShow}}</span>
          </li>
          <!-- <li @click="panels.stats_overview = !panels.stats_overview">
            <span class="iconMico"><i class="bi bi-bar-chart-fill"></i></span>
            <span>Statistiques</span>
          </li> -->
          
        </ul>
      </div>
      <div class="icon">
        <a @click="panels.microNav = !panels.microNav" v-clickoutside="closemicroNav">
          <i class="bi bi-gear-fill"></i>
        </a>
      </div>
      <main class="launcher">
        <header class="searchAndFilter" :class="panels.headShow ? null : 'headHidden'">
          <div class="formGroup">
            <i class="searchIcon bi bi-search" />
            <input
              v-model="SearchGame"
              type="search"
              placeholder="Chercher un jeu..."
            >
            <i class="filterIcon bi bi-filter" @click="panels.filterShow = !panels.filterShow" />

            <div class="tags" :class="panels.filterShow || !panels.headShow ? 'actived':null" :style="!panels.headShow ? 'top: 140% !important;':null">
              <ul>
                <li
                  v-for="cat in category"
                  :key="cat.id"
                  :class="SelectedCat === cat.tag ? 'active' : null"
                  @click="setCat(cat.tag)"
                >
                  <img v-if="cat.icon" :src="cat.icon" />
                  <p v-else>{{ cat.name }}</p>
                </li>
              </ul>
            </div>
          </div>

          
          
        </header>
        <div
          v-if="gamesLoaded"
          class="games_container"
        >
        <section class="viewport">
          <div class="recent" v-if="recentPlayed.length > 0">
            <h1 class="row_title firstTitle" @click="panels.recent = !panels.recent">Most played <span>#{{recentPlayed.length}}</span></h1>
            <transition-group tag="main" name="card" v-show="panels.recent">
              <article v-for="(game, index) in recentPlayed.slice(0, 5)" :key="index" v-contextmenu:[game.nodeKey] class="card" >
                <div class="image" >
                  <!-- <img v-if="image['#text'] !== ''" :src="image['#text']" :alt="album.name" v-on:load="isLoaded()" v-bind:class="{ active: isActive }"> -->
                  <img
                    v-if="game.game"
                    :src="game.game.cover"
                    :alt="game.name"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                    @click="game.origin === 'bnet' ? openBnetGame(game) : openSteamGame(game)"
                  >
                  <img
                    v-else
                    src="/img/bg2.jpg"
                    :alt="game.name"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                    @click="launchApp(game.nodeKey)"
                  >
                  <i v-if="game.origin === 'steam' || game.origin === 'bnet'" @click.prevent="game.origin === 'steam' || 'bnet' ? openDetail(game) : null" class="detailsBtn bi bi-info" />
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
                </div>
                <div class="description" >
                  <h3 class="title">
                    {{ game.name }} - {{ game.analytic.launched}}x
                  </h3>
                  <p class="origin">
                    
                    <img class="launcherIcon" v-if="game.origin === 'steam' || 'bnet'" :src="'/img/ico/' + game.origin + '.png'" />
                    <span v-else>{{ game.origin ? game.origin : 'External' }}</span>
                  </p>
                </div>
                <v-contextmenu :ref="game.nodeKey">
                  <v-contextmenu-item
                    class="rightClickDelete"
                    @click="resetCounter(game)"
                  >
                    <i
                      class="bi bi-x"
                      style="margin-right:5px"
                    />Reset les stats
                  </v-contextmenu-item>
                </v-contextmenu>
              </article>
            </transition-group>
          </div>
          <div class="library" v-if="filterComponents.length > 0">
            <h1 class="row_title" @click="panels.library = !panels.library">Library <span>#{{filterComponents.length}}</span></h1>
            <transition-group tag="main" name="card" v-show="panels.library">
              <article v-for="(game, index) in filterComponents" :key="index" v-contextmenu:[game.name] class="card" >
                <div class="image" >
                  <!-- <img v-if="image['#text'] !== ''" :src="image['#text']" :alt="album.name" v-on:load="isLoaded()" v-bind:class="{ active: isActive }"> -->
                  <img
                    v-if="game.game"
                    :src="game.game.cover"
                    :alt="game.name"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                    @click="game.origin === 'bnet' ? openBnetGame(game) : openSteamGame(game)"
                  >
                  <img
                    v-else
                    src="/img/bg2.jpg"
                    :alt="game.name"
                    :class="{ active: isActive }"
                    @load="isLoaded()"
                    @click="launchApp(game.nodeKey)"
                  >
                  <i v-if="game.origin === 'steam' || game.origin === 'bnet'" @click.prevent="game.origin === 'steam' || 'bnet' ? openDetail(game) : null" class="detailsBtn bi bi-info" />
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
                </div>
                <div
                  class="description"
                >
                  <h3 class="title">
                    {{ game.name }}
                  </h3>
                  <p class="origin">
                    
                    <img class="launcherIcon" v-if="game.origin === 'steam' || 'bnet'" :src="'/img/ico/' + game.origin + '.png'" />
                    <span v-else>{{ game.origin ? game.origin : 'External' }}</span>
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
            </transition-group>
            <h1 v-if="filterComponents.length <= 0 && panels.library" key="noRst" class="noResults" >
              Aucun résultat(s) trouvé(s)
            </h1>
          </div>
          
        </section>
        </div>
      </main>
    </div>
    <game-details v-if="panels.gameDetails" v-model="panels.gameDetails" width="910px" :datas='gameData'>
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
                @click="gameData.origin === 'bnet' ? openBnetGame(gameData) : openSteamGame(gameData), (gameDetails = false)"
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
              <span style="font-size: 12px; margin:auto 15px;">Total joué : {{ msToTime(gameData.analytic.played) }}</span>
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
                @click="gameData.origin === &quot;bnet&quot; ? openBnetGame(gameData) : openSteamGame(gameData), (panels.gameDetails = false)"
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
        <div class="stats_graph">
          <Graph v-if="gameData.analytic.launched > 0" :graph-items="gameData.analytic.stat" />
        </div>
      </template>
    </game-details>
    
    <modal v-model="panels.manualAdd" :close-btn="false" >
      <template #header>
        Ajouter au launcher
      </template>
      <template #body>
        <p style="opacity:0.4, font-weight: 200; font-size:12px; margin-bottom: 34px"><i class="bi bi-exclamation-triangle-fill" style="color:red;"></i> Attention, merci de bien selectionner l'executable du jeu </p>
        <label for="HandAdd" class="AddLauncher"> {{localFileSelected ? localFileSelected.name : 'Selectionne ton executable'}}</label>
        <input
          id="HandAdd"
          type="file"
          ref="fileAdd"
          placeholder="Ajouter"
          @change="previewFiles"
          accept=".exe, .ink, application/x-ms-shortcut, application/x-msdos-program">
        
      </template>
      <template #actions>
        <button
          type="primary"
          class="closed"
          @click="resetFieldAdd(), (panels.manualAdd = false)"
        >
          Annuler
        </button>
        <button
          type="primary"
          v-if='localFileSelected'
          @click="addToLauncher(localFileSelected) ,(panels.manualAdd = false)"
        >
          Ajouter
        </button>
      </template>
    </modal>

    <modal v-model="panels.steamModal" :close-btn="false" >
      <template #header>
        Metadonnées
      </template>
      <template #body>
        <progress :value="SteamLoading" />
        <p>{{ loadMessage }}</p>
      </template>
    </modal>

    <modal v-if="panels.stats_overview" v-model="panels.stats_overview" :close-btn="true" width="80%">
      <template #header>
        Statistiques
      </template>
      <template #body>
        <div class="totalStats" style="height: fit-content !important">
          <eGraph :graph-items="$store.state.gameList" />
        </div>
      </template>
    </modal>

    <modal v-model="panels.dbCleanModal" :close-btn="true" >
      <template #header>
        Suppression de la base de données
      </template>
      <template #body>
        <p>Voulez-vous vraiment supprimer votre base de données interne ?</p>
      </template>
      <template #actions>
        <button @click="panels.dbCleanModal = false">Annuler</button>
        <button  class="closed" @click="clearDatabase(), (panels.dbCleanModal = false)">Supprimer</button>
      </template>
    </modal>
  </div>
</template>

<script>
// Imports global
import { openDB } from 'idb'
import modal from '@/widgets/Dialog.widget'
import gameDetails from '@/widgets/Details.widget'
import { Promised } from 'vue-promised'
import clickoutside from '@/directives/clickOutside'
import _ from 'lodash'
import path from 'path'
import Graph from '@/widgets/Graph.widget'
import eGraph from '@/widgets/echarts.widget'
// Impots libs
const scraper = require('@/lib/steamScraper')
const fs = require('fs')
const electron = window.require ? window.require('electron') : null
const { shell } = require('electron')


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
    Promised,
    Graph,
    eGraph
  },
  directives: { clickoutside },
  data () {
    return {
      isActive: false,
      panels: {
        filterShow: false,
        headShow: true,
        recent: true,
        library: true,
        microNav: false,

        stats_overview: false,
        dbCleanModal: false,
        steamModal: false,
        gameDetails: false,
        manualAdd: false,
      },
      indexDbGame: null,
      dbName2: 'games',
      dbGmName: 'games',
      datas: [],
      loading: false,
      localFileSelected: null,
      gameData: {},
      SteamLoading: 0,
      loadMessage: '',
      gamesLoaded: false,
      apiKey: '882842ac059a4013ad679486b1e64eca',
      SearchGame: '',
      category: [
        {name:'Tout' , tag: 'All', icon: ''},
        {name:'Steam' , tag: 'steam', icon: '/img/ico/steam.png'},
        {name:'Battle.net', tag: 'bnet', icon: '/img/ico/bnet.png'},
        {name:'Local' , tag: 'local', icon: '/img/ico/local.png'}],
      SelectedCat: 'All',
      timePlayed: null,
      timePlayedTotal: null,
      steamPath: [],
      bnetPath: [],
      originPath: [],
      epicPath: [],
      gameListed: [],
      analytic: []
    }
  },
  computed: {
    keymap () {
      return {
        esc: this.escp
      }
    },
    recentPlayed() {
      return _(this.$store.state.gameList).filter(item => item.analytic.launched >= 1).orderBy(item => item.analytic.launched,'desc').value()
      //return this.$store.state.gameList.sort((a, b) => a.analytic.launched + b.analytic.launched );
    },
    filterComponents () {
      //console.log(this.SelectedCat)
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
    },
    gameList() {
      return this.$store.state.gameList.filter(item => {
        return item.label
      })
    }

  },
  async created () {
    this.getBnetPath()
    this.initialize()
    this.sendDataToMain()
  },
  mounted() {
    
    electron.ipcRenderer.on('message', function (event, text) {
      console.log(text)
    })
    setTimeout(() => {
      this.$store.state.gameList.forEach(item => {
        let datas = {
          name: item.name,
          analytic: item.analytic.stat
        }
        this.analytic.push(datas)
      })
    }, 1000)
    
    
  },
  methods: {
    async previewFiles(event) {
      electron.ipcRenderer.send('openLauncherWhenSelected')
      const file = electron.ipcRenderer.sendSync('req_addExec', event.target.files[0].path, event.target.files[0].name)
      this.localFileSelected = JSON.parse(file)
      console.log(this.localFileSelected)
    },
    resetFieldAdd() {
      //document.getElementById('HandAdd').value = null
      this.localFileSelected = null
      this.$refs.fileAdd.value= null
      //console.log(this.localFileSelected)
    },
    playVideo() {
      setTimeout(() => {
        this.canReadVideo = true
      }, 1000)
    },
    setCat (item) {
      this.SelectedCat = item
    },
    isLoaded () {
      this.isActive = true
    },
    // Open and Init DB
    async initialize () {
      this.initIndexDbGame()
      this.indexDbGame = await this.initIndexDbGame()
      console.log('initialize indexDb : ', this.indexDbGame)
      this.setGameList()   
    },
    sendDataToMain() {
      setTimeout(() => {
        const data = JSON.stringify(this.gameListed)
        electron.ipcRenderer.send('myGameList', data)  
      }, 500)
      
    },
    async initIndexDbGame () {
      return await openDB(this.dbName2, 2, {
        upgrade: db => {
          db.createObjectStore(this.dbGmName)
        }
      })
    },
    refreshGames () {
      this.panels.steamModal = true
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
        //console.log(bnetContents)

        if(bnetContents.length > 0) {
          bnetContents.forEach(elem => {
            this.addToLauncher(elem)
          })
        } 

      } else {
        this.panels.steamModal = false
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
        const res = electron.ipcRenderer.sendSync('req_folderContents', FoldersPath.nodeKey)
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
        this.resetFieldAdd()
        setTimeout(() => {
          this.SteamLoading = 1
          this.loadMessage = 'Ajouts terminés'
          this.setGameList()
          setTimeout(() => {
            this.panels.steamModal = false
          }, 1000)
        }, 1000)
        
      } else {
        this.resetFieldAdd()
        setTimeout(() => {
          this.SteamLoading = 1
          this.loadMessage = 'Aucun élément ajouter'
          this.setGameList()
          setTimeout(() => {
            this.panels.steamModal = false
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
    async clearDatabase() {
      const transaction = this.indexDbGame.transaction([this.dbGmName], 'readwrite')
      await transaction.objectStore(this.dbGmName).clear()
      this.setGameList()  
    },
    // Set vuex from DB
    async setGameList () {
      const allItems = await this.indexDbGame.getAll(this.dbGmName)
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      this.$store.dispatch('GAME_LIST', allItems)
      this.$store.dispatch('GAME_KEYS', allKeys)
      this.gamesLoaded = true
      this.getGameList()
    },
    getGameList() {
      this.$store.state.gameList.forEach(item => {
        // const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('\\') + 1)
        // let lastPath = getLastItem(item.nodeKey)
        if(this.gameListed.includes(item.data.process) || this.gameListed.includes(item.label + '.exe')) {
          return
        } else {
          if(item.data.process) {
            console.log('Process: ' + item.data.process)
            this.gameListed.push(item.data.process)
          } else {
            console.log('Process + exe added: ' + item.label + '.exe')
            this.gameListed.push(item.label + '.exe')
          }
        }
      }) 
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
        this.panels.gameDetails = true
        this.gameData = item
      } else {
        console.log('La fenêtre modal doit être configué, demander au dev de se bouger le cul.')
      }
    },
    // Open apps
    openSteamGame (id) {
      this.putLaunched(id)
      this.timePlayed = new Date().getTime()
      console.log(this.timePlayed)
      shell.openExternal(`steam://run/${id.appid}`)
      electron.ipcRenderer.send('close')
      const data = id.name
      electron.ipcRenderer.send('game_launch', data.toString(), this.timePlayed)
      console.log("Ouverture de l'application " + id.name)
      electron.ipcRenderer.on('stopPlayed', (event, arg) => {
        this.timePlayedTotal = arg
        console.log(this.timePlayedTotal)
        setTimeout(() => {
          this.putTimePlayed(id)
        },2000)
      })
    },
    openBnetGame (id) {
      this.putLaunched(id)
      this.timePlayed = new Date().getTime()
      console.log(this.timePlayed)
      const { exec } = require('child_process')
      exec(`"${localStorage.bnetRoot}" --exec="launch ${id.appid}"`)
      electron.ipcRenderer.send('close')
      electron.ipcRenderer.send('game_launch', id.name, this.timePlayed)
      electron.ipcRenderer.on('stopPlayed', (event, arg) => {
        this.timePlayedTotal = arg
        console.log(this.timePlayedTotal)
        setTimeout(() => {
          this.putTimePlayed(id)
        },500)
      })
    },
    async resetCounter(id) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      
      if (allKeys.includes(id.data.stat.ino)) {
        let value = await this.indexDbGame.get(this.dbGmName, id.data.stat.ino);
        
        value.analytic.launched = 0
        value.analytic.played = 0
        value.analytic.stat = []
        console.log(value)
        await this.indexDbGame.put(this.dbGmName, value , id.data.stat.ino)
        this.setGameList()
      }
    },
    async putTimePlayed(id) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      
      if (allKeys.includes(id.data.stat.ino)) {
        let value = await this.indexDbGame.get(this.dbGmName, id.data.stat.ino);
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        console.log(today)
        value.analytic.played = value.analytic.played + this.timePlayedTotal

        let index = value.analytic.stat.findIndex(date => date.date == today) 
        console.log(index)
        if(index === -1){
          value.analytic.stat.push({date: today, time: this.timePlayedTotal})
        } else {
          value.analytic.stat[index].time = value.analytic.stat[index].time + this.timePlayedTotal
        }
        
        console.log(value)
        await this.indexDbGame.put(this.dbGmName, value , id.data.stat.ino)
        this.setGameList()
      }

    },
     msToTime(ms) {
      var milliseconds = parseInt((ms % 1000) / 100),
          seconds = Math.floor((ms / 1000) % 60),
          minutes = Math.floor((ms / (1000 * 60)) % 60),
          hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return hours > 0 ? hours + "h " : '' +  minutes > 0 ? minutes + "min " : '' + seconds > 0 ? seconds + 's': ''
    },
    async putLaunched(id) {
      const allKeys = await this.indexDbGame.getAllKeys(this.dbGmName)
      
      if (allKeys.includes(id.data.stat.ino)) {
        let value = await this.indexDbGame.get(this.dbGmName, id.data.stat.ino);
        
        value.analytic.launched++
        console.log(value)
        await this.indexDbGame.put(this.dbGmName, value , id.data.stat.ino)
        this.setGameList()
      }
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
      if (this.panels.steamModal || this.panels.gameDetails || this.panels.stats_overview || this.panels.dbCleanModal || this.panels.steamModal || this.panels.manualAdd) {
        setTimeout(() => {
          this.panels.stats_overview = false
          this.panels.dbCleanModal = false
          this.panels.steamModal = false
          this.panels.manualAdd = false

          this.panels.steamModal = false
          this.panels.gameDetails = false
        }, 200)
      }
      if (await this.panels.steamModal === false && await this.panels.gameDetails === false && await this.SelectedCat === 'All' && await this.SearchGame === '') {
        // console.log(this.panels.steamModal,
        //   this.panels.gameDetails,
        //   this.SelectedCat,
        //   this.SearchGame)
        electron.ipcRenderer.send('close', true)
      }
    },
    closemicroNav() {
      if(this.panels.microNav) {
        this.panels.microNav = false
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
    text-decoration: none;
}

h1 {
    font-size: 25px;
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

input[type="file"] {
    visibility: hidden;
    width: 1px;
    height: 1px;
}
label.AddLauncher {
  position:relative;
  display: block;
  width: 100%;
  padding: 12px 15px;
  transition: all 0.5s;
  overflow: hidden;
  border-radius: 5px;
  &::before {
    position:absolute;
    content: '';
    width:100%;
    height: 100%;
    transform: translateY(calc(100% - 2px));
    bottom:0;
    left: 0;
    background:$principal;
    transition: all 0.5s;
    z-index: -1;
  }
  &:hover {
    &::before {
      transform: translateY(0);
      background: darken($principal, 5%);
    }
    font-weight: bold;
  }
}

.material {
	position: fixed;
	width: 300px;
	height: 320px;
	
	bottom: 90px;
	right: 25px;
	transform: scale(0);
	transform-origin: 100% 100%;
  border-radius: 8px;
	
	transition: .3s all cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 9;
  overflow: hidden;
  &.theme-light {
    background: #fff;
    box-shadow: 0px 5px 5px rgba(126, 111, 111, 0.39);
    ul li {
      background: #dadada;
      color: rgb(105, 105, 105);
    }
  }
  &.theme-dark {
    background: rgba(24,24,24,1);
    box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.39);
    ul li {
      background: #222;
      color: rgb(105, 105, 105);
    }
  }
  &.active {
    transform: scale(1);
  }
  ul {
    width: 100%;
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    overflow-y: scroll ;
    background:transparent;
    li {
      position:relative;
      display: flex;
      padding: 0 18px;
      box-sizing: border-box;
      border-radius: 5px;
      
      opacity: 0.5;
      margin: 5px auto;
      height: 55px;
      overflow: hidden;
      text-align: left;
      cursor: pointer;
      transition: all 0.5s;
      &:hover {
        opacity: 1;
        transform: scale(1.05);
      }
      &:nth-child(1) {
        .iconMico {
          background-image: linear-gradient(to left bottom, #00c9a7, #09c1a2, #11b99d, #17b297, #1baa92);   
        }
      }
      &:nth-child(2) {
        .iconMico {
          background-image: linear-gradient(to left bottom, #845ec2, #7954b4, #6d4aa6, #624098, #57378a);
        }
      }
      &:nth-child(3) {
        .iconMico {
          background-image: linear-gradient(to left bottom, #ff9671, #ff895f, #ff7b4c, #ff6d39, #ff5d24);   
        }
      }
      &:nth-child(4) {
        .iconMico {
          background: linear-gradient(to top, red 0%, blue 100%)
        }
      }
      .iconMico {
        position: relative;
        display: flex;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin: auto 10px auto 0;
        
        i {
          color: white;
          margin: auto;
        }
      }
      span {
        width: 80%;
        margin:auto 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: gray;
      }
    }
  }
}

.icon {
  clear: both;
	position: fixed;
	bottom: 50px;
	right: 0;
	width: 50px;
  height: 50px;
	height: 40px;
  z-index: 9;
  a {
    display: flex;
    vertical-align: middle;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-decoration: none;
    margin:auto;
    color: white;
    font-size: 20px;
    > i {
      margin: auto;
    }
  }
}


.stats_graph {
  width: 100%;
  box-sizing: border-box;
}

.launcher {
  position:relative;
  display: flex;
  flex-flow: column nowrap;
  row-gap: 0px;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.games_container {
  width: 100%;
  overflow-y:auto;
  transition: all 0.5s;
  animation: fadou 0.5s forwards;
  z-index: 0;
}
.searchAndFilter {
  position: relative;
  width: 100%;
  //background: rgba(#000, 50%);
  border-bottom: 1px solid rgba(white,5%);
  display: flex;
  flex-direction: column;
  height: 100px;
  transform: translateY(0);
  transition: transform 0.5s;
  z-index: 1;
  .formGroup{
    position:relative;
    margin:auto;
    width: 80%;
    display: flex;
    vertical-align: middle;
    &:focus-within {
      input {
        outline: none;
        color: white;
        opacity: 1;
      }
      // i {
      //   color: rgba(white, 100%);
      // }
    }
    input {
      margin:auto 0;
      border: none;
      background:transparent;
      min-width: 700px;
      width: 100%;
      padding: 15px 18px 15px 50px;
      box-sizing: border-box;
      font-size: 1.2em;
      border-radius: 8px;
      transition: all 0.5s;
      background: rgba(white, 5%);
      color: white;
      opacity: 0.5;
    }
    i.searchIcon {
      position:absolute;
      margin:auto;
      left: 18px;
      top:50%;
      transform: translateY(-50%);
    }
    i.filterIcon {
      margin: auto 15px;
    }
    .tags {
      position:absolute;
      top: 120%;
      right: 0;
      width: fit-content;
      margin:auto;
      padding: 12px 18px;
      box-sizing: border-box;
      border-radius: 5px;
      background:rgba(24,24,24,1);
      box-shadow: 0 0 5px -2px black;
      z-index: +1;

      transform: scale(0);
      transform-origin: 100% 0;
      transition: .3s all cubic-bezier(0.19, 1, 0.22, 1);

      &.actived {
        transform: scale(1);
      }
      ul {
        display: flex;
        vertical-align: middle;
        user-select: none;
        li {
          margin: auto 10px;
          font-size: 1.1em;
          text-transform: uppercase;
          font-weight: normal;
          transition: all 0.5s;
          opacity: 0.2;
          img {
            width: 34px;
            margin: auto;
            filter: grayscale(100%);
            transition: all 0.5s;
            &:hover {
              filter: grayscale(0%);
            }
          }
          p {
            margin: auto;
          }
          &:hover {
            opacity: 1;
            cursor: pointer;
            transform: scale(1.1);
          }
          &.active {
            opacity: 1;
            font-weight: 600;
            transform: scale(1.1);
            img {
              filter: grayscale(0%);
            }
          }
        }
      }
    }
  }
}

.headHidden {
  transform: translateY(-100%);
  animation: headerHasBeenHide 0.5s 0.2s forwards;
}

@keyframes headerHasBeenHide {
  from {
    position:relative
  }
  to {
    position: absolute;
  }
}
@keyframes fadou {
  from {
    opacity:0;
  }
  to {
    opacity:1;
  }
}


.viewport {
  display: flex;
  flex-direction: column ;
  width: 100%;
  height: 100%;
  .row_title {
    display: flex;
    vertical-align: middle;
    font-size: 40px;
    padding-left:4%;
    margin: 0;
    width: fit-content;
    height: 80px;
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    user-select: none;
    cursor: pointer;
    color: rgba(#666, 10%);
    span {
      color: #666;
      margin: 8px 15px auto 15px;
      font-size:0.4em;
      letter-spacing: normal;
      text-transform: none;
      font-family: 'Roboto', sans-serif;
    }
    &.firstTitle {
      margin-top: 55px;
    }
  }
  .recent {
    width: 100%;
    margin-top:0
  }
  .library {
    width: 100%;
    margin-top:0
  }
}


.noResults {
  position:relative;
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
  button {
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
  }
  .clearDB {
    > i {
      margin:auto;
      padding-top: 2.5px;
      transition:all 0.5s;
    }
    &:hover {
      opacity: 1;
      > i {
        color: #e74c3c;
      }
    }
  }
  .addGames {
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
  margin:-40px 4% 4% 4%;
  article {
    counter-increment: rank;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    animation: mouseOut 0.3s ease-in;
    color: white;
    text-decoration: none;
    min-height: 200px;
    //box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 10px 12px -7px #000000;

    .image {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      vertical-align: middle;
      justify-content: center;
      background: $card;
     
      &:after {
        // This forces the image container to be a square
        position:absolute;
        top:0;
        left: 0;
        width: 100%;
        height: 100%;
        content: '';
        display: block;
        background: linear-gradient(to top, rgba(24,24,24,1) 0% , rgba(24,24,24,0.9) 20%, rgba(24,24,24,.2) 100%);
        opacity: 1;
        z-index: 1;
        pointer-events: none;
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
        height:100%;
        z-index: 1;
        opacity: 0;
        background-position: cover center;
        transition: all 0.8s;
        &.active {
          animation: imageFadeIn 0.5s ease-in forwards;
          animation-delay: 0.5s;
        }
      }
    }
    .detailsBtn {
      position: absolute;
      top: 5%;
      right: 3%;
      color: white;
      z-index: 999;
      font-size: 1.1em;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid white;
      text-align: center;
      padding-top: 2px;
      transition: all 0.5s;
      opacity: 0;
      &:hover {
        opacity: 1;
      }
    }
    .description {
      position:absolute;
      width: 100%;
      display: flex;
      vertical-align: middle;
      bottom: 2%;
      left:2%;
      padding: 10px 0;
      z-index: 9;
      user-select: none;
      pointer-events: none;
      h3,
      p {
        padding: 0 10px;
        
      }
      h3.title {
        font-size:20px;
        width: 100%;
        margin:auto;
        overflow: hidden;
        text-shadow: 0 0 5px #222129;
      }
      p.origin {
        color: #666;
        text-transform: uppercase;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 0;
        margin:auto 2%;
        // &:before {
        //   content: '';
        //   display: block;
        //   width: 25px;
        //   height: 2px;
        //   margin-bottom: 4px;
        //   background: $card;
        // }
        .launcherIcon {
          width: 24px;
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
    .detailsBtn {
      opacity: 0.8;
    }
    .image img {
      transform: scale(1.05);
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
