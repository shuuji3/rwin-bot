module.exports = runRegisterSchedule;

const dayjs = require('dayjs');
const { getBrowser, login } = require('./puppeteerHelper');

const BASE_URL = process.env.BASE_URL;

/**
 * Rwinで新規スケジュールを自動登録するタスクを実行する。
 * @param {{roomName: string, start: string, end: string, title: string, author: string}} newSchedule
 * @return {Promise<{success: Boolean, message: string}>}
 */
async function runRegisterSchedule({
  start,
  end,
  roomName,
  title,
  author,
}) {
  const browser = await getBrowser();
  const page = await login(browser);
  const [year, month, day, startHour, startMinute] = dayjs(start)
    .format('YYYY,MM,DD,HH,mm')
    .split(',');
  const [endHour, endMinute] = dayjs(end)
    .format('HH,mm')
    .split(',');

  // 予約ページへ移動
  await page.goto(`${BASE_URL}/ac_reserve1/`);
  await waitRequest(page);

  // スケジュールの情報を入力する
  const roomID = await getRoomIDByRoomName(page, roomName);
  await page.select('#BILDING_ROOM', roomID);
  await waitRequest(page);

  await page.select('#TXT_SYYYY', year);
  await waitRequest(page);
  await page.select('#TXT_SMM', month);
  await waitRequest(page);
  await page.select('#TXT_SDD', day);
  await waitRequest(page);

  await page.select('#TXT_STI', startHour);
  await page.select('#TXT_SMI', startMinute);
  await page.select('#TXT_ETI', endHour);
  await page.select('#TXT_EMI', endMinute);

  await page.$eval('input[name=TXT_CONTACT]', el => (el.value = ''));
  // 予約者が bot であることが判別できるようにタグを付加する
  await page.type('input[name=TXT_CONTACT]', `${author} (rwin-bot)`);
  await page.type('input[name=TXT_INTENTION]', title);

  await page.waitFor(500);
  await page.click('#button');
  await page.waitFor('.content');

  // 成功/失敗をチェックする
  let success, message;
  const dialogText = await getDialogText(page);
  if (dialogText.includes('予約可能です')) {
    // 予定が重複していなかった場合、予約ができる
    await page.click('#buttonexe');
    await page.waitFor(1000);

    const dialogText = await getDialogText(page);
    if (dialogText.includes('予約を実行しました')) {
      success = true;
      message = '予約が完了しました！';
    } else {
      success = false;
      message = '予約の完了が確認できませんでした。予約を確認してください';
    }
  } else if (dialogText.includes('既に予約されています')) {
    success = false;
    message = '予定が重複しているため、スケジュールが登録できません。';
  } else {
    success = false;
    message = '予期せぬフローを通りました。調査が必要です。';
  }

  await browser.close();

  return { success, message };
}

async function waitRequest(page) {
  // オプションを変更するたびにスケジュールの取得処理が発生するので、
  // 完了するまで待機しなければならない。
  await page.waitFor(500);
  await page.waitFor('#SEARCH_ROOM_RESULT_DATE > pre');
  await page.waitFor(500);
}

/**
 * 登録画面で、部屋の名前から部屋のIDを取得する。
 * @param {Page} page
 * @param {string} roomName
 * @return {Promise<string>}
 */
async function getRoomIDByRoomName(page, roomName) {
  const roomNameToIDList = await page.$$eval('#BILDING_ROOM option', options =>
    options
      .filter(option => option.value)
      .map(option => [option.label.trim(), option.value])
  );
  const roomID = new Map(roomNameToIDList).get(roomName);
  return roomID || '';
}

/**
 * 予約確認メッセージなどが表示されるダイアログのテキストを取得する。
 * @param {Page} page
 * @return {Promise<string>}
 */
function getDialogText(page) {
  return page.$eval('.content', dialog => dialog.textContent);
}
