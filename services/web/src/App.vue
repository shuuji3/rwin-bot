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

      <!-- Set API Token ボタン -->
      <v-btn
        :text="!isMobile"
        :icon="isMobile"
        x-large
        @click="showTokenDialog = !showTokenDialog"
      >
        <v-icon>mdi-key</v-icon>
        <span v-if="!isMobile" class="ml-2 text-none">Set API Token</span>
      </v-btn>

      <!-- iCal リンク -->
      <v-btn
        :text="!isMobile"
        :icon="isMobile"
        x-large
        v-clipboard:copy="
          `http://localhost:8080/api/schedules/ical?access_token=${tokenValue}`
        "
      >
        <v-icon>mdi-calendar-export</v-icon>
        <span v-if="!isMobile" class="ml-2 text-none">Copy iCal URL</span>
      </v-btn>

      <!-- GitHub リンク -->
      <v-btn
        href="https://github.com/shuuji3/rwin-bot"
        target="_blank"
        :text="!isMobile"
        :icon="isMobile"
        x-large
      >
        <v-icon>mdi-github-circle</v-icon>
        <span v-if="!isMobile" class="ml-2 text-none">GitHub</span>
      </v-btn>
    </v-app-bar>

    <!-- API Token 入力ダイアログ -->
    <v-dialog v-model="showTokenDialog" width="600px">
      <v-card>
        <v-card-title>
          <strong>API Token の設定</strong>
        </v-card-title>
        <v-card-text>
          <p>
            カレンダーデータの取得と予約の実行には API Token
            が必要です。わからない場合は管理者に教えてもらってください。
          </p>
          <v-text-field
            v-model="tokenValue"
            placeholder="API Token を入力してください"
            @keydown.enter="onSetToken"
            autofocus
          />
          <v-btn color="success" @click="onSetToken">
            <v-icon class="mr-3">mdi-key</v-icon>
            設定する
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-content>
      <v-alert
        type="error"
        v-if="showAlert"
        transition="scroll-y-transition"
        tile
      >
        {{ alertMessage }}
      </v-alert>
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
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'App',
  components: {},
  data: () => ({
    showTokenDialog: false,
    tokenValue: '',
  }),
  async mounted() {
    this.showTokenDialog = this.token === '';
    this.tokenValue = this.token;
    this.updateData();
  },
  computed: {
    ...mapState(['token', 'showAlert', 'alertMessage']),
    isMobile() {
      return ['sm', 'xs'].includes(this.$vuetify.breakpoint.name);
    },
  },
  methods: {
    ...mapMutations(['SET_TOKEN']),
    ...mapActions(['getRooms', 'getSchedules']),
    onSetToken() {
      this.SET_TOKEN(this.tokenValue);
      this.showTokenDialog = false;
      this.updateData();
    },
    updateData() {
      if (this.token !== '') {
        this.getRooms();
        this.getSchedules();
      }
    },
  },
};
</script>
