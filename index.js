#!/usr/bin/env node

const puppeteer = require('puppeteer');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

(async () => {

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    // ログイン
    const page = await browser.newPage();
    await page.goto('https://r1.rwin.jp/CCSTsukuba/');
    await page.content();
    await page.type('[name="txt_id"]', USERNAME);
    await page.type('[name="txt_pass"]', PASSWORD + '\n');

    // 「施設単位」ページへ移動
    await page.goto('https://r1.rwin.jp/CCSTsukuba/ac_reservestateroom');
    await page.waitFor('#ROOMLIST');
    await page.select('#ROOMLIST', '21');
    await page.waitFor('#TIME_TABLE1');

    await page.screenshot({path: 'screenshot.png', fullPage: true});

    await browser.close();

})();