module.exports = { shortkeyConfig, buildShortkeys, shortkeyHandler };

function shortkeyConfig() {
  return config;
}

const config = [
  {
    name: 'help',
    help: 'ヘルプを表示する',
    keys: [['q'], ['f1']],
    handler: vm => {
      vm.showShortkeyDialog = !vm.showShortkeyDialog;
    },
  },
  {
    name: 'today',
    help: '今日に移動する',
    keys: [['t']],
    handler: vm => {
      vm.$refs.vuecal.switchView('day', new Date());
    },
  },
  {
    name: 'nextDay',
    help: '次の日に移動する',
    keys: [['j'], ['f'], ['arrowright']],
    handler: vm => {
      vm.$refs.vuecal.next();
    },
  },
  {
    name: 'previousDay',
    help: '前の日に移動する',
    keys: [['k'], ['b'], ['arrowleft']],
    handler: vm => {
      vm.$refs.vuecal.previous();
    },
  },
  {
    name: 'nextWeek',
    help: '次の週に移動する',
    keys: [['l'], ['n']],
    handler: vm => {
      for (let i = 0; i < 7; i++) {
        vm.$refs.vuecal.next();
      }
    },
  },
  {
    name: 'previousWeek',
    help: '前の週に移動する',
    keys: [['h'], ['p']],
    handler: vm => {
      for (let i = 0; i < 7; i++) {
        vm.$refs.vuecal.previous();
      }
    },
  },
];

/**
 *
 * @param {string} eventName ショートカットキーのイベント名。
 * @param {Vue} vm Vue インスタンスを渡す
 */
function shortkeyHandler(eventName, vm) {
  const shortkey = config.find(shortkey => eventName.startsWith(shortkey.name));
  shortkey?.handler(vm);

  // ミニカレンダーの選択日を更新するために設定する必要がある。
  vm.selectedDate = vm.$refs.vuecal.view.startDate;
}

/**
 * config をもとに、v-shortkey に設定するキャッチするキーとイベント名のマップを作成する。
 * @return {{string: string[]}} i.e. {today: ['t'], tomorrow: ['j'], yesterday: ['k']}
 */
function buildShortkeys() {
  const shortkeys = {};
  config.forEach(shortkey => {
    shortkey.keys.forEach((key, index) => {
      const eventName = `${shortkey.name}_${index}`;
      shortkeys[eventName] = key;
    });
  });
  return shortkeys;
}
