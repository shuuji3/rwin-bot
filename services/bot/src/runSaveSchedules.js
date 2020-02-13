module.exports = runSaveSchedules;

const getSchedules = require('./getSchedules');
const saveSchedulesToDatabase = require('./saveSchedulesToDatabase');
const cleanDatabase = require('./cleanDatabase');
const { getBrowser, login } = require('./puppeteerHelper');

const BASE_URL = process.env.BASE_URL;

/**
 * データベースに今日以降のスケジュールを保存するタスクを実行する。
 * @return {Promise<void>}
 */
async function runSaveSchedules() {
  const browser = await getBrowser();
  const page = await login(browser);

  await cleanDatabase();

  // 「施設単位」ページへ移動
  await page.goto(`${BASE_URL}/ac_reservestateroom`);
  await page.waitFor('#ROOMLIST');

  const roomTypeNameToIDMap = await getRoomTypeNameToIDMap(page);
  for (const [roomTypeName, roomTypeID] of roomTypeNameToIDMap) {
    await page.select('#ROOM_TYPE', roomTypeID);
    await page.waitFor(1000);

    const buildingNameToIDMap = await getBuildingNameToIDMap(page);
    for (const [buildingName, buildingID] of buildingNameToIDMap) {
      await page.select('#BILDING', buildingID);
      await page.waitFor(1000);

      const roomNameToIDMap = await getRoomNameToIDMap(page);
      for (const [roomName, roomID] of roomNameToIDMap) {
        await page.select('#ROOMLIST', roomID);
        await page.waitFor('#kekka > div');

        const schedules = await getSchedules(page, {
          roomTypeName,
          buildingName,
          roomName,
        });

        await saveSchedulesToDatabase(schedules);

        // Clear schedule table DOM for the next request
        await page.$eval('#kekka', div => (div.innerHTML = ''));
      }
    }
  }

  await browser.close();
}

/**
 * 部屋種別名から部屋種別IDの文字列へのMapを返します。
 *
 * 例:
 *   {"会議室" => "1", "ゲストルーム" => "2"}
 *
 * @param page
 * @returns {Promise<Map<string, string>>}
 */
async function getRoomTypeNameToIDMap(page) {
  return getNameToIDMapBySelector(page, '#ROOM_TYPE option');
}

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
 * getBuildingNameToIDMap() と getRoomNameToIDMap() を作るためのヘルパー関数。
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
  return new Map(buildingNameAndNumberList);
}
