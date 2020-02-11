#!/usr/bin/env node

const puppeteer = require('puppeteer');

const runSaveSchedules = require('./runSaveSchedules');
const runRegisterSchedule = require('./runRegisterSchedule');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const BASE_URL = process.env.BASE_URL;

(async () => {
  await main();
})();

async function main() {
  const command = process.argv[2];
  if (command == null) {
    printUsage();
    return;
  }

  const browser = await getBrowser();
  const page = await login(browser);

  if (command === 'save-schedules') {
    await runSaveSchedules(page);
  } else if (command === 'register-schedule') {
    // TODO: use requested schedule
    const newSchedule = {
      author: 'タスクフォースT',
      title: '戦略ミーティング',
      roomName: '会議室C',
      start: '2020-02-12 23:00',
      end: '2020-02-12 23:30',
    };
    await runRegisterSchedule(page, newSchedule);
  }

  await browser.close();
}

/**
 * Usageを表示する。
 */
function printUsage() {
  console.error(`Usage: node index.js [save-schedules | register-schedule]`);
}


/**
 * ブラウザオブジェクトを作成する。
 * @returns {Promise<Browser>}
 */
async function getBrowser() {
  return await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

/**
 * ユーザーとしてログインし、ページオブジェクトを返す。
 * @param {Browser} browser
 * @return {Promise<Page>}
 */
async function login(browser) {
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/`);
  await page.content();
  await page.type('[name="txt_id"]', USERNAME);
  await page.type('[name="txt_pass"]', PASSWORD + '\n');
  return page;
}
