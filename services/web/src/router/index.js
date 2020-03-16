import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../components/Home.vue';
import Calendar from '../components/Calendar.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: Calendar,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
