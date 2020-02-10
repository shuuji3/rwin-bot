<style lang="scss">
// 部屋ごとの背景
.vuecal__cell-split.ccs-ws {
  background-color: rgba(221, 238, 255, 0.5);
}
.vuecal__cell-split.ccs-a {
  background-color: rgba(255, 232, 251, 0.5);
}
.vuecal__cell-split.ccs-b {
  background-color: rgba(221, 255, 239, 0.5);
}
.vuecal__cell-split.ccs-c {
  background-color: rgba(255, 250, 196, 0.5);
}
.vuecal__cell-split.xyz {
  background-color: rgba(255, 206, 178, 0.5);
}
.vuecal__cell-split .split-label {
  color: rgba(0, 0, 0, 0.1);
  font-size: 26px;
}

// スケジュールのスタイル
.vuecal__event.ccs-ws {
  background-color: rgba(253, 156, 66, 0.9);
  border: 1px solid rgb(233, 136, 46);
  color: #fff;
}
.vuecal__event.ccs-a {
  background-color: rgba(164, 230, 210, 0.9);
  border: 1px solid rgb(144, 210, 190);
}
.vuecal__event.ccs-c {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;
}
</style>

<template>
  <v-container fluid>
    <v-row class="text-center">
      <v-col cols="2">
        <vue-cal
          xsmall
          style="height: 300px;"
          class="vuecal--blue-theme"
          locale="ja"
          :time="false"
          default-view="month"
          :disable-views="['years', 'year', 'week', 'day']"
          hide-view-selector
          @cell-click="onClickDateMiniCalendar"
        >
          >
        </vue-cal>
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
          :time-step="30"
          :time-from="9 * 60"
          :time-to="21 * 60"
          :timeCellHeight="30"
          :sticky-split-labels="true"
          :split-days="rooms"
          :events="events"
          :on-event-click="onEventClick"
          :selected-date="selectedDate"
        >
          >
          <template v-slot:today-button>
            <span class="mr-3" style="font-size: 0.8em;">Today</span>
          </template>
        </vue-cal>

        <!-- イベントクリック時に表示するダイアログ -->
        <v-dialog v-model="showDialog">
          <v-card>
            <v-card-title>
              <v-icon>{{ selectedEvent.icon }}</v-icon>
              <span>{{ selectedEvent.title }}</span>
              <v-spacer />
              <strong>{{
                selectedEvent.startDate &&
                  selectedEvent.startDate.format('YYYY-MM-DD')
              }}</strong>
            </v-card-title>
            <v-card-text>
              <p v-html="selectedEvent.contentFull" />
              <strong>Event details:</strong>
              <ul>
                <li>
                  Event starts at:
                  {{
                    selectedEvent.startDate &&
                      selectedEvent.startDate.formatTime()
                  }}
                </li>
                <li>
                  Event ends at:
                  {{
                    selectedEvent.endDate && selectedEvent.endDate.formatTime()
                  }}
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
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import 'vue-cal/dist/i18n/ja.js';

export default {
  components: { VueCal },

  name: 'Calendar',

  data: () => ({
    selectedDate: new Date(),
    selectedEvent: {},
    showDialog: false,
    rooms: [
      { class: 'ccs-ws', label: 'ワークショップ室' },
      { class: 'ccs-a', label: '会議室A' },
      { class: 'ccs-b', label: '会議室B' },
      { class: 'ccs-c', label: '会議室C' },
    ],
    events: [
      {
        start: '2020-02-10 14:00',
        end: '2020-02-10 16:00',
        title: 'Need to go shopping',
        content: 'Click to see my shopping list',
        class: 'ccs-c',
        split: 4,
        icon: 'mdi-cart-outline', // Custom attribute.
        contentFull:
          'My shopping list is rather long:<br><ul><li>Avocadoes</li><li>Tomatoes</li><li>Potatoes</li><li>Mangoes</li></ul>', // Custom attribute.
      },
      {
        start: '2020-02-10 12:00',
        end: '2020-02-10 18:00',
        title: 'Golf with John',
        content: 'Do I need to tell how many holes?',
        class: 'ccs-ws',
        split: 1,
        icon: 'mdi-golf', // Custom attribute.
        contentFull: 'Okay.<br>It will be a 18 hole golf course.', // Custom attribute.
      },
    ],
  }),

  computed: {},

  methods: {
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
  },
};
</script>
