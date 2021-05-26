
import { App } from 'vue'
import { getFileIcon, getFileSizeIEC, getFileType, getFileTime, generateUUID, getIco, getExeIcon } from '@/lib/common'

const install = (Vue: App) => {
  Vue.config.globalProperties.$getFileIcon = getFileIcon
  Vue.config.globalProperties.$getFileSizeIEC = getFileSizeIEC
  Vue.config.globalProperties.$getFileType = getFileType
  Vue.config.globalProperties.$getFileTime = getFileTime
  Vue.config.globalProperties.$generateUUID = generateUUID
  Vue.config.globalProperties.$getIco = getIco
  Vue.config.globalProperties.$getExeIcon = getExeIcon
}

export default install
