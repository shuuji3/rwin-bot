import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import dayjs from 'dayjs';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    rooms: [],
    schedules: [],
    showAlert: false,
    alertMessage: '',
    BOT_API_BASE_URL: process.env.VUE_APP_BOT_API_BASE_URL,
    DB_API_BASE_URL: process.env.VUE_APP_DB_API_BASE_URL,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    SET_ROOMS(state, rooms) {
      state.rooms = rooms;
    },
    SET_SCHEDULES(state, schedules) {
      state.schedules = schedules;
    },
    SET_SHOW_ALERT(state, showAlert) {
      state.showAlert = showAlert;
    },
    SET_ALERT_MESSAGE(state, alertMessage) {
      state.alertMessage = alertMessage;
    },
  },
  actions: {
    async getRooms({ commit, state }) {
      commit('SET_ROOMS', await fetchRooms({ commit, state }));
    },
    async getSchedules({ commit, state }) {
      commit('SET_SCHEDULES', await fetchSchedules({ commit, state }));
    },
    async saveSchedules({ commit, state }) {
      await postSaveSchedules({ commit, state });
    },
  },
  modules: {},
});

// 部屋のデータを取得する。
async function fetchRooms({ commit, state }) {
  try {
    const { data: rooms } = await axios.get(`${process.env.VUE_APP_DB_API_BASE_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    commit('SET_SHOW_ALERT', false);
    return rooms;
  } catch (e) {
    commit('SET_SHOW_ALERT', true);
    commit(
      'SET_ALERT_MESSAGE',
      `部屋のデータの取得に失敗しました。API Token を確認してください (error: ${e.message})`
    );
    return [];
  }
}

// スケジュールのデータを取得する。
async function fetchSchedules({ commit, state }) {
  try {
    const { data: schedules } = await axios.get(
      `${process.env.VUE_APP_DB_API_BASE_URL}/api/schedules`,
      {
        headers: { Authorization: `Bearer ${state.token}` },
      }
    );
    schedules.forEach(schedule => {
      schedule.start = dayjs(schedule.start).subtract(9, 'hour');
      schedule.end = dayjs(schedule.end).subtract(9, 'hour');
    });
    commit('SET_SHOW_ALERT', false);
    return schedules;
  } catch (e) {
    commit('SET_SHOW_ALERT', true);
    commit(
      'SET_ALERT_MESSAGE',
      `スケジュールデータの取得に失敗しました。API Token を確認してください (error: ${e.message})`
    );
    return [];
  }
}

// 最新のスケジュールの保存リクエストを送信する。
async function postSaveSchedules({ commit, state }) {
  try {
    await axios.post(`${process.env.VUE_APP_BOT_API_BASE_URL}/api/save-schedules`, null, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    commit('SET_SHOW_ALERT', false);
  } catch (e) {
    commit('SET_SHOW_ALERT', true);
    commit(
      'SET_ALERT_MESSAGE',
      `最新スケジュールの保存リクエストに失敗しました。API Token を確認してください (error: ${e.message})`
    );
    return [];
  }
}
