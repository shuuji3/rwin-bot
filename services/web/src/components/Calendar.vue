<style lang="scss">
// 部屋ごとの背景
.vuecal__cell-split {
  &.ccs-ws {
    background-color: rgba(221, 238, 255, 0.5);
  }

  &.ccs-a {
    background-color: rgba(255, 232, 251, 0.5);
  }

  &.ccs-b {
    background-color: rgba(221, 255, 239, 0.5);
  }

  &.ccs-c {
    background-color: rgba(255, 250, 196, 0.5);
  }

  &.xyz {
    background-color: rgba(255, 206, 178, 0.5);
  }

  .split-label {
    color: rgba(0, 0, 0, 0.1);
    font-size: 26px;
  }
}
// 部屋の名前
.vuecal__split-days-headers .day-split-header {
  font-weight: bold;
}

// スケジュールのスタイル
.vuecal__event {
  color: white;
  text-align: start;
  line-height: 1.3em;
  border: 2px solid white;
  border-radius: 8px !important;
  padding: 4px 8px;
  margin: 0;
  cursor: pointer;

  &.ccs-ws {
    background-color: rgb(106, 196, 244);
  }

  &.ccs-a {
    background-color: rgb(216, 140, 205);
  }

  &.ccs-b {
    background-color: rgb(143, 220, 65);
  }

  &.ccs-c {
    background-color: rgb(255, 190, 40);
  }
}

// 今日の日付
.vuecal--xsmall {
  .selected .vuecal__cell-content {
    border-width: 3px;
  }
}

// 現在時刻の線の左に●を置く
.vuecal__now-line:before {
  top: -6px;
  border: none;
  width: 11px;
  height: 11px;
  background: red;
  border-radius: 50%;
}

// 詳細ダイアログボックスのリスト
.v-application ul,
.v-application ol {
  padding-left: 0 !important;
  list-style: none;
}
</style>

<template>
  <v-container fluid>
    <v-row class="text-center">
      <v-col cols="2">
        <!-- 月表示のミニカレンダー -->
        <vue-cal
          xsmall
          style="height: 300px;"
          class="vuecal--blue-theme vuecal--rounded-theme mb-5"
          locale="ja"
          :time="false"
          default-view="month"
          :disable-views="['years', 'year', 'week', 'day']"
          hide-view-selector
          today-button
          @cell-click="onClickDateMiniCalendar"
          :selected-date="selectedDate"
        >
          >
          <!-- today button -->
          <template v-slot:today-button>
            <v-icon class="mr-3">mdi-calendar-today</v-icon>
          </template>
        </vue-cal>
        <!-- 新規スケジュールの登録 -->
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="date"
            label="日付 (↑のミニカレンダーで選択)"
            prepend-icon="mdi-calendar"
            disabled
            required
          ></v-text-field>
          <v-row>
            <!-- 開始時刻 -->
            <v-col cols="7" class="py-0">
              <v-text-field
                v-model="start"
                label="開始時刻"
                prepend-icon="mdi-clock-outline"
                type="time"
                :rules="[
                  v => !!v || '必須項目です',
                  time => {
                    if (time == null) {
                      return '必須項目です';
                    }
                    const [hour, min] = time.split(':');
                    return min % 10 === 0 || '時刻は10分単位で指定してください';
                  },
                ]"
                required
              ></v-text-field>
            </v-col>
            <!-- 終了時刻 -->
            <v-col class="py-0">
              <v-text-field
                v-model="end"
                label="終了時刻"
                type="time"
                :rules="[
                  v => !!v || '必須項目です',
                  time => {
                    if (time == null) {
                      return '必須項目です';
                    }
                    const [hour, min] = time.split(':');
                    return min % 10 === 0 || '時刻は10分単位で指定してください';
                  },
                ]"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-select
            v-model="roomName"
            :items="rooms.map(room => room.roomName)"
            :rules="[v => !!v || '必須項目です']"
            label="場所"
            prepend-icon="mdi-map-marker-outline"
            required
          ></v-select>
          <v-text-field
            v-model="title"
            :rules="[v => !!v || '必須項目です']"
            label="予定のタイトル"
            prepend-icon="mdi-text"
            required
          ></v-text-field>
          <v-text-field
            v-model="author"
            :rules="[v => !!v || '必須項目です']"
            label="予約者"
            prepend-icon="mdi-account-outline"
            required
          ></v-text-field>
          <v-btn
            :disabled="!valid"
            color="error"
            class="mr-4"
            @click="registerSchedule"
            large
          >
            <v-icon class="mr-3">mdi-calendar-arrow-right</v-icon>
            スケジュールを登録
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="10">
        <vue-cal
          style="height: 100%"
          class="vuecal--blue-theme"
          locale="ja"
          default-view="day"
          :disable-views="['years', 'year', 'month', 'week']"
          hide-weekends
          hide-view-selector
          today-button
          :time-from="8 * 60"
          :time-to="21 * 60"
          :timeCellHeight="70"
          :sticky-split-labels="true"
          :split-days="splitDays"
          :events="events"
          :on-event-click="onEventClick"
          :selected-date="selectedDate"
        >
          <!-- today button -->
          <template v-slot:today-button>
            <v-icon class="mr-3">mdi-calendar-today</v-icon>
          </template>
          >
          <!-- スケジュールのレンダリング -->
          <template v-slot:event-renderer="{ event }">
            <div
              class="vuecal__event-title font-weight-bold"
              v-html="event.title"
            />
            <div class="vuecal__event-time" v-if="!isShortEvent(event)">
              <v-icon color="white" small>mdi-clock-outline</v-icon>
              {{ event.startDate.format('HH:mm') }} -
              {{ event.endDate.format('HH:mm') }}
            </div>
            <div class="vuecal__event-content" v-if="!isShortEvent(event)">
              <v-icon color="white" small>mdi-account-outline</v-icon>
              {{ event.content }}
            </div>
          </template>
        </vue-cal>

        <!-- イベントクリック時に表示するダイアログ -->
        <v-dialog v-model="showDialog" width="600px">
          <v-card>
            <v-card-title>
              <strong>{{ selectedEvent.title }}</strong>
            </v-card-title>
            <v-card-text>
              <ul>
                <li>
                  <v-icon class="mr-2">mdi-clock-outline</v-icon>
                  <strong>時間:</strong>
                  {{
                    selectedEvent.startDate &&
                      selectedEvent.startDate.format('YYYY-MM-DD (ddd)')
                  }}
                  {{
                    selectedEvent.startDate &&
                      selectedEvent.startDate.formatTime()
                  }}
                  -
                  {{
                    selectedEvent.startDate &&
                      selectedEvent.endDate.formatTime()
                  }}
                </li>
                <li>
                  <v-icon class="mr-2">mdi-map-marker-outline</v-icon>
                  <strong>場所:</strong> {{ selectedEvent.roomTypeName }} /
                  {{ selectedEvent.buildingName }} /
                  {{ selectedEvent.roomName }}
                </li>
                <li>
                  <v-icon class="mr-2">mdi-account-outline</v-icon>
                  <strong>予約者:</strong> {{ selectedEvent.content }}
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import VueCal from 'vue-cal';
import dayjs from 'dayjs';

