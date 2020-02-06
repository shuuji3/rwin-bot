#!/usr/bin/env node

const puppeteer = require('puppeteer');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const BASE_URL = process.env.BASE_URL;

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ログイン
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/`);
  await page.content();
  await page.type('[name="txt_id"]', USERNAME);
  await page.type('[name="txt_pass"]', PASSWORD + '\n');

  // 「施設単位」ページへ移動
  await page.goto(`${BASE_URL}/ac_reservestateroom`);
  await page.waitFor('#ROOMLIST');

  const buildingNameToIDMap = await getBuildingNameToIDMap(page);
  for (const [buildingName, buildingID] of buildingNameToIDMap) {
    await page.select('#BILDING', buildingID);
    await page.waitFor(3000);

    const roomNameToIDMap = await getRoomNameToIDMap(page);
    for (const [roomName, roomID] of roomNameToIDMap) {
      // TODO: waitFor network request ends (very late response results in a timeout)
      await page.select('#ROOMLIST', roomID);
      await page.waitFor('#kekka > div');

      await page.screenshot({
        path: `screenshots/${buildingName}_${roomName}.png`,
        fullPage: true,
      });

      // Clear schedule table DOM for the next request
      await page.$eval('#kekka', div => (div.innerHTML = ''));

      // TODO: implement convert function from DOM to schedule list
      // TODO: implement save schedule list to database
    }
  }

  await browser.close();
})();

/**
 * 施設名から施設IDの文字列へのMapを返します。
 *
 * 例:
 *   {"施設A" => "1", "施設B" => "2"}
 *
 * @param page
 * @returns {Promise<Map<string, string>>}
 */
async function getBuildingNameToIDMap(page) {
  return getNameToIDMapBySelector(page, '#BILDING option');
}

/**
 * 部屋名から部屋IDの文字列へのMapを返します。
 *
 * 例:
 *   {"会議室A" => "1", "会議室B" => "2"}
 *
 * @param page
 * @returns {Promise<Map<string, string>>}
 */
async function getRoomNameToIDMap(page) {
  return getNameToIDMapBySelector(page, '#ROOMLIST option');
}

/**
 * getBuildingNameToIDMap() と getRoomNameToIDMap() のためのヘルパー関数。
 * @param page
 * @param optionSelector
 * @returns {Promise<Map<string, string>>}
 */
async function getNameToIDMapBySelector(page, optionSelector) {
  const buildingNameAndNumberList = await page.$$eval(optionSelector, options =>
    options
      .filter(option => option.value !== '')
      .map(option => [option.textContent.trim(), option.value])
  );
  console.log(buildingNameAndNumberList);

  return new Map(buildingNameAndNumberList);
}
