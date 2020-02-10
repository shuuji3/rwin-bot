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
          <v-btn color="primary" large >
            <v-icon>mdi-calendar-arrow-right</v-icon>
            <span class="ml-1">スケジュールを登録する</span>
          </v-btn>
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          今後の予定は？
        </h2>

        <v-data-table
          :headers="headers"
          :items="recentSchedules"
          class="elevation-1"
        >
          <template v-slot:item.roomName="{ item }">
            <v-chip :color="getColor(item.roomName)" dark class="room-chip">{{
              item.roomName
            }}</v-chip>
          </template>
          <template v-slot:item.date="{ item }">
            {{ formatDate(item.start) }}
          </template>
          <template v-slot:item.time="{ item }">
            {{ formatTime(item.start) }} - {{ formatTime(item.end) }}
          </template>
        </v-data-table>
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
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

export default {
  name: 'Home',

  data: () => ({
    headers: [
      { text: '場所', value: 'roomName' },
      { text: '日付', value: 'date' },
      { text: '時刻', value: 'time' },
      { text: 'スケジュール', value: 'title' },
      { text: '予約者', value: 'author' },
    ],
    schedules: [],
  }),

  computed: {
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
    formatDate(time) {
      return dayjs(time).format('YYYY-MM-DD (ddd)');
    },
    formatTime(time) {
      return dayjs(time).format('HH:mm');
    },
  },

  async mounted() {
    const { data: schedules } = await axios.get(
      'http://localhost:8010/proxy/api/schedules'
    );
    schedules.forEach(schedule => {
      schedule.start = dayjs(schedule.start)
        .subtract(9, 'hour')
        .toDate();
      schedule.end = dayjs(schedule.end)
        .subtract(9, 'hour')
        .toDate();
    });
    this.schedules = schedules;

    // TODO: fix CORs problem
    // this.schedules = await axios.get('http://localhost:3000/api/schedules', {
    //   headers: { 'Access-Control-Allow-Origin': '*' },
    // });
  },
};
</script>
