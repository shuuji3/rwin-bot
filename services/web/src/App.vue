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
        <v-toolbar-title class="ml-2 display-1 font-weight-bold">
          <router-link to="/">Rwin-bot</router-link>
        </v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <!-- iCal リンク -->
      <v-btn
        text
        x-large
        v-clipboard:copy="'http://localhost:8080/api/schedules/ical'"
      >
        <v-icon>mdi-calendar-export</v-icon>
        <span class="ml-2 text-none">Copy iCal URL</span>
      </v-btn>

      <!-- GitHub リンク -->
      <v-btn
        href="https://github.com/shuuji3/rwin-bot"
        target="_blank"
        text
        x-large
      >
        <v-icon>mdi-github-circle</v-icon>
        <span class="ml-2 text-none">GitHub</span>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<style scoped>
a {
  color: white !important;
  text-decoration: none;
}
</style>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'App',
  components: {},
  data: () => ({
    //
  }),
  async mounted() {
    this.getRooms();
    this.getSchedules();
  },
  methods: {
    ...mapActions(['getRooms', 'getSchedules']),
  },
};
</script>
