import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.lightGreen.darken1,
        secondary: colors.lightGreen.darken4,
        accent: colors.indigo.base,
      },
    },
  },
});