import 'vue-cal/dist/vuecal.css';
import 'vue-cal/dist/i18n/ja.js';

export default {
  components: { VueCal },

  name: 'Calendar',

  data: () => ({
    // for form
    valid: false,
    startMenu: false,
    start: null,
    endMenu: false,
    end: null,
    title: '',
    roomName: '',
    author: '',

    selectedDate: new Date(),
    selectedEvent: {},
    showDialog: false,
    // TODO: refactor and generalize room objects
    roomNameToRoomMap: new Map([
      [
        'ワークショップ室',
        { label: 'ワークショップ室', class: 'ccs-ws', split: 1 },
      ],
      ['会議室A', { label: '会議室A', class: 'ccs-a', split: 2 }],
      ['会議室B', { label: '会議室B', class: 'ccs-b', split: 3 }],
      ['会議室C', { label: '会議室C', class: 'ccs-c', split: 4 }],
    ]),
  }),

  computed: {
    ...mapState(['rooms', 'schedules']),
    splitDays() {
      return [...this.roomNameToRoomMap.values()];
    },
    events() {
      return this.schedules.map(this.convertRwinBotSchedule);
    },
    date() {
      return dayjs(this.selectedDate).format('YYYY-MM-DD');
    },
  },

  methods: {
    /**
     * スケジュールのクリックハンドラ。ダイアログをオープンする
     */
    onEventClick(event, e) {
      this.selectedEvent = event;
      this.showDialog = true;

      // Prevent navigating to narrower view (default vue-cal behavior).
      e.stopPropagation();
    },

    /**
     * ミニカレンダーで日付をクリックしたときに発火するイベント。
     * @param {Date} date クリックした日付。
     */
    onClickDateMiniCalendar(date) {
      this.selectedDate = date;
    },

    /**
     * rwin-botがデータベースに保存している形式のスケジュールのオブジェクトを、vue-calの形式に変換する
     */
    convertRwinBotSchedule(rwinBotSchedule) {
      const room = this.getRoom(rwinBotSchedule.roomName);
      return {
        start: rwinBotSchedule.start.format('YYYY-MM-DD HH:mm'),
        end: rwinBotSchedule.end.format('YYYY-MM-DD HH:mm'),
        title: rwinBotSchedule.title,
        content: `${rwinBotSchedule.author}`,
        class: room.class,
        split: room.split,
        roomTypeName: rwinBotSchedule.roomTypeName,
        buildingName: rwinBotSchedule.buildingName,
        roomName: rwinBotSchedule.roomName,
      };
    },

    /**
     * 部屋の名前からvue-cal用の場所情報のオブジェクトを返す。
     * @param {string} roomName
     * @returns {{class: string, split: number}}
     */
    getRoom(roomName) {
      return (
        this.roomNameToRoomMap.get(roomName) ?? {
          class: '',
          split: 0,
        }
      );
    },

    /**
     * イベントの時間が短いかどうかを判定する述語関数。1時間未満の場合はtrueを返す。
     * @param {object} vueCalEvent
     * @return {boolean}
     */
    isShortEvent(vueCalEvent) {
      const duration =
        vueCalEvent.endTimeMinutes - vueCalEvent.startTimeMinutes;
      return duration < 60;
    },

    /**
     * Rwin-botで予定を登録する。
     * TODO: implement
     */
    registerSchedule() {
      const newSchedule = {
        date: this.date,
        start: this.start,
        end: this.end,
        title: this.title,
        roomName: this.roomName,
        author: this.author,
      };
      console.log('registerSchedule()', newSchedule);
    },
  },
};
</script>
