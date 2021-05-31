  
const path = require('path')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      publish: [
        'github'
      ],
      builderOptions: {
        productName: 'Dash',
        win: {
          icon: "./build/icons/icon.ico"
        }
      },
      chainWebpackMainProcess: (config) => {
        config.module
          .rule("node")
          .test(/\.node$/)
          .use("node-loader")
          .loader("node-loader")
          .end();
      },
    },
    autoRouting: {
      chunkNamePrefix: 'page-'
    }
  },
  lintOnSave: false,
  assetsDir: 'assets/',
  runtimeCompiler: true
}