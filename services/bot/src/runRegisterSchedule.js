module.exports = runRegisterSchedule;

const dayjs = require('dayjs');

const BASE_URL = process.env.BASE_URL;

/**
 * 新規スケジュールをRwinで登録するタスクを実行する。
 * @param {Page} page
 * @param {{roomName: string, start: string, end: string, title: string, author: string}} newSchedule
 * @return {Promise<void>}
 */
async function runRegisterSchedule(page, newSchedule) {
  const start = dayjs(newSchedule.start);
  const end = dayjs(newSchedule.end);
  const [year, month, day, startHour, startMinute] = start
    .format('YYYY,MM,DD,HH,mm')
    .split(',');
  const [endHour, endMinute] = end.format('HH,mm').split(',');

  // 予約ページへ移動
  await page.goto(`${BASE_URL}/ac_reserve1/`);
  await waitRequest(page);

  // スケジュールの情報を入力する
  const roomID = await getRoomIDByRoomName(page, newSchedule.roomName);
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
  await page.type('input[name=TXT_CONTACT]', newSchedule.author);
  await page.type('input[name=TXT_INTENTION]', newSchedule.title);

  await page.waitFor(500);
  await page.click('#button');
  await page.waitFor('.content');

  // 成功/失敗をチェックする
  const dialogText = await getDialogText(page);
  if (dialogText.includes('予約可能です')) {
    // 予定が重複していなかった場合、予約ができる
    await page.click('#buttonexe');
    await page.waitFor(1000);

    const dialogText = await getDialogText(page);
    if (dialogText.includes('予約を実行しました')) {
      // 予約が成功した場合
      console.log('予約完了');
    } else {
      // 予約に失敗した場合
      console.error(
        '予約失敗',
        '「予約を実行しました」というメッセージが見つかりませんでした。'
      );
    }
  } else if (dialogText.includes('既に予約されています')) {
    // 予定が重複していた場合、予約ができない
    console.error('予約失敗', '重複した予定は登録できません。');
  } else {
    // 想定外のフローであるため、調査が必要
    console.error('予約失敗', '予期せぬフローを通りました。');
  }
}

async function waitRequest(page) {
  // オプションを変更するたびにスケジュールの取得処理が発生するので、
  // 完了するまで待機しなければならない。
  await page.waitFor(500);
  await page.waitFor('#SEARCH_ROOM_RESULT_DATE > pre');
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
