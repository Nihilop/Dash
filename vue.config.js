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
          oneClick: false,
          perMachine: false,
          license: "./licenses/license_fr.txt",
          createDesktopShortcut: "always",
          createStartMenuShortcut: true,
          deleteAppDataOnUninstall: true,
          runAfterFinish: true,
          allowToChangeInstallationDirectory: true
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
