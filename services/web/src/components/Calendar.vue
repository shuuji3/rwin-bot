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
  left: -5px;
  border: none;
  width: 11px;
  height: 11px;
  background: red;
  border-radius: 50%;
}

// 詳細ダイアログボックスのリスト
.v-dialog .v-card {
  ul,
  ol {
    padding-left: 0 !important;
    list-style: none;
  }
}

// 時間の罫線を濃い青にする
.vuecal__time-column .vuecal__time-cell .line:before {
  border-top: 1px solid rgba(100, 149, 237, 0.6);
}
</style>

<style lang="scss" scoped>
.holiday {
  color: #c83600;
}
.weekend {
  color: steelblue;
}
.month {
  font-weight: bold;
}
</style>

<template>
  <v-container fluid v-shortkey="shortkeys" @shortkey="onShortkey">
    <v-row class="text-center">
      <v-col :lg="3" :md="3" cols="12">
        <!-- 月表示のミニカレンダー -->
        <vue-cal
          xsmall
          style="height: 300px;"
          class="vuecal--green-theme vuecal--rounded-theme mb-5"
          locale="ja"
          :time="false"
          default-view="month"
          :disable-views="['years', 'year', 'week', 'day']"
          hide-view-selector
          today-button
          @cell-click="onClickDateMiniCalendar"
          :selected-date="selectedDate"
        >
          <!-- 日付ヘッダ -->
          <template v-slot:title="{ view }">
            <span>
              {{ view.startDate.format('YYYY年 M月') }}
            </span>
          </template>
          <!-- today button -->
          <template v-slot:today-button>
            <v-icon class="mr-3">mdi-calendar-today</v-icon>
          </template>
          <!-- 日付 -->
          <template v-slot:cell-content="{ cell, view }">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <span
                  v-on="isHoliday(cell.startDate) ? on : null"
                  class="vuecal__cell-date"
                  :class="[
                    view.id,
                    {
                      holiday: isHoliday(cell.startDate),
                      weekend:
                        isWeekend(cell.startDate) && !isHoliday(cell.startDate),
                    },
                  ]"
                >
                  {{ cell.startDate.format('D') }}
                </span>
              </template>
              <span v-if="isHoliday(cell.startDate)">{{
                getHolidayName(cell.startDate)
              }}</span>
            </v-tooltip>
          </template>
        </vue-cal>
        <!-- 新規スケジュールの登録 -->
        <v-expansion-panels
          :value="
            ['sm', 'xs'].includes(this.$vuetify.breakpoint.name) ? null : 0
          "
          class="mb-5"
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <span>
                <v-icon class="mr-3">mdi-calendar-arrow-right</v-icon>
                新規スケジュールの登録
              </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-form
                ref="form"
                v-model="valid"
                @submit.prevent="registerSchedule"
              >
                <v-text-field
                  v-model="date"
                  label="日付"
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
                      step="600"
                      :rules="[
                        rules.required,
                        rules.timeUnit10Min,
                        rules.startBeforeEnd,
                        rules.notConflict,
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
                      step="600"
                      :rules="[
                        rules.required,
                        rules.timeUnit10Min,
                        rules.endAfterStart,
                        rules.notConflict,
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-select
                  v-model="roomName"
                  :items="rooms.map(room => room.roomName)"
                  :rules="[rules.required, rules.notConflict]"
                  label="場所"
                  prepend-icon="mdi-map-marker-outline"
                  required
                ></v-select>
                <v-text-field
                  v-model="title"
                  :rules="[rules.required]"
                  label="予定のタイトル"
                  prepend-icon="mdi-text"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="author"
                  :rules="[rules.required]"
                  label="予約者"
                  prepend-icon="mdi-account-outline"
                  required
                ></v-text-field>
                <v-btn
                  v-if="!isRegisterDone"
                  type="submit"
                  :disabled="!valid"
                  color="error"
                  class="mr-4"
                  large
                >
                  <v-icon class="mr-3">mdi-calendar-arrow-right</v-icon>
                  スケジュールを登録
                </v-btn>
                <v-btn
                  v-if="isRegisterDone"
                  color="success"
                  class="mr-4"
                  large
                  @click.prevent="resetForm"
                >
                  <v-icon class="mr-3">mdi-check</v-icon>
                  登録完了
                </v-btn>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <!-- 使い方のヒント -->
        <v-expansion-panels class="text-left">
          <v-expansion-panel>
            <v-expansion-panel-header>
              <span>
                <v-icon class="mr-2">mdi-lightbulb-on-outline</v-icon>
                使い方のヒント
              </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ul>
                <li>
                  日付を入力するには、ミニカレンダーの日付をクリック/タップしてね。
                </li>
                <li>
                  カレンダーの空欄をクリック/タップすると、選択した場所と時間が入力されるよ。
                </li>
                <li>
                  時刻の「分」は<code>↑</code>/<code>↓</code>キーを使うと10分刻みで増減できるよ。
                </li>
                <li>
                  <code>q</code>
                  キーを押すとショートカットキー一覧が表示されるよ。
                </li>
                <li>
                  ミニカレンダーの祝日にカーソルを合わせると、祝日の名前が表示されるよ。
                </li>
              </ul>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col :lg="9" :md="9" cols="12">
        <!-- メインのカレンダー -->
        <vue-cal
          ref="vuecal"
          style="height: 100%"
          class="vuecal--green-theme"
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
          :on-event-click="onClickSchedule"
          @cell-click="onClickCell"
          :selected-date="selectedDate"
        >
          <!-- 日付ヘッダ -->
          <template v-slot:title="{ view }">
            <span
              :class="{
                holiday: isHoliday(view.startDate),
                weekend:
                  isWeekend(view.startDate) && !isHoliday(view.startDate),
              }"
            >
              {{ view.startDate.format('YYYY年 M月 D日 (ddd)') }}
              <template v-if="isHoliday(view.startDate)">
                ({{ getHolidayName(view.startDate) }})
              </template>
            </span>
          </template>
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

        <!-- スケジュールの詳細を表示するダイアログ -->
        <v-dialog v-model="showEventDialog" width="600px">
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

        <!-- スケジュール登録中に表示するダイアログ -->
        <v-dialog
          persistent
          v-model="showRegisteringDialog"
          width="600px"
        >
          <v-card>
            <v-card-title>
              <strong>Rwin-bot がスケジュールを自動登録中...</strong>
            </v-card-title>
            <v-card-text>
              <v-img
                :src="require('@/assets/rainbow-spinner.svg')"
                class="my-3"
                contain
                height="200"
              />
              <p>
                完了まで30秒〜1分ほどかかります。タブを閉じても登録は行われますが、登録が完了したことを確認したい場合はそのまま待っていてください。
              </p>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- スケジュール登録の結果を表示するダイアログ -->
        <v-dialog v-model="showRegisterResultsDialog" width="600px">
          <v-card class="text-center" v-if="registerResults.success">
            <v-card-title>
              <strong>スケジュールの登録が完了！</strong>
            </v-card-title>
            <v-card-text>
              <v-img
                :src="require('@/assets/party-popper-emoji-android-10.png')"
                class="my-3"
                contain
                height="200"
              />
              <p>
                スケジュールの登録が完了しました！
              </p>
              <v-btn
                class="success"
                @click="
                  () => {
                    showRegisterResultsDialog = false;
                    isRegisterDone = true;
                  }
                "
              >
                <v-icon class="mr-3">mdi-check</v-icon>
                OK
              </v-btn>
            </v-card-text>
          </v-card>
          <v-card class="text-center" v-else>
            <v-card-title>
              <strong>スケジュールの登録に失敗</strong>
            </v-card-title>
            <v-card-text>
              <v-img
                :src="require('@/assets/crying-face-emoji-android-10.png')"
                class="my-3"
                contain
                height="200"
              />
              <p>
                スケジュールの登録に失敗しました。
              </p>
              <p>
                <strong>理由:</strong>
                {{ this.registerResults.message }}
              </p>
              <v-btn
                class="error"
                @click="
                  () => {
                    showRegisterResultsDialog = false;
                  }
                "
              >
                <v-icon class="mr-3">mdi-check</v-icon>
                OK
              </v-btn>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- キーボードショートカットのヘルプを表示するダイアログ -->
        <v-dialog v-model="showShortkeyDialog" width="600px">
          <v-card>
            <v-card-title>
              <strong>ショートカットキー一覧</strong>
            </v-card-title>
            <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">ショートカットキー</th>
                      <th class="text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="shortkey in shortkeyConfig" :key="shortkey.name">
                      <td>
                        <template v-for="(key, i) in shortkey.keys">
                          <code :key="i">{{ key.join(' + ') }}</code>
                          <template v-if="i !== shortkey.keys.length - 1"
                            >,
                          </template>
                        </template>
                      </td>
                      <td>{{ shortkey.help }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import holidayJp from '@holiday-jp/holiday_jp';
import VueCal from 'vue-cal';
import { mapState } from 'vuex';

import { shortkeyConfig, shortkeyHandler, buildShortkeys } from './shortkey';

import 'vue-cal/dist/vuecal.css';
import 'vue-cal/dist/i18n/ja.js';

export default {
  components: { VueCal },

  name: 'Calendar',

  data: () => ({
    // for form
    valid: false,
    isRegisterDone: false,
    start: null,
    end: null,
    title: '',
    roomName: '',
    author: '',

    selectedDate: new Date(),
    selectedEvent: {},
    showEventDialog: false,
    showRegisteringDialog: false,
    showRegisterResultsDialog: false,
    registerResults: {},
    showShortkeyDialog: false,
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
    // TODO: refactor and generalize room objects
    roomSplitToRoomNameMap: new Map([
      [1, 'ワークショップ室'],
      [2, '会議室A'],
      [3, '会議室B'],
      [4, '会議室C'],
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
    rules() {
      // 返すオブジェクトの内側のブロックでは、this = オブジェクトになってしまう。
      // そのため、vmに退避する必要がある。
      const vm = this;
      return {
        required: v => !!v || '必須項目です',
        timeUnit10Min: time => {
          if (time == null) {
            return '必須項目です';
          }
          const [, min] = time.split(':');
          return min % 10 === 0 || '時刻は10分単位で指定してください';
        },
        startBeforeEnd: startTime => {
          if (!vm.date || !vm.end) {
            return true;
          }
          return (
            dayjs(`${vm.date} ${vm.end}`) - dayjs(`${vm.date} ${startTime}`) >
              0 || '開始時刻は終了時刻より前でなければなりません'
          );
        },
        endAfterStart: endTime => {
          if (!vm.date || !vm.start) {
            return true;
          }
          return (
            dayjs(`${vm.date} ${endTime}`) - dayjs(`${vm.date} ${vm.start}`) >
              0 || '終了時刻は開始時刻より後でなければなりません'
          );
        },

        /**
         * 新規スケジュールの時間がコンフリクトしているかどうかをチェックする。
         */
        notConflict() {
          const thisRoomTodayEvents = vm.events.filter(
            event =>
              event.roomName === vm.roomName &&
              dayjs(event.start)
                .toDate()
                .isToday()
          );
          const newEventStart = dayjs(`${vm.date} ${vm.start}`);
          const newEventEnd = dayjs(`${vm.date} ${vm.end}`);
          return (
            thisRoomTodayEvents.every(
              event =>
                newEventEnd <= dayjs(event.start) ||
                dayjs(event.end) <= newEventStart
            ) || 'この時間・場所には他の予定が登録されています'
          );
        },
      };
    },
    newSchedule() {
      return {
        start: `${this.date} ${this.start}`,
        end: `${this.date} ${this.end}`,
        title: this.title,
        roomName: this.roomName,
        author: this.author,
      };
    },
    shortkeys() {
      return buildShortkeys();
    },
    shortkeyConfig() {
      return shortkeyConfig();
    },
  },

  methods: {
    /**
     * ショートカットキーのイベントハンドラ。
     */
    onShortkey({ srcKey: eventName }) {
      shortkeyHandler(eventName, this);
    },

    /**
     * ミニカレンダーで日付をクリックしたときに発火するイベント。
     * @param {Date} date クリックした日付。
     */
    onClickDateMiniCalendar(date) {
      this.selectedDate = date;
    },

    /**
     * スケジュールのクリックハンドラ。ダイアログをオープンする
     */
    onClickSchedule(event, e) {
      this.selectedEvent = event;
      this.showEventDialog = true;

      // Prevent navigating to narrower view (default vue-cal behavior).
      e.stopPropagation();
    },

    /**
     * カレンダーの空きセルのクリックハンドラ。
     * クリックしたセルの部屋と日時をフォームにフィルする。
     * @param {{date: Date, split: string}}
     */
    onClickCell({ date, split }) {
      const min = dayjs(date).get('minute');
      const start = dayjs(date).subtract(min % 10, 'minute');
      const end = start.add(2, 'hour');

      this.start = start.format('HH:mm');
      this.end = end.format('HH:mm');
      this.roomName = this.getRoomNameBySplit(split);
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
     * @return {{class: string, split: number}}
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
     * 部屋の名前からvue-cal用の場所情報のオブジェクトを返す。
     * @param {string} split
     * @return {string}
     */
    getRoomNameBySplit(split) {
      return this.roomSplitToRoomNameMap.get(Number(split)) ?? '';
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
     * bot に新規スケジュールを登録してもらう。
     */
    async registerSchedule() {
      this.showRegisteringDialog = true;
      const {
        data,
      } = await axios.post(
        'http://localhost:8080/api/register-schedule',
        this.newSchedule,
        { headers: { 'content-type': 'application/json' } }
      );
      this.registerResults = data;
      this.showRegisteringDialog = false;
      this.showRegisterResultsDialog = true;
    },

    /**
     * 新規スケジュール登録フォームをリセットする。
     */
    resetForm() {
      this.isRegisterDone = false;
      this.start = null;
      this.end = null;
      this.title = '';
      this.roomName = '';
      this.author = '';
      this.$refs.form.resetValidation();
    },

    /**
     * 与えられた日付が祝日かどうか判定する。
     * @param {Date} date
     * @return {Boolean}
     */
    isHoliday(date) {
      return holidayJp.isHoliday(date);
    },

    /**
     * 与えられた日付が土曜日またはかどうか判定する。
     * @param {Date} date
     * @return {Boolean}
     */
    isWeekend(date) {
      const SUNDAY = 0;
      const SATURDAY = 6;
      const weekday = date.getDay();
      return weekday === SUNDAY || weekday === SATURDAY;
    },

    /**
     * 祝日の名前を取得する。
     * @param {Date} date 祝日
     * @return {string}
     */
    getHolidayName(date) {
      const holiday = holidayJp.between(date, date);
      return holiday ? holiday[0].name : '';
    },
  },
};
</script>
