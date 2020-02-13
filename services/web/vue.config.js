module.exports = {
  pwa: {
    name: 'Rwin-bot',
    themeColor: '#F44336',
    msTileColor: '#F44336',
    manifestOptions: {
      background_color: '#EF9A9A',
    },
  },
  transpileDependencies: ['vuetify'],
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
      },
    },
  },
};
