<template>
  <div id="main">
    <aside id="nav">
      <nav>
        <ul>
          {{ $router.path }}
          <li class="clock">
            <Clock :active-date="false" />
            <Clock
              class="transition"
              :active-time="false"
            />
          </li>
          <li class="transition">
            <h2 class="categories">
              COMPONENTS
            </h2>
          </li>
          <li
            v-for="(ext, index) in extensions"
            :key="index"
            class="item transition"
            :class="options.activeComponent == ext.id ? 'active' : null "
            @click="selectComponent(index)"
          >
              <i :class="'bi ' + ext.icon" />
              <span class="title">{{ ext.name }}</span>
              <span
                v-if="ext.notification"
                class="notification"
              ><i class="bi bi-bullseye" /></span>
              <span
                class="SetAsHome"
                :class="options.home == ext.id ? 'active' : null"
                @click.prevent="SetAsHome(ext.id)"
              ><i class="" :class="options.home == ext.id ? 'bi bi-house-fill' : 'bi bi-house'" /></span>
           
          </li>
          <!-- Fixed content to Nav -->
          <li
            v-if="!options.logo"
            class="triggerIcon"
          >
            <i class="swappIn bi bi-arrows-angle-expand" />
            <i class="swappOut bi bi-arrows-angle-contract" />
          </li>
          <li
            v-if="options.logo"
            class="triggerIcon"
          >
            <img
              src="/img/N1.png"
              alt="trigger"
            >
          </li>
        </ul>
      </nav>
    </aside>
    <main id="content">
      <Suspense>
        <template #default>
          <keep-alive>
            <component :is="extensions[options.activeComponent].component" />
          </keep-alive>
        </template>
        <template #fallback>
          <Loading />
        </template>
      </Suspense>
    </main>
  </div>
</template>

<script>
// Imports - Libs
import { defineComponent, defineAsyncComponent } from 'vue'

// Widgets imports
import Clock from '@/widgets/Clock.widget'
import Loading from '@/widgets/loading.widget'
import ErrorComponent from '@/widgets/ErrorComponent.widget.vue'

// Components imports
const filesManager = defineAsyncComponent({
  loader: () => import('@/components/files-manager/filesManager.vue'),
  loadingComponent: Loading,
  errorComponent: ErrorComponent
})
const gamesShops = defineAsyncComponent({
  loader: () => import('@/components/games-shops/gamesShops'),
  loadingComponent: Loading,
  errorComponent: ErrorComponent,
})
const gamesLauncher = defineAsyncComponent({
  loader: () => import('@/components/games-launcher/gamesLauncher.vue'),
  loadingComponent: Loading,
  errorComponent: ErrorComponent
})

export default defineComponent({
  name: 'Home',
  components: {
    Clock,
    Loading,
    filesManager,
    gamesShops,
    gamesLauncher
  },
  data () {
    return {
      options: {
        logo: true,
        activeComponent: 0,
        home: null
      },
      extensions: [
        { id: 0, name: 'Lanceur de jeux', component: 'games-launcher', notification: false, icon: 'bi-controller' },
        { id: 1, name: 'Files manager', component: 'files-Manager', notification: false, icon: 'bi-file-earmark-binary-fill' },
        { id: 2, name: 'Jeux gratuits', component: 'games-shops', notification: false, icon: 'bi-controller'}
      ]
    }
  },
  created () {
    if (localStorage.home) {
      this.options.activeComponent = localStorage.home
      this.options.home = localStorage.home
    } else {
      this.options.activeComponent = 0
      this.options.home = 0
    }
  },
  methods: {
    selectComponent (index) {
      this.options.activeComponent = index
    },
    SetAsHome (value) {
      localStorage.home = value
      this.options.home = value
    }
  }
})
</script>
<style lang="scss">
@import '@/assets/style/global.scss';
* {
  box-sizing: border-box;
}

$sidebarOpen: 400px;
$navOffset: 150px;

.options_nav:hover {
  + #nav {
    width: $sidebarOpen;
  }
}
#main {
  position: relative;
  display: flex;
  flex-direction: row;
  // &:after {
  //   position: fixed;
  //   content: '';
  //   width:100%;
  //   height: 50px;
  //   background: linear-gradient(to top, $background 0%, transparent 100%);
  //   z-index: 1;
  //   bottom: 0;
  //   left: 0;
  // }
  #nav {
    position: sticky;
    top:0;
    left: 0;
    height: 100vh;
    width:80px;
    transition: all .5s .5s;
    border-right: 1px solid rgba(white, 5%);
    z-index: 2;
    user-select: none;
    nav {
      position:relative;
      display: block;
      height: 100%;
      width: 100%;
      overflow: hidden;
      ul {
        padding: 0 15px;
        width: 100%;
        height: max-content;
        padding-top:$navOffset;
        li.clock {
          position:absolute;
          top:2%;
          left:0;
          width: 100%;
          text-align: center;
          display: block;
          margin: 0;
          padding: 0;
          font-size: .9em;
          transition: all .5s .5s;
        }
        li.triggerIcon{
          position:absolute;
          bottom:2%;
          left:0;
          width: 100%;
          text-align: center;
          display: block;
          margin: 0;
          padding: 0;
          > img {
            max-width: 50px;
          }
        }
        li {
          position:relative;
          display: flex;
          vertical-align: middle;
          width: 100%;
          padding: 12px 15px;
          margin: 3px 0;
          color:white;
          box-sizing: border-box;
          &.item {
            cursor: pointer;
            border-radius: 5px;
            &:hover {
              background: rgba(white, 5%) !important;
            }
            
          }
          .title {
            width: 100%;
            padding: 0 10px;
          }
          .notification {
            font-size: 5px;
            color: red;
            margin:auto;
          }
          .SetAsHome {
            font-size: 15px;
            color: white;
            margin:auto;
            opacity: 0.05;
            &:hover {
              opacity:0.5
            }
            &.active {
              opacity: 1;
            }
          }
          .categories {
            font-weight: 200;
            color: rgba(white, 20%);
            padding: 14px 5px;
            cursor:default;
          }
        }
      }
    }
    .swappIn {
      opacity: 1;
      display: block;
    }
    .swappOut {
      opacity: 0;
      display: none;
    }
    .transition {
      transition: opacity 0.5s .2s;
      opacity: 0;
    }
    &:hover {
      width: $sidebarOpen;
      background: rgba(black, 15%);
      transition: all .5s;
      li.active {
        background: rgba($principal, 10%);
      }
      li.clock {
        transition: all 0.3s;
        font-size: 1.5em;
      }
      .swappIn {
        opacity: 0;
        display: none;
      }
      .swappOut {
        opacity: 1;
        display: block;
      }
      .transition {
        opacity: 1;
        transition: opacity .5s .3s;
      }
      // ~ #content:after {
      //   display: block;
      //   position:absolute;
      //   content:'';
      //   top:0; left:0; bottom:0; right:0;
      //   background:rgba(26, 36, 38,0.9);
      //   backdrop-filter: blur(35px) saturate(125%);
      //   z-index: 1;
      // }
    }
  }
  #content {
    position:relative;
    width:100%;
    min-height: 100vh;
    height: auto;
    padding: 0;
    margin: 0;
  }
}


@keyframes makeFlex {
  100% {
    display: initial !important;
  }
}
</style>
