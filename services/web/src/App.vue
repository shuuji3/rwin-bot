<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Rwin-bot"
          class="shrink mr-2"
          contain
          :src="require('@/assets/logo.png')"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title class="ml-2 display-1 font-weight-bold"
          ><a href="https://google.com">Rwin-bot</a></v-toolbar-title
        >
      </div>

      <v-spacer></v-spacer>

      <v-btn href="https://github.com/shuuji3/rwin-bot" target="_blank" text>
        <span class="mr-2">GitHub</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <Home />
    </v-content>
  </v-app>
</template>

<style scoped>
  a {
    text-decoration: none;
  }
</style>

<script>
import Home from './components/Home';

export default {
  name: 'App',

  components: {
    Home,
  },

  data: () => ({
    //
  }),
};
</script>
