import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import DaySpanVuetify from 'dayspan-vuetify';

import 'dayspan-vuetify/dist/lib/dayspan-vuetify.min.css';

Vue.config.productionTip = false;

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2',
  },
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
