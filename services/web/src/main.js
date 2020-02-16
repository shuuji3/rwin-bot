import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

import VueClipboard from 'vue-clipboard2';
import VueShortkey from 'vue-shortkey';

Vue.use(VueClipboard);
Vue.use(VueShortkey, { prevent: ['input', 'textarea'] });

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');
