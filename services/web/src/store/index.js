import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import dayjs from 'dayjs';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rooms: [],
    schedules: [],
  },
  mutations: {
    updateRooms(state, rooms) {
      state.rooms = rooms;
    },
    updateSchedules(state, schedules) {
      state.schedules = schedules;
    },
  },
  actions: {
    async getRooms({ commit }) {
      commit('updateRooms', await fetchRooms());
    },
    async getSchedules({ commit }) {
      commit('updateSchedules', await fetchSchedules());
    },
  },
  modules: {},
});

async function fetchRooms() {
  const { data: rooms } = await axios.get(
    'http://localhost:8080/api/rooms'
  );
  // });

  return rooms;
}

async function fetchSchedules() {
  const { data: schedules } = await axios.get(
    'http://localhost:8080/api/schedules'
  );
  // });

  schedules.forEach(schedule => {
    schedule.start = dayjs(schedule.start).subtract(9, 'hour');
    schedule.end = dayjs(schedule.end).subtract(9, 'hour');
  });
  return schedules;
}
