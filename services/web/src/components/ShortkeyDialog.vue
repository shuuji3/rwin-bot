<!-- キーボードショートカットのヘルプを表示するダイアログ -->

<template>
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
</template>

<script>
const { shortkeyConfig } = require('./shortkey');

export default {
  name: 'shortkey-dialog',
  props: {
    showShortkeyDialog: { type: Boolean, default: false, require: true },
  },
  computed: {
    shortkeyConfig() {
      return shortkeyConfig();
    },
  },
};
</script>
