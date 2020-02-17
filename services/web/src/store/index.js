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
  },
  modules: {},
});

async function fetchRooms({ commit, state }) {
  try {
    const { data: rooms } = await axios.get('http://localhost:8080/api/rooms', {
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

async function fetchSchedules({ commit, state }) {
  try {
    const { data: schedules } = await axios.get(
      'http://localhost:8080/api/schedules',
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
