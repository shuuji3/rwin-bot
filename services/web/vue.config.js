module.exports = {
  pwa: {
    name: 'Rwin-bot',
    themeColor: '#7cb342',
    msTileColor: '#7cb342',
    manifestOptions: {
      background_color: '#f0f4c3',
    },
  },
  transpileDependencies: ['vuetify'],
  devServer: {
    proxy: {
      '/api/save-schedules': {
        target: 'http://localhost:3001/',
      },
      '/api/register-schedule': {
        target: 'http://localhost:3001/',
      },
      '/api': {
        target: 'http://localhost:3000/',
      },
    },
  },
};
