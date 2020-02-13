#!/usr/bin/env node

const Queue = require('bull');
const path = require('path');

(async () => {
  await main();
})();

/**
 * Usageを表示する。
 */
function printUsage() {
  console.error(`Usage: node index.js [save-schedules | register-schedule]`);
}

async function main() {
  const command = process.argv[2];
  if (command == null) {
    printUsage();
    return;
  }

  const saveSchedulesQueue = new Queue('save-schedules', 'redis://redis');
  const registerScheduleQueue = new Queue('register-schedule', 'redis://redis');

  saveSchedulesQueue.process(path.resolve('src/runSaveSchedules.js'));
  registerScheduleQueue.process(path.resolve('src/runRegisterSchedule.js'));

  if (command === 'save-schedules') {
    saveSchedulesQueue.add();
  } else if (command === 'register-schedule') {
    // TODO: use requested schedule
    const newSchedule = {
      author: 'HPCS',
      title: 'rwin-test',
      roomName: '会議室C',
      start: '2020-02-14 23:00',
      end: '2020-02-14 23:30',
    };
    await registerScheduleQueue.add(newSchedule);
  }
}
