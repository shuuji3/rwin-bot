module.exports = getSchedules;

const dayjs = require('dayjs');
const _ = require('lodash');

/**
 * 指定した部屋の1ヶ月分のスケジュールリストを取得する。
 * @param {Page} page
 * @param {string} roomTypeName
 * @param {string} buildingName
 * @param {string} roomName
 * @returns {Promise<object[]>}
 */
async function getSchedules(page, { roomTypeName, buildingName, roomName }) {
  const dates = await getDates(page);
  const dailyScheduleHandles = await page.$$('#kekka tbody > tr:nth-child(2)');
  return (
    await Promise.all(
      _.zip(dates, dailyScheduleHandles).flatMap(
        ([date, dailyScheduleHandle]) =>
          makeScheduleList(date, dailyScheduleHandle, {
            roomTypeName,
            buildingName,
            roomName,
          })
      )
    )
  ).flat();
}

/**
 * スケジュールを表すオブジェクトのリストを返す。
 *
 * ## 「施設単位」ページのスケジュールのDOMの概要
 *
 * ```html
 * <tr>
 *   2020/2/12の予定
 *
 *   <td></td> = 10分の空き
 *
 *   <td colspan="6">予定情報</td> = 10 x 6 = 60min の予定
 *
 * </tr>
 * ```
 *
 * ### 予定なし
 *
 * 予約が入っていない場合、以下の要素が 10分ごとに1つ挿入される。
 *
 * ```html
 * <td unselectable="on" onclick="set_yoyaku('21','20200212')">&nbsp;</td>
 * ```
 *
 * ### 予定あり
 *
 * 予定が入っている場合、以下のような`<td>`が1つ挿入される。
 *
 * ```html
 * <td colspan="6" id="target_45628" class="target" onclick="reserve_edit(45628)">
 *   <div>
 *     [予約者の名前]<br>[予定の名前]
 *   </div>
 * </td>
 * ```
 *
 * `colspan` の数字は10分をユニットとする予定の時間を表す。
 * `colspan="6 "` なら予定は60分である。
 *
 * @param {dayjs.Dayjs} date
 * @param {Puppeteer.ElementHandle} dailyScheduleHandle 上で説明した2種類の <td> のいずれかの ElementHandle 。
 * @param {string} roomTypeName
 * @param {string} buildingName
 * @param {string} roomName
 * @returns {Promise<object[]>}
 */
async function makeScheduleList(
  date,
  dailyScheduleHandle,
  { roomTypeName, buildingName, roomName }
) {
  const schedules = [];
  /**
   * @type {dayjs.Dayjs}
   */
  let startTime = date;

  const scheduleHandles = await dailyScheduleHandle.$$('td');
  for (const scheduleHandle of scheduleHandles) {
    const [colspan] = await scheduleHandle.evaluate(td => [
      Number(td.getAttribute('colspan')),
    ]);
    if (colspan === 0) {
      // There is no schedule in 10 minutes, so proceed the clock
      startTime = startTime.add(10, 'minute');
    } else {
      const [author, title] = await scheduleHandle.evaluate(td =>
        td.querySelector('div').innerHTML.split('<br>')
      );
      const durationMinutes = colspan * 10;
      const endTime = startTime.add(durationMinutes, 'minute');
      schedules.push({
        author,
        title,
        start: startTime.toDate(),
        end: endTime.toDate(),
        roomTypeName,
        buildingName,
        roomName,
      });
      startTime = startTime.add(durationMinutes, 'minute');
    }
  }
  return schedules;
}

/**
 * 日付のリストを取得する。
 * @param {Page} page
 * @return {Promise<dayjs[]>}
 */
async function getDates(page) {
  const dateHandles = await page.$x(
    '//*[@id="kekka"]/text()[position() mod 2 = 1]'
  );
  return Promise.all(
    dateHandles.map(async dateHandle => {
      const dateString = await dateHandle.evaluate(d => d.textContent); // e.g. '2022年2月2日'
      const [year, month, day] = [...dateString.match(/(\d+)/g)].map(Number);
      return dayjs(`${year}-${month}-${day} 00:00`);
    })
  );
}
