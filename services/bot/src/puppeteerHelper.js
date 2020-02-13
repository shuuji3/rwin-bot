module.exports = { getBrowser, login };

const puppeteer = require('puppeteer');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const BASE_URL = process.env.BASE_URL;

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
