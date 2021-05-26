module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      publish: [
        'github'
      ],
      builderOptions: {
        productName: 'GlobalLauncher'
      },
      outputDir: 'allBuild'
    },
    autoRouting: {
      chunkNamePrefix: 'page-'
    }
  },
  lintOnSave: false,
  assetsDir: 'assets/',
  runtimeCompiler: true
}
