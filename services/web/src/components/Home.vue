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
        <h1 class="display-2 font-weight-bold mb-3">
          Rwin-bot
        </h1>

        <p class="subheading font-weight-regular">
          ストレスフリーで<br />部屋を予約しよう！
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          次の予定は？
        </h2>

        <v-data-table
          :headers="headers"
          :items="schedules"
          class="elevation-1"
          :items-per-page="20"
        >
          <template v-slot:item.roomName="{ item }">
            <v-chip :color="getColor(item.roomName)" dark>{{
              item.roomName
            }}</v-chip>
          </template>
          <template v-slot:item.start="{ item }">
            {{ formatTime(item.start) }}
          </template>
          <template v-slot:item.end="{ item }">
            {{ formatTime(item.end) }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
// import schedules from './dummySchedules';

export default {
  name: 'Home',

  data: () => ({
    headers: [
      { text: '場所', value: 'roomName' },
      { text: '開始時刻', value: 'start' },
      { text: '終了時刻', value: 'end' },
      { text: '予約者', value: 'author' },
      { text: 'スケジュール', value: 'title' },
    ],
    schedules: [],
  }),

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
    formatTime(time) {
      return dayjs(time, { timeZone: 'Asia/Tokyo' }).format('YYYY-MM-DD HH:mm');
    },
  },

  async mounted() {
    const { data } = await axios.get(
      'http://localhost:8010/proxy/api/schedules'
    );
    this.schedules = data;

    // TODO: fix
    // this.schedules = await axios.get('http://localhost:3000/api/schedules', {
    //   headers: { 'Access-Control-Allow-Origin': '*' },
    // });
  },
};
</script>
