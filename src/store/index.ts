import { createStore } from 'vuex'

function getObject (array, key, value) {
  let o
  array.some(function iter (a) {
    if (a[key] === value) {
      o = a
      return true
    }
    return Array.isArray(a.children) && a.children.some(iter)
  })
  return o
}

export default createStore({
  state: {
    drives: [],
    folders: [],
    folderContents: [],
    currentFolder: '',
    openFolder: [] as any,
    selectedFolder: null,
    selectedContent: null,
    favList: [],
    favKeys: [],
    gameList: [],
    gameKeys: [],
    isPreview: true,
    listType: 'ListView',
    currentTitle: 'MyPC',
    isAbout: false,
    sidebar: false,
    theme_dark: null,
  },
  mutations: {
    setDrives (state, drives) {
      state.drives = drives
    },
    setFolders (state, folders) {
      state.folders = folders
    },
    setFolderChild (state, payload) {
      // console.log('setFolderChild payload folders: ', payload.folders)
      // console.log('setFolderChild item: ', payload.item)
      // console.log('setFolderChild state folders: ', state.folders)
      // const nodes = _.find(state.folders, { nodeKey: payload.item })
      const nodes = getObject(state.folders, 'nodeKey', payload.item)
      console.log('node : ', nodes)
      if (payload.folders && payload.folders !== undefined && payload.folders.length > 0) {
        if (nodes.children.length === 0) {
          nodes.children.push(...payload.folders)
        }
      }
    },
    setCurrentFolder (state, currentFolder) {
      state.currentFolder = currentFolder
    },
    setFolderContents (state, folderContents) {
      state.folderContents = folderContents
    },
    setOpenFolder (state, openFolder) {
      state.openFolder.push(openFolder)
    },
    setSelectedFolder (state, selectedFolder) {
      state.selectedFolder = selectedFolder
    },
    setSelectedContent (state, selectedContent) {
      state.selectedContent = selectedContent
    },
    setFavList (state, favList) {
      state.favList = favList
    },
    setFavKeys (state, favKeys) {
      state.favKeys = favKeys
    },
    setGameList (state, gameList) {
      state.gameList = gameList
    },
    setGameKeys (state, gameKeys) {
      state.gameKeys = gameKeys
    },
    setIsPreview (state, isPreview) {
      state.isPreview = isPreview
    },
    setListType (state, listType) {
      state.listType = listType
    },
    setCurrentTitle (state, currentTitle) {
      state.currentTitle = currentTitle
    },
    setIsAbout (state, isAbout) {
      state.isAbout = isAbout
    },
    setSidebar (state, sidebar) {
      state.sidebar = sidebar
    },
    setTheme ( state, themedark) {
      state.theme_dark = themedark
    }

  },
  actions: {
    DRIVES (context, payload) {
      context.commit('setDrives', payload)
    },
    FOLDERS (context, payload) {
      context.commit('setFolders', payload)
    },
    FOLDER_CHILD (context, payload) {
      context.commit('setFolderChild', payload)
    },
    CURRENT_FOLDER (context, payload) {
      context.commit('setCurrentFolder', payload)
    },
    FOLDER_CONTENTS (context, payload) {
      context.commit('setFolderContents', payload)
    },
    OPEN_FOLDER (context, payload) {
      context.commit('setOpenFolder', payload)
    },
    SELECTED_FOLDER (context, payload) {
      context.commit('setSelectedFolder', payload)
    },
    SELECTED_CONTENT (context, payload) {
      context.commit('setSelectedContent', payload)
    },
    FAV_LIST (context, payload) {
      context.commit('setFavList', payload)
    },
    FAV_KEYS (context, payload) {
      context.commit('setFavKeys', payload)
    },
    GAME_LIST (context, payload) {
      context.commit('setGameList', payload)
    },
    GAME_KEYS (context, payload) {
      context.commit('setGameKeys', payload)
    },
    IS_PREVIEW (context, payload) {
      context.commit('setIsPreview', payload)
    },
    LIST_TYPE (context, payload) {
      context.commit('setListType', payload)
    },
    CURRENT_TITLE (context, payload) {
      context.commit('setCurrentTitle', payload)
    },
    SHOW_ABOUT (context, payload) {
      context.commit('setIsAbout', payload)
    },
    SHOW_SIDEBAR (context, payload) {
      context.commit('setSidebar', payload)
    },
    SET_THEME (context, payload) {
      context.commit('setTheme', payload)
    }
  },
  modules: {}
})
