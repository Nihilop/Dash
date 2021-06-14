<template>
<h1 v-if="loading" class="lazyLoadFreegames">Récupération des jeux gratuits (Steam, Epic games)...</h1>
<div class="viewport" v-if="!loading">
  <div class="recent">
    <h1 class="row_title firstTitle" @click="libs.steam = !libs.steam">Steam</h1>
    <transition-group tag="main" name="card" v-show="libs.steam">
      <article v-for="(game, index) in games.steam" :key="index" class="card" @load="isLoaded()">
        <div class="image">
          <img v-if="game.cover" :src="game.cover" :alt="game.app_name" :class="{ active: isActive }" @load="isLoaded()" @click="openSteamShop(game.url)">
          <!-- <i @click.prevent="openDetail(game)" class="detailsBtn bi bi-info" /> -->
        </div>
        <div class="description">
          <h3 class="title">
            {{ game.app_name }}
          </h3>
          <p class="origin">
            <img class="launcherIcon" :src="'/img/ico/steam.png'" />
          </p>
        </div>
      </article>
    </transition-group>
    <h1 class="row_title firstTitle" @click="libs.epic = !libs.epic">Epic games</h1>
    <transition-group tag="main" name="card" v-show="libs.epic">
      <article v-for="(game, index) in games.epic.currents" :key="index" class="card">
        <div class="image">
          <img :src="game.keyImages[1].url" :alt="game.name" :class="{ active: isActive }" @load="isLoaded()" @click="openSteamShop('https://www.epicgames.com/store/fr/p/' + game.productSlug)">
        </div>
        <div class="description">
          <h3 class="title">
            {{ game.title }}
          </h3>
          <p class="origin">
            <img class="launcherIcon" :src="'/img/ico/epic.png'" />
          </p>
        </div>
      </article>
      <article v-for="(game, index) in games.epic.nexts" :key="index" class="card">
        <div class="image">
          <img :src="game.keyImages[0].url" :alt="game.name" :class="{ active: isActive }" @load="isLoaded()" @click="openSteamShop('https://www.epicgames.com/store/fr/p/' + game.productSlug)">
        </div>

        <div class="description">

          <h3 class="title">
            <h1 style="display:block; width:100%; margin: 0">
              Bientôt:
            </h1>
            {{ game.title }}
          </h3>
          <p class="origin">
            <img class="launcherIcon" :src="'/img/ico/epic.png'" />
          </p>
        </div>
      </article>
    </transition-group>
  </div>
</div>

<game-details v-if="panels.gameDetails" v-model="panels.gameDetails" width="910px" :datas='gameData'>
  <template #header>
    <div v-if="gameData.background" class="headerBG" :style="gameData.background">
      <video autoplay muted loop class="videoCover">
        <source :src="gameData.video" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
      <div class="coverGame">
        <div class="gameInfos">
          <img :src="gameData.cover">
          <p>{{ gameData.app_name }}</p>
        </div>
        <div class="meta">
          <ul class="metacat">
            <li v-for="item in gameData.categories.slice(0, 4)" :key="item.index">
              {{ item }}
            </li>
            <li v-if="gameData.categories.length > 5">
              + {{ gameData.categories.length - 4 }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="headerBG" :style="'background: url('+gameData.cover+'); background-size:cover; background-repeat:no-repeat;'">
      <div class="coverGame">
        <div class="gameInfos">
          <img :src="gameData.cover">
          <p>{{ gameData.label }}</p>

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
</template>

<script>
import { defineComponent } from "vue";
import { getGames } from "@/utils/feeds/epic-games";
import gameDetails from '@/widgets/Details.widget'
const electron = window.require ? window.require('electron') : null
const { shell } = require('electron')
const steamFreeScrap = require('@/lib/freeSteam')
const scraper = require('@/lib/steamScraper')

export default defineComponent({
  name: "GamesShops",
  components: {
    gameDetails
  },
  data() {
    return {
      isActive: false,
      loading: true,
      games: {
        epic: {
          current: [],
          nexts: []
        },
        steam: []
      },
      panels: {
        gameDetails: false
      },
      libs: {
        steam: true,
        bnet: true,
        epic: true,
        unreal: true,
      },
      gameData: {},
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    isLoaded() {
      this.isActive = true
    },
    init() {
      this.steamScrapou()
      this.epicFreeGames()
    },
    async steamScrapou() {
      let ids = []
      let results = []
      await steamFreeScrap.getData(function (err, data) {
        if (err) console.log(err)
        ids.push(data)
        data.forEach(res => {
          scraper.getData(res, function (err, data) {
            if (err) console.log(err)

            results.push(data)
          })
        })
      })
      this.games.steam = results
      setTimeout(() => {
        this.loading = false
      }, 2000)
    },
    epicFreeGames() {
      getGames("FR").then(res => {
        this.games.epic.currents = res.currents
        this.games.epic.nexts = res.nexts
        console.log(res.currents)
      }).catch(err => {
        console.log(err)
      });
    },

    // Open url 
    openDetail(item) {
      this.panels.gameDetails = true
      this.gameData = item
      console.log(this.gameData)
    },
    openSteamShop(url) {
      shell.openExternal(url)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/style/global.scss';
@import url('https://fonts.googleapis.com/css2?family=Paytone+One&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;900&display=swap');
$background: #222129;
$card: rgba(white, 5%);
$grid-items: 5;
$grid-min: 175px;
$grid-gap: 30px;

.viewport {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .row_title {
    display: flex;
    vertical-align: middle;
    font-size: 40px;
    padding-left: 4%;
    margin: 0;
    width: fit-content;
    height: 80px;
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    user-select: none;
    cursor: pointer;
    color: rgba(#666, 10%);
    width: 100%;

    span {
      color: #666;
      margin: 8px 15px auto 15px;
      font-size: 0.4em;
      letter-spacing: normal;
      text-transform: none;
      font-family: 'Roboto', sans-serif;
    }

    &.firstTitle {
      margin-top: 55px;
    }
  }
}

main {
  display: grid;
  grid-template-columns: repeat($grid-items, minmax($grid-min, 1fr));
  grid-gap: $grid-gap;
  counter-reset: rank;
  margin: -40px 4% 4% 4%;

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
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: '';
        display: block;
        background: linear-gradient(to top, rgba(24, 24, 24, 1) 0%, rgba(24, 24, 24, 0.9) 20%, rgba(24, 24, 24, .2) 100%);
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
        height: 100%;
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
      position: absolute;
      width: 100%;
      display: flex;
      vertical-align: middle;
      bottom: 2%;
      left: 2%;
      padding: 10px 0;
      z-index: 9;
      user-select: none;
      pointer-events: none;

      h3,
      p {
        padding: 0 10px;

      }

      h3.title {
        font-size: 20px;
        width: 100%;
        margin: auto;
        overflow: hidden;
        text-shadow: 0 0 5px #222129;
      }

      p.origin {
        color: #666;
        text-transform: uppercase;
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 0;
        margin: auto 2%;

        .launcherIcon {
          width: 24px;
        }
      }
    }
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

.lazyLoadFreegames {
  position: absolute;
  top:50%;
  transform: translateY(-50%);
  width:100%; 
  text-align:center; 
  margin:auto
}
</style>
