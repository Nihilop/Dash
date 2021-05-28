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
          icon: "./build/icons/icon.ico",
          publisherName: "Nihilo"
        },
        nsis: {
          oneClick: true
        }
      }
    },
    autoRouting: {
      chunkNamePrefix: 'page-'
    }
  },
  lintOnSave: false,
  assetsDir: 'assets/',
  runtimeCompiler: true
}
