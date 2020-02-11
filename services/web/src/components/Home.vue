<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.png')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <p class="subheading font-weight-regular">
          ストレスフリーで<br />部屋を予約しよう！
        </p>
        <p>
          <v-btn color="primary" large to="/calendar">
            <v-icon>mdi-calendar-arrow-right</v-icon>
            <span class="ml-1">スケジュールを登録する</span>
          </v-btn>
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          今後の予定は？
        </h2>

        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              label="キーワード検索"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="recentSchedules"
            :search="search"
            class="elevation-1"
          >
            <!-- 部屋の列 -->
            <template v-slot:item.roomName="{ item }">
              <v-chip :color="getColor(item.roomName)" dark class="room-chip">{{
                item.roomName
              }}</v-chip>
            </template>
            <!-- 日付の列 -->
            <template v-slot:item.date="{ item }">
              {{ formatDate(item.start) }}
            </template>
            <!-- 時刻の列 -->
            <template v-slot:item.time="{ item }">
              {{ formatTime(item.start) }} - {{ formatTime(item.end) }} ({{
                formatDuration(item.start, item.end)
              }})
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.room-chip {
  max-width: 10em;
}
</style>

<script>
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { mapState } from 'vuex';

dayjs.locale('ja');

export default {
  name: 'Home',

  data: () => ({
    headers: [
      { text: '場所', value: 'roomName' },
      { text: '日付', value: 'date' },
      { text: '時間', value: 'time' },
      { text: 'スケジュール', value: 'title' },
      { text: '予約者', value: 'author' },
    ],
    search: '',
  }),

  computed: {
    ...mapState(['schedules']),

    /**
     * 予定が早い順に今後の予定リストを取得する。
     * @return {object[]}
     */
    recentSchedules() {
      const sortedSchedules = this.schedules.slice();
      sortedSchedules.sort(
        (schedule1, schedule2) => schedule1.start - schedule2.start
      );
      return sortedSchedules.filter(schedule => schedule.end >= dayjs());
    },
  },

  methods: {
    /**
     * 部屋の名前のツールチップの背景色を取得する。
     * @param {string} roomName
     * @return {string}
     */
    getColor(roomName) {
      const colorMap = new Map([
        ['ワークショップ室', '#F44336'],
        ['会議室A', '#8fdc41'],
        ['会議室B', '#6ac4f4'],
        ['会議室C', '#bd80f4'],
      ]);
      const color = colorMap.get(roomName);
      return color != null ? color : 'gray';
    },

    /**
     * 日付のフォーマットを行う。
     * @param {dayjs.Dayjs} time
     * @return {string}
     */
    formatDate(time) {
      return time.format('YYYY-MM-DD (ddd)');
    },

    /**
     * 時刻のフォーマットを行う。
     * @param {dayjs.Dayjs} time
     * @return {string}
     */
    formatTime(time) {
      return time.format('HH:mm');
    },

    /**
     * 開始時刻から終了時刻までの時間のフォーマットを行う。
     * @param {dayjs.Dayjs} start
     * @param {dayjs.Dayjs} end
     * @return {string}
     */
    formatDuration(start, end) {
      const durationInMinutes = (end - start) / 1000 / 60;
      const hour = String(Math.floor(durationInMinutes / 60));
      const min = String(durationInMinutes % 60).padStart(2, '0');
      return `${hour}:${min}`;
    },
  },
};
</script>
