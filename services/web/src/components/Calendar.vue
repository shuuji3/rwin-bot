<template>
  <v-container>
    <v-row class="text-center">
      <h1>Calendar.vue Component</h1>
      <v-col cols="12">
        <v-app id="dayspan" v-cloak>
          <ds-calendar-app :calendar="calendar"></ds-calendar-app>
        </v-app>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Calendar } from 'dayspan';

export default {
  name: 'Calendar',

  data: () => ({
    calendar: Calendar.months(),
  }),

  computed: {},

  methods: {},
};
</script>
